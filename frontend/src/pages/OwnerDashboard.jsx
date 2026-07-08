import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Excel export (uses xlsx library) ────────────────────────────────────────
const exportToExcel = async (transactions, products, monthLabel) => {
    try {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        // Sheet 1: Transactions
        const trxRows = [
            ['ID', 'Date', 'Type', 'Customer', 'Staff', 'Items', 'Method', 'Subtotal', 'Tax', 'Total'],
            ...transactions.map(t => [
                t.id, new Date(t.date).toLocaleString(),
                t.type === 'mechanic_bill' ? 'Mechanic Bill' : 'POS Sale',
                t.customerName || 'Walk-in', t.staffName || '—',
                (t.items || []).map(i => `${i.name} x${i.qty}`).join('; '),
                t.method || '—', t.subtotal?.toFixed(2) || '0.00',
                t.tax?.toFixed(2) || '0.00', t.total?.toFixed(2) || '0.00',
            ])
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(trxRows);
        ws1['!cols'] = [10, 20, 16, 20, 16, 50, 12, 12, 12, 12].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');

        // Sheet 2: Product Stock
        const stockRows = [
            ['Product ID', 'Name', 'SKU', 'Category', 'Selling Price', 'Cost Price', 'Stock Qty', 'Stock Value'],
            ...products.map(p => [
                p._id, p.name, p.sku || '—', p.category,
                p.price?.toFixed(2), p.costPrice?.toFixed(2) || (p.price * 0.65).toFixed(2),
                p.quantity, ((p.price || 0) * (p.quantity || 0)).toFixed(2)
            ])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(stockRows);
        ws2['!cols'] = [10, 40, 12, 18, 14, 14, 12, 14].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws2, 'Product Stock');

        // Sheet 3: Summary
        const totalRevenue = transactions.reduce((s, t) => s + (t.total || 0), 0);
        const totalCost = transactions.reduce((s, t) =>
            s + (t.items || []).reduce((is, item) => {
                const p = products.find(p => p.name === item.name || p._id === item.productId);
                return is + ((p?.costPrice || (item.price || 0) * 0.65)) * (item.qty || 1);
            }, 0), 0);
        const totalProfit = totalRevenue - totalCost;

        const mechBills = transactions.filter(t => t.type === 'mechanic_bill');
        const cashSales = transactions.filter(t => t.type !== 'mechanic_bill');

        const summaryRows = [
            [`APEX MOTORWORKS — Monthly Summary: ${monthLabel}`],
            [],
            ['REVENUE BREAKDOWN'],
            ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
            ['Total Cost of Goods', `$${totalCost.toFixed(2)}`],
            ['Net Profit', `$${totalProfit.toFixed(2)}`],
            ['Profit Margin', `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`],
            [],
            ['TRANSACTION BREAKDOWN'],
            ['Total Transactions', transactions.length],
            ['POS Sales', cashSales.length],
            ['Mechanic Bills Processed', mechBills.length],
            ['Average Transaction Value', `$${transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : '0.00'}`],
            [],
            ['INVENTORY SUMMARY'],
            ['Total Products', products.length],
            ['Out of Stock Items', products.filter(p => p.quantity === 0).length],
            ['Low Stock Items (≤5)', products.filter(p => p.quantity > 0 && p.quantity <= 5).length],
            ['Total Stock Value', `$${products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0).toFixed(2)}`],
            [],
            ['Generated on', new Date().toLocaleString()],
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(summaryRows);
        ws3['!cols'] = [35, 20].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Summary');

        XLSX.writeFile(wb, `ApexMotorWorks_${monthLabel.replace(' ', '_')}_Report.xlsx`);
    } catch (err) {
        alert('Failed to export Excel: ' + err.message);
    }
};

// ─── Main Owner Dashboard ─────────────────────────────────────────────────────
const OwnerDashboard = () => {
    const { user } = useAuth();
    const { products, transactions, mechanicBills, getDailyChartData, getMonthlyStats } = useStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [chartRange, setChartRange] = useState(7);
    const [exporting, setExporting] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Compute stats
    const monthStats = useMemo(() => getMonthlyStats(currentYear, currentMonth), [getMonthlyStats, currentYear, currentMonth]);
    const chartData = useMemo(() => getDailyChartData(chartRange), [getDailyChartData, chartRange]);
    const lowStockProducts = useMemo(() => products.filter(p => p.quantity <= 5).sort((a, b) => a.quantity - b.quantity), [products]);
    const totalStockValue = useMemo(() => products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0), [products]);

    // Staff performance
    const staffStats = useMemo(() => {
        const byStaff = {};
        transactions.forEach(t => {
            const key = t.staffName || (t.staffRole === 'mechanic' ? 'Mechanic' : 'Cashier');
            if (!byStaff[key]) byStaff[key] = { name: key, role: t.staffRole || 'cashier', count: 0, revenue: 0 };
            byStaff[key].count++;
            byStaff[key].revenue += t.total || 0;
        });
        return Object.values(byStaff).sort((a, b) => b.revenue - a.revenue);
    }, [transactions]);

    // Pie chart for transaction types
    const typePieData = useMemo(() => {
        const cash = transactions.filter(t => t.type !== 'mechanic_bill').reduce((s, t) => s + (t.total || 0), 0);
        const mech = transactions.filter(t => t.type === 'mechanic_bill').reduce((s, t) => s + (t.total || 0), 0);
        return [
            { name: 'POS Sales', value: parseFloat(cash.toFixed(2)), color: '#6366f1' },
            { name: 'Mechanic Bills', value: parseFloat(mech.toFixed(2)), color: '#fbbf24' },
        ];
    }, [transactions]);

    const handleExport = useCallback(async () => {
        setExporting(true);
        const monthTrx = monthStats.transactions || transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });
        await exportToExcel(monthTrx, products, monthLabel);
        setExporting(false);
    }, [monthStats, transactions, products, currentYear, currentMonth, monthLabel]);

    const cardStyle = {
        background: 'var(--bg-panel, rgba(15,23,42,0.75))', border: '1px solid var(--border-glass, rgba(148,163,184,0.15))',
        borderRadius: 14, padding: 20,
    };

    const tabStyle = (t) => ({
        padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
        background: activeTab === t ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'rgba(148,163,184,0.08)',
        color: activeTab === t ? '#fff' : '#94a3b8',
    });

    const COLORS = ['#6366f1', '#34d399', '#fbbf24', '#60a5fa', '#f87171'];

    return (
        <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        🔑 Owner Dashboard
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                        Welcome, {user?.name || 'Owner'} · Full analytics & business intelligence
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Excel export button */}
                    <button onClick={handleExport} disabled={exporting} style={{
                        padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: '0.8125rem',
                        background: exporting ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#059669,#34d399)',
                        color: '#fff', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 3px 12px rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        {exporting ? '⏳ Exporting...' : '📥 Download Excel Report'}
                    </button>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[['overview', '📊 Overview'], ['staff', '👥 Staff'], ['stock', '📦 Stock'], ['reports', '📋 Reports']].map(([t, l]) => (
                            <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── OVERVIEW ────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 20 }}>
                        {[
                            { label: 'Monthly Revenue', value: `$${monthStats.revenue.toFixed(2)}`, icon: '💰', color: '#818cf8', sub: monthLabel, targetTab: 'reports' },
                            { label: 'Net Profit', value: `$${monthStats.profit.toFixed(2)}`, icon: '📈', color: '#34d399', sub: `${monthStats.revenue > 0 ? ((monthStats.profit / monthStats.revenue) * 100).toFixed(1) : 0}% margin`, targetTab: 'reports' },
                            { label: 'Cost of Goods', value: `$${monthStats.cost.toFixed(2)}`, icon: '📦', color: '#fbbf24', sub: 'This month', targetTab: 'reports' },
                            { label: 'Total Orders', value: monthStats.orders, icon: '🧾', color: '#60a5fa', sub: 'This month', targetTab: 'reports' },
                            { label: 'Stock Value', value: `$${totalStockValue.toFixed(2)}`, icon: '🏪', color: '#a78bfa', sub: `${products.length} products`, targetTab: 'stock' },
                            { label: 'Low Stock', value: lowStockProducts.length, icon: '⚠️', color: '#f87171', sub: 'Need reorder', targetTab: 'stock' },
                        ].map(({ label, value, icon, color, sub, targetTab }) => (
                            <div
                                key={label}
                                onClick={() => setActiveTab(targetTab)}
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
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</h3>
                                    <span style={{ fontSize: '1.4rem', transform: hoveredCard === label ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.2s' }}>{icon}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.6875rem', color: '#475569', fontWeight: 500 }}>{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 20 }}>
                        {/* Revenue & Profit chart */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem' }}>Revenue vs Profit</h3>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[7, 14, 30].map(d => (
                                        <button key={d} onClick={() => setChartRange(d)} style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                                            background: chartRange === d ? '#6366f1' : 'rgba(148,163,184,0.1)',
                                            color: chartRange === d ? '#fff' : '#64748b',
                                        }}>{d}d</button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={(v, n) => [`$${v.toFixed(2)}`, n === 'revenue' ? 'Revenue' : 'Profit']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                                    <Area type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} fill="url(#profGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sales type pie */}
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem' }}>Sales by Type</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={typePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {typePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={v => `$${v.toFixed(2)}`} />
                                    <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Low stock panel */}
                    {lowStockProducts.length > 0 && (
                        <div style={{ ...cardStyle, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.04)' }}>
                            <h3 style={{ margin: '0 0 14px', color: '#f87171', fontWeight: 700, fontSize: '0.9375rem' }}>⚠️ Low Stock Alerts</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
                                {lowStockProducts.map(p => (
                                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(15,23,42,0.5)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.15)' }}>
                                        <img src={p.imageUrl} alt={p.name} style={{ width: 38, height: 30, objectFit: 'cover', borderRadius: 5 }} onError={e => e.target.style.display = 'none'} loading="lazy" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#64748b' }}>{p.category}</p>
                                        </div>
                                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 800, background: p.quantity === 0 ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)', color: p.quantity === 0 ? '#f87171' : '#fbbf24', whiteSpace: 'nowrap' }}>
                                            {p.quantity === 0 ? 'OUT' : `${p.quantity} left`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── STAFF PERFORMANCE ────────────────────────────────────────── */}
            {activeTab === 'staff' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700 }}>Staff Performance</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                    {['Staff Member', 'Role', 'Transactions', 'Revenue'].map(h => (
                                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {staffStats.map((s, i) => (
                                    <tr key={s.name} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 800, fontSize: '0.875rem', color: '#fff',
                                                    background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                                                }}>{s.name.charAt(0)}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', background: s.role === 'mechanic' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)', color: s.role === 'mechanic' ? '#fbbf24' : '#34d399' }}>
                                                {s.role === 'mechanic' ? '🔧 Mechanic' : '🛒 Cashier'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9375rem', fontWeight: 800, color: '#818cf8' }}>{s.count}</td>
                                        <td style={{ padding: '12px', fontSize: '0.9375rem', fontWeight: 800, color: '#34d399' }}>${s.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {staffStats.length === 0 && <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: '#475569' }}>No staff data yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700 }}>Revenue by Staff</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={staffStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={v => `$${v.toFixed(2)}`} />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── STOCK ────────────────────────────────────────────────────── */}
            {activeTab === 'stock' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>📦 Complete Stock Inventory</h3>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem' }}>
                            <span style={{ color: '#34d399', fontWeight: 700 }}>Total Value: ${totalStockValue.toFixed(2)}</span>
                            <span style={{ color: '#64748b' }}>{products.length} products</span>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                    {['Product', 'SKU', 'Category', 'Sell Price', 'Cost Price', 'Profit/Unit', 'Stock', 'Stock Value', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => {
                                    const costP = p.costPrice || p.price * 0.65;
                                    const profitPerUnit = p.price - costP;
                                    const stockVal = p.price * p.quantity;
                                    return (
                                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} loading="lazy" />
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>{p.sku}</td>
                                            <td style={{ padding: '12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.category}</td>
                                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>${p.price.toFixed(2)}</td>
                                            <td style={{ padding: '12px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>${costP.toFixed(2)}</td>
                                            <td style={{ padding: '12px', fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>${profitPerUnit.toFixed(2)}</td>
                                            <td style={{ padding: '12px', fontWeight: 800, fontSize: '1rem', color: p.quantity === 0 ? '#f87171' : p.quantity <= 5 ? '#fbbf24' : '#34d399' }}>{p.quantity}</td>
                                            <td style={{ padding: '12px', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>${stockVal.toFixed(2)}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 800, background: p.quantity === 0 ? 'rgba(248,113,113,0.2)' : p.quantity <= 5 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.15)', color: p.quantity === 0 ? '#f87171' : p.quantity <= 5 ? '#fbbf24' : '#34d399' }}>
                                                    {p.quantity === 0 ? '● OUT' : p.quantity <= 5 ? '● LOW' : '● OK'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── REPORTS ──────────────────────────────────────────────────── */}
            {activeTab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Monthly summary card */}
                    <div style={{ ...cardStyle, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>📥 Monthly Excel Report</h3>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                                    Download complete report for <strong style={{ color: '#818cf8' }}>{monthLabel}</strong>
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#475569' }}>
                                    Includes: Transactions sheet · Product Stock sheet · Monthly Summary sheet
                                </p>
                            </div>
                            <button onClick={handleExport} disabled={exporting} style={{
                                padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.9375rem',
                                background: exporting ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#059669,#34d399)',
                                color: '#fff', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 16px rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                {exporting ? '⏳ Preparing...' : '📥 Download Excel'}
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 20 }}>
                            {[
                                { label: 'Revenue', value: `$${monthStats.revenue.toFixed(2)}`, color: '#6366f1' },
                                { label: 'Cost', value: `$${monthStats.cost.toFixed(2)}`, color: '#fbbf24' },
                                { label: 'Profit', value: `$${monthStats.profit.toFixed(2)}`, color: '#34d399' },
                                { label: 'Transactions', value: monthStats.orders, color: '#60a5fa' },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 6px', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All transactions */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontWeight: 700 }}>All Transactions ({transactions.length})</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                                        {['ID', 'Type', 'Staff', 'Customer', 'Items', 'Method', 'Total', 'Date'].map(h => (
                                            <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '0.625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{t.id}</td>
                                            <td style={{ padding: '11px 12px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.5625rem', fontWeight: 700, background: t.type === 'mechanic_bill' ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)', color: t.type === 'mechanic_bill' ? '#fbbf24' : '#818cf8' }}>
                                                    {t.type === 'mechanic_bill' ? '🔧 Mech' : '🛒 POS'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 12px', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{t.staffName || '—'}</td>
                                            <td style={{ padding: '11px 12px', fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{t.customerName || 'Walk-in'}</td>
                                            <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#64748b' }}>{(t.items || []).length} item(s)</td>
                                            <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{t.method || '—'}</td>
                                            <td style={{ padding: '11px 12px', fontWeight: 800, color: '#34d399', fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>${(t.total || 0).toFixed(2)}</td>
                                            <td style={{ padding: '11px 12px', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
