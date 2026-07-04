import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Chart Data
    const chartData = [
        { name: 'Mon', sales: 4200, orders: 32 },
        { name: 'Tue', sales: 3800, orders: 28 },
        { name: 'Wed', sales: 5100, orders: 41 },
        { name: 'Thu', sales: 4900, orders: 37 },
        { name: 'Fri', sales: 6800, orders: 54 },
        { name: 'Sat', sales: 8400, orders: 68 },
        { name: 'Sun', sales: 7200, orders: 59 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await ordersAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Failed to fetch stats, using default dashboard stats:', error);
                setStats({
                    today: { sales: 2480.50 },
                    total: { sales: 162900.00, orders: 1240 }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-6 animate-fade-in space-y-6">
            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold mb-1">
                        Welcome back, <span style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))'
                        }}>{user?.name || 'Admin'}</span> 👋
                    </h1>
                    <p className="text-sm text-muted">
                        Apex MotorWorks POS & Inventory Management System Dashboard
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs text-muted font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <span className="badge badge-success mt-1">Operational</span>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="stats-card hover-lift">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Today's Sales</p>
                            <h3 className="stats-card-value text-primary">${stats?.today?.sales?.toFixed(2) || '2,480.50'}</h3>
                        </div>
                        <span className="p-2 rounded-lg text-xl" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--color-primary)' }}>
                            📊
                        </span>
                    </div>
                    <p className="stats-card-change" style={{ color: 'var(--color-success)' }}>
                        <span>▲ +14.2%</span>
                        <span className="text-muted">vs yesterday</span>
                    </p>
                </div>

                {/* Card 2 */}
                <div className="stats-card hover-lift">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Total Revenue</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                ${stats?.total?.sales?.toFixed(2) || '162,900.00'}
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg text-xl" style={{ background: 'rgba(0, 255, 157, 0.1)', color: '#00FF9D' }}>
                            💰
                        </span>
                    </div>
                    <p className="stats-card-change" style={{ color: 'var(--color-success)' }}>
                        <span>▲ +18.4%</span>
                        <span className="text-muted font-normal">this month</span>
                    </p>
                </div>

                {/* Card 3 */}
                <div className="stats-card hover-lift">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Total Orders</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats?.total?.orders || 1240}
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg text-xl" style={{ background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' }}>
                            🧾
                        </span>
                    </div>
                    <p className="stats-card-change">
                        <span className="text-muted font-normal">Lifetime Invoices</span>
                    </p>
                </div>

                {/* Card 4 */}
                <div className="stats-card hover-lift">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Low Stock Alert</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FF0055)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                3 Parts
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg text-xl" style={{ background: 'rgba(255, 0, 85, 0.1)', color: '#FF0055' }}>
                            ⚠️
                        </span>
                    </div>
                    <p className="stats-card-change" style={{ color: 'var(--color-danger)' }}>
                        <span>Requires Reorder</span>
                    </p>
                </div>
            </div>

            {/* Charts & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Analytics Chart */}
                <div className="card lg:col-span-2">
                    <div className="card-header">
                        <h3 className="card-title text-lg flex items-center gap-2">
                            <span>📈</span> Weekly Revenue Velocity
                        </h3>
                        <Link to="/reports" className="text-xs text-primary hover:underline">
                            View Deep Analytics →
                        </Link>
                    </div>
                    <div className="card-body h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0B0D17',
                                        border: '1px solid rgba(0, 240, 255, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions & Navigation Shortcuts */}
                <div className="card space-y-3">
                    <div className="card-header">
                        <h3 className="card-title text-lg flex items-center gap-2">
                            <span>⚡</span> Quick Navigation
                        </h3>
                    </div>
                    <div className="card-body flex flex-col gap-3">
                        <Link to="/pos" className="btn btn-primary w-full justify-between hover-glow">
                            <span className="flex items-center gap-2"><span>🛒</span> Start New POS Sale</span>
                            <span>→</span>
                        </Link>

                        <Link to="/products" className="btn btn-secondary w-full justify-between">
                            <span className="flex items-center gap-2"><span>📦</span> Auto Parts Catalog</span>
                            <span>→</span>
                        </Link>

                        <Link to="/customers" className="btn btn-secondary w-full justify-between">
                            <span className="flex items-center gap-2"><span>👥</span> Customer Directory</span>
                            <span>→</span>
                        </Link>

                        <Link to="/reports" className="btn btn-secondary w-full justify-between">
                            <span className="flex items-center gap-2"><span>📊</span> Reports & Analytics</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
