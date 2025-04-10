// middleware/imageUploader.js
const cloudinary = require('../Config/cloudinaryConfig');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'lostAndFound',
      use_filename: true
    });
    console.log(result);
    
    // Return the secure_url and public_id from the response
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

const removeLocalFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error removing local file:', error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  removeLocalFile
};