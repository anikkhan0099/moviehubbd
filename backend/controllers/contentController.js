import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import { buildSearchQuery, buildFilterQuery, buildSortQuery, createPagination, createErrorResponse, createSuccessResponse } from '../utils/helpers.js';

// Get combined content (movies and series)
export const getContent = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type = 'all', // all, movie, series, anime, kdrama
      search = '',
      genres = '',
      language = '',
      releaseYear = '',
      quality = '',
      rating = '',
      sortBy = 'newest',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build base query
    let baseQuery = { adminStatus: 'Published' };

    // Add search query
    if (search && search.trim().length >= 2) {
      const searchFields = ['title', 'overview', 'director', 'cast.name', 'creators.name'];
      const searchQuery = buildSearchQuery(search.trim(), searchFields);
      baseQuery = { ...baseQuery, ...searchQuery };
    }

    // Add filter queries
    const filterQuery = buildFilterQuery({
      genres,
      language,
      releaseYear,
      quality,
      rating
    });
    baseQuery = { ...baseQuery, ...filterQuery };

    // Sort configuration
    const sortConfig = buildSortQuery(sortBy, sortOrder);

    let allContent = [];
    let totalCount = 0;

    // Fetch based on type
    if (type === 'all' || type === 'movie') {
      const movieQuery = { ...baseQuery };
      if (type === 'movie') {
        movieQuery.type = 'Movie';
      }

      const movies = await Movie.find(movieQuery)
        .select('title slug posterPath backdropPath overview rating imdbRating releaseYear genres type quality status views likes downloads createdAt runtime country language director cast')
        .sort(sortConfig)
        .lean();

      allContent.push(...movies.map(movie => ({
        ...movie,
        contentType: 'Movie',
        duration: movie.runtime,
        episodeCount: null,
        seasonCount: null
      })));
    }

    if (type === 'all' || type === 'series' || type === 'anime' || type === 'kdrama') {
      const seriesQuery = { ...baseQuery };
      
      if (type === 'series') {
        seriesQuery.type = 'Series';
      } else if (type === 'anime') {
        seriesQuery.type = 'Anime';
      } else if (type === 'kdrama') {
        seriesQuery.type = 'Kdrama';
      }

      const series = await Series.find(seriesQuery)
        .select('title slug posterPath backdropPath overview rating imdbRating releaseYear genres type quality status views likes downloads createdAt numberOfSeasons numberOfEpisodes country language creators cast episodeRunTime')
        .sort(sortConfig)
        .lean();

      allContent.push(...series.map(s => ({
        ...s,
        contentType: 'Series',
        duration: s.episodeRunTime && s.episodeRunTime.length > 0 ? s.episodeRunTime[0] : null,
        episodeCount: s.numberOfEpisodes,
        seasonCount: s.numberOfSeasons,
        director: null,
        runtime: null
      })));
    }

    // Re-sort combined results if needed
    if (type === 'all') {
      allContent = allContent.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'views':
            return b.views - a.views;
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'year':
            return b.releaseYear - a.releaseYear;
          case 'trending':
            // Custom trending calculation
            const trendingScoreA = (a.views * 0.7) + (a.rating * 10) + (a.likes * 0.3);
            const trendingScoreB = (b.views * 0.7) + (b.rating * 10) + (b.likes * 0.3);
            return trendingScoreB - trendingScoreA;
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    }

    totalCount = allContent.length;

    // Apply pagination
    const paginatedContent = allContent.slice(skip, skip + limitNum);

    // Build pagination object
    const pagination = createPagination({
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      docs: paginatedContent
    });

    res.json(createSuccessResponse({
      content: paginatedContent,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalDocs,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        limit: pagination.limit
      },
      filters: {
        type,
        search,
        genres,
        language,
        releaseYear,
        quality,
        rating,
        sortBy,
        sortOrder
      },
      stats: {
        totalResults: totalCount,
        movieCount: allContent.filter(item => item.contentType === 'Movie').length,
        seriesCount: allContent.filter(item => item.contentType === 'Series').length
      }
    }));

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch content', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

// Get featured content
export const getFeaturedContent = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get featured movies
    const featuredMovies = await Movie.find({
      adminStatus: 'Published',
      status: 'Featured'
    })
      .select('title slug posterPath backdropPath overview rating releaseYear genres type quality views')
      .sort({ rating: -1, views: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    // Get featured series
    const featuredSeries = await Series.find({
      adminStatus: 'Published',
      status: 'Featured'
    })
      .select('title slug posterPath backdropPath overview rating releaseYear genres type quality views numberOfSeasons numberOfEpisodes')
      .sort({ rating: -1, views: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    const featured = [
      ...featuredMovies.map(movie => ({ ...movie, contentType: 'Movie' })),
      ...featuredSeries.map(series => ({ ...series, contentType: 'Series' }))
    ];

    // Sort by rating and views
    featured.sort((a, b) => {
      const scoreA = (a.rating * 0.7) + (Math.log(a.views + 1) * 0.3);
      const scoreB = (b.rating * 0.7) + (Math.log(b.views + 1) * 0.3);
      return scoreB - scoreA;
    });

    res.json(createSuccessResponse({
      featured: featured.slice(0, parseInt(limit))
    }));

  } catch (error) {
    console.error('Get featured content error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch featured content', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

// Get trending content
export const getTrendingContent = async (req, res) => {
  try {
    const { limit = 20, timeframe = 'week' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'today':
        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Get trending movies
    const trendingMovies = await Movie.find({
      adminStatus: 'Published',
      views: { $gt: 0 },
      ...dateFilter
    })
      .select('title slug posterPath overview rating releaseYear genres type views likes createdAt')
      .sort({ views: -1, rating: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    // Get trending series
    const trendingSeries = await Series.find({
      adminStatus: 'Published',
      views: { $gt: 0 },
      ...dateFilter
    })
      .select('title slug posterPath overview rating releaseYear genres type views likes numberOfSeasons numberOfEpisodes createdAt')
      .sort({ views: -1, rating: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    const trending = [
      ...trendingMovies.map(movie => ({ ...movie, contentType: 'Movie' })),
      ...trendingSeries.map(series => ({ ...series, contentType: 'Series' }))
    ];

    // Calculate trending score and sort
    trending.forEach(item => {
      const daysSinceAdded = (now - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
      const freshnessBonus = Math.max(0, 10 - daysSinceAdded);
      item.trendingScore = (item.views * 0.6) + (item.rating * 0.2) + (item.likes * 0.1) + freshnessBonus;
    });

    trending.sort((a, b) => b.trendingScore - a.trendingScore);

    res.json(createSuccessResponse({
      trending: trending.slice(0, parseInt(limit)).map(({ trendingScore, ...item }) => item),
      timeframe
    }));

  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch trending content', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

// Get latest content
export const getLatestContent = async (req, res) => {
  try {
    const { limit = 20, type = 'all' } = req.query;

    let content = [];

    if (type === 'all' || type === 'movie') {
      const latestMovies = await Movie.find({ adminStatus: 'Published' })
        .select('title slug posterPath overview rating releaseYear genres type quality status createdAt')
        .sort({ createdAt: -1 })
        .limit(type === 'movie' ? parseInt(limit) : Math.ceil(limit / 2))
        .lean();
      
      content.push(...latestMovies.map(movie => ({ ...movie, contentType: 'Movie' })));
    }

    if (type === 'all' || type === 'series') {
      const latestSeries = await Series.find({ adminStatus: 'Published' })
        .select('title slug posterPath overview rating releaseYear genres type quality status numberOfSeasons numberOfEpisodes createdAt')
        .sort({ createdAt: -1 })
        .limit(type === 'series' ? parseInt(limit) : Math.ceil(limit / 2))
        .lean();
      
      content.push(...latestSeries.map(series => ({ ...series, contentType: 'Series' })));
    }

    // Sort by creation date if combining both types
    if (type === 'all') {
      content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      content = content.slice(0, parseInt(limit));
    }

    res.json(createSuccessResponse({
      latest: content,
      type
    }));

  } catch (error) {
    console.error('Get latest content error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch latest content', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

// Get content by genre
export const getContentByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 12, type = 'all' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let content = [];

    if (type === 'all' || type === 'movie') {
      const movies = await Movie.find({
        adminStatus: 'Published',
        genres: { $in: [genre] }
      })
        .select('title slug posterPath overview rating releaseYear genres type quality views')
        .sort({ rating: -1, views: -1 })
        .lean();
      
      content.push(...movies.map(movie => ({ ...movie, contentType: 'Movie' })));
    }

    if (type === 'all' || type === 'series') {
      const series = await Series.find({
        adminStatus: 'Published',
        genres: { $in: [genre] }
      })
        .select('title slug posterPath overview rating releaseYear genres type quality views numberOfSeasons numberOfEpisodes')
        .sort({ rating: -1, views: -1 })
        .lean();
      
      content.push(...series.map(s => ({ ...s, contentType: 'Series' })));
    }

    const totalCount = content.length;
    const paginatedContent = content.slice(skip, skip + limitNum);

    const pagination = createPagination({
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      docs: paginatedContent
    });

    res.json(createSuccessResponse({
      content: paginatedContent,
      genre,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalDocs,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        limit: pagination.limit
      }
    }));

  } catch (error) {
    console.error('Get content by genre error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch content by genre', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

// Get recommended content
export const getRecommendedContent = async (req, res) => {
  try {
    const { contentId, contentType, limit = 8 } = req.query;

    if (!contentId || !contentType) {
      return res.status(400).json(createErrorResponse('Content ID and type are required', 400));
    }

    let sourceContent;
    
    if (contentType === 'Movie') {
      sourceContent = await Movie.findById(contentId).select('genres language releaseYear rating');
    } else {
      sourceContent = await Series.findById(contentId).select('genres language releaseYear rating');
    }

    if (!sourceContent) {
      return res.status(404).json(createErrorResponse('Content not found', 404));
    }

    // Build recommendation query
    const recommendationQuery = {
      _id: { $ne: contentId },
      adminStatus: 'Published',
      $or: [
        { genres: { $in: sourceContent.genres } },
        { language: { $in: sourceContent.language } },
        { releaseYear: { $gte: sourceContent.releaseYear - 2, $lte: sourceContent.releaseYear + 2 } }
      ]
    };

    let recommendations = [];

    // Get from both movies and series
    const movieRecommendations = await Movie.find(recommendationQuery)
      .select('title slug posterPath overview rating releaseYear genres type quality views')
      .sort({ rating: -1, views: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    const seriesRecommendations = await Series.find(recommendationQuery)
      .select('title slug posterPath overview rating releaseYear genres type quality views numberOfSeasons numberOfEpisodes')
      .sort({ rating: -1, views: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    recommendations = [
      ...movieRecommendations.map(movie => ({ ...movie, contentType: 'Movie' })),
      ...seriesRecommendations.map(series => ({ ...series, contentType: 'Series' }))
    ];

    // Sort by similarity and limit
    recommendations = recommendations
      .slice(0, parseInt(limit))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json(createSuccessResponse({
      recommendations,
      basedOn: {
        id: contentId,
        type: contentType
      }
    }));

  } catch (error) {
    console.error('Get recommended content error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch recommendations', 500, process.env.NODE_ENV === 'development' ? error.message : undefined));
  }
};

export default {
  getContent,
  getFeaturedContent,
  getTrendingContent,
  getLatestContent,
  getContentByGenre,
  getRecommendedContent
};
