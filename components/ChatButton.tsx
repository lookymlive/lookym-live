import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface ChatButtonProps {
  onStartChat: () => Promise<void>;
  label?: string;
}

export default function ChatButton({
  onStartChat,
  label = "Chat",
}: ChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setLoading(true);
    setError(null);
    try {
      await onStartChat();
    } catch (e) {
      setError("Error al iniciar chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Iniciar chat"
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{label}</Text>
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
    backgroundColor: "#5E60CE",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
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
