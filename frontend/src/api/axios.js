import axios from 'axios';

const baseURL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
