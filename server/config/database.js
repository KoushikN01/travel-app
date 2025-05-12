const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-app';
    console.log('Attempting to connect to MongoDB at:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });

    console.log('MongoDB Connected Successfully');
    
    // Test the connection by getting the collections
    const collections = await mongoose.connection.db.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB; 