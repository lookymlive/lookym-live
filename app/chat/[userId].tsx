import { FullScreenStatusView } from "@/components/FullScreenStatusView";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
import { supabase } from "@/utils/supabase.ts";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";

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

        if (fetchError) throw fetchError;
        if (data) {
          setRecipientUser(data);
        } else {
          throw new Error("Recipient user not found.");
        }
      } catch (e: any) {
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

  const navigateBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
            status="error"
            message={error}
            onRetry={navigateBack}
            style={{ backgroundColor: "transparent" }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
