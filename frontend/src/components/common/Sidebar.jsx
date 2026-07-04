import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { isAdmin, user } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'POS Terminal', path: '/pos', icon: '🛒', badge: 'Live' },
        { name: 'Auto Parts & Stock', path: '/products', icon: '📦' },
        { name: 'Customer Profiles', path: '/customers', icon: '👥' },
        { name: 'Invoices & Orders', path: '/orders', icon: '📝' },
        { name: 'Analytics & Reports', path: '/reports', icon: '📈' },
        { name: 'System Settings', path: '/settings', icon: '⚙️' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden animate-fade-in"
                    onClick={closeSidebar}
                    style={{ backdropFilter: 'blur(8px)' }}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    background: 'linear-gradient(180deg, #0B0D17 0%, #16192b 100%)',
                    borderRight: '1px solid rgba(0, 240, 255, 0.15)',
                    boxShadow: '4px 0 25px rgba(0, 0, 0, 0.4)'
                }}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center px-6 border-b border-glass bg-black/30">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xl text-black shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                        >
                            🏎️
                        </div>
                        <div>
                            <h1
                                className="text-lg font-extrabold tracking-wider"
                                style={{
                                    background: 'linear-gradient(135deg, #00F0FF, #7000FF)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                APEX MOTORWORKS
                            </h1>
                            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Auto POS & Inventory</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Badge */}
                <div className="px-4 py-4 border-b border-glass bg-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-black"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)'
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate text-white">
                                {user?.name || 'Administrator'}
                            </p>
                            <p className="text-xs text-muted truncate">
                                {user?.email || 'admin@apexmotorworks.com'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="mt-4 px-3 space-y-1.5 overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-primary/20 border border-primary text-primary shadow-lg'
                                        : 'text-muted hover:text-white hover:bg-white/5'
                                }`
                            }
                            style={({ isActive }) =>
                                isActive
                                    ? {
                                          background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))',
                                          borderColor: 'var(--color-primary)',
                                          color: 'var(--color-primary)',
                                      }
                                    : {}
                            }
                            onClick={() => window.innerWidth < 768 && closeSidebar()}
                        >
                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary border border-primary/40">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-glass text-center bg-black/40 text-xs text-muted">
                    <p>© 2026 Apex MotorWorks v2.5</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
