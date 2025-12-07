// app/alert/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";

import {
  useAcknowledgeAlert,
  useAlert,
} from "../../../src/api/hooks/useAlerts";

// === Util simple para limpiar HTML en campos cortos (no raw) ===
function stripHtml(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "");
}

function isCriticalSeverity(severity?: string | null): boolean {
  const s = (severity || "").toUpperCase();
  return [
    "HIGH",
    "CRITICAL",
    "ALTA",
    "BLOQUEA_OPERACION",
    "BLOQUEA_OPERACIÓN",
  ].includes(s);
}

/**
 * Construye un documento HTML completo a partir del rawPayload del backend,
 * intentando emular cómo se ve en la web:
 * - Quitamos DOCTYPE, <html>, <head>, <body> originales
 * - Añadimos nuestro propio <meta viewport> y CSS para responsive
 */
function buildHtmlFromPayload(rawHtml: string): string {
  // 1) Quitamos DOCTYPE y etiquetas de alto nivel
  let cleaned = rawHtml
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "");

  // 2) Opcional: trim
  cleaned = cleaned.trim();

  // 3) Envolvemos en un HTML propio, con estilos similares a un email web
  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <style>
      /* Reset básico */
      * {
        box-sizing: border-box;
      }
      html, body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
          sans-serif;
        color: #111827;
      }

      body {
        padding: 8px;
        font-size: 13px;
        line-height: 1.4;
      }

      p {
        margin: 4px 0;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        max-width: 100%;
      }

      td, th {
        font-size: 12px;
        padding: 4px;
        border: 1px solid #e5e7eb;
        vertical-align: top;
      }

      /* El template del correo a veces fija width=600px, etc.
         Forzamos que nunca se salga del ancho del móvil. */
      table[style] {
        width: 100% !important;
      }

      img {
        max-width: 100% !important;
        height: auto !important;
        display: block;
        margin: 8px 0;
      }

      header {
        font-size: 12px;
      }

      ul {
        padding-left: 18px;
        margin: 6px 0;
      }

      h1, h2, h3 {
        margin: 6px 0;
      }
    </style>
  </head>
  <body>
    ${cleaned}
  </body>
</html>
`;
}

export default function AlertDetailScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const params = useLocalSearchParams<{ id?: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const {
    data: alert,
    isLoading,
    isError,
    error,
  } = useAlert(Number.isNaN(id) ? undefined : id);

  const { mutateAsync: acknowledgeAlert, isPending: isAcking } =
    useAcknowledgeAlert();

  // En vez de back(), mandamos directo a /history
  const handleBack = () => {
    router.push("/history");
    // o router.replace("/history");
  };

  const handleMarkReviewed = async () => {
    if (!alert || alert.acknowledged) return;
    await acknowledgeAlert(alert.id);
  };

  if (Number.isNaN(id)) {
    return (
      <View style={styles.centerFull}>
        <Text style={styles.errorTitle}>ID de alerta inválido.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={16} color="#e5e7eb" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.centerText}>Cargando alerta…</Text>
      </View>
    );
  }

  if (isError || !alert) {
    return (
      <View style={styles.centerFull}>
        <Ionicons name="alert-circle-outline" size={32} color="#f97373" />
        <Text style={styles.errorTitle}>Error al cargar la alerta</Text>
        <Text style={styles.errorText}>{error?.message}</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={16} color="#e5e7eb" />
          <Text style={styles.backButtonText}>Volver a historial</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const critical = isCriticalSeverity(alert.severity);

  const licensePlate = stripHtml(alert.licensePlate);
  const vehicleCode = stripHtml(alert.vehicleCode);
  const plant = stripHtml(alert.plant);
  const area = stripHtml(alert.area);
  const alertTypeText = stripHtml(alert.alertType);

  const descriptionText: string =
    stripHtml(alert.details || alert.shortDescription) || "Sin descripción.";

  const eventTime = new Date(alert.eventTime).toLocaleString();
  const receivedTime = new Date(alert.receivedAt).toLocaleString();

  // 👇 Construimos el HTML final para el WebView (solo si hay rawPayload)
  const htmlContent = useMemo(
    () => (alert.rawPayload ? buildHtmlFromPayload(alert.rawPayload) : ""),
    [alert.rawPayload]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header con botón volver y estado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.9}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={16} color="#e5e7eb" />
          <Text style={styles.backButtonText}>Volver a historial</Text>
        </TouchableOpacity>

        <View style={styles.headerMainRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#6366f1"
              />
              <Text style={styles.title}>Alerta #{alert.id}</Text>
            </View>
            <Text style={styles.subtitle}>
              Detalle completo de la alerta generada por el montacargas,
              incluyendo contexto operativo y tiempos de evento.
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View
              style={[
                styles.severityPill,
                critical
                  ? styles.severityPillCritical
                  : styles.severityPillWarning,
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={critical ? "#fecaca" : "#facc15"}
              />
              <Text
                style={[
                  styles.severityPillText,
                  { color: critical ? "#fecaca" : "#facc15" },
                ]}
              >
                {critical ? "Crítica" : "Advertencia / Info"}
              </Text>
              {alert.severity && (
                <Text style={styles.severityPillCode}>
                  ({alert.severity.toUpperCase()})
                </Text>
              )}
            </View>

            <TouchableOpacity
              disabled={alert.acknowledged || isAcking}
              onPress={handleMarkReviewed}
              activeOpacity={0.9}
              style={[
                styles.reviewButton,
                (alert.acknowledged || isAcking) && { opacity: 0.6 },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#bbf7d0"
              />
              <Text style={styles.reviewButtonText}>
                {alert.acknowledged ? "Ya revisada" : "Marcar revisada"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Info principal (vehículo / ubicación / tiempos) */}
      <View style={styles.cardsRow}>
        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Vehículo</Text>
          <Text style={styles.cardMainText}>
            {licensePlate || vehicleCode || "—"}
          </Text>
          {licensePlate && licensePlate !== vehicleCode && (
            <Text style={styles.cardSubText}>Código: {vehicleCode}</Text>
          )}
          <Text style={[styles.cardSubText, { marginTop: 8 }]}>
            Tipo:{" "}
            <Text style={styles.chipText}>{alertTypeText || "—"}</Text>
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>Ubicación</Text>
          <Text style={styles.cardMainText}>
            {plant || "Planta desconocida"}
          </Text>
          <Text style={styles.cardSubText}>
            {area || "Área no registrada"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>Tiempos</Text>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
          </View>
          <Text style={styles.cardSubText}>
            Evento: <Text style={styles.monoText}>{eventTime}</Text>
          </Text>
          <Text style={styles.cardSubText}>
            Recibida: <Text style={styles.monoText}>{receivedTime}</Text>
          </Text>
          <Text style={[styles.cardSubText, { marginTop: 6 }]}>
            Estado:{" "}
            {alert.acknowledged ? (
              <Text style={{ color: "#bbf7d0" }}>Atendida</Text>
            ) : (
              <Text style={{ color: "#fecaca" }}>Pendiente</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Descripción textual */}
      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>Descripción</Text>
        <Text style={styles.blockBody}>{descriptionText}</Text>
      </View>

      {/* Contenido técnico (HTML completo, igual que en web) */}
      {alert.rawPayload && (
        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>Detalle técnico (HTML)</Text>
          <Text style={styles.blockSubtitle}>
            Este contenido proviene directamente del sistema de origen y se
            muestra usando un WebView para respetar tablas, estilos e imágenes.
          </Text>

          <View
            style={[
              styles.rawPayloadBox,
              { height: Math.max(420, height * 0.65) }, // alto mínimo cómodo
            ]}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: htmlContent }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              mixedContentMode="always"
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  centerFull: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centerText: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
  errorTitle: {
    marginTop: 12,
    color: "#fecaca",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    marginTop: 4,
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#020617",
  },
  backButtonText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "500",
  },

  header: {
    marginBottom: 16,
  },
  headerMainRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 12,
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
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },

  severityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  severityPillCritical: {
    backgroundColor: "rgba(248,113,113,0.12)",
    borderColor: "rgba(248,113,113,0.6)",
  },
  severityPillWarning: {
    backgroundColor: "rgba(234,179,8,0.12)",
    borderColor: "rgba(234,179,8,0.6)",
  },
  severityPillText: {
    fontSize: 11,
    fontWeight: "500",
  },
  severityPillCode: {
    fontSize: 10,
    color: "#9ca3af",
  },

  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#16a34a",
    backgroundColor: "#065f46",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewButtonText: {
    color: "#bbf7d0",
    fontSize: 12,
    fontWeight: "500",
  },

  cardsRow: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "500",
  },
  cardMainText: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  cardSubText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipText: {
    backgroundColor: "#0b1120",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: "500",
  },
  monoText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#e5e7eb",
  },

  blockCard: {
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  blockTitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  blockSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  blockBody: {
    color: "#d1d5db",
    fontSize: 13,
    marginTop: 8,
  },

  rawPayloadBox: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
