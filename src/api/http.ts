// src/api/http.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";

// Cambia esto por tu URL real (ngrok, IP server, etc.)
export const API_BASE_URL = "http://192.168.0.10:8080";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para agregar el token si lo tienes
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;

  if (token) {
    // Aseguramos que exista headers (cast explícito para no pelear con AxiosHeaders)
    if (!config.headers) {
      config.headers = {} as any;
    }

    // No reemplazamos el objeto, solo seteamos la key
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});
