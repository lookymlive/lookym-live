<<<<<<< Updated upstream
import { useColorScheme } from "@/hooks/useColorScheme.ts";
=======
import { FullScreenStatusView } from "@/components/FullScreenStatusView";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
>>>>>>> Stashed changes
import { supabase } from "@/utils/supabase.ts";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
<<<<<<< Updated upstream
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
=======
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
>>>>>>> Stashed changes

export default function ChatScreen() {
  const { userId } = useLocalSearchParams();
  const { colors } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [recipientUser, setRecipientUser] = useState<{
    username: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("username, avatar_url")
          .eq("id", userId)
          .single();

<<<<<<< Updated upstream
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
=======
        if (fetchError) throw fetchError;
        if (data) {
          setRecipientUser(data);
        } else {
          throw new Error("Recipient user not found.");
        }
      } catch (e: any) {
        console.error("Error fetching recipient user data:", e);
        setError(e.message || "Failed to fetch recipient details.");
      }
    };

    fetchRecipientData();
  }, [recipientUserId]);

  useEffect(() => {
    if (!currentUser || !recipientUserId || !recipientUser) {
      if (recipientUserId && !recipientUser && !error) {
        setIsResolvingChat(true);
      } else if (error) {
        setIsResolvingChat(false);
      }
      return;
    }

    if (currentUser.id === recipientUserId) {
      // No navigation if self-chat
      setError("No puedes iniciar un chat contigo mismo.");
      setIsResolvingChat(false);
      return;
    }

    const resolveChat = async () => {
      setIsResolvingChat(true);
      setError(null);
      try {
        let chatId = await findChatByParticipant(recipientUserId);

        if (chatId) {
          router.replace({
            pathname: "/chat/[id]",
            params: { id: chatId },
          });
        } else {
          const newChatId = await createChatWithUser(recipientUserId);
          if (newChatId) {
            router.replace({
              pathname: "/chat/[id]",
              params: { id: newChatId },
            });
          } else {
            throw new Error("Failed to create or find chat.");
          }
        }
      } catch (e: any) {
        console.error("Error resolving chat:", e);
        setError(
          e.message || "Could not initiate chat. Please try again later."
        );
        setIsResolvingChat(false);
      }
    };

    resolveChat();
  }, [
    currentUser,
    recipientUserId,
    recipientUser,
    findChatByParticipant,
    createChatWithUser,
    error,
  ]);
>>>>>>> Stashed changes

  const navigateBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chat</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
<<<<<<< Updated upstream
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
=======
      <Stack.Screen
        options={{
          headerShown: true,
          title: recipientUser?.username || "Chat",
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.card },
          headerLeft: () => (
            <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.contentContainer}>
        {isResolvingChat && (
          <FullScreenStatusView
            status="loading"
            message={`Iniciando chat con ${recipientUser?.username || "usuario"}...`}
            style={{ backgroundColor: "transparent" }}
          />
        )}
        {error && !isResolvingChat && (
          <FullScreenStatusView
            status={error.includes("contigo mismo") ? "error" : "error"}
            message={error}
            onRetry={navigateBack}
            style={{ backgroundColor: "transparent" }}
          />
        )}
>>>>>>> Stashed changes
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
<<<<<<< Updated upstream
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
=======
  backButton: {
    paddingHorizontal: 8,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
=======
>>>>>>> Stashed changes
});
