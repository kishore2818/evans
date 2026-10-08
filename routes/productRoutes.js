import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protectAdmin } from './authRoutes.js';
import { protect } from './userRoutes.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Fetch all active products (For User View)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product
      .find({ isActive: true })
      .select('-reviews')
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Fetch ALL products including hidden (For Admin View)
// @route   GET /api/products/admin
// @access  Private (Admin)
router.get('/admin', protectAdmin, async (req, res) => {
  try {
    const products = await Product
      .find({})
      .select('-reviews')
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Don't show inactive products to regular users unless they are admin
      if (!product.isActive && !req.query.admin) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private (Admin)
router.post('/', protectAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, price, discountPercentage, description, category, brand, stock, isActive, benefits,
      shades, cleanBadges, ingredients, fullIngredientsList, skinTypes, skinConcerns, beforeAfter, lowStockThreshold, flashSale
    } = req.body;

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const parseJSON = (field, defaultVal) => {
      if (!field) return defaultVal;
      if (typeof field === 'string') {
        try { return JSON.parse(field); } catch (e) { return defaultVal; }
      }
      return field;
    };

    const product = new Product({
      name,
      price,
      discountPercentage,
      description,
      category,
      brand,
      stock,
      isActive,
      benefits: parseJSON(benefits, []),
      shades: parseJSON(shades, []),
      cleanBadges: parseJSON(cleanBadges, []),
      ingredients: parseJSON(ingredients, []),
      fullIngredientsList: fullIngredientsList || '',
      skinTypes: parseJSON(skinTypes, []),
      skinConcerns: parseJSON(skinConcerns, []),
      beforeAfter: parseJSON(beforeAfter, {
        beforeImage: '',
        afterImage: '',
        timeframe: '4 Weeks',
        resultPercentage: '94%',
        resultText: 'Noticeably smoother and brighter skin'
      }),
      lowStockThreshold: Number(lowStockThreshold) || 10,
      flashSale: parseJSON(flashSale, { isActive: false, discountPercentage: 0 }),
      images: imageUrls
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private (Admin)
router.put('/:id', protectAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, price, discountPercentage, description, isActive, category, brand, stock, benefits,
      shades, cleanBadges, ingredients, fullIngredientsList, skinTypes, skinConcerns, beforeAfter, lowStockThreshold, flashSale
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : product.discountPercentage;
      product.description = description || product.description;
      product.isActive = isActive !== undefined ? isActive : product.isActive;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.stock = stock !== undefined ? Number(stock) : product.stock;
      if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

      const parseJSON = (field, defaultVal) => {
        if (field === undefined) return undefined;
        if (typeof field === 'string') {
          try { return JSON.parse(field); } catch (e) { return defaultVal; }
        }
        return field;
      };

      if (benefits !== undefined) product.benefits = parseJSON(benefits, product.benefits);
      if (shades !== undefined) product.shades = parseJSON(shades, product.shades);
      if (cleanBadges !== undefined) product.cleanBadges = parseJSON(cleanBadges, product.cleanBadges);
      if (ingredients !== undefined) product.ingredients = parseJSON(ingredients, product.ingredients);
      if (fullIngredientsList !== undefined) product.fullIngredientsList = fullIngredientsList;
      if (skinTypes !== undefined) product.skinTypes = parseJSON(skinTypes, product.skinTypes);
      if (skinConcerns !== undefined) product.skinConcerns = parseJSON(skinConcerns, product.skinConcerns);
      if (beforeAfter !== undefined) product.beforeAfter = parseJSON(beforeAfter, product.beforeAfter);
      if (flashSale !== undefined) product.flashSale = parseJSON(flashSale, product.flashSale);

      const newUploadedUrls = (req.files && req.files.length > 0) ? req.files.map(file => file.path) : [];

      if (req.body.existingImages !== undefined) {
        let keptImages = [];
        if (typeof req.body.existingImages === 'string') {
          try {
            const parsed = JSON.parse(req.body.existingImages);
            keptImages = Array.isArray(parsed) ? parsed : (req.body.existingImages ? [req.body.existingImages] : []);
          } catch {
            keptImages = req.body.existingImages ? [req.body.existingImages] : [];
          }
        } else if (Array.isArray(req.body.existingImages)) {
          keptImages = req.body.existingImages;
        }

        // Combine retained existing image URLs with newly uploaded image files
        product.images = [...keptImages, ...newUploadedUrls];
      } else if (newUploadedUrls.length > 0) {
        product.images = newUploadedUrls;
      }

      const updatedProduct = await product.save();
      
      // Emit real-time product update to all connected clients
      req.io?.emit('productUpdated', updatedProduct);
      req.io?.emit('product_update', updatedProduct);
      req.io?.emit('products_updated', updatedProduct);

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});
// @desc    Create new review or update existing
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment, name } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        // Update existing review
        alreadyReviewed.rating = Number(rating);
        alreadyReviewed.comment = comment;
      } else {
        // Add new review
        const review = {
          name: name || req.user.username,
          rating: Number(rating),
          comment,
          user: req.user._id,
        };
        product.reviews.push(review);
      }

      product.ratings.count = product.reviews.length;
      product.ratings.average =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added/updated successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
