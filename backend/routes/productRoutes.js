const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getMyProducts, updateProduct, deleteProduct, getProductsByStore } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/my-products', protect, authorize('store'), getMyProducts);
router.get('/store/:storeId', getProductsByStore);
router.post('/', protect, authorize('store'), addProduct);
router.put('/:id', protect, authorize('store'), updateProduct);
router.delete('/:id', protect, authorize('store'), deleteProduct);

module.exports = router;

