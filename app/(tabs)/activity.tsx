import { AppHeader } from "@/components/AppHeader.tsx";
import { AppListItem } from "@/components/AppListItem.tsx";
import { FullScreenStatusView } from "@/components/FullScreenStatusView.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useNotificationsStore } from "@/store/notifications-store.ts";
import { formatTimeAgo } from "@/utils/time-format.ts";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
    console.log("Current user in ActivityScreen:", currentUser);
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <AppHeader title="Actividad" />
        <FullScreenStatusView
          status="loginRequired"
          message="Inicia sesión para ver tu actividad"
          onLogin={() => router.push("/auth/login")}
        />
      </SafeAreaView>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_follower":
        return <Ionicons name="person" size={20} color={colors.primary} />;
      case "video_like":
        return <Ionicons name="heart" size={20} color={colors.error} />;
      case "new_comment":
        return <Ionicons name="chatbubbles" size={20} color={colors.success} />;
      case "new_message":
        return <Ionicons name="chatbubbles" size={20} color={colors.primary} />;
      default:
        return <Ionicons name="notifications" size={20} color={colors.text} />;
    }
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
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
        break;
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <AppListItem
      leadingElement={
        item.originUser && item.originUser.avatar ? (
          <Image
            source={{ uri: item.originUser.avatar }}
            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.card,
              marginRight: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={20} color={colors.textSecondary} />
          </View>
        )
      }
      title={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {getNotificationIcon(item.type)}
          <View style={{ width: 6 }} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontWeight: item.read ? "400" : "600",
              }}
              numberOfLines={2}
            >
              {item.content}
            </Text>
          </View>
        </View>
      }
      subtitle={formatTimeAgo(new Date(item.createdAt).getTime())}
      highlightUnread={!item.read}
      onPress={() => handleNotificationPress(item)}
      containerStyle={{
        backgroundColor: item.read ? colors.background : colors.card,
      }}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        title="Actividad"
        rightAccessory={
          unreadCount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.primary}
              />
              <Text
                style={{
                  color: colors.primary,
                  marginLeft: 4,
                  fontWeight: "500",
                }}
                onPress={markAllAsRead}
              >
                Marcar todo como leído
              </Text>
            </View>
          ) : undefined
        }
      />
      {isLoading ? (
        <FullScreenStatusView
          status="loading"
          message="Cargando notificaciones..."
        />
      ) : notifications.length === 0 ? (
        <FullScreenStatusView
          status="empty"
          message="No tienes notificaciones"
          emptyIconName="Bell"
        />
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
  list: {
    padding: 12,
    paddingBottom: 32,
  },
});
