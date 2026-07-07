import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Real Stripe Checkout Form
const StripeForm = ({ clientSecret, amount, onSuccess, onCancel, processing, setProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setErrorMsg('');

        try {
            const cardElement = elements.getElement(CardElement);
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                setErrorMsg(error.message);
                setProcessing(false);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            }
        } catch (err) {
            setErrorMsg('An unexpected error occurred: ' + err.message);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="glass-panel p-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                <CardElement options={{
                    style: {
                        base: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#000000',
                            fontFamily: 'var(--font-family), sans-serif',
                            fontSmoothing: 'antialiased',
                            fontSize: '15px',
                            '::placeholder': {
                                color: '#94a3b8',
                            }
                        },
                        invalid: {
                            color: '#ef4444',
                            iconColor: '#ef4444'
                        }
                    }
                }} />
            </div>

            {errorMsg && (
                <div className="text-danger text-xs font-semibold p-2 rounded bg-danger/10 border border-danger/30">
                    ❌ {errorMsg}
                </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="btn btn-primary flex-1"
                    style={{ padding: '8px 16px' }}
                >
                    {processing ? 'Processing Card...' : `Pay $${amount}`}
                </button>
            </div>
        </form>
    );
};

// Premium Interactive Card Simulator
const CardSimulatorForm = ({ amount, onSuccess, onCancel, processing, setProcessing }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const cardType = useMemo(() => {
        const cleaned = cardNumber.replace(/\D/g, '');
        if (cleaned.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'amex';
        if (cleaned.startsWith('6')) return 'discover';
        return 'unknown';
    }, [cardNumber]);

    const formattedCardNumber = useMemo(() => {
        const cleaned = cardNumber.replace(/\D/g, '').substring(0, 16);
        const parts = [];
        for (let i = 0; i < cleaned.length; i += 4) {
            parts.push(cleaned.substring(i, i + 4));
        }
        return parts.join(' ');
    }, [cardNumber]);

    const handleCardNumberChange = (e) => {
        const input = e.target.value.replace(/\D/g, '');
        setCardNumber(input);
    };

    const handleExpiryChange = (e) => {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length > 4) input = input.substring(0, 4);
        if (input.length > 2) {
            setExpiry(`${input.substring(0, 2)}/${input.substring(2)}`);
        } else {
            setExpiry(input);
        }
    };

    const handleCvcChange = (e) => {
        const input = e.target.value.replace(/\D/g, '').substring(0, 4);
        setCvc(input);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        const cleanCard = cardNumber.replace(/\D/g, '');
        const cleanExpiry = expiry.replace(/\D/g, '');

        if (cleanCard.length < 16) {
            setErrorMsg('Invalid card number. Must be 16 digits.');
            return;
        }
        if (cleanExpiry.length < 4) {
            setErrorMsg('Invalid expiry date. Must be MM/YY.');
            return;
        }
        if (cvc.length < 3) {
            setErrorMsg('Invalid CVC. Must be 3 or 4 digits.');
            return;
        }

        setProcessing(true);

        // Simulate network latency and card auth
        setTimeout(() => {
            setProcessing(false);
            const mockTxId = `ch_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            onSuccess(mockTxId);
        }, 2200);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Custom Interactive Styles */}
            <style>{`
                .payment-card-container {
                    perspective: 1000px;
                    width: 100%;
                    max-width: 320px;
                    margin: 0 auto 20px;
                    height: 190px;
                }
                .payment-card {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                }
                .payment-card.flipped {
                    transform: rotateY(180deg);
                }
                .card-side {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    color: white;
                    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
                    box-sizing: border-box;
                }
                .card-back {
                    transform: rotateY(180deg);
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    padding: 0;
                    justify-content: flex-start;
                    gap: 15px;
                }
                .card-brand {
                    height: 24px;
                    font-weight: 800;
                    font-size: 1.25rem;
                    text-align: right;
                    font-style: italic;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
                .card-chip {
                    width: 40px;
                    height: 30px;
                    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
                    border-radius: 6px;
                    position: relative;
                    box-shadow: inset 1px 1px 2px rgba(255,255,255,0.4);
                }
                .card-chip::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 16px;
                    border: 1px solid rgba(0,0,0,0.15);
                    top: 7px;
                    left: 10px;
                    border-radius: 3px;
                }
                .card-display-number {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 1.35rem;
                    letter-spacing: 0.12em;
                    word-spacing: 0.1em;
                    margin: 15px 0 5px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                .card-holder-section {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .card-signature-strip {
                    width: 100%;
                    height: 40px;
                    background: rgba(255,255,255,0.08);
                    margin-top: 25px;
                }
                .card-signature-val {
                    background: white;
                    color: black;
                    padding: 4px 10px;
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: bold;
                    font-size: 1rem;
                    text-align: right;
                    width: 70%;
                    align-self: flex-end;
                    border-radius: 4px;
                    margin-right: 20px;
                    letter-spacing: 0.1em;
                }
                .card-back-banner {
                    width: 100%;
                    height: 36px;
                    background: #111;
                    margin-top: 15px;
                }
            `}</style>

            {/* Virtual Card Graphic */}
            <div className="payment-card-container">
                <div className={`payment-card ${isFlipped ? 'flipped' : ''}`}>
                    {/* Front Side */}
                    <div className="card-side card-front">
                        <div className="flex justify-between items-center">
                            <div className="card-chip"></div>
                            <div className="card-brand uppercase">
                                {cardType === 'visa' && '💳 Visa'}
                                {cardType === 'mastercard' && '💳 MC'}
                                {cardType === 'amex' && '💳 Amex'}
                                {cardType === 'discover' && '💳 Disc'}
                                {cardType === 'unknown' && '💳 Card'}
                            </div>
                        </div>
                        <div className="card-display-number">
                            {formattedCardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="card-holder-section">
                            <div>
                                <p style={{ fontSize: '0.55rem', opacity: 0.6, margin: 0 }}>Card Holder</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>{cardName || 'Alexander Wright'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.55rem', opacity: 0.6, margin: 0 }}>Expires</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>{expiry || 'MM/YY'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div className="card-side card-back">
                        <div className="card-back-banner"></div>
                        <p style={{ fontSize: '0.55rem', color: '#94a3b8', margin: '10px 20px 0 0', textAlign: 'right', textTransform: 'uppercase' }}>CVC/CVV Code</p>
                        <div className="card-signature-val">{cvc || '•••'}</div>
                    </div>
                </div>
            </div>

            {/* Simulated Inputs */}
            <div className="flex flex-col gap-3">
                <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Cardholder Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Alexander Wright"
                        className="form-input"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        onFocus={() => setIsFlipped(false)}
                        required
                        disabled={processing}
                    />
                </div>
                <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                    <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="form-input"
                        value={formattedCardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setIsFlipped(false)}
                        maxLength={19}
                        required
                        disabled={processing}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiration (MM/YY)</label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            className="form-input"
                            value={expiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setIsFlipped(false)}
                            maxLength={5}
                            required
                            disabled={processing}
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>CVC / CVV</label>
                        <input
                            type="text"
                            placeholder="123"
                            className="form-input"
                            value={cvc}
                            onChange={handleCvcChange}
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)}
                            maxLength={4}
                            required
                            disabled={processing}
                        />
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="text-danger text-xs font-semibold p-2 rounded bg-danger/10 border border-danger/30">
                    ❌ {errorMsg}
                </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="btn btn-primary flex-1"
                    style={{ padding: '8px 16px' }}
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span> Processing Card...
                        </span>
                    ) : `Pay $${amount}`}
                </button>
            </div>
        </form>
    );
};

// Main Stripe Wrapper Component
const StripeCardForm = ({ clientSecret, isMock, publishableKey, amount, onSuccess, onCancel }) => {
    const [processing, setProcessing] = useState(false);

    // Initialize Stripe promise memoized if real stripe is loaded
    const stripePromise = useMemo(() => {
        if (!isMock && publishableKey && publishableKey.startsWith('pk_')) {
            return loadStripe(publishableKey);
        }
        return null;
    }, [isMock, publishableKey]);

    return (
        <div className="animate-fade-in py-2">
            {!isMock && stripePromise ? (
                // Real Stripe elements wrapper
                <Elements stripe={stripePromise}>
                    <StripeForm
                        clientSecret={clientSecret}
                        amount={amount}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                        processing={processing}
                        setProcessing={setProcessing}
                    />
                </Elements>
            ) : (
                // Simulated sandbox card terminal
                <CardSimulatorForm
                    amount={amount}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                    processing={processing}
                    setProcessing={setProcessing}
                />
            )}
        </div>
    );
};

export default StripeCardForm;
