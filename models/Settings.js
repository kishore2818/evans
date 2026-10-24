import mongoose from 'mongoose';

const offerItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Festival' }, // 'Pongal', 'Diwali', 'New Year', 'Flash Sale', 'Seasonal', 'Custom'
  badgeText: { type: String, default: 'FESTIVAL SPECIAL' },
  bannerText: { type: String, default: '' },
  discountPercentage: { type: Number, required: true, default: 20 },
  couponCode: { type: String, default: '' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'upcoming', 'expired', 'paused'], default: 'active' },
  assignedScope: { type: String, default: 'All Products' },
  minOrderValue: { type: Number, default: 0 },
  giftPerk: { type: String, default: '' },
  ordersCount: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
  discountGiven: { type: Number, default: 0 },
  unitsSold: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false }
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'store_settings'
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 150
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 2000
  },
  flashSale: {
    isActive: { type: Boolean, default: true },
    title: { type: String, default: 'Evans Luxe Pop Tiger Sale' },
    badgeText: { type: String, default: 'POP TIGER OFFER' },
    bannerText: { type: String, default: '✦ FESTIVE GLOW DAYS: Flat 25% OFF on all organic elixirs + Free Rose Bar on ₹999+' },
    discountPercentage: { type: Number, default: 25 },
    endDate: { type: Date, default: () => new Date(Date.now() + 48 * 3600 * 1000) },
    buttonText: { type: String, default: 'Shop Pop Tiger Deals' },
    linkUrl: { type: String, default: '/products?sale=true' },
    couponCode: { type: String, default: 'TIGER25' },
    minOrderValue: { type: Number, default: 999 },
    giftPerk: { type: String, default: 'Free Rose Bar on ₹999+' },
    showPopup: { type: Boolean, default: true }
  },
  offersHistory: [offerItemSchema]
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
