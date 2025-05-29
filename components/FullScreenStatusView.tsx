import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export type StatusType = "loading" | "empty" | "error" | "loginRequired";

// Mapeo de nombres de iconos de lucide-react-native a Ionicons
const iconMap: Record<string, string> = {
  Info: "information-circle-outline",
  AlertTriangle: "warning-outline",
  User: "person-outline",
  Bell: "notifications-outline",
  Search: "search-outline",
};

export interface FullScreenStatusViewProps {
  status: StatusType;
  message?: string;
  emptyIconName?: keyof typeof LucideIcons;
  onRetry?: () => void;
  onLogin?: () => void;
  style?: ViewStyle;
}

export const FullScreenStatusView: React.FC<FullScreenStatusViewProps> = ({
  status,
  message,
  emptyIconName = "Info",
  onRetry,
  onLogin,
  style,
}) => {
  let content = null;
  if (status === "loading") {
    content = <ActivityIndicator size="large" color="#6366F1" />;
  } else if (status === "empty") {
    const iconName = iconMap[emptyIconName] || iconMap.Info;
    content = (
      <Ionicons
        name={iconName as any}
        size={48}
        color="#94A3B8"
        style={{ marginBottom: 12 }}
      />
    );
  } else if (status === "error") {
    const iconName = iconMap.AlertTriangle;
    content = (
      <Ionicons
        name={iconName as any}
        size={48}
        color="#F59E42"
        style={{ marginBottom: 12 }}
      />
    );
  } else if (status === "loginRequired") {
    const iconName = iconMap.User;
    content = (
      <Ionicons
        name={iconName as any}
        size={48}
        color="#6366F1"
        style={{ marginBottom: 12 }}
      />
    );
  }
  return (
    <View style={[styles.center, style]}>
      {content}
      {message && <Text style={styles.message}>{message}</Text>}
      {status === "error" && onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      )}
      {status === "loginRequired" && onLogin && (
        <Pressable style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  message: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

/**
 * Example usage:
 * <FullScreenStatusView status="loading" message="Cargando..." />
 * <FullScreenStatusView status="empty" message="No hay resultados" emptyIconName="Search" />
 * <FullScreenStatusView status="error" message="Ocurrió un error" onRetry={reload} />
 * <FullScreenStatusView status="loginRequired" message="Inicia sesión para continuar" onLogin={goToLogin} />
 */
