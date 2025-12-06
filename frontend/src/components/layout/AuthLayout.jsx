import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full text-center mb-4">
                <h1 className="text-primary" style={{ marginBottom: '0.5rem' }}>Easy POS</h1>
                <p className="text-muted">Automotive Shop Management</p>
            </div>

            <div className="glass-panel w-full" style={{ maxWidth: '450px', padding: '32px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
