// src/api/services/deviceService.ts
import { api } from "../client";

export type RegisterDeviceRequest = {
  userId: number;
  expoPushToken: string;
  platform: string;
};

const endpoint = "/api/devices";

export const registerDevice = async (payload: RegisterDeviceRequest) => {
  // POST /api/devices/register
  await api.post(`${endpoint}/register`, payload);
};
