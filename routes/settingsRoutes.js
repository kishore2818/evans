import express from 'express';
import Settings from '../models/Settings.js';
import { protectAdmin } from '../routes/authRoutes.js'; // Assuming authRoutes exports protectAdmin or I can recreate it

const router = express.Router();

// @route   GET /api/settings
// @desc    Get store settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'store_settings' });
    if (!settings) {
      // Create default if not exists
      settings = await Settings.create({ key: 'store_settings', shippingFee: 150, freeShippingThreshold: 2000 });
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings
// @access  Private/Admin
router.put('/', protectAdmin, async (req, res) => {
  try {
    const { shippingFee, freeShippingThreshold, flashSale } = req.body;

    const updateFields = {};
    if (shippingFee !== undefined) updateFields.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined) updateFields.freeShippingThreshold = Number(freeShippingThreshold);
    
    if (flashSale !== undefined) {
      updateFields.flashSale = {
        isActive: Boolean(flashSale.isActive),
        title: flashSale.title || 'Evans Luxe Pop Tiger Sale',
        badgeText: flashSale.badgeText || 'POP TIGER OFFER',
        bannerText: flashSale.bannerText || '',
        discountPercentage: Number(flashSale.discountPercentage) || 0,
        endDate: flashSale.endDate ? new Date(flashSale.endDate) : new Date(Date.now() + 48 * 3600 * 1000),
        buttonText: flashSale.buttonText || 'Shop Pop Tiger Deals',
        linkUrl: flashSale.linkUrl || '/products?sale=true',
        couponCode: flashSale.couponCode || 'TIGER25',
        minOrderValue: Number(flashSale.minOrderValue) || 999,
        giftPerk: flashSale.giftPerk || 'Free Rose Bar on ₹999+',
        showPopup: flashSale.showPopup !== undefined ? Boolean(flashSale.showPopup) : true
      };
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'store_settings' },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );
    
    // Broadcast live settings change to all frontends & admin panels
    req.io?.emit('settingsUpdated', settings);
    req.io?.emit('store_settings_update', settings);
    req.io?.emit('flashSaleUpdated', settings.flashSale);

    console.log('[SETTINGS] Updated & Broadcasted:', settings.flashSale);

    res.json(settings);
  } catch (error) {
    console.error('[SETTINGS] Error updating:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
