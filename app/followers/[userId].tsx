import { AppHeader } from "@/components/AppHeader.tsx";
import { AppListItem } from "@/components/AppListItem.tsx";
import { FullScreenStatusView } from "@/components/FullScreenStatusView.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useFollowsStore } from "@/store/follows-store.ts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  role: "user" | "business";
}

export default function FollowersScreen() {
  const { userId } = useLocalSearchParams();
  const { colors } = useColorScheme();
  const {
    fetchFollowersOfUser,
    isLoading,
    followUser,
    unfollowUser,
    isFollowing,
  } = useFollowsStore();
  const { currentUser } = useAuthStore();

  const [followers, setFollowers] = useState<User[]>([]);
  const [isActionLoading, setIsActionLoading] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const loadFollowers = async () => {
      if (!userId) return;
      try {
        const data = await fetchFollowersOfUser(userId as string);
        setFollowers(data);
      } catch (error) {
        console.error("Error loading followers:", error);
      }
    };
    loadFollowers();
  }, [userId]);

  const handleFollowAction = async (user: User) => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (user.id === currentUser.id) return;
    setIsActionLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      if (isFollowing(user.id)) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    } finally {
      setIsActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const navigateToProfile = (userId: string) => {
    router.push({ pathname: "/profile/[userId]", params: { userId } });
  };

  const renderFollowerItem = ({ item }: { item: User }) => {
    const isCurrentUser = currentUser?.id === item.id;
    const isFollowingUser = isFollowing(item.id);
    const actionLoading = isActionLoading[item.id] || false;
    return (
      <AppListItem
        leadingElement={
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
        }
        title={
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {item.username}
            {item.verified && " ✓"}
          </Text>
        }
        subtitle={
          <Text style={{ color: colors.textSecondary }}>
            {item.displayName}
          </Text>
        }
        trailingElement={
          !isCurrentUser &&
          currentUser && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 5,
                minWidth: 90,
                justifyContent: "center",
                backgroundColor: isFollowingUser
                  ? "transparent"
                  : colors.primary,
                borderWidth: isFollowingUser ? 1 : 0,
                borderColor: isFollowingUser ? colors.border : undefined,
              }}
              onPress={() => handleFollowAction(item)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowingUser ? colors.primary : "#fff"}
                />
              ) : (
                <>
                  {isFollowingUser && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.primary}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={{
                      color: isFollowingUser ? colors.primary : "#fff",
                      fontWeight: "500",
                      fontSize: 14,
                    }}
                  >
                    {isFollowingUser ? "Siguiendo" : "Seguir"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )
        }
        onPress={() => navigateToProfile(item.id)}
        containerStyle={{ marginBottom: 8 }}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        title="Seguidores"
        leftAccessory={
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingHorizontal: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <FullScreenStatusView
          status="loading"
          message="Cargando seguidores..."
        />
      ) : followers.length === 0 ? (
        <FullScreenStatusView
          status="empty"
          message="No hay seguidores todavía"
          emptyIconName="User"
        />
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderFollowerItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
