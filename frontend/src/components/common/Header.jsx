import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            className="flex justify-between items-center px-6 py-4 border-b animate-slide-in-down"
            style={{
                background: 'rgba(11, 13, 23, 0.8)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(0, 240, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 rounded-lg transition-all duration-300 hover-lift"
                    onClick={toggleSidebar}
                    style={{
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        color: 'var(--color-primary)'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>☰</span>
                </button>
                <div className="hidden md:block">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                        Point of Sale System
                    </h2>
                    <p className="text-xs text-muted">Manage your automotive shop efficiently</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    to="/pos"
                    className="btn btn-primary hover-glow"
                    style={{
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>🛒</span>
                    <span className="hidden sm:inline">POS Terminal</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all duration-300 hover-lift"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            background: dropdownOpen ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            border: '1px solid',
                            borderColor: dropdownOpen ? 'rgba(0, 240, 255, 0.3)' : 'transparent'
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                                border: '2px solid rgba(0, 240, 255, 0.5)'
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {user?.role || 'User'}
                            </p>
                        </div>
                        <span
                            className="text-xs transition-transform duration-300"
                            style={{
                                color: 'var(--text-muted)',
                                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        >
                            ▼
                        </span>
                    </button>

                    {dropdownOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-64 rounded-lg py-2 z-50 animate-scale-in"
                            style={{
                                background: 'rgba(11, 13, 23, 0.95)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)'
                            }}
                        >
                            <div
                                className="px-4 py-3 border-b"
                                style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
                                        }}
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                            {user?.email || 'user@example.com'}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="inline-block px-2 py-1 text-xs rounded-full"
                                    style={{
                                        background: user?.role === 'admin' ? 'rgba(112, 0, 255, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                                        color: user?.role === 'admin' ? 'var(--color-accent)' : 'var(--color-primary)',
                                        border: `1px solid ${user?.role === 'admin' ? 'rgba(112, 0, 255, 0.3)' : 'rgba(0, 240, 255, 0.3)'}`,
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {user?.role || 'User'}
                                </span>
                            </div>

                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300"
                                onClick={() => setDropdownOpen(false)}
                                style={{ color: 'var(--text-main)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                                    e.currentTarget.style.paddingLeft = '20px';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.paddingLeft = '16px';
                                }}
                            >
                                <span>👤</span>
                                <span>My Profile</span>
                            </Link>

                            <Link
                                to="/settings"
                                className="flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300"
                                onClick={() => setDropdownOpen(false)}
                                style={{ color: 'var(--text-main)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                                    e.currentTarget.style.paddingLeft = '20px';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.paddingLeft = '16px';
                                }}
                            >
                                <span>⚙️</span>
                                <span>Settings</span>
                            </Link>

                            <div
                                className="border-t my-1"
                                style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}
                            />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-300"
                                style={{ color: 'var(--color-danger)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
                                    e.currentTarget.style.paddingLeft = '20px';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.paddingLeft = '16px';
                                }}
                            >
                                <span>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
