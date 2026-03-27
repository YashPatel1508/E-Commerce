import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

// Simple Cookie Helpers
const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const eraseCookie = (name) => {
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = getCookie('access_token');
            if (token) {
                try {
                    const response = await api.get('/users/profile/');
                    setUser(response.data);
                } catch (error) {
                    console.error('Session expired', error);
                    eraseCookie('access_token');
                    eraseCookie('refresh_token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/users/login/', { 
            username: email, 
            email: email, 
            password: password 
        });
        
        // Store in cookies
        setCookie('access_token', res.data.access, 1); // 1 day for the cookie itself
        setCookie('refresh_token', res.data.refresh, 7);
        
        const userRes = await api.get('/users/profile/');
        setUser(userRes.data);
        return userRes.data;
    };

    const register = async (userData) => {
        await api.post('/users/register/', userData);
        await login(userData.email, userData.password);
    };

    const logout = () => {
        eraseCookie('access_token');
        eraseCookie('refresh_token');
        setUser(null);
        window.location.href = '/login'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
