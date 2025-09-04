import express from 'express';
import multer from 'multer';
import { authenticateToken, requireModerator } from '../middleware/auth.js';
import uploadService from '../services/uploadService.js';
import { createErrorResponse, createSuccessResponse } from '../utils/helpers.js';

const router = express.Router();

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'), false);
    }
  }
});

// Handle multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(createErrorResponse('File too large. Maximum size is 10MB.', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(createErrorResponse('Unexpected file field.', 400));
    }
  }
  
  if (error.message.includes('Only JPEG')) {
    return res.status(400).json(createErrorResponse(error.message, 400));
  }
  
  next(error);
};

// Upload poster image
router.post('/poster', authenticateToken, requireModerator, upload.single('poster'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No poster file provided', 400));
    }

    const result = await uploadService.uploadPoster(req.file);
    
    res.json(createSuccessResponse({
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      dimensions: result.dimensions
    }, 'Poster uploaded successfully'));

  } catch (error) {
    console.error('Poster upload error:', error);
    res.status(500).json(createErrorResponse(error.message || 'Poster upload failed', 500));
  }
});

// Upload backdrop image
router.post('/backdrop', authenticateToken, requireModerator, upload.single('backdrop'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No backdrop file provided', 400));
    }

    const result = await uploadService.uploadBackdrop(req.file);
    
    res.json(createSuccessResponse({
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      dimensions: result.dimensions
    }, 'Backdrop uploaded successfully'));

  } catch (error) {
    console.error('Backdrop upload error:', error);
    res.status(500).json(createErrorResponse(error.message || 'Backdrop upload failed', 500));
  }
});

// Upload profile image
router.post('/profile', authenticateToken, upload.single('profile'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No profile file provided', 400));
    }

    const result = await uploadService.uploadProfile(req.file);
    
    res.json(createSuccessResponse({
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      dimensions: result.dimensions
    }, 'Profile image uploaded successfully'));

  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json(createErrorResponse(error.message || 'Profile upload failed', 500));
  }
});

// Upload general image
router.post('/image', authenticateToken, requireModerator, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No image file provided', 400));
    }

    const { folder = 'general', width, height, quality = 85 } = req.body;
    
    const options = {
      folder,
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null,
      quality: parseInt(quality)
    };

    const result = await uploadService.uploadImage(req.file, options);
    
    res.json(createSuccessResponse({
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      dimensions: result.dimensions
    }, 'Image uploaded successfully'));

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json(createErrorResponse(error.message || 'Image upload failed', 500));
  }
});

// Upload multiple images
router.post('/multiple', authenticateToken, requireModerator, upload.array('images', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(createErrorResponse('No image files provided', 400));
    }

    const { folder = 'general', width, height, quality = 85 } = req.body;
    
    const options = {
      folder,
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null,
      quality: parseInt(quality)
    };

    const uploadPromises = req.files.map(file => uploadService.uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    
    res.json(createSuccessResponse({
      images: results.map(result => ({
        url: result.url,
        fileName: result.fileName,
        size: result.size,
        dimensions: result.dimensions
      }))
    }, `${results.length} images uploaded successfully`));

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json(createErrorResponse(error.message || 'Multiple upload failed', 500));
  }
});

// Get file info
router.get('/info/:fileName', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const { folder = 'general' } = req.query;
    
    const filePath = `${folder}/${fileName}`;
    const info = await uploadService.getFileInfo(filePath);
    
    if (!info.exists) {
      return res.status(404).json(createErrorResponse('File not found', 404));
    }
    
    res.json(createSuccessResponse(info));

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json(createErrorResponse('Failed to get file info', 500));
  }
});

// Delete file (Admin only)
router.delete('/:fileName', authenticateToken, requireModerator, async (req, res) => {
  try {
    const { fileName } = req.params;
    const { folder = 'general', cloudinary = false } = req.query;
    
    let result;
    if (cloudinary === 'true' && process.env.CLOUDINARY_CLOUD_NAME) {
      const publicId = `moviehubbd/${folder}/${fileName.replace(/\.[^/.]+$/, '')}`;
      result = await uploadService.deleteFromCloudinary(publicId);
    } else {
      const filePath = `${folder}/${fileName}`;
      result = await uploadService.deleteLocally(filePath);
    }
    
    if (result.result === 'not_found') {
      return res.status(404).json(createErrorResponse('File not found', 404));
    }
    
    res.json(createSuccessResponse(null, 'File deleted successfully'));

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json(createErrorResponse('Failed to delete file', 500));
  }
});

// Get upload configuration
router.get('/config', (req, res) => {
  res.json(createSuccessResponse({
    maxFileSize: '10MB',
    allowedFormats: ['JPEG', 'JPG', 'PNG', 'WebP'],
    cloudinaryEnabled: !!process.env.CLOUDINARY_CLOUD_NAME,
    supportedSizes: {
      poster: { width: 400, height: 600 },
      backdrop: { width: 1280, height: 720 },
      profile: { width: 200, height: 200 }
    }
  }));
});

export default router;
