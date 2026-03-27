import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/users/profile/');
                    setUser(response.data);
                } catch (error) {
                    console.error('Session expired', error);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        // Send both 'username' and 'email' keys for maximum compatibility with 
        // TokenObtainPairSerializer (which defaults to username_field) 
        // and CustomTokenObtainPairSerializer (which we just updated to accept 'email').
        const res = await api.post('/users/login/', { 
            username: email, 
            email: email, 
            password: password 
        });
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        const userRes = await api.get('/users/profile/');
        setUser(userRes.data);
        return userRes.data;
    };

    const register = async (userData) => {
        await api.post('/users/register/', userData);
        await login(userData.email, userData.password);
    };

    const logout = () => {
        // Clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        window.location.href = '/login'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
