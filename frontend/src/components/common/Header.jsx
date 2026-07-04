import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get current page title
    const getPageTitle = () => {
        const routes = {
            '/': 'Dashboard',
            '/pos': 'POS Terminal',
            '/products': 'Auto Parts & Stock',
            '/customers': 'Customer Profiles',
            '/orders': 'Invoices & Orders',
            '/reports': 'Analytics & Reports',
            '/settings': 'System Settings',
        };
        return routes[location.pathname] || 'Dashboard';
    };

    const notifications = [
        { id: 1, title: 'Low Stock Alert', msg: 'Brembo Brake Pads below 10 units threshold.', time: '10m', unread: true, type: 'warning' },
        { id: 2, title: 'New Customer', msg: 'Marcus Brody registered 2018 Ford F-150.', time: '1h', unread: true, type: 'info' },
        { id: 3, title: 'Invoice Completed', msg: 'Payment of $325.00 received via Card.', time: '3h', unread: false, type: 'success' },
    ];

    const typeColors = {
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            height: 56,
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        }}>
            {/* Left: Hamburger + Page Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    style={{
                        display: 'none',
                        padding: 8,
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 16,
                    }}
                    className="mobile-menu-btn"
                >
                    ☰
                </button>

                <div>
                    <h2 style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        letterSpacing: '-0.01em',
                    }}>
                        {getPageTitle()}
                    </h2>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* New Sale CTA */}
                <Link
                    to="/pos"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--color-primary-deep), var(--color-accent-deep))',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 4px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    <span>🛒</span>
                    <span>New Sale</span>
                </Link>

                {/* Notifications */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        style={{
                            padding: 8,
                            borderRadius: 8,
                            background: notifOpen ? 'var(--bg-hover)' : 'transparent',
                            border: '1px solid transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            position: 'relative',
                            fontSize: 16,
                            transition: 'all 0.15s',
                        }}
                    >
                        🔔
                        <span style={{
                            position: 'absolute',
                            top: 4, right: 4,
                            width: 8, height: 8,
                            borderRadius: '50%',
                            background: 'var(--color-danger)',
                            border: '2px solid var(--bg-base)',
                        }} />
                    </button>

                    {notifOpen && (
                        <div className="animate-scale-in" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: 8,
                            width: 320,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                            overflow: 'hidden',
                            zIndex: 50,
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border-subtle)',
                            }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Notifications
                                </span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer' }}>
                                    Mark all read
                                </span>
                            </div>

                            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                                {notifications.map((n) => (
                                    <div key={n.id} style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        background: n.unread ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
                                            <div className="flex items-center gap-2">
                                                <span style={{
                                                    width: 6, height: 6, borderRadius: '50%',
                                                    background: n.unread ? typeColors[n.type] : 'transparent',
                                                    display: 'inline-block',
                                                }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {n.title}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {n.time}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 14, lineHeight: 1.4 }}>
                                            {n.msg}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar Menu */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 8px 4px 4px',
                            borderRadius: 8,
                            background: dropdownOpen ? 'var(--bg-hover)' : 'transparent',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#fff',
                            background: 'linear-gradient(135deg, var(--color-primary-deep), var(--color-accent-deep))',
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>▾</span>
                    </button>

                    {dropdownOpen && (
                        <div className="animate-scale-in" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: 8,
                            width: 220,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                            overflow: 'hidden',
                            zIndex: 50,
                        }}>
                            <div style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid var(--border-subtle)',
                            }}>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.name || 'Administrator'}
                                </p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.email || 'admin@apex.com'}
                                </p>
                            </div>

                            <div style={{ padding: '4px' }}>
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    ⚙️ Settings
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        color: 'var(--color-danger)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn { display: flex !important; }
                }
            `}</style>
        </header>
    );
};

export default Header;
