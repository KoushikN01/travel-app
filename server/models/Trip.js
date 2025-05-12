const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const activityVoteSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['up', 'down'],
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['proposed', 'approved', 'rejected'],
    default: 'proposed'
  }
});

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['flight', 'hotel', 'activity', 'restaurant'],
    default: 'activity'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: String,
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    min: 0
  },
  bookingReference: String,
  category: String,
  attachments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  }
});

const dayItinerarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  activities: [activitySchema]
});

// Add method to sort activities by time
dayItinerarySchema.methods.sortActivities = function() {
  this.activities.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
};

// Add method to get activities by type
dayItinerarySchema.methods.getActivitiesByType = function(type) {
  return this.activities.filter(activity => activity.type === type);
};

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  departureCity: {
    type: String,
    required: true
  },
  arrivalCity: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  bookingReference: String,
  cost: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  }
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  roomType: String,
  bookingReference: String,
  cost: Number,
  amenities: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'editor'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  destinations: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['planning', 'upcoming', 'ongoing', 'completed'],
    default: 'planning'
  },
  budget: {
    total: Number,
    spent: Number,
    currency: String
  },
  itinerary: [dayItinerarySchema],
  activities: [activitySchema],
  flights: [flightSchema],
  hotels: [hotelSchema],
  chatMessages: [messageSchema],
  preferences: {
    travelStyle: {
      type: String,
      enum: ['luxury', 'budget', 'adventure', 'relaxation'],
      default: 'budget'
    },
    accommodation: {
      type: String,
      enum: ['hotel', 'hostel', 'apartment', 'camping'],
      default: 'hotel'
    },
    transportation: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car'],
      default: 'flight'
    }
  },
  files: [{
    name: String,
    url: String,
    type: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
tripSchema.index({ creator: 1, 'collaborators.user': 1 });
tripSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to ensure endDate is not before startDate
tripSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date cannot be before start date'));
  }
  next();
});

// Method to calculate total trip cost
tripSchema.methods.calculateTotalCost = function() {
  return this.activities.reduce((total, activity) => {
    return total + (activity.cost || 0);
  }, 0);
};

// Method to check if a user has access to the trip
tripSchema.methods.hasAccess = function(userId) {
  if (this.creator.equals(userId)) return true;
  return this.collaborators.some(collaborator => collaborator.user.equals(userId));
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip; 