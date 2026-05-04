import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect } from './userRoutes.js';

const router = express.Router();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ guestId: req.user._id.toString() }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ guestId: req.user._id.toString(), products: [] });
    }
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
router.post('/toggle', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
       return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ guestId: req.user._id.toString() });

    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        guestId: req.user._id.toString(), 
        products: [productId] 
      });
      return res.status(201).json({ message: 'Added to wishlist', wishlist: wishlist.products });
    }

    const productExists = wishlist.products.includes(productId);

    if (productExists) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
      return res.json({ message: 'Removed from wishlist', wishlist: wishlist.products });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ message: 'Added to wishlist', wishlist: wishlist.products });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
