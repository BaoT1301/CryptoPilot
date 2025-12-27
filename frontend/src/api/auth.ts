import { apiCall } from "./http";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function login(data: LoginRequest) {
  return apiCall<{ token: string }>("/auth/login", "POST", data);
}

export async function signup(data: SignupRequest) {
  return apiCall<{ token: string }>("/auth/register", "POST", data);
}
export async function logout() {
  return apiCall("/auth/logout", "POST");
}
