import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import Checkout from '../components/pos/Checkout';
import ReceiptModal from '../components/pos/ReceiptModal';
import QRScanner from '../components/cashier/QRScanner';
import ScannedBillView from '../components/cashier/ScannedBillView';
import SalesChart from '../components/owner/SalesChart';

const CashierPortal = () => {
    const { user } = useAuth();
    const { transactions, mechanicBills, payMechanicBill, getDailyChartData } = useStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'dashboard';
    const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

    const [scannedBill, setScannedBill] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    const todayTrx = useMemo(() =>
        transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()),
        [transactions]);

    const todayRevenue = useMemo(() => todayTrx.reduce((s, t) => s + (t.total || 0), 0), [todayTrx]);
    const pendingBills = useMemo(() => mechanicBills.filter(b => b.status === 'pending'), [mechanicBills]);
    const chartData = useMemo(() => getDailyChartData(7), [getDailyChartData]);

    const handleQRScan = useCallback((data) => {
        if (data?.id || data?.total) setScannedBill(data);
    }, []);

    const handleManualEntry = useCallback((billId) => {
        const bill = mechanicBills.find(b => b.id === billId);
        setScannedBill(bill || { id: billId });
    }, [mechanicBills]);

    const handleProcessPayment = useCallback((bill, method) => {
        payMechanicBill(bill.id, method, user?.name);
        setScannedBill(null);
        setSuccessMsg(`✅ Bill ${bill.id} — $${bill.total.toFixed(2)} paid via ${method}`);
        setTimeout(() => setSuccessMsg(''), 5000);
    }, [payMechanicBill, user]);

    const cardStyle = {
        background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 14, padding: 20,
    };

    const tabStyle = (t) => ({
        padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
        background: activeTab === t ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'rgba(148,163,184,0.08)',
        color: activeTab === t ? '#fff' : '#94a3b8',
    });

    return (
        <div style={{ padding: '20px', maxWidth: 1300, margin: '0 auto' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                        🛒 Cashier Terminal
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        Welcome, {user?.name || 'Cashier'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['dashboard', '📊 Dashboard'], ['scanner', `📷 QR Scanner${pendingBills.length ? ` (${pendingBills.length})` : ''}`], ['pos', '🛒 POS'], ['sales', '📋 Sales Log']].map(([t, label]) => (
                        <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>{label}</button>
                    ))}
                </div>
            </div>

            {successMsg && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontWeight: 600, fontSize: '0.875rem' }}>
                    {successMsg}
                </div>
            )}

            {activeTab === 'dashboard' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: '💰', color: '#818cf8' },
                            { label: 'Orders Today', value: todayTrx.length, icon: '🧾', color: '#34d399' },
                            { label: 'Pending QR Bills', value: pendingBills.length, icon: '⏳', color: '#fbbf24' },
                            { label: 'Avg Sale', value: todayTrx.length ? `$${(todayRevenue / todayTrx.length).toFixed(2)}` : '$0.00', icon: '📊', color: '#60a5fa' },
                        ].map(({ label, value, icon, color }) => (
                            <div key={label} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }} />
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{label}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</h3>
                                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
                        <div style={cardStyle}>
                            <SalesChart data={chartData} showProfit={false} height={200} />
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 14px', color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem' }}>
                                Pending QR Bills
                                {pendingBills.length > 0 && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 800, background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>{pendingBills.length}</span>}
                            </h3>
                            {pendingBills.length === 0 ? (
                                <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No pending bills</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                                    {pendingBills.map(b => (
                                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(251,191,36,0.06)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.8125rem' }}>{b.id}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#64748b' }}>{b.mechanicName} · {b.customerName || 'Walk-in'}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.9375rem' }}>${b.total.toFixed(2)}</span>
                                                <button onClick={() => { setScannedBill(b); setActiveTab('scanner'); }} style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.6875rem', fontWeight: 700, background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', border: 'none', cursor: 'pointer' }}>Pay</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'scanner' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                    <div>
                        <h3 style={{ margin: '0 0 14px', color: '#f1f5f9', fontWeight: 700 }}>📷 Scan Mechanic QR Bill</h3>
                        {!scannedBill
                            ? <QRScanner onScan={handleQRScan} onManualEntry={handleManualEntry} />
                            : <ScannedBillView billData={scannedBill} mechanicBills={mechanicBills} onProcess={handleProcessPayment} onClear={() => setScannedBill(null)} />
                        }
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 14px', color: '#f1f5f9', fontWeight: 700 }}>Recently Paid Bills</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {mechanicBills.filter(b => b.status === 'paid').slice(0, 8).map(b => (
                                <div key={b.id} style={{ ...cardStyle, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8125rem', color: '#e2e8f0' }}>{b.id}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#64748b' }}>{b.mechanicName} · {b.customerName || 'Walk-in'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#34d399', fontSize: '0.9375rem' }}>${b.total.toFixed(2)}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#64748b' }}>{new Date(b.paidAt || b.date).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pos' && (
                <div style={{ height: 'calc(100vh - 200px)' }}>
                    <div style={{ marginBottom: 12 }}>
                        <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>🛒 Walk-in Customer POS</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8125rem' }}>Add parts to cart and process payment</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 60px)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}><ProductGrid /></div>
                        <div style={{ width: 340 }}><Cart onCheckout={() => setShowCheckout(true)} /></div>
                    </div>
                    {showCheckout && (
                        <Checkout onClose={() => setShowCheckout(false)} onComplete={(order) => { setCompletedOrder(order); setShowCheckout(false); }} />
                    )}
                    {completedOrder && <ReceiptModal order={completedOrder} onClose={() => setCompletedOrder(null)} />}
                </div>
            )}

            {activeTab === 'sales' && (
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontWeight: 700 }}>📋 Sales Log</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                    {['Transaction ID', 'Type', 'Customer', 'Items', 'Method', 'Total', 'Time'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 30).map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                                        <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{t.id}</td>
                                        <td style={{ padding: '11px 12px' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 700, background: t.type === 'mechanic_bill' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)', color: t.type === 'mechanic_bill' ? '#fbbf24' : '#34d399' }}>
                                                {t.type === 'mechanic_bill' ? '🔧 Mechanic' : '🛒 POS'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '11px 12px', fontSize: '0.8125rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{t.customerName || 'Walk-in'}</td>
                                        <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#64748b' }}>{(t.items || []).length} item(s)</td>
                                        <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{t.method || '—'}</td>
                                        <td style={{ padding: '11px 12px', fontSize: '0.9rem', fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>${(t.total || 0).toFixed(2)}</td>
                                        <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && (
                            <p style={{ textAlign: 'center', padding: 40, color: '#475569' }}>No transactions yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashierPortal;
