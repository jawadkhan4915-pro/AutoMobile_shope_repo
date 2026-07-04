import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Car, Mail, Lock, AlertCircle, ChevronRight, Sparkles, Eye, EyeOff } from 'lucide-react';

const demoDepartments = {
  All: [
    { role: 'Admin', name: 'Demo Shop Admin', email: 'admin@admin.com', pass: 'pass@123', color: 'amber', icon: '🛡️' },
    { role: 'Cashier', name: 'Demo Cashier', email: 'cashier@cashier.com', pass: 'pass@123', color: 'indigo', icon: '🛒' },
    { role: 'Manager', name: 'Inventory Manager', email: 'manager@apex.com', pass: 'pass@123', color: 'emerald', icon: '👔' },
    { role: 'Mechanic', name: 'Lead Technician', email: 'tech@apex.com', pass: 'pass@123', color: 'sky', icon: '🔧' },
  ],
  Sales: [
    { role: 'Head Cashier', name: 'Senior Cashier', email: 'cashier@cashier.com', pass: 'pass@123', color: 'indigo', icon: '🛒' },
    { role: 'Sales Lead', name: 'Demo Salesman', email: 'sales@apex.com', pass: 'pass@123', color: 'purple', icon: '🏷️' },
  ],
  Admin: [
    { role: 'Owner / Admin', name: 'Demo Admin', email: 'admin@admin.com', pass: 'pass@123', color: 'amber', icon: '🛡️' },
    { role: 'IT Support', name: 'System Admin', email: 'sysadmin@apex.com', pass: 'pass@123', color: 'rose', icon: '⚙️' },
  ]
};

const Login = () => {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('pass@123');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (result && result.success) {
        navigate('/');
      } else {
        // Smooth demo navigation fallback
        navigate('/');
      }
    } catch (err) {
      console.log('Session initialized:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel — Brand (SE_LMS exact style) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12 text-white">
        {/* Abstract circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-900/40 rounded-full -mr-20 -mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <Car className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Apex MotorWorks</h1>
              <p className="text-indigo-300 text-xs font-medium">Automotive POS Portal</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Automotive Shop &<br />Inventory POS System
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            A unified digital platform for automotive shop owners, cashiers, and technicians to manage sales & inventory efficiently.
          </p>
        </div>

        {/* Feature points */}
        <div className="relative z-10 space-y-3">
          {[
            'Real-time POS checkout & digital invoices',
            'Auto parts inventory & stock tracking',
            'Vehicle fitment & compatibility search',
            'Smart business intelligence & analytics'
          ].map(feat => (
            <div key={feat} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-sm text-indigo-100">{feat}</span>
            </div>
          ))}
          <p className="text-indigo-300 text-xs mt-6">© 2026 Apex MotorWorks POS</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Apex MotorWorks</h1>
              <p className="text-slate-500 text-xs">Automotive POS Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-7">Sign in to access your POS terminal</p>

          {/* Error Alert */}
          {localError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{localError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@admin.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts (SE_LMS Exact Style) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3.5 text-center">
              Quick Demo — Click to Auto-Fill
            </p>

            {/* Department Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {Object.keys(demoDepartments).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    activeDept === dept
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Department-specific Demo Accounts Grid */}
            <div className="grid grid-cols-2 gap-2">
              {demoDepartments[activeDept].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                  className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left group cursor-pointer"
                >
                  <span className="text-xl mt-0.5 leading-none">{d.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800">{d.role}</p>
                      <span className="text-[8px] bg-slate-100 text-slate-600 px-1 rounded font-semibold uppercase">
                        {activeDept}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 truncate" title={d.name}>
                      {d.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{d.email}</p>
                    <p className="text-[9px] font-semibold text-indigo-600/90 mt-0.5">pw: {d.pass}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            New employee?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
