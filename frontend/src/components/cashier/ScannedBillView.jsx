import React, { useState } from 'react';

const PAYMENT_METHODS = ['Cash', 'Card', 'Mobile Money'];

const ScannedBillView = ({ billData, mechanicBills, onProcess, onClear }) => {
    const [selectedMethod, setSelectedMethod] = useState('Cash');

    const bill = mechanicBills.find(b => b.id === billData?.id) || billData;

    if (!bill?.items) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: '#f87171' }}>
                <p style={{ fontSize: '1.5rem' }}>⚠️</p>
                <p>Bill not found. ID: {billData?.id || 'Unknown'}</p>
                <button onClick={onClear} style={{
                    marginTop: 12, padding: '8px 20px', borderRadius: 8,
                    background: 'rgba(248,113,113,0.15)', color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', fontWeight: 600,
                }}>Try Again</button>
            </div>
        );
    }

    const isPaid = bill.status === 'paid';

    return (
        <div style={{
            background: 'rgba(15,23,42,0.8)', borderRadius: 14,
            border: `1px solid ${isPaid ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.3)'}`,
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '16px 20px',
                background: isPaid ? 'rgba(52,211,153,0.08)' : 'rgba(99,102,241,0.08)',
                borderBottom: '1px solid rgba(148,163,184,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                        {isPaid ? '✅' : '🔍'} Bill {bill.id}
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {bill.mechanicName} · {bill.customerName || 'Walk-in'} · {bill.vehicleInfo || '—'}
                    </p>
                </div>
                <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
                    background: isPaid ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                    color: isPaid ? '#34d399' : '#fbbf24',
                    border: `1px solid ${isPaid ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                }}>{isPaid ? '✓ Already Paid' : '⏳ Pending Payment'}</span>
            </div>

            <div style={{ padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                            {['Part', 'Qty', 'Unit Price', 'Total'].map(h => (
                                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(bill.items || []).map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                                <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#e2e8f0' }}>{item.name}</td>
                                <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#94a3b8' }}>{item.qty}</td>
                                <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#94a3b8' }}>${item.price.toFixed(2)}</td>
                                <td style={{ padding: '10px', fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8' }}>${(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: 12 }}>
                    {[['Subtotal', bill.subtotal], ['Tax (10%)', bill.tax]].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b' }}>
                            <span>{l}</span><span>${(v || 0).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, paddingTop: 8, borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                        <span style={{ color: '#f1f5f9' }}>TOTAL</span>
                        <span style={{ color: '#818cf8' }}>${(bill.total || 0).toFixed(2)}</span>
                    </div>
                </div>

                {!isPaid && (
                    <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Payment Method</p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                            {PAYMENT_METHODS.map(m => (
                                <button key={m} onClick={() => setSelectedMethod(m)} style={{
                                    padding: '7px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem',
                                    border: '1px solid', cursor: 'pointer',
                                    ...(selectedMethod === m
                                        ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', borderColor: '#6366f1' }
                                        : { background: 'rgba(148,163,184,0.08)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }),
                                }}>{m === 'Cash' ? '💵' : m === 'Card' ? '💳' : '📱'} {m}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => onProcess(bill, selectedMethod)} style={{
                                flex: 1, padding: 13, borderRadius: 10, fontWeight: 800, fontSize: '0.9375rem',
                                background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff',
                                border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(52,211,153,0.3)',
                            }}>✅ Process Payment · ${(bill.total || 0).toFixed(2)}</button>
                            <button onClick={onClear} style={{
                                padding: '13px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.8125rem',
                                background: 'rgba(148,163,184,0.08)', color: '#94a3b8',
                                border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer',
                            }}>Cancel</button>
                        </div>
                    </div>
                )}
                {isPaid && (
                    <button onClick={onClear} style={{
                        marginTop: 14, width: '100%', padding: 11, borderRadius: 10, fontWeight: 600,
                        background: 'rgba(148,163,184,0.08)', color: '#94a3b8',
                        border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer',
                    }}>Scan Another Bill</button>
                )}
            </div>
        </div>
    );
};

export default ScannedBillView;
