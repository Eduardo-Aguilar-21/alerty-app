// app/index.tsx
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";
import {
  getNotificationsAllowed,
  getSoundAllowed,
} from "../../src/state/notificationPrefs";

// Handler global para cómo se muestran las notificaciones
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
      // 👀 Aquí ya NO pedimos permisos. Eso lo hace Config.
    };

    setupNotifications();
  }, []);

  const handleShowNotification = async () => {
    const notificationsOn = getNotificationsAllowed();

    if (!notificationsOn) {
      Alert.alert(
        "Notificaciones desactivadas",
        "Activa las notificaciones en Configuración para recibir alertas."
      );
      return;
    }

    const soundOn = getSoundAllowed();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alerta de prueba ⚠️",
        body: "Esta es una notificación local de Alerty.",
        data: { demo: true },
        sound: soundOn ? "default" : false,
      },
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
