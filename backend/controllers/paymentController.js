const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize stripe conditionally
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isRealStripe = stripeSecretKey && 
                     !stripeSecretKey.includes('placeholder') && 
                     !stripeSecretKey.includes('YOUR_') &&
                     stripeSecretKey.startsWith('sk_');

const stripe = isRealStripe ? require('stripe')(stripeSecretKey) : null;

// @desc    Get payment config (Stripe publishable key)
// @route   GET /api/payments/config
// @access  Private
const getPaymentConfig = async (req, res) => {
    try {
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_easy_pos';
        const isMock = !isRealStripe;

        res.json({
            success: true,
            publishableKey,
            isMock,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create Stripe PaymentIntent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid payment amount',
            });
        }

        const amountInCents = Math.round(amount * 100);

        if (stripe) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                metadata: { integration_check: 'accept_a_payment' },
            });

            return res.json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                isMock: false,
            });
        } else {
            // Mock sandbox payment intent
            const mockSecret = `mock_secret_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            return res.json({
                success: true,
                clientSecret: mockSecret,
                isMock: true,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get payments for an order
// @route   GET /api/payments/order/:orderId
// @access  Private
const getOrderPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ order: req.params.orderId }).populate(
            'order'
        );

        res.json({
            success: true,
            data: payments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
    try {
        const { orderId, amount, method, reference } = req.body;

        // Check if order exists
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const payment = await Payment.create({
            order: orderId,
            amount,
            method,
            reference,
        });

        res.status(201).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getPaymentConfig,
    createPaymentIntent,
    getOrderPayments,
    createPayment,
};
