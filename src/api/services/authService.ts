import { api } from "../client";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginByDniRequest = {
  dni: string;
};

// Misma forma que en web
export type AuthResponse = {
  token: string;
  message?: string;
  username?: string;
  dni?: string;
  role?: string;
  companyId?: number | null;
  userId?: number | null;
};

// POST /login  (mismo backend que web)
export const loginWithUsername = async (payload: LoginRequest) => {
  const response = await api.post<AuthResponse>("/login", payload);
  return response.data;
};

// POST /auth/login-dni
export const loginWithDni = async (payload: LoginByDniRequest) => {
  const response = await api.post<AuthResponse>("/auth/login-dni", payload);
  return response.data;
};
