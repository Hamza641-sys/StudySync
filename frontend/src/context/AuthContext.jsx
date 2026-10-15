import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 'usr_roshan_demo',
  name: 'Roshan',
  email: 'roshan@studysync.edu',
  level: 1,
  xp: 45,
  xpMax: 150,
  streaks: {
    visitStreak: 2,
    quizStreak: 1,
    reviewStreak: 1
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('studysync_user');
      return stored ? JSON.parse(stored) : DEFAULT_DEMO_USER;
    } catch (e) {
      return DEFAULT_DEMO_USER;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('studysync_token') || 'demo_token';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('studysync_user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('studysync_user', JSON.stringify(res.user));
        localStorage.setItem('studysync_token', res.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('studysync_user', JSON.stringify(res.user));
        localStorage.setItem('studysync_token', res.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('studysync_user');
    localStorage.removeItem('studysync_token');
    setUser(null);
    setToken(null);
  };

  // Student Switcher to effortlessly verify per-user isolation (Module 2)
  const switchDemoStudent = (name, email, id) => {
    const newUser = {
      id,
      name,
      email,
      level: 1,
      xp: 20,
      xpMax: 150,
      streaks: { visitStreak: 1, quizStreak: 1, reviewStreak: 1 }
    };
    setUser(newUser);
    setToken(id);
    localStorage.setItem('studysync_user', JSON.stringify(newUser));
    localStorage.setItem('studysync_token', id);
  };

  const incrementStreak = async (streakType) => {
    try {
      const res = await api.updateStreak(streakType);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Streak update failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      switchDemoStudent,
      incrementStreak,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
