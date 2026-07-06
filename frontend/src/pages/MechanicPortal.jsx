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

    const activeTab = searchParams.get('tab') || 'search';
    const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [billSlip, setBillSlip] = useState(null);
    const [qtyInputs, setQtyInputs] = useState({});

    const myBills = useMemo(() =>
        mechanicBills.filter(b => b.mechanicName === (user?.name || 'Lead Mechanic')).slice(0, 20),
        [mechanicBills, user]);

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
        background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 14, padding: 20,
    };

    return (
        <div style={{ padding: '20px', maxWidth: 1300, margin: '0 auto' }} className="animate-fade-in">
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
                                    borderRadius: 10, border: '1px solid rgba(148,163,184,0.1)', flexWrap: 'wrap', gap: 10,
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem' }}>{bill.id}</p>
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
