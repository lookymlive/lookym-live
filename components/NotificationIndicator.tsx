import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useNotificationsStore } from "@/store/notifications-store.ts";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

interface NotificationIndicatorProps {
  size?: "small" | "medium" | "large";
}

export default function NotificationIndicator({
  size = "small",
}: NotificationIndicatorProps) {
  const { colors } = useColorScheme();
  const { unreadCount, fetchNotifications, isInitialized } =
    useNotificationsStore();

  // Cargar notificaciones si no se han inicializado
  useEffect(() => {
    if (!isInitialized) {
      fetchNotifications();
    }
  }, [isInitialized]);

  if (unreadCount === 0) return null;

  // Determinar tamaño del indicador
  const getSize = () => {
    switch (size) {
      case "large":
        return 24;
      case "medium":
        return 20;
      case "small":
      default:
        return 16;
    }
  };

  // Determinar tamaño del texto
  const getTextSize = () => {
    switch (size) {
      case "large":
        return 14;
      case "medium":
        return 12;
      case "small":
      default:
        return 10;
    }
  };

  const indicatorSize = getSize();
  const textSize = getTextSize();
  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <View
      style={[
        styles.container,
        {
          width: indicatorSize,
          height: indicatorSize,
          borderRadius: indicatorSize / 2,
          backgroundColor: colors.error,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: "#FFFFFF",
            fontSize: textSize,
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -5,
    right: -5,
  },
  text: {
    fontWeight: "bold",
  },
});
