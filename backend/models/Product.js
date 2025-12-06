const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
        barcode: {
            type: String,
            unique: true,
            sparse: true,
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        quantity: {
            type: Number,
            required: [true, 'Please provide quantity'],
            min: 0,
            default: 0,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for image URL
productSchema.virtual('imageUrl').get(function () {
    if (this.image) {
        return this.image.startsWith('http')
            ? this.image
            : `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.image}`;
    }
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/placeholder.jpg`;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
