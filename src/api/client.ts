// src/api/client.ts
import axios from "axios";

const API_BASE_URL = "https://samloto.com:4016"; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});