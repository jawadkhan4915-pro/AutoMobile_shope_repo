import React, { useState, useEffect } from 'react';
import { customersAPI, ordersAPI } from '../../api/apiService';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { useCart } from '../../hooks/useCart';

const Checkout = ({ onClose, onComplete }) => {
    const { cart } = useCart();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState('');

    const [formData, setFormData] = useState({
        customerId: '',
        paymentMethod: 'cash',
        paymentAmount: (cart.total * 1.1).toFixed(2),
        notes: ''
    });

    const totalAmount = cart.total * 1.1;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await customersAPI.getAll({ limit: 100 }); // In production, use debounced search
                setCustomers(response.data.data);
            } catch (error) {
                console.error('Failed to fetch customers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const orderData = {
                customerId: formData.customerId || null,
                paymentMethod: formData.paymentMethod,
                paymentAmount: parseFloat(formData.paymentAmount),
                status: 'completed'
            };

            const response = await ordersAPI.create(orderData);
            onComplete(response.data.data);
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.firstName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone?.includes(searchCustomer)
    );

    return (
        <div className="modal-backdrop">
            <div className="modal flex flex-col">
                <div className="modal-header">
                    <h2 className="modal-title">Checkout</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body flex-1 overflow-y-auto">
                    {/* Order Summary */}
                    <div className="glass-panel p-4 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span className="font-medium">${cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Tax (10%)</span>
                            <span className="font-medium">${(cart.total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-glass pt-2 mt-2">
                            <span>Total To Pay</span>
                            <span className="text-primary">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="mb-4">
                        <label className="form-label">Customer (Optional)</label>
                        <input
                            type="text"
                            placeholder="Search customer..."
                            className="form-input mb-2"
                            value={searchCustomer}
                            onChange={(e) => setSearchCustomer(e.target.value)}
                        />

                        <div className="max-h-32 overflow-y-auto border border-glass rounded-md">
                            {loading ? (
                                <div className="p-2 text-center"><Loader size="sm" /></div>
                            ) : (
                                <>
                                    <div
                                        className={`p-2 cursor-pointer hover:bg-hover ${!formData.customerId ? 'bg-primary text-white' : ''}`}
                                        onClick={() => setFormData({ ...formData, customerId: '' })}
                                        style={!formData.customerId ? { background: 'var(--color-primary)' } : {}}
                                    >
                                        Walk-in Customer
                                    </div>
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id || customer._id}
                                            className={`p-2 cursor-pointer hover:bg-hover flex justify-between ${formData.customerId === (customer.id || customer._id) ? 'bg-primary text-white' : ''}`}
                                            onClick={() => setFormData({ ...formData, customerId: customer.id || customer._id })}
                                            style={formData.customerId === (customer.id || customer._id) ? { background: 'var(--color-primary)' } : {}}
                                        >
                                            <span>{customer.firstName} {customer.lastName}</span>
                                            <span className="text-xs opacity-75">{customer.phone}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                        <label className="form-label">Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['cash', 'card', 'mobile'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    className={`p-3 border rounded-md capitalize transition-colors ${formData.paymentMethod === method ? 'btn-primary' : 'border-glass hover:bg-hover'}`}
                                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Paid */}
                    <div className="mb-4">
                        <Input
                            label="Amount Tendered"
                            type="number"
                            step="0.01"
                            value={formData.paymentAmount}
                            onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                            required
                        />
                    </div>

                    {/* Change */}
                    <div className="text-right text-sm text-muted mb-2">
                        Change: <span className="font-bold text-main">
                            ${(parseFloat(formData.paymentAmount || 0) - totalAmount).toFixed(2)}
                        </span>
                    </div>

                </form>

                <div className="modal-footer">
                    <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Processing...' : 'Complete Order'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
