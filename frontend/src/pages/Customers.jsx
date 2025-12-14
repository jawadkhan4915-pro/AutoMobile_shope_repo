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
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customersAPI.getAll();
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
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
                address: customer.address || ''
            });
        } else {
            setCurrentCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
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
                // Update Logic
                // await customersAPI.update(currentCustomer._id, formData);
                console.log('Update customer:', currentCustomer._id, formData);
                setCustomers(prev => prev.map(c => c._id === currentCustomer._id ? { ...c, ...formData } : c));
            } else {
                // Add Logic
                // await customersAPI.create(formData);
                console.log('Create customer:', formData);
                setCustomers(prev => [...prev, { _id: Date.now().toString(), ...formData, totalOrders: 0, totalSpent: 0 }]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save customer', error);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        `${customer.name} ${customer.email} ${customer.phone || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-slide-in-down">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        Customers
                    </h1>
                    <p className="text-muted mt-1">Manage customer profiles and history</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary hover-glow flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Add New Customer
                </button>
            </div>

            {/* Filter */}
            <div className="glass-panel p-4 mb-6 animate-slide-in-up stagger-1">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input mb-0"
                        style={{ paddingLeft: '40px' }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">🔍</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="stats-card hover-lift animate-slide-in-up stagger-1">
                    <p className="stats-card-title">Total Customers</p>
                    <p className="stats-card-value text-primary">{customers.length}</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-2" style={{ '--color-primary': '#00FF9D' }}>
                    <p className="stats-card-title">Active Today</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        12
                    </p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-3" style={{ '--color-primary': '#FF0055' }}>
                    <p className="stats-card-title">New this Month</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FF0055)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        5
                    </p>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer, index) => (
                    <div key={customer._id} className="card hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="card-body">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-primary">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{customer.name}</h3>
                                        <div className="text-xs text-muted">Customer since {new Date(customer.createdAt || Date.now()).getFullYear()}</div>
                                    </div>
                                </div>
                                <span className={`badge ${customer.totalOrders > 0 ? 'badge-success' : 'badge-secondary'}`}>
                                    {customer.totalOrders > 0 ? 'Active' : 'New'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <span>📧</span> {customer.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <span>📱</span> {customer.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted truncate">
                                    <span>📍</span> {customer.address || 'No address'}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="text-center">
                                    <div className="text-xs text-muted">Orders</div>
                                    <div className="font-bold">{customer.totalOrders || 0}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-muted">Spent</div>
                                    <div className="font-bold text-success">${(customer.totalSpent || 0).toFixed(2)}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(customer)}
                                        className="p-2 rounded hover:bg-white/10 text-primary transition-colors"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="p-2 rounded hover:bg-white/10 text-danger transition-colors"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentCustomer ? "Edit Customer" : "Add New Customer"}
                footer={
                    <>
                        <button onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary">
                            {currentCustomer ? "Update Profile" : "Create Profile"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <div>
                        <label className="form-label">Shipping Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="form-input"
                            rows="3"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
