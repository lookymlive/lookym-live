import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { formatTimeAgo } from "@/utils/time-format";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bell, Check, Heart, MessageCircle, User } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const { colors } = useColorScheme();
  const { currentUser } = useAuthStore();
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotificationsStore();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Actividad</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.message, { color: colors.text }]}>
            Inicia sesión para ver tu actividad
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={[styles.loginButtonText, { color: colors.text }]}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_follower":
        return <User size={20} color={colors.primary} />;
      case "video_like":
        return <Heart size={20} color={colors.error} />;
      case "new_comment":
        return <MessageCircle size={20} color={colors.success} />;
      case "new_message":
        return <MessageCircle size={20} color={colors.primary} />;
      default:
        return <Bell size={20} color={colors.text} />;
    }
  };

  const handleNotificationPress = (notification: any) => {
    // Marcar como leída
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navegar según el tipo de notificación
    switch (notification.relatedEntityType) {
      case "user":
        router.push(`/profile/${notification.relatedEntityId}`);
        break;
      case "video":
        router.push(`/video/${notification.relatedEntityId}`);
        break;
      case "message":
        if (notification.originUserId) {
          router.push(`/chat/${notification.originUserId}`);
        }
        break;
      default:
        // No hacer nada si no hay entidad relacionada
        break;
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? colors.background : colors.card },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          {item.originUser && (
            <Image
              source={{ uri: item.originUser.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
          <Text
            style={[
              styles.notificationText,
              { color: colors.text },
              !item.read && styles.unreadText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {formatTimeAgo(new Date(item.createdAt).getTime())}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Actividad</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { borderColor: colors.border }]}
            onPress={markAllAsRead}
          >
            <Check size={16} color={colors.primary} />
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Marcar todo como leído
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Bell size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes notificaciones
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchNotifications}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  list: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
  },
  unreadText: {
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
