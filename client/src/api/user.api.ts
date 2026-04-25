import axios from 'axios';

const userApi = axios.create({
    baseURL: import.meta.env.VITE_USER_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

userApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default userApi;