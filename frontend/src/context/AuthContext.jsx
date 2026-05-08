import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      // Clear legacy persistent auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No token');
        
        // Verify with backend unconditionally
        const res = await api.get('/auth/profile');
        setUser(res.data.data);
        sessionStorage.setItem('user', JSON.stringify(res.data.data));
      } catch (err) {
        setUser(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      sessionStorage.setItem('token', res.data.token);
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password, role, adminEmail) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role, adminEmail });
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      // Log silently in production, or use a proper logging service
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      toast.success('Logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, searchQuery, setSearchQuery }}>
      {children}
    </AuthContext.Provider>
  );
};
