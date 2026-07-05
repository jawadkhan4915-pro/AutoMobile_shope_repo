/**
 * useStore — Central localStorage data layer for Apex MotorWorks
 * Manages: products, mechanicBills, transactions, customers
 * Works offline-first; syncs to backend when available.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const StoreContext = createContext(null);

// ─── Default seed data ───────────────────────────────────────────────────────
const SEED_PRODUCTS = [
    { _id: 'P001', name: 'Brembo Ceramic Brake Pads (Front)', sku: 'BP-8802', price: 85.00, costPrice: 52.00, quantity: 18, category: 'Brake Systems', compatibility: 'Toyota Camry, Honda Accord 2018-2022', imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P002', name: 'Castrol Edge 5W-30 Full Synthetic (5L)', sku: 'OL-5590', price: 45.00, costPrice: 28.00, quantity: 45, category: 'Oils & Fluids', compatibility: 'Universal Gasoline & Hybrid Engines', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P003', name: 'Bosch Iridium Spark Plug Set (4pcs)', sku: 'SP-9912', price: 48.00, costPrice: 30.00, quantity: 4, category: 'Engine Parts', compatibility: 'Ford F-150, Chevy Silverado 2015-2021', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P004', name: 'Michelin Pilot Sport 4S Tire 245/40R18', sku: 'TR-4018', price: 240.00, costPrice: 165.00, quantity: 12, category: 'Tires & Wheels', compatibility: 'BMW 3-Series, Audi A4, Mercedes C-Class', imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P005', name: 'Optima RedTop AGM Battery', sku: 'BT-1090', price: 220.00, costPrice: 145.00, quantity: 8, category: 'Electrical', compatibility: 'Trucks, SUVs, Heavy Duty Commercial', imageUrl: 'https://images.unsplash.com/photo-1558441719-67450807e98a?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P006', name: 'K&N High-Flow Air Filter Drop-In', sku: 'AF-3320', price: 62.00, costPrice: 38.00, quantity: 24, category: 'Engine Parts', compatibility: 'Nissan GT-R, 370Z, Infiniti Q50', imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P007', name: 'Bosch Premium Wiper Blade Set (2pcs)', sku: 'WB-2201', price: 28.00, costPrice: 14.00, quantity: 55, category: 'Accessories', compatibility: 'Universal Fit 2010-2024', imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P008', name: 'ACDelco Professional Wheel Hub Assembly', sku: 'WH-8810', price: 95.00, costPrice: 62.00, quantity: 6, category: 'Brake Systems', compatibility: 'Chevrolet Silverado, GMC Sierra 2014-2020', imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P009', name: 'Pentosin ATF 1 Transmission Fluid (1L)', sku: 'TF-4401', price: 35.00, costPrice: 20.00, quantity: 20, category: 'Oils & Fluids', compatibility: 'BMW, Mercedes, Audi, Volkswagen', imageUrl: 'https://images.unsplash.com/photo-1625046773738-dbd4f8de7a37?w=300&h=180&fit=crop&auto=format' },
    { _id: 'P010', name: 'NGK Laser Iridium Spark Plugs (Set 4)', sku: 'SP-1144', price: 56.00, costPrice: 34.00, quantity: 2, category: 'Engine Parts', compatibility: 'Honda Civic, CR-V, Accord 2016-2023', imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&h=180&fit=crop&auto=format' },
];

const SEED_TRANSACTIONS = [
    { id: 'TRX-001', billId: null, type: 'cash_sale', staffName: 'Demo Cashier', staffRole: 'cashier', customerName: 'Walk-in Customer', items: [{ name: 'Brembo Brake Pads', qty: 2, price: 85.00 }], subtotal: 170.00, tax: 17.00, total: 187.00, method: 'Cash', date: new Date(Date.now() - 3600000).toISOString() },
    { id: 'TRX-002', billId: 'MECH-001', type: 'mechanic_bill', staffName: 'Lead Mechanic', staffRole: 'mechanic', customerName: 'Alexander Wright', items: [{ name: 'Castrol Edge 5W-30', qty: 3, price: 45.00 }, { name: 'K&N Air Filter', qty: 1, price: 62.00 }], subtotal: 197.00, tax: 19.70, total: 216.70, method: 'Card', date: new Date(Date.now() - 7200000).toISOString() },
    { id: 'TRX-003', billId: null, type: 'cash_sale', staffName: 'Demo Cashier', staffRole: 'cashier', customerName: 'Sophia Martinez', items: [{ name: 'Michelin Tire 245/40R18', qty: 2, price: 240.00 }], subtotal: 480.00, tax: 48.00, total: 528.00, method: 'Card', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'TRX-004', billId: 'MECH-002', type: 'mechanic_bill', staffName: 'Lead Mechanic', staffRole: 'mechanic', customerName: 'Marcus Brody', items: [{ name: 'Optima RedTop Battery', qty: 1, price: 220.00 }], subtotal: 220.00, tax: 22.00, total: 242.00, method: 'Cash', date: new Date(Date.now() - 172800000).toISOString() },
];

const SEED_MECHANIC_BILLS = [
    { id: 'MECH-001', mechanicName: 'Lead Mechanic', customerName: 'Alexander Wright', vehicleInfo: 'Honda Accord 2019', items: [{ productId: 'P002', name: 'Castrol Edge 5W-30', qty: 3, price: 45.00 }, { productId: 'P006', name: 'K&N Air Filter', qty: 1, price: 62.00 }], subtotal: 197.00, tax: 19.70, total: 216.70, status: 'paid', date: new Date(Date.now() - 7200000).toISOString() },
    { id: 'MECH-002', mechanicName: 'Lead Mechanic', customerName: 'Marcus Brody', vehicleInfo: 'Ford F-150 2020', items: [{ productId: 'P005', name: 'Optima RedTop Battery', qty: 1, price: 220.00 }], subtotal: 220.00, tax: 22.00, total: 242.00, status: 'paid', date: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const load = (key, fallback) => {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
};
const save = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
};
const genId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// ─── Provider ────────────────────────────────────────────────────────────────
export const StoreProvider = ({ children }) => {
    const [products, setProductsState] = useState(() => load('apex_products', SEED_PRODUCTS));
    const [transactions, setTransactionsState] = useState(() => load('apex_transactions', SEED_TRANSACTIONS));
    const [mechanicBills, setMechanicBillsState] = useState(() => load('apex_mechanic_bills', SEED_MECHANIC_BILLS));
    const [customers, setCustomersState] = useState(() => load('apex_customers', []));

    // Persist on every change
    useEffect(() => save('apex_products', products), [products]);
    useEffect(() => save('apex_transactions', transactions), [transactions]);
    useEffect(() => save('apex_mechanic_bills', mechanicBills), [mechanicBills]);
    useEffect(() => save('apex_customers', customers), [customers]);

    // ── Products ──────────────────────────────────────────────────────────────
    const updateProductStock = useCallback((productId, qtySold) => {
        setProductsState(prev => prev.map(p =>
            p._id === productId
                ? { ...p, quantity: Math.max(0, p.quantity - qtySold) }
                : p
        ));
    }, []);

    const updateProduct = useCallback((productId, updates) => {
        setProductsState(prev => prev.map(p =>
            p._id === productId ? { ...p, ...updates } : p
        ));
    }, []);

    const addProduct = useCallback((product) => {
        const newProduct = { ...product, _id: genId('P') };
        setProductsState(prev => [newProduct, ...prev]);
        return newProduct;
    }, []);

    const deleteProduct = useCallback((productId) => {
        setProductsState(prev => prev.filter(p => p._id !== productId));
    }, []);

    // ── Mechanic Bills ────────────────────────────────────────────────────────
    const createMechanicBill = useCallback((bill, user) => {
        const newBill = {
            ...bill,
            id: genId('MECH'),
            mechanicName: user?.name || 'Mechanic',
            status: 'pending',
            date: new Date().toISOString(),
        };
        setMechanicBillsState(prev => [newBill, ...prev]);
        return newBill;
    }, []);

    const payMechanicBill = useCallback((billId, method, cashierName) => {
        let paidBill = null;
        setMechanicBillsState(prev => prev.map(b => {
            if (b.id === billId) {
                paidBill = { ...b, status: 'paid', paidAt: new Date().toISOString(), method };
                return paidBill;
            }
            return b;
        }));

        if (paidBill) {
            const trx = {
                id: genId('TRX'),
                billId,
                type: 'mechanic_bill',
                staffName: cashierName || 'Cashier',
                staffRole: 'cashier',
                mechanicName: paidBill.mechanicName,
                customerName: paidBill.customerName,
                vehicleInfo: paidBill.vehicleInfo,
                items: paidBill.items,
                subtotal: paidBill.subtotal,
                tax: paidBill.tax,
                total: paidBill.total,
                method,
                date: new Date().toISOString(),
            };
            setTransactionsState(prev => [trx, ...prev]);
            // Deduct stock
            paidBill.items.forEach(item => {
                if (item.productId) updateProductStock(item.productId, item.qty);
            });
        }
        return paidBill;
    }, [updateProductStock]);

    // ── Transactions (cash sales) ─────────────────────────────────────────────
    const addTransaction = useCallback((trxData) => {
        const trx = {
            ...trxData,
            id: genId('TRX'),
            type: 'cash_sale',
            date: new Date().toISOString(),
        };
        setTransactionsState(prev => [trx, ...prev]);
        // Deduct stock
        (trxData.items || []).forEach(item => {
            if (item.productId) updateProductStock(item.productId, item.qty);
        });
        return trx;
    }, [updateProductStock]);

    // ── Analytics helpers ─────────────────────────────────────────────────────
    const getMonthlyStats = useCallback((year, month) => {
        const monthTrx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
        const revenue = monthTrx.reduce((s, t) => s + (t.total || 0), 0);
        const cost = monthTrx.reduce((s, t) =>
            s + (t.items || []).reduce((is, item) => {
                const prod = products.find(p => p._id === item.productId || p.name === item.name);
                return is + (prod?.costPrice || item.price * 0.65) * (item.qty || 1);
            }, 0), 0);
        return { revenue, cost, profit: revenue - cost, orders: monthTrx.length, transactions: monthTrx };
    }, [transactions, products]);

    const getDailyChartData = useCallback((days = 7) => {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const dayTrx = transactions.filter(t => {
                const td = new Date(t.date);
                return td.toDateString() === d.toDateString();
            });
            const revenue = dayTrx.reduce((s, t) => s + (t.total || 0), 0);
            const cost = dayTrx.reduce((s, t) =>
                s + (t.items || []).reduce((is, item) => {
                    const prod = products.find(p => p._id === item.productId || p.name === item.name);
                    return is + (prod?.costPrice || item.price * 0.65) * (item.qty || 1);
                }, 0), 0);
            result.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue, profit: revenue - cost, orders: dayTrx.length });
        }
        return result;
    }, [transactions, products]);

    const value = {
        products, transactions, mechanicBills, customers,
        updateProduct, addProduct, deleteProduct, updateProductStock,
        createMechanicBill, payMechanicBill,
        addTransaction,
        getMonthlyStats, getDailyChartData,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be used within StoreProvider');
    return ctx;
};
