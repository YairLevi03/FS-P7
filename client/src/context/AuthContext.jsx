import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode token to check expiration
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // Fetch fresh user profile
            const response = await api.get('/auth/me');
            setUser(response.data);
          }
        } catch (error) {
          console.error("Auth init failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth errors from axios interceptor
    window.addEventListener('auth-error', logout);
    return () => window.removeEventListener('auth-error', logout);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    // After register, login automatically or redirect to login. We'll redirect to login in the component.
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
