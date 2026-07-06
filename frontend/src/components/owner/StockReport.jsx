import React from 'react';
import { formatImageUrl, handleImageError } from '../../store/dataHelpers';

const StockReport = ({ products, showReorder = false, onReorder }) => {
    const totalStockValue = products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>📦 Complete Stock Inventory</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Total Value: ${totalStockValue.toFixed(2)}</span>
                    <span style={{ color: '#64748b' }}>{products.length} products</span>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                            {['Product', 'SKU', 'Category', 'Sell Price', 'Cost Price', 'Profit/Unit', 'Stock', 'Stock Value', 'Status', ...(showReorder ? ['Action'] : [])].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => {
                            const costP = p.costPrice || p.price * 0.65;
                            const profitPerUnit = p.price - costP;
                            const stockVal = p.price * p.quantity;
                            const isLow = p.quantity <= 5;
                            return (
                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <img
                                            src={formatImageUrl(p.imageUrl)}
                                            alt={p.name}
                                            style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }}
                                            onError={handleImageError}
                                            loading="lazy"
                                        />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>{p.name}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>{p.sku || p.barcode}</td>
                                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.category}</td>
                                    <td style={{ padding: '12px', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap' }}>${p.price.toFixed(2)}</td>
                                    <td style={{ padding: '12px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>${costP.toFixed(2)}</td>
                                    <td style={{ padding: '12px', fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>${profitPerUnit.toFixed(2)}</td>
                                    <td style={{ padding: '12px', fontWeight: 800, fontSize: '1rem', color: p.quantity === 0 ? '#f87171' : isLow ? '#fbbf24' : '#34d399' }}>{p.quantity}</td>
                                    <td style={{ padding: '12px', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>${stockVal.toFixed(2)}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 800,
                                            background: p.quantity === 0 ? 'rgba(248,113,113,0.2)' : isLow ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.15)',
                                            color: p.quantity === 0 ? '#f87171' : isLow ? '#fbbf24' : '#34d399',
                                        }}>
                                            {p.quantity === 0 ? '● OUT' : isLow ? '● LOW' : '● OK'}
                                        </span>
                                    </td>
                                    {showReorder && isLow && (
                                        <td style={{ padding: '12px' }}>
                                            <button onClick={() => onReorder?.(p)} style={{
                                                padding: '4px 10px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700,
                                                background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                                                border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer',
                                            }}>Reorder</button>
                                        </td>
                                    )}
                                    {showReorder && !isLow && <td style={{ padding: '12px' }} />}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockReport;
