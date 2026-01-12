import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            setStep(2);
            setInfo('OTP has been sent to your email.');
        } catch (error) {
            setError(error.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, password: newPassword });
            setInfo('Password reset successfully. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Reset failed");
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <div className="text-center mb-6">
                    <div className="surface-100 w-4rem h-4rem border-circle inline-flex align-items-center justify-content-center mb-3">
                        <i className="pi pi-key text-primary text-3xl"></i>
                    </div>
                    <h1 className="text-900 text-3xl font-bold mb-2">Reset Password</h1>
                    <span className="text-600 font-medium">Recover your account access</span>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="flex flex-column gap-4">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="email" className="font-semibold text-700">Registered Email</label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-envelope"></i>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="w-full"
                                    required
                                />
                            </span>
                        </div>
                        {error && <Message severity="error" text={error} className="w-full" />}
                        <Button label="Send Reset OTP" icon="pi pi-send" type="submit" className="w-full py-3 font-bold shadow-2 mt-2" />
                        <Button label="Back to Login" link onClick={() => navigate('/login')} className="w-full font-bold" type="button" />
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="flex flex-column gap-4">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="otp" className="font-semibold text-700 text-center">Verification Code</label>
                            <InputText
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                className="w-full text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="password" title="New Password" className="font-semibold text-700">New Password</label>
                            <Password
                                id="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                toggleMask
                                feedback={false}
                                className="w-full"
                                inputClassName="w-full"
                                placeholder="Enter new strong password"
                                required
                            />
                        </div>
                        {error && <Message severity="error" text={error} className="w-full" />}
                        {info && <Message severity="info" text={info} className="w-full" />}
                        <div className="mt-4">
                            <Button label="Reset Password" icon="pi pi-check-circle" type="submit" className="w-full py-3 font-bold border-round-xl shadow-4" />
                        </div>
                        <Button label="Cancel" link onClick={() => navigate('/login')} className="w-full font-bold text-600 mt-2" type="button" />
                    </form>
                )}
            </Card>
        </div>
    );
};

export default ForgotPassword;
