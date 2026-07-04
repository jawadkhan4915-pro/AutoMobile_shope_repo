import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen flex-col gap-4 bg-[#0B0D17]">
                <div className="spinner"></div>
                <p className="text-muted text-xs">Loading Apex Automotive Portal...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div
            className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: 'radial-gradient(circle at 50% 20%, #161a2e 0%, #0B0D17 80%)',
            }}
        >
            {/* Animated Ambient Glowing Orbs */}
            <div
                style={{
                    position: 'absolute',
                    top: '15%',
                    left: '15%',
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(70px)',
                    animation: 'pulse 6s ease-in-out infinite'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '15%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(112, 0, 255, 0.18) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(70px)',
                    animation: 'pulse 8s ease-in-out infinite'
                }}
            />

            {/* Login Card Container */}
            <div
                className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-2xl border border-glass shadow-2xl relative z-10 animate-scale-in"
                style={{
                    background: 'rgba(15, 20, 35, 0.75)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.12)'
                }}
            >
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
