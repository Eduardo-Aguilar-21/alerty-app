// app/config.tsx (o app/(tabs)/config.tsx)
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRegisterDevice } from "../../src/api/hooks/useDevices";
import { useUserById } from "../../src/api/hooks/useUsers";

import {
  getNotificationPrefs,
  setNotificationsAllowed,
  setSoundAllowed,
} from "../../src/state/notificationPrefs";

import {
  clearAuthData,
  getAuthData,
} from "../../src/api/authStorage";

export default function ConfigScreen() {
  const router = useRouter();
  const registerDeviceMutation = useRegisterDevice();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // auth: username + userId desde SecureStore
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Cargar prefs iniciales + auth desde SecureStore
  useEffect(() => {
    const init = async () => {
      const prefs = getNotificationPrefs();
      setNotificationsEnabled(prefs.notificationsAllowed);
      setSoundEnabled(prefs.soundAllowed);

      const auth = await getAuthData();
      setUsername(auth?.username ?? null);
      setUserId(auth?.userId ?? null);
      setAuthLoaded(true);
    };

    void init();
  }, []);

  // Usuario desde backend usando userId (igual que en web)
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUserById(userId ?? undefined);

  const handleLogout = async () => {
    // limpia token / username / etc.
    await clearAuthData();

    // Opcional: cancelar notificaciones programadas
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn("Error cancelando notificaciones en logout", e);
    }

    router.replace("/login");
  };

  // Toggle notificaciones: pide permisos, registra device, etc.
  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // ENCENDER
      try {
        const settings = await Notifications.getPermissionsAsync();
        let finalStatus = settings.status;

        if (finalStatus !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          finalStatus = req.status;
        }

        if (finalStatus !== "granted") {
          Alert.alert(
            "Notificaciones bloqueadas",
            "El sistema tiene bloqueadas las notificaciones para esta app. Actívalas desde los Ajustes del sistema."
          );

          try {
            await Linking.openSettings();
          } catch {
            // puede no estar soportado
          }

          setNotificationsEnabled(false);
          setNotificationsAllowed(false);
          return;
        }

        // Necesitamos el userId real del backend
        const backendUserId = user?.id;
        if (!backendUserId) {
          Alert.alert(
            "Usuario no cargado",
            "No se pudo determinar el usuario actual para registrar el dispositivo."
          );
          setNotificationsEnabled(false);
          setNotificationsAllowed(false);
          return;
        }

        // Obtener Expo push token (projectId real)
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "bdd02b90-eff5-4d05-8347-e71f1ed057ad", // ⚠️ tu projectId real
        });

        // Registrar dispositivo en backend
        await registerDeviceMutation.mutateAsync({
          userId: backendUserId,
          expoPushToken: tokenData.data, // "ExponentPushToken[xxxx]"
          platform: Platform.OS, // "android" | "ios"
        });

        setNotificationsEnabled(true);
        setNotificationsAllowed(true);
      } catch (e) {
        console.error("Error solicitando/registrando notificaciones", e);
        Alert.alert(
          "Error",
          "No se pudieron configurar las notificaciones en este momento."
        );
        setNotificationsEnabled(false);
        setNotificationsAllowed(false);
      }
    } else {
      // APAGAR
      setNotificationsEnabled(false);
      setNotificationsAllowed(false);

      // Opcional: también apaga sonido
      setSoundEnabled(false);
      setSoundAllowed(false);

      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (e) {
        console.warn("Error cancelando notificaciones programadas", e);
      }

      // Futuro: desregistrar device en backend
    }
  };

  const handleToggleSound = (value: boolean) => {
    if (!notificationsEnabled && value) {
      Alert.alert(
        "Primero activa notificaciones",
        "Activa las notificaciones push para poder usar el sonido."
      );
      return;
    }
    setSoundEnabled(value);
    setSoundAllowed(value);
  };

  // ⏳ Mientras no cargó auth
  if (!authLoaded) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.centerMessageText}>Cargando sesión…</Text>
      </View>
    );
  }

  // ❌ Si no hay userId -> misma idea que en web
  if (!userId) {
    return (
      <View style={styles.centerFull}>
        <Text style={[styles.centerMessageText, { fontSize: 14 }]}>
          No se encontró información de usuario en la sesión. Vuelve a iniciar sesión.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={[styles.logoutButton, { marginTop: 16 }]}
          activeOpacity={0.9}
        >
          <Ionicons name="log-in-outline" size={18} color="#fecaca" />
          <Text style={styles.logoutText}>Ir al login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER FIJO (sin scroll) */}
      <View style={styles.headerWrapper}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>
          Ajusta tu cuenta y las preferencias de Alerty en este dispositivo.
        </Text>
      </View>

      {/* CONTENIDO SCROLLEABLE */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección: Cuenta / sesión */}
        <View style={styles.section}>
          <View className="sectionHeader" style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={18} color="#e5e7eb" />
            <Text style={styles.sectionTitle}>Cuenta</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardColumn}>
                <Text style={styles.cardLabel}>
                  Usuario {username ? `(@${username})` : ""}
                </Text>

                {isLoading && (
                  <View style={styles.inlineRow}>
                    <ActivityIndicator size="small" color="#6366f1" />
                    <Text style={[styles.cardValue, { marginLeft: 8 }]}>
                      Cargando datos…
                    </Text>
                  </View>
                )}

                {isError && (
                  <View>
                    <Text style={[styles.cardValue, { color: "#fecaca" }]}>
                      Error al obtener el usuario
                    </Text>
                    <Text style={styles.cardHint}>
                      {error?.message ?? "Revisa la conexión con el servidor."}
                    </Text>
                  </View>
                )}

                {!username && !isLoading && !isError && (
                  <Text style={styles.cardHint}>
                    No se encontró username en la sesión. Vuelve a iniciar sesión.
                  </Text>
                )}

                {user && !isLoading && !isError && (
                  <>
                    <Text style={styles.cardValue}>{user.fullName}</Text>
                    <Text style={styles.cardHint}>
                      @{user.username} · DNI: {user.dni}
                    </Text>
                    <Text style={styles.cardHint}>
                      Rol: {user.role} · {user.active ? "Activo" : "Inactivo"}
                    </Text>
                    <Text style={styles.cardHint}>
                      ID interno: {user.id}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Notificaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={18} color="#e5e7eb" />
            <Text style={styles.sectionTitle}>Notificaciones</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchTexts}>
                <Text style={styles.switchTitle}>Notificaciones push</Text>
                <Text style={styles.switchDescription}>
                  Permitir que Alerty envíe alertas a este dispositivo.
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                thumbColor={notificationsEnabled ? "#facc15" : "#6b7280"}
                trackColor={{ false: "#111827", true: "#f59e0b" }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchTexts}>
                <Text style={styles.switchTitle}>Sonido</Text>
                <Text style={styles.switchDescription}>
                  Reproducir un sonido cuando llegue una alerta.
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                thumbColor={soundEnabled ? "#facc15" : "#6b7280"}
                trackColor={{ false: "#111827", true: "#f59e0b" }}
              />
            </View>
          </View>
        </View>

        {/* Sección: Info app */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#e5e7eb"
            />
            <Text style={styles.sectionTitle}>Acerca de</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.aboutTitle}>Alerty · Cliente móvil</Text>
            <Text style={styles.aboutText}>
              Esta app se conecta a la plataforma Alerty para recibir eventos de
              montacargas y mostrar notificaciones en tiempo real.
            </Text>
            <Text style={styles.aboutMeta}>Versión 0.1.0 · Build demo</Text>
          </View>
        </View>

        {/* Botón Cerrar sesión */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.9}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#fecaca" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  centerFull: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centerMessageText: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
  headerWrapper: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#020617",
  },
  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardColumn: {
    flex: 1,
    paddingRight: 8,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 11,
    marginBottom: 2,
  },
  cardValue: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  cardHint: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  switchTexts: {
    flex: 1,
  },
  switchTitle: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  switchDescription: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#111827",
    marginVertical: 8,
  },
  aboutTitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  aboutText: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },
  aboutMeta: {
    color: "#6b7280",
    fontSize: 11,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#b91c1c",
    backgroundColor: "#7f1d1d",
    paddingVertical: 10,
  },
  logoutText: {
    color: "#fecaca",
    fontSize: 14,
    fontWeight: "600",
  },
});
