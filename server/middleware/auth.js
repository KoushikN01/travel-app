const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError('No refresh token provided', 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId,
      refreshToken: refreshToken
    });

    if (!user) {
      throw new ApiError('Invalid refresh token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid refresh token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Refresh token expired', 401));
    } else {
      next(error);
    }
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      next(new ApiError('Unauthorized access', 403));
      return;
    }
    next();
  };
}; 