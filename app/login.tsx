import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { saveAuthData } from "../src/api/authStorage";
import { useLoginWithDni, useLoginWithUsername } from "../src/api/hooks/useAuth";

type LoginMode = "password" | "dni";

export default function LoginScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("password");

  // Modo usuario + contraseña
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("123456");

  // Modo DNI
  const [dni, setDni] = useState("12345678");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginUserPass = useLoginWithUsername();
  const loginDni = useLoginWithDni();

  const handleLogin = async () => {
    setErrorMsg(null);

    try {
      if (mode === "password") {
        const data = await loginUserPass.mutateAsync({ username, password });

        await saveAuthData({
          token: data.token,
          username: data.username,
          dni: data.dni,
          role: data.role,
        });
      } else {
        const data = await loginDni.mutateAsync({ dni });

        await saveAuthData({
          token: data.token,
          username: data.username,
          dni: data.dni,
          role: data.role,
        });
      }

      // Navega al home de la app móvil
      router.replace("/" as any);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Error al iniciar sesión");
    }
  };

  const isLoading = loginUserPass.isPending || loginDni.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        {/* HEADER */}
        <View className="header" style={styles.header}>
          <Ionicons name="warning-outline" size={40} color="#facc15" />
          <Text style={styles.title}>Alerty</Text>
          <Text style={styles.subtitle}>
            Ingresa para ver el panel de alertas de montacargas.
          </Text>
        </View>

        {/* SWITCH DE MODO */}
        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            style={[
              styles.modePill,
              mode === "password" && styles.modePillActive,
            ]}
            activeOpacity={0.9}
            onPress={() => setMode("password")}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={mode === "password" ? "#020617" : "#9ca3af"}
            />
            <Text
              style={[
                styles.modePillText,
                mode === "password" && styles.modePillTextActive,
              ]}
            >
              Usuario y contraseña
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modePill, mode === "dni" && styles.modePillActive]}
            activeOpacity={0.9}
            onPress={() => setMode("dni")}
          >
            <Ionicons
              name="id-card-outline"
              size={16}
              color={mode === "dni" ? "#020617" : "#9ca3af"}
            />
            <Text
              style={[
                styles.modePillText,
                mode === "dni" && styles.modePillTextActive,
              ]}
            >
              Solo DNI
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          {mode === "password" ? (
            <>
              <Text style={styles.label}>Usuario o correo</Text>
              <TextInput
                style={styles.input}
                placeholder="usuario@empresa.com"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>
                Contraseña
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>DNI</Text>
              <TextInput
                style={styles.input}
                placeholder="12345678"
                placeholderTextColor="#6b7280"
                value={dni}
                onChangeText={setDni}
                keyboardType="number-pad"
                maxLength={8}
              />
              <Text style={styles.helperSmall}>
                Inicia sesión solo con tu DNI asignado en el sistema.
              </Text>
            </>
          )}

          {errorMsg && (
            <Text style={{ marginTop: 8, fontSize: 12, color: "#fca5a5" }}>
              {errorMsg}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
            activeOpacity={0.9}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Ionicons name="log-in-outline" size={18} color="#0b1120" />
            <Text style={styles.loginButtonText}>
              {isLoading ? "Ingresando..." : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            (Este login ya llama al backend y guarda el token en el dispositivo.)
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ⬇️ estilos igual que tenías
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#020617",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  modeSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 2,
    marginTop: 4,
    marginBottom: 10,
  },
  modePill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 6,
  },
  modePillActive: {
    backgroundColor: "#facc15",
  },
  modePillText: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  modePillTextActive: {
    color: "#020617",
    fontWeight: "700",
  },
  form: {
    marginTop: 4,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: "#e5e7eb",
    fontSize: 13,
  },
  loginButton: {
    marginTop: 18,
    backgroundColor: "#facc15",
    borderRadius: 999,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
  },
  loginButtonText: {
    color: "#0b1120",
    fontSize: 14,
    fontWeight: "700",
  },
  helperText: {
    marginTop: 10,
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },
  helperSmall: {
    marginTop: 6,
    fontSize: 11,
    color: "#6b7280",
  },
});
