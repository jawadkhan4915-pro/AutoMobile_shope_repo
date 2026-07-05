import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ProductGrid from '../components/pos/ProductGrid';

const TAX_RATE = 0.10;
const PAYMENT_METHODS = ['Cash', 'Card', 'Mobile Money'];

// ─── QR Scanner using html5-qrcode ───────────────────────────────────────────
const QRScannerPanel = ({ onScan, onManualEntry }) => {
    const scannerRef = useRef(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [manualId, setManualId] = useState('');
    const [error, setError] = useState('');
    const html5QrCodeRef = useRef(null);

    const startScanner = useCallback(async () => {
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            html5QrCodeRef.current = new Html5Qrcode('qr-reader-cashier');
            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    stopScanner();
                    try {
                        const data = JSON.parse(decodedText);
                        onScan(data);
                    } catch {
                        onScan({ raw: decodedText });
                    }
                },
                () => { }
            );
            setScannerActive(true);
            setError('');
        } catch (err) {
            setError('Camera not available. Use Manual Bill ID entry below.');
        }
    }, [onScan]);

    const stopScanner = useCallback(async () => {
        try {
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            }
        } catch { }
        setScannerActive(false);
    }, []);

    useEffect(() => () => { stopScanner(); }, [stopScanner]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Camera scanner */}
            <div style={{
                background: 'rgba(15,23,42,0.8)', borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden',
            }}>
                <div id="qr-reader-cashier" ref={scannerRef} style={{ width: '100%', minHeight: 280 }} />
                {!scannerActive && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', minHeight: 280, gap: 16, padding: 20,
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(99,102,241,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                        }}>📷</div>
                        <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0, fontSize: '0.875rem' }}>
                            Point camera at mechanic's bill QR code
                        </p>
                        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>}
                        <button onClick={startScanner} style={{
                            padding: '11px 28px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                            background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff',
                            border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                        }}>📷 Start Camera Scanner</button>
                    </div>
                )}
                {scannerActive && (
                    <div style={{ padding: '12px', textAlign: 'center' }}>
                        <p style={{ color: '#fbbf24', fontSize: '0.8rem', margin: '0 0 8px', fontWeight: 600 }}>
                            ● Scanning... Point at QR code
                        </p>
                        <button onClick={stopScanner} style={{
                            padding: '7px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
                            background: 'rgba(248,113,113,0.15)', color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer',
                        }}>Stop Scanner</button>
                    </div>
                )}
            </div>

            {/* Manual Bill ID fallback */}
            <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(148,163,184,0.12)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Or Enter Bill ID Manually
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={manualId} onChange={e => setManualId(e.target.value.toUpperCase())}
                        placeholder="e.g. MECH-1234-ABCD"
                        style={{
                            flex: 1, padding: '9px 12px', background: 'rgba(15,23,42,0.7)',
                            border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8,
                            color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
                        }}
                        onKeyDown={e => e.key === 'Enter' && manualId && onManualEntry(manualId)}
                    />
                    <button
                        onClick={() => manualId && onManualEntry(manualId)}
                        style={{
                            padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
                            background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff',
                            border: 'none', cursor: 'pointer',
                        }}>Fetch</button>
                </div>
            </div>
        </div>
    );
};

// ─── Scanned Bill View ────────────────────────────────────────────────────────
const ScannedBillView = ({ billData, mechanicBills, onProcess, onClear }) => {
    const [selectedMethod, setSelectedMethod] = useState('Cash');

    // Try to find actual bill from store
    const bill = mechanicBills.find(b => b.id === billData?.id) || billData;
    if (!bill) return (
        <div style={{ textAlign: 'center', padding: 40, color: '#f87171' }}>
            <p style={{ fontSize: '1.5rem' }}>⚠️</p>
            <p>Bill not found. ID: {billData?.id}</p>
            <button onClick={onClear} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
        </div>
    );

    const isPaid = bill.status === 'paid';

    return (
        <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: 14, border: `1px solid ${isPaid ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.3)'}`, overflow: 'hidden' }}>
            {/* Header */}
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

            {/* Items */}
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
                                    border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
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
                        marginTop: 14, width: '100%', padding: 11, borderRadius: 10, fontWeight: 600, fontSize: '0.875rem',
                        background: 'rgba(148,163,184,0.08)', color: '#94a3b8',
                        border: '1px solid rgba(148,163,184,0.15)', cursor: 'pointer',
                    }}>Scan Another Bill</button>
                )}
            </div>
        </div>
    );
};

// ─── Main Cashier Portal ──────────────────────────────────────────────────────
const CashierPortal = () => {
    const { user } = useAuth();
    const { transactions, mechanicBills, payMechanicBill, getDailyChartData } = useStore();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [scannedBill, setScannedBill] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

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
        if (bill) setScannedBill(bill);
        else setScannedBill({ id: billId });
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
            {/* Header */}
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

            {/* Success toast */}
            {successMsg && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontWeight: 600, fontSize: '0.875rem' }}>
                    {successMsg}
                </div>
            )}

            {/* ── DASHBOARD ───────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
                <div>
                    {/* KPI Row */}
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

                    {/* Chart + Pending bills */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem' }}>Revenue — Last 7 Days</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="cashRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: '#f1f5f9' }} formatter={v => [`$${v.toFixed(2)}`]} />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#cashRevGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
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

            {/* ── QR SCANNER ──────────────────────────────────────────────── */}
            {activeTab === 'scanner' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                    <div>
                        <h3 style={{ margin: '0 0 14px', color: '#f1f5f9', fontWeight: 700 }}>📷 Scan Mechanic QR Bill</h3>
                        {!scannedBill
                            ? <QRScannerPanel onScan={handleQRScan} onManualEntry={handleManualEntry} />
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

            {/* ── POS ─────────────────────────────────────────────────────── */}
            {activeTab === 'pos' && (
                <div style={{ height: 'calc(100vh - 200px)' }}>
                    <div style={{ marginBottom: 12 }}>
                        <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>🛒 Walk-in Customer POS</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8125rem' }}>Add parts to cart and process payment</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 60px)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}><ProductGrid /></div>
                        <div style={{ width: 340 }}>
                            {/* Cart is managed by CartContext in POS */}
                            <div style={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <p style={{ fontSize: '2rem' }}>🛒</p>
                                <p>Cart appears here</p>
                                <p style={{ fontSize: '0.75rem' }}>Use the full <strong style={{ color: '#818cf8' }}>POS Terminal</strong> page for checkout</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SALES LOG ───────────────────────────────────────────────── */}
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
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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

// Need CartesianGrid from recharts
import { CartesianGrid } from 'recharts';

export default CashierPortal;
