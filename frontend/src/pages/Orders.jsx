import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import ReceiptModal from '../components/pos/ReceiptModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [printReceiptOrder, setPrintReceiptOrder] = useState(null);

    const defaultOrdersList = [
        { 
            _id: 'ORD-9021', 
            customerName: 'Alexander Wright', 
            paymentMethod: 'card', 
            totalAmount: 325.00, 
            status: 'Completed', 
            createdAt: new Date().toISOString(),
            items: [
                { productName: 'Brembo Ceramic Brake Pads (Front)', quantity: 2, price: 85.00 },
                { productName: 'Castrol Edge 5W-30 Synthetic Oil', quantity: 3, price: 45.00 }
            ]
        },
        { 
            _id: 'ORD-9022', 
            customerName: 'Sophia Martinez', 
            paymentMethod: 'cash', 
            totalAmount: 180.00, 
            status: 'Completed', 
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            items: [
                { productName: 'Bosch Iridium Spark Plug Set', quantity: 2, price: 48.00 },
                { productName: 'K&N High-Flow Air Filter', quantity: 1, price: 62.00 }
            ]
        },
        { 
            _id: 'ORD-9023', 
            customerName: 'Marcus Brody', 
            paymentMethod: 'mobile', 
            totalAmount: 480.00, 
            status: 'Pending', 
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            items: [
                { productName: 'Michelin Pilot Sport 4S Tire', quantity: 2, price: 240.00 }
            ]
        },
        { 
            _id: 'ORD-9024', 
            customerName: 'Walk-in Customer', 
            paymentMethod: 'cash', 
            totalAmount: 220.00, 
            status: 'Completed', 
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            items: [
                { productName: 'Optima RedTop AGM Battery', quantity: 1, price: 220.00 }
            ]
        }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            if (response.data?.data && response.data.data.length > 0) {
                setOrders(response.data.data);
            } else {
                setOrders(defaultOrdersList);
            }
        } catch (error) {
            console.error('Failed to fetch orders, using default list', error);
            setOrders(defaultOrdersList);
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
        const updatedOrder = { ...selectedOrder, status: newStatus };
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'cancelled': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="animate-fade-in p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                        Invoices & Order Registry
                    </h1>
                    <p className="text-sm text-muted">
                        Review transactions, print invoices, and update order fulfillment statuses.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-3 text-muted">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Invoice # or Client name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-10 mb-0"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'pending', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize border transition-all ${
                                statusFilter === status ? 'bg-primary text-black border-primary font-bold' : 'bg-panel text-muted border-glass hover:text-white'
                            }`}
                            style={statusFilter === status ? { background: 'var(--color-primary)' } : {}}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client Name</th>
                                <th>Date & Time</th>
                                <th>Payment Method</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-mono text-sm text-primary font-bold">#{order._id}</td>
                                    <td>
                                        <div className="font-semibold text-white">{order.customerName || 'Walk-in Customer'}</div>
                                    </td>
                                    <td className="text-xs text-muted">
                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td>
                                        <span className="px-2 py-0.5 text-xs rounded-full border border-glass uppercase font-mono text-muted">
                                            {order.paymentMethod || 'Cash'}
                                        </span>
                                    </td>
                                    <td className="font-extrabold text-primary">${order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="btn btn-sm btn-outline"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => setPrintReceiptOrder(order)}
                                                className="btn btn-sm btn-secondary"
                                            >
                                                🖨️ Invoice
                                            </button>
                                        </div>
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
                title={`Order Invoice #${selectedOrder?._id}`}
                footer={
                    <div className="flex justify-between w-full items-center">
                        <button 
                            onClick={() => {
                                setPrintReceiptOrder(selectedOrder);
                                handleCloseModal();
                            }}
                            className="btn btn-outline flex items-center gap-2"
                        >
                            <span>🖨️</span> Print Invoice
                        </button>
                        <button onClick={handleCloseModal} className="btn btn-primary">Close</button>
                    </div>
                }
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="glass-panel p-3 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted">Client</p>
                                <p className="font-bold text-white text-base">{selectedOrder.customerName || 'Walk-in Customer'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Status</p>
                                <span className={`badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                            </div>
                        </div>

                        {/* Status Change Buttons */}
                        <div>
                            <p className="text-xs text-muted mb-2 font-bold uppercase">Update Order Status</p>
                            <div className="flex gap-2">
                                {['Pending', 'Completed', 'Cancelled'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => handleStatusUpdate(st)}
                                        className={`flex-1 py-1.5 text-xs rounded border transition-all ${
                                            selectedOrder.status === st ? 'bg-primary text-black font-bold border-primary' : 'bg-transparent border-glass text-muted hover:text-white'
                                        }`}
                                        style={selectedOrder.status === st ? { background: 'var(--color-primary)' } : {}}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border border-glass rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-black/40 text-muted border-b border-glass">
                                    <tr>
                                        <th className="p-2 text-left">Item Description</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Price</th>
                                        <th className="p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedOrder.items || []).map((item, idx) => (
                                        <tr key={idx} className="border-b border-glass text-white">
                                            <td className="p-2">{item.productName || 'Spare Part'}</td>
                                            <td className="p-2 text-center">x{item.quantity}</td>
                                            <td className="p-2 text-right text-muted">${item.price?.toFixed(2)}</td>
                                            <td className="p-2 text-right font-bold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Printable Digital Receipt Modal */}
            {printReceiptOrder && (
                <ReceiptModal
                    order={printReceiptOrder}
                    onClose={() => setPrintReceiptOrder(null)}
                />
            )}
        </div>
    );
};

export default Orders;
