// app/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAuthData } from "../../src/api/authStorage";
import { useAlerts } from "../../src/api/hooks/useAlerts";
import type { AlertSummary } from "../../src/api/services/alertService";
import {
  getNotificationsAllowed,
  getSoundAllowed,
} from "../../src/state/notificationPrefs";

// 🔔 Handler global correcto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ====== Buckets de severidad (simplificados para Home) ======
type SeverityBucket = "LOW" | "MEDIUM" | "HIGH";

function mapSeverityToBucket(severity?: string | null): SeverityBucket {
  const s = (severity || "").toUpperCase();

  if (["CRITICAL", "BLOQUEA_OPERACION", "BLOQUEA_OPERACIÓN", "ALTA"].includes(s)) {
    return "HIGH";
  }
  if (["WARNING", "WARN", "MEDIA"].includes(s)) {
    return "MEDIUM";
  }
  return "LOW";
}

// Limpia HTML por si acaso
function stripHtml(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "");
}

export default function HomeScreen() {
  const router = useRouter();

  // Estado local para mostrar cómo está la config de notifs
  const [notificationsOn, setNotificationsOn] = useState<boolean>(
    getNotificationsAllowed()
  );
  const [soundOn, setSoundOn] = useState<boolean>(getSoundAllowed());

  // Listeners para debug
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // 🔐 auth para sacar companyId (igual idea que en web)
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const auth = await getAuthData();
      setCompanyId(auth?.companyId ?? null);
      setAuthLoaded(true);
    })();
  }, []);

  // Alertas: primera página, tamaño chico, filtrado por companyId
  const { data, isLoading, isError, error } = useAlerts({
    companyId: companyId ?? undefined,
    page: 0,
    size: 5,
  });

  const alerts: AlertSummary[] = useMemo(
    () => data?.content ?? [],
    [data]
  );

  const pendingOnPage = alerts.filter((a) => !a.acknowledged).length;
  const criticalOnPage = alerts.filter(
    (a) => mapSeverityToBucket(a.severity) === "HIGH"
  ).length;
  const totalElements = data?.totalElements ?? 0;

  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
        });
      }
    };

    setupNotifications();

    // refrescar estado local por si cambió en Config
    setNotificationsOn(getNotificationsAllowed());
    setSoundOn(getSoundAllowed());

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📥 Notificación recibida EN APP:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👉 Usuario tocó la notificación:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const handleGoHistory = () => {
    router.push("/history");
  };

  const handleGoConfig = () => {
    router.push("/config");
  };

  // ⏳ Mientras no se cargó la sesión
  if (!authLoaded) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.centerMessageText}>Cargando sesión…</Text>
      </View>
    );
  }

  // ❌ Si no hay companyId -> igual mensaje que en web
  if (!companyId) {
    return (
      <View style={styles.centerFull}>
        <Text style={[styles.centerMessageText, { fontSize: 14 }]}>
          No se encontró una empresa asociada a la sesión actual.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={[styles.configButton, { marginTop: 16 }]}
          activeOpacity={0.9}
        >
          <Ionicons name="log-in-outline" size={18} color="#e5e7eb" />
          <Text style={styles.configButtonText}>Ir al login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="speedometer-outline" size={22} color="#6366f1" />
          <Text style={styles.title}>Alerts · Panel principal</Text>
        </View>
        <Text style={styles.subtitle}>
          Resumen rápido de tus alertas y estado de notificaciones en este
          dispositivo.
        </Text>
      </View>

      {/* CONTENIDO SCROLLEABLE */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Alertas registradas</Text>
            <Text style={styles.kpiValue}>{totalElements}</Text>
            <Text style={styles.kpiHint}>
              Total en el sistema (todas las páginas).
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pendientes (últimas)</Text>
            <Text style={[styles.kpiValue, { color: "#fca5a5" }]}>
              {pendingOnPage}
            </Text>
            <Text style={styles.kpiHint}>
              Sin confirmar atención (muestra de 5).
            </Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Críticas (últimas)</Text>
            <Text style={[styles.kpiValue, { color: "#fbbf24" }]}>
              {criticalOnPage}
            </Text>
            <Text style={styles.kpiHint}>
              Mapeadas a severidad alta (muestra de 5).
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Notificaciones</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: notificationsOn ? "#22c55e" : "#ef4444" },
                ]}
              />
              <Text style={styles.statusText}>
                {notificationsOn ? "Activadas" : "Desactivadas"}
              </Text>
            </View>
            <Text style={styles.kpiHint}>
              Sonido: {soundOn ? "On" : "Off"}.
            </Text>
          </View>
        </View>

        {/* Sección: últimas alertas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#e5e7eb"
            />
            <Text style={styles.sectionTitle}>Últimas alertas</Text>
          </View>

          <View style={styles.card}>
            {isLoading && (
              <View style={styles.centerMessage}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.centerMessageText}>
                  Cargando últimas alertas…
                </Text>
              </View>
            )}

            {isError && !isLoading && (
              <View style={styles.centerMessage}>
                <Ionicons
                  name="warning-outline"
                  size={28}
                  color="#f97373"
                />
                <Text style={styles.errorTitle}>
                  Error al obtener alertas
                </Text>
                <Text style={styles.errorText}>
                  {error?.message ?? "Revisa la conexión con el servidor."}
                </Text>
              </View>
            )}

            {!isLoading && !isError && alerts.length === 0 && (
              <View style={styles.centerMessage}>
                <Ionicons
                  name="notifications-off-outline"
                  size={32}
                  color="#4b5563"
                />
                <Text style={styles.centerMessageText}>
                  No hay alertas recientes.
                </Text>
              </View>
            )}

            {!isLoading &&
              !isError &&
              alerts.map((alert) => {
                const licensePlate = stripHtml(alert.licensePlate);
                const vehicleCode = stripHtml(alert.vehicleCode);
                const shortDescription = stripHtml(alert.shortDescription);

                const isPending = !alert.acknowledged;
                const severityBucket = mapSeverityToBucket(alert.severity);

                let severityColor = "#6ee7b7";
                if (severityBucket === "MEDIUM") severityColor = "#fde68a";
                if (severityBucket === "HIGH") severityColor = "#fecaca";

                return (
                  <View key={alert.id} style={styles.alertRow}>
                    <View style={styles.alertLeft}>
                      <Text style={styles.alertTitle}>
                        {licensePlate || vehicleCode || `#${alert.id}`}
                      </Text>
                      <Text style={styles.alertDesc} numberOfLines={2}>
                        {shortDescription || "Sin descripción."}
                      </Text>
                      <View style={styles.alertMetaRow}>
                        <Text style={[styles.alertMeta, { color: severityColor }]}>
                          {severityBucket === "HIGH"
                            ? "Crítica"
                            : severityBucket === "MEDIUM"
                            ? "Media"
                            : "Baja"}
                        </Text>
                        <Text style={styles.alertMeta}>
                          · {isPending ? "Pendiente" : "Atendida"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

            {/* Botón ver historial completo */}
            <TouchableOpacity
              style={styles.linkButton}
              activeOpacity={0.9}
              onPress={handleGoHistory}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color="#6366f1"
              />
              <Text style={styles.linkButtonText}>Ver historial completo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Ir a Configuración rápida */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <TouchableOpacity
            style={styles.configButton}
            activeOpacity={0.9}
            onPress={handleGoConfig}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color="#e5e7eb"
            />
            <Text style={styles.configButtonText}>
              Abrir configuración de Alerty
            </Text>
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
  headerWrapper: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#020617",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  kpiLabel: {
    color: "#9ca3af",
    fontSize: 11,
    marginBottom: 4,
  },
  kpiValue: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "600",
  },
  kpiHint: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    color: "#e5e7eb",
    fontSize: 12,
  },

  section: {
    marginTop: 4,
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

  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  centerMessageText: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 12,
  },
  errorTitle: {
    marginTop: 8,
    color: "#fecaca",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 4,
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },

  alertRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  alertLeft: {
    flex: 1,
    paddingRight: 4,
  },
  alertTitle: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  alertDesc: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },
  alertMetaRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  alertMeta: {
    color: "#9ca3af",
    fontSize: 11,
  },

  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4f46e5",
    backgroundColor: "#020617",
  },
  linkButtonText: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "500",
  },

  configButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingVertical: 10,
  },
  configButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
});
