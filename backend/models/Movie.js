import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slugify from 'slugify';

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Server name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Server URL is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K'],
    default: '720p',
  },
  serverType: {
    type: String,
    enum: ['embed', 'direct', 'torrent'],
    default: 'embed',
  },
}, { _id: true });

const downloadLinkSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Download link label is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Download URL is required'],
    trim: true,
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K'],
    default: '720p',
  },
  size: {
    type: String, // e.g., "1.2GB"
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: true });

const downloadGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Download group title is required'],
    trim: true,
  },
  icon: {
    type: String,
    enum: ['quality', 'server'],
    default: 'quality',
  },
  links: [downloadLinkSchema],
}, { _id: true });

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  overview: {
    type: String,
    required: [true, 'Movie overview is required'],
    maxlength: [2000, 'Overview cannot exceed 2000 characters'],
  },
  posterPath: {
    type: String,
    required: [true, 'Poster image is required'],
  },
  backdropPath: {
    type: String,
    default: '',
  },
  trailerUrl: {
    type: String,
    default: '',
  },
  releaseYear: {
    type: Number,
    required: [true, 'Release year is required'],
    min: [1900, 'Release year must be after 1900'],
    max: [new Date().getFullYear() + 5, 'Release year cannot be too far in the future'],
  },
  releaseDate: {
    type: Date,
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
  },
  imdbRating: {
    type: Number,
    default: 0,
    min: [0, 'IMDB rating cannot be less than 0'],
    max: [10, 'IMDB rating cannot be more than 10'],
  },
  genres: [{
    type: String,
    required: true,
    trim: true,
  }],
  type: {
    type: String,
    enum: ['Movie', 'Anime'],
    default: 'Movie',
  },
  quality: {
    type: String,
    enum: ['CAM', 'TS', 'TC', 'WP', 'SCR', 'DVDScr', 'R5', 'DVDRip', 'BDRip', 'HDRip', 'WEBRip', 'WEB-DL', 'BluRay', '4K', 'HD', 'Full HD', 'Pre-DVDRip'],
    default: 'HD',
  },
  status: {
    type: String,
    enum: ['New', 'Updated', 'Featured'],
    default: 'New',
  },
  adminStatus: {
    type: String,
    enum: ['Draft', 'Published', 'Pending', 'Archived'],
    default: 'Draft',
  },
  runtime: {
    type: Number, // in minutes
    default: 0,
  },
  country: {
    type: String,
    default: '',
    trim: true,
  },
  language: [{
    type: String,
    required: true,
    trim: true,
  }],
  director: {
    type: String,
    default: '',
    trim: true,
  },
  cast: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    character: {
      type: String,
      default: '',
      trim: true,
    },
    profile_path: {
      type: String,
      default: '',
    },
  }],
  
  // External IDs
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  imdbId: {
    type: String,
    unique: true,
    sparse: true,
  },
  
  // Media
  screenshots: [{
    type: String,
  }],
  
  // Streaming and Downloads
  servers: [serverSchema],
  downloadGroups: [downloadGroupSchema],
  
  // SEO
  seoTitle: {
    type: String,
    maxlength: [100, 'SEO title cannot exceed 100 characters'],
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters'],
  },
  keywords: [{
    type: String,
    trim: true,
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  
  // Content Management
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
}, {
  timestamps: true,
});

// Indexes for better performance
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ slug: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ type: 1 });
movieSchema.index({ adminStatus: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ tmdbId: 1 });
movieSchema.index({ imdbId: 1 });

// Generate slug before saving
movieSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
      replacement: '-',
    });
    
    // Add release year to slug if it exists
    if (this.releaseYear) {
      this.slug += `-${this.releaseYear}`;
    }
  }
  next();
});

// Virtual for full poster URL
movieSchema.virtual('fullPosterUrl').get(function() {
  if (this.posterPath && this.posterPath.startsWith('http')) {
    return this.posterPath;
  }
  return this.posterPath ? `/uploads/posters/${this.posterPath}` : '';
});

// Virtual for full backdrop URL
movieSchema.virtual('fullBackdropUrl').get(function() {
  if (this.backdropPath && this.backdropPath.startsWith('http')) {
    return this.backdropPath;
  }
  return this.backdropPath ? `/uploads/backdrops/${this.backdropPath}` : '';
});

// Add pagination plugin
movieSchema.plugin(mongoosePaginate);

// Ensure virtuals are included when converting to JSON
movieSchema.set('toJSON', { virtuals: true });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
