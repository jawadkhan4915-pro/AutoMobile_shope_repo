import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedOrder) return;
        try {
            // Optimistic update
            const updatedOrder = { ...selectedOrder, status: newStatus };
            setOrders(prev => prev.map(o => o._id === selectedOrder._id ? updatedOrder : o));
            setSelectedOrder(updatedOrder);

            // API Call
            // await ordersAPI.updateStatus(selectedOrder._id, newStatus);
            console.log(`Updated order ${selectedOrder._id} to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            fetchOrders(); // Revert on failure
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'cancelled': return 'badge-danger';
            case 'processing': return 'badge-info text-blue-400 border-blue-400 bg-blue-400/10 shadow-blue-400/10';
            default: return 'badge-secondary';
        }
    };

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
                        Orders Management
                    </h1>
                    <p className="text-muted mt-1">Track and manage customer orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center animate-slide-in-up stagger-1">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input mb-0"
                        style={{ paddingLeft: '40px' }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">🔍</span>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`btn btn-sm capitalize ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stats-card hover-lift animate-slide-in-up stagger-1">
                    <p className="stats-card-title">Total Orders</p>
                    <p className="stats-card-value text-primary">{orders.length}</p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-2" style={{ '--color-primary': '#FFB800' }}>
                    <p className="stats-card-title">Pending</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {orders.filter(o => o.status === 'Pending').length}
                    </p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-3" style={{ '--color-primary': '#00FF9D' }}>
                    <p className="stats-card-title">Completed</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {orders.filter(o => o.status === 'Completed').length}
                    </p>
                </div>
                <div className="stats-card hover-lift animate-slide-in-up stagger-4" style={{ '--color-primary': '#9ca3af' }}>
                    <p className="stats-card-title">Revenue</p>
                    <p className="stats-card-value text-white">
                        ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card animate-slide-in-up stagger-2">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => (
                                <tr key={order._id} className="hover:bg-white/5 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <td className="font-mono text-sm text-primary">#{order._id.slice(-6)}</td>
                                    <td>
                                        <div className="font-semibold">{order.customer?.name || 'Walk-in Customer'}</div>
                                        <div className="text-xs text-muted">{order.customer?.email}</div>
                                    </td>
                                    <td className="text-sm text-muted">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="font-bold">${order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="btn btn-sm btn-secondary hover:text-primary transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseModal}
                title={`Order #${selectedOrder?._id.slice(-6)}`}
                footer={
                    <div className="flex justify-between w-full items-center">
                        <div className="text-muted text-sm">
                            Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                        <button onClick={handleCloseModal} className="btn btn-primary">Close</button>
                    </div>
                }
            >
                {selectedOrder && (
                    <div className="flex flex-col gap-6">
                        {/* Status Bar */}
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-muted uppercase font-bold tracking-wider">Status</label>
                                <span className={`badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                            </div>
                            <div className="flex gap-2">
                                {['Pending', 'Processing', 'Completed', 'Cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        className={`flex-1 text-xs py-2 rounded border transition-all ${selectedOrder.status === status
                                                ? 'bg-primary/20 border-primary text-primary font-bold'
                                                : 'bg-transparent border-white/10 text-muted hover:bg-white/5'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <h4 className="text-sm font-bold text-primary mb-1">Customer</h4>
                                <p className="font-semibold">{selectedOrder.customer?.name || 'Walk-in Customer'}</p>
                                <p className="text-sm text-muted">{selectedOrder.customer?.email}</p>
                                <p className="text-sm text-muted">{selectedOrder.customer?.phone}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <h4 className="text-sm font-bold text-primary mb-1">Shipping Details</h4>
                                <p className="text-sm text-muted">No address provided</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Order Items</h4>
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-left text-muted">
                                        <tr>
                                            <th className="p-2">Item</th>
                                            <th className="p-2 text-center">Qty</th>
                                            <th className="p-2 text-right">Price</th>
                                            <th className="p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/5">
                                                <td className="p-2 font-medium">{item.productName || `Product #${item.product}`}</td>
                                                <td className="p-2 text-center text-muted">x{item.quantity}</td>
                                                <td className="p-2 text-right text-muted">${item.price?.toFixed(2)}</td>
                                                <td className="p-2 text-right font-bold text-white">${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-white/5 font-bold">
                                        <tr>
                                            <td colSpan="3" className="p-3 text-right text-muted">Subtotal</td>
                                            <td className="p-3 text-right text-white">${selectedOrder.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
