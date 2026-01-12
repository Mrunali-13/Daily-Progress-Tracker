import api from '../api/axios';

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const generateOtp = async (username) => {
    const response = await api.post('/auth/otp/generate', { username });
    return response.data;
};

export const loginWithOtp = async (username, otp) => {
    const response = await api.post('/auth/otp/login', { username, password: otp });
    return response.data;
};

export const register = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
