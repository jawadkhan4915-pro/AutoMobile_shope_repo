const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../utils/upload');

router
    .route('/')
    .get(protect, getProducts)
    .post(protect, admin, upload.single('image'), createProduct);

router
    .route('/:id')
    .get(protect, getProduct)
    .put(protect, admin, upload.single('image'), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
