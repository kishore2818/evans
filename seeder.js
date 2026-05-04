import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import Admin from './models/Admin.js';

dotenv.config();

connectDB();

const products = [
  {
    name: "Musky Forest Solid Perfume",
    category: "Solid Perfume",
    price: 499.00, // You can adjust this price in the Admin Dashboard!
    discountPercentage: 0,
    ratings: { average: 5.0, count: 12 },
    images: ["/images/musky_forest.jpg"], // Ensure the image is saved here
    description: "A concentrated blend of nature's finest butters and waxes that hydrates your skin while enveloping you in a deep, earthy forest aroma. Alcohol-free, travel-safe, and long-lasting.",
    benefits: [
      "Deep moisturization with natural oils and butters",
      "Gentle & alcohol-free for sensitive skin",
      "Smooth, velvety application via natural waxes",
      "Leak-proof, TSA-friendly & zero-waste packaging"
    ],
    isActive: true
  },
  {
    name: "Herbal Body Wax Powder",
    category: "Body Care",
    price: 349.00,
    discountPercentage: 0,
    ratings: { average: 4.8, count: 35 },
    images: ["/images/herbal_wax_powder.jpg"],
    description: "A traditional Indian skincare blend combining physical exfoliants and deep-cleansing clays. This dual-action powder gently removes unwanted hair while exfoliating dead cells to improve skin texture.",
    benefits: [
      "Dual-action: removes unwanted hair & dead skin cells",
      "Deep-cleansing with natural exfoliating clays",
      "Improves overall skin texture without harsh chemicals",
      "Painless hair removal alternative for legs and hands"
    ],
    isActive: true
  },
  {
    name: "Skin Polishing Soap",
    category: "Soaps",
    price: 249.00,
    discountPercentage: 0,
    ratings: { average: 4.9, count: 68 },
    images: ["/images/skin_polishing_soap.jpg"],
    description: "A luxurious skin-polishing soap crafted with nourishing goat milk and titanium dioxide. Gently exfoliates, deeply moisturizes, and provides an immediate brightening effect while repairing damaged skin tissue.",
    benefits: [
      "Intense brightening & glow via mineral-based Titanium Dioxide",
      "Gentle exfoliation with natural Lactic Acid from goat milk",
      "Repairs damaged skin tissue and fine lines with Vitamin A",
      "Deep moisturization suitable for daily use"
    ],
    isActive: true
  },

  {
    name: "Frizz Control Keratin Conditioner",
    category: "Conditioner",
    price: 399.00,
    discountPercentage: 0,
    ratings: { average: 4.9, count: 98 },
    images: ["/images/keratin_hair_care.jpg"],
    description: "A deep-conditioning keratin treatment that creates a protective barrier against humidity. Smoothes the cuticle layer for a glossy, salon-fresh appearance while drastically reducing tangles.",
    benefits: [
      "Dramatically improves manageability and reduces knots",
      "Superior frizz control against environmental humidity",
      "Restores glossy, salon-fresh shine and smoothness"
    ],
    isActive: true
  },

  {
    name: "Chandan Glow Night Repair Cream",
    category: "Face Cream",
    price: 449.00,
    discountPercentage: 0,
    ratings: { average: 4.9, count: 56 },
    images: ["/images/chandan_glow_night_cream.jpg"],
    description: "An overnight restorative cream infused with Sandalwood and Almond Oil that works with your skin's natural regeneration cycle to deeply hydrate, tighten pores, and even out your complexion while you sleep.",
    benefits: [
      "Brightening & Evening Tone: Reduces dark spots, sun tan, and hyperpigmentation",
      "Anti-Aging: Rich in antioxidants to improve elasticity and prevent fine lines",
      "Deep Hydration & Scar Repair: Speeds up cell regeneration to fade acne scars",
      "Under-Eye Care: Reduces puffiness and lightens dark circles"
    ],
    isActive: true
  },
  {
    name: "Detox Charcoal Scrub",
    category: "Face Scrub",
    price: 299.00,
    discountPercentage: 0,
    ratings: { average: 4.7, count: 82 },
    images: ["/images/detox_charcoal_scrub.jpg"],
    description: "An intensive physical exfoliant formulated with detoxifying charcoal and natural granules. It draws out impurities, absorbs excess oil, and leaves your skin looking vibrant and glowing.",
    benefits: [
      "Deep pore detoxification and targeted oil control",
      "Physical exfoliation to gently remove dead skin cells",
      "Prevents acne and blackheads, especially in the T-Zone",
      "Enhances circulation for a vibrant, glowy complexion"
    ],
    isActive: true
  },
  {
    name: "Miracle Rosemary Hair Oil",
    category: "Hair Oil",
    price: 449.00,
    discountPercentage: 0,
    ratings: { average: 5.0, count: 145 },
    images: ["/images/rosemary_hair_oil.jpg"],
    description: "A powerhouse 'Miracle Oil' blending traditional Tamil wisdom with modern aromatherapeutic benefits. Clinically proven to aid hair regrowth similarly to minoxidil while deeply nourishing roots and preventing premature greying.",
    benefits: [
      "Clinically proven to aid dramatic hair regrowth",
      "Reverses premature greying and deep-nourishes hair roots",
      "Rich in beta-carotene and proteins to strengthen the hair shaft",
      "Prevents scalp infections, banishes dandruff, and adds natural shine"
    ],
    isActive: true
  },
  {
    name: "Pure Aloevera Gel",
    category: "Body Care",
    price: 199.00,
    discountPercentage: 0,
    ratings: { average: 4.8, count: 210 },
    images: ["/images/aloevera_gel.jpg"],
    description: "A pure, lightweight aloe vera gel that deeply hydrates and soothes the skin. Its natural anti-inflammatory and cooling properties make it perfect for reducing redness, healing blemishes, and comforting sun-exposed skin.",
    benefits: [
      "Soothes and deeply hydrates with a lightweight, non-greasy finish",
      "Reduces visible redness and immediately calms irritated skin",
      "Cools sunburn and accelerates the healing of minor blemishes",
      "Universally suitable for all skin types, including sensitive and oily skin"
    ],
    isActive: true
  },
  {
    name: "Pure Saffron Face Wash",
    category: "Face Wash",
    price: 249.00,
    discountPercentage: 0,
    ratings: { average: 4.9, count: 184 },
    images: ["/images/saffron_face_wash.jpg"],
    description: "A brightening facial cleanser infused with pure saffron extracts. Formulated to combat UV damage and hyperpigmentation, this antibacterial gel mildly exfoliates to reveal a radiant, even, and silky-smooth complexion.",
    benefits: [
      "Fades dark spots and hyperpigmentation by naturally inhibiting melanin",
      "Antioxidant-rich formula neutralizes free radicals and soothes UV sun damage",
      "Boosts collagen and smooths skin texture via mild physical exfoliation",
      "Natural antibacterial properties help clear pores and reduce acne breakouts"
    ],
    isActive: true
  },
  {
    name: "Sweet Orange Brightening Scrub",
    category: "Face Scrub",
    price: 299.00,
    discountPercentage: 0,
    ratings: { average: 4.8, count: 64 },
    images: ["/images/sweet_orange_scrub.jpg"],
    description: "An invigorating physical exfoliant formulated with sweet orange extracts and finely milled walnut shells. It mechanically sweeps away dead skin cells to instantly reveal a smoother, more radiant complexion while improving product absorption.",
    benefits: [
      "Deep physical exfoliation reveals smoother, more radiant skin",
      "Unclogs pores and lifts away acne-causing pollutants",
      "Refines skin texture and drastically smooths rough patches",
      "Boosts blood circulation for a healthy, vibrant glow"
    ],
    isActive: true
  },
  {
    name: "Brightening Saffron Day Cream",
    category: "Face Cream",
    price: 449.00,
    discountPercentage: 0,
    ratings: { average: 4.9, count: 120 },
    images: ["/images/saffron_day_cream.jpg"],
    description: "A restorative, antioxidant-rich day cream that brightens the complexion while defending against environmental pollutants. Its adaptogenic formula balances sebum and provides deep hydration. Best paired with SPF for maximum glow protection.",
    benefits: [
      "Naturally brightens dark spots and evens skin tone via active Crocin",
      "Deep hydration strengthens the skin barrier to prevent moisture loss",
      "Adaptogenic oil regulation makes it ideal for both oily and dry skin",
      "Natural astringent properties give the skin a firmer, lifted appearance"
    ],
    isActive: true
  },
  {
    name: "24Kt Gold Dust Serum",
    category: "Face Serum",
    price: 699.00,
    discountPercentage: 0,
    ratings: { average: 5.0, count: 254 },
    images: ["/images/24kt_gold_serum.jpg"],
    description: "A luxurious 24Kt Gold Dust treatment acting as a 'natural retinol'. It delivers an instant 'red carpet' glow, deeply moisturizing while shielding the skin from pollution and UV damage. This exquisite light oil elixir fades acne scars, regenerates cells, and tightens pores.",
    benefits: [
      "Provides an instant, radiant 'red carpet' golden glow",
      "Acts as a natural retinol for a powerful lifting and anti-aging effect",
      "Fades acne scars, evens skin tone, and regenerates skin cells",
      "Antibacterial and calming botanical oils reduce minor breakouts"
    ],
    isActive: true
  },
  {
    name: "Glow Fusion Gel",
    category: "Face Gel",
    price: 349.00,
    discountPercentage: 0,
    ratings: { average: 4.8, count: 88 },
    images: ["/images/glow_fusion_gel.jpg"],
    description: "A fast-absorbing, cooling gel that deeply penetrates to rejuvenate stressed skin. It effectively repairs sun damage, regulates oil production, and provides a soothing, deeply detoxified glow without any greasy residue.",
    benefits: [
      "Deep detoxification and pigmentation control for a natural, even glow",
      "Anti-aging collagen boost to relieve stressed, tired, or polluted skin",
      "Repairs sun damage using Liquiritin to disperse excess melanin",
      "Fast-absorbing, non-greasy cooling effect perfect for humid weather"
    ],
    isActive: true
  }
];

const importData = async () => {
  try {
    await Product.deleteMany(); // Clear existing products
    await Admin.deleteMany(); // Clear existing admins

    await Product.insertMany(products); // Insert new products
    
    // Insert new master admin
    await Admin.create({
      email: 'admin@evans.com',
      password: 'password123'
    });

    console.log('Data Imported successfully into MongoDB Atlas!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
