import mongoose from 'mongoose';

// Create pagination metadata
export const createPagination = ({ page, limit, total, docs = [] }) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 12;
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const nextPage = hasNextPage ? currentPage + 1 : null;
  const prevPage = hasPrevPage ? currentPage - 1 : null;

  return {
    docs,
    totalDocs: total,
    limit: itemsPerPage,
    totalPages,
    page: currentPage,
    pagingCounter: (currentPage - 1) * itemsPerPage + 1,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage
  };
};

// Build search query for text search across multiple fields
export const buildSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
    return {};
  }

  const cleanSearchTerm = searchTerm.trim();
  const searchRegex = { $regex: cleanSearchTerm, $options: 'i' };

  // Default fields if none provided
  const defaultFields = ['title', 'overview'];
  const searchFields = fields.length > 0 ? fields : defaultFields;

  return {
    $or: searchFields.map(field => {
      if (field.includes('.')) {
        // Handle nested fields like 'cast.name'
        return { [field]: searchRegex };
      }
      return { [field]: searchRegex };
    })
  };
};

// Build filter query from request parameters
export const buildFilterQuery = (filters = {}) => {
  const query = {};

  Object.keys(filters).forEach(key => {
    const value = filters[key];
    
    if (value && value.toString().trim() !== '') {
      switch (key) {
        case 'genres':
          if (typeof value === 'string') {
            const genreArray = value.split(',').map(g => g.trim()).filter(g => g);
            if (genreArray.length > 0) {
              query.genres = { $in: genreArray };
            }
          }
          break;
          
        case 'language':
          if (typeof value === 'string') {
            query.language = { $in: [value] };
          }
          break;
          
        case 'releaseYear':
          if (!isNaN(value)) {
            query.releaseYear = parseInt(value);
          }
          break;
          
        case 'type':
          query.type = value;
          break;
          
        case 'quality':
          query.quality = value;
          break;
          
        case 'rating':
          if (!isNaN(value)) {
            query.rating = { $gte: parseFloat(value) };
          }
          break;
          
        case 'adminStatus':
          query.adminStatus = value;
          break;
          
        default:
          // Handle other simple equality filters
          query[key] = value;
      }
    }
  });

  return query;
};

// Build sort object from request parameters
export const buildSortQuery = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  
  // Map frontend sort keys to database fields
  const sortMapping = {
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 },
    'rating': { rating: -1, imdbRating: -1 },
    'views': { views: -1 },
    'alphabetical': { title: 1 },
    'year': { releaseYear: -1 },
    'trending': { views: -1, rating: -1, createdAt: -1 }
  };

  if (sortMapping[sortBy]) {
    return sortMapping[sortBy];
  }

  return { [sortBy]: order };
};

// Generate unique slug from title
export const generateSlug = (title, year = null) => {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  if (year) {
    baseSlug += `-${year}`;
  }

  return baseSlug;
};

// Check if string is valid ObjectId
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, ''); // Remove < and > characters
};

// Calculate content similarity score
export const calculateSimilarity = (content1, content2) => {
  let score = 0;
  
  // Genre similarity (40% weight)
  const commonGenres = content1.genres.filter(g => content2.genres.includes(g));
  const genreScore = commonGenres.length / Math.max(content1.genres.length, content2.genres.length);
  score += genreScore * 0.4;
  
  // Language similarity (20% weight)
  const commonLanguages = content1.language.filter(l => content2.language.includes(l));
  const languageScore = commonLanguages.length > 0 ? 1 : 0;
  score += languageScore * 0.2;
  
  // Year similarity (20% weight)
  const yearDiff = Math.abs(content1.releaseYear - content2.releaseYear);
  const yearScore = Math.max(0, 1 - yearDiff / 10); // Decrease score as year difference increases
  score += yearScore * 0.2;
  
  // Type similarity (20% weight)
  const typeScore = content1.type === content2.type ? 1 : 0;
  score += typeScore * 0.2;
  
  return score;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random string for tokens/IDs
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Extract video ID from YouTube URL
export const extractYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

// Calculate age rating from content
export const calculateAgeRating = (content) => {
  const { genres, overview } = content;
  
  // Check for adult content indicators
  const adultGenres = ['Horror', 'Thriller', 'Crime', 'War'];
  const adultKeywords = ['violence', 'blood', 'mature', 'adult', 'explicit'];
  
  if (genres.some(g => adultGenres.includes(g))) {
    return '18+';
  }
  
  if (overview && adultKeywords.some(k => overview.toLowerCase().includes(k))) {
    return '16+';
  }
  
  return '13+';
};

// Convert duration to human readable format
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return 'Unknown';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Generate SEO friendly meta data
export const generateSEOData = (content) => {
  const { title, overview, genres, releaseYear, type } = content;
  
  const seoTitle = `Watch ${title} (${releaseYear}) Online - Free ${type} Streaming | MovieHubBD`;
  const seoDescription = overview.length > 150 
    ? overview.substring(0, 147) + '...' 
    : overview;
  
  const keywords = [
    title.toLowerCase(),
    ...genres.map(g => g.toLowerCase()),
    type.toLowerCase(),
    'watch online',
    'free streaming',
    'moviehubbd'
  ];
  
  return {
    seoTitle,
    seoDescription,
    keywords
  };
};

// Rate limiting helper
export const createRateLimitKey = (ip, userId = null) => {
  return userId ? `rate_limit:user:${userId}` : `rate_limit:ip:${ip}`;
};

// Error response helper
export const createErrorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  if (process.env.NODE_ENV === 'development') {
    response.timestamp = new Date().toISOString();
  }
  
  return response;
};

// Success response helper
export const createSuccessResponse = (data = null, message = 'Success') => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return response;
};

export default {
  createPagination,
  buildSearchQuery,
  buildFilterQuery,
  buildSortQuery,
  generateSlug,
  isValidObjectId,
  sanitizeInput,
  calculateSimilarity,
  formatFileSize,
  generateRandomString,
  isValidEmail,
  extractYouTubeId,
  calculateAgeRating,
  formatDuration,
  generateSEOData,
  createRateLimitKey,
  createErrorResponse,
  createSuccessResponse
};
