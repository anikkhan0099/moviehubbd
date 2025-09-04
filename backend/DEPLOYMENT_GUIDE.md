# 🚀 MovieHubBD Backend Deployment Guide

This comprehensive guide will help you deploy your MovieHubBD backend from development to production.

## 📋 Prerequisites Installation

### 1. Install Node.js
1. Go to https://nodejs.org/
2. Download and install the LTS version (v18 or later)
3. Verify installation:
```bash
node --version
npm --version
```

### 2. Install MongoDB (Local Development)
**Option A: MongoDB Community Server (Local)**
1. Go to https://www.mongodb.com/try/download/community
2. Download and install MongoDB Community Server
3. Start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a new cluster
4. Get connection string

## 🛠️ Local Development Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file with these settings:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Use one of these options)
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/moviehubbd

# Option B: MongoDB Atlas (Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviehubbd

# JWT Authentication (Generate strong secrets)
JWT_SECRET=your_32_character_secret_key_here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_32_chars
REFRESH_TOKEN_EXPIRE=30d

# Admin Authentication
ADMIN_EMAIL=admin@moviehubbd.com
ADMIN_PASSWORD=Admin123!@#
ADMIN_SECRET_KEY=admin_secret_key_here

# TMDB API (Get from https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Cloudinary (Get from https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### 4. Test the API
Visit: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "MovieHubBD API is running"
}
```

## 🌐 Production Deployment Options

### Option 1: Vercel (Recommended for Serverless)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# Add all environment variables
```

### Option 2: Railway (Recommended for Full-Stack)

1. Go to https://railway.app/
2. Connect your GitHub repository
3. Create new project from GitHub repo
4. Set environment variables in Railway dashboard
5. Deploy automatically

### Option 3: Render

1. Go to https://render.com/
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Option 4: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create new app from GitHub
3. Configure build settings:
   - Build command: `npm install && npm run build`
   - Run command: `npm start`
4. Set environment variables
5. Deploy

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

### 2. Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
Dockerfile
.dockerignore
```

### 3. Build and Run
```bash
# Build image
docker build -t moviehubbd-backend .

# Run container
docker run -p 5000:5000 --env-file .env moviehubbd-backend
```

## 🔗 Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create new organization and project

### 2. Create Cluster
1. Click "Create Cluster"
2. Choose FREE tier (M0)
3. Select region closest to your users
4. Name your cluster

### 3. Setup Database Access
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Set permissions to "Read and write to any database"

### 4. Setup Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0) for development
4. For production, add specific IP addresses

### 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

## 🌍 Environment Variables for Production

Create these environment variables in your deployment platform:

```bash
# Required for all deployments
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviehubbd
JWT_SECRET=your-super-secret-jwt-key-32-characters-long
REFRESH_TOKEN_SECRET=your-refresh-secret-32-characters-long
ADMIN_EMAIL=admin@moviehubbd.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SECRET_KEY=your-admin-secret-key

# Optional but recommended
TMDB_API_KEY=your-tmdb-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway login --token ${{ secrets.RAILWAY_TOKEN }}
        railway up
```

## 🔧 Production Optimization

### 1. Enable Production Mode
```bash
NODE_ENV=production
```

### 2. Use Process Manager (PM2)
```bash
npm install -g pm2

# Start application
pm2 start src/server.js --name moviehubbd-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Setup Nginx (for VPS deployment)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Set up CORS for your frontend domain
- [ ] Use HTTPS in production
- [ ] Secure MongoDB with authentication
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable security headers with Helmet
- [ ] Validate all user inputs
- [ ] Set up monitoring and logging

## 📊 Monitoring and Logging

### 1. Add Logging
```bash
npm install winston
```

### 2. Add Health Monitoring
Set up services like:
- Uptime Robot
- Pingdom
- New Relic
- DataDog

### 3. Error Tracking
- Sentry
- Bugsnag
- Rollbar

## 🚀 Quick Deployment Commands

### Local Development:
```bash
npm install
npm run dev
```

### Vercel:
```bash
npm install -g vercel
vercel
```

### Railway:
```bash
npm install -g @railway/cli
railway login
railway up
```

### Docker:
```bash
docker build -t moviehubbd-backend .
docker run -p 5000:5000 --env-file .env moviehubbd-backend
```

## 🔗 Frontend Integration

Update your frontend to use the production API:

```javascript
// In your frontend config
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'
  : 'http://localhost:5000/api';
```

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check MongoDB URI format
   - Verify network access settings
   - Confirm username/password

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

3. **CORS Errors**
   - Add your frontend domain to CORS_ORIGIN
   - Check preflight requests

4. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiration settings

5. **File Upload Issues**
   - Check file permissions for uploads folder
   - Verify Cloudinary configuration

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Test API endpoints with Postman
4. Check database connectivity
5. Review CORS and security settings

---

**Next Steps:**
1. Follow the local setup first
2. Test all endpoints locally
3. Choose a deployment platform
4. Set up production database
5. Configure environment variables
6. Deploy and test

Your backend is ready for production! 🎉
