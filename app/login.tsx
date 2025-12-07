// app/login.tsx
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@alerty.com");
  const [password, setPassword] = useState("123456");

  const handleLogin = () => {
    // Más adelante aquí harás la llamada al API de auth y guardarás tokens.
    // Por ahora solo navegamos al home.
    router.replace("/" as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="warning-outline" size={40} color="#facc15" />
          <Text style={styles.title}>Alerty</Text>
          <Text style={styles.subtitle}>
            Ingresa para ver el panel de alertas de montacargas.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@empresa.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.9}
            onPress={handleLogin}
          >
            <Ionicons name="log-in-outline" size={18} color="#0b1120" />
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            (Por ahora este login es solo de prueba, no valida credenciales.)
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

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
    gap: 8,
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
});
