import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);
  
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };
  
  const register = async (userData) => {
    const data = await authService.registerCustomer(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const isAdmin = user?.role === 'Admin';
  const isTechnician = user?.role === 'Technician';
  const isCustomer = user?.role === 'Customer';
  
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isTechnician,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};