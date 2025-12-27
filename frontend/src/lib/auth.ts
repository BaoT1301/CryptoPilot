import { AUTH_KEY } from "./constants";

import { login as loginAPI, signup as signupAPI } from "../api/auth";

/* ------------------ types ------------------ */

export type AuthResponse = {
  success: boolean;
  token?: string;
  message?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

/* ------------------ helpers ------------------ */

function decodeJWT(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isExpired(payload: any): boolean {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/* ---------- session ---------- */

export function persistToken(token: string) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_KEY);
  if (!token) return false;
  const payload = decodeJWT(token);
  return payload ? !isExpired(payload) : false;
}

export function getCurrentUser(): User | null {
  const token = localStorage.getItem(AUTH_KEY);
  if (!token) return null;

  const p = decodeJWT(token);
  if (!p || isExpired(p)) return null;

  return {
    id: p.userId,
    email: p.userEmail,
    name: p.userName,
    role: p.role,
  };
}

/* ---------- actions ---------- */

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { token } = await loginAPI({ email, password });
    persistToken(token);
    return { success: true, token };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Login failed",
    };
  }
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { token } = await signupAPI({
      name,
      email,
      password,
      confirmPassword: password,
    });
    persistToken(token);
    return { success: true, token };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Signup failed",
    };
  }
}

export function logout() {
  clearToken();
}
