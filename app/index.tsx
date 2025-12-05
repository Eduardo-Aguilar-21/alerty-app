// app/index.tsx
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

// Para que las notificaciones se muestren en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  useEffect(() => {
    const setupNotifications = async () => {
      // Android: canal de notificación
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      // Pedir permisos
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permisos de notificación NO concedidos");
      }
    };

    setupNotifications();
  }, []);

  const handleShowNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de prueba ⚠️",
        body: "Esta es una notificación local de Alerty.",
        data: { demo: true },
      },
      // trigger null = dispara inmediatamente
      trigger: null,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerty - Demo de notificación</Text>

      <View style={styles.buttonWrapper}>
        <Button title="Mostrar notificación" onPress={handleShowNotification} />
      </View>

      <Text style={styles.helperText}>
        Pulsa el botón para disparar una notificación local de prueba.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonWrapper: {
    alignSelf: "stretch",
    marginHorizontal: 32,
  },
  helperText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
});
