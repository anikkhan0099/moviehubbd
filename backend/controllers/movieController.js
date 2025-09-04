import { validationResult } from 'express-validator';
import Movie from '../models/Movie.js';
import { createPagination, buildSearchQuery } from '../utils/helpers.js';

// Get all movies with filtering and pagination
export const getMovies = async (req, res) => {
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

    const query = { adminStatus: 'Published' };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
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

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
      populate: {
        path: 'addedBy',
        select: 'username'
      }
    };

    const movies = await Movie.paginate(query, options);

    res.json({
      success: true,
      data: {
        movies: movies.docs,
        pagination: {
          currentPage: movies.page,
          totalPages: movies.totalPages,
          totalItems: movies.totalDocs,
          hasNextPage: movies.hasNextPage,
          hasPrevPage: movies.hasPrevPage,
          limit: movies.limit
        }
      }
    });

  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single movie by ID or slug
export const getMovie = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };

    // Admin can see all, others only published
    if (!req.user || req.user.role !== 'admin') {
      query.adminStatus = 'Published';
    }

    const movie = await Movie.findOne(query)
      .populate('addedBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Increment view count
    movie.views += 1;
    await movie.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: { movie }
    });

  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new movie
export const createMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const movieData = {
      ...req.body,
      addedBy: req.user._id
    };

    const movie = new Movie(movieData);
    await movie.save();

    await movie.populate('addedBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: { movie }
    });

  } catch (error) {
    console.error('Create movie error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Movie with this title and year already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create movie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update movie
export const updateMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && movie.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username').populate('lastModifiedBy', 'username');

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: { movie: updatedMovie }
    });

  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && movie.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Movie.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });

  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trending movies
export const getTrendingMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({
      adminStatus: 'Published',
      views: { $gt: 0 }
    })
      .sort({ views: -1, rating: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('title slug posterPath rating releaseYear genres type views');

    res.json({
      success: true,
      data: { movies }
    });

  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get latest movies
export const getLatestMovies = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const movies = await Movie.find({ adminStatus: 'Published' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('title slug posterPath rating releaseYear genres type status createdAt');

    res.json({
      success: true,
      data: { movies }
    });

  } catch (error) {
    console.error('Get latest movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get movies by genre
export const getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const query = {
      adminStatus: 'Published',
      genres: { $in: [genre] }
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { rating: -1, createdAt: -1 }
    };

    const movies = await Movie.paginate(query, options);

    res.json({
      success: true,
      data: {
        movies: movies.docs,
        genre,
        pagination: {
          currentPage: movies.page,
          totalPages: movies.totalPages,
          totalItems: movies.totalDocs,
          hasNextPage: movies.hasNextPage,
          hasPrevPage: movies.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get movies by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies by genre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get related movies
export const getRelatedMovies = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const relatedMovies = await Movie.find({
      _id: { $ne: id },
      adminStatus: 'Published',
      $or: [
        { genres: { $in: movie.genres } },
        { language: { $in: movie.language } },
        { releaseYear: movie.releaseYear }
      ]
    })
      .limit(parseInt(limit))
      .sort({ rating: -1, views: -1 })
      .select('title slug posterPath rating releaseYear genres type');

    res.json({
      success: true,
      data: { movies: relatedMovies }
    });

  } catch (error) {
    console.error('Get related movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add server to movie
export const addServerToMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, quality, serverType } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && movie.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    movie.servers.push({
      name,
      url,
      quality: quality || '720p',
      serverType: serverType || 'embed'
    });

    movie.lastModifiedBy = req.user._id;
    await movie.save();

    res.json({
      success: true,
      message: 'Server added successfully',
      data: { movie }
    });

  } catch (error) {
    console.error('Add server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove server from movie
export const removeServerFromMovie = async (req, res) => {
  try {
    const { id, serverId } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && movie.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    movie.servers = movie.servers.filter(server => server._id.toString() !== serverId);
    movie.lastModifiedBy = req.user._id;
    await movie.save();

    res.json({
      success: true,
      message: 'Server removed successfully',
      data: { movie }
    });

  } catch (error) {
    console.error('Remove server error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update movie status (admin only)
export const updateMovieStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminStatus } = req.body;

    const movie = await Movie.findByIdAndUpdate(
      id,
      { 
        adminStatus,
        lastModifiedBy: req.user._id
      },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie status updated successfully',
      data: { movie }
    });

  } catch (error) {
    console.error('Update movie status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
