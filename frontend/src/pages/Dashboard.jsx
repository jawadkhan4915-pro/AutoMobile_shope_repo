import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/apiService';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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
        <div className="p-4">
            <h1 className="mb-4">Welcome back, {user?.name}!</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="stats-card">
                    <p className="stats-card-title">Today's Sales</p>
                    <p className="stats-card-value text-primary">${stats?.today?.sales.toFixed(2) || '0.00'}</p>
                    <p className="stats-card-change">
                        {stats?.today?.orders || 0} orders today
                    </p>
                </div>

                <div className="stats-card" style={{ '--color-primary': '#00FF9D' }}>
                    <p className="stats-card-title">Total Sales</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00FF9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ${stats?.total?.sales.toFixed(2) || '0.00'}
                    </p>
                    <p className="stats-card-change">
                        {stats?.total?.orders || 0} total orders
                    </p>
                </div>

                <div className="stats-card" style={{ '--color-primary': '#FFB800' }}>
                    <p className="stats-card-title">Low Stock Items</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #FFB800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        5
                    </p>
                    <p className="stats-card-change">Requires attention</p>
                </div>

                <div className="stats-card" style={{ '--color-primary': '#00F0FF' }}>
                    <p className="stats-card-title">Active Products</p>
                    <p className="stats-card-value" style={{ background: 'linear-gradient(to right, #fff, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        24
                    </p>
                    <p className="stats-card-change">In catalog</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                    </div>
                    <div className="card-body">
                        <p className="text-muted text-center py-4">No recent activity</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="card-body grid grid-cols-2 gap-4">
                        <a href="/pos" className="btn btn-primary text-center">
                            New Sale (POS)
                        </a>
                        <a href="/products" className="btn btn-secondary text-center">
                            Add Product
                        </a>
                        <a href="/customers" className="btn btn-secondary text-center">
                            Add Customer
                        </a>
                        <a href="/reports" className="btn btn-secondary text-center">
                            View Reports
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
