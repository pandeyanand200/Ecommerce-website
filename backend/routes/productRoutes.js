const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProductReview,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.route('/:id').get(getProductById);
router.route('/:id/review').post(protect, createProductReview);

module.exports = router;
