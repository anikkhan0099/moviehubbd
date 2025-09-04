@echo off
echo ===============================================
echo   MovieHubBD Backend Local Setup Script
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    pause
    exit /b 1
)

echo ✓ npm is available
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env .env.backup >nul 2>&1
    echo.
    echo ⚠️  IMPORTANT: You need to configure your .env file!
    echo.
    echo Please edit the .env file and set the following:
    echo - MONGODB_URI: Your MongoDB connection string
    echo - JWT_SECRET: A strong 32+ character secret
    echo - REFRESH_TOKEN_SECRET: Another strong secret
    echo - ADMIN_EMAIL: Your admin email
    echo - ADMIN_PASSWORD: Your admin password
    echo - ADMIN_SECRET_KEY: Your admin secret key
    echo.
    echo Optional but recommended:
    echo - TMDB_API_KEY: Get from https://www.themoviedb.org/settings/api
    echo - Cloudinary settings for image uploads
    echo.
    pause
)

echo.
echo ===============================================
echo   Setup Complete!
echo ===============================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Your API will be available at:
echo   http://localhost:5000
echo.
echo Health check endpoint:
echo   http://localhost:5000/api/health
echo.
echo ===============================================
pause
