import { chats as initialChats } from "@/mocks/chats";
import { Chat, Message } from "@/types/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";

interface ChatState {
  chats: Chat[];
  loadChats: () => Promise<void>;
  getChat: (chatId: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => void;
  createChat: (participantId: string, initialMessage: string) => string;
  markChatAsRead: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],

      loadChats: async () => {
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        set({ chats: initialChats });
        return Promise.resolve();
      },

      getChat: (chatId: string) => {
        return get().chats.find((chat) => chat.id === chatId);
      },

      sendMessage: (chatId: string, text: string) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        const newMessage: Message = {
          id: `msg${Date.now()}`,
          senderId: currentUser.id,
          text,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
                unreadCount: 0, // Reset unread count for the sender
              };
            }
            return chat;
          }),
        }));
      },

      createChat: (participantId: string, initialMessage: string) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return "";

        // Check if chat already exists
        const existingChat = get().chats.find((chat) =>
          chat.participants.some((p) => p.id === participantId)
        );

        if (existingChat) {
          get().sendMessage(existingChat.id, initialMessage);
          return existingChat.id;
        }

        // Create new chat
        const chatId = `chat${Date.now()}`;
        const message: Message = {
          id: `msg${Date.now()}`,
          senderId: currentUser.id,
          text: initialMessage,
          timestamp: Date.now(),
          read: false,
        };

        const newChat: Chat = {
          id: chatId,
          participants: [
            currentUser,
            {
              id: participantId,
              username: "User",
              displayName: "User",
              email: "",
              avatar:
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
              role: "user",
              bio: "",
              verified: false,
            },
          ],
          messages: [message],
          lastMessage: message,
          unreadCount: 0,
        };

        set((state) => ({
          chats: [...state.chats, newChat],
        }));

        return chatId;
      },

      markChatAsRead: (chatId: string) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                unreadCount: 0,
                messages: chat.messages.map((msg) => {
                  if (msg.senderId !== currentUser.id && !msg.read) {
                    return { ...msg, read: true };
                  }
                  return msg;
                }),
              };
            }
            return chat;
          }),
        }));
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
