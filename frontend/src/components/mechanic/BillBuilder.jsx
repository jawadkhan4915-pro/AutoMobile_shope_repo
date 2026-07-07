import React from 'react';
import { TAX_RATE } from '../../store/dataHelpers';

const BillBuilder = ({
    billItems,
    customerName,
    vehicleInfo,
    onCustomerChange,
    onVehicleChange,
    onUpdateQty,
    onRemoveItem,
    onGenerateBill,
    onAddMoreParts,
}) => {
    const billSubtotal = billItems.reduce((s, i) => s + i.qty * i.price, 0);
    const billTax = billSubtotal * TAX_RATE;
    const billTotal = billSubtotal + billTax;

    const cardStyle = {
        background: 'var(--bg-panel, rgba(15,23,42,0.75))', border: '1px solid var(--border-glass, rgba(148,163,184,0.15))',
        borderRadius: 14, padding: 20,
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start' }}>
            <div>
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>Customer & Vehicle Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Customer Name</label>
                            <input value={customerName} onChange={e => onCustomerChange(e.target.value)}
                                placeholder="e.g. Alexander Wright"
                                style={{ width: '100%', padding: '9px 12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Vehicle Info</label>
                            <input value={vehicleInfo} onChange={e => onVehicleChange(e.target.value)}
                                placeholder="e.g. Honda Accord 2019"
                                style={{ width: '100%', padding: '9px 12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>
                        Bill Items {billItems.length ? `(${billItems.length})` : ''}
                    </h3>
                    {billItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
                            <p style={{ fontSize: '2rem' }}>🧾</p>
                            <p>No items yet — go to <strong style={{ color: '#818cf8' }}>Parts Search</strong> to add items</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                    {['Part Name', 'Unit Price', 'Qty', 'Subtotal', ''].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {billItems.map(item => (
                                    <tr key={item.productId} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                                        <td style={{ padding: '10px', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                                        <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#94a3b8' }}>${item.price.toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <button onClick={() => onUpdateQty(item.productId, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', cursor: 'pointer' }}>−</button>
                                                <span style={{ minWidth: 24, textAlign: 'center', color: 'var(--text-primary)', fontWeight: 700 }}>{item.qty}</span>
                                                <button onClick={() => onUpdateQty(item.productId, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', cursor: 'pointer' }}>+</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px', fontWeight: 800, color: '#818cf8' }}>${(item.qty * item.price).toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => onRemoveItem(item.productId)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div style={{ ...cardStyle, position: 'sticky', top: 80 }}>
                <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700 }}>Bill Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {[['Subtotal', `$${billSubtotal.toFixed(2)}`], ['Tax (10%)', `$${billTax.toFixed(2)}`]].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b' }}>
                            <span>{label}</span><span style={{ color: '#94a3b8' }}>{val}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.15)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        <span>TOTAL</span><span style={{ color: '#818cf8' }}>${billTotal.toFixed(2)}</span>
                    </div>
                </div>
                <button
                    onClick={onGenerateBill}
                    disabled={!billItems.length}
                    style={{
                        width: '100%', padding: 13, borderRadius: 10, fontWeight: 800, fontSize: '0.9375rem',
                        background: !billItems.length ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#4f46e5,#818cf8)',
                        color: '#fff', border: 'none', cursor: !billItems.length ? 'not-allowed' : 'pointer',
                        boxShadow: !billItems.length ? 'none' : '0 4px 16px rgba(99,102,241,0.4)', marginBottom: 10,
                    }}
                >
                    📱 Generate QR Bill
                </button>
                <button
                    onClick={onAddMoreParts}
                    style={{ width: '100%', padding: 10, borderRadius: 10, fontWeight: 600, fontSize: '0.8125rem', background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer' }}
                >
                    + Add More Parts
                </button>
            </div>
        </div>
    );
};

export default BillBuilder;
