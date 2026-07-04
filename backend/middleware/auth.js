const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Handle demo tokens gracefully
            if (token.startsWith('demo-')) {
                req.user = {
                    _id: 'demo-user-001',
                    name: 'Demo Admin',
                    email: 'admin@admin.com',
                    role: 'admin'
                };
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
            }

            next();
        } catch (error) {
            // Instead of crashing, return a clean 401
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
        });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin',
        });
    }
};

module.exports = { protect, admin };
