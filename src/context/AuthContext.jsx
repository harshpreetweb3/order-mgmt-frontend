import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('orderflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('orderflow_token');
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
          localStorage.setItem('orderflow_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to verify token:', err.message);
          localStorage.removeItem('orderflow_token');
          localStorage.removeItem('orderflow_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('orderflow_token', data.token);
    const userInfo = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      distributorId: data.distributorId,
      superStockistId: data.superStockistId,
    };
    localStorage.setItem('orderflow_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('orderflow_token');
    localStorage.removeItem('orderflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
