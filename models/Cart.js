import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  }
}, { _id: false }); // Prevents mongoose from generating individual ObjectIds for each item in the array

const cartSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
    unique: true, // One cart per guestId
  },
  items: [cartItemSchema],
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
