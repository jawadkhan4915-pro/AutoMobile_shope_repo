import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const { user } = useAuth();

    const chartData = [
        { name: 'Mon', sales: 4200, orders: 32 },
        { name: 'Tue', sales: 3800, orders: 28 },
        { name: 'Wed', sales: 5100, orders: 41 },
        { name: 'Thu', sales: 4900, orders: 37 },
        { name: 'Fri', sales: 6800, orders: 54 },
        { name: 'Sat', sales: 8400, orders: 68 },
        { name: 'Sun', sales: 7200, orders: 59 },
    ];

    const recentActivity = [
        { id: 1, action: 'New sale completed', detail: 'Invoice #ORD-9045 — $347.50', time: '5 min ago', icon: '🛒', color: 'var(--color-success)' },
        { id: 2, action: 'Stock updated', detail: 'Brembo Brake Pads +25 units', time: '20 min ago', icon: '📦', color: 'var(--color-info)' },
        { id: 3, action: 'Customer registered', detail: 'Marcus Brody — 2018 Ford F-150', time: '1 hr ago', icon: '👤', color: 'var(--color-primary)' },
        { id: 4, action: 'Low stock alert', detail: 'Denso Spark Plugs — 3 units remaining', time: '2 hrs ago', icon: '⚠️', color: 'var(--color-warning)' },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await ordersAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                setStats({
                    today: { sales: 2480.50, orders: 18 },
                    total: { sales: 162900.00, orders: 1240 }
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Loader />;

    const statCards = [
        {
            title: "Today's Revenue",
            value: `$${(stats?.today?.sales || 2480.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            change: '+14.2%',
            trend: 'up',
            sub: 'vs yesterday',
            icon: '💰',
            gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.05))',
            accentColor: 'var(--color-primary)',
        },
        {
            title: 'Total Revenue',
            value: `$${(stats?.total?.sales || 162900).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
            change: '+18.4%',
            trend: 'up',
            sub: 'this month',
            icon: '📈',
            gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(52, 211, 153, 0.03))',
            accentColor: 'var(--color-success)',
        },
        {
            title: 'Total Orders',
            value: (stats?.total?.orders || 1240).toLocaleString(),
            change: null,
            sub: 'lifetime invoices',
            icon: '🧾',
            gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(56, 189, 248, 0.03))',
            accentColor: 'var(--color-accent)',
        },
        {
            title: 'Low Stock Alert',
            value: '3 Parts',
            change: null,
            sub: 'requires reorder',
            icon: '⚠️',
            gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12), rgba(248, 113, 113, 0.03))',
            accentColor: 'var(--color-danger)',
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
            {/* Welcome Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 28,
                flexWrap: 'wrap',
                gap: 16,
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: 0,
                        marginBottom: 4,
                        letterSpacing: '-0.03em',
                    }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name || 'Admin'} 👋
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                        Here's what's happening at Apex MotorWorks today
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 500 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <span className="badge badge-success" style={{ marginTop: 4 }}>● System Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginBottom: 28,
            }}>
                {statCards.map((card, i) => (
                    <div
                        key={card.title}
                        className="hover-lift"
                        style={{
                            background: card.gradient,
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 14,
                            padding: '20px 22px',
                            position: 'relative',
                            overflow: 'hidden',
                            animation: `slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both`,
                        }}
                    >
                        {/* Left accent line */}
                        <div style={{
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: 3,
                            background: card.accentColor,
                            borderRadius: '3px 0 0 3px',
                        }} />

                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: 8,
                                }}>
                                    {card.title}
                                </p>
                                <h3 style={{
                                    fontSize: '1.625rem',
                                    fontWeight: 800,
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1.1,
                                    margin: 0,
                                }}>
                                    {card.value}
                                </h3>
                            </div>
                            <span style={{
                                fontSize: '1.5rem',
                                padding: '8px',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)',
                            }}>
                                {card.icon}
                            </span>
                        </div>

                        {(card.change || card.sub) && (
                            <div className="flex items-center gap-2" style={{ marginTop: 12 }}>
                                {card.change && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: card.trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)',
                                    }}>
                                        {card.trend === 'up' ? '↑' : '↓'} {card.change}
                                    </span>
                                )}
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    {card.sub}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts + Activity */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: 20,
            }} className="dashboard-grid">
                {/* Revenue Chart */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px 22px',
                        borderBottom: '1px solid var(--border-subtle)',
                    }}>
                        <div>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                Revenue Overview
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                                Weekly sales performance
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            {['week', 'month', 'year'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setTimeRange(r)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: 6,
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: timeRange === r ? 'var(--color-primary-deep)' : 'transparent',
                                        color: timeRange === r ? '#fff' : 'var(--text-muted)',
                                        transition: 'all 0.15s',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ padding: '16px 16px 8px', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(148, 163, 184, 0.4)"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="rgba(148, 163, 184, 0.4)"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        color: '#f1f5f9',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    }}
                                    formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#818cf8"
                                    strokeWidth={2.5}
                                    fill="url(#colorRevenue)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        padding: '18px 22px',
                        borderBottom: '1px solid var(--border-subtle)',
                    }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Recent Activity
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                            Latest operations
                        </p>
                    </div>

                    <div style={{ padding: '8px 16px', flex: 1 }}>
                        {recentActivity.map((item, i) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3"
                                style={{
                                    padding: '14px 6px',
                                    borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                }}
                            >
                                <span style={{
                                    fontSize: '1.125rem',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 10,
                                    background: 'rgba(255,255,255,0.04)',
                                    flexShrink: 0,
                                }}>
                                    {item.icon}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                        {item.action}
                                    </p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.detail}
                                    </p>
                                </div>
                                <span style={{
                                    fontSize: '0.625rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    marginTop: 2,
                                }}>
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        padding: '14px 16px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}>
                        <Link to="/pos" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                            🛒 Start New POS Sale
                        </Link>
                        <Link to="/products" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                            📦 View Inventory
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
