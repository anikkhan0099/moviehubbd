import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Dashboard stats logic would go here
    res.json({
      success: true,
      data: {
        stats: {
          totalMovies: 0,
          totalSeries: 0,
          totalUsers: 0,
          totalViews: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

export default router;
