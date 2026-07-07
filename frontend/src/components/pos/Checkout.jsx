import React, { useState, useEffect } from 'react';
import { customersAPI, ordersAPI, paymentsAPI } from '../../api/apiService';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { useCart } from '../../hooks/useCart';
import StripeCardForm from './StripeCardForm';

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

    // Card/Stripe Specific states
    const [stripeConfig, setStripeConfig] = useState({ publishableKey: '', isMock: true });
    const [clientSecret, setClientSecret] = useState('');
    const [cardError, setCardError] = useState('');
    const [loadingIntent, setLoadingIntent] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await customersAPI.getAll({ limit: 100 });
                setCustomers(response.data.data);
            } catch (error) {
                console.error('Failed to fetch customers', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // Create Stripe intent when method is set to card
    useEffect(() => {
        if (formData.paymentMethod === 'card') {
            const initCardPayment = async () => {
                try {
                    setLoadingIntent(true);
                    setCardError('');
                    
                    // Fetch configurations
                    const configRes = await paymentsAPI.getConfig();
                    setStripeConfig(configRes.data);

                    // Fetch intent
                    const intentRes = await paymentsAPI.createPaymentIntent(totalAmount);
                    setClientSecret(intentRes.data.clientSecret);
                } catch (error) {
                    console.error('Stripe initialization failed', error);
                    setCardError('Failed to initialize card payment. Please try again.');
                } finally {
                    setLoadingIntent(false);
                }
            };
            initCardPayment();
        }
    }, [formData.paymentMethod, totalAmount]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (formData.paymentMethod === 'card') return; // Handled separately by handleCardSuccess

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

    const handleCardSuccess = async (referenceId) => {
        setProcessing(true);
        try {
            const orderData = {
                customerId: formData.customerId || null,
                paymentMethod: 'card',
                paymentAmount: totalAmount,
                paymentReference: referenceId,
                status: 'completed'
            };

            const response = await ordersAPI.create(orderData);
            onComplete(response.data.data);
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Order creation failed after payment: ' + (error.response?.data?.message || error.message));
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
            <div className="modal flex flex-col" style={{ maxWidth: 440 }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: 'var(--text-primary)' }}>Checkout</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>

                <div className="modal-body flex-1 overflow-y-auto" style={{ paddingBottom: 20 }}>
                    {/* Order Summary */}
                    <div className="glass-panel p-4 mb-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-glass)' }}>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>${cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Tax (10%)</span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>${(cart.total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-glass pt-2 mt-2">
                            <span style={{ color: 'var(--text-primary)' }}>Total To Pay</span>
                            <span className="text-primary" style={{ color: 'var(--color-primary)' }}>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="mb-4">
                        <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Customer (Optional)</label>
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
                                        style={!formData.customerId ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--text-primary)' }}
                                    >
                                        Walk-in Customer
                                    </div>
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id || customer._id}
                                            className={`p-2 cursor-pointer hover:bg-hover flex justify-between ${formData.customerId === (customer.id || customer._id) ? 'bg-primary text-white' : ''}`}
                                            onClick={() => setFormData({ ...formData, customerId: customer.id || customer._id })}
                                            style={formData.customerId === (customer.id || customer._id) ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--text-primary)' }}
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
                        <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['cash', 'card', 'mobile'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    className={`p-3 border rounded-md capitalize transition-colors ${formData.paymentMethod === method ? 'btn-primary' : 'border-glass hover:bg-hover'}`}
                                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                    style={formData.paymentMethod === method ? { background: 'var(--color-primary)', color: '#fff', border: 'none' } : { color: 'var(--text-primary)', background: 'transparent' }}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stripe Card Element or Mock simulator wrapper */}
                    {formData.paymentMethod === 'card' && (
                        <div className="mb-4 pt-2 border-t border-glass">
                            {loadingIntent ? (
                                <div className="p-4 text-center">
                                    <Loader size="md" />
                                    <p className="text-xs text-muted mt-2">Loading card terminal...</p>
                                </div>
                            ) : cardError ? (
                                <div className="text-danger text-xs font-semibold p-2 rounded bg-danger/10 border border-danger/30">
                                    ❌ {cardError}
                                </div>
                            ) : clientSecret ? (
                                <StripeCardForm
                                    isMock={stripeConfig.isMock}
                                    publishableKey={stripeConfig.publishableKey}
                                    clientSecret={clientSecret}
                                    amount={totalAmount.toFixed(2)}
                                    onSuccess={handleCardSuccess}
                                    onCancel={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                                />
                            ) : null}
                        </div>
                    )}

                    {/* Amount Paid (Cash & Mobile only) */}
                    {formData.paymentMethod !== 'card' && (
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
                    )}

                    {/* Change (Cash & Mobile only) */}
                    {formData.paymentMethod !== 'card' && (
                        <div className="text-right text-sm text-muted mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Change: <span className="font-bold text-main" style={{ color: 'var(--text-primary)' }}>
                                ${(parseFloat(formData.paymentAmount || 0) - totalAmount).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer buttons (Cash & Mobile only; Card handles internally) */}
                {formData.paymentMethod !== 'card' && (
                    <div className="modal-footer">
                        <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Processing...' : 'Complete Order'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
