import express from 'express';
import { body } from 'express-validator';
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getTrendingMovies,
  getLatestMovies,
  getMoviesByGenre,
  getRelatedMovies,
  addServerToMovie,
  removeServerFromMovie,
  updateMovieStatus
} from '../controllers/movieController.js';
import { 
  authenticateToken, 
  requireAdmin, 
  requireModerator, 
  optionalAuth 
} from '../middleware/auth.js';

const router = express.Router();

// Movie validation rules
const movieValidation = [
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
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  body('language')
    .isArray({ min: 1 })
    .withMessage('At least one language is required'),
  body('runtime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Runtime must be a positive number')
];

const serverValidation = [
  body('name')
    .notEmpty()
    .withMessage('Server name is required'),
  body('url')
    .isURL()
    .withMessage('Valid server URL is required'),
  body('quality')
    .optional()
    .isIn(['480p', '720p', '1080p', '4K'])
    .withMessage('Quality must be 480p, 720p, 1080p, or 4K')
];

// Public routes (no authentication required)
router.get('/', optionalAuth, getMovies);
router.get('/trending', getTrendingMovies);
router.get('/latest', getLatestMovies);
router.get('/genre/:genre', getMoviesByGenre);
router.get('/:identifier', optionalAuth, getMovie);
router.get('/:id/related', getRelatedMovies);

// Protected routes (authentication required)
router.post('/', authenticateToken, requireModerator, movieValidation, createMovie);
router.put('/:id', authenticateToken, requireModerator, movieValidation, updateMovie);
router.delete('/:id', authenticateToken, requireModerator, deleteMovie);

// Server management routes
router.post('/:id/servers', authenticateToken, requireModerator, serverValidation, addServerToMovie);
router.delete('/:id/servers/:serverId', authenticateToken, requireModerator, removeServerFromMovie);

// Admin only routes
router.patch('/:id/status', authenticateToken, requireAdmin, updateMovieStatus);

export default router;
