const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');
const { uploadToLocal } = require('../utils/upload');
const { User } = require('../models');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get user profile
router.get('/profile', verifyToken, async (req, res, next) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      location,
      bio,
      interests,
      preferredDestinations,
      languages,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      throw new ApiError('First name, last name, and phone number are required', 400);
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new ApiError('Invalid phone number format', 400);
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstName,
          lastName,
          phoneNumber,
          location,
          bio,
          interests,
          preferredDestinations,
          languages,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new ApiError('User not found', 404);
    }

    // Log the profile update
    console.log('Profile updated successfully:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      timestamp: new Date().toISOString()
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    next(error);
  }
});

// Test avatar upload endpoint
router.get('/test-upload', verifyToken, (req, res) => {
  res.json({ message: 'Upload endpoint is accessible' });
});

// Upload avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to local storage
    const avatarUrl = await uploadToLocal(req.file);
    
    if (!avatarUrl) {
      throw new Error('Failed to save avatar file');
    }

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('Failed to update user avatar in database');
    }

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to upload avatar'
    });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValid = await req.user.comparePassword(currentPassword);
    if (!isValid) {
      throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Log activity
router.post('/log-activity', verifyToken, async (req, res, next) => {
  try {
    const { action, details } = req.body;
    // TODO: Implement activity logging
    res.json({ message: 'Activity logged successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 