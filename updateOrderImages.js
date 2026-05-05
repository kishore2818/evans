import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateOrderImages = async () => {
  await connectDB();
  
  const products = await Product.find({});
  const productMap = {};
  for (const p of products) {
    productMap[p._id.toString()] = p.images[0]; // Store the Cloudinary URL
  }
  
  const orders = await Order.find({});
  console.log(`Found ${orders.length} orders`);
  
  let updatedOrdersCount = 0;
  for (const order of orders) {
    let changed = false;
    for (const item of order.items) {
      if (item.product && productMap[item.product.toString()]) {
        if (item.image !== productMap[item.product.toString()]) {
          console.log(`Updating order ${order._id} item ${item.name} image to ${productMap[item.product.toString()]}`);
          item.image = productMap[item.product.toString()];
          changed = true;
        }
      }
    }
    if (changed) {
      await order.save();
      updatedOrdersCount++;
    }
  }
  
  console.log(`Finished updating ${updatedOrdersCount} orders.`);
  process.exit(0);
};

updateOrderImages();
