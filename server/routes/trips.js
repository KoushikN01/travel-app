const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { verifyToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const ActivityLog = require('../models/ActivityLog');

// Get all trips for the authenticated user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const trips = await Trip.find({
      $or: [
        { creator: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .sort({ startDate: 1 })
    .populate('creator', 'firstName lastName email')
    .populate('collaborators.user', 'firstName lastName email');

    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// Get a specific trip
router.get('/:tripId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Create a new trip
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const tripData = {
      ...req.body,
      creator: req.user._id
    };

    const trip = new Trip(tripData);
    await trip.save();

    // Log trip booking
    await ActivityLog.create({
      user: req.user._id,
      action: 'book-trip',
      details: `Booked trip: ${trip.title}`
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    res.status(201).json(populatedTrip);
  } catch (error) {
    next(error);
  }
});

// Update a trip
router.put('/:tripId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.creator.equals(req.user._id) && 
        !trip.collaborators.some(c => c.user.equals(req.user._id) && c.role === 'editor')) {
      throw new ApiError('Unauthorized to edit this trip', 403);
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('creator', 'firstName lastName email')
    .populate('collaborators.user', 'firstName lastName email');

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Delete a trip
router.delete('/:tripId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.creator.equals(req.user._id)) {
      throw new ApiError('Unauthorized to delete this trip', 403);
    }

    await Trip.findByIdAndDelete(req.params.tripId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add a collaborator to a trip
router.post('/:tripId/collaborators', verifyToken, async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.creator.equals(req.user._id)) {
      throw new ApiError('Unauthorized to add collaborators', 403);
    }

    if (trip.collaborators.some(c => c.user.equals(userId))) {
      throw new ApiError('User is already a collaborator', 400);
    }

    trip.collaborators.push({ user: userId, role });
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Add an activity to a day's itinerary
router.post('/:tripId/itinerary/:date/activities', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const date = new Date(req.params.date);
    
    // Initialize itinerary array if it doesn't exist
    if (!trip.itinerary) {
      trip.itinerary = [];
    }

    let day = trip.itinerary.find(d => 
      d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );

    if (!day) {
      day = { date, activities: [] };
      trip.itinerary.push(day);
    }

    day.activities.push(req.body);
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// Add a chat message
router.post('/:tripId/chat', verifyToken, async (req, res, next) => {
  try {
    const { message } = req.body;
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }

    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    trip.chatMessages.push({
      sender: req.user._id,
      message,
      timestamp: new Date()
    });

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email')
      .populate('chatMessages.sender', 'firstName lastName');

    res.json(updatedTrip.chatMessages[trip.chatMessages.length - 1]);
  } catch (error) {
    next(error);
  }
});

// Flight Management
router.post('/:tripId/flights', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    if (!trip.flights) {
      trip.flights = [];
    }
    trip.flights.push(req.body);
    await trip.save();

    // Log flight booking
    await ActivityLog.create({
      user: req.user._id,
      action: 'book-flight',
      details: `Booked flight for trip: ${trip.title}`
    });

    res.json(trip.flights);
  } catch (error) {
    next(error);
  }
});

router.get('/:tripId/flights', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }
    res.json(trip.flights || []);
  } catch (error) {
    next(error);
  }
});

router.put('/:tripId/flights/:flightId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const flightIndex = trip.flights.findIndex(f => f._id.toString() === req.params.flightId);
    if (flightIndex === -1) {
      throw new ApiError('Flight not found', 404);
    }

    trip.flights[flightIndex] = { ...trip.flights[flightIndex], ...req.body };
    await trip.save();
    res.json(trip.flights[flightIndex]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:tripId/flights/:flightId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    trip.flights = trip.flights.filter(f => f._id.toString() !== req.params.flightId);
    await trip.save();
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Hotel Management
router.post('/:tripId/hotels', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    if (!trip.hotels) {
      trip.hotels = [];
    }
    trip.hotels.push(req.body);
    await trip.save();

    // Log hotel booking
    await ActivityLog.create({
      user: req.user._id,
      action: 'book-hotel',
      details: `Booked hotel for trip: ${trip.title}`
    });

    res.json(trip.hotels);
  } catch (error) {
    next(error);
  }
});

router.get('/:tripId/hotels', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }
    res.json(trip.hotels || []);
  } catch (error) {
    next(error);
  }
});

router.put('/:tripId/hotels/:hotelId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const hotelIndex = trip.hotels.findIndex(h => h._id.toString() === req.params.hotelId);
    if (hotelIndex === -1) {
      throw new ApiError('Hotel not found', 404);
    }

    trip.hotels[hotelIndex] = { ...trip.hotels[hotelIndex], ...req.body };
    await trip.save();
    res.json(trip.hotels[hotelIndex]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:tripId/hotels/:hotelId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    trip.hotels = trip.hotels.filter(h => h._id.toString() !== req.params.hotelId);
    await trip.save();
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Activity Management
router.get('/:tripId/activities/categories', verifyToken, async (req, res, next) => {
  try {
    const categories = [
      'Sightseeing',
      'Adventure',
      'Dining',
      'Cultural',
      'Shopping',
      'Relaxation'
    ];
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/:tripId/activities', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const activityData = {
      ...req.body,
      date: new Date(req.body.date),
      createdBy: req.user._id,
      updatedAt: new Date()
    };

    if (!trip.activities) {
      trip.activities = [];
    }
    trip.activities.push(activityData);
    await trip.save();

    // Log activity booking
    await ActivityLog.create({
      user: req.user._id,
      action: 'book-activity',
      details: `Booked activity for trip: ${trip.title}`
    });

    // Add to itinerary as well
    const dayDate = new Date(req.body.date).toISOString().split('T')[0];
    let day = trip.itinerary.find(d => 
      new Date(d.date).toISOString().split('T')[0] === dayDate
    );

    if (!day) {
      day = { 
        date: new Date(req.body.date),
        activities: []
      };
      trip.itinerary.push(day);
    }
    
    day.activities.push(activityData);
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('creator', 'firstName lastName email')
      .populate('collaborators.user', 'firstName lastName email');

    res.json(updatedTrip.activities);
  } catch (error) {
    next(error);
  }
});

router.get('/:tripId/activities', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('activities.createdBy', 'firstName lastName email');
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }
    res.json(trip.activities || []);
  } catch (error) {
    next(error);
  }
});

router.put('/:tripId/activities/:activityId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    const activityData = {
      ...req.body,
      date: new Date(req.body.date),
      updatedAt: new Date()
    };

    const activityIndex = trip.activities.findIndex(a => a._id.toString() === req.params.activityId);
    if (activityIndex === -1) {
      throw new ApiError('Activity not found', 404);
    }

    trip.activities[activityIndex] = { 
      ...trip.activities[activityIndex].toObject(),
      ...activityData
    };

    // Update in itinerary as well
    const dayDate = new Date(req.body.date).toISOString().split('T')[0];
    let day = trip.itinerary.find(d => 
      new Date(d.date).toISOString().split('T')[0] === dayDate
    );

    if (day) {
      const itineraryActivityIndex = day.activities.findIndex(
        a => a._id.toString() === req.params.activityId
      );
      if (itineraryActivityIndex !== -1) {
        day.activities[itineraryActivityIndex] = trip.activities[activityIndex];
      }
    }

    await trip.save();
    res.json(trip.activities[activityIndex]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:tripId/activities/:activityId', verifyToken, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      throw new ApiError('Trip not found', 404);
    }
    if (!trip.hasAccess(req.user._id)) {
      throw new ApiError('Unauthorized access', 403);
    }

    trip.activities = trip.activities.filter(a => a._id.toString() !== req.params.activityId);
    await trip.save();
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 