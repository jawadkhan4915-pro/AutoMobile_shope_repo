const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    logout,
    getUsers,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/users', protect, admin, getUsers);

module.exports = router;
