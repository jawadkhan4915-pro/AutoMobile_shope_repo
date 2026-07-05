import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import QRCode from 'qrcode.react';

const TAX_RATE = 0.10;
const CATEGORIES = ['All', 'Engine Parts', 'Brake Systems', 'Oils & Fluids', 'Tires & Wheels', 'Electrical', 'Accessories'];

// ─── Stock badge ─────────────────────────────────────────────────────────────
const StockBadge = ({ qty }) => {
    const color = qty === 0 ? '#f87171' : qty <= 5 ? '#fbbf24' : '#34d399';
    const label = qty === 0 ? 'OUT' : qty <= 5 ? 'LOW' : 'OK';
    return (
        <span style={{
            padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 800,
            color: '#fff', background: color, letterSpacing: '0.05em',
        }}>{label} {qty}</span>
    );
};

// ─── Bill Slip Modal ──────────────────────────────────────────────────────────
const BillSlipModal = ({ bill, onClose }) => {
    const slipRef = useRef();
    const qrData = JSON.stringify({
        id: bill.id, items: bill.items, total: bill.total,
        tax: bill.tax, subtotal: bill.subtotal,
        customerName: bill.customerName, vehicleInfo: bill.vehicleInfo,
        mechanicName: bill.mechanicName, date: bill.date,
    });

    const handlePrint = () => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Bill Slip — ${bill.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; color: #000; }
                h2 { text-align: center; font-size: 1.2rem; margin: 0; }
                .sub { text-align: center; font-size: 0.75rem; color: #555; margin-bottom: 12px; }
                hr { border: 1px dashed #999; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                th { text-align: left; padding: 4px 0; border-bottom: 1px solid #ccc; }
                td { padding: 3px 0; }
                .right { text-align: right; }
                .total-row { font-weight: bold; font-size: 1rem; border-top: 2px solid #000; }
                .qr-section { text-align: center; margin-top: 16px; }
                .qr-instruction { font-size: 0.7rem; color: #555; margin-top: 8px; }
                @media print { body { max-width: 100%; } }
            </style></head><body>
            ${slipRef.current.innerHTML}
            <script>window.onload = () => window.print();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 28,
                maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto',
                color: '#0f172a', position: 'relative',
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: 12, right: 14, background: 'none',
                    border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b',
                }}>×</button>

                {/* Slip content */}
                <div ref={slipRef}>
                    <h2 style={{ textAlign: 'center', fontFamily: 'monospace', margin: 0, fontSize: '1.1rem' }}>
                        🏎️ APEX MOTORWORKS
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#555', margin: '4px 0 12px', fontFamily: 'monospace' }}>
                        Automotive Service & Parts<br />
                        contact@apexmotorworks.com
                    </p>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <tbody>
                            <tr><td>Bill #</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{bill.id}</td></tr>
                            <tr><td>Date</td><td style={{ textAlign: 'right' }}>{new Date(bill.date).toLocaleString()}</td></tr>
                            <tr><td>Mechanic</td><td style={{ textAlign: 'right' }}>{bill.mechanicName}</td></tr>
                            <tr><td>Customer</td><td style={{ textAlign: 'right' }}>{bill.customerName || 'Walk-in'}</td></tr>
                            {bill.vehicleInfo && <tr><td>Vehicle</td><td style={{ textAlign: 'right' }}>{bill.vehicleInfo}</td></tr>}
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <thead>
                            <tr>
                                <th>Part</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'right' }}>Sub</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, i) => (
                                <tr key={i}>
                                    <td style={{ maxWidth: 140, overflow: 'hidden' }}>{item.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right' }}>${(item.qty * item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <table style={{ width: '100%', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <tbody>
                            <tr><td>Subtotal</td><td style={{ textAlign: 'right' }}>${bill.subtotal.toFixed(2)}</td></tr>
                            <tr><td>Tax (10%)</td><td style={{ textAlign: 'right' }}>${bill.tax.toFixed(2)}</td></tr>
                            <tr style={{ fontWeight: 800, fontSize: '0.95rem', borderTop: '2px solid #000' }}>
                                <td>TOTAL</td><td style={{ textAlign: 'right' }}>${bill.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr style={{ border: '1px dashed #999' }} />
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', marginBottom: 8, color: '#333' }}>
                            ── SCAN QR CODE AT CASHIER COUNTER ──
                        </p>
                        <QRCode value={qrData} size={160} level="M" includeMargin />
                        <p style={{ fontSize: '0.6rem', color: '#666', marginTop: 6, fontFamily: 'monospace' }}>
                            Cashier will scan this QR to process payment
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button onClick={handlePrint} style={{
                        flex: 1, padding: '11px', borderRadius: 10,
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                    }}>🖨️ Print Bill Slip</button>
                    <button onClick={onClose} style={{
                        padding: '11px 18px', borderRadius: 10,
                        background: '#f1f5f9', color: '#64748b', fontWeight: 600, border: 'none',
                        cursor: 'pointer', fontSize: '0.875rem',
                    }}>Close</button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Mechanic Portal ─────────────────────────────────────────────────────
const MechanicPortal = () => {
    const { user } = useAuth();
    const { products, mechanicBills, createMechanicBill } = useStore();

    const [activeTab, setActiveTab] = useState('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [billSlip, setBillSlip] = useState(null);
    const [qtyInputs, setQtyInputs] = useState({});

    const myBills = useMemo(() =>
        mechanicBills.filter(b => b.mechanicName === (user?.name || 'Lead Mechanic'))
            .slice(0, 20),
        [mechanicBills, user]);

    const filteredProducts = useMemo(() => products.filter(p => {
        const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
        const term = searchTerm.toLowerCase();
        const matchSearch = !term || p.name.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term) ||
            p.compatibility?.toLowerCase().includes(term);
        return matchCat && matchSearch;
    }), [products, selectedCategory, searchTerm]);

    const billSubtotal = useMemo(() => billItems.reduce((s, i) => s + i.qty * i.price, 0), [billItems]);
    const billTax = billSubtotal * TAX_RATE;
    const billTotal = billSubtotal + billTax;

    const addToBill = useCallback((product) => {
        const qty = parseInt(qtyInputs[product._id] || 1);
        if (qty <= 0 || qty > product.quantity) return;
        setBillItems(prev => {
            const existing = prev.find(i => i.productId === product._id);
            if (existing) {
                return prev.map(i => i.productId === product._id
                    ? { ...i, qty: Math.min(product.quantity, i.qty + qty) } : i);
            }
            return [...prev, { productId: product._id, name: product.name, price: product.price, qty, maxQty: product.quantity }];
        });
    }, [qtyInputs]);

    const removeFromBill = (productId) => setBillItems(prev => prev.filter(i => i.productId !== productId));
    const updateBillQty = (productId, qty) => {
        const item = billItems.find(i => i.productId === productId);
        if (qty < 1) { removeFromBill(productId); return; }
        if (item && qty > item.maxQty) return;
        setBillItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i));
    };

    const handleGenerateBill = () => {
        if (!billItems.length) return;
        const bill = createMechanicBill({
            customerName, vehicleInfo,
            items: billItems,
            subtotal: billSubtotal, tax: billTax, total: billTotal,
        }, user);
        setBillSlip(bill);
        setBillItems([]);
        setCustomerName('');
        setVehicleInfo('');
    };

    const tabStyle = (t) => ({
        padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
        background: activeTab === t ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'rgba(148,163,184,0.08)',
        color: activeTab === t ? '#fff' : '#94a3b8',
    });

    const cardStyle = {
        background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 14, padding: 20,
    };

    return (
        <div style={{ padding: '20px', maxWidth: 1300, margin: '0 auto' }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                        🔧 Mechanic Workstation
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        Welcome, {user?.name || 'Mechanic'} · Parts lookup & bill generation
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['search', 'bill', 'history'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
                            {t === 'search' ? '🔍 Parts Search' : t === 'bill' ? `🧾 Bill Builder ${billItems.length ? `(${billItems.length})` : ''}` : '📋 My Bills'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PARTS SEARCH ─────────────────────────────────────────────── */}
            {activeTab === 'search' && (
                <div>
                    {/* Search + filters */}
                    <div style={{ ...cardStyle, marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
                                <input
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search by part name, SKU, or vehicle compatibility..."
                                    style={{
                                        width: '100%', padding: '10px 14px 10px 38px',
                                        background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)',
                                        borderRadius: 8, color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.2)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                                        padding: '6px 12px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
                                        border: '1px solid', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                                        ...(selectedCategory === cat
                                            ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', borderColor: '#6366f1' }
                                            : { background: 'rgba(15,23,42,0.5)', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }),
                                    }}>{cat}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Parts table */}
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
                                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img src={p.imageUrl} alt={p.name}
                                                    style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                                                    onError={e => e.target.style.display = 'none'} loading="lazy" />
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{p.name}</span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.sku}</td>
                                            <td style={{ padding: '12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.category}</td>
                                            <td style={{ padding: '12px', fontSize: '0.75rem', color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.compatibility}</td>
                                            <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 800, color: '#818cf8', whiteSpace: 'nowrap' }}>${p.price.toFixed(2)}</td>
                                            <td style={{ padding: '12px' }}><StockBadge qty={p.quantity} /></td>
                                            <td style={{ padding: '12px' }}>
                                                <input type="number" min={1} max={p.quantity}
                                                    value={qtyInputs[p._id] || 1}
                                                    onChange={e => setQtyInputs(prev => ({ ...prev, [p._id]: e.target.value }))}
                                                    disabled={p.quantity === 0}
                                                    style={{
                                                        width: 60, padding: '5px 8px', borderRadius: 6, textAlign: 'center',
                                                        background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)',
                                                        color: '#f1f5f9', fontSize: '0.8125rem', outline: 'none',
                                                    }} />
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    disabled={p.quantity === 0}
                                                    onClick={() => { addToBill(p); setActiveTab('bill'); }}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.75rem',
                                                        background: p.quantity === 0 ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg,#6366f1,#818cf8)',
                                                        color: p.quantity === 0 ? '#475569' : '#fff', border: 'none',
                                                        cursor: p.quantity === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                                                    }}>
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
            )}

            {/* ── BILL BUILDER ─────────────────────────────────────────────── */}
            {activeTab === 'bill' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start' }}>
                    <div>
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>Customer & Vehicle Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Customer Name</label>
                                    <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                                        placeholder="e.g. Alexander Wright"
                                        style={{ width: '100%', padding: '9px 12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.875rem', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Vehicle Info</label>
                                    <input value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)}
                                        placeholder="e.g. Honda Accord 2019"
                                        style={{ width: '100%', padding: '9px 12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: '0.875rem', outline: 'none' }} />
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>
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
                                                <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500 }}>{item.name}</td>
                                                <td style={{ padding: '10px', fontSize: '0.8125rem', color: '#94a3b8' }}>${item.price.toFixed(2)}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button onClick={() => updateBillQty(item.productId, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}>−</button>
                                                        <span style={{ minWidth: 24, textAlign: 'center', color: '#f1f5f9', fontWeight: 700 }}>{item.qty}</span>
                                                        <button onClick={() => updateBillQty(item.productId, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', cursor: 'pointer', fontSize: '0.875rem' }}>+</button>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px', fontWeight: 800, color: '#818cf8' }}>${(item.qty * item.price).toFixed(2)}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <button onClick={() => removeFromBill(item.productId)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Summary panel */}
                    <div style={{ ...cardStyle, position: 'sticky', top: 80 }}>
                        <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontWeight: 700 }}>Bill Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[['Subtotal', `$${billSubtotal.toFixed(2)}`], ['Tax (10%)', `$${billTax.toFixed(2)}`]].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b' }}>
                                    <span>{label}</span><span style={{ color: '#94a3b8' }}>{val}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.15)', fontSize: '1.125rem', fontWeight: 800, color: '#f1f5f9' }}>
                                <span>TOTAL</span><span style={{ color: '#818cf8' }}>${billTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerateBill}
                            disabled={!billItems.length}
                            style={{
                                width: '100%', padding: 13, borderRadius: 10, fontWeight: 800, fontSize: '0.9375rem',
                                background: !billItems.length ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#4f46e5,#818cf8)',
                                color: '#fff', border: 'none', cursor: !billItems.length ? 'not-allowed' : 'pointer',
                                boxShadow: !billItems.length ? 'none' : '0 4px 16px rgba(99,102,241,0.4)', marginBottom: 10,
                            }}>
                            📱 Generate QR Bill
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            style={{ width: '100%', padding: 10, borderRadius: 10, fontWeight: 600, fontSize: '0.8125rem', background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer' }}>
                            + Add More Parts
                        </button>
                    </div>
                </div>
            )}

            {/* ── MY BILLS HISTORY ─────────────────────────────────────────── */}
            {activeTab === 'history' && (
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontWeight: 700 }}>My Bill History</h3>
                    {myBills.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                            <p style={{ fontSize: '2rem' }}>📋</p><p>No bills generated yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {myBills.map(bill => (
                                <div key={bill.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '14px 16px', background: 'rgba(15,23,42,0.5)',
                                    borderRadius: 10, border: '1px solid rgba(148,163,184,0.1)',
                                    flexWrap: 'wrap', gap: 10,
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem' }}>{bill.id}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                            {bill.customerName || 'Walk-in'} · {bill.vehicleInfo || '—'} · {new Date(bill.date).toLocaleDateString()}
                                        </p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                            {bill.items.length} item(s)
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#818cf8' }}>${bill.total.toFixed(2)}</span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700,
                                            background: bill.status === 'paid' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                                            color: bill.status === 'paid' ? '#34d399' : '#fbbf24',
                                            border: `1px solid ${bill.status === 'paid' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                        }}>
                                            {bill.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                        </span>
                                        <button onClick={() => setBillSlip(bill)} style={{
                                            padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: '0.75rem',
                                            background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                                            border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer',
                                        }}>🧾 View Slip</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bill slip modal */}
            {billSlip && <BillSlipModal bill={billSlip} onClose={() => setBillSlip(null)} />}
        </div>
    );
};

export default MechanicPortal;
