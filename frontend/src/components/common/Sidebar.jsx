import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { isAdmin } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'POS', path: '/pos', icon: '🖥️' },
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
                    className="fixed inset-0 bg-black bg-opacity-50 z-modal-backdrop md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-fixed w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:static md:h-screen sidebar`}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary">Easy POS</h1>
                </div>

                <nav className="mt-4 px-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navItems.map((item) => {
                        if (item.adminOnly && !isAdmin) return null;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-primary-light text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                                onClick={() => window.innerWidth < 768 && closeSidebar()}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
