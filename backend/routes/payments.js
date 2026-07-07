const express = require('express');
const router = express.Router();
const {
    getPaymentConfig,
    createPaymentIntent,
    getOrderPayments,
    createPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', protect, getPaymentConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/', protect, createPayment);
router.get('/order/:orderId', protect, getOrderPayments);

module.exports = router;
