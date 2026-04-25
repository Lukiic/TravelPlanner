import axios from 'axios';

const travelApi = axios.create({
    baseURL: import.meta.env.VITE_TRAVEL_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

travelApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

travelApi.interceptors.response.use(
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

export default travelApi;