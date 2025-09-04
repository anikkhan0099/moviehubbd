import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { generateRandomString } from '../utils/helpers.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(this.uploadsDir, 'temp');
    
    this.initDirectories();
  }

  async initDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'posters'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'backdrops'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'profiles'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'thumbnails'), { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  // Validate file
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return errors;
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Only JPEG, JPG, PNG, and WebP images are allowed');
    }

    return errors;
  }

  // Process image with Sharp
  async processImage(buffer, options = {}) {
    try {
      const {
        width = null,
        height = null,
        quality = 85,
        format = 'jpeg',
        fit = 'cover',
        background = { r: 255, g: 255, b: 255, alpha: 1 }
      } = options;

      let sharpInstance = sharp(buffer);

      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          fit: fit,
          background: background
        });
      }

      // Convert format and set quality
      switch (format) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      return await sharpInstance.toBuffer();

    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(buffer, options = {}) {
    try {
      const {
        folder = 'moviehubbd',
        fileName = generateRandomString(16),
        transformation = []
      } = options;

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: fileName,
            transformation,
            overwrite: true,
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(buffer);
      });

    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Save file locally
  async saveLocally(buffer, folder, fileName) {
    try {
      const filePath = path.join(this.uploadsDir, folder, fileName);
      await fs.writeFile(filePath, buffer);
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      throw new Error(`Local save failed: ${error.message}`);
    }
  }

  // Upload poster image
  async uploadPoster(file) {
    try {
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const fileName = `poster_${Date.now()}_${generateRandomString(8)}`;
      
      // Process image for poster (400x600)
      const processedBuffer = await this.processImage(file.buffer, {
        width: 400,
        height: 600,
        quality: 90,
        format: 'jpeg'
      });

      let posterUrl;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const result = await this.uploadToCloudinary(processedBuffer, {
          folder: 'moviehubbd/posters',
          fileName: fileName,
          transformation: [
            { width: 400, height: 600, crop: 'fill', quality: 'auto:good' }
          ]
        });
        posterUrl = result.secure_url;
      } else {
        // Save locally
        posterUrl = await this.saveLocally(processedBuffer, 'posters', `${fileName}.jpg`);
      }

      return {
        url: posterUrl,
        fileName: fileName,
        size: processedBuffer.length,
        dimensions: { width: 400, height: 600 }
      };

    } catch (error) {
      throw new Error(`Poster upload failed: ${error.message}`);
    }
  }

  // Upload backdrop image
  async uploadBackdrop(file) {
    try {
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const fileName = `backdrop_${Date.now()}_${generateRandomString(8)}`;
      
      // Process image for backdrop (1280x720)
      const processedBuffer = await this.processImage(file.buffer, {
        width: 1280,
        height: 720,
        quality: 85,
        format: 'jpeg'
      });

      let backdropUrl;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const result = await this.uploadToCloudinary(processedBuffer, {
          folder: 'moviehubbd/backdrops',
          fileName: fileName,
          transformation: [
            { width: 1280, height: 720, crop: 'fill', quality: 'auto:good' }
          ]
        });
        backdropUrl = result.secure_url;
      } else {
        // Save locally
        backdropUrl = await this.saveLocally(processedBuffer, 'backdrops', `${fileName}.jpg`);
      }

      return {
        url: backdropUrl,
        fileName: fileName,
        size: processedBuffer.length,
        dimensions: { width: 1280, height: 720 }
      };

    } catch (error) {
      throw new Error(`Backdrop upload failed: ${error.message}`);
    }
  }

  // Upload profile image
  async uploadProfile(file) {
    try {
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const fileName = `profile_${Date.now()}_${generateRandomString(8)}`;
      
      // Process image for profile (200x200)
      const processedBuffer = await this.processImage(file.buffer, {
        width: 200,
        height: 200,
        quality: 90,
        format: 'jpeg',
        fit: 'cover'
      });

      let profileUrl;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const result = await this.uploadToCloudinary(processedBuffer, {
          folder: 'moviehubbd/profiles',
          fileName: fileName,
          transformation: [
            { width: 200, height: 200, crop: 'thumb', gravity: 'face', quality: 'auto:good' }
          ]
        });
        profileUrl = result.secure_url;
      } else {
        // Save locally
        profileUrl = await this.saveLocally(processedBuffer, 'profiles', `${fileName}.jpg`);
      }

      return {
        url: profileUrl,
        fileName: fileName,
        size: processedBuffer.length,
        dimensions: { width: 200, height: 200 }
      };

    } catch (error) {
      throw new Error(`Profile upload failed: ${error.message}`);
    }
  }

  // Upload general image
  async uploadImage(file, options = {}) {
    try {
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const {
        folder = 'general',
        width = null,
        height = null,
        quality = 85,
        prefix = 'img'
      } = options;

      const fileName = `${prefix}_${Date.now()}_${generateRandomString(8)}`;
      
      // Process image
      const processedBuffer = await this.processImage(file.buffer, {
        width,
        height,
        quality,
        format: 'jpeg'
      });

      let imageUrl;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Upload to Cloudinary
        const transformations = [];
        if (width || height) {
          transformations.push({
            width: width || undefined,
            height: height || undefined,
            crop: 'fill',
            quality: 'auto:good'
          });
        }

        const result = await this.uploadToCloudinary(processedBuffer, {
          folder: `moviehubbd/${folder}`,
          fileName: fileName,
          transformation: transformations
        });
        imageUrl = result.secure_url;
      } else {
        // Save locally
        imageUrl = await this.saveLocally(processedBuffer, folder, `${fileName}.jpg`);
      }

      return {
        url: imageUrl,
        fileName: fileName,
        size: processedBuffer.length,
        dimensions: width && height ? { width, height } : null
      };

    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  async deleteFromCloudinary(publicId) {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return { result: 'not_configured' };
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  // Delete file locally
  async deleteLocally(filePath) {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      await fs.unlink(fullPath);
      return { result: 'ok' };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { result: 'not_found' };
      }
      throw new Error(`Local delete failed: ${error.message}`);
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: filePath
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  // Cleanup temp files
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Cleanup temp files error:', error);
    }
  }
}

export default new UploadService();
