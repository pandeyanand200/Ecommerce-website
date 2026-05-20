const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Products: ${productCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Orders: ${orderCount}`);
    
    if (productCount > 0) {
      const products = await Product.find().limit(5);
      console.log('Sample Products:');
      products.forEach(p => console.log(`- ${p.name} (₹${p.price}) in ${p.category} | Stock: ${p.stock}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
