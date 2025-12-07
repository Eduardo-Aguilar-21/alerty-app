// src/api/hooks/useDevices.ts
import { useMutation } from "@tanstack/react-query";
import type { RegisterDeviceRequest } from "../services/deviceService";
import * as deviceService from "../services/deviceService";

export const useRegisterDevice = () => {
  return useMutation<void, Error, RegisterDeviceRequest>({
    mutationFn: (payload) => deviceService.registerDevice(payload),
  });
};
