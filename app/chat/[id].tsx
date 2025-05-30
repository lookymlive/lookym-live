import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
import { supabase } from "@/utils/supabase.ts";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
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
import { Message } from "../../types/chat";
import { User } from "../../types/user";
import { formatTimeAgo } from "../../utils/time-format";

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

  // Obtener el otro usuario (no el actual) de los participantes
  const otherUser: User | undefined = chat?.participants.find(
    (u) => u.id !== currentUser?.id
  );

  useEffect(() => {
    if (!chatId) return;

    setActiveChat(chatId);
    fetchMessages(chatId);

    if (currentUser?.id) {
      markMessagesAsRead(chatId);
    }

    let subscription: any = null;
    if (Platform.OS !== "web") {
      subscription = supabase
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
                        (a, b) => a.timestamp - b.timestamp
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
    }

    return () => {
      if (Platform.OS !== "web" && subscription) {
        supabase.removeChannel(subscription);
      }
      setActiveChat(null);
      // Optionally clear messages when leaving a chat
      useChatStore.setState({ messages: [] });
    };
  }, [chatId, currentUser, setActiveChat, fetchMessages, markMessagesAsRead]);

  // Enviar mensaje optimista
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
    const optimisticMessage: Message = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      text: newMessageText.trim(),
      timestamp: Date.now(),
      read: false,
    };
    useChatStore.setState((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));
    setNewMessageText("");
    await sendMessage(chatId, optimisticMessage.text);
  };

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
                <Ionicons name="arrow-back" size={24} color={colors.text} />
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
              <Ionicons name="arrow-back" size={24} color={colors.text} />
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
              const isCurrentUser = item.senderId === currentUser?.id;
              return (
                <View
                  style={[
                    styles.messageContainer,
                    isCurrentUser
                      ? styles.currentUserMessage
                      : styles.otherUserMessage,
                  ]}
                >
                  {!isCurrentUser && otherUser?.avatar && (
                    <Image
                      source={{ uri: otherUser.avatar }}
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
                      {isCurrentUser
                        ? currentUser?.username
                        : otherUser?.username || "Usuario"}
                    </Text>
                    <Text
                      style={[{ color: isCurrentUser ? "#fff" : colors.text }]}
                    >
                      {item.text}
                    </Text>
                    {item.timestamp && (
                      <Text
                        style={[
                          styles.messageTime,
                          { color: isCurrentUser ? "#fff" : colors.text },
                        ]}
                      >
                        {formatTimeAgo(item.timestamp)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.text + "99"}
            value={newMessageText}
            onChangeText={setNewMessageText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (pressed || newMessageText.trim() === "") &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={newMessageText.trim() === ""}
          >
            <Ionicons
              name="send"
              size={22}
              color={newMessageText.trim() === "" ? "#888" : colors.primary}
            />
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
