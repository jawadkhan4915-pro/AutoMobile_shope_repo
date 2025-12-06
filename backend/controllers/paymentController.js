const Payment = require('../models/Payment');
const Order = require('../models/Order');

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
    getOrderPayments,
    createPayment,
};
