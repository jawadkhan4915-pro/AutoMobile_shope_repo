import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
                    <p className="text-xs font-medium text-slate-500">Loading Auto POS Portal...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
