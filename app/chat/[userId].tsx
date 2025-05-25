mport { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
import { supabase } from "@/utils/supabase.ts";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

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
        console.error("Error fetching recipient user data:", e);
        setError(e.message || "Failed to fetch recipient details.");
        // Keep loading true to prevent premature navigation attempts if recipient is crucial for header
      }
    };

    fetchRecipientData();
  }, [recipientUserId]);

  useEffect(() => {
    if (!currentUser || !recipientUserId || !recipientUser) {
      // Wait for currentUser, recipientUserId, and recipientUser to be available
      if (recipientUserId && !recipientUser && !error) { // Only set loading if recipient user is expected but not yet fetched
         setIsResolvingChat(true);
      } else if (error) { // If there was an error fetching recipient, stop resolving
         setIsResolvingChat(false);
      }
      return;
    }
    
    if (currentUser.id === recipientUserId) {
        Alert.alert("Error", "No puedes iniciar un chat contigo mismo.");
        router.back();
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
          // Attempt to create a new chat
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
        setIsResolvingChat(false); // Stop loading on error
      }
    };

    resolveChat();
  }, [
    currentUser,
    recipientUserId,
    recipientUser, // Added recipientUser as a dependency
    findChatByParticipant,
    createChatWithUser,
    error // Added error as dependency to prevent re-running resolveChat if recipient fetch failed
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
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Iniciando chat con {recipientUser?.username || "usuario"}...
            </Text>
          </>
        )}
        {error && !isResolvingChat && (
          <>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Error: {error}
            </Text>
            <TouchableOpacity
              onPress={navigateBack}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Volver
              </Text>
            </TouchableOpacity>
          </>
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
    paddingHorizontal: 8, // Make it easier to tap
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
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
});
