import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Product from './models/Product.js';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const uploadImages = async () => {
  await connectDB();
  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const localPath = product.images[0];
      if (localPath.startsWith('/images/')) {
        const fullLocalPath = path.join(process.cwd(), '..', 'frontend', 'public', localPath);
        console.log(`Uploading ${fullLocalPath} ...`);
        try {
          const result = await cloudinary.uploader.upload(fullLocalPath, {
            folder: 'evans_products',
            use_filename: true,
            unique_filename: false,
          });
          console.log(`Uploaded to Cloudinary: ${result.secure_url}`);
          
          product.images = [result.secure_url];
          await product.save();
          console.log(`Updated product ${product.name}`);
        } catch (err) {
          console.error(`Failed to upload ${fullLocalPath}: ${err.message}`);
        }
      } else {
        console.log(`Product ${product.name} already has a non-local URL: ${localPath}`);
      }
    }
  }
  
  console.log('Finished uploading images to Cloudinary and updating MongoDB.');
  process.exit(0);
};

uploadImages();
