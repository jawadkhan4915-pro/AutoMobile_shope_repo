import React, { useState, useEffect } from 'react';
import { customersAPI, ordersAPI } from '../../../api/apiService';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Loader from '../../common/Loader';
import { useCart } from '../../../hooks/useCart';

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
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Checkout</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tax (10%)</span>
                            <span className="font-medium">${(cart.total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                            <span>Total To Pay</span>
                            <span className="text-primary">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="mb-6">
                        <label className="form-label">Customer (Optional)</label>
                        <input
                            type="text"
                            placeholder="Search customer..."
                            className="form-input mb-2"
                            value={searchCustomer}
                            onChange={(e) => setSearchCustomer(e.target.value)}
                        />

                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                            {loading ? (
                                <div className="p-2 text-center"><Loader size="sm" /></div>
                            ) : (
                                <>
                                    <div
                                        className={`p-2 cursor-pointer hover:bg-gray-50 ${!formData.customerId ? 'bg-primary-light text-white' : ''}`}
                                        onClick={() => setFormData({ ...formData, customerId: '' })}
                                    >
                                        Walk-in Customer
                                    </div>
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id || customer._id}
                                            className={`p-2 cursor-pointer hover:bg-gray-50 flex justify-between ${formData.customerId === (customer.id || customer._id) ? 'bg-primary-light text-white' : ''}`}
                                            onClick={() => setFormData({ ...formData, customerId: customer.id || customer._id })}
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
                    <div className="mb-6">
                        <label className="form-label">Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['cash', 'card', 'mobile'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    className={`p-3 border rounded-md capitalize ${formData.paymentMethod === method ? 'border-primary bg-primary-light text-white' : 'border-gray-200 hover:bg-gray-50'}`}
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
                    <div className="text-right text-sm text-gray-600 mb-2">
                        Change: <span className="font-bold text-gray-900">
                            ${(parseFloat(formData.paymentAmount || 0) - totalAmount).toFixed(2)}
                        </span>
                    </div>

                </form>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
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
