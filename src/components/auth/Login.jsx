import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [requiresOtp, setRequiresOtp] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login, verifyOtp, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && !authLoading) {
            if (user.role === 'ADMIN') navigate('/admin');
            else if (user.role === 'REPORTING_MANAGER') navigate('/team');
            else navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Login: Submitting form. requiresOtp:', requiresOtp, 'username:', username);

        try {
            if (!requiresOtp) {
                const result = await login(username, password);
                console.log('Login: Step 1 result:', result);
                if (result.success && result.requiresOtp) {
                    setRequiresOtp(true);
                    setInfoMessage(result.message);
                } else if (result.success) {
                    navigate('/tasks');
                } else {
                    setError(result.message);
                }
            } else {
                console.log('Login: Attempting OTP verify for', username, 'with OTP', otp);
                const result = await verifyOtp(username, otp);
                console.log('Login: Step 2 result:', result);
                if (result.success) {
                    navigate('/tasks');
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            console.error('Login submit error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <div className="text-center mb-6">
                    <div className="surface-100 w-4rem h-4rem border-circle inline-flex align-items-center justify-content-center mb-3">
                        <i className="pi pi-shield text-primary text-3xl"></i>
                    </div>
                    <h1 className="text-900 text-3xl font-bold mb-2">Welcome Back</h1>
                    <span className="text-600 font-medium">Log in to your account</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    {!requiresOtp ? (
                        <>
                            <div className="flex flex-column gap-2">
                                <label htmlFor="username" className="font-semibold text-800 ml-1">Username</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-user z-2"></i>
                                    <InputText
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full py-3"
                                        required
                                    />
                                </span>
                            </div>
                            <div className="flex flex-column gap-2">
                                <label htmlFor="password" title="Password" className="font-semibold text-800 ml-1">Password</label>
                                <span className="w-full">
                                    <Password
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        feedback={false}
                                        toggleMask
                                        className="w-full"
                                        inputClassName="w-full py-3"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </span>
                                <div className="text-right">
                                    <Button label="Forgot Password?" link onClick={() => navigate('/forgot-password')} className="p-0 text-sm font-semibold text-primary" type="button" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {infoMessage && <Message severity="info" text={infoMessage} className="w-full mb-3" />}
                            <div className="flex flex-column gap-3">
                                <label htmlFor="otp" className="font-semibold text-800 text-center">Verification Code</label>
                                <InputText
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000 000"
                                    className="w-full text-center text-3xl font-bold tracking-widest py-3 border-2"
                                    maxLength={6}
                                    required
                                />
                                <small className="text-center text-600 font-medium">Check your registered email for the 6-digit OTP.</small>
                            </div>
                        </>
                    )}

                    {error && <Message severity="error" message={error} className="w-full" content={(
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-exclamation-circle"></i>
                            <span className="font-medium">{error}</span>
                        </div>
                    )} />}

                    <div className="mt-2">
                        <Button
                            label={requiresOtp ? "Verify & Login" : "Sign In"}
                            icon={requiresOtp ? "pi pi-check-circle" : "pi pi-sign-in"}
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full py-3 text-lg font-bold border-round-xl shadow-4"
                        />
                    </div>

                    <div className="text-center mt-3">
                        <span className="text-600 font-semibold">New here? </span>
                        <Button label="Create an account" link onClick={() => navigate('/register')} className="p-0 font-bold text-primary" />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
