// app/config.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ConfigScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // De momento hardcodeado, luego lo traeremos del store / API
  const currentGroupName = "Montacargas Lima";
  const currentUser = "demo.alerty@app.com";
  const tokenPreview = "****…a9f1";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>
          Ajusta cómo se conecta esta app con Alerty y cómo quieres recibir
          las alertas en tu dispositivo.
        </Text>
      </View>

      {/* Sección: Cuenta / sesión */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={18} color="#e5e7eb" />
          <Text style={styles.sectionTitle}>Cuenta y grupo</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Usuario</Text>
              <Text style={styles.cardValue}>{currentUser}</Text>
            </View>
            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => console.log("Cambiar login")}
            >
              <Ionicons
                name="log-in-outline"
                size={14}
                color="#facc15"
              />
              <Text style={styles.chipButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.cardRow, { marginTop: 14 }]}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Grupo vinculado</Text>
              <Text style={styles.cardValue}>{currentGroupName}</Text>
              <Text style={styles.cardHint}>
                Solo recibirás alertas pertenecientes a este grupo.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => console.log("Cambiar grupo")}
            >
              <Ionicons name="swap-horizontal-outline" size={14} color="#facc15" />
              <Text style={styles.chipButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sección: Conexión API */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cloud-outline" size={18} color="#e5e7eb" />
          <Text style={styles.sectionTitle}>Conexión con servidor</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Token de acceso</Text>
              <Text style={styles.cardValue}>{tokenPreview}</Text>
              <Text style={styles.cardHint}>
                Este token se usa para autenticar las peticiones al API.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => console.log("Configurar token")}
            >
              <Ionicons name="key-outline" size={14} color="#facc15" />
              <Text style={styles.chipButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.cardRow, { marginTop: 14 }]}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Estado conexión</Text>
              <Text style={[styles.cardValue, { color: "#4ade80" }]}>
                Conectado
              </Text>
              <Text style={styles.cardHint}>
                En el futuro aquí podemos mostrar el último ping al servidor.
              </Text>
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
              onValueChange={setNotificationsEnabled}
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
              onValueChange={setSoundEnabled}
              thumbColor={soundEnabled ? "#facc15" : "#6b7280"}
              trackColor={{ false: "#111827", true: "#f59e0b" }}
            />
          </View>
        </View>
      </View>

      {/* Sección: Info app */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={18} color="#e5e7eb" />
          <Text style={styles.sectionTitle}>Acerca de</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.aboutTitle}>Alerty (cliente móvil)</Text>
          <Text style={styles.aboutText}>
            Esta app se conecta a la plataforma web de Alerty para recibir
            eventos de montacargas y mostrar notificaciones en tiempo real.
          </Text>
          <Text style={styles.aboutMeta}>Versión 0.1.0 · Build demo</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  header: {
    marginBottom: 20,
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

  chipButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#facc15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    alignSelf: "flex-start",
  },
  chipButtonText: {
    color: "#facc15",
    fontSize: 11,
    fontWeight: "500",
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
});
