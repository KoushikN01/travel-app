const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tripRoutes = require('./routes/trips');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/auth');

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Log Cloudinary configuration (without sensitive data)
console.log('Cloudinary Configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing'
});

const app = express();

// Performance optimization for Express
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON payload limit and add compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with optimized settings
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50
    });
    
    console.log('Connected to MongoDB successfully');
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Check database connection status middleware
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection is not ready'
    });
  }
  next();
};

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api', checkDBConnection);
app.use('/api/auth', authRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Explicitly set port to 5001 for backend
const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

module.exports = server; 