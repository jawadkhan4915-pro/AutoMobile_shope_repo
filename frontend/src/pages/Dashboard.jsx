import React from 'react';
import { useAuth } from '../hooks/useAuth';
import OwnerDashboard from './OwnerDashboard';
import CashierPortal from './CashierPortal';
import MechanicPortal from './MechanicPortal';

/**
 * Dashboard — Role-based portal router
 * Owner    → OwnerDashboard  (full analytics, Excel export)
 * Cashier  → CashierPortal   (POS, QR scanner, sales log)
 * Mechanic → MechanicPortal  (parts search, bill builder, QR generation)
 */
const Dashboard = () => {
    const { isCashier, isMechanic } = useAuth();

    if (isCashier) return <CashierPortal />;
    if (isMechanic) return <MechanicPortal />;
    return <OwnerDashboard />; // owner + fallback
};

export default Dashboard;
