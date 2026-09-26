import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * Auth context provider. Manages user state globally,
 * removing prop drilling of user/setUser through the component tree.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/me');
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback: check localStorage if server session fails
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        } catch (e) { /* corrupted data */ }
      }
    }
    setUser(null);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth state and actions.
 * @returns {{ user: Object|null, setUser: Function, loading: boolean, checkAuth: Function, logout: Function }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
