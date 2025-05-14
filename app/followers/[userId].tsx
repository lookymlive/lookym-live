import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useFollowsStore } from "@/store/follows-store.ts";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

    // No permitir seguirse a sí mismo
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
    // @ts-ignore - Dynamic routes in Expo Router
    router.push({ pathname: "/profile/[userId]", params: { userId } });
  };

  const renderFollowerItem = ({ item }: { item: User }) => {
    const isCurrentUser = currentUser?.id === item.id;
    const isFollowingUser = isFollowing(item.id);
    const actionLoading = isActionLoading[item.id] || false;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => navigateToProfile(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username}
            {item.verified && " ✓"}
          </Text>
          <Text style={[styles.displayName, { color: colors.textSecondary }]}>
            {item.displayName}
          </Text>
        </View>

        {!isCurrentUser && currentUser && (
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowingUser
                ? [styles.followingButton, { borderColor: colors.border }]
                : { backgroundColor: colors.primary },
            ]}
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
                  <Check
                    size={14}
                    color={colors.primary}
                    style={styles.checkIcon}
                  />
                )}
                <Text
                  style={[
                    styles.followButtonText,
                    { color: isFollowingUser ? colors.primary : "#fff" },
                  ]}
                >
                  {isFollowingUser ? "Siguiendo" : "Seguir"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Seguidores
        </Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay seguidores todavía
          </Text>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  displayName: {
    fontSize: 14,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
    minWidth: 90,
    justifyContent: "center",
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  checkIcon: {
    marginRight: 4,
  },
  followButtonText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
