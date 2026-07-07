const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // format YYYY-MM-DD
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Present', 'Late', 'Absent'],
            default: 'Present',
        },
        workHours: {
            type: Number, // decimal hours e.g., 7.5
            default: 0,
        },
        notes: {
            type: String,
            trim: true,
        },
        photo: {
            type: String, // base64 representation of verified webcam snap
        },
        location: {
            type: String, // Geolocation coordinates (lat, lng)
        }
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure a user has only one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
