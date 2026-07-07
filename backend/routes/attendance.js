const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getTodayStatus,
    getMyHistory,
    getAllLogs,
    addManualRecord,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/auth');

// Private routes for all registered staff members
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/status', protect, getTodayStatus);
router.get('/history', protect, getMyHistory);

// Admin / Owner restricted routes
router.get('/all', protect, admin, getAllLogs);
router.post('/manual', protect, admin, addManualRecord);

module.exports = router;
