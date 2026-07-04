import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = [
        { id: 1, title: 'Low Stock Warning', msg: 'Brembo Brake Pads below 10 units threshold.', time: '10 min ago', unread: true },
        { id: 2, title: 'New Customer Registered', msg: 'Marcus Brody registered 2018 Ford F-150.', time: '1 hr ago', unread: true },
        { id: 3, title: 'Invoice #ORD-9021 Completed', msg: 'Payment of $325.00 received via Card.', time: '3 hrs ago', unread: false },
    ];

    return (
        <header
            className="flex justify-between items-center px-4 md:px-8 py-3 border-b animate-slide-in-down sticky top-0 z-40"
            style={{
                background: 'rgba(11, 13, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(0, 240, 255, 0.15)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
        >
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 rounded-lg bg-white/5 border border-glass text-primary"
                    onClick={toggleSidebar}
                >
                    <span className="text-xl">☰</span>
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success animate-pulse"></span>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-wide">
                            APEX POS TERMINAL & INVENTORY
                        </h2>
                    </div>
                </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
                {/* POS Quick Button */}
                <Link
                    to="/pos"
                    className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 hover-glow"
                >
                    <span>🛒</span>
                    <span className="font-bold hidden sm:inline">New Sale</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="p-2 rounded-lg bg-white/5 border border-glass text-white relative hover:border-primary/50 transition-all"
                    >
                        <span>🔔</span>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-[10px] font-bold flex items-center justify-center text-white">
                            2
                        </span>
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 glass-panel p-3 rounded-xl z-50 animate-scale-in space-y-2">
                            <div className="flex justify-between items-center pb-2 border-b border-glass">
                                <h4 className="font-bold text-sm text-primary flex items-center gap-1"><span>🔔</span> Notifications</h4>
                                <span className="text-[10px] text-muted">2 Unread</span>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-2 rounded-lg text-xs transition-colors ${
                                            n.unread ? 'bg-primary/10 border border-primary/20' : 'bg-black/30 border border-glass'
                                        }`}
                                    >
                                        <div className="flex justify-between font-bold text-white mb-0.5">
                                            <span>{n.title}</span>
                                            <span className="text-[10px] text-muted font-normal">{n.time}</span>
                                        </div>
                                        <p className="text-muted">{n.msg}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-glass transition-all"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-xs text-muted hidden md:inline">▼</span>
                    </button>

                    {dropdownOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-56 glass-panel py-2 z-50 animate-scale-in space-y-1"
                        >
                            <div className="px-4 py-2 border-b border-glass">
                                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                                <p className="text-[11px] text-muted truncate">{user?.email || 'admin@apex.com'}</p>
                            </div>

                            <Link
                                to="/settings"
                                className="flex items-center gap-2 px-4 py-2 text-xs text-white hover:bg-primary/20 hover:text-primary transition-all"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <span>⚙️</span> Settings & Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-4 py-2 text-xs text-danger hover:bg-danger/20 transition-all text-left"
                            >
                                <span>🚪</span> Logout System
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
