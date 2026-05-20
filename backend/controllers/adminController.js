const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });

    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, item) => {
      return item.isPaid ? acc + item.totalPrice : acc;
    }, 0);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Simple monthly chart data for last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - 5);
    date.setDate(1);

    const monthlyOrders = await Order.find({
      isPaid: true,
      createdAt: { $gte: date },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = {};

    monthlyOrders.forEach((order) => {
      const monthIndex = order.createdAt.getMonth();
      const monthName = months[monthIndex];
      if (!monthlyRevenue[monthName]) {
        monthlyRevenue[monthName] = 0;
      }
      monthlyRevenue[monthName] += order.totalPrice;
    });

    const chartData = Object.keys(monthlyRevenue).map((month) => ({
      name: month,
      revenue: monthlyRevenue[month],
    }));

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const product = new Product({
      name: req.body.name || 'Sample name',
      price: req.body.price || 0,
      description: req.body.description || 'Sample description',
      images: req.body.images || [],
      category: req.body.category || 'Sample category',
      subcategory: req.body.subcategory,
      stock: req.body.stock || 0,
      originalPrice: req.body.originalPrice,
      tags: req.body.tags || [],
      isFeatured: req.body.isFeatured || false,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      images,
      category,
      subcategory,
      stock,
      originalPrice,
      tags,
      isFeatured,
      isActive,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      if (images) product.images = images;
      product.category = category || product.category;
      if (subcategory !== undefined) product.subcategory = subcategory;
      product.stock = stock !== undefined ? stock : product.stock;
      if (originalPrice !== undefined) product.originalPrice = originalPrice;
      if (tags) product.tags = tags;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (isActive !== undefined) product.isActive = isActive;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      if (req.body.status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAdminCustomers = async (req, res, next) => {
  try {
    // Only get users
    const customers = await User.find({ role: 'user' }).select('-password');
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);

    if (customer) {
      await User.deleteOne({ _id: customer._id });
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404);
      throw new Error('Customer not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  deleteCustomer,
};
