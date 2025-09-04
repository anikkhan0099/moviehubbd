import express from 'express';
import { body } from 'express-validator';
import {
  getAllSeries,
  getSeries,
  createSeries,
  addSeason,
  addEpisode,
  getEpisode,
  updateEpisode,
  addServerToEpisode,
  getTrendingSeries,
  getLatestSeries,
  updateSeriesStatus
} from '../controllers/seriesController.js';
import { 
  authenticateToken, 
  requireAdmin, 
  requireModerator, 
  optionalAuth 
} from '../middleware/auth.js';

const router = express.Router();

// Series validation rules
const seriesValidation = [
  body('title')
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Title is required and must not exceed 200 characters'),
  body('overview')
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Overview is required and must not exceed 2000 characters'),
  body('posterPath')
    .notEmpty()
    .withMessage('Poster image is required'),
  body('releaseYear')
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Release year must be a valid year'),
  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  body('language')
    .isArray({ min: 1 })
    .withMessage('At least one language is required')
];

const episodeValidation = [
  body('episodeNumber')
    .isInt({ min: 1 })
    .withMessage('Episode number must be a positive integer'),
  body('title')
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Episode title is required and must not exceed 200 characters'),
  body('runtime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Runtime must be a positive number')
];

// Public routes
router.get('/', optionalAuth, getAllSeries);
router.get('/trending', getTrendingSeries);
router.get('/latest', getLatestSeries);
router.get('/:identifier', optionalAuth, getSeries);
router.get('/:id/season/:seasonNumber/episode/:episodeNumber', getEpisode);

// Protected routes
router.post('/', authenticateToken, requireModerator, seriesValidation, createSeries);
router.post('/:id/seasons', authenticateToken, requireModerator, addSeason);
router.post('/:id/season/:seasonNumber/episodes', authenticateToken, requireModerator, episodeValidation, addEpisode);
router.put('/:id/season/:seasonNumber/episode/:episodeNumber', authenticateToken, requireModerator, updateEpisode);
router.post('/:id/season/:seasonNumber/episode/:episodeNumber/servers', authenticateToken, requireModerator, addServerToEpisode);

// Admin only routes
router.patch('/:id/status', authenticateToken, requireAdmin, updateSeriesStatus);

export default router;
