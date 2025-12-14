import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Mock data for the chart (replace with real data if API provides history)
    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await ordersAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 animate-slide-in-down">
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent" style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))'
                        }}>{user?.name}</span>
                    </h1>
                    <p className="text-muted text-lg">
                        Here's what's happening with your store today
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1 */}
                <div className="stats-card hover-lift stagger-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Today's Sales</p>
                            <h3 className="stats-card-value text-primary">${stats?.today?.sales.toFixed(2) || '0.00'}</h3>
                        </div>
                        <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--color-primary)' }}>
                            📊
                        </span>
                    </div>
                    <p className="stats-card-change">
                        <span className="text-success flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                            ↑ 12%
                        </span>
                        <span className="ml-1">vs yesterday</span>
                    </p>
                </div>

                {/* Card 2 */}
                <div className="stats-card hover-lift stagger-2" style={{ '--color-primary': '#00FF9D' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Total Revenue</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                ${stats?.total?.sales.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg" style={{ background: 'rgba(0, 255, 157, 0.1)', color: '#00FF9D' }}>
                            💰
                        </span>
                    </div>
                    <p className="stats-card-change">
                        <span className="text-success flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                            ↑ 8%
                        </span>
                        <span className="ml-1">this month</span>
                    </p>
                </div>

                {/* Card 3 */}
                <div className="stats-card hover-lift stagger-3" style={{ '--color-primary': '#FFB800' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Total Orders</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats?.total?.orders || 0}
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg" style={{ background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' }}>
                            🛍️
                        </span>
                    </div>
                    <p className="stats-card-change">
                        <span className="text-muted">Lifetime orders</span>
                    </p>
                </div>

                {/* Card 4 */}
                <div className="stats-card hover-lift stagger-4" style={{ '--color-primary': '#FF0055' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stats-card-title">Low Stock</p>
                            <h3 className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FF0055)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                5
                            </h3>
                        </div>
                        <span className="p-2 rounded-lg" style={{ background: 'rgba(255, 0, 85, 0.1)', color: '#FF0055' }}>
                            ⚠️
                        </span>
                    </div>
                    <p className="stats-card-change" style={{ color: 'var(--color-danger)' }}>
                        Needs attention
                    </p>
                </div>
            </div>

            {/* Charts & Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="card lg:col-span-2 hover-lift stagger-1">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Analytics</h3>
                        <select className="bg-transparent border border-gray-700 rounded-md text-sm p-1 text-muted"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0B0D17',
                                        border: '1px solid rgba(0, 240, 255, 0.3)',
                                        borderRadius: '8px',
                                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#00F0FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card hover-lift stagger-2">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="card-body flex flex-col gap-4">
                        <a href="/pos" className="btn btn-primary w-full group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span className="text-xl">🛒</span>
                            <div className="text-left">
                                <div className="font-bold">New Sale</div>
                                <div className="text-xs opacity-80 font-normal">Open POS Terminal</div>
                            </div>
                            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </a>

                        <a href="/products" className="btn btn-secondary w-full group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span className="text-xl">📦</span>
                            <div className="text-left">
                                <div className="font-bold">Add Product</div>
                                <div className="text-xs opacity-70 font-normal">Manage Inventory</div>
                            </div>
                        </a>

                        <a href="/customers" className="btn btn-secondary w-full group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <span className="text-xl">👥</span>
                            <div className="text-left">
                                <div className="font-bold">Add Customer</div>
                                <div className="text-xs opacity-70 font-normal">Register New User</div>
                            </div>
                        </a>

                        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                            <h4 className="text-sm font-semibold mb-2 text-muted">System Status</h4>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-success">All systems operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
