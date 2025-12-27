import { AUTH_KEY } from "./constants";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem(AUTH_KEY);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
  });

  // If server returns non-2xx, try to extract message
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function loginAPI(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const data = await apiCall<{ token: string; message?: string }>(
      "/auth/login",
      "POST",
      credentials
    );

    if (data.token) localStorage.setItem(AUTH_KEY, data.token);

    return { success: true, token: data.token, message: data.message };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Login failed" };
  }
}

export async function signupAPI(userData: SignupRequest): Promise<AuthResponse> {
  try {
    const data = await apiCall<{ token: string; message?: string }>(
      "/auth/register",
      "POST",
      userData
    );

    if (data.token) localStorage.setItem(AUTH_KEY, data.token);

    return { success: true, token: data.token, message: data.message };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Signup failed" };
  }
}

export function logoutAPI(): void {
  localStorage.removeItem(AUTH_KEY);
}

export async function getCurrentUserAPI() {
  try {
    return await apiCall("/profile", "GET");
  } catch {
    return null;
  }
}
