const Product = require('../models/Product');
const { getPagination } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const { page, limit, search, status } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } },
            ];
        }
        if (status !== undefined) {
            query.status = status === 'true';
        }

        const products = await Product.find(query)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, description, barcode, price, tax, quantity, status, sku, category, compatibility, costPrice, image } = req.body;

        const productData = {
            name,
            description,
            barcode,
            price,
            tax,
            quantity,
            status,
            sku,
            category,
            compatibility,
            costPrice: costPrice ? parseFloat(costPrice) : 0,
            image: image || null
        };

        // Handle image upload
        if (req.file) {
            productData.image = req.file.filename;
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const { name, description, barcode, price, tax, quantity, status, sku, category, compatibility, costPrice, imageUrl, image } = req.body;

        const updateData = {
            name,
            description,
            barcode,
            price,
            tax,
            quantity,
            status,
            sku,
            category,
            compatibility,
            costPrice: costPrice ? parseFloat(costPrice) : 0,
            image: image || imageUrl || null
        };

        // Handle image upload
        if (req.file) {
            // Delete old image if exists
            if (product.image && !product.image.startsWith('http')) {
                const oldImagePath = path.join(__dirname, '../uploads', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = req.file.filename;
        }

        product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete image if exists
        if (product.image && !product.image.startsWith('http')) {
            const imagePath = path.join(__dirname, '../uploads', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
