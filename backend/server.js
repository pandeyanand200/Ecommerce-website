// MUST be the absolute first line
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const connectCloudinary = require('./config/cloudinary');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const startServer = async () => {
  try {
    console.log('Attempting MongoDB connection...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    await connectDB();
    console.log('MongoDB connected successfully');

    connectCloudinary();
    console.log('Cloudinary connected successfully');

    const app = express();

    // Body parser
    app.use(express.json());

    // CORS — accepts all origins in production so your Render frontend works
    app.use(cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL || '*'
          : 'http://localhost:5173',
      credentials: true,
    }));

    // Logging — runs in both development and production for easier debugging
    app.use(morgan('dev'));

    // Mount all API routers FIRST before the frontend catch-all
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/upload', uploadRoutes);

    // Serve React frontend in production
    if (process.env.NODE_ENV === 'production') {
      const frontendPath = path.join(__dirname, '../frontend/dist');
      app.use(express.static(frontendPath));

      // Catch-all for React Router — must come AFTER all API routes
      app.get(/(.*)/, (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.resolve(frontendPath, 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.send('API is running...');
      });
    }

    // 404 handler for unmatched API routes
    // Fixed: Express 5 requires /api/*path instead of /api/*
    app.use('/api/*path', (req, res) => {
      res.status(404).json({ message: 'API route not found' });
    });

    // Global error handling middleware
    app.use((err, req, res, next) => {
      console.error('SERVER ERROR:', err);
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    });

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error(`Uncaught Exception: ${err.message}`);
      console.error(err.stack);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error('FATAL STARTUP ERROR:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

startServer();