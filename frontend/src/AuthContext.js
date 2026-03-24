import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_URL from './config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { username, token }
  const [loading, setLoading] = useState(true); // initial check

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('zl_token');
    const username = localStorage.getItem('zl_username');
    if (token && username) {
      setUser({ token, username });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('zl_token', data.token);
    localStorage.setItem('zl_username', data.username);
    setUser({ token: data.token, username: data.username });
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('zl_token', data.token);
    localStorage.setItem('zl_username', data.username);
    setUser({ token: data.token, username: data.username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('zl_token');
    localStorage.removeItem('zl_username');
    setUser(null);
  }, []);

  // Helper to make authenticated fetch calls
  const authFetch = useCallback((url, options = {}) => {
    const token = localStorage.getItem('zl_token');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
