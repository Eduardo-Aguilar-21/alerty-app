// src/stores/authStore.ts
import { create } from "zustand";

type AuthState = {
  token: string | null;
  currentGroupId: number | null; // por si luego quieres filtrar por grupo
  setAuth: (token: string, currentGroupId?: number | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  currentGroupId: null,
  setAuth: (token, currentGroupId = null) =>
    set({ token, currentGroupId }),
  clearAuth: () => set({ token: null, currentGroupId: null }),
}));
