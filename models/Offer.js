import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'Festival',
    enum: ['Pongal', 'Diwali', 'New Year', 'Flash Sale', 'Seasonal', 'Festival', 'Custom']
  },
  badgeText: {
    type: String,
    default: 'FESTIVAL SPECIAL'
  },
  bannerText: {
    type: String,
    default: ''
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 90,
    default: 20
  },
  couponCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'upcoming', 'expired', 'paused'],
    default: 'active'
  },
  assignedScope: {
    type: String,
    default: 'All Products'
  },
  assignedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  minOrderValue: {
    type: Number,
    default: 0
  },
  giftPerk: {
    type: String,
    default: ''
  },
  ordersCount: {
    type: Number,
    default: 0
  },
  revenueGenerated: {
    type: Number,
    default: 0
  },
  discountGiven: {
    type: Number,
    default: 0
  },
  unitsSold: {
    type: Number,
    default: 0
  },
  isLive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for fast query performance
offerSchema.index({ status: 1 });
offerSchema.index({ isLive: 1 });
offerSchema.index({ couponCode: 1 });
offerSchema.index({ createdAt: -1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
