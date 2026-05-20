const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      // Check if user is admin or the order belongs to the user
      if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
      } else {
        res.status(401);
        throw new Error('Not authorized to view this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay/create
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send('Some error occured');

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // our DB order id
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(orderId);

      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: 'success',
          update_time: Date.now().toString(),
          signature: razorpay_signature,
        };

        const updatedOrder = await order.save();

        // Clear cart after payment
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.json({ message: 'Payment verified successfully', updatedOrder });
      } else {
        res.status(404);
        throw new Error('Order not found');
      }
    } else {
      res.status(400);
      throw new Error('Invalid signature sent!');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check if user is admin or the order belongs to the user
      if (req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) {
        
        // Cancellation allowed only if order is pending or processing
        if (order.status === 'shipped' || order.status === 'delivered') {
          res.status(400);
          throw new Error('Order has already been shipped or delivered and cannot be cancelled');
        }

        if (order.status === 'cancelled') {
          res.status(400);
          throw new Error('Order is already cancelled');
        }

        order.status = 'cancelled';
        const updatedOrder = await order.save();

        res.json({ message: 'Order cancelled successfully', updatedOrder });
      } else {
        res.status(401);
        throw new Error('Not authorized to cancel this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check if user is admin or the order belongs to the user
      if (req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) {
        
        // Only allow deleting cancelled or delivered orders (to prevent deleting active/pending orders)
        if (order.status === 'pending' || order.status === 'processing' || order.status === 'shipped') {
          res.status(400);
          throw new Error('Active orders (pending, processing, or shipped) cannot be deleted. You must cancel them first.');
        }

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
      } else {
        res.status(401);
        throw new Error('Not authorized to delete this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelOrder,
  deleteOrder,
};
