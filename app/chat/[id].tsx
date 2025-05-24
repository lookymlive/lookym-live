import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
import { supabase } from "@/utils/supabase.ts";
import { formatMessageTimestamp } from "@/utils/time-format.ts";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define Message type again for clarity in this file, or import from types/index.ts
interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: {
    // Joined user data
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ChatParticipant {
  user_id: string;
  chat_id: string;
  users: {
    // Joined user data
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface Chat {
  id: string;
  created_at: string;
  participants?: ChatParticipant[];
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const {
    sendMessage,
    markMessagesAsRead,
    messages,
    isLoading,
    error,
    fetchMessages,
    setActiveChat,
    chats,
  } = useChatStore();
  const { currentUser } = useAuthStore();
  const { colors } = useColorScheme();
  const [newMessageText, setNewMessageText] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  const chatId = Array.isArray(id) ? id[0] : id;
  const chat = chats.find((c) => c.id === chatId);

  useEffect(() => {
    if (!chatId) return;

    setActiveChat(chatId);
    fetchMessages(chatId);

    if (currentUser?.id) {
      markMessagesAsRead(chatId);
    }

    const subscription = supabase
      .channel(`chat_messages_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log("New message received:", payload.new);
          const newMessage = payload.new as Message;
          // Check if the message is not already in the state (handle potential duplicates from initial fetch)
          if (!messages.some((msg) => msg.id === newMessage.id)) {
            // We need user data for the message. Supabase subscription payload only includes the inserted row.
            // A common pattern is to fetch the full message data with user join after receiving the insert event.
            // For simplicity here, we'll assume the payload might contain basic user_id and add a TODO.
            // A more robust approach would be an RPC or a separate select query for the new message ID.

            // OPTION 1: Basic append (user data might be missing)
            // set(state => ({ messages: [...state.messages, newMessage] }));

            // OPTION 2: Fetch full message data (more reliable)
            supabase
              .from("messages")
              .select("*, users(*)")
              .eq("id", newMessage.id)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error("Error fetching new message details:", error);
                } else if (data) {
                  useChatStore.setState((state) => ({
                    messages: [...state.messages, data as Message].sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    ),
                  }));
                  // Mark the newly added message as read immediately if it's not from the current user
                  if (data.user_id !== currentUser?.id) {
                    markMessagesAsRead(chatId, [data.id]);
                  }
                }
              });
          }
        }
      )
      .subscribe();

    // TODO: Implement mechanism to mark messages as read when user views them
    // This is partially handled above on new message insert, but could be more robust
    // if the user scrolls to view older unread messages.

    return () => {
      // Clean up subscription and active chat state
      supabase.removeChannel(subscription);
      setActiveChat(null);
      // Optionally clear messages when leaving a chat
      useChatStore.setState({ messages: [] });
    };
  }, [chatId, currentUser, setActiveChat, fetchMessages, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (!chatId) {
      console.error("[Chat] chatId is undefined, cannot send message");
      return;
    }
    if (!currentUser?.id) {
      console.error("[Chat] currentUser.id is undefined, cannot send message");
      return;
    }
    if (newMessageText.trim() === "") {
      console.warn("[Chat] Message content is empty, not sending");
      return;
    }

    // Optimistically add the message to the UI before the API call completes
    const optimisticMessage: Message = {
      id: Math.random().toString(),
      chat_id: chatId,
      user_id: currentUser.id,
      content: newMessageText.trim(),
      created_at: new Date().toISOString(),
      users: {
        id: currentUser.id,
        username: currentUser.username,
        avatar_url: currentUser.avatar || null,
      },
    };

    useChatStore.setState((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));
    setNewMessageText("");

    // Log data before sending
    console.log("[Chat] Sending message:", {
      chatId,
      userId: currentUser.id,
      content: optimisticMessage.content,
    });

    await sendMessage(chatId, optimisticMessage.content);
  };

  // Find the other user for the chat header
  const otherUser = chat?.participants?.find(
    (p) => p.users.id !== currentUser?.id
  )?.users;

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading messages: {error}</Text>
      </View>
    );
  }

  // Add a check for chat existence if not loading and no error
  if (!chat && !isLoading && !error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Chat",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>
            Chat not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: otherUser?.username || "Chat",
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.card },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {messages.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text>No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              const isCurrentUser = item.user_id === currentUser?.id;

              return (
                <View
                  style={[
                    styles.messageContainer,
                    isCurrentUser
                      ? styles.currentUserMessage
                      : styles.otherUserMessage,
                  ]}
                >
                  {!isCurrentUser && otherUser?.avatar_url && (
                    <Image
                      source={{ uri: otherUser.avatar_url }}
                      style={styles.messageAvatar}
                      contentFit="cover"
                    />
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isCurrentUser
                        ? [
                            styles.currentUserBubble,
                            { backgroundColor: colors.primary },
                          ]
                        : [
                            styles.otherUserBubble,
                            { backgroundColor: colors.card },
                          ],
                    ]}
                  >
                    <Text
                      style={[{ color: isCurrentUser ? "#fff" : colors.text }]}
                    >
                      {item.users?.username ||
                        otherUser?.username ||
                        "Unknown User"}
                    </Text>
                    <Text
                      style={[{ color: isCurrentUser ? "#fff" : colors.text }]}
                    >
                      {item.content}
                    </Text>
                    {item.created_at && (
                      <Text
                        style={[
                          {
                            color: isCurrentUser
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(0,0,0,0.5)",
                          },
                        ]}
                      >
                        {formatMessageTimestamp(item.created_at)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={newMessageText}
            onChangeText={setNewMessageText}
            multiline
            editable={!isLoading}
          />
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: newMessageText.trim()
                  ? colors.primary
                  : "#cccccc",
              },
              isLoading && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={isLoading || newMessageText.trim() === ""}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 8,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
