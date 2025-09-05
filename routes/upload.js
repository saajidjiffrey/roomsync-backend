const express = require('express');
const router = express.Router();
const { upload, uploadImage, deleteImage } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

// Upload image endpoint
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

// Delete image endpoint
router.delete('/image/:pathPrefix/:filename', authenticateToken, deleteImage);

module.exports = router;