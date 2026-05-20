const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Upload to cloudinary
    console.log('[Cloudinary] Uploading file to Cloudinary:', req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce-app',
      resource_type: 'auto',
    });
    console.log('[Cloudinary] Upload success:', result.secure_url);

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    // Make sure to clean up even on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

module.exports = {
  uploadImage,
};
