const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const ActivityLog = require('../models/ActivityLog');

// Admin Authentication
router.post('/login', async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body.email);
    const { email, password } = req.body;
    
    // Find admin user
    const user = await User.findOne({ 
      email, 
      $or: [
        { role: 'admin' },
        { roles: { $in: ['admin'] } }
      ]
    });
    
    if (!user) {
      console.log('Admin login failed: User not found or not admin:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Admin login failed: Invalid password:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = user.generateAuthToken();
    console.log('Admin login successful:', email);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || (user.roles && user.roles[0]),
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify Admin Token
router.post('/verify-token', adminAuth, (req, res) => {
  res.json({ valid: true });
});

// Get All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all users');
    const users = await User.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);
    const formattedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      joinDate: user.createdAt,
      lastLogin: user.lastLogin,
      status: user.status || 'active',
      subscription: user.subscription || null,
      role: user.role || (user.roles && user.roles[0]) || 'user'
    }));

    res.json({ data: formattedUsers, total: formattedUsers.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get All Trips
router.get('/trips', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all trips');
    const trips = await Trip.find({})
      .populate('creator', 'email firstName lastName')
      .sort({ startDate: -1 });

    console.log(`Found ${trips.length} trips`);
    const formattedTrips = trips.map(trip => ({
      id: trip._id,
      title: trip.title || 'Untitled Trip',
      creator: {
        email: trip.creator?.email || 'Unknown',
        name: trip.creator ? `${trip.creator.firstName} ${trip.creator.lastName}` : 'Unknown User'
      },
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations || [],
      status: trip.status || 'planning',
      activities: trip.activities ? trip.activities.length : 0,
      collaborators: trip.collaborators ? trip.collaborators.length : 0
    }));

    res.json({ data: formattedTrips, total: formattedTrips.length });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Error fetching trips' });
  }
});

// Update User
router.put('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Get User Activity
router.get('/user-activity', adminAuth, async (req, res) => {
  try {
    const activities = await ActivityLog.find({})
      .populate('user', 'email')
      .sort({ timestamp: -1 })
      .limit(50);

    const formattedActivities = activities.map(activity => ({
      action: activity.action,
      user: activity.user.email,
      details: activity.details,
      timestamp: activity.timestamp
    }));

    res.json({ data: formattedActivities, total: formattedActivities.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user activity' });
  }
});

// Get Trip Statistics
router.get('/trip-statistics', adminAuth, async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const activeTrips = await Trip.countDocuments({ status: 'ongoing' });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });

    // Get monthly trend data
    const trendData = await Trip.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          trips: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalTrips,
      activeTrips,
      completedTrips,
      trendData: trendData.map(item => ({
        month: new Date(2024, item._id - 1).toLocaleString('default', { month: 'short' }),
        trips: item.trips
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip statistics' });
  }
});

// Delete User (Admin only)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Approve Trip (Admin only)
router.put('/trips/:tripId/approve', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { status: 'confirmed' },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip approved', trip });
  } catch (error) {
    console.error('Error approving trip:', error);
    res.status(500).json({ message: 'Error approving trip' });
  }
});

// Reject Trip (Admin only)
router.put('/trips/:tripId/reject', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { status: 'rejected' },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip rejected', trip });
  } catch (error) {
    console.error('Error rejecting trip:', error);
    res.status(500).json({ message: 'Error rejecting trip' });
  }
});

module.exports = router; 