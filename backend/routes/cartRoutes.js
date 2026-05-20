const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart);
router.route('/add').post(protect, addToCart);
router.route('/update').put(protect, updateCartItem);
router.route('/remove/:productId').delete(protect, removeFromCart);
router.route('/clear').delete(protect, clearCart);

module.exports = router;
