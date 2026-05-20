const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createOrder);
router.route('/my-orders').get(protect, getMyOrders);
router.route('/razorpay/create').post(protect, createRazorpayOrder);
router.route('/razorpay/verify').post(protect, verifyRazorpayPayment);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, deleteOrder);

module.exports = router;
