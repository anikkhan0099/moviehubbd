# MovieHubBD Backend API

A comprehensive Node.js backend API for the MovieHubBD streaming website, built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Content Management**: Full CRUD operations for movies, series, episodes
- **File Upload**: Image upload with validation and processing
- **Search & Filtering**: Advanced search with pagination
- **Admin Panel**: Dashboard stats and content management
- **Ad Management**: Advertisement placement and tracking
- **TMDB Integration**: Import content from The Movie Database
- **Security**: Rate limiting, input validation, CORS protection
- **Documentation**: Comprehensive API documentation

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **npm** or **yarn** package manager

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory and configure the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/moviehubbd
MONGODB_TEST_URI=mongodb://localhost:27017/moviehubbd_test

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRE=30d

# Admin Authentication
ADMIN_EMAIL=admin@moviehubbd.com
ADMIN_PASSWORD=admin123456
ADMIN_SECRET_KEY=admin_secret_key_here

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Movies
- `GET /api/movies` - Get all movies (with filtering)
- `GET /api/movies/:identifier` - Get single movie by ID or slug
- `POST /api/movies` - Create new movie (Admin/Moderator)
- `PUT /api/movies/:id` - Update movie (Admin/Moderator)
- `DELETE /api/movies/:id` - Delete movie (Admin/Moderator)
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/latest` - Get latest movies

### Series
- `GET /api/series` - Get all series (with filtering)
- `GET /api/series/:identifier` - Get single series by ID or slug
- `POST /api/series` - Create new series (Admin/Moderator)
- `POST /api/series/:id/seasons` - Add season to series
- `POST /api/series/:id/season/:seasonNumber/episodes` - Add episode

### Search
- `GET /api/search?q=query` - Search movies and series

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Admin)

### Content (Combined)
- `GET /api/content` - Get all content (movies + series) with filtering

## 🛡️ Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Roles

- **User**: Basic user access
- **Moderator**: Can create/edit content
- **Admin**: Full access to all features

## 📝 Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

## 🗂️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── movieController.js   # Movie operations
│   └── seriesController.js  # Series operations
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   └── notFound.js         # 404 handler
├── models/
│   ├── User.js             # User schema
│   ├── Movie.js            # Movie schema
│   ├── Series.js           # Series schema
│   └── Ad.js               # Advertisement schema
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── movieRoutes.js      # Movie routes
│   └── seriesRoutes.js     # Series routes
├── services/               # Business logic services
├── utils/                  # Utility functions
├── uploads/               # File uploads directory
└── src/
    └── server.js          # Main server file
```

## 🔧 Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with sample data
npm test         # Run tests
```

## 🚀 Deployment

### Environment Variables

Make sure to set all required environment variables in your production environment.

### Database

Ensure your MongoDB instance is accessible and properly configured.

### Process Manager

Use PM2 for production deployment:

```bash
npm install -g pm2
pm2 start src/server.js --name moviehubbd-api
```

## 📚 API Documentation

For detailed API documentation with request/response examples, visit:
`http://localhost:5000/api-docs` (when running locally)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email moviehubbdofficial@gmail.com or create an issue in the repository.

---

**Note**: This is a development setup. For production deployment, ensure proper security measures, use environment variables for sensitive data, and implement proper logging and monitoring.
