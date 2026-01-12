export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_OTP: '/auth/verify-otp',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        MANAGERS: '/auth/managers',
    },
    TASKS: {
        BASE: '/tasks',
        BY_ID: (id) => `/tasks/${id}`,
        PROGRESS: (taskId) => `/tasks/${taskId}/progress`,
    },
    TEAM: {
        USERS: '/team/users',
        USER_TASKS: (userId) => `/team/users/${userId}/tasks`,
        APPROVE_TASK: (taskId) => `/team/tasks/${taskId}/approve`,
    },
    ADMIN: {
        USERS: '/admin/users',
        USER_BY_ID: (id) => `/admin/users/${id}`,
    },
    FILES: {
        UPLOAD: '/files/upload',
        DOWNLOAD: (filename) => `/files/download/${filename}`,
    }
};
