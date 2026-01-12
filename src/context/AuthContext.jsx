import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on load
        console.log('AuthContext: Initializing...');
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);

        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Decoded token:', decoded);
                setUser({
                    username: decoded.sub,
                    role: decoded.role || decoded.authorities?.[0] || 'USER'
                });
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
        console.log('AuthContext: Loading complete');
    }, []);

    const login = async (username, password) => {
        try {
            console.log('AuthContext: Initiating login for', username);
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
            console.log('AuthContext: Login response:', response.status, response.data);

            // If the response is an object with a token, it's a direct login
            if (response.data && typeof response.data === 'object' && response.data.token) {
                const { token } = response.data;
                localStorage.setItem('token', token);
                const decoded = jwtDecode(token);
                setUser({
                    username: decoded.sub,
                    role: decoded.role || decoded.authorities?.[0] || 'USER'
                });
                return { success: true, requiresOtp: false };
            }

            // Otherwise, assume it's the OTP success message
            return { success: true, message: typeof response.data === 'string' ? response.data : "OTP sent to your email", requiresOtp: true };
        } catch (error) {
            console.error("Login failed", error);
            const msg = error.response?.data?.message || error.response?.data || "Login failed";
            return { success: false, message: typeof msg === 'string' ? msg : "Invalid credentials" };
        }
    };

    const verifyOtp = async (username, otp) => {
        try {
            console.log('AuthContext: Verifying OTP for', username, 'OTP:', otp);
            const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { username, otp });
            console.log('AuthContext: OTP verification response:', response.status, response.data);

            const { token } = response.data;
            localStorage.setItem('token', token);

            const decoded = jwtDecode(token);
            setUser({
                username: decoded.sub,
                role: decoded.role || decoded.authorities?.[0] || 'USER'
            });
            return { success: true };
        } catch (error) {
            console.error("OTP Verification failed", error);
            const msg = error.response?.data?.message || "Invalid OTP";
            return { success: false, message: typeof msg === 'string' ? msg : "Invalid OTP" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isManager = () => user?.role === 'REPORTING_MANAGER' || user?.role === 'ADMIN';
    const isAdmin = () => user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, hasRole, isManager, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
