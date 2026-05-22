import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('habitai_token') || null);
  const [loading, setLoading] = useState(true);

  // Behavior tracking helper (IoB telemetry)
  const logBehavior = async (eventType, elementId, value = '') => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${API_URL}/analytics/log`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ eventType, elementId, value }),
      });
    } catch (error) {
      console.warn('Telemetry logging failed:', error);
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to load user state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('habitai_token', newToken);
    setToken(newToken);
    setUser(userData);
    logBehavior('click', 'login_button', 'success');
  };

  const logout = () => {
    logBehavior('click', 'logout_button', 'success');
    localStorage.removeItem('habitai_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, logBehavior }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
