import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verifikasi token dengan endpoint /me
      api.get('/me')
        .then((response) => {
          setUser(response.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { access_token, user: userData } = response.data.data;
    localStorage.setItem('token', access_token.token);
    setUser(userData);
    return response.data;
  };

  const register = async (name, slug, email, password) => {
    const response = await api.post('/register', { name, slug, email, password });
    const { access_token, user: userData } = response.data.data;
    localStorage.setItem('token', access_token.token);
    setUser(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
