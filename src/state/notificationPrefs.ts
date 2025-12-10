// src/state/notificationPrefs.ts
import * as SecureStore from "expo-secure-store";

const NOTIFICATIONS_ALLOWED_KEY = "alerty_notifications_allowed";
const SOUND_ALLOWED_KEY = "alerty_sound_allowed";

let notificationsAllowed = true;
let soundAllowed = true;

// Cargar desde SecureStore al arrancar la app/pantalla
export const loadNotificationPrefs = async () => {
  try {
    const notifRaw = await SecureStore.getItemAsync(NOTIFICATIONS_ALLOWED_KEY);
    const soundRaw = await SecureStore.getItemAsync(SOUND_ALLOWED_KEY);

    if (notifRaw !== null) {
      notificationsAllowed = notifRaw === "1";
    }
    if (soundRaw !== null) {
      soundAllowed = soundRaw === "1";
    }
  } catch (e) {
    console.warn("Error cargando prefs de notificaciones", e);
  }

  return {
    notificationsAllowed,
    soundAllowed,
  };
};

// 🟢 / 🔴 setters: actualizan memoria + SecureStore
export const setNotificationsAllowed = (value: boolean) => {
  notificationsAllowed = value;
  SecureStore.setItemAsync(NOTIFICATIONS_ALLOWED_KEY, value ? "1" : "0").catch(
    (e) => console.warn("Error guardando notificationsAllowed", e)
  );
};

export const getNotificationsAllowed = () => notificationsAllowed;

export const setSoundAllowed = (value: boolean) => {
  soundAllowed = value;
  SecureStore.setItemAsync(SOUND_ALLOWED_KEY, value ? "1" : "0").catch((e) =>
    console.warn("Error guardando soundAllowed", e)
  );
};

export const getSoundAllowed = () => soundAllowed;

// helper para leer ambos de golpe (en memoria)
export const getNotificationPrefs = () => ({
  notificationsAllowed,
  soundAllowed,
});

// opcional: para logout limpio
export const clearNotificationPrefs = async () => {
  notificationsAllowed = true;
  soundAllowed = true;
  try {
    await SecureStore.deleteItemAsync(NOTIFICATIONS_ALLOWED_KEY);
    await SecureStore.deleteItemAsync(SOUND_ALLOWED_KEY);
  } catch (e) {
    console.warn("Error limpiando prefs de notificaciones", e);
  }
};
