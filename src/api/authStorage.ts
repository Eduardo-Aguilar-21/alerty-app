// src/api/authStorage.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "alerty_token";
const USERNAME_KEY = "alerty_username";
const DNI_KEY = "alerty_dni";
const ROLE_KEY = "alerty_role";

export async function saveAuthData(params: {
  token: string;
  username?: string;
  dni?: string;
  role?: string;
}) {
  const { token, username, dni, role } = params;

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
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUsername() {
  return SecureStore.getItemAsync(USERNAME_KEY);
}

export async function clearAuthData() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USERNAME_KEY);
  await SecureStore.deleteItemAsync(DNI_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
}
