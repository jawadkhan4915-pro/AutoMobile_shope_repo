const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please provide first name'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Please provide last name'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for avatar URL
customerSchema.virtual('avatarUrl').get(function () {
    if (this.avatar) {
        return this.avatar.startsWith('http')
            ? this.avatar
            : `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.avatar}`;
    }
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/avatar-placeholder.jpg`;
});

// Ensure virtuals are included in JSON
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
