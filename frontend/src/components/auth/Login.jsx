import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 3-role system: Owner (admin), Cashier, Mechanic
const demoUsers = [
  {
    role: 'Owner',
    name: 'Shop Owner',
    email: 'owner@apex.com',
    pass: 'pass@123',
    icon: '🔑',
    description: 'Full access — settings, reports, all modules',
    color: '#818cf8',
  },
  {
    role: 'Cashier',
    name: 'Demo Cashier',
    email: 'cashier@apex.com',
    pass: 'pass@123',
    icon: '🛒',
    description: 'POS terminal, invoices & customer management',
    color: '#34d399',
  },
  {
    role: 'Mechanic',
    name: 'Lead Mechanic',
    email: 'mechanic@apex.com',
    pass: 'pass@123',
    icon: '🔧',
    description: 'Parts lookup, work orders & stock access',
    color: '#fbbf24',
  },
];

const Login = () => {
  const [email, setEmail] = useState('owner@apex.com');
  const [password, setPassword] = useState('pass@123');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
      if (result && result.success) navigate('/');
      else navigate('/');
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Real-time POS checkout & digital invoices',
    'Auto parts inventory & stock tracking',
    'Vehicle fitment & compatibility search',
    'Smart business intelligence & analytics'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f8fafc',
    }}>
      {/* ════════════ LEFT BRAND PANEL ════════════ */}
      <div className="login-left-panel" style={{
        width: '45%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #7c3aed 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        color: '#fff',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.5)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 220, height: 220,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.25)',
          filter: 'blur(60px)',
        }} />

        {/* Top content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '1.5rem',
            }}>
              🏎️
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '0.02em', margin: 0 }}>
                Apex MotorWorks
              </h1>
              <p style={{ fontSize: '0.6875rem', color: 'rgba(199, 210, 254, 0.9)', fontWeight: 600, margin: 0 }}>
                Automotive POS Portal
              </p>
            </div>
          </div>

          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-0.03em',
          }}>
            Automotive Shop &<br />Inventory POS System
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: 'rgba(199, 210, 254, 0.85)',
            lineHeight: 1.65,
            maxWidth: 340,
          }}>
            A unified digital platform for automotive shop owners, cashiers, and technicians.
          </p>
        </div>

        {/* Features */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-3" style={{
                animation: `slideInLeft 0.4s ease ${0.2 + i * 0.08}s both`,
              }}>
                <div style={{
                  width: 22, height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.625rem',
                }}>
                  ✦
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(224, 231, 255, 0.9)' }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(165, 180, 252, 0.6)', marginTop: 28 }}>
            © 2026 Apex MotorWorks POS
          </p>
        </div>
      </div>

      {/* ════════════ RIGHT FORM PANEL ════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="login-mobile-logo flex items-center gap-3" style={{ marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#6366f1', fontSize: '1.25rem',
            }}>
              🏎️
            </div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Apex MotorWorks</h1>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0 }}>Automotive POS Portal</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: 28, fontWeight: 500 }}>
            Sign in to access your POS terminal
          </p>

          {/* Error */}
          {localError && (
            <div style={{
              marginBottom: 20,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>⚠️</span> {localError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.875rem', color: focusedField === 'email' ? '#6366f1' : '#94a3b8',
                  transition: 'color 0.2s',
                }}>✉️</span>
                <input
                  type="email"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 10,
                    border: `1.5px solid ${focusedField === 'email' ? '#6366f1' : '#e2e8f0'}`,
                    background: '#fff',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.875rem', color: focusedField === 'password' ? '#6366f1' : '#94a3b8',
                  transition: 'color 0.2s',
                }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 42px',
                    borderRadius: 10,
                    border: `1.5px solid ${focusedField === 'password' ? '#6366f1' : '#e2e8f0'}`,
                    background: '#fff',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', color: '#94a3b8', padding: 4,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <span>→</span></>
              )}
            </button>
          </form>

          {/* Demo Section */}
          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid #e2e8f0',
          }}>
            <p style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
              marginBottom: 14,
            }}>
              Quick Demo — Click to Auto-Fill
            </p>

            {/* Role Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoUsers.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = d.color;
                    e.currentTarget.style.background = `${d.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <span style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: `${d.color}18`,
                    border: `1.5px solid ${d.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>{d.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{d.role}</p>
                      <span style={{
                        fontSize: '0.5625rem',
                        background: `${d.color}18`,
                        color: d.color,
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        border: `1px solid ${d.color}30`,
                      }}>
                        DEMO
                      </span>
                    </div>
                    <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                      {d.description}
                    </p>
                    <p style={{ fontSize: '0.625rem', color: '#94a3b8', margin: '2px 0 0' }}>
                      {d.email}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>→</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8', marginTop: 24 }}>
            New employee?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#6366f1', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .login-left-panel { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
