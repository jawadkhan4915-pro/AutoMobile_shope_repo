import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { isOwner, isCashier, isMechanic, user } = useAuth();

    // Role-specific nav items with descriptions
    const allNavItems = [
        // ALL ROLES
        { name: 'Dashboard', path: '/', icon: '📊', section: 'main', roles: ['owner', 'cashier', 'mechanic'],
          desc: { owner: 'Analytics & KPIs', cashier: 'Sales summary', mechanic: 'Workstation' } },

        // OWNER + CASHIER
        { name: 'POS Terminal', path: '/pos', icon: '🛒', badge: 'Live', section: 'operations', roles: ['owner', 'cashier'],
          desc: { owner: 'Point of Sale', cashier: 'Process sales' } },

        // ALL ROLES — product access differs by role
        { name: 'Auto Parts & Stock', path: '/products', icon: '📦', section: 'inventory', roles: ['owner', 'cashier', 'mechanic'],
          desc: { owner: 'Manage inventory', cashier: 'Browse & sell', mechanic: 'Parts lookup' } },

        // OWNER + CASHIER
        { name: 'Customers', path: '/customers', icon: '👥', section: 'crm', roles: ['owner', 'cashier'],
          desc: { owner: 'CRM', cashier: 'Customer records' } },
        { name: 'Invoices & Orders', path: '/orders', icon: '📝', section: 'sales', roles: ['owner', 'cashier'],
          desc: { owner: 'All orders', cashier: 'Order history' } },

        // OWNER ONLY
        { name: 'Analytics & Reports', path: '/reports', icon: '📈', section: 'analytics', roles: ['owner'],
          desc: { owner: 'Business intelligence' } },
        { name: 'System Settings', path: '/settings', icon: '⚙️', section: 'settings', roles: ['owner'],
          desc: { owner: 'Shop configuration' } },
    ];

    const userRole = user?.role || 'owner';
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));


    const sections = {
        main: 'Operations',
        inventory: 'Inventory',
        crm: 'CRM',
        sales: 'Sales',
        analytics: 'Intelligence',
        settings: 'Configuration'
    };

    let lastSection = '';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden animate-fade-in"
                    onClick={closeSidebar}
                    style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:h-screen ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    borderRight: '1px solid var(--border-subtle)',
                }}
            >
                {/* Brand Header */}
                <div style={{
                    padding: '20px 20px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                }}>
                    <div className="flex items-center gap-3">
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                background: 'linear-gradient(135deg, var(--color-primary-deep), var(--color-accent-deep))',
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            🏎️
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '0.9375rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                color: '#fff',
                                margin: 0,
                                lineHeight: 1.2,
                            }}>
                                APEX MOTORS
                            </h1>
                            <p style={{
                                fontSize: '0.625rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                fontWeight: 600,
                                margin: 0,
                            }}>
                                POS & Inventory Suite
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Badge */}
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'rgba(99, 102, 241, 0.04)',
                }}>
                    <div className="flex items-center gap-3">
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: '#fff',
                            background: 'linear-gradient(135deg, var(--color-primary-deep), var(--color-accent-deep))',
                            flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name || 'Shop Owner'}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                <span style={{
                                    fontSize: '0.5625rem',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    padding: '1px 7px',
                                    borderRadius: 10,
                                    background: userRole === 'owner' ? 'rgba(129,140,248,0.2)' :
                                                userRole === 'cashier' ? 'rgba(52,211,153,0.2)' :
                                                'rgba(251,191,36,0.2)',
                                    color: userRole === 'owner' ? '#818cf8' :
                                           userRole === 'cashier' ? '#34d399' :
                                           '#fbbf24',
                                    border: `1px solid ${userRole === 'owner' ? 'rgba(129,140,248,0.3)' :
                                             userRole === 'cashier' ? 'rgba(52,211,153,0.3)' :
                                             'rgba(251,191,36,0.3)'}`,
                                    letterSpacing: '0.04em',
                                }}>
                                    {userRole === 'owner' ? '🔑 Owner' : userRole === 'cashier' ? '🛒 Cashier' : '🔧 Mechanic'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{
                    padding: '12px 12px',
                    overflowY: 'auto',
                    height: 'calc(100vh - 190px)',
                }}>
                    {navItems.map((item) => {
                        const showSection = item.section !== lastSection;
                        lastSection = item.section;

                        return (
                            <React.Fragment key={item.path}>
                                {showSection && (
                                    <p style={{
                                        fontSize: '0.625rem',
                                        fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        padding: '16px 12px 6px',
                                        marginTop: item.section === 'main' ? 0 : 4,
                                    }}>
                                        {sections[item.section]}
                                    </p>
                                )}
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link-item ${isActive ? 'nav-active' : ''}`
                                    }
                                    onClick={() => window.innerWidth < 768 && closeSidebar()}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '9px 12px',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        borderRadius: 8,
                                        marginBottom: 2,
                                        color: isActive ? 'var(--color-primary-bright)' : 'var(--text-secondary)',
                                        background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                    })}
                                >
                                    <span style={{ marginRight: 10, fontSize: '1rem', display: 'inline-flex' }}>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.name}</span>
                                    {item.badge && (
                                        <span style={{
                                            padding: '2px 8px',
                                            fontSize: '0.5625rem',
                                            fontWeight: 700,
                                            borderRadius: 999,
                                            background: 'var(--color-success-bg)',
                                            color: 'var(--color-success)',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            </React.Fragment>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '0.625rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                }}>
                    © 2026 Apex MotorWorks v3.0
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
