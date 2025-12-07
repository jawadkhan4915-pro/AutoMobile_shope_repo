import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0B0D17 0%, #1a1d2e 100%)'
            }}
        >
            <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden w-full relative">
                <Header toggleSidebar={toggleSidebar} />

                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6"
                    style={{
                        background: 'transparent'
                    }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
