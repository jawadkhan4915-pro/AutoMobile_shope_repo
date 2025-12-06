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
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name}!</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="stats-card bg-primary-gradient">
                    <p className="stats-card-title">Today's Sales</p>
                    <p className="stats-card-value">${stats?.today?.sales.toFixed(2) || '0.00'}</p>
                    <p className="stats-card-change">
                        {stats?.today?.orders || 0} orders today
                    </p>
                </div>

                <div className="stats-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <p className="stats-card-title">Total Sales</p>
                    <p className="stats-card-value">${stats?.total?.sales.toFixed(2) || '0.00'}</p>
                    <p className="stats-card-change">
                        {stats?.total?.orders || 0} total orders
                    </p>
                </div>

                {/* Placeholder for more stats */}
                <div className="stats-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <p className="stats-card-title">Low Stock Items</p>
                    <p className="stats-card-value">5</p>
                    <p className="stats-card-change">Requires attention</p>
                </div>

                <div className="stats-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    <p className="stats-card-title">Active Products</p>
                    <p className="stats-card-value">24</p>
                    <p className="stats-card-change">In catalog</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                    </div>
                    <div className="card-body">
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="card-body grid grid-cols-2 gap-4">
                        <a href="/pos" className="btn btn-primary justify-center text-center">
                            New Sale (POS)
                        </a>
                        <a href="/products" className="btn btn-outline justify-center text-center">
                            Add Product
                        </a>
                        <a href="/customers" className="btn btn-outline justify-center text-center">
                            Add Customer
                        </a>
                        <a href="/reports" className="btn btn-outline justify-center text-center">
                            View Reports
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
