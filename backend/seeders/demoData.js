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
                name: 'Brembo Ceramic Brake Pads (Front)',
                description: 'High performance ceramic front brake pads. Compatibility: Toyota Camry, Honda Accord 2018-2022',
                barcode: 'BP-8802',
                sku: 'BP-8802',
                price: 85.00,
                costPrice: 52.00,
                quantity: 18,
                category: 'Brake Systems',
                compatibility: 'Toyota Camry, Honda Accord 2018-2022',
                status: true,
                image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&h=180&fit=crop&auto=format',
                tax: 10,
            },
            {
                name: 'Castrol Edge 5W-30 Full Synthetic (5L)',
                description: 'Advanced full synthetic engine oil. Compatibility: Universal Gasoline & Hybrid Engines',
                barcode: 'OL-5590',
                sku: 'OL-5590',
                price: 45.00,
                costPrice: 28.00,
                quantity: 45,
                category: 'Oils & Fluids',
                compatibility: 'Universal Gasoline & Hybrid Engines',
                status: true,
                image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=180&fit=crop&auto=format',
                tax: 5,
            },
            {
                name: 'Bosch Iridium Spark Plug Set (4pcs)',
                description: 'Bosch premium iridium spark plugs. Compatibility: Ford F-150, Chevy Silverado 2015-2021',
                barcode: 'SP-9912',
                sku: 'SP-9912',
                price: 48.00,
                costPrice: 30.00,
                quantity: 4,
                category: 'Engine Parts',
                compatibility: 'Ford F-150, Chevy Silverado 2015-2021',
                status: true,
                image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&h=180&fit=crop&auto=format',
                tax: 5,
            },
            {
                name: 'Michelin Pilot Sport 4S Tire 245/40R18',
                description: 'Michelin ultra high performance tire. Compatibility: BMW 3-Series, Audi A4, Mercedes C-Class',
                barcode: 'TR-4018',
                sku: 'TR-4018',
                price: 240.00,
                costPrice: 165.00,
                quantity: 12,
                category: 'Tires & Wheels',
                compatibility: 'BMW 3-Series, Audi A4, Mercedes C-Class',
                status: true,
                image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=300&h=180&fit=crop&auto=format',
                tax: 10,
            },
            {
                name: 'Optima RedTop AGM Battery',
                description: 'Optima heavy duty battery. Compatibility: Trucks, SUVs, Heavy Duty Commercial',
                barcode: 'BT-1090',
                sku: 'BT-1090',
                price: 220.00,
                costPrice: 145.00,
                quantity: 8,
                category: 'Electrical',
                compatibility: 'Trucks, SUVs, Heavy Duty Commercial',
                status: true,
                image: 'https://images.unsplash.com/photo-1558441719-67450807e98a?w=300&h=180&fit=crop&auto=format',
                tax: 10,
            },
            {
                name: 'K&N High-Flow Air Filter Drop-In',
                description: 'K&N premium air filter. Compatibility: Nissan GT-R, 370Z, Infiniti Q50',
                barcode: 'AF-3320',
                sku: 'AF-3320',
                price: 62.00,
                costPrice: 38.00,
                quantity: 24,
                category: 'Engine Parts',
                compatibility: 'Nissan GT-R, 370Z, Infiniti Q50',
                status: true,
                image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&h=180&fit=crop&auto=format',
                tax: 5,
            },
            {
                name: 'Bosch Premium Wiper Blade Set (2pcs)',
                description: 'Bosch premium all-weather wiper blade set. Compatibility: Universal Fit 2010-2024',
                barcode: 'WB-2201',
                sku: 'WB-2201',
                price: 28.00,
                costPrice: 14.00,
                quantity: 55,
                category: 'Accessories',
                compatibility: 'Universal Fit 2010-2024',
                status: true,
                image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=180&fit=crop&auto=format',
                tax: 3,
            },
            {
                name: 'ACDelco Professional Wheel Hub Assembly',
                description: 'ACDelco professional grade hub assembly. Compatibility: Chevrolet Silverado, GMC Sierra 2014-2020',
                barcode: 'WH-8810',
                sku: 'WH-8810',
                price: 95.00,
                costPrice: 62.00,
                quantity: 6,
                category: 'Brake Systems',
                compatibility: 'Chevrolet Silverado, GMC Sierra 2014-2020',
                status: true,
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=180&fit=crop&auto=format',
                tax: 8,
            },
            {
                name: 'Pentosin ATF 1 Transmission Fluid (1L)',
                description: 'Pentosin premium transmission fluid. Compatibility: BMW, Mercedes, Audi, Volkswagen',
                barcode: 'TF-4401',
                sku: 'TF-4401',
                price: 35.00,
                costPrice: 20.00,
                quantity: 20,
                category: 'Oils & Fluids',
                compatibility: 'BMW, Mercedes, Audi, Volkswagen',
                status: true,
                image: 'https://images.unsplash.com/photo-1625046773738-dbd4f8de7a37?w=300&h=180&fit=crop&auto=format',
                tax: 5,
            },
            {
                name: 'NGK Laser Iridium Spark Plugs (Set 4)',
                description: 'NGK high performance laser spark plugs. Compatibility: Honda Civic, CR-V, Accord 2016-2023',
                barcode: 'SP-1144',
                sku: 'SP-1144',
                price: 56.00,
                costPrice: 34.00,
                quantity: 2,
                category: 'Engine Parts',
                compatibility: 'Honda Civic, CR-V, Accord 2016-2023',
                status: true,
                image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&h=180&fit=crop&auto=format',
                tax: 5,
            }
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
