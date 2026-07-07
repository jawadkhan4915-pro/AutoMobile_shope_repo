import React, { useCallback } from 'react';
import { useCart } from '../../hooks/useCart';

const Cart = ({ onCheckout }) => {
    const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();

    const handleQuantityChange = useCallback((itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateCartItem(itemId, newQuantity);
        }
    }, [removeFromCart, updateCartItem]);

    const subtotal = cart.total || 0;
    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                flexShrink: 0,
            }}>
                <h2 style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <span>🛒</span> Current Order
                    {cart.items?.length > 0 && (
                        <span style={{
                            padding: '2px 8px',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            color: '#fff',
                            borderRadius: 20,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                        }}>
                            {cart.items.length}
                        </span>
                    )}
                </h2>
                <button
                    onClick={clearCart}
                    disabled={!cart.items?.length}
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: cart.items?.length ? '#f87171' : '#475569',
                        background: 'none',
                        border: 'none',
                        cursor: cart.items?.length ? 'pointer' : 'not-allowed',
                        padding: '4px 8px',
                        borderRadius: 6,
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => cart.items?.length && (e.target.style.background = 'rgba(248,113,113,0.1)')}
                    onMouseLeave={e => (e.target.style.background = 'none')}
                >
                    Clear all
                </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
                {!cart.items?.length ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        padding: 24,
                    }}>
                        <span style={{ fontSize: '3rem', marginBottom: 12 }}>🛍️</span>
                        <p style={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Cart is empty</p>
                        <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>Select products to begin</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cart.items.map((item) => (
                            <div
                                key={item._id || item.id}
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    padding: '10px 12px',
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    borderRadius: 10,
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        margin: 0,
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {item.productName || item.name}
                                    </h4>
                                    <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '2px 0 0' }}>
                                        ${(item.price || 0).toFixed(2)} / unit
                                    </p>

                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                        <button
                                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity - 1)}
                                            style={{
                                                width: 24, height: 24,
                                                borderRadius: 6,
                                                background: 'rgba(148,163,184,0.1)',
                                                border: '1px solid rgba(148,163,184,0.2)',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                transition: 'all 0.15s',
                                                lineHeight: 1,
                                            }}
                                        >−</button>
                                        <span style={{
                                            minWidth: 24,
                                            textAlign: 'center',
                                            fontSize: '0.8125rem',
                                            fontWeight: 700,
                                            color: 'var(--text-primary)',
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity + 1)}
                                            style={{
                                                width: 24, height: 24,
                                                borderRadius: 6,
                                                background: 'rgba(99,102,241,0.15)',
                                                border: '1px solid rgba(99,102,241,0.3)',
                                                color: '#818cf8',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                transition: 'all 0.15s',
                                                lineHeight: 1,
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                    <span style={{
                                        fontSize: '0.9375rem',
                                        fontWeight: 800,
                                        color: '#818cf8',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        ${((item.totalPrice || item.price * item.quantity) || 0).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item._id || item.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            lineHeight: 1,
                                            padding: 2,
                                            transition: 'color 0.15s',
                                        }}
                                        onMouseEnter={e => (e.target.style.color = '#f87171')}
                                        onMouseLeave={e => (e.target.style.color = '#475569')}
                                        title="Remove item"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Totals */}
            <div style={{
                padding: '12px 16px 16px',
                borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                flexShrink: 0,
                marginTop: 12,
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b' }}>
                        <span>Subtotal</span>
                        <span style={{ color: '#94a3b8' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b' }}>
                        <span>Tax (10%)</span>
                        <span style={{ color: '#94a3b8' }}>${tax.toFixed(2)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.0625rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        paddingTop: 8,
                        borderTop: '1px solid rgba(148,163,184,0.15)',
                        marginTop: 2,
                        letterSpacing: '-0.02em',
                    }}>
                        <span>Total</span>
                        <span style={{ color: '#818cf8' }}>${grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={!cart.items?.length || loading}
                    style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: 10,
                        background: (!cart.items?.length || loading)
                            ? 'rgba(99,102,241,0.3)'
                            : 'linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)',
                        color: '#fff',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: (!cart.items?.length || loading) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.25s',
                        boxShadow: (!cart.items?.length || loading) ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                        letterSpacing: '0.01em',
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                width: 16, height: 16, borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: '#fff',
                                animation: 'spin 0.7s linear infinite',
                                display: 'inline-block',
                            }} />
                            Processing...
                        </>
                    ) : (
                        <>💳 Pay ${grandTotal.toFixed(2)}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Cart;
