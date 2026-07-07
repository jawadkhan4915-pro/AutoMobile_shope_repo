import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Loader from './components/common/Loader';

// Lazy load route pages for maximum speed and code-splitting performance
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
const Products = lazy(() => import('./pages/Products'));
const Customers = lazy(() => import('./pages/Customers'));
const Orders = lazy(() => import('./pages/Orders'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const MechanicPortal = lazy(() => import('./pages/MechanicPortal'));
const CashierPortal = lazy(() => import('./pages/CashierPortal'));
const Attendance = lazy(() => import('./pages/Attendance'));
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));


const PageFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-[#0B0D17]">
        <Loader />
    </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <PageFallback />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <PageFallback />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export const router = createBrowserRouter([
    {
        element: (
            <Suspense fallback={<PageFallback />}>
                <AuthLayout />
            </Suspense>
        ),
        children: [
            {
                path: '/login',
                element: (
                    <PublicRoute>
                        <Suspense fallback={<PageFallback />}>
                            <Login />
                        </Suspense>
                    </PublicRoute>
                ),
            },
            {
                path: '/register',
                element: (
                    <PublicRoute>
                        <Suspense fallback={<PageFallback />}>
                            <Register />
                        </Suspense>
                    </PublicRoute>
                ),
            },
        ],
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<PageFallback />}>
                    <MainLayout />
                </Suspense>
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Dashboard />
                    </Suspense>
                ),
            },
            {
                path: 'pos',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <POS />
                    </Suspense>
                ),
            },
            {
                path: 'products',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Products />
                    </Suspense>
                ),
            },
            {
                path: 'customers',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Customers />
                    </Suspense>
                ),
            },
            {
                path: 'orders',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Orders />
                    </Suspense>
                ),
            },
            {
                path: 'reports',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Reports />
                    </Suspense>
                ),
            },
            {
                path: 'settings',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Settings />
                    </Suspense>
                ),
            },
            {
                path: 'attendance',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <Attendance />
                    </Suspense>
                ),
            },
            {
                path: 'mechanic',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <MechanicPortal />
                    </Suspense>
                ),
            },
            {
                path: 'cashier',
                element: (
                    <Suspense fallback={<PageFallback />}>
                        <CashierPortal />
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
