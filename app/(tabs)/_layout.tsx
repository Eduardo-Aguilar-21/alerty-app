// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { getValidToken } from "../../src/api/authStorage";

export default function RootLayout() {
  // Un solo QueryClient para toda la app
  const [queryClient] = useState(() => new QueryClient());

  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getValidToken();

      if (!token) {
        // Sin token o token vencido → limpiar sesión ya lo hace getValidToken
        // y mandamos al login
        router.replace("/login");
        return;
      }

      // Token OK → podemos mostrar las tabs
      setCheckingAuth(false);
    };

    void checkAuth();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {checkingAuth ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#020617",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color="#6366f1" />
          <Text
            style={{
              marginTop: 8,
              color: "#e5e7eb",
              fontSize: 14,
            }}
          >
            Verificando sesión…
          </Text>
        </View>
      ) : (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#eab308",
            tabBarInactiveTintColor: "#9ca3af",
            tabBarStyle: {
              backgroundColor: "#020617",
              borderTopColor: "#111827",
            },
          }}
        >
          {/* Home = app/(tabs)/index.tsx */}
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Historial = app/(tabs)/history.tsx */}
          <Tabs.Screen
            name="history"
            options={{
              title: "Historial",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Config = app/(tabs)/config.tsx */}
          <Tabs.Screen
            name="config"
            options={{
              title: "Config",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Detalle de alerta (sin tab en la barra) = app/(tabs)/alert/[id].tsx */}
          <Tabs.Screen
            name="alert/[id]"
            options={{
              href: null,
            }}
          />
        </Tabs>
      )}
    </QueryClientProvider>
  );
}
