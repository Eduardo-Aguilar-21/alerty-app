// app/history.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { getAuthData } from "../../src/api/authStorage";
import {
    useAcknowledgeAlert,
    useAlerts,
} from "../../src/api/hooks/useAlerts";
import type { AlertSummary } from "../../src/api/services/alertService";

// ====== Buckets de severidad (igual idea que en la web) ======

type SeverityBucket = "LOW" | "MEDIUM" | "HIGH";

const severityBucketLabel: Record<SeverityBucket, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

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

type SeverityFilter = SeverityBucket | "ALL";

// Util simple para limpiar HTML (por si el backend devuelve algo con tags)
function stripHtml(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "");
}

// ====== Badges (severidad y estado) adaptados a React Native ======

function SeverityBadge({ severity }: { severity?: string | null }) {
  const bucket = mapSeverityToBucket(severity);
  let bg = "#064e3b";
  let border = "#16a34a";
  let text = "#6ee7b7";
  let icon: keyof typeof Ionicons.glyphMap = "information-circle-outline";

  if (bucket === "MEDIUM") {
    bg = "#451a03";
    border = "#facc15";
    text = "#fde68a";
    icon = "warning-outline";
  } else if (bucket === "HIGH") {
    bg = "#450a0a";
    border = "#f97373";
    text = "#fecaca";
    icon = "alert-circle-outline";
  }

  const rawLabel = (severity || "INFO").toUpperCase();

  return (
    <View style={[styles.badgeBase, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={12} color={text} />
      <Text style={[styles.badgeTextBase, { color: text }]}>
        {severityBucketLabel[bucket]}
      </Text>
      <Text style={[styles.badgeTextRaw, { color: text }]}>({rawLabel})</Text>
    </View>
  );
}

function StatusBadge({ acknowledged }: { acknowledged: boolean }) {
  if (acknowledged) {
    return (
      <View
        style={[
          styles.badgeBase,
          {
            backgroundColor: "rgba(22, 163, 74, 0.12)",
            borderColor: "rgba(22, 163, 74, 0.6)",
          },
        ]}
      >
        <Ionicons name="checkmark-circle-outline" size={12} color="#6ee7b7" />
        <Text style={[styles.badgeTextBase, { color: "#bbf7d0" }]}>
          Atendida
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badgeBase,
        {
          backgroundColor: "rgba(248, 113, 113, 0.12)",
          borderColor: "rgba(248, 113, 113, 0.6)",
        },
      ]}
    >
      <Ionicons name="alert-circle-outline" size={12} color="#fecaca" />
      <Text style={[styles.badgeTextBase, { color: "#fecaca" }]}>
        Pendiente
      </Text>
    </View>
  );
}

// ============================================================
// ================== PANTALLA PRINCIPAL ======================
// ============================================================

export default function HistoryScreen() {
  const router = useRouter();

  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // 🔐 Cargar auth desde SecureStore y sacar companyId (igual idea que getAuthDataWeb)
  useEffect(() => {
    void (async () => {
      const auth = await getAuthData();
      setCompanyId(auth?.companyId ?? null);
      setAuthLoaded(true);
    })();
  }, []);

  const { data, isLoading, isError, error } = useAlerts({
    companyId: companyId ?? undefined,
    page,
    size: pageSize,
  });

  const { mutateAsync: acknowledgeAlert, isPending: isAcking } =
    useAcknowledgeAlert();

  const alerts: AlertSummary[] = useMemo(
    () => data?.content ?? [],
    [data]
  );

  const totalElements = data?.totalElements ?? 0;
  const totalOnPage = alerts.length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (
        severityFilter !== "ALL" &&
        mapSeverityToBucket(alert.severity) !== severityFilter
      ) {
        return false;
      }

      if (!search.trim()) return true;
      const q = search.toLowerCase();

      const vehicleCode = stripHtml(alert.vehicleCode).toLowerCase();
      const licensePlate = stripHtml(alert.licensePlate).toLowerCase();
      const alertType = stripHtml(alert.alertType).toLowerCase();
      const severity = (alert.severity ?? "").toLowerCase();
      const plant = stripHtml(alert.plant).toLowerCase();
      const area = stripHtml(alert.area).toLowerCase();
      const shortDescription = stripHtml(alert.shortDescription).toLowerCase();

      return (
        vehicleCode.includes(q) ||
        licensePlate.includes(q) ||
        alertType.includes(q) ||
        severity.includes(q) ||
        plant.includes(q) ||
        area.includes(q) ||
        shortDescription.includes(q)
      );
    });
  }, [alerts, severityFilter, search]);

  // KPIs igual que en web: cuentan sobre la página completa, NO sólo filtradas
  const pendingOnPage = alerts.filter((a) => !a.acknowledged).length;
  const criticalOnPage = alerts.filter(
    (a) => mapSeverityToBucket(a.severity) === "HIGH"
  ).length;

  const handleMarkReviewed = async (alert: AlertSummary) => {
    if (alert.acknowledged) return;
    if (!companyId) return; // seguridad, igual que en web

    await acknowledgeAlert({ companyId, id: alert.id });
  };

  const handleViewDetails = (alert: AlertSummary) => {
    router.push({
      pathname: "/alert/[id]",
      params: { id: String(alert.id) },
    });
  };

  // Mientras aún no cargamos la sesión desde SecureStore
  if (!authLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={{ marginTop: 8, color: "#9ca3af", fontSize: 13 }}>
          Cargando sesión…
        </Text>
      </View>
    );
  }

  // Si no hay companyId (sesión rota / sin empresa), igual que en web
  if (!companyId) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
          No hay empresa seleccionada. Vuelve a iniciar sesión.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color="#6366f1"
          />
          <Text style={styles.title}>Alertas del sistema</Text>
        </View>
        <Text style={styles.subtitle}>
          Historial de todas las alertas provenientes de los montacargas
          registrados en la plataforma. Los datos vienen directo del
          backend.
        </Text>
      </View>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total en el sistema</Text>
          <Text style={styles.kpiValue}>{totalElements}</Text>
          <Text style={styles.kpiHint}>
            Total de alertas registradas.
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Pendientes (página)</Text>
          <Text style={[styles.kpiValue, { color: "#fca5a5" }]}>
            {pendingOnPage}
          </Text>
          <Text style={styles.kpiHint}>
            Alertas sin confirmar atención.
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Críticas (página)</Text>
          <Text style={[styles.kpiValue, { color: "#fbbf24" }]}>
            {criticalOnPage}
          </Text>
          <Text style={styles.kpiHint}>
            Mapeadas a severidad alta.
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <View style={styles.filtersTitleRow}>
            <Ionicons name="filter-outline" size={16} color="#9ca3af" />
            <Text style={styles.filtersTitle}>Filtros</Text>
          </View>
        </View>

        <View style={styles.filtersContent}>
          {/* Chips severidad */}
          <View style={styles.chipsRow}>
            <SeverityChip
              label="Todas"
              active={severityFilter === "ALL"}
              onPress={() => setSeverityFilter("ALL")}
            />
            <SeverityChip
              label={severityBucketLabel.LOW}
              bucket="LOW"
              active={severityFilter === "LOW"}
              onPress={() => setSeverityFilter("LOW")}
            />
            <SeverityChip
              label={severityBucketLabel.MEDIUM}
              bucket="MEDIUM"
              active={severityFilter === "MEDIUM"}
              onPress={() => setSeverityFilter("MEDIUM")}
            />
            <SeverityChip
              label={severityBucketLabel.HIGH}
              bucket="HIGH"
              active={severityFilter === "HIGH"}
              onPress={() => setSeverityFilter("HIGH")}
            />
          </View>

          {/* Búsqueda */}
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={16}
              color="#6b7280"
              style={styles.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por placa, tipo, planta, área…"
              placeholderTextColor="#6b7280"
              style={styles.searchInput}
            />
          </View>
        </View>
      </View>

      {/* Lista principal */}
      <View style={styles.listContainer}>
        {isLoading && (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.centerMessageText}>
              Cargando alertas…
            </Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={styles.centerMessage}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color="#f97373"
            />
            <Text style={styles.errorTitle}>Error al cargar alertas</Text>
            <Text style={styles.errorText}>{error?.message}</Text>
          </View>
        )}

        {!isLoading && !isError && (
          <FlatList
            data={filteredAlerts}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListEmptyComponent={
              <View style={styles.centerMessage}>
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color="#4b5563"
                />
                <Text style={styles.emptyTitle}>
                  {totalOnPage === 0
                    ? "No hay alertas registradas."
                    : "No hay alertas que coincidan con los filtros."}
                </Text>
                <Text style={styles.emptyText}>
                  Ajusta los filtros o espera a que se generen nuevas
                  alertas.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const licensePlate = stripHtml(item.licensePlate);
              const vehicleCode = stripHtml(item.vehicleCode);
              const plant = stripHtml(item.plant);
              const area = stripHtml(item.area);
              const shortDescription = stripHtml(item.shortDescription);
              const alertTypeText = stripHtml(item.alertType);

              return (
                <TouchableOpacity
                  onPress={() => handleViewDetails(item)}
                  activeOpacity={0.9}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <SeverityBadge severity={item.severity} />
                      <Text style={styles.cardId}>#{item.id}</Text>
                    </View>
                    <StatusBadge acknowledged={item.acknowledged} />
                  </View>

                  <Text style={styles.cardTitle}>
                    {licensePlate || vehicleCode}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    {plant || "-"}
                    {area ? ` • ${area}` : ""}
                  </Text>

                  <Text style={styles.cardMessage}>
                    {shortDescription || "Sin descripción."}
                  </Text>

                  <View style={styles.cardBadgesRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {alertTypeText || "—"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="#9ca3af"
                    />
                    <Text style={styles.cardFooterText}>
                      Evento:{" "}
                      {new Date(
                        item.eventTime
                      ).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  <View style={[styles.cardFooter, { marginTop: 2 }]}>
                    <Ionicons
                      name="download-outline"
                      size={14}
                      color="#6b7280"
                    />
                    <Text style={styles.cardFooterText}>
                      Recibida:{" "}
                      {new Date(
                        item.receivedAt
                      ).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      disabled={item.acknowledged || isAcking}
                      onPress={() => handleMarkReviewed(item)}
                      style={[
                        styles.actionButton,
                        styles.actionPrimary,
                        (item.acknowledged || isAcking) && {
                          opacity: 0.5,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={14}
                        color="#bbf7d0"
                      />
                      <Text style={styles.actionPrimaryText}>
                        Revisada
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleViewDetails(item)}
                      style={[styles.actionButton, styles.actionSecondary]}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={14}
                        color="#e5e7eb"
                      />
                      <Text style={styles.actionSecondaryText}>
                        Detalles
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Paginación simple abajo */}
        {data && !isLoading && !isError && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={page === 0}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              style={[
                styles.paginationButton,
                page === 0 && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.paginationInfo}>
              Página {data.number + 1} de {data.totalPages || 1}
            </Text>
            <TouchableOpacity
              disabled={data.last}
              onPress={() => setPage((p) => p + 1)}
              style={[
                styles.paginationButton,
                data.last && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationText}>{">"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// Chip de severidad

type SeverityChipProps = {
  label: string;
  active: boolean;
  bucket?: SeverityBucket;
  onPress: () => void;
};

function SeverityChip({
  label,
  active,
  bucket,
  onPress,
}: SeverityChipProps) {
  let activeBg = "#111827";
  let activeBorder = "#4b5563";
  let activeText = "#e5e7eb";

  if (bucket === "LOW") {
    activeBg = "#022c22";
    activeBorder = "#16a34a";
    activeText = "#6ee7b7";
  } else if (bucket === "MEDIUM") {
    activeBg = "#451a03";
    activeBorder = "#facc15";
    activeText = "#fde68a";
  } else if (bucket === "HIGH") {
    activeBg = "#450a0a";
    activeBorder = "#f97373";
    activeText = "#fecaca";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: activeBg,
          borderColor: activeBorder,
        },
      ]}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.chipText,
          active && { color: activeText },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
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

  filtersCard: {
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  filtersHeader: {
    marginBottom: 8,
  },
  filtersTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filtersTitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  filtersContent: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#020617",
  },
  chipText: {
    fontSize: 11,
    color: "#e5e7eb",
  },

  searchWrapper: {
    marginTop: 4,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 9,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingVertical: 6,
    paddingHorizontal: 30,
    fontSize: 12,
    color: "#e5e7eb",
    backgroundColor: "#020617",
  },

  listContainer: {
    flex: 1,
  },
  centerMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  centerMessageText: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
  errorTitle: {
    marginTop: 12,
    color: "#fecaca",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 4,
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardId: {
    fontSize: 11,
    color: "#9ca3af",
    fontFamily: "monospace",
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  cardMessage: {
    color: "#d1d5db",
    fontSize: 12,
    marginBottom: 8,
  },
  cardBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: "#0b1120",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardFooterText: {
    color: "#9ca3af",
    fontSize: 11,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  actionPrimary: {
    backgroundColor: "#065f46",
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  actionPrimaryText: {
    color: "#bbf7d0",
    fontSize: 11,
    fontWeight: "500",
  },
  actionSecondary: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#374151",
  },
  actionSecondaryText: {
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: "500",
  },

  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: "500",
  },
  badgeTextRaw: {
    fontSize: 10,
  },

  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8,
  },
  paginationButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  paginationInfo: {
    color: "#9ca3af",
    fontSize: 12,
  },
});
