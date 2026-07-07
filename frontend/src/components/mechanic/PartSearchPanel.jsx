import React from 'react';
import { formatImageUrl, handleImageError } from '../../store/dataHelpers';

const CATEGORIES = ['All', 'Engine Parts', 'Brake Systems', 'Oils & Fluids', 'Tires & Wheels', 'Electrical', 'Accessories'];

export const StockBadge = ({ qty }) => {
    const color = qty === 0 ? '#f87171' : qty <= 5 ? '#fbbf24' : '#34d399';
    const label = qty === 0 ? 'OUT' : qty <= 5 ? 'LOW' : 'OK';
    return (
        <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 800,
            color: '#fff', background: color, letterSpacing: '0.05em',
        }}>{label} {qty}</span>
    );
};

const PartSearchPanel = ({
    products,
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    qtyInputs,
    onQtyChange,
    onAddToBill,
}) => {
    const filteredProducts = products.filter(p => {
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        const term = searchTerm.toLowerCase();
        const matchSearch = !term || p.name.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term) ||
            p.compatibility?.toLowerCase().includes(term);
        return matchCat && matchSearch;
    });

    const cardStyle = {
        background: 'var(--bg-panel, rgba(15,23,42,0.75))', border: '1px solid var(--border-glass, rgba(148,163,184,0.15))',
        borderRadius: 14, padding: 20,
    };

    return (
        <div>
            <div style={{ ...cardStyle, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
                        <input
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Search by part name, SKU, or vehicle compatibility..."
                            style={{
                                width: '100%', padding: '10px 14px 10px 38px',
                                background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)',
                                borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => onCategoryChange(cat)} style={{
                                padding: '6px 12px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
                                border: '1px solid', cursor: 'pointer', whiteSpace: 'nowrap',
                                ...(selectedCategory === cat
                                    ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', borderColor: '#6366f1' }
                                    : { background: 'rgba(15,23,42,0.5)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }),
                            }}>{cat}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                {['Part', 'SKU', 'Category', 'Compatibility', 'Price', 'Stock', 'Qty', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <img
                                            src={formatImageUrl(p.imageUrl)}
                                            alt={p.name}
                                            style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                                            onError={handleImageError}
                                            loading="lazy"
                                        />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.sku}</td>
                                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.category}</td>
                                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.compatibility}</td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 800, color: '#818cf8', whiteSpace: 'nowrap' }}>${p.price.toFixed(2)}</td>
                                    <td style={{ padding: '12px' }}><StockBadge qty={p.quantity} /></td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="number" min={1} max={p.quantity}
                                            value={qtyInputs[p._id] || 1}
                                            onChange={e => onQtyChange(p._id, e.target.value)}
                                            disabled={p.quantity === 0}
                                            style={{
                                                width: 60, padding: '5px 8px', borderRadius: 6, textAlign: 'center',
                                                background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)',
                                                color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none',
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            disabled={p.quantity === 0}
                                            onClick={() => onAddToBill(p)}
                                            style={{
                                                padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.75rem',
                                                background: p.quantity === 0 ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg,#6366f1,#818cf8)',
                                                color: p.quantity === 0 ? '#475569' : '#fff', border: 'none',
                                                cursor: p.quantity === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {p.quantity === 0 ? 'Out of Stock' : '+ Add to Bill'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
                            <p style={{ fontSize: '2rem' }}>🔧</p>
                            <p>No parts found matching your search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartSearchPanel;
