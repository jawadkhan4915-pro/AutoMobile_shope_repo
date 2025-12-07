import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-4 text-center animate-slide-in-down">
                <h3 className="text-xl" style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Welcome Back
                </h3>
                <p className="mt-2 text-muted">
                    Sign in to access your POS dashboard
                </p>
            </div>

            {error && (
                <div
                    className="animate-slide-in-down"
                    style={{
                        color: 'var(--color-danger)',
                        background: 'rgba(255, 0, 85, 0.1)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 0, 85, 0.3)',
                        fontWeight: '500'
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="animate-slide-in-up stagger-1">
                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="admin@admin.com"
                    />
                </div>

                <div className="animate-slide-in-up stagger-2">
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <div
                    className="flex items-center justify-between animate-slide-in-up stagger-3"
                    style={{ margin: '1rem 0 1.5rem 0' }}
                >
                    <div className="flex items-center">
                        <input
                            id="remember_me"
                            name="remember_me"
                            type="checkbox"
                            style={{
                                width: '16px',
                                height: '16px',
                                accentColor: 'var(--color-primary)',
                                cursor: 'pointer'
                            }}
                        />
                        <label htmlFor="remember_me" className="ml-2 block text-sm text-main" style={{ cursor: 'pointer' }}>
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <a href="#" className="text-primary hover:text-accent">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <div className="animate-slide-in-up stagger-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center"
                        disabled={loading}
                        style={{
                            padding: '14px 24px',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner-sm"></span>
                                Signing in...
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </div>

                <div className="mt-6 text-center animate-slide-in-up stagger-5">
                    <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-accent font-semibold">
                            Create one now
                        </Link>
                    </p>
                </div>

                <div
                    className="mt-6 text-center text-sm animate-slide-in-up stagger-5"
                    style={{
                        background: 'rgba(0, 240, 255, 0.05)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(0, 240, 255, 0.2)'
                    }}
                >
                    <p style={{ color: 'var(--color-primary)', fontWeight: '600', marginBottom: '8px' }}>
                        Demo Credentials
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Admin:</strong> admin@admin.com / pass@123
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        <strong>Cashier:</strong> cashier@cashier.com / pass@123
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;
