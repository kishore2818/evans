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
    title: { type: String, default: 'Luxe Summer Glow Sale' },
    bannerText: { type: String, default: '✦ LIMITED TIME FLASH SALE: Up to 40% OFF Signature Botanicals + Free Luxe Pouch on ₹1999+' },
    discountPercentage: { type: Number, default: 25 },
    endDate: { type: Date, default: () => new Date(Date.now() + 48 * 3600 * 1000) },
    buttonText: { type: String, default: 'Shop Flash Deals' },
    linkUrl: { type: String, default: '/products' }
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
