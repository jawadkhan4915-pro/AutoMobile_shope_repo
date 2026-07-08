import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { TAX_RATE } from '../store/dataHelpers';
import PartSearchPanel from '../components/mechanic/PartSearchPanel';
import BillBuilder from '../components/mechanic/BillBuilder';
import MechanicBillSlip from '../components/mechanic/MechanicBillSlip';

const MechanicPortal = () => {
    const { user } = useAuth();
    const { products, mechanicBills, createMechanicBill } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'dashboard';
    const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [billSlip, setBillSlip] = useState(null);
    const [qtyInputs, setQtyInputs] = useState({});
    const [hoveredCard, setHoveredCard] = useState(null);

    const allMyBills = useMemo(() =>
        mechanicBills.filter(b => b.mechanicName === (user?.name || 'Lead Mechanic')),
        [mechanicBills, user]);

    const myBills = useMemo(() => allMyBills.slice(0, 20), [allMyBills]);

    const pendingBillsCount = useMemo(() => allMyBills.filter(b => b.status === 'pending').length, [allMyBills]);
    const completedBillsCount = useMemo(() => allMyBills.filter(b => b.status === 'paid').length, [allMyBills]);
    const totalEarnings = useMemo(() => allMyBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.total || 0), 0), [allMyBills]);

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
        setActiveTab('bill');
    }, [qtyInputs, setSearchParams]);

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
        background: 'var(--bg-panel, rgba(15,23,42,0.75))', border: '1px solid var(--border-glass, rgba(148,163,184,0.15))',
        borderRadius: 14, padding: 20,
    };

    return (
        <div style={{ padding: '20px', maxWidth: 1300, margin: '0 auto' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        🔧 Mechanic Workstation
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        Welcome, {user?.name || 'Mechanic'} · Parts lookup & bill generation
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['dashboard', 'search', 'bill', 'history'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
                            {t === 'dashboard' ? '📊 Dashboard' : t === 'search' ? '🔍 Parts Search' : t === 'bill' ? `🧾 Bill Builder ${billItems.length ? `(${billItems.length})` : ''}` : '📋 My Bills'}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Total Earnings", value: `$${totalEarnings.toFixed(2)}`, icon: '💰', color: '#818cf8', sub: "From paid bills" },
                            { label: 'Total Bills', value: allMyBills.length, icon: '🧾', color: '#60a5fa', sub: "All time" },
                            { label: 'Pending Bills', value: pendingBillsCount, icon: '⏳', color: '#fbbf24', sub: "Awaiting payment" },
                            { label: 'Completed Bills', value: completedBillsCount, icon: '✓', color: '#34d399', sub: "Paid by customers" },
                        ].map(({ label, value, icon, color, sub }) => (
                            <div
                                key={label}
                                onClick={() => setActiveTab('history')}
                                onMouseEnter={() => setHoveredCard(label)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    ...cardStyle,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: hoveredCard === label ? 'translateY(-3px)' : 'translateY(0)',
                                    boxShadow: hoveredCard === label
                                        ? `0 10px 25px -5px rgba(0,0,0,0.3), 0 0 0 1px ${color}33`
                                        : 'none',
                                    borderColor: hoveredCard === label ? color : 'var(--border-glass, rgba(148,163,184,0.15))',
                                }}
                            >
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }} />
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{label}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</h3>
                                    <span style={{ fontSize: '1.5rem', transform: hoveredCard === label ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.2s' }}>{icon}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.6875rem', color: '#475569', fontWeight: 500 }}>{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Dashboard details row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 20, alignItems: 'start' }}>
                        {/* Welcome / Panel */}
                        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(15,23,42,0.75))', border: '1px solid rgba(99,102,241,0.2)', padding: 24 }}>
                            <h3 style={{ margin: '0 0 10px', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>🔧 Welcome to your Workstation!</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                                Here you can lookup active parts inventory compatibility, build invoice estimate slips for clients, and generate QR codes for cashiers to scan and check out instantly.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setActiveTab('search')} style={{
                                    padding: '9px 18px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                                    background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                }}>
                                    🔍 Lookup Parts
                                </button>
                                <button onClick={() => setActiveTab('bill')} style={{
                                    padding: '9px 18px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                                    background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer',
                                }}>
                                    🧾 Build a Bill
                                </button>
                            </div>
                        </div>

                        {/* Quick Pending Bills List */}
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 14px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem' }}>
                                Awaiting Checkout
                                {pendingBillsCount > 0 && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 800, background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>{pendingBillsCount}</span>}
                            </h3>
                            {pendingBillsCount === 0 ? (
                                <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>All bills are settled! 🎉</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                                    {allMyBills.filter(b => b.status === 'pending').map(b => (
                                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(251,191,36,0.06)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{b.id}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#64748b' }}>{b.customerName || 'Walk-in'} · {b.vehicleInfo || '—'}</p>
                                            </div>
                                            <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.875rem' }}>${b.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <PartSearchPanel
                    products={products}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    qtyInputs={qtyInputs}
                    onQtyChange={(id, val) => setQtyInputs(prev => ({ ...prev, [id]: val }))}
                    onAddToBill={addToBill}
                />
            )}

            {activeTab === 'bill' && (
                <BillBuilder
                    billItems={billItems}
                    customerName={customerName}
                    vehicleInfo={vehicleInfo}
                    onCustomerChange={setCustomerName}
                    onVehicleChange={setVehicleInfo}
                    onUpdateQty={updateBillQty}
                    onRemoveItem={removeFromBill}
                    onGenerateBill={handleGenerateBill}
                    onAddMoreParts={() => setActiveTab('search')}
                />
            )}

            {activeTab === 'history' && (
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700 }}>My Bill History</h3>
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
                                    borderRadius: 10, border: '1px solid rgba(148,163,184,0.1)', flexWrap: 'wrap', gap: 10,
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{bill.id}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                                            {bill.customerName || 'Walk-in'} · {bill.vehicleInfo || '—'} · {new Date(bill.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#818cf8' }}>${bill.total.toFixed(2)}</span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700,
                                            background: bill.status === 'paid' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                                            color: bill.status === 'paid' ? '#34d399' : '#fbbf24',
                                        }}>{bill.status === 'paid' ? '✓ Paid' : '⏳ Pending'}</span>
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

            {billSlip && <MechanicBillSlip bill={billSlip} onClose={() => setBillSlip(null)} />}
        </div>
    );
};

export default MechanicPortal;
