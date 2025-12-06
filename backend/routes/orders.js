const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats/summary', protect, getOrderStats);

router.route('/').get(protect, getOrders).post(protect, createOrder);

router
    .route('/:id')
    .get(protect, getOrder)
    .put(protect, admin, updateOrder)
    .delete(protect, admin, deleteOrder);

module.exports = router;
