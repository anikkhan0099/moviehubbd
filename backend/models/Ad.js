import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const adSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad name is required'],
    trim: true,
    maxlength: [100, 'Ad name cannot exceed 100 characters'],
  },
  type: {
    type: String,
    enum: ['Banner', 'Skyscraper', 'Video', 'Pop-under', 'Direct Link', 'Native', 'Interstitial'],
    required: [true, 'Ad type is required'],
  },
  placement: {
    type: String,
    enum: [
      'Header', 
      'Footer', 
      'Sidebar', 
      'Before Player', 
      'After Player', 
      'In Content', 
      'Pop-under',
      'Mobile Banner',
      'Desktop Banner',
      'Global'
    ],
    required: [true, 'Ad placement is required'],
  },
  code: {
    type: String,
    required: [true, 'Ad code is required'],
  },
  redirectUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
  },
  
  // Targeting Options
  targetPages: [{
    type: String,
    enum: ['homepage', 'detail', 'search', 'category', 'all'],
  }],
  targetDevices: [{
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'all'],
  }],
  targetCountries: [{
    type: String, // Country codes: US, BD, IN, etc.
  }],
  
  // Scheduling
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  
  // Analytics
  impressions: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  
  // Ad Network Info
  network: {
    type: String,
    default: '', // e.g., 'Google AdSense', 'Media.net', etc.
  },
  networkId: {
    type: String,
    default: '',
  },
  
  // Budget and Billing
  budget: {
    type: Number,
    default: 0,
  },
  revenue: {
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
adSchema.index({ type: 1 });
adSchema.index({ placement: 1 });
adSchema.index({ isActive: 1 });
adSchema.index({ priority: -1 });
adSchema.index({ startDate: 1, endDate: 1 });
adSchema.index({ targetPages: 1 });
adSchema.index({ targetDevices: 1 });

// Virtual for click-through rate
adSchema.virtual('ctr').get(function() {
  return this.impressions > 0 ? ((this.clicks / this.impressions) * 100).toFixed(2) : 0;
});

// Method to check if ad is currently active based on date range
adSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const startOk = !this.startDate || this.startDate <= now;
  const endOk = !this.endDate || this.endDate >= now;
  return this.isActive && startOk && endOk;
};

// Method to increment impressions
adSchema.methods.incrementImpressions = async function() {
  this.impressions += 1;
  await this.save({ validateBeforeSave: false });
};

// Method to increment clicks
adSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  await this.save({ validateBeforeSave: false });
};

// Static method to get active ads by placement
adSchema.statics.getActiveAdsByPlacement = function(placement, targetPage = 'all', targetDevice = 'all') {
  const query = {
    placement,
    isActive: true,
    $or: [
      { startDate: { $lte: new Date() } },
      { startDate: { $exists: false } }
    ],
    $and: [
      {
        $or: [
          { endDate: { $gte: new Date() } },
          { endDate: { $exists: false } }
        ]
      }
    ]
  };
  
  // Add targeting filters
  if (targetPage !== 'all') {
    query.$and.push({
      $or: [
        { targetPages: { $in: [targetPage, 'all'] } },
        { targetPages: { $size: 0 } }
      ]
    });
  }
  
  if (targetDevice !== 'all') {
    query.$and.push({
      $or: [
        { targetDevices: { $in: [targetDevice, 'all'] } },
        { targetDevices: { $size: 0 } }
      ]
    });
  }
  
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Add pagination plugin
adSchema.plugin(mongoosePaginate);

// Ensure virtuals are included when converting to JSON
adSchema.set('toJSON', { virtuals: true });

const Ad = mongoose.model('Ad', adSchema);

export default Ad;
