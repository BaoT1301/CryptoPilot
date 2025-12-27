import { loginAPI, signupAPI, logoutAPI } from "./api";
import { AUTH_KEY } from "./constants";


export type AuthResponse = { success: boolean; token?: string; message?: string };

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}

export function logout(): void {
  logoutAPI();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!email || !password) return { success: false, message: "Missing fields" };
  return loginAPI({ email, password });
}

export async function signupWithName(name: string, email: string, password: string): Promise<AuthResponse> {
  // NOTE: name isn't used by API request right now (your backend seems email/pass only)
  // Keep it here for UI but don't send unless BE supports it.
  if (!name || !email || !password) return { success: false, message: "Missing fields" };
  return signupAPI({ email, password, confirmPassword: password });
}
