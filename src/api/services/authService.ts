// src/api/services/authService.ts
import { api } from "../client";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginByDniRequest = {
  dni: string;
};

// Idealmente haz que AMBOS endpoints devuelvan este shape en backend
export type AuthResponse = {
  token: string;
  message?: string;
  username?: string;
  dni?: string;
  role: string;
};

// POST /login  (manejado por JwtAuthenticationFilter)
export const loginWithUsername = async (payload: LoginRequest) => {
  const response = await api.post<AuthResponse>("/login", payload);
  return response.data;
};

// POST /auth/login-dni (AuthController)
export const loginWithDni = async (payload: LoginByDniRequest) => {
  const response = await api.post<AuthResponse>("/auth/login-dni", payload);
  return response.data;
};
