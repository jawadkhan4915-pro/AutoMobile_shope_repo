import React, { useState, useEffect } from 'react';
import { customersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customersAPI.getAll({ limit: 100 });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-slide-in-down">
                <div>
                    <h1
                        className="text-3xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Customers
                    </h1>
                    <p className="text-muted mt-1">Manage your customer database</p>
                </div>
                <button
                    className="btn btn-primary hover-glow"
                    style={{
                        padding: '12px 24px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>➕</span>
                    <span>Add Customer</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 animate-slide-in-up stagger-1">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{
                            paddingLeft: '45px',
                            fontSize: '0.95rem'
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.2rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        🔍
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stats-card hover-lift animate-slide-in-up stagger-1">
                    <p className="stats-card-title">Total Customers</p>
                    <p className="stats-card-value text-primary">{customers.length}</p>
                    <p className="stats-card-change">Registered users</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-2">
                    <p className="stats-card-title">Active Today</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {Math.floor(customers.length * 0.3)}
                    </p>
                    <p className="stats-card-change">Recent activity</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-3">
                    <p className="stats-card-title">New This Month</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {Math.floor(customers.length * 0.15)}
                    </p>
                    <p className="stats-card-change">Growth rate</p>
                </div>
            </div>

            {/* Customers Table */}
            <div className="card hover-lift animate-slide-in-up stagger-2">
                <div className="card-header">
                    <h3 className="card-title">All Customers ({filteredCustomers.length})</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8">
                                        <p className="text-muted">
                                            {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer, index) => (
                                    <tr
                                        key={customer._id || index}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                                                    style={{
                                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
                                                    }}
                                                >
                                                    {customer.avatar ? (
                                                        <img
                                                            src={customer.avatarUrl}
                                                            alt=""
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        customer.firstName?.charAt(0)?.toUpperCase() || 'C'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        Customer ID: #{customer._id?.slice(-6) || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                                                    📧 {customer.email}
                                                </p>
                                                <p className="text-sm text-muted">
                                                    📱 {customer.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm text-muted">
                                                {customer.address || 'No address provided'}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'rgba(0, 240, 255, 0.1)',
                                                        border: '1px solid rgba(0, 240, 255, 0.3)',
                                                        color: 'var(--color-primary)',
                                                        padding: '6px 12px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'rgba(255, 0, 85, 0.1)',
                                                        border: '1px solid rgba(255, 0, 85, 0.3)',
                                                        color: 'var(--color-danger)',
                                                        padding: '6px 12px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;
