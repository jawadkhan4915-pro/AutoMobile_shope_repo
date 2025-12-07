import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { isAdmin, user } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'POS', path: '/pos', icon: '🛒' },
        { name: 'Products', path: '/products', icon: '📦' },
        { name: 'Customers', path: '/customers', icon: '👥' },
        { name: 'Orders', path: '/orders', icon: '📝' },
        { name: 'Reports', path: '/reports', icon: '📈' },
        { name: 'Settings', path: '/settings', icon: '⚙️', adminOnly: true },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden animate-fade-in"
                    onClick={closeSidebar}
                    style={{ backdropFilter: 'blur(4px)' }}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{
                    background: 'linear-gradient(180deg, #0B0D17 0%, #1a1d2e 100%)',
                    borderRight: '1px solid rgba(0, 240, 255, 0.1)',
                    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
                }}
            >
                {/* Logo Section */}
                <div
                    className="h-20 flex items-center justify-center border-b animate-slide-in-down"
                    style={{
                        borderColor: 'rgba(0, 240, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Easy POS Logo"
                            style={{
                                width: '48px',
                                height: '48px',
                                filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))'
                            }}
                            className="animate-glow"
                        />
                        <div>
                            <h1
                                className="text-xl font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '1px'
                                }}
                            >
                                EASY POS
                            </h1>
                            <p className="text-xs text-muted">Automotive Shop</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div
                    className="px-4 py-4 border-b animate-slide-in-left"
                    style={{
                        borderColor: 'rgba(0, 240, 255, 0.1)',
                        background: 'rgba(0, 240, 255, 0.03)'
                    }}
                >
                    <div className="flex items-center gap-3">
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
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-main)' }}>
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {user?.email || 'user@example.com'}
                            </p>
                            <span
                                className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
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
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-2 px-3 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
                    {navItems.map((item, index) => {
                        if (item.adminOnly && !isAdmin) return null;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 group animate-slide-in-left ${isActive
                                        ? 'nav-item-active'
                                        : 'nav-item-inactive'
                                    }`
                                }
                                style={{
                                    animationDelay: `${index * 0.05}s`
                                }}
                                onClick={() => window.innerWidth < 768 && closeSidebar()}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className="mr-3 text-xl transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))' : 'none'
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <span
                                                className="w-2 h-2 rounded-full animate-pulse"
                                                style={{ background: 'var(--color-primary)' }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 border-t text-center"
                    style={{
                        borderColor: 'rgba(0, 240, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <p className="text-xs text-muted">© 2024 Easy POS</p>
                    <p className="text-xs text-muted">v1.0.0</p>
                </div>
            </aside>

            <style jsx>{`
                .nav-item-active {
                    background: linear-gradient(135deg, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2));
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: var(--color-primary);
                    box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
                }

                .nav-item-inactive {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-muted);
                }

                .nav-item-inactive:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(0, 240, 255, 0.2);
                    color: var(--text-main);
                    transform: translateX(4px);
                }
            `}</style>
        </>
    );
};

export default Sidebar;
