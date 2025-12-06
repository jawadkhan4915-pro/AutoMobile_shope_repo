const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { getPagination } = require('../utils/helpers');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const { page, limit, status, startDate, endDate } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('customer')
            .populate('user', 'name email')
            .populate('items')
            .populate('payments')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('user', 'name email')
            .populate({
                path: 'items',
                populate: { path: 'product' },
            })
            .populate('payments');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { customerId, paymentMethod, paymentAmount } = req.body;

        // Get cart items
        const cartItems = await Cart.find({ user: req.user._id }).populate('product');

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }

        // Calculate total
        const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

        // Get customer name
        let customerName = 'Walk-in Customer';
        if (customerId) {
            const Customer = require('../models/Customer');
            const customer = await Customer.findById(customerId);
            if (customer) {
                customerName = customer.fullName;
            }
        }

        // Create order
        const order = await Order.create({
            customer: customerId || null,
            customerName,
            totalPrice,
            status: 'completed',
            user: req.user._id,
        });

        // Create order items and update product quantities
        for (const cartItem of cartItems) {
            // Create order item
            await OrderItem.create({
                order: order._id,
                product: cartItem.product._id,
                productName: cartItem.productName,
                quantity: cartItem.quantity,
                price: cartItem.price,
                tax: cartItem.tax,
            });

            // Update product quantity
            await Product.findByIdAndUpdate(cartItem.product._id, {
                $inc: { quantity: -cartItem.quantity },
            });
        }

        // Create payment
        if (paymentAmount && paymentAmount > 0) {
            await Payment.create({
                order: order._id,
                amount: paymentAmount,
                method: paymentMethod || 'cash',
            });
        }

        // Clear cart
        await Cart.deleteMany({ user: req.user._id });

        // Get complete order with populated fields
        const completeOrder = await Order.findById(order._id)
            .populate('customer')
            .populate('items')
            .populate('payments');

        res.status(201).json({
            success: true,
            data: completeOrder,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = async (req, res) => {
    try {
        const { status } = req.body;

        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('customer')
            .populate('items')
            .populate('payments');

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Delete order items
        await OrderItem.deleteMany({ order: order._id });

        // Delete payments
        await Payment.deleteMany({ order: order._id });

        // Delete order
        await Order.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private
const getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: today },
            status: 'completed',
        });

        const todaySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'completed',
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                },
            },
        ]);

        const totalOrders = await Order.countDocuments({ status: 'completed' });
        const totalSales = await Order.aggregate([
            {
                $match: { status: 'completed' },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                today: {
                    orders: todayOrders,
                    sales: todaySales[0]?.total || 0,
                },
                total: {
                    orders: totalOrders,
                    sales: totalSales[0]?.total || 0,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats,
};
