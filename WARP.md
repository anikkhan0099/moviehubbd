# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MovieHubBD is a full-stack movie streaming website with a Node.js/Express backend API and a React (TypeScript) frontend. The project consists of two main parts:

- **Frontend**: React app with TypeScript, Vite build system, admin panel, and streaming interface
- **Backend**: Express.js API with MongoDB, JWT authentication, role-based access, and comprehensive content management

## Common Development Commands

### Frontend Development
```bash
# Install dependencies and run development server
npm install
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Production server
npm start

# Run API tests
npm run test
npm run test-api

# Seed database with sample data  
npm run seed

# Test API endpoints
node test-api.js
node test-api.js https://your-production-url.com
```

### Environment Setup
**Backend**: Copy `.env.production.template` to `.env` and configure required variables:
- MongoDB connection string
- JWT secrets (use 32+ character random strings)
- Admin credentials
- TMDB API key (for content import)
- Cloudinary credentials (for image uploads)

**Frontend**: Set `GEMINI_API_KEY` in `.env.local` for AI features

## Architecture Overview

### Frontend Structure (React + TypeScript)
- **Components**: Reusable UI components in `/components/` directory
- **Pages**: Route-based page components (`HomePage.tsx`, `DetailPage.tsx`)  
- **Admin Panel**: Complete admin interface in `/pages/admin/` with authentication
- **Types**: TypeScript definitions in `types.ts`
- **Routing**: Hash-based routing with public and protected admin routes

### Backend Architecture (Express.js + MongoDB)
- **Models**: Mongoose schemas for User, Movie, Series with complex nested structures
- **Controllers**: Business logic for auth, movies, series operations
- **Routes**: RESTful API endpoints with role-based protection
- **Middleware**: JWT auth, error handling, rate limiting, validation
- **Database**: MongoDB with pagination, text search, and optimized indexes

### Data Models
**Movie Schema**: Comprehensive movie data with servers, download links, cast, ratings, SEO fields
**Series Schema**: Complex hierarchical structure with seasons -> episodes -> servers/downloads
**User Schema**: JWT-based auth with roles (user/moderator/admin), watchlists, preferences

### Key Features
- **Authentication**: Complete JWT system with access/refresh tokens, role-based permissions
- **Content Management**: Full CRUD for movies/series with seasons/episodes, server management
- **TMDB Integration**: Complete import system for movies/series with metadata mapping
- **File Uploads**: Full image processing pipeline with Sharp, Cloudinary/local storage
- **Advanced Search**: Relevance scoring, autocomplete, filters, suggestions
- **Ad Management**: Complete ad system with targeting, analytics, impression/click tracking
- **Combined Content API**: Unified movies/series endpoints with advanced filtering
- **Image Processing**: Automatic resizing, optimization, multiple formats
- **Analytics**: View tracking, trending calculations, comprehensive reporting

## Complete API Documentation

### Health & System
- `GET /api/health` - Health check and system status

### Authentication & Users
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/admin-login` - Admin login (requires email, password, adminKey)
- `POST /api/auth/refresh-token` - Refresh JWT access token
- `POST /api/auth/logout` - Logout and clear refresh token
- `GET /api/auth/profile` - Get current user profile with watchlist
- `PUT /api/auth/profile` - Update user profile and preferences
- `PUT /api/auth/change-password` - Change user password

### Movies (Complete CRUD)
- `GET /api/movies` - List movies with advanced filtering, search, pagination
- `GET /api/movies/trending` - Get trending movies by views and rating
- `GET /api/movies/latest` - Get recently added movies
- `GET /api/movies/genre/:genre` - Get movies by specific genre
- `GET /api/movies/:identifier` - Get single movie by ID or slug (increments views)
- `GET /api/movies/:id/related` - Get related/recommended movies
- `POST /api/movies` - Create new movie (moderator/admin)
- `PUT /api/movies/:id` - Update movie (owner/admin)
- `DELETE /api/movies/:id` - Delete movie (owner/admin)
- `POST /api/movies/:id/servers` - Add streaming server to movie
- `DELETE /api/movies/:id/servers/:serverId` - Remove server from movie
- `PATCH /api/movies/:id/status` - Update movie publication status (admin)

### Series (Complete CRUD with Episodes)
- `GET /api/series` - List series with filtering, search, pagination
- `GET /api/series/trending` - Get trending series
- `GET /api/series/latest` - Get recently added series
- `GET /api/series/:identifier` - Get single series with all seasons/episodes
- `GET /api/series/:id/season/:seasonNumber/episode/:episodeNumber` - Get specific episode
- `POST /api/series` - Create new series (moderator/admin)
- `POST /api/series/:id/seasons` - Add season to series
- `POST /api/series/:id/season/:seasonNumber/episodes` - Add episode to season
- `PUT /api/series/:id/season/:seasonNumber/episode/:episodeNumber` - Update episode
- `POST /api/series/:id/season/:seasonNumber/episode/:episodeNumber/servers` - Add server to episode
- `PATCH /api/series/:id/status` - Update series publication status (admin)

### Content (Unified Movies + Series)
- `GET /api/content` - Get all content with advanced filtering, search, sorting
- `GET /api/content/featured` - Get featured content
- `GET /api/content/trending` - Get trending content with timeframe options
- `GET /api/content/latest` - Get latest content by type
- `GET /api/content/genre/:genre` - Get content by genre
- `GET /api/content/recommendations` - Get recommendations based on content

### Search (Advanced)
- `GET /api/search?q=query` - Advanced search with relevance scoring
- `GET /api/search/suggestions?q=query` - Autocomplete suggestions
- `GET /api/search/popular` - Popular search terms

### File Uploads (Complete Image Processing)
- `GET /api/upload/config` - Get upload configuration and limits
- `POST /api/upload/poster` - Upload and process movie/series poster (400x600)
- `POST /api/upload/backdrop` - Upload and process backdrop image (1280x720)
- `POST /api/upload/profile` - Upload and process profile image (200x200)
- `POST /api/upload/image` - Upload general image with custom dimensions
- `POST /api/upload/multiple` - Upload multiple images at once
- `GET /api/upload/info/:fileName` - Get file information
- `DELETE /api/upload/:fileName` - Delete uploaded file (moderator)

### Ad Management (Complete System)
- `GET /api/ads` - List all ads with filtering (admin)
- `GET /api/ads/placement/:placement` - Get active ads by placement (public)
- `GET /api/ads/analytics` - Get comprehensive ad analytics (admin)
- `GET /api/ads/:id` - Get single ad details (admin)
- `POST /api/ads` - Create new ad with targeting (admin)
- `PUT /api/ads/:id` - Update ad (admin)
- `DELETE /api/ads/:id` - Delete ad (admin)
- `PATCH /api/ads/:id/toggle` - Toggle ad active status (admin)
- `POST /api/ads/:id/impression` - Record ad impression (public)
- `POST /api/ads/:id/click` - Record ad click with redirect (public)
- `POST /api/ads/bulk` - Bulk operations on ads (admin)

### Admin Dashboard
- `GET /api/admin/dashboard` - Complete dashboard statistics and analytics

## Backend Services & Utilities

### TMDB Integration Service (`/services/tmdbService.js`)
- Complete TMDB API integration for movies and TV series
- Automatic data mapping to database schema
- Bulk import capabilities for popular content
- Season and episode import with full metadata
- Trailer URL extraction and image URL formatting
- Search functionality across TMDB database
- Smart content type detection (Movie/Series/Anime/Kdrama)

### Upload Service (`/services/uploadService.js`)
- Multi-format image processing with Sharp
- Cloudinary and local storage support
- Automatic image optimization and resizing
- Multiple upload types (poster, backdrop, profile, general)
- File validation and error handling
- Cleanup utilities for temporary files

### Helper Utilities (`/utils/helpers.js`)
- Pagination utilities with metadata
- Search query builders with MongoDB text search
- Filter query builders for complex filtering
- Sort query builders with predefined options
- Slug generation from titles
- Content similarity calculations
- SEO metadata generation
- Error and success response helpers

## Database Patterns

### Slug Generation
Both movies and series automatically generate URL-friendly slugs from titles with release years appended.

### Complex Nested Data
Series use deeply nested schemas: Series -> Seasons -> Episodes -> Servers/Downloads
Each level maintains its own metadata and can be queried independently.

### Performance Optimizations  
- Text search indexes on titles and overviews
- Compound indexes for common query patterns
- Pagination using mongoose-paginate-v2
- Selective field projection for list views

## Authentication Flow

1. **Admin Login**: Requires email, password, and adminKey for enhanced security  
2. **JWT Tokens**: Access token (7d) + refresh token (30d) system
3. **Role-Based Access**: Middleware checks user roles for protected operations
4. **Token Refresh**: Automatic token renewal without re-authentication

## Development Workflow

### Adding New Content Types
1. Create/extend Mongoose schema in `/backend/models/`
2. Add controller methods in `/backend/controllers/`  
3. Define routes with appropriate middleware
4. Update frontend types in `types.ts`
5. Add admin panel interfaces if needed

### Working with Series/Episodes
- Series contain seasons array, each with episodes array
- Use built-in methods: `series.getEpisode(seasonNum, episodeNum)`
- When adding episodes, seasons are auto-created if missing
- Episode counts are automatically maintained on save

### File Uploads & Media
- Images processed with Sharp for optimization
- Cloudinary integration for CDN storage
- Local uploads stored in `/backend/uploads/` directory
- Virtual methods provide full URLs for poster/backdrop paths

## Testing and Quality Assurance

### API Testing  
Use `npm run test-api` to run the included API test suite that validates endpoints.

### Development Tools
- Morgan for request logging in development
- Comprehensive error handling with detailed dev messages
- Rate limiting for API protection
- CORS configuration for frontend integration

## Deployment Notes

### Production Considerations
- Use PM2 for process management: `pm2 start src/server.js --name moviehubbd-api`
- MongoDB Atlas recommended for managed database
- Set NODE_ENV=production for optimized performance
- Configure proper CORS origins for production domains
- Use strong JWT secrets (32+ characters)

### Environment Variables
All sensitive configuration should use environment variables. The backend includes templates for both development and production setups.
