// src/api/hooks/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import {
    loginWithDni,
    loginWithUsername,
    type AuthResponse,
    type LoginByDniRequest,
    type LoginRequest,
} from "../services/authService";

export const useLoginWithUsername = () => {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (payload) => loginWithUsername(payload),
  });
};

export const useLoginWithDni = () => {
  return useMutation<AuthResponse, Error, LoginByDniRequest>({
    mutationFn: (payload) => loginWithDni(payload),
  });
};
