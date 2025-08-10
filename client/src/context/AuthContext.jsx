import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(
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

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn('Authentication token expired or invalid. Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// Helper function to ensure followers/following are arrays
// This is the core fix to apply consistently
const ensureArrayProperties = (userData) => {
    if (!userData) return null; // Handle null/undefined user data
    return {
        ...userData,
        followers: Array.isArray(userData.followers) ? userData.followers : [],
        following: Array.isArray(userData.following) ? userData.following : []
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            return ensureArrayProperties(parsedUser); // <--- Use helper here
        } catch (error) {
            console.error("Failed to parse user from localStorage on init:", error);
            localStorage.removeItem('user');
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token') && !!localStorage.getItem('user'));
    const [loading, setLoading] = useState(true);

    const login = (userData, userToken) => {
        const cleanedUserData = ensureArrayProperties(userData); // <--- Use helper here
        localStorage.setItem('user', JSON.stringify(cleanedUserData));
        localStorage.setItem('token', userToken);

        setToken(userToken);
        setUser(cleanedUserData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateAuthUser = (newUserData, newToken = localStorage.getItem('token')) => {
        const cleanedNewUserData = ensureArrayProperties(newUserData); // <--- Use helper here
        localStorage.setItem('user', JSON.stringify(cleanedNewUserData));
        setUser(cleanedNewUserData);
        if (newToken) {
             localStorage.setItem('token', newToken);
             setToken(newToken);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserString = localStorage.getItem('user');

        if (storedToken && storedUserString) {
            try {
                const decodedToken = jwtDecode(storedToken);

                if (decodedToken.exp * 1000 < Date.now()) {
                    console.log('Token expired. Logging out...');
                    logout();
                } else {
                    const parsedUser = JSON.parse(storedUserString);
                    setUser(ensureArrayProperties(parsedUser)); // <--- Use helper here
                    setToken(storedToken);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error during token or user data re-hydration:', error);
                logout();
            }
        } else {
            logout();
        }
        setLoading(false);
    }, []);

    const authContextValue = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateAuthUser,
        API
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em' }}>Loading application...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};