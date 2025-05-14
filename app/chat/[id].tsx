import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useChatStore } from "@/store/chat-store.ts";
import { formatTimeAgo } from "@/utils/time-format.ts";
import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getChat, sendMessage, markChatAsRead } = useChatStore();
  const { currentUser } = useAuthStore();
  const { colors } = useColorScheme();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const chatId = Array.isArray(id) ? id[0] : id;
  const chat = getChat(chatId);

  useEffect(() => {
    if (chat) {
      markChatAsRead(chatId);
    }
  }, [chatId]);

  if (!chat || !currentUser) {
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

  const otherUser = chat.participants.find((p) => p.id !== currentUser.id);

  const handleSend = () => {
    if (message.trim() === "") return;

    sendMessage(chatId, message);
    setMessage("");

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
        <FlatList
          ref={flatListRef}
          data={chat.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isCurrentUser = item.senderId === currentUser.id;

            return (
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser
                    ? styles.currentUserMessage
                    : styles.otherUserMessage,
                ]}
              >
                {!isCurrentUser && (
                  <Image
                    source={{ uri: otherUser?.avatar }}
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
                    style={[
                      styles.messageText,
                      { color: isCurrentUser ? "#fff" : colors.text },
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      {
                        color: isCurrentUser
                          ? "rgba(255,255,255,0.7)"
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {formatTimeAgo(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

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
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim()
                  ? colors.primary
                  : "#cccccc",
              },
            ]}
            onPress={handleSend}
            disabled={message.trim() === ""}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
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
});
