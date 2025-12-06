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
        <>
            <>
                <div className="mb-4 text-center">
                    <h3 className="text-xl">Sign in to your account</h3>
                    <p className="mt-2 text-muted">
                        Or{' '}
                        <Link to="/register" className="text-primary hover:text-accent">
                            create a new account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 0, 85, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="admin@admin.com"
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between" style={{ margin: '1rem 0 1.5rem 0' }}>
                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                name="remember_me"
                                type="checkbox"
                                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-main">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="text-primary hover:text-accent">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <div className="mt-4 text-center text-sm text-muted">
                        <p>Demo Credentials:</p>
                        <p>Admin: admin@admin.com / pass@123</p>
                        <p>Cashier: cashier@cashier.com / pass@123</p>
                    </div>
                </form>
            </>
        </>
    );
};

export default Login;
