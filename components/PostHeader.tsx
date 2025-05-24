import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { PostUser } from "@/types/post.ts";
import { BadgeCheck, MoreHorizontal } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PostHeaderProps {
  user: PostUser;
  location?: string;
}

export default function PostHeader({ user, location }: PostHeaderProps) {
  const { colors } = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.userContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.usernameContainer}>
            <Text style={[styles.username, { color: colors.text }]}>
              {user.username}
            </Text>
            {user.verified && (
              <BadgeCheck
                size={16}
                color={colors.primary}
                style={styles.verifiedBadge}
              />
            )}
          </View>
          {location && (
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              {location}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <MoreHorizontal size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#5E60CE",
  },
  userInfo: {
    justifyContent: "center",
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  location: {
    fontSize: 13,
    marginTop: 2,
  },
});
