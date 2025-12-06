const express = require('express');
const router = express.Router();
const {
    getOrderPayments,
    createPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createPayment);
router.get('/order/:orderId', protect, getOrderPayments);

module.exports = router;
