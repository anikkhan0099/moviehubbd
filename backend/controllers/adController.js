import { validationResult } from 'express-validator';
import Ad from '../models/Ad.js';
import { createPagination, buildFilterQuery, createErrorResponse, createSuccessResponse } from '../utils/helpers.js';

// Get all ads with filtering and pagination (Admin)
export const getAllAds = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      placement,
      isActive,
      network,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    const query = buildFilterQuery({
      type,
      placement,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      network
    });

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
      populate: [
        { path: 'addedBy', select: 'username' },
        { path: 'lastModifiedBy', select: 'username' }
      ]
    };

    const ads = await Ad.paginate(query, options);

    res.json(createSuccessResponse({
      ads: ads.docs,
      pagination: {
        currentPage: ads.page,
        totalPages: ads.totalPages,
        totalItems: ads.totalDocs,
        hasNextPage: ads.hasNextPage,
        hasPrevPage: ads.hasPrevPage,
        limit: ads.limit
      }
    }));

  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch ads', 500, error.message));
  }
};

// Get single ad by ID (Admin)
export const getAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id)
      .populate('addedBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    res.json(createSuccessResponse({ ad }));

  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch ad', 500, error.message));
  }
};

// Get ads by placement (Public - for serving ads)
export const getAdsByPlacement = async (req, res) => {
  try {
    const { placement } = req.params;
    const { 
      page: targetPage = 'all', 
      device: targetDevice = 'all',
      country: targetCountry = null,
      limit = 5 
    } = req.query;

    // Get active ads for this placement
    const ads = await Ad.getActiveAdsByPlacement(placement, targetPage, targetDevice);
    
    // Filter by country if specified
    let filteredAds = ads;
    if (targetCountry) {
      filteredAds = ads.filter(ad => 
        ad.targetCountries.length === 0 || 
        ad.targetCountries.includes(targetCountry) ||
        ad.targetCountries.includes('all')
      );
    }

    // Sort by priority and limit results
    const finalAds = filteredAds
      .sort((a, b) => b.priority - a.priority)
      .slice(0, parseInt(limit))
      .map(ad => ({
        _id: ad._id,
        name: ad.name,
        type: ad.type,
        placement: ad.placement,
        code: ad.code,
        redirectUrl: ad.redirectUrl,
        priority: ad.priority
      }));

    res.json(createSuccessResponse({
      ads: finalAds,
      placement,
      count: finalAds.length
    }));

  } catch (error) {
    console.error('Get ads by placement error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch ads', 500, error.message));
  }
};

// Create new ad (Admin)
export const createAd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse('Validation failed', 400, errors.array()));
    }

    const adData = {
      ...req.body,
      addedBy: req.user._id
    };

    const ad = new Ad(adData);
    await ad.save();

    await ad.populate('addedBy', 'username');

    res.status(201).json(createSuccessResponse({ ad }, 'Ad created successfully'));

  } catch (error) {
    console.error('Create ad error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json(createErrorResponse('Validation failed', 400, error.message));
    }
    
    res.status(500).json(createErrorResponse('Failed to create ad', 500, error.message));
  }
};

// Update ad (Admin)
export const updateAd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse('Validation failed', 400, errors.array()));
    }

    const { id } = req.params;
    const updates = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const ad = await Ad.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username').populate('lastModifiedBy', 'username');

    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    res.json(createSuccessResponse({ ad }, 'Ad updated successfully'));

  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json(createErrorResponse('Failed to update ad', 500, error.message));
  }
};

// Delete ad (Admin)
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByIdAndDelete(id);
    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    res.json(createSuccessResponse(null, 'Ad deleted successfully'));

  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json(createErrorResponse('Failed to delete ad', 500, error.message));
  }
};

// Toggle ad status (Admin)
export const toggleAdStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    ad.isActive = !ad.isActive;
    ad.lastModifiedBy = req.user._id;
    await ad.save();

    res.json(createSuccessResponse({ ad }, `Ad ${ad.isActive ? 'activated' : 'deactivated'} successfully`));

  } catch (error) {
    console.error('Toggle ad status error:', error);
    res.status(500).json(createErrorResponse('Failed to toggle ad status', 500, error.message));
  }
};

// Record ad impression
export const recordImpression = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    await ad.incrementImpressions();

    res.json(createSuccessResponse(null, 'Impression recorded'));

  } catch (error) {
    console.error('Record impression error:', error);
    res.status(500).json(createErrorResponse('Failed to record impression', 500, error.message));
  }
};

// Record ad click
export const recordClick = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found', 404));
    }

    await ad.incrementClicks();

    // Return redirect URL if available
    const response = createSuccessResponse(null, 'Click recorded');
    if (ad.redirectUrl) {
      response.data = { redirectUrl: ad.redirectUrl };
    }

    res.json(response);

  } catch (error) {
    console.error('Record click error:', error);
    res.status(500).json(createErrorResponse('Failed to record click', 500, error.message));
  }
};

// Get ad analytics (Admin)
export const getAdAnalytics = async (req, res) => {
  try {
    const { 
      startDate,
      endDate,
      placement,
      type 
    } = req.query;

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const matchQuery = {};
    if (Object.keys(dateQuery).length > 0) {
      matchQuery.createdAt = dateQuery;
    }
    if (placement) matchQuery.placement = placement;
    if (type) matchQuery.type = type;

    const analytics = await Ad.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAds: { $sum: 1 },
          activeAds: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalRevenue: { $sum: '$revenue' },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]);

    const placementStats = await Ad.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$placement',
          count: { $sum: 1 },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { impressions: -1 } }
    ]);

    const typeStats = await Ad.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const topPerformers = await Ad.find(matchQuery)
      .sort({ clicks: -1, impressions: -1 })
      .limit(10)
      .select('name type placement impressions clicks revenue');

    const stats = analytics[0] || {
      totalAds: 0,
      activeAds: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalRevenue: 0,
      totalBudget: 0
    };

    // Calculate CTR
    stats.ctr = stats.totalImpressions > 0 
      ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
      : 0;

    res.json(createSuccessResponse({
      overview: stats,
      placementStats,
      typeStats,
      topPerformers
    }));

  } catch (error) {
    console.error('Get ad analytics error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch ad analytics', 500, error.message));
  }
};

// Bulk operations (Admin)
export const bulkUpdateAds = async (req, res) => {
  try {
    const { adIds, action, data } = req.body;

    if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
      return res.status(400).json(createErrorResponse('Ad IDs are required', 400));
    }

    let result;
    
    switch (action) {
      case 'activate':
        result = await Ad.updateMany(
          { _id: { $in: adIds } },
          { isActive: true, lastModifiedBy: req.user._id }
        );
        break;
        
      case 'deactivate':
        result = await Ad.updateMany(
          { _id: { $in: adIds } },
          { isActive: false, lastModifiedBy: req.user._id }
        );
        break;
        
      case 'delete':
        result = await Ad.deleteMany({ _id: { $in: adIds } });
        break;
        
      case 'update':
        if (!data) {
          return res.status(400).json(createErrorResponse('Update data is required', 400));
        }
        result = await Ad.updateMany(
          { _id: { $in: adIds } },
          { ...data, lastModifiedBy: req.user._id }
        );
        break;
        
      default:
        return res.status(400).json(createErrorResponse('Invalid action', 400));
    }

    res.json(createSuccessResponse({
      modifiedCount: result.modifiedCount || result.deletedCount,
      matchedCount: result.matchedCount || adIds.length
    }, `Bulk ${action} completed successfully`));

  } catch (error) {
    console.error('Bulk update ads error:', error);
    res.status(500).json(createErrorResponse('Bulk operation failed', 500, error.message));
  }
};

export default {
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
};
