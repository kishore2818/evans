import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true, // One wishlist per guestId
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
