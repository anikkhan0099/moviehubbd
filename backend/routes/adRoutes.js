import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import {
  getAllAds,
  getAd,
  getAdsByPlacement,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  recordImpression,
  recordClick,
  getAdAnalytics,
  bulkUpdateAds
} from '../controllers/adController.js';

const router = express.Router();

// Ad validation rules
const adValidation = [
  body('name')
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Ad name is required and must not exceed 100 characters'),
  body('type')
    .isIn(['Banner', 'Skyscraper', 'Video', 'Pop-under', 'Direct Link', 'Native', 'Interstitial'])
    .withMessage('Invalid ad type'),
  body('placement')
    .isIn(['Header', 'Footer', 'Sidebar', 'Before Player', 'After Player', 'In Content', 'Pop-under', 'Mobile Banner', 'Desktop Banner', 'Global'])
    .withMessage('Invalid ad placement'),
  body('code')
    .notEmpty()
    .withMessage('Ad code is required'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('targetPages')
    .optional()
    .isArray()
    .withMessage('Target pages must be an array'),
  body('targetDevices')
    .optional()
    .isArray()
    .withMessage('Target devices must be an array'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// Public routes
router.get('/placement/:placement', getAdsByPlacement);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllAds);
router.get('/analytics', authenticateToken, requireAdmin, getAdAnalytics);
router.get('/:id', authenticateToken, requireAdmin, getAd);
router.post('/', authenticateToken, requireAdmin, adValidation, createAd);
router.put('/:id', authenticateToken, requireAdmin, adValidation, updateAd);
router.delete('/:id', authenticateToken, requireAdmin, deleteAd);
router.patch('/:id/toggle', authenticateToken, requireAdmin, toggleAdStatus);
router.post('/bulk', authenticateToken, requireAdmin, bulkUpdateAds);

export default router;
