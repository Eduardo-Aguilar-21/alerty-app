// src/api/authStorage.ts
import * as base64 from "base-64";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "alerty_token";
const USERNAME_KEY = "alerty_username";
const DNI_KEY = "alerty_dni";
const ROLE_KEY = "alerty_role";
const COMPANY_ID_KEY = "alerty_company_id";
const USER_ID_KEY = "alerty_user_id";

export type MobileAuthData = {
  token: string;
  username?: string;
  dni?: string;
  role?: string;
  companyId?: number;
  userId?: number;
};

export async function saveAuthData(params: {
  token: string;
  username?: string;
  dni?: string;
  role?: string;
  companyId?: number | string | null;
  userId?: number | string | null;
}) {
  const { token, username, dni, role, companyId, userId } = params;

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  if (username !== undefined) {
    await SecureStore.setItemAsync(USERNAME_KEY, username);
  }
  if (dni !== undefined) {
    await SecureStore.setItemAsync(DNI_KEY, dni);
  }
  if (role !== undefined) {
    await SecureStore.setItemAsync(ROLE_KEY, role);
  }
  if (companyId !== undefined && companyId !== null) {
    await SecureStore.setItemAsync(COMPANY_ID_KEY, String(companyId));
  }
  if (userId !== undefined && userId !== null) {
    await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
  }
}

// ===== Helpers simples (como en web) =====

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn("Error leyendo token de SecureStore", e);
    return null;
  }
}

export async function getUsername(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USERNAME_KEY);
  } catch (e) {
    console.warn("Error leyendo username de SecureStore", e);
    return null;
  }
}

export async function getCompanyId(): Promise<number | null> {
  try {
    const raw = await SecureStore.getItemAsync(COMPANY_ID_KEY);
    return raw !== null ? Number(raw) : null;
  } catch (e) {
    console.warn("Error leyendo companyId de SecureStore", e);
    return null;
  }
}

export async function getAuthData(): Promise<MobileAuthData | null> {
  const token = await getToken();
  if (!token) return null;

  const username = (await SecureStore.getItemAsync(USERNAME_KEY)) ?? undefined;
  const dni = (await SecureStore.getItemAsync(DNI_KEY)) ?? undefined;
  const role = (await SecureStore.getItemAsync(ROLE_KEY)) ?? undefined;

  const companyIdRaw = await SecureStore.getItemAsync(COMPANY_ID_KEY);
  const companyId =
    companyIdRaw !== null && companyIdRaw !== ""
      ? Number(companyIdRaw)
      : undefined;

  const userIdRaw = await SecureStore.getItemAsync(USER_ID_KEY);
  const userId =
    userIdRaw !== null && userIdRaw !== "" ? Number(userIdRaw) : undefined;

  return { token, username, dni, role, companyId, userId };
}

export async function clearAuthData() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USERNAME_KEY);
    await SecureStore.deleteItemAsync(DNI_KEY);
    await SecureStore.deleteItemAsync(ROLE_KEY);
    await SecureStore.deleteItemAsync(COMPANY_ID_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  } catch (e) {
    console.warn("Error limpiando auth data", e);
  }
}

// ========= isTokenExpired (versión RN-safe) =========

// Usamos base-64 del paquete "base-64" y normalizamos base64url
function decodeBase64Url(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";

  // base-64.decode devuelve string decodificado
  return base64.decode(b64);
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false; // token raro, deja que el backend lo rechace

    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp) return false;

    const expMs = payload.exp * 1000; // exp en segundos
    return Date.now() > expMs;
  } catch (e) {
    console.error("Error evaluando expiración de token", e);
    // Si algo sale mal al decodificar, preferimos NO bloquear
    // y que el backend devuelva 401
    return false;
  }
}

// Helper para usar siempre tokens válidos en el cliente HTTP
export async function getValidToken(): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    // Opcional: limpiar sesión si el token ya venció
    await clearAuthData();
    return null;
  }

  return token;
}
