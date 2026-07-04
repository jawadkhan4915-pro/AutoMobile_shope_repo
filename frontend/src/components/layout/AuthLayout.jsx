import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#090b13] text-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">Loading Apex Terminal...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full flex bg-[#090b13] text-white overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
            {/* Left Side: Hero Branding Showcase (Visible on lg screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/60">
                {/* Background Pattern Grid & Glow Orbs */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Brand Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                            APEX MOTORWORKS
                        </h2>
                        <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                            Enterprise Edition v2.5
                        </span>
                    </div>
                </div>

                {/* Hero Center Text & Feature Highlights */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        High-Performance Automotive POS Platform
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Precision Control for <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                            Modern Automotive Shops
                        </span>
                    </h1>

                    <p className="text-slate-400 text-sm leading-relaxed">
                        Streamline point of sale transactions, monitor live spare part inventory, track vehicle fitment compatibilities, and generate digital invoices seamlessly.
                    </p>

                    {/* Quick Stat Pill Chips */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <p className="text-lg font-bold text-white">99.9%</p>
                            <p className="text-[11px] text-slate-400">System Uptime</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <p className="text-lg font-bold text-cyan-400">&lt;50ms</p>
                            <p className="text-[11px] text-slate-400">Barcode Sync</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <p className="text-lg font-bold text-emerald-400">ISO 27001</p>
                            <p className="text-[11px] text-slate-400">Data Security</p>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
                    <p>© 2026 Apex MotorWorks Inc.</p>
                    <p>Protected by 256-Bit SSL Encryption</p>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#090b13]">
                {/* Ambient Subtle Background Blur */}
                <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md space-y-6 relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
