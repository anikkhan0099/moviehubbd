# 🚀 MovieHubBD Backend - Quick Start Guide

**Get your backend running in 10 minutes!**

## 🔥 Option 1: Local Development (Fastest)

### Step 1: Install Prerequisites

1. **Download and install Node.js**
   - Go to: https://nodejs.org/
   - Download the LTS version (v18 or higher)
   - Install and verify: Open PowerShell and run:
     ```bash
     node --version
     npm --version
     ```

2. **Set up MongoDB Atlas (Free Cloud Database)**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create free account
   - Create new cluster (free M0 tier)
   - Create database user
   - Get connection string

### Step 2: Quick Setup

1. **Run the setup script:**
   ```bash
   # Double-click setup-local.bat or run:
   .\setup-local.bat
   ```

2. **Configure environment:**
   - Edit the `.env` file with your details:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviehubbd
   JWT_SECRET=your-32-character-secret-key-here
   # ... other settings
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test your API:**
   - Open: http://localhost:5000/api/health
   - You should see: `{"success": true, "message": "MovieHubBD API is running"}`

## 🌐 Option 2: Deploy to Production

### Railway (Recommended - Easy)

1. **Go to Railway.app**
   - Visit: https://railway.app/
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your backend repository
   - Railway auto-detects Node.js and deploys

3. **Add Environment Variables**
   - In Railway dashboard → Variables tab
   - Add all variables from `.env.production.template`
   - **Required:**
     ```
     NODE_ENV=production
     MONGODB_URI=your-mongodb-atlas-url
     JWT_SECRET=your-secret-key
     REFRESH_TOKEN_SECRET=your-refresh-secret
     ADMIN_EMAIL=admin@yourdomain.com
     ADMIN_PASSWORD=your-admin-password
     ADMIN_SECRET_KEY=your-admin-secret
     ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Get your production URL

### Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # Add all required variables
   ```

### Render (Alternative)

1. **Go to Render.com**
   - Visit: https://render.com/
   - Sign up with GitHub

2. **Create Web Service**
   - "New" → "Web Service"
   - Connect GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add Environment Variables**
   - In Render dashboard
   - Add all variables from template

## 🔗 MongoDB Atlas Setup (Detailed)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create organization and project

### Step 2: Create Cluster
1. "Create Cluster" → Choose FREE (M0)
2. Select region closest to your users
3. Name: `moviehubbd-cluster`

### Step 3: Configure Access
1. **Database Access:**
   - "Add New Database User"
   - Username: `moviehubbd-user`
   - Password: Generate strong password
   - Role: "Read and write to any database"

2. **Network Access:**
   - "Add IP Address"
   - "Allow access from anywhere" (0.0.0.0/0)
   - Or add your specific IP for security

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password

Example:
```
mongodb+srv://moviehubbd-user:YOUR_PASSWORD@moviehubbd-cluster.abc123.mongodb.net/moviehubbd?retryWrites=true&w=majority
```

## 🔑 Generate Strong Secrets

### JWT Secrets (Required)
Use one of these methods:

**Method 1: Online Generator**
- Go to: https://generate-secret.now.sh/32
- Generate two different 32-character secrets

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 3: PowerShell**
```powershell
[System.Web.Security.Membership]::GeneratePassword(32, 8)
```

## 📊 Test Your Deployment

### 1. Health Check
```
GET https://your-api-url.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "MovieHubBD API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Admin Login
```
POST https://your-api-url.com/api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "your-admin-password",
  "adminKey": "your-admin-secret-key"
}
```

### 3. Create Content
```
POST https://your-api-url.com/api/movies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Test Movie",
  "overview": "A test movie for API testing",
  "posterPath": "https://via.placeholder.com/400x600",
  "releaseYear": 2024,
  "genres": ["Action"],
  "language": ["English"],
  "adminStatus": "Published"
}
```

## 🔧 Update Frontend

Update your frontend to use the production API:

### React/Vite Frontend
```javascript
// In your frontend config/constants
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'
  : 'http://localhost:5000/api';

// Update all API calls
fetch(`${API_BASE_URL}/movies`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Admin Login Update
```javascript
// Update your admin login to use the new endpoint
const adminLogin = async (email, password, adminKey) => {
  const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      adminKey
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};
```

## 🔒 Production Security Checklist

- [ ] Use strong, unique JWT secrets (32+ characters)
- [ ] Set CORS_ORIGIN to your actual domain
- [ ] Use HTTPS in production
- [ ] Secure MongoDB with strong passwords
- [ ] Enable rate limiting
- [ ] Set up monitoring (Uptime Robot, etc.)
- [ ] Configure error tracking (Sentry)
- [ ] Use environment variables for all secrets
- [ ] Enable security headers (already configured)
- [ ] Set up regular backups

## 🆘 Troubleshooting

### Common Issues:

1. **"npm not found"**
   - Install Node.js from nodejs.org
   - Restart your terminal

2. **Database connection failed**
   - Check MongoDB URI format
   - Verify username/password
   - Check network access in Atlas

3. **CORS errors**
   - Add your frontend domain to CORS_ORIGIN
   - Use proper protocol (https://)

4. **JWT errors**
   - Verify JWT_SECRET is set correctly
   - Check token format in requests

5. **Port already in use**
   - Change PORT in .env file
   - Or kill existing process

### Getting Help:

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test with Postman or curl
4. Check database connectivity
5. Review the full deployment guide: `DEPLOYMENT_GUIDE.md`

## 🎉 You're Done!

Your MovieHubBD backend is now deployed and ready to power your streaming website!

### Next Steps:
1. Connect your frontend to the API
2. Add your movie/series content via admin panel
3. Set up TMDB integration for automatic imports
4. Configure image uploads with Cloudinary
5. Set up monitoring and analytics

**Production URL Example:**
- API Base: `https://your-app.railway.app/api`
- Health Check: `https://your-app.railway.app/api/health`
- Admin Login: `https://your-app.railway.app/api/auth/admin-login`

**Happy streaming! 🍿🎬**
