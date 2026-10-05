import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  benefits: [{
    type: String
  }],
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [
    {
      type: String, // URLs of images
    }
  ],
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  shades: [
    {
      name: { type: String, default: '' },
      hex: { type: String, default: '#E0A899' },
      image: { type: String, default: '' },
      stock: { type: Number, default: 0 }
    }
  ],
  cleanBadges: [{
    type: String
  }],
  ingredients: [
    {
      name: { type: String },
      percentage: { type: String },
      benefit: { type: String },
      description: { type: String }
    }
  ],
  fullIngredientsList: {
    type: String,
    default: ''
  },
  skinTypes: [{
    type: String
  }],
  skinConcerns: [{
    type: String
  }],
  beforeAfter: {
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    timeframe: { type: String, default: '4 Weeks' },
    resultPercentage: { type: String, default: '94%' },
    resultText: { type: String, default: 'Reported noticeably smoother and brighter skin' }
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  flashSale: {
    isActive: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    endDate: { type: Date },
    bannerText: { type: String, default: 'Limited Time Flash Sale' }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    }
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Indexes for common product queries
productSchema.index({ isActive: 1, createdAt: -1 });   // Main listing: active products, newest first
productSchema.index({ isActive: 1, category: 1 });      // Category filter on active products
productSchema.index({ isActive: 1, price: 1 });         // Price sort on active products
productSchema.index({ isActive: 1, 'ratings.average': -1 }); // Best rated
productSchema.index({ isActive: 1, soldCount: -1 });    // Best selling
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
const Product = mongoose.model('Product', productSchema);

export default Product;
