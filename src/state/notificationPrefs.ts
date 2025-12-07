// src/state/notificationPrefs.ts

let notificationsAllowed = true;
let soundAllowed = true;

export const setNotificationsAllowed = (value: boolean) => {
  notificationsAllowed = value;
};

export const getNotificationsAllowed = () => notificationsAllowed;

export const setSoundAllowed = (value: boolean) => {
  soundAllowed = value;
};

export const getSoundAllowed = () => soundAllowed;

// 👉 Añade esto:
export const getNotificationPrefs = () => ({
  notificationsAllowed,
  soundAllowed,
});
