import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  getContent,
  getFeaturedContent,
  getTrendingContent,
  getLatestContent,
  getContentByGenre,
  getRecommendedContent
} from '../controllers/contentController.js';

const router = express.Router();

// Get all content with filtering and pagination
router.get('/', optionalAuth, getContent);

// Get featured content
router.get('/featured', getFeaturedContent);

// Get trending content
router.get('/trending', getTrendingContent);

// Get latest content
router.get('/latest', getLatestContent);

// Get content by genre
router.get('/genre/:genre', optionalAuth, getContentByGenre);

// Get recommended content based on a specific item
router.get('/recommendations', getRecommendedContent);

export default router;
