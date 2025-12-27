import React, { createContext, useContext, useEffect, useState } from "react";
import * as auth from "./auth";
import type { User } from "./auth";
import { AUTH_KEY } from "./constants";

type AuthContextType = {
  authenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<auth.AuthResponse>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<auth.AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(auth.isAuthenticated());
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        setAuthenticated(auth.isAuthenticated());
        setUser(auth.getCurrentUser());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);

    if (res.success && res.token) {
      auth.persistToken(res.token);
      setAuthenticated(true);
      setUser(auth.getCurrentUser());
    }

    return res;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await auth.signup(name, email, password);

    if (res.success && res.token) {
      auth.persistToken(res.token);
      setAuthenticated(true);
      setUser(auth.getCurrentUser());
    }

    return res;
  };

  const logout = () => {
    auth.logout();
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ authenticated, user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
