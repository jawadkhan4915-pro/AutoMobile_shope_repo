const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get the full cart shape
const getFullCart = async (userId) => {
    const cartItems = await Cart.find({ user: userId }).populate('product');
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    return {
        items: cartItems,
        total,
        count: cartItems.length,
    };
};

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const cartData = await getFullCart(req.user._id);

        res.json({
            success: true,
            data: cartData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Get product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if product is active
        if (!product.status) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available',
            });
        }

        // Check stock
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        // Check if item already in cart
        let cartItem = await Cart.findOne({
            user: req.user._id,
            product: productId,
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                user: req.user._id,
                product: productId,
                productName: product.name,
                price: product.price,
                quantity,
                tax: product.tax,
            });
        }

        const cartData = await getFullCart(req.user._id);

        res.status(201).json({
            success: true,
            data: cartData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        let cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
            });
        }

        // Check stock
        const product = await Product.findById(cartItem.product);
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        const cartData = await getFullCart(req.user._id);

        res.json({
            success: true,
            data: cartData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
            });
        }

        await Cart.findByIdAndDelete(req.params.id);

        const cartData = await getFullCart(req.user._id);

        res.json({
            success: true,
            data: cartData,
            message: 'Item removed from cart',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user._id });

        const cartData = await getFullCart(req.user._id);

        res.json({
            success: true,
            data: cartData,
            message: 'Cart cleared',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
