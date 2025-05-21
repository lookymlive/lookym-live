import { useAuthStore } from "@/store/auth-store"; // Needed to check for authenticated user
import { useChatStore } from "@/store/chat-store";
import { formatMessageTimestamp } from "@/utils/time-format"; // Import the time formatting utility
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ChatListScreen() {
  const { chats, isLoading, error, fetchChats } = useChatStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    // Fetch chats when the component mounts or when the current user changes
    if (currentUser) {
      fetchChats();
    }
  }, [fetchChats, currentUser]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading chats: {error}</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Please log in to view your chats.</Text>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No chats yet.</Text>
      </View>
    );
  }

  // Helper to get participant names for display (excluding current user)
  const getParticipantNames = (chat: any) => {
    if (!chat.participants) return "No Participants";
    const otherParticipants = chat.participants.filter(
      (p: any) => p.users.id !== currentUser?.id
    );
    return (
      otherParticipants.map((p: any) => p.users.username).join(", ") ||
      "Just Me"
    );
  };

  // Helper to get the other participant's avatar URL
  const getOtherParticipantAvatar = (chat: any) => {
    if (!chat.participants || !currentUser) return null;
    const otherParticipant = chat.participants.find(
      (p: any) => p.users.id !== currentUser.id
    );
    return otherParticipant?.users?.avatar_url || null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            {/* Participant Avatar */}
            <Image
              source={{
                uri:
                  getOtherParticipantAvatar(item) ||
                  "https://via.placeholder.com/50",
              }}
              style={styles.chatAvatar}
            />
            <View style={styles.chatDetails}>
              <Text style={styles.chatParticipants}>
                {getParticipantNames(item)}
              </Text>
              {item.last_message && (
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.last_message.content}
                </Text>
              )}
            </View>
            {/* Timestamp and Unread Indicator */}
            <View style={styles.timestampAndIndicatorContainer}>
              {item.last_message && (
                <Text style={styles.timestampText}>
                  {/* Use the imported formatMessageTimestamp utility */}
                  {formatMessageTimestamp(item.last_message.created_at)}
                </Text>
              )}
              {/* Placeholder for unread indicator - logic to be implemented later */}
              {/* TODO: Implement logic to show/hide this indicator based on actual unread status */}
              <View style={styles.unreadIndicatorPlaceholder} />
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
    marginLeft: 0, // Remove the previous left margin since we have an avatar now
  },
  chatParticipants: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#555",
  },
  timestampAndIndicatorContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4, // Space between timestamp and indicator
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 16,
  },
  unreadIndicatorPlaceholder: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "blue", // Placeholder color
    // TODO: Implement logic to show/hide this indicator based on actual unread status
  },
});
