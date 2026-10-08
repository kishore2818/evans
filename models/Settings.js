import mongoose from 'mongoose';

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
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
