import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { Box, CircularProgress } from '@mui/material';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
            try {
              await authService.verifyToken();
            } catch (error) {
              console.error('Token verification failed:', error);
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (userData) => {
    console.log('Handling login with:', userData);
    try {
      if (userData.user) {
        setUser(userData.user);
        authService.setUser(userData.user);
        if (userData.token) {
          authService.setToken(userData.token);
        }
    } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Login handling error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    authService.logout();
  };

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      authService.setUser(updatedUser);
      return updatedUser;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 