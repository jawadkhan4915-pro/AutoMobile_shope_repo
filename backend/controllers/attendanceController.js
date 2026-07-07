const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper: Get today's date string YYYY-MM-DD
const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// @desc    Clock in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
    try {
        const { notes, location, photo } = req.body;
        const userId = req.user._id;
        const date = getTodayDateString();

        // Check if already checked in today
        const existingRecord = await Attendance.findOne({ user: userId, date });
        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: 'You have already clocked in today.',
            });
        }

        // Determine status (Late if clocked in after 09:15:00 local time)
        const checkInTime = new Date();
        const hour = checkInTime.getHours();
        const minute = checkInTime.getMinutes();
        let status = 'Present';

        if (hour > 9 || (hour === 9 && minute > 15)) {
            status = 'Late';
        }

        const attendance = await Attendance.create({
            user: userId,
            date,
            checkIn: checkInTime,
            status,
            notes,
            location,
            photo,
        });

        res.status(201).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clock out
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res) => {
    try {
        const { notes } = req.body;
        const userId = req.user._id;
        const date = getTodayDateString();

        // Find today's check-in record
        const attendance = await Attendance.findOne({ user: userId, date });
        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No check-in record found for today. Please clock in first.',
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: 'You have already clocked out today.',
            });
        }

        const checkOutTime = new Date();
        attendance.checkOut = checkOutTime;

        // Calculate work hours (in decimal hours)
        const diffMs = checkOutTime.getTime() - attendance.checkIn.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        attendance.workHours = parseFloat(hours.toFixed(2));

        if (notes) {
            attendance.notes = attendance.notes 
                ? `${attendance.notes} | Check-out notes: ${notes}`
                : notes;
        }

        await attendance.save();

        res.json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get today's attendance status for logged-in user
// @route   GET /api/attendance/status
// @access  Private
exports.getTodayStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = getTodayDateString();

        const attendance = await Attendance.findOne({ user: userId, date });

        res.json({
            success: true,
            data: attendance || null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get attendance history of current logged-in user
// @route   GET /api/attendance/history
// @access  Private
exports.getMyHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await Attendance.find({ user: userId }).sort({ date: -1 });

        res.json({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all attendance logs (Admin/Owner only)
// @route   GET /api/attendance/all
// @access  Private
exports.getAllLogs = async (req, res) => {
    try {
        const { date, user } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        }
        if (user) {
            query.user = user;
        }

        const logs = await Attendance.find(query)
            .populate('user', 'name email role')
            .sort({ date: -1, checkIn: -1 });

        res.json({
            success: true,
            data: logs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create or update attendance record manually (Admin/Owner only)
// @route   POST /api/attendance/manual
// @access  Private
exports.addManualRecord = async (req, res) => {
    try {
        const { userId, date, checkIn, checkOut, status, notes } = req.body;

        if (!userId || !date || !checkIn) {
            return res.status(400).json({
                success: false,
                message: 'User ID, date, and check-in time are required.',
            });
        }

        // Calculate hours if checkOut is provided
        let workHours = 0;
        if (checkOut) {
            const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
            if (diffMs > 0) {
                workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
            }
        }

        // Find or create record for this user and date
        let attendance = await Attendance.findOne({ user: userId, date });

        if (attendance) {
            // Update existing
            attendance.checkIn = new Date(checkIn);
            if (checkOut) attendance.checkOut = new Date(checkOut);
            attendance.status = status || attendance.status;
            attendance.workHours = workHours;
            attendance.notes = notes;
            await attendance.save();
        } else {
            // Create new
            attendance = await Attendance.create({
                user: userId,
                date,
                checkIn: new Date(checkIn),
                checkOut: checkOut ? new Date(checkOut) : undefined,
                status: status || 'Present',
                workHours,
                notes,
            });
        }

        const populatedAttendance = await Attendance.findById(attendance._id).populate('user', 'name email role');

        res.json({
            success: true,
            data: populatedAttendance,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
