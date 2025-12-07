// app/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import React, { useState } from "react";

export default function RootLayout() {
  // Crear un solo QueryClient para toda la app
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
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
        {/* Home = app/index.tsx */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Historial = app/history.tsx */}
        <Tabs.Screen
          name="history"
          options={{
            title: "Historial",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Config = app/config.tsx */}
        <Tabs.Screen
          name="config"
          options={{
            title: "Config",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="alert/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}
