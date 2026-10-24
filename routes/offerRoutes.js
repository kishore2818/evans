import express from 'express';
import Offer from '../models/Offer.js';
import Settings from '../models/Settings.js';
import { protectAdmin } from './authRoutes.js';

const router = express.Router();

const SEED_OFFERS = [
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
    assignedScope: 'Artisan Soaps',
    minOrderValue: 799,
    giftPerk: 'Free Aloe Gel Miniature on ₹799+',
    ordersCount: 210,
    revenueGenerated: 264000,
    discountGiven: 52800,
    unitsSold: 530,
    isLive: false
  }
];

// Helper to seed offers if empty - only check database once at startup
let hasCheckedSeeding = false;
const seedOffersIfEmpty = async () => {
  if (hasCheckedSeeding) return;
  try {
    const count = await Offer.countDocuments();
    if (count === 0) {
      console.log('[OFFERS] Seeding initial festival offers into MongoDB "offers" collection...');
      await Offer.insertMany(SEED_OFFERS);
    }
    hasCheckedSeeding = true;
  } catch (err) {
    console.error('[OFFERS] Seed check error:', err);
  }
};

// @route   GET /api/offers
// @desc    Get all promotional offers from MongoDB collection
// @access  Public
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    await seedOffersIfEmpty();

    const { status, category } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;

    const offers = await Offer.find(filter).sort({ isLive: -1, createdAt: -1 }).lean();
    res.json(offers);
  } catch (error) {
    console.error('[OFFERS] Error fetching offers:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/offers/kpis
// @desc    Aggregated analytics on promotional offers
// @access  Public
router.get('/kpis', async (req, res) => {
  try {
    await seedOffersIfEmpty();

    const stats = await Offer.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenueGenerated' },
          totalOrders: { $sum: '$ordersCount' },
          totalDiscounts: { $sum: '$discountGiven' },
          totalUnits: { $sum: '$unitsSold' },
          avgDiscount: { $avg: '$discountPercentage' }
        }
      }
    ]);

    const activeCount = await Offer.countDocuments({ $or: [{ status: 'active' }, { isLive: true }] });
    const topOffer = await Offer.findOne().sort({ revenueGenerated: -1 });

    const result = {
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalOrders: stats[0]?.totalOrders || 0,
      totalDiscounts: stats[0]?.totalDiscounts || 0,
      totalUnits: stats[0]?.totalUnits || 0,
      avgDiscount: Math.round(stats[0]?.avgDiscount || 25),
      activeCount,
      bestOffer: topOffer ? topOffer.title : 'Pongal Harvest Festival',
      bestOfferRevenue: topOffer ? topOffer.revenueGenerated : 0
    };

    res.json(result);
  } catch (error) {
    console.error('[OFFERS] Error calculating KPIs:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/offers
// @desc    Assign and create a new offer in MongoDB
// @access  Private/Admin
router.post('/', protectAdmin, async (req, res) => {
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

    if (makeLive) {
      // Deactivate live flag on all existing offers
      await Offer.updateMany({}, { isLive: false });
    }

    const offer = await Offer.create({
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
    });

    if (makeLive) {
      // Sync to live store settings
      const settings = await Settings.findOneAndUpdate(
        { key: 'store_settings' },
        {
          $set: {
            flashSale: {
              isActive: true,
              title: offer.title,
              badgeText: offer.badgeText,
              bannerText: offer.bannerText,
              discountPercentage: offer.discountPercentage,
              endDate: offer.endDate,
              buttonText: `Shop ${offer.title} Deals`,
              linkUrl: '/products?sale=true',
              couponCode: offer.couponCode,
              minOrderValue: offer.minOrderValue || 999,
              giftPerk: offer.giftPerk,
              showPopup: true
            }
          }
        },
        { new: true, upsert: true }
      );

      req.io?.emit('flashSaleUpdated', settings.flashSale);
      req.io?.emit('settingsUpdated', settings);
    }

    req.io?.emit('offerCreated', offer);
    res.status(201).json(offer);
  } catch (error) {
    console.error('[OFFERS] Error creating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/offers/:id/activate
// @desc    Instantly make an offer live on the customer storefront
// @access  Private/Admin
router.put('/:id/activate', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Reset all offers live flag
    await Offer.updateMany({}, { isLive: false });

    // Set selected offer as live and active
    const offer = await Offer.findByIdAndUpdate(
      id,
      { isLive: true, status: 'active' },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer record not found in MongoDB' });
    }

    // Sync to store settings flashSale
    const settings = await Settings.findOneAndUpdate(
      { key: 'store_settings' },
      {
        $set: {
          flashSale: {
            isActive: true,
            title: offer.title,
            badgeText: offer.badgeText || 'SPECIAL OFFER',
            bannerText: offer.bannerText || `✦ ${offer.title}: Flat ${offer.discountPercentage}% OFF!`,
            discountPercentage: offer.discountPercentage,
            endDate: offer.endDate > new Date() ? offer.endDate : new Date(Date.now() + 48 * 3600 * 1000),
            buttonText: `Shop ${offer.title} Deals`,
            linkUrl: '/products?sale=true',
            couponCode: offer.couponCode || 'GLOWSALE',
            minOrderValue: offer.minOrderValue || 999,
            giftPerk: offer.giftPerk || '',
            showPopup: true
          }
        }
      },
      { new: true, upsert: true }
    );

    req.io?.emit('flashSaleUpdated', settings.flashSale);
    req.io?.emit('settingsUpdated', settings);
    req.io?.emit('offerUpdated', offer);

    console.log(`[OFFERS] Activated offer "${offer.title}" as live store campaign in MongoDB.`);
    res.json({ message: 'Offer live status synchronized', offer, settings });
  } catch (error) {
    console.error('[OFFERS] Error activating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update offer details in MongoDB
// @access  Private/Admin
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    req.io?.emit('offerUpdated', offer);
    res.json(offer);
  } catch (error) {
    console.error('[OFFERS] Error updating offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   DELETE /api/offers/:id
// @desc    Delete offer from MongoDB
// @access  Private/Admin
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    req.io?.emit('offerDeleted', { id });
    res.json({ message: 'Offer deleted successfully from MongoDB', id });
  } catch (error) {
    console.error('[OFFERS] Error deleting offer:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
