// app/history.tsx
import { Ionicons } from "@expo/vector-icons";
import {
    SectionList,
    SectionListData,
    StyleSheet,
    Text,
    View,
} from "react-native";

type AlertSeverity = "critical" | "warning" | "info";

type AlertItem = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  time: string; // ej: "14:32"
  source: string; // ej: "Montacargas Lima"
};

type AlertSection = {
  title: string; // ej: "Hoy", "Ayer"
  data: AlertItem[];
};

const SECTIONS: AlertSection[] = [
  {
    title: "Hoy",
    data: [
      {
        id: "A-001",
        title: "Golpe brusco detectado",
        message: "Impacto fuerte en Montacargas #12, zona rampa norte.",
        severity: "critical",
        time: "14:32",
        source: "Montacargas Lima",
      },
      {
        id: "A-002",
        title: "Exceso de velocidad",
        message: "Velocidad por encima del límite en pasillo A-3.",
        severity: "warning",
        time: "11:05",
        source: "Almacén Callao",
      },
    ],
  },
  {
    title: "Ayer",
    data: [
      {
        id: "A-003",
        title: "Operación fuera de horario",
        message: "Movimiento no programado en turno noche.",
        severity: "info",
        time: "23:47",
        source: "Taller Arequipa",
      },
    ],
  },
  {
    title: "Esta semana",
    data: [
      {
        id: "A-004",
        title: "Zona restringida",
        message: "Ingreso a zona restringida sin autorización.",
        severity: "warning",
        time: "Lun 09:15",
        source: "Montacargas Lima",
      },
    ],
  },
];

function getSeverityLabel(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return "Crítica";
    case "warning":
      return "Advertencia";
    case "info":
      return "Info";
  }
}

function getSeverityStyle(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return {
        container: styles.badgeCritical,
        text: styles.badgeCriticalText,
        icon: "alert-circle-outline" as const,
      };
    case "warning":
      return {
        container: styles.badgeWarning,
        text: styles.badgeWarningText,
        icon: "warning-outline" as const,
      };
    case "info":
      return {
        container: styles.badgeInfo,
        text: styles.badgeInfoText,
        icon: "information-circle-outline" as const,
      };
  }
}

export default function HistoryScreen() {
  const totalToday = SECTIONS.find((s) => s.title === "Hoy")?.data.length ?? 0;
  const totalCritical = SECTIONS.reduce(
    (acc, sec) =>
      acc + sec.data.filter((a) => a.severity === "critical").length,
    0
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial de alertas</Text>
        <Text style={styles.subtitle}>
          Revisa las últimas alertas generadas por los montacargas vinculados a
          este dispositivo.
        </Text>
      </View>

      {/* KPIs pequeños arriba */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Hoy</Text>
          <Text style={styles.kpiValue}>{totalToday}</Text>
          <Text style={styles.kpiHint}>Alertas registradas</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Críticas</Text>
          <Text style={[styles.kpiValue, { color: "#f97373" }]}>
            {totalCritical}
          </Text>
          <Text style={styles.kpiHint}>Requieren atención</Text>
        </View>
      </View>

      {/* Lista seccionada */}
      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={({
          section,
        }: {
          section: SectionListData<AlertItem, AlertSection>;
        }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const { container, text, icon } = getSeverityStyle(item.severity);

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badgeBase, container]}>
                  <Ionicons name={icon} size={14} color={text.color} />
                  <Text style={[styles.badgeTextBase, text]}>
                    {getSeverityLabel(item.severity)}
                  </Text>
                </View>

                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>

              <View style={styles.cardFooter}>
                <Ionicons
                  name="business-outline"
                  size={14}
                  color="#9ca3af"
                />
                <Text style={styles.sourceText}>{item.source}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={40}
              color="#4b5563"
            />
            <Text style={styles.emptyTitle}>Sin alertas todavía</Text>
            <Text style={styles.emptyText}>
              Cuando se generen alertas en tus montacargas, aparecerán aquí.
            </Text>
          </View>
        }
      />
    </View>
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

  listContent: {
    paddingBottom: 24,
  },

  sectionHeader: {
    paddingVertical: 6,
  },
  sectionTitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
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
  cardTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardMessage: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceText: {
    color: "#9ca3af",
    fontSize: 11,
  },
  timeText: {
    color: "#6b7280",
    fontSize: 11,
  },

  // Badges de severidad
  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: "500",
  },

  badgeCritical: {
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.45)",
  },
  badgeCriticalText: {
    color: "#fecaca",
  },

  badgeWarning: {
    backgroundColor: "rgba(234, 179, 8, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.45)",
  },
  badgeWarningText: {
    color: "#facc15",
  },

  badgeInfo: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.45)",
  },
  badgeInfoText: {
    color: "#93c5fd",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
