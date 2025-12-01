/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth.js';
import { getMe as getMeApi } from '../api/users.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    try {
      const res = await getMeApi();
      setUser(res.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email, password) => {
    await loginApi(email, password);
    // refresh full user profile including followers/following
    const res = await getMeApi();
    setUser(res.user);
  };

  const signup = async (name, email, password) => {
    await signupApi(name, email, password);
    const res = await getMeApi();
    setUser(res.user);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);