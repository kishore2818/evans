import express from 'express';
import Settings from '../models/Settings.js';
import { protectAdmin } from '../routes/authRoutes.js';

const router = express.Router();

const DEFAULT_OFFERS_HISTORY = [
  {
    title: '🌾 Pongal Harvest Glow Festival',
    category: 'Pongal',
    badgeText: 'PONGAL SPECIAL',
    bannerText: '✦ PONGAL HARVEST CELEBRATION: Flat 30% OFF on Traditional Ayurvedic Skincare + Free Chandan Glow Soap on ₹999+',
    discountPercentage: 30,
    couponCode: 'PONGAL30',
    startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    status: 'active',
    assignedScope: 'All Products',
    minOrderValue: 999,
    giftPerk: 'Free Chandan Soap on ₹999+',
    ordersCount: 142,
    revenueGenerated: 218500,
    discountGiven: 65550,
    unitsSold: 320,
    isLive: true
  },
  {
    title: '🪔 Diwali Royal Glow Dhamaka',
    category: 'Diwali',
    badgeText: 'DIWALI DHAMAKA',
    bannerText: '✦ DIWALI SPECIAL: Flat 35% OFF on 24Kt Gold Elixirs & Radiance Serums + Brass Diya Gift Set',
    discountPercentage: 35,
    couponCode: 'DIWALI35',
    startDate: new Date(Date.now() - 40 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() - 33 * 24 * 3600 * 1000),
    status: 'expired',
    assignedScope: '24Kt Gold Serums & Creams',
    minOrderValue: 1299,
    giftPerk: 'Free Brass Diya & Rose Oil on ₹1299+',
    ordersCount: 388,
    revenueGenerated: 582400,
    discountGiven: 203840,
    unitsSold: 940,
    isLive: false
  },
  {
    title: '🎆 New Year 2026 Radiance Gala',
    category: 'New Year',
    badgeText: 'NEW YEAR OFFER',
    bannerText: '✦ WELCOME 2026: Flat 25% OFF on Anti-aging Elixirs + Free Rose Bar Soap on all prepaid orders',
    discountPercentage: 25,
    couponCode: 'NEWYEAR25',
    startDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 3600 * 1000),
    status: 'upcoming',
    assignedScope: 'Radiance Serums',
    minOrderValue: 899,
    giftPerk: 'Free Rose Bar Soap on ₹899+',
    ordersCount: 0,
    revenueGenerated: 0,
    discountGiven: 0,
    unitsSold: 0,
    isLive: false
  },
  {
    title: '🐯 Pop Tiger Festive Rush',
    category: 'Flash Sale',
    badgeText: 'POP TIGER OFFER',
    bannerText: '✦ POP TIGER EXCLUSIVE: Flat 25% OFF on all organic formulations + Free Mini Glow Mask',
    discountPercentage: 25,
    couponCode: 'TIGER25',
    startDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() - 13 * 24 * 3600 * 1000),
    status: 'expired',
    assignedScope: 'All Products',
    minOrderValue: 999,
    giftPerk: 'Free Rose Bar on ₹999+',
    ordersCount: 96,
    revenueGenerated: 148200,
    discountGiven: 37050,
    unitsSold: 215,
    isLive: false
  },
  {
    title: '☀️ Summer Radiance & Hydration',
    category: 'Seasonal',
    badgeText: 'SUMMER RADIANCE',
    bannerText: '✦ SUMMER GLOW: Flat 20% OFF on Aloe Vera & Hydrating Artisan Soaps',
    discountPercentage: 20,
    couponCode: 'SUMMER20',
    startDate: new Date(Date.now() - 75 * 24 * 3600 * 1000),
    endDate: new Date(Date.now() - 68 * 24 * 3600 * 1000),
    status: 'expired',
    assignedScope: 'Artisan Soaps & Gels',
    minOrderValue: 799,
    giftPerk: 'Free Aloe Gel Miniature on ₹799+',
    ordersCount: 210,
    revenueGenerated: 264000,
    discountGiven: 52800,
    unitsSold: 530,
    isLive: false
  }
];

// @route   GET /api/settings
// @desc    Get store settings with offersHistory initialized
// @access  Public
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    let settings = await Settings.findOne({ key: 'store_settings' }).lean();
    if (!settings) {
      settings = await Settings.create({
        key: 'store_settings',
        shippingFee: 150,
        freeShippingThreshold: 2000,
        offersHistory: DEFAULT_OFFERS_HISTORY
      });
    } else if (!settings.offersHistory || settings.offersHistory.length === 0) {
      settings.offersHistory = DEFAULT_OFFERS_HISTORY;
      await Settings.updateOne({ key: 'store_settings' }, { $set: { offersHistory: DEFAULT_OFFERS_HISTORY } });
    }
    res.json(settings);
  } catch (error) {
    console.error('[SETTINGS] Error fetching:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings (shipping, flash sale)
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
    
    // Broadcast live settings change
    req.io?.emit('settingsUpdated', settings);
    req.io?.emit('store_settings_update', settings);
    if (settings.flashSale) {
      req.io?.emit('flashSaleUpdated', settings.flashSale);
    }

    console.log('[SETTINGS] Updated & Broadcasted:', settings.flashSale);
    res.json(settings);
  } catch (error) {
    console.error('[SETTINGS] Error updating:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/settings/offers
// @desc    Assign / Create a new offer in offersHistory
// @access  Private/Admin
router.post('/offers', protectAdmin, async (req, res) => {
  try {
    const {
      title,
      category,
      badgeText,
      bannerText,
      discountPercentage,
      couponCode,
      startDate,
      endDate,
      assignedScope,
      minOrderValue,
      giftPerk,
      makeLive
    } = req.body;

    if (!title || !discountPercentage || !endDate) {
      return res.status(400).json({ message: 'Title, discount percentage, and end date are required' });
    }

    let settings = await Settings.findOne({ key: 'store_settings' });
    if (!settings) {
      settings = new Settings({ key: 'store_settings' });
    }

    const newOffer = {
      title,
      category: category || 'Festival',
      badgeText: badgeText || `${(category || 'FESTIVAL').toUpperCase()} SPECIAL`,
      bannerText: bannerText || `✦ ${title.toUpperCase()}: Flat ${discountPercentage}% OFF + ${giftPerk || 'Gift Perk'}!`,
      discountPercentage: Number(discountPercentage),
      couponCode: (couponCode || '').toUpperCase().trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      status: 'active',
      assignedScope: assignedScope || 'All Products',
      minOrderValue: Number(minOrderValue) || 0,
      giftPerk: giftPerk || '',
      ordersCount: 0,
      revenueGenerated: 0,
      discountGiven: 0,
      unitsSold: 0,
      isLive: Boolean(makeLive)
    };

    if (makeLive) {
      // Deactivate any other live flags
      settings.offersHistory.forEach(o => { o.isLive = false; });
      // Apply to store flashSale
      settings.flashSale = {
        isActive: true,
        title: newOffer.title,
        badgeText: newOffer.badgeText,
        bannerText: newOffer.bannerText,
        discountPercentage: newOffer.discountPercentage,
        endDate: newOffer.endDate,
        buttonText: `Shop ${newOffer.title} Deals`,
        linkUrl: '/products?sale=true',
        couponCode: newOffer.couponCode,
        minOrderValue: newOffer.minOrderValue || 999,
        giftPerk: newOffer.giftPerk,
        showPopup: true
      };
    }

    settings.offersHistory.unshift(newOffer);
    await settings.save();

    req.io?.emit('settingsUpdated', settings);
    if (makeLive) {
      req.io?.emit('flashSaleUpdated', settings.flashSale);
    }

    res.status(201).json(settings);
  } catch (error) {
    console.error('[OFFERS] Error creating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/settings/offers/:id/activate
// @desc    Instantly activate an offer from history to make it live
// @access  Private/Admin
router.put('/offers/:id/activate', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let settings = await Settings.findOne({ key: 'store_settings' });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const targetOffer = settings.offersHistory.id(id);
    if (!targetOffer) return res.status(404).json({ message: 'Offer not found in history' });

    // Mark all as non-live, and target as live
    settings.offersHistory.forEach(o => {
      o.isLive = (o._id.toString() === id);
      if (o._id.toString() === id) {
        o.status = 'active';
      }
    });

    // Update store flashSale
    settings.flashSale = {
      isActive: true,
      title: targetOffer.title,
      badgeText: targetOffer.badgeText || 'SPECIAL OFFER',
      bannerText: targetOffer.bannerText || `✦ ${targetOffer.title}: Flat ${targetOffer.discountPercentage}% OFF!`,
      discountPercentage: targetOffer.discountPercentage,
      endDate: targetOffer.endDate > new Date() ? targetOffer.endDate : new Date(Date.now() + 48 * 3600 * 1000),
      buttonText: `Shop ${targetOffer.title} Deals`,
      linkUrl: '/products?sale=true',
      couponCode: targetOffer.couponCode || 'GLOWSALE',
      minOrderValue: targetOffer.minOrderValue || 999,
      giftPerk: targetOffer.giftPerk || '',
      showPopup: true
    };

    await settings.save();

    req.io?.emit('settingsUpdated', settings);
    req.io?.emit('flashSaleUpdated', settings.flashSale);

    console.log(`[OFFERS] Activated offer ${targetOffer.title} as live store campaign.`);
    res.json(settings);
  } catch (error) {
    console.error('[OFFERS] Error activating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/settings/offers/:id
// @desc    Update an offer in offersHistory
// @access  Private/Admin
router.put('/offers/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let settings = await Settings.findOne({ key: 'store_settings' });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const targetOffer = settings.offersHistory.id(id);
    if (!targetOffer) return res.status(404).json({ message: 'Offer not found' });

    Object.assign(targetOffer, req.body);
    await settings.save();

    req.io?.emit('settingsUpdated', settings);
    res.json(settings);
  } catch (error) {
    console.error('[OFFERS] Error updating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   DELETE /api/settings/offers/:id
// @desc    Remove an offer from history
// @access  Private/Admin
router.delete('/offers/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let settings = await Settings.findOne({ key: 'store_settings' });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    settings.offersHistory.pull(id);
    await settings.save();

    req.io?.emit('settingsUpdated', settings);
    res.json(settings);
  } catch (error) {
    console.error('[OFFERS] Error deleting offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
