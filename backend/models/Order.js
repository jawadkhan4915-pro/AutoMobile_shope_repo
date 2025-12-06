const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
        },
        customerName: {
            type: String,
            default: 'Walk-in Customer',
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled'],
            default: 'completed',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for order items
orderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'order',
});

// Virtual populate for payments
orderSchema.virtual('payments', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'order',
});

module.exports = mongoose.model('Order', orderSchema);
