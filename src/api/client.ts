// src/api/client.ts
import axios from "axios";
import { getValidToken } from "./authStorage";

const API_BASE_URL = "https://samloto.com:4016";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getValidToken(); // 👈 solo tokens NO expirados

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
