import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { supabase } from "@/utils/supabase.ts";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
<<<<<<< Updated upstream
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ResolveChatScreen() {
  const { userId: recipientUserIdParam } = useLocalSearchParams();
  const { colors } = useColorScheme();
  const { currentUser } = useAuthStore();
  const { findChatByParticipant, createChatWithUser } = useChatStore();

  const [isResolvingChat, setIsResolvingChat] = useState(true);
  const [recipientUser, setRecipientUser] = useState<{
    username: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipientUserId = Array.isArray(recipientUserIdParam)
    ? recipientUserIdParam[0]
    : recipientUserIdParam;

  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!recipientUserId) {
        setError("Recipient user ID is missing.");
        setIsResolvingChat(false);
        return;
      }
      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("username")
          .eq("id", recipientUserId)
          .single();

        if (error) throw error;

        setRecipientUser({
          username: data.username,
          avatar: data.avatar_url,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const navigateBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {recipientUser?.username || "Chat"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          La funcionalidad de chat será implementada próximamente
        </Text>
      </View>
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
    paddingHorizontal: 8, // Make it easier to tap
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
=======
>>>>>>> Stashed changes
});
