const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Customer.deleteMany();
        await Setting.deleteMany();

        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: 'pass@123',
            role: 'admin',
        });

        console.log('Admin user created');

        // Create cashier user
        await User.create({
            name: 'Cashier User',
            email: 'cashier@cashier.com',
            password: 'pass@123',
            role: 'cashier',
        });

        console.log('Cashier user created');

        // Create sample products
        const products = [
            {
                name: 'Laptop',
                description: 'High-performance laptop',
                barcode: 'LAP001',
                price: 999.99,
                tax: 10,
                quantity: 50,
                status: true,
            },
            {
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse',
                barcode: 'MOU001',
                price: 29.99,
                tax: 5,
                quantity: 100,
                status: true,
            },
            {
                name: 'Mechanical Keyboard',
                description: 'RGB mechanical keyboard',
                barcode: 'KEY001',
                price: 89.99,
                tax: 5,
                quantity: 75,
                status: true,
            },
            {
                name: 'USB-C Cable',
                description: 'Fast charging USB-C cable',
                barcode: 'CAB001',
                price: 12.99,
                tax: 2,
                quantity: 200,
                status: true,
            },
            {
                name: 'Headphones',
                description: 'Noise-cancelling headphones',
                barcode: 'HEA001',
                price: 149.99,
                tax: 10,
                quantity: 60,
                status: true,
            },
            {
                name: 'Webcam',
                description: '1080p HD webcam',
                barcode: 'WEB001',
                price: 79.99,
                tax: 5,
                quantity: 40,
                status: true,
            },
            {
                name: 'Monitor',
                description: '27-inch 4K monitor',
                barcode: 'MON001',
                price: 399.99,
                tax: 15,
                quantity: 30,
                status: true,
            },
            {
                name: 'External SSD',
                description: '1TB portable SSD',
                barcode: 'SSD001',
                price: 129.99,
                tax: 10,
                quantity: 80,
                status: true,
            },
            {
                name: 'Desk Lamp',
                description: 'LED desk lamp',
                barcode: 'LAM001',
                price: 34.99,
                tax: 3,
                quantity: 120,
                status: true,
            },
            {
                name: 'Phone Stand',
                description: 'Adjustable phone stand',
                barcode: 'STA001',
                price: 19.99,
                tax: 2,
                quantity: 150,
                status: true,
            },
        ];

        await Product.insertMany(products);
        console.log('Sample products created');

        // Create sample customers
        const customers = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                address: '123 Main St, City, State',
                user: admin._id,
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1234567891',
                address: '456 Oak Ave, City, State',
                user: admin._id,
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
                phone: '+1234567892',
                address: '789 Pine Rd, City, State',
                user: admin._id,
            },
            {
                firstName: 'Alice',
                lastName: 'Williams',
                email: 'alice.williams@example.com',
                phone: '+1234567893',
                address: '321 Elm St, City, State',
                user: admin._id,
            },
            {
                firstName: 'Charlie',
                lastName: 'Brown',
                email: 'charlie.brown@example.com',
                phone: '+1234567894',
                address: '654 Maple Dr, City, State',
                user: admin._id,
            },
        ];

        await Customer.insertMany(customers);
        console.log('Sample customers created');

        // Create settings
        const settings = [
            {
                key: 'store_name',
                value: 'Easy POS',
                description: 'Store name',
            },
            {
                key: 'currency',
                value: 'USD',
                description: 'Currency code',
            },
            {
                key: 'tax_rate',
                value: 10,
                description: 'Default tax rate percentage',
            },
            {
                key: 'receipt_footer',
                value: 'Thank you for your purchase!',
                description: 'Receipt footer text',
            },
        ];

        await Setting.insertMany(settings);
        console.log('Settings created');

        console.log('\n✅ Demo data seeded successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin - Email: admin@admin.com, Password: pass@123');
        console.log('Cashier - Email: cashier@cashier.com, Password: pass@123');

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
