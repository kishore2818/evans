import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentId: {
    type: String, // from Stripe or Razorpay
  },
  paymentMethod: {
    type: String,
    required: true, // e.g., 'card', 'upi', 'netbanking'
  },
  status: {
    type: String,
    enum: ['created', 'success', 'failed'],
    default: 'created',
  },
  amount: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
