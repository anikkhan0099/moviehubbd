import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import { buildSearchQuery, buildFilterQuery, createPagination } from '../utils/helpers.js';

const router = express.Router();

// Advanced search across all content
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q,
      type = 'all', // all, movie, series, anime, kdrama
      page = 1,
      limit = 12,
      sortBy = 'relevance',
      genres,
      language,
      releaseYear,
      quality,
      rating
    } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = q.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build base search query
    const searchFields = ['title', 'overview', 'director', 'cast.name', 'creators.name', 'networks.name'];
    const textSearchQuery = buildSearchQuery(searchTerm, searchFields);
    
    // Build filter query
    const filterQuery = buildFilterQuery({
      genres,
      language,
      releaseYear,
      quality,
      rating
    });

    // Combine search and filter queries
    const baseQuery = {
      ...textSearchQuery,
      ...filterQuery,
      adminStatus: 'Published'
    };

    let results = [];
    let total = 0;

    // Search based on type filter
    if (type === 'all' || type === 'movie' || type === 'anime') {
      const movieQuery = { ...baseQuery };
      if (type === 'anime') {
        movieQuery.type = 'Anime';
      } else if (type === 'movie') {
        movieQuery.type = 'Movie';
      }

      const movies = await Movie.find(movieQuery)
        .select('title slug posterPath overview rating releaseYear genres type quality views imdbRating')
        .lean();
      
      results.push(...movies.map(movie => ({ ...movie, contentType: 'Movie' })));
    }

    if (type === 'all' || type === 'series' || type === 'kdrama') {
      const seriesQuery = { ...baseQuery };
      if (type === 'kdrama') {
        seriesQuery.type = 'Kdrama';
      } else if (type === 'series') {
        seriesQuery.type = { $in: ['Series', 'Anime'] };
      }

      const series = await Series.find(seriesQuery)
        .select('title slug posterPath overview rating releaseYear genres type quality views imdbRating numberOfSeasons numberOfEpisodes')
        .lean();
      
      results.push(...series.map(s => ({ ...s, contentType: 'Series' })));
    }

    // Calculate relevance scores and sort
    results = results.map(item => {
      let relevanceScore = 0;
      
      // Title match bonus
      const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (titleMatch) {
        relevanceScore += 100;
        // Exact match gets higher score
        if (item.title.toLowerCase() === searchTerm.toLowerCase()) {
          relevanceScore += 200;
        }
        // Starting with search term gets bonus
        if (item.title.toLowerCase().startsWith(searchTerm.toLowerCase())) {
          relevanceScore += 50;
        }
      }

      // Overview match bonus
      if (item.overview && item.overview.toLowerCase().includes(searchTerm.toLowerCase())) {
        relevanceScore += 20;
      }

      // Rating bonus
      relevanceScore += (item.rating || 0) * 5;
      relevanceScore += (item.imdbRating || 0) * 3;

      // Popularity bonus (views)
      relevanceScore += Math.log(item.views + 1) * 2;

      // Recent content bonus
      const currentYear = new Date().getFullYear();
      const yearBonus = Math.max(0, 10 - (currentYear - item.releaseYear));
      relevanceScore += yearBonus;

      return { ...item, relevanceScore };
    });

    // Sort results
    switch (sortBy) {
      case 'relevance':
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'year':
        results.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'views':
        results.sort((a, b) => b.views - a.views);
        break;
      default:
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    total = results.length;
    
    // Paginate results
    const paginatedResults = results.slice(skip, skip + limitNum);
    
    // Remove relevanceScore from final results
    const finalResults = paginatedResults.map(({ relevanceScore, ...item }) => item);

    const pagination = createPagination({
      page: pageNum,
      limit: limitNum,
      total,
      docs: finalResults
    });

    res.json({
      success: true,
      data: {
        results: finalResults,
        query: searchTerm,
        total,
        pagination,
        filters: {
          type,
          genres,
          language,
          releaseYear,
          quality,
          rating
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = q.trim();
    const searchRegex = { $regex: `^${searchTerm}`, $options: 'i' };
    
    const movieSuggestions = await Movie.find(
      { title: searchRegex, adminStatus: 'Published' },
      { title: 1, slug: 1, posterPath: 1, releaseYear: 1, type: 1 }
    ).limit(Math.ceil(limit / 2));

    const seriesSuggestions = await Series.find(
      { title: searchRegex, adminStatus: 'Published' },
      { title: 1, slug: 1, posterPath: 1, releaseYear: 1, type: 1 }
    ).limit(Math.ceil(limit / 2));

    const allSuggestions = [
      ...movieSuggestions.map(m => ({ ...m.toObject(), contentType: 'Movie' })),
      ...seriesSuggestions.map(s => ({ ...s.toObject(), contentType: 'Series' }))
    ];

    // Sort by title similarity and limit
    const sortedSuggestions = allSuggestions
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { suggestions: sortedSuggestions }
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Popular search terms
router.get('/popular', async (req, res) => {
  try {
    // Get popular movies and series titles as search terms
    const popularMovies = await Movie.find(
      { adminStatus: 'Published' },
      { title: 1, views: 1 }
    ).sort({ views: -1 }).limit(10);

    const popularSeries = await Series.find(
      { adminStatus: 'Published' },
      { title: 1, views: 1 }
    ).sort({ views: -1 }).limit(10);

    const popularTerms = [
      ...popularMovies.map(m => ({ term: m.title, views: m.views })),
      ...popularSeries.map(s => ({ term: s.title, views: s.views }))
    ]
      .sort((a, b) => b.views - a.views)
      .slice(0, 15)
      .map(item => item.term);

    res.json({
      success: true,
      data: { popularTerms }
    });

  } catch (error) {
    console.error('Popular search terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular search terms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
