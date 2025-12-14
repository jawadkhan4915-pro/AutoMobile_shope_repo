import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen flex-col gap-4">
                <div className="spinner"></div>
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div
            className="w-full h-screen overflow-y-auto overflow-x-hidden relative"
            style={{
                background: 'linear-gradient(135deg, #0B0D17 0%, #1a1d2e 100%)',
            }}
        >
            {/* Animated Background Elements */}
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(112, 0, 255, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'pulse 5s ease-in-out infinite'
                }}
            />

            {/* Scrollable Content Wrapper */}
            <div className="min-h-full flex flex-col justify-center items-center p-4 relative z-10 py-12">
                {/* Logo and Title */}
                <div className="w-full text-center mb-8 animate-slide-in-down" style={{ maxWidth: '450px' }}>
                    <div
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            marginBottom: '16px'
                        }}
                    >
                        <h1
                            className="text-primary animate-glow"
                            style={{
                                marginBottom: '0',
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '2px'
                            }}
                        >
                            EASY POS
                        </h1>
                    </div>
                    <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                        Automotive Shop Management System
                    </p>
                </div>

                {/* Auth Form Container */}
                <div
                    className="glass-panel w-full animate-scale-in hover-lift"
                    style={{
                        maxWidth: '480px',
                        padding: '40px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)'
                    }}
                >
                    <Outlet />
                </div>

                {/* Footer */}
                <div
                    className="mt-6 text-center text-sm text-muted animate-fade-in"
                >
                    <p>© 2024 Easy POS. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
