import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll({ limit: 50 });
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = `${order.id} ${order.customerName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

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
                        Orders
                    </h1>
                    <p className="text-muted mt-1">Track and manage all orders</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slide-in-up stagger-1">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search orders by ID or customer name..."
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
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input"
                    style={{
                        width: 'auto',
                        minWidth: '200px',
                        fontSize: '0.95rem'
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="stats-card hover-lift animate-slide-in-up stagger-1">
                    <p className="stats-card-title">Total Orders</p>
                    <p className="stats-card-value text-primary">{orders.length}</p>
                    <p className="stats-card-change">All time</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-2">
                    <p className="stats-card-title">Total Revenue</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${totalRevenue.toFixed(2)}
                    </p>
                    <p className="stats-card-change">Total sales</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-3">
                    <p className="stats-card-title">Completed</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {completedOrders}
                    </p>
                    <p className="stats-card-change">Successful orders</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-4">
                    <p className="stats-card-title">Pending</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {pendingOrders}
                    </p>
                    <p className="stats-card-change">Awaiting completion</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card hover-lift animate-slide-in-up stagger-2">
                <div className="card-header">
                    <h3 className="card-title">Order History ({filteredOrders.length})</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order Details</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <p className="text-muted">
                                            {searchTerm || statusFilter !== 'all' ? 'No orders found matching your filters' : 'No orders yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <tr
                                        key={order._id || index}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td>
                                            <div>
                                                <p className="font-mono font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                                                    #{order._id?.substring(order._id.length - 8) || order.id?.substring(0, 8) || 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {order.items?.length || 0} items
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                                    style={{
                                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                                                    }}
                                                >
                                                    {order.customerName?.charAt(0)?.toUpperCase() || 'C'}
                                                </div>
                                                <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                                                    {order.customerName || 'Guest'}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="font-bold text-lg" style={{ color: 'var(--color-success)' }}>
                                                ${order.totalPrice?.toFixed(2) || '0.00'}
                                            </p>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                        order.status === 'pending' ? 'badge-warning' :
                                                            'badge-danger'
                                                    }`}
                                            >
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </td>
                                        <td>
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
                                                👁️ View
                                            </button>
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

export default Orders;
