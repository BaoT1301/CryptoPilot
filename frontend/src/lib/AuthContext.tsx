import React, { createContext, useContext, useEffect, useState } from 'react';
import * as auth from './auth';

type AuthContextType = {
  authenticated: boolean;
  login: (email: string, password: string) => Promise<auth.AuthResponse>;
  signup: (name: string, email: string, password: string) => Promise<auth.AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(auth.isAuthenticated());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === auth.AUTH_KEY) {
        setAuthenticated(!!localStorage.getItem(auth.AUTH_KEY));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    if (res.success) setAuthenticated(true);
    return res;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await auth.signup(name, email, password);
    if (res.success) setAuthenticated(true);
    return res;
  };

  const logout = () => {
    auth.logout();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
