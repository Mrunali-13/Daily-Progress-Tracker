import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [managerId, setManagerId] = useState(null);
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.AUTH.MANAGERS);
                setManagers(response.data.map(m => ({ label: m.username, value: m.id })));
            } catch (err) {
                console.error("Failed to fetch managers", err);
            }
        };
        fetchManagers();
    }, []);

    const roles = [
        { label: 'User', value: 'USER' },
        { label: 'Reporting Manager', value: 'REPORTING_MANAGER' },
        { label: 'Admin', value: 'ADMIN' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(API_ENDPOINTS.AUTH.REGISTER, {
                username,
                email,
                password,
                role,
                managerId: role === 'USER' ? managerId : null
            });
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <div className="text-center mb-5">
                    <div className="surface-100 w-4rem h-4rem border-circle inline-flex align-items-center justify-content-center mb-3">
                        <i className="pi pi-user-plus text-primary text-3xl"></i>
                    </div>
                    <h1 className="text-900 text-3xl font-bold mb-2">Create Account</h1>
                    <span className="text-600 font-medium">Join our enterprise todo tracker</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="username" className="font-semibold text-700">Username</label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-user"></i>
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                className="w-full"
                                required
                            />
                        </span>
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="email" className="font-semibold text-700">Email Address</label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-envelope"></i>
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. john@example.com"
                                className="w-full"
                                required
                            />
                        </span>
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="password" title="Password" className="font-semibold text-700">Password</label>
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            toggleMask
                            className="w-full"
                            inputClassName="w-full"
                            placeholder="Create a strong password"
                            feedback={false}
                            required
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="role" className="font-semibold text-700">Your Role</label>
                        <Dropdown
                            id="role"
                            value={role}
                            options={roles}
                            onChange={(e) => {
                                setRole(e.value);
                                if (e.value !== 'USER') setManagerId(null);
                            }}
                            placeholder="Select a Role"
                            className="w-full"
                        />
                    </div>

                    {role === 'USER' && (
                        <div className="flex flex-column gap-2">
                            <label htmlFor="manager" className="font-semibold text-700">Reporting Manager</label>
                            <Dropdown
                                id="manager"
                                value={managerId}
                                options={managers}
                                onChange={(e) => setManagerId(e.value)}
                                placeholder="Select your Manager"
                                className="w-full"
                                required
                            />
                        </div>
                    )}

                    {error && <Message severity="error" text={error} className="w-full" />}

                    <div className="mt-3">
                        <Button
                            label="Register Now"
                            icon="pi pi-check-circle"
                            type="submit"
                            className="w-full py-3 text-lg font-bold border-round-xl shadow-4"
                        />
                    </div>

                    <div className="text-center mt-3">
                        <span className="text-600 font-medium">Already have an account? </span>
                        <Button label="Back to Login" link onClick={() => navigate('/login')} className="p-0 font-bold" />
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Register;
