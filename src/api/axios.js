import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy in vite.config.js will handle this, or set absolute URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            // Handle forbidden/unauthorized (maybe redirect to login logic can happen in context)
            console.error("Unauthorized access");
        }
        return Promise.reject(error);
    }
);

export default api;
