const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB().then(() => {
  console.log('Database connection established');
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin API available at http://localhost:${PORT}/api/admin`);
}); 