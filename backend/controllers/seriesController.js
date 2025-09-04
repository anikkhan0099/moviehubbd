import { validationResult } from 'express-validator';
import Series from '../models/Series.js';

// Get all series with filtering and pagination
export const getAllSeries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      genres = '',
      type = '',
      language = '',
      quality = '',
      releaseYear = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      adminStatus = ''
    } = req.query;

    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
        { 'creators.name': { $regex: search, $options: 'i' } },
        { 'cast.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by genres
    if (genres) {
      const genreArray = genres.split(',').map(g => g.trim());
      query.genres = { $in: genreArray };
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by language
    if (language) {
      query.language = { $in: [language] };
    }

    // Filter by quality
    if (quality) {
      query.quality = quality;
    }

    // Filter by release year
    if (releaseYear) {
      query.releaseYear = releaseYear;
    }

    // Admin can see all status, others only published
    if (req.user && req.user.role === 'admin' && adminStatus) {
      query.adminStatus = adminStatus;
    } else if (!req.user || req.user.role !== 'admin') {
      query.adminStatus = 'Published';
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const series = await Series.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'username')
      .select('-seasons.episodes.servers -seasons.episodes.downloadLinks'); // Exclude large nested data

    const total = await Series.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        series,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get series error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single series by ID or slug
export const getSeries = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    // Admin can see all, others only published
    if (!req.user || req.user.role !== 'admin') {
      query.adminStatus = 'Published';
    }

    const series = await Series.findOne(query)
      .populate('addedBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Increment view count
    series.views += 1;
    await series.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: { series }
    });

  } catch (error) {
    console.error('Get series error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new series
export const createSeries = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const seriesData = {
      ...req.body,
      addedBy: req.user._id
    };

    const series = new Series(seriesData);
    await series.save();

    await series.populate('addedBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Series created successfully',
      data: { series }
    });

  } catch (error) {
    console.error('Create series error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Series with this title and year already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add season to series
export const addSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const { seasonNumber, name, overview, posterPath, airDate } = req.body;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && series.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if season already exists
    const existingSeason = series.seasons.find(s => s.seasonNumber === seasonNumber);
    if (existingSeason) {
      return res.status(409).json({
        success: false,
        message: 'Season already exists'
      });
    }

    series.seasons.push({
      seasonNumber,
      name: name || (seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`),
      overview: overview || '',
      posterPath: posterPath || '',
      airDate: airDate || null,
      episodes: []
    });

    series.lastModifiedBy = req.user._id;
    await series.save();

    res.status(201).json({
      success: true,
      message: 'Season added successfully',
      data: { series }
    });

  } catch (error) {
    console.error('Add season error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add season',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add episode to season
export const addEpisode = async (req, res) => {
  try {
    const { id, seasonNumber } = req.params;
    const episodeData = req.body;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && series.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const season = series.seasons.find(s => s.seasonNumber == seasonNumber);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    // Check if episode already exists
    const existingEpisode = season.episodes.find(e => e.episodeNumber === episodeData.episodeNumber);
    if (existingEpisode) {
      return res.status(409).json({
        success: false,
        message: 'Episode already exists'
      });
    }

    season.episodes.push(episodeData);
    series.lastModifiedBy = req.user._id;
    await series.save();

    res.status(201).json({
      success: true,
      message: 'Episode added successfully',
      data: { series }
    });

  } catch (error) {
    console.error('Add episode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add episode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get specific episode
export const getEpisode = async (req, res) => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const season = series.seasons.find(s => s.seasonNumber == seasonNumber);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    const episode = season.episodes.find(e => e.episodeNumber == episodeNumber);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Increment episode view count
    episode.views += 1;
    await series.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: { 
        episode,
        series: {
          id: series._id,
          title: series.title,
          slug: series.slug,
          posterPath: series.posterPath
        }
      }
    });

  } catch (error) {
    console.error('Get episode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch episode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update episode
export const updateEpisode = async (req, res) => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;
    const updates = req.body;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && series.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const season = series.seasons.find(s => s.seasonNumber == seasonNumber);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    const episode = season.episodes.find(e => e.episodeNumber == episodeNumber);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Update episode fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        episode[key] = updates[key];
      }
    });

    series.lastModifiedBy = req.user._id;
    await series.save();

    res.json({
      success: true,
      message: 'Episode updated successfully',
      data: { episode }
    });

  } catch (error) {
    console.error('Update episode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update episode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add server to episode
export const addServerToEpisode = async (req, res) => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;
    const { name, url, quality } = req.body;

    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && series.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const season = series.seasons.find(s => s.seasonNumber == seasonNumber);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    const episode = season.episodes.find(e => e.episodeNumber == episodeNumber);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    episode.servers.push({
      name,
      url,
      quality: quality || '720p'
    });

    series.lastModifiedBy = req.user._id;
    await series.save();

    res.json({
      success: true,
      message: 'Server added to episode successfully',
      data: { episode }
    });

  } catch (error) {
    console.error('Add server to episode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add server to episode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trending series
export const getTrendingSeries = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const series = await Series.find({
      adminStatus: 'Published',
      views: { $gt: 0 }
    })
      .sort({ views: -1, rating: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('title slug posterPath rating releaseYear genres type views numberOfSeasons numberOfEpisodes');

    res.json({
      success: true,
      data: { series }
    });

  } catch (error) {
    console.error('Get trending series error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get latest series
export const getLatestSeries = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const series = await Series.find({ adminStatus: 'Published' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('title slug posterPath rating releaseYear genres type status numberOfSeasons numberOfEpisodes createdAt');

    res.json({
      success: true,
      data: { series }
    });

  } catch (error) {
    console.error('Get latest series error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update series status (admin only)
export const updateSeriesStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminStatus } = req.body;

    const series = await Series.findByIdAndUpdate(
      id,
      { 
        adminStatus,
        lastModifiedBy: req.user._id
      },
      { new: true }
    );

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    res.json({
      success: true,
      message: 'Series status updated successfully',
      data: { series }
    });

  } catch (error) {
    console.error('Update series status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update series status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
