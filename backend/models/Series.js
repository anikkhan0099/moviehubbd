import mongoose from 'mongoose';
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
    type: String,
    default: '',
  },
}, { _id: true });

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: [true, 'Episode number is required'],
    min: [1, 'Episode number must be at least 1'],
  },
  title: {
    type: String,
    required: [true, 'Episode title is required'],
    trim: true,
    maxlength: [200, 'Episode title cannot exceed 200 characters'],
  },
  overview: {
    type: String,
    default: '',
    maxlength: [1000, 'Episode overview cannot exceed 1000 characters'],
  },
  runtime: {
    type: Number, // in minutes
    default: 0,
  },
  airDate: {
    type: Date,
  },
  stillPath: {
    type: String,
    default: '',
  },
  servers: [serverSchema],
  downloadLinks: [downloadLinkSchema],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
  },
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tmdbId: {
    type: Number,
    sparse: true,
  },
}, {
  timestamps: true,
  _id: true,
});

const seasonSchema = new mongoose.Schema({
  seasonNumber: {
    type: Number,
    required: [true, 'Season number is required'],
    min: [0, 'Season number cannot be negative'], // 0 for specials
  },
  name: {
    type: String,
    default: function() {
      return this.seasonNumber === 0 ? 'Specials' : `Season ${this.seasonNumber}`;
    },
  },
  overview: {
    type: String,
    default: '',
    maxlength: [1000, 'Season overview cannot exceed 1000 characters'],
  },
  posterPath: {
    type: String,
    default: '',
  },
  airDate: {
    type: Date,
  },
  episodes: [episodeSchema],
  tmdbId: {
    type: Number,
    sparse: true,
  },
}, {
  timestamps: true,
  _id: true,
});

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Series title is required'],
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
    required: [true, 'Series overview is required'],
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
  firstAirDate: {
    type: Date,
  },
  lastAirDate: {
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
    enum: ['Series', 'Anime', 'Kdrama'],
    default: 'Series',
  },
  quality: {
    type: String,
    enum: ['HDTV', 'WEBRip', 'WEB-DL', 'BluRay', 'HD', 'Full HD', '4K'],
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
  seriesStatus: {
    type: String,
    enum: ['Returning Series', 'Ended', 'Canceled', 'In Production', 'Planned'],
    default: 'Returning Series',
  },
  numberOfSeasons: {
    type: Number,
    default: 1,
    min: [1, 'Must have at least 1 season'],
  },
  numberOfEpisodes: {
    type: Number,
    default: 0,
  },
  episodeRunTime: [{
    type: Number, // average runtime in minutes
  }],
  country: {
    type: String,
    default: '',
    trim: true,
  },
  originalCountry: [{
    type: String,
    trim: true,
  }],
  language: [{
    type: String,
    required: true,
    trim: true,
  }],
  originalLanguage: {
    type: String,
    default: 'en',
    trim: true,
  },
  networks: [{
    name: {
      type: String,
      required: true,
    },
    logoPath: {
      type: String,
      default: '',
    },
  }],
  creators: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profile_path: {
      type: String,
      default: '',
    },
  }],
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
  tvdbId: {
    type: Number,
    sparse: true,
  },
  
  // Media
  screenshots: [{
    type: String,
  }],
  
  // Seasons and Episodes
  seasons: [seasonSchema],
  
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
seriesSchema.index({ title: 'text', overview: 'text' });
seriesSchema.index({ slug: 1 });
seriesSchema.index({ genres: 1 });
seriesSchema.index({ type: 1 });
seriesSchema.index({ adminStatus: 1 });
seriesSchema.index({ releaseYear: -1 });
seriesSchema.index({ rating: -1 });
seriesSchema.index({ createdAt: -1 });
seriesSchema.index({ tmdbId: 1 });
seriesSchema.index({ imdbId: 1 });
seriesSchema.index({ 'seasons.episodes._id': 1 });

// Generate slug before saving
seriesSchema.pre('save', function(next) {
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
  
  // Update numberOfEpisodes count
  let totalEpisodes = 0;
  this.seasons.forEach(season => {
    totalEpisodes += season.episodes.length;
  });
  this.numberOfEpisodes = totalEpisodes;
  this.numberOfSeasons = this.seasons.length;
  
  next();
});

// Virtual for full poster URL
seriesSchema.virtual('fullPosterUrl').get(function() {
  if (this.posterPath && this.posterPath.startsWith('http')) {
    return this.posterPath;
  }
  return this.posterPath ? `/uploads/posters/${this.posterPath}` : '';
});

// Virtual for full backdrop URL
seriesSchema.virtual('fullBackdropUrl').get(function() {
  if (this.backdropPath && this.backdropPath.startsWith('http')) {
    return this.backdropPath;
  }
  return this.backdropPath ? `/uploads/backdrops/${this.backdropPath}` : '';
});

// Method to get episode by season and episode number
seriesSchema.methods.getEpisode = function(seasonNumber, episodeNumber) {
  const season = this.seasons.find(s => s.seasonNumber === seasonNumber);
  if (!season) return null;
  return season.episodes.find(e => e.episodeNumber === episodeNumber);
};

// Method to add episode to specific season
seriesSchema.methods.addEpisode = function(seasonNumber, episodeData) {
  let season = this.seasons.find(s => s.seasonNumber === seasonNumber);
  if (!season) {
    // Create new season if it doesn't exist
    season = {
      seasonNumber,
      name: seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`,
      episodes: []
    };
    this.seasons.push(season);
  }
  season.episodes.push(episodeData);
  return this.save();
};

// Ensure virtuals are included when converting to JSON
seriesSchema.set('toJSON', { virtuals: true });

const Series = mongoose.model('Series', seriesSchema);

export default Series;
