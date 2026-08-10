// Run with: npm run seed          (populate)
//           npm run seed:destroy  (wipe all data)
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Settings from '../models/Settings.js';

dotenv.config();

const categoriesData = [
  { name: 'Crochet Items', description: 'Handcrafted crochet toys, bouquets, keychains and more', icon: '🧶', displayOrder: 1 },
  { name: 'Customized Gifts', description: 'Personalised gifts made with love, just for your special someone', icon: '🎁', displayOrder: 2 },
  { name: 'Home Decor', description: 'Cozy handmade decor pieces to brighten up your space', icon: '🏡', displayOrder: 3 },
  { name: 'Handmade Products', description: 'One-of-a-kind handmade treasures crafted with care', icon: '✨', displayOrder: 4 },
];

const productSeedByCategory = {
  'Crochet Items': [
    {
      name: 'Crochet Sunflower Keychain',
      description: 'A cheerful little sunflower keychain, handcrafted stitch by stitch with soft cotton yarn. Perfect as a bag charm or a small gift of sunshine for someone you love.',
      price: 149, compareAtPrice: 199, productionDays: 2, isFeatured: true, isBestSeller: true,
      tags: ['crochet', 'keychain', 'sunflower', 'gift'],
      specifications: [{ key: 'Material', value: '100% Cotton Yarn' }, { key: 'Size', value: '~6 cm' }],
    },
    {
      name: 'Crochet Flower Bouquet',
      description: 'A forever bouquet that never wilts! Each flower is individually crocheted and arranged into a beautiful bouquet — a thoughtful gift that lasts a lifetime.',
      price: 899, compareAtPrice: 1099, productionDays: 5, isFeatured: true, isNewArrival: true,
      tags: ['crochet', 'bouquet', 'flowers', 'anniversary'],
      specifications: [{ key: 'Material', value: 'Premium Acrylic Yarn' }, { key: 'Stems', value: '6-8 flowers' }],
    },
    {
      name: 'Custom Crochet Doll (Look-alike)',
      description: 'A one-of-a-kind crochet doll made to resemble you, a loved one, or even your pet! Send us a photo and preferred outfit details for a truly personal keepsake.',
      price: 1799, compareAtPrice: 2199, productionDays: 10, isBestSeller: true,
      tags: ['crochet', 'custom', 'doll', 'personalised'],
      specifications: [{ key: 'Height', value: '~20 cm' }, { key: 'Customisation', value: 'Face, hair & outfit' }],
    },
    {
      name: 'Crochet Mini Bear Plushie',
      description: 'A squishy, huggable mini bear plushie crocheted with the softest yarn — a sweet companion or a lovely little gift.',
      price: 349, productionDays: 3, isNewArrival: true,
      tags: ['crochet', 'plushie', 'bear', 'cute'],
      specifications: [{ key: 'Material', value: 'Soft Chenille Yarn' }, { key: 'Size', value: '~12 cm' }],
    },
    {
      name: 'Crochet Phone Charm Set',
      description: 'A playful set of crochet charms to dangle from your phone or bag — mix and match your favourite colours.',
      price: 249, productionDays: 2,
      tags: ['crochet', 'charm', 'phone', 'accessory'],
      specifications: [{ key: 'Set of', value: '2 charms' }],
    },
    {
      name: 'Crochet Coaster Set (Set of 4)',
      description: 'Add a handmade touch to your coffee table with this set of four crochet coasters in cheerful colours.',
      price: 399, productionDays: 3,
      tags: ['crochet', 'coasters', 'home', 'kitchen'],
      specifications: [{ key: 'Set of', value: '4 coasters' }, { key: 'Diameter', value: '10 cm' }],
    },
  ],
  'Customized Gifts': [
    {
      name: 'Personalised Name Keychain',
      description: 'A beautifully handcrafted keychain featuring the name of your choice — a simple, sweet way to carry a little love with you.',
      price: 249, productionDays: 3, isFeatured: true,
      tags: ['personalised', 'name', 'keychain', 'gift'],
      specifications: [{ key: 'Customisation', value: 'Any name up to 10 letters' }],
    },
    {
      name: 'Custom Photo Frame Bouquet',
      description: 'A charming keepsake combining a mini photo frame with handcrafted flowers — perfect for anniversaries and birthdays.',
      price: 749, productionDays: 5, isNewArrival: true,
      tags: ['custom', 'photo', 'frame', 'gift'],
      specifications: [{ key: 'Frame Size', value: '4x6 inch' }],
    },
    {
      name: 'Customised Couple Keychain Set',
      description: 'A matching set of two keychains personalised with names or initials — a sweet gift for couples and best friends.',
      price: 399, productionDays: 3, isBestSeller: true,
      tags: ['couple', 'keychain', 'gift', 'personalised'],
      specifications: [{ key: 'Set of', value: '2 keychains' }],
    },
    {
      name: 'Custom Message Jar',
      description: 'A jar filled with handwritten notes and little crochet charms — a heartfelt gift for someone who means the world to you.',
      price: 599, productionDays: 6,
      tags: ['custom', 'jar', 'message', 'gift'],
      specifications: [{ key: 'Includes', value: '20+ handwritten notes' }],
    },
  ],
  'Home Decor': [
    {
      name: 'Macrame Wall Hanging',
      description: 'An elegant handwoven macrame wall hanging that adds warmth and texture to any room.',
      price: 999, compareAtPrice: 1299, productionDays: 6, isFeatured: true,
      tags: ['macrame', 'wall', 'decor', 'boho'],
      specifications: [{ key: 'Length', value: '60 cm' }, { key: 'Material', value: 'Cotton Cord' }],
    },
    {
      name: 'Crochet Plant Hanger',
      description: 'A sturdy, stylish crochet plant hanger to give your favourite plants a cozy new home.',
      price: 449, productionDays: 4, isBestSeller: true,
      tags: ['crochet', 'plant', 'hanger', 'home'],
      specifications: [{ key: 'Material', value: 'Jute Blend Yarn' }],
    },
    {
      name: 'Handmade Dreamcatcher',
      description: 'A beautifully handwoven dreamcatcher with feathers and beads — a dreamy addition to your bedroom decor.',
      price: 549, productionDays: 4, isNewArrival: true,
      tags: ['dreamcatcher', 'boho', 'decor'],
      specifications: [{ key: 'Diameter', value: '20 cm' }],
    },
    {
      name: 'Crochet Table Runner',
      description: 'An intricately crocheted table runner that brings handmade elegance to your dining table.',
      price: 799, productionDays: 7,
      tags: ['crochet', 'table', 'runner', 'home'],
      specifications: [{ key: 'Length', value: '150 cm' }],
    },
  ],
  'Handmade Products': [
    {
      name: 'Handmade Scented Candle',
      description: 'A soy-wax candle hand-poured with soothing fragrances, topped with delicate dried flowers.',
      price: 349, productionDays: 3, isNewArrival: true,
      tags: ['candle', 'handmade', 'gift', 'aroma'],
      specifications: [{ key: 'Wax', value: 'Soy Wax' }, { key: 'Burn Time', value: '~20 hrs' }],
    },
    {
      name: 'Hand-painted Terracotta Pot',
      description: 'A charming terracotta pot, hand-painted with intricate floral patterns — perfect for succulents.',
      price: 449, productionDays: 5,
      tags: ['pottery', 'handmade', 'planter'],
      specifications: [{ key: 'Size', value: 'Small (4 inch)' }],
    },
    {
      name: 'Beaded Friendship Bracelet Set',
      description: 'A colourful set of handmade beaded bracelets — stack them up or gift them to your best friends.',
      price: 199, productionDays: 2, isBestSeller: true,
      tags: ['bracelet', 'beaded', 'friendship'],
      specifications: [{ key: 'Set of', value: '3 bracelets' }],
    },
    {
      name: 'Handmade Resin Keychain',
      description: 'A glossy resin keychain with pressed flowers sealed inside — nature\u2019s beauty, preserved forever.',
      price: 299, productionDays: 4,
      tags: ['resin', 'keychain', 'flowers'],
      specifications: [{ key: 'Material', value: 'Epoxy Resin' }],
    },
  ],
};

const importData = async () => {
  await connectDB();
  console.log('Connected. Seeding data...');

  // ---- Admin user ----
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@utsaah.com').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'Utsaah Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`✔ Admin created -> ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  } else {
    console.log('• Admin already exists, skipping.');
  }

  // ---- Categories ----
  const categoryMap = {};
  for (const cat of categoriesData) {
    let category = await Category.findOne({ name: cat.name });
    if (!category) {
      category = await Category.create(cat);
      console.log(`✔ Category created: ${cat.name}`);
    }
    categoryMap[cat.name] = category._id;
  }

  // ---- Products ----
  const existingProductCount = await Product.countDocuments();
  if (existingProductCount === 0) {
    const placeholdersByCategory = {
      'Crochet Items': ['/uploads/products/placeholder-1.svg'],
      'Customized Gifts': ['/uploads/products/placeholder-2.svg'],
      'Home Decor': ['/uploads/products/placeholder-3.svg'],
      'Handmade Products': ['/uploads/products/placeholder-4.svg'],
    };
    for (const [catName, products] of Object.entries(productSeedByCategory)) {
      for (const p of products) {
        await Product.create({
          ...p,
          category: categoryMap[catName],
          images: placeholdersByCategory[catName] || ['/uploads/products/placeholder-1.svg'],
          availability: 'available',
          manufacturingType: 'Made To Order',
        });
      }
    }
    console.log('✔ Sample products created');
  } else {
    console.log('• Products already exist, skipping.');
  }

  // ---- Coupons ----
  const existingCoupons = await Coupon.countDocuments();
  if (existingCoupons === 0) {
    await Coupon.create([
      {
        code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minimumPurchase: 300,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 500,
      },
      {
        code: 'UTSAAH100', discountType: 'flat', discountValue: 100, minimumPurchase: 999,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200,
      },
    ]);
    console.log('✔ Sample coupons created (WELCOME10, UTSAAH100)');
  } else {
    console.log('• Coupons already exist, skipping.');
  }

  console.log('\n🌸 Seeding complete!');
  // ---- Settings (UPI owners + WhatsApp) ----
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      businessName: 'Utsaah',
      ownerOneName: 'Owner 1',
      ownerOneUpiId: '',
      ownerTwoName: 'Owner 2',
      ownerTwoUpiId: '',
      activeOwner: 'one',
      whatsappNumber: '',
    });
    console.log('✔ Default settings created — fill in UPI IDs & WhatsApp number from Admin → Settings');
  } else {
    console.log('• Settings already exist, skipping.');
  }
  process.exit();
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({ role: 'customer' }),
    Category.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
    Cart.deleteMany(),
    Wishlist.deleteMany(),
  ]);
  console.log('🗑  All seedable data destroyed (admin account preserved).');
  process.exit();
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
