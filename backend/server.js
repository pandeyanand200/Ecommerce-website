const startServer = async () => {
  try {

    console.log('Attempting MongoDB connection...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    await connectDB();

    console.log('Attempting Cloudinary connection...');
    console.log('CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
    console.log('CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

    connectCloudinary();

    const app = express();

    app.use(express.json());
    app.use(cors({
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || true
        : 'http://localhost:5173',
      credentials: true,
    }));

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/upload', uploadRoutes);

    const path = require('path');
    if (process.env.NODE_ENV === 'production') {
      const frontendPath = path.join(__dirname, '../frontend/dist');
      app.use(express.static(frontendPath));

      app.get(/(.*)/, (req, res, next) => {
        if (req.url.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.resolve(frontendPath, 'index.html'));
      });
    } else {
      app.get('/', (req, res) => {
        res.send('API is running...');
      });
    }

    app.use('/api/*', (req, res) => {
      res.status(404).json({ message: 'API route not found' });
    });

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
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
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