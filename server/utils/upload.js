const fs = require('fs');
const path = require('path');
const { ApiError } = require('./ApiError');

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.uploadToLocal = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new ApiError('No file provided', 400);
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new ApiError(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and GIF are allowed.`, 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(`File size too large: ${file.size} bytes. Maximum size is 5MB.`, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.promises.writeFile(filepath, file.buffer);

    // Return the relative URL path
    return `/uploads/avatars/${filename}`;
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Failed to upload file: ${error.message}`, 500);
  }
}; 