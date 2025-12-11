export type AuthResponse = { success: boolean; token?: string; message?: string };

export const AUTH_KEY = 'mock_auth_token';

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

function fakeNetwork<T>(result: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!email || !password) return fakeNetwork({ success: false, message: 'Missing fields' });
  const token = btoa(`${email}:${Date.now()}`);
  localStorage.setItem(AUTH_KEY, token);
  return fakeNetwork({ success: true, token });
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  if (!name || !email || !password) return fakeNetwork({ success: false, message: 'Missing fields' });
  const token = btoa(`${email}:${Date.now()}`);
  localStorage.setItem(AUTH_KEY, token);
  return fakeNetwork({ success: true, token });
}
