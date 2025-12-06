import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="page-header flex justify-between items-center" style={{ marginBottom: 0 }}>
            <div className="flex items-center gap-2">
                <button className="btn btn-outline" onClick={toggleSidebar}>
                    ☰
                </button>
                <span className="font-bold text-lg hidden sm:block">Easy POS</span>
            </div>

            <div className="flex items-center gap-3 relative">
                <Link to="/pos" className="btn btn-primary">
                    POS Terminal
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="hidden sm:block font-medium">{user?.name}</span>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-dropdown">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <Link
                                to="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
