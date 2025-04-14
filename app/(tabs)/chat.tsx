import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatTimeAgo } from '@/utils/time-format';
import { router } from 'expo-router';

export default function ChatScreen() {
  const { chats, loadChats } = useChatStore();
  const { currentUser } = useAuthStore();
  const { isDark, colors } = useColorScheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      await loadChats();
      setLoading(false);
    };
    
    fetchChats();
  }, []);

  const navigateToChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (chats.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No messages yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Start a conversation with a business or user
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </View>
      
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = item.participants.find(p => p.id !== currentUser?.id);
          if (!otherUser) return null;
          
          return (
            <TouchableOpacity 
              style={[styles.chatItem, { borderBottomColor: colors.border }]} 
              onPress={() => navigateToChat(item.id)}
            >
              <Image
                source={{ uri: otherUser.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={[styles.username, { color: colors.text }]}>{otherUser.username}</Text>
                  <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                    {formatTimeAgo(item.lastMessage.timestamp)}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.lastMessage, 
                    { color: item.unreadCount > 0 ? colors.text : colors.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage.text}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    position: 'relative',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});