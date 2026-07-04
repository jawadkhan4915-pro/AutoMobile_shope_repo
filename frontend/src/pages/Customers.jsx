import React, { useState, useEffect } from 'react';
import { customersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        vehicleModel: '2020 Honda Civic 2.0L',
        licensePlate: 'ABC-9821',
        loyaltyTier: 'Gold'
    });

    const defaultCustomerList = [
        { _id: '1', name: 'Alexander Wright', email: 'alex.wright@gmail.com', phone: '+1 (555) 234-9012', address: '742 Evergreen Terrace, San Jose, CA', vehicleModel: '2021 Toyota Camry SE', licensePlate: '7XYZ90', totalOrders: 14, totalSpent: 2840.00, loyaltyTier: 'Platinum' },
        { _id: '2', name: 'Sophia Martinez', email: 'sophia.m@outlook.com', phone: '+1 (555) 876-5432', address: '1204 Pine Street, San Francisco, CA', vehicleModel: '2019 Honda Accord Sport', licensePlate: '8ABC12', totalOrders: 8, totalSpent: 1250.50, loyaltyTier: 'Gold' },
        { _id: '3', name: 'Marcus Brody', email: 'marcus.brody@yahoo.com', phone: '+1 (555) 345-6789', address: '88 Ocean Avenue, Oakland, CA', vehicleModel: '2018 Ford F-150 Lariat', licensePlate: 'TRK-901', totalOrders: 22, totalSpent: 4920.00, loyaltyTier: 'Platinum' },
        { _id: '4', name: 'Elena Rostova', email: 'elena.rostova@tech.io', phone: '+1 (555) 998-1122', address: '302 Silicon Ave, Palo Alto, CA', vehicleModel: '2022 BMW M3 Competition', licensePlate: 'M3-POWER', totalOrders: 6, totalSpent: 3100.00, loyaltyTier: 'Silver' },
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customersAPI.getAll();
            if (response.data?.data && response.data.data.length > 0) {
                setCustomers(response.data.data);
            } else {
                setCustomers(defaultCustomerList);
            }
        } catch (error) {
            console.error('Failed to fetch customers, using default list:', error);
            setCustomers(defaultCustomerList);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setCurrentCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone || '',
                address: customer.address || '',
                vehicleModel: customer.vehicleModel || '2020 Honda Civic 2.0L',
                licensePlate: customer.licensePlate || 'ABC-9821',
                loyaltyTier: customer.loyaltyTier || 'Gold'
            });
        } else {
            setCurrentCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                vehicleModel: '2021 Toyota Camry SE',
                licensePlate: 'CAL-8921',
                loyaltyTier: 'Silver'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCustomer) {
                setCustomers(prev => prev.map(c => c._id === currentCustomer._id ? { ...c, ...formData } : c));
            } else {
                setCustomers(prev => [...prev, { _id: Date.now().toString(), ...formData, totalOrders: 1, totalSpent: 0 }]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save customer', error);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        `${customer.name} ${customer.email} ${customer.phone || ''} ${customer.vehicleModel || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                        Customer Directory & Vehicle Profiles
                    </h1>
                    <p className="text-sm text-muted">
                        Manage vehicle owners, registered automobiles, loyalty tiers, and order histories.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary hover-glow flex items-center gap-2"
                >
                    <span>👤</span> Register Customer
                </button>
            </div>

            {/* Filter */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-3 text-muted">🔍</span>
                    <input
                        type="text"
                        placeholder="Search name, phone, email, or car model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-10 mb-0"
                    />
                </div>

                <div className="flex gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Total Registered: <strong className="text-white">{customers.length}</strong></span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent"></span> Platinum VIPs: <strong className="text-white">{customers.filter(c => c.loyaltyTier === 'Platinum').length}</strong></span>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <div key={customer._id} className="card hover-lift flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black shadow-lg" style={{ background: 'var(--color-primary)' }}>
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-white">{customer.name}</h3>
                                        <p className="text-xs text-muted">Client ID: #{customer._id.slice(-6)}</p>
                                    </div>
                                </div>
                                <span className={`badge ${customer.loyaltyTier === 'Platinum' ? 'badge-danger' : 'badge-success'}`}>
                                    {customer.loyaltyTier || 'Gold'} VIP
                                </span>
                            </div>

                            {/* Registered Vehicle Box */}
                            <div className="p-3 rounded-lg bg-black/40 border border-glass mb-4 space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted flex items-center gap-1">🚘 Vehicle Registered</span>
                                    <span className="font-mono font-bold text-primary">{customer.licensePlate || 'N/A'}</span>
                                </div>
                                <p className="font-bold text-white text-sm">{customer.vehicleModel || '2020 Toyota Camry'}</p>
                            </div>

                            <div className="space-y-1.5 text-xs text-muted mb-4">
                                <div className="flex items-center gap-2"><span>📧</span> <span className="text-white truncate">{customer.email}</span></div>
                                <div className="flex items-center gap-2"><span>📱</span> <span className="text-white">{customer.phone}</span></div>
                                <div className="flex items-center gap-2"><span>📍</span> <span className="text-white truncate">{customer.address}</span></div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-glass flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-muted">Total Spent</p>
                                <p className="text-base font-extrabold text-success">${(customer.totalSpent || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-muted">Invoices</p>
                                <p className="text-sm font-bold text-white text-center">{customer.totalOrders || 1} Orders</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(customer)} className="btn btn-sm btn-outline">Edit</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentCustomer ? "Edit Customer & Vehicle" : "Register New Client & Vehicle"}
                footer={
                    <>
                        <button onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary">
                            {currentCustomer ? "Update Details" : "Register Client"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Loyalty Tier</label>
                            <select
                                name="loyaltyTier"
                                value={formData.loyaltyTier}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="Silver">Silver Member</option>
                                <option value="Gold">Gold Member</option>
                                <option value="Platinum">Platinum VIP</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Vehicle Make, Model & Year</label>
                            <input
                                type="text"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="e.g. 2021 Honda Civic EX"
                            />
                        </div>
                        <div>
                            <label className="form-label">License Plate / VIN</label>
                            <input
                                type="text"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="e.g. 7XYZ90"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Shipping / Home Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="form-input h-20 resize-none"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
