import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface FollowButtonProps {
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
}

export default function FollowButton({
  isFollowing,
  onFollow,
  onUnfollow,
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isFollowing) {
        await onUnfollow();
      } else {
        await onFollow();
      }
    } catch (e) {
      setError("Error al actualizar seguimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? "Dejar de seguir" : "Seguir"}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{isFollowing ? "Siguiendo" : "Seguir"}</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  following: {
    backgroundColor: "#5E60CE",
  },
  notFollowing: {
    backgroundColor: "#222",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  error: {
    color: "#ff3333",
    fontSize: 12,
    marginTop: 4,
  },
});
