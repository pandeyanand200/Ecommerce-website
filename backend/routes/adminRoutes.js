const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  deleteCustomer,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/dashboard').get(protect, admin, getDashboardStats);

router
  .route('/products')
  .get(protect, admin, getAdminProducts)
  .post(protect, admin, createProduct);

router
  .route('/products/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/orders').get(protect, admin, getAdminOrders);
router.route('/orders/:id/status').put(protect, admin, updateOrderStatus);

router.route('/customers').get(protect, admin, getAdminCustomers);
router.route('/customers/:id').delete(protect, admin, deleteCustomer);

module.exports = router;
