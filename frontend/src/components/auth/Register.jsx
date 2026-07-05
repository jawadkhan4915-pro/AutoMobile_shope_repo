import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ROLES = [
    { value: 'owner', label: '🔑 Owner', desc: 'Full access to all features' },
    { value: 'cashier', label: '🛒 Cashier', desc: 'POS, orders & customers' },
    { value: 'mechanic', label: '🔧 Mechanic', desc: 'Parts lookup & work orders' },
];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'cashier',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            const result = await register(registerData);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 8,
        border: '1.5px solid #e2e8f0',
        background: '#fff',
        fontSize: '0.875rem',
        color: '#0f172a',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        marginBottom: 14,
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#475569',
        marginBottom: 6,
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: 20,
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#6366f1', fontSize: '1.25rem',
                    }}>🏎️</div>
                    <div>
                        <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Apex MotorWorks</h1>
                        <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0 }}>New Staff Registration</p>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
                    Create Account
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: 24, fontWeight: 500 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ fontWeight: 700, color: '#6366f1', textDecoration: 'none' }}>Sign in</Link>
                </p>

                {error && (
                    <div style={{
                        marginBottom: 16,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(248, 113, 113, 0.08)',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        color: '#ef4444',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. James Torres"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />

                    <label style={labelStyle}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="james@apex.com"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />

                    {/* Role selection */}
                    <label style={labelStyle}>Role</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        {ROLES.map(r => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                                style={{
                                    flex: 1,
                                    padding: '8px 6px',
                                    borderRadius: 8,
                                    border: `1.5px solid ${formData.role === r.value ? '#6366f1' : '#e2e8f0'}`,
                                    background: formData.role === r.value ? 'rgba(99,102,241,0.06)' : '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    color: formData.role === r.value ? '#4f46e5' : '#64748b',
                                    lineHeight: 1.4,
                                }}
                            >
                                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{r.label.split(' ')[0]}</div>
                                <div>{r.label.split(' ').slice(1).join(' ')}</div>
                                <div style={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Minimum 6 characters"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />

                    <label style={labelStyle}>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Re-enter your password"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />

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
                            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                            transition: 'all 0.2s',
                            marginTop: 4,
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Account →'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
