import React from "react";
import {
  Image,
  ImageStyle,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface UserInfoProps {
  avatarUrl?: string;
  avatarInitial?: string;
  name: string;
  secondaryText?: string;
  avatarSize?: number;
  onPress?: () => void;
  nameStyle?: TextStyle;
  secondaryTextStyle?: TextStyle;
  containerStyle?: ViewStyle;
  showRole?: boolean;
  role?: "user" | "business";
}

export const UserInfo: React.FC<UserInfoProps> = ({
  avatarUrl,
  avatarInitial,
  name,
  secondaryText,
  avatarSize = 40,
  onPress,
  nameStyle,
  secondaryTextStyle,
  containerStyle,
  showRole,
  role,
}) => {
  const avatarImageStyles: ImageStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  };
  const avatarViewStyles: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <Pressable
      style={[styles.container, containerStyle]}
      onPress={onPress}
      disabled={!onPress}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={avatarImageStyles} />
      ) : (
        <View style={avatarViewStyles}>
          <Text style={styles.avatarInitial}>
            {avatarInitial || name.charAt(0)}
          </Text>
        </View>
      )}
      <View>
        <Text style={[styles.name, nameStyle]} numberOfLines={1}>
          {name}
        </Text>
        {secondaryText ? (
          <Text
            style={[styles.secondary, secondaryTextStyle]}
            numberOfLines={1}
          >
            {secondaryText}
          </Text>
        ) : null}
        {showRole && role ? (
          <Text style={styles.role}>
            {role === "business" ? "Negocio" : "Usuario"}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontWeight: "700",
    fontSize: 17,
    color: "#18181B",
    letterSpacing: 0.2,
  },
  secondary: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  avatarInitial: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#6366F1",
    textAlign: "center",
  },
  role: {
    fontSize: 13,
    color: "#22D3EE",
    fontWeight: "700",
    marginTop: 2,
  },
});

/**
 * Example usage:
 * <UserInfo
 *   avatarUrl={user.avatar}
 *   name={user.username}
 *   secondaryText={user.location}
 *   onPress={() => navigateToProfile(user.id)}
 *   showRole
 *   role={user.role}
 * />
 */
