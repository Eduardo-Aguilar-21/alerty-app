// app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useState } from "react";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Login pantalla completa, sin tabs */}
        <Stack.Screen
          name="login"
          options={{
            presentation: "fullScreenModal",
          }}
        />

        {/* Grupo de tabs (home, history, config) */}
        <Stack.Screen name="(tabs)" />

        {/* Detalle de alerta, encima de las tabs */}
        <Stack.Screen name="alert/[id]" />
      </Stack>
    </QueryClientProvider>
  );
}
