import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Chat, Message } from "../types/chat.ts";
import { supabase } from "../utils/supabase.ts";
import { useAuthStore } from "./auth-store.ts";

interface ChatParticipant {
  user_id: string;
  chat_id: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ChatState {
  chats: Chat[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  activeChatId: string | null;
}

interface ChatActions {
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<string | null>;
  findChatByParticipant: (recipientUserId: string) => Promise<string | null>;
  createChatWithUser: (recipientUserId: string) => Promise<string | null>;
  setActiveChat: (chatId: string | null) => void;
  reset: () => void;
  markMessagesAsRead: (chatId: string, messageIds?: string[]) => Promise<void>;
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  isLoading: false,
  error: null,
  activeChatId: null,
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveChat: (chatId) => set({ activeChatId: chatId }),

      fetchChats: async () => {
        set({ isLoading: true, error: null });
        const { currentUser } = useAuthStore.getState();

        if (!currentUser) {
          set({ error: "User not authenticated", isLoading: false });
          return;
        }

        try {
          // Fetch chat participants for the current user
          const { data: participantsData, error: participantsError } =
            await supabase
              .from("chat_participants")
              .select("chat_id")
              .eq("user_id", currentUser.id);

          if (participantsError) throw participantsError;

          const chatIds = participantsData.map((p: any) => p.chat_id);

          if (chatIds.length === 0) {
            set({ chats: [], isLoading: false });
            return;
          }

          // Fetch chats based on the retrieved chat IDs
          const { data: chatsData, error: chatsError } = await supabase
            .from("chats")
            .select(
              "id, participants:chat_participants(user_id, users(id, username, avatar_url)), messages(*)"
            )
            .in("id", chatIds)
            .order("id", { ascending: false });

          if (chatsError) throw chatsError;

          // Map to Chat type
          const processedChats: Chat[] = (chatsData as any[]).map((chat) => {
            // Participants
            const participants = chat.participants.map((p: any) => ({
              id: p.users.id,
              email: "", // Not available here
              username: p.users.username,
              displayName: p.users.username, // Fallback
              avatar: p.users.avatar_url || "",
              bio: "",
              role: "user",
              verified: false,
            }));
            // Messages
            const messages: Message[] = (chat.messages || []).map((m: any) => ({
              id: m.id,
              senderId: m.user_id,
              text: m.content,
              timestamp: new Date(m.created_at).getTime(),
              read: m.read ?? false,
            }));
            // Last message
            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : undefined;
            // Unread count
            const unreadCount = messages.filter(
              (msg) => !msg.read && msg.senderId !== currentUser.id
            ).length;
            return {
              id: chat.id,
              participants,
              messages,
              lastMessage: lastMessage!,
              unreadCount,
            };
          });

          set({ chats: processedChats, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching chats:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchMessages: async (chatId) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true });

          if (error) throw error;

          const messages: Message[] = (data as any[]).map((m) => ({
            id: m.id,
            senderId: m.user_id,
            text: m.content,
            timestamp: new Date(m.created_at).getTime(),
            read: m.read ?? false,
          }));

          set({ messages, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching messages:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      sendMessage: async (chatId, text) => {
        set({ error: null });
        const { currentUser } = useAuthStore.getState();

        if (!currentUser) {
          set({ error: "User not authenticated" });
          return;
        }

        try {
          const { data, error } = await supabase
            .from("messages")
            .insert({
              chat_id: chatId,
              user_id: currentUser.id,
              content: text,
              read: false,
            })
            .select("*");

          if (error) throw error;

          if (data && data.length > 0) {
            const m = data[0];
            const newMessage: Message = {
              id: m.id,
              senderId: m.user_id,
              text: m.content,
              timestamp: new Date(m.created_at).getTime(),
              read: m.read ?? false,
            };
            if (get().activeChatId === chatId) {
              set((state) => ({
                messages: [...state.messages, newMessage],
              }));
            }
            set((state) => ({
              chats: state.chats.map((chat) => {
                if (chat.id === chatId) {
                  const updatedMessages = [...chat.messages, newMessage];
                  return {
                    ...chat,
                    messages: updatedMessages,
                    lastMessage: newMessage,
                    unreadCount: updatedMessages.filter(
                      (msg) => !msg.read && msg.senderId !== currentUser.id
                    ).length,
                  };
                }
                return chat;
              }),
            }));
          }
        } catch (error: any) {
          console.error("Error sending message:", error);
          set({ error: error.message });
        }
      },

      createChat: async (participantIds) => {
        set({ isLoading: true, error: null });
        const { currentUser } = useAuthStore.getState();

        if (!currentUser) {
          set({ error: "User not authenticated", isLoading: false });
          return null;
        }

        const allParticipantIds = [
          ...new Set([...participantIds, currentUser.id]),
        ];

        try {
          const { data: chatData, error: chatError } = await supabase
            .from("chats")
            .insert({})
            .select("id")
            .single();

          if (chatError) throw chatError;
          if (!chatData) throw new Error("Failed to create chat entry");
          const newChatId = chatData.id;

          const participantInserts = allParticipantIds.map((userId) => ({
            chat_id: newChatId,
            user_id: userId,
          }));
          const { error: participantsError } = await supabase
            .from("chat_participants")
            .insert(participantInserts);

          if (participantsError) throw participantsError;

          // Fetch and add the new chat to the store
          await get().fetchChats();
          set({ isLoading: false });
          return newChatId;
        } catch (error: any) {
          console.error("Error creating chat:", error);
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      findChatByParticipant: async (recipientUserId: string) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) {
          console.error("User not authenticated");
          return null;
        }
        // Check local store first
        const existingChat = get().chats.find((chat) => {
          if (chat.participants && chat.participants.length === 2) {
            const participantIds = chat.participants.map((p) => p.id);
            return (
              participantIds.includes(currentUser.id) &&
              participantIds.includes(recipientUserId)
            );
          }
          return false;
        });
        if (existingChat) {
          return existingChat.id;
        }
        // Fallback: fetch from Supabase (not optimal, but works for now)
        try {
          const { data: userChats, error: userChatsError } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("user_id", currentUser.id);
          if (userChatsError) throw userChatsError;
          if (!userChats || userChats.length === 0) return null;
          const currentUserChatIds = userChats.map((pc: any) => pc.chat_id);
          const { data: commonChats, error: commonChatsError } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("user_id", recipientUserId)
            .in("chat_id", currentUserChatIds);
          if (commonChatsError) throw commonChatsError;
          for (const chat of commonChats || []) {
            const { data: participants, error: pError } = await supabase
              .from("chat_participants")
              .select("user_id")
              .eq("chat_id", chat.chat_id);
            if (pError) continue;
            if (participants && participants.length === 2) {
              return chat.chat_id;
            }
          }
          return null;
        } catch (error) {
          console.error("Error in findChatByParticipant:", error);
          return null;
        }
      },

      createChatWithUser: async (recipientUserId: string) => {
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) {
          set({ error: "User not authenticated" });
          return null;
        }
        if (currentUser.id === recipientUserId) {
          set({ error: "Cannot create chat with oneself." });
          return null;
        }
        return get().createChat([recipientUserId]);
      },

      reset: () => set(initialState),

      markMessagesAsRead: async (chatId: string, messageIds?: string[]) => {
        set({ error: null });
        const { currentUser } = useAuthStore.getState();
        if (!currentUser) {
          set({ error: "User not authenticated" });
          return;
        }
        try {
          let query = supabase
            .from("messages")
            .update({ read: true })
            .eq("chat_id", chatId)
            .neq("user_id", currentUser.id);
          if (messageIds && messageIds.length > 0) {
            query = query.in("id", messageIds);
          }
          const { error } = await query;
          if (error) throw error;
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (chat.id === chatId) {
                const updatedMessages = chat.messages.map((msg) => {
                  if (
                    msg.senderId !== currentUser.id &&
                    (!messageIds || messageIds.includes(msg.id)) &&
                    !msg.read
                  ) {
                    return { ...msg, read: true };
                  }
                  return msg;
                });
                return {
                  ...chat,
                  messages: updatedMessages,
                  unreadCount: updatedMessages.filter(
                    (msg) => !msg.read && msg.senderId !== currentUser.id
                  ).length,
                };
              }
              return chat;
            }),
            messages: state.messages.map((msg) => {
              if (
                msg.senderId !== currentUser.id &&
                (!messageIds || messageIds.includes(msg.id)) &&
                !msg.read
              ) {
                return { ...msg, read: true };
              }
              return msg;
            }),
          }));
        } catch (error: any) {
          console.error("Error marking messages as read:", error);
          set({ error: error.message });
        }
      },
    }),
    {
      name: "chat-storage",
      /**
       * Persistencia multiplataforma segura para Zustand:
       * - En web: usa localStorage solo si window existe (acceso seguro con globalThis)
       * - En móvil: usa AsyncStorage
       *
       * Patrón recomendado para evitar errores de tipado y compatibilidad:
       *
       * storage: createJSONStorage(() =>
       *   Platform.OS === "web"
       *     ? typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined"
       *       ? (globalThis as any).window.localStorage
       *       : undefined
       *     : AsyncStorage
       * )
       *
       * - No declarar 'window' globalmente ni usar @ts-expect-error
       * - Usar siempre este patrón en todos los stores Zustand
       */
      storage: createJSONStorage(() =>
        Platform.OS === "web"
          ? typeof globalThis !== "undefined" &&
            typeof (globalThis as any).window !== "undefined"
            ? (globalThis as any).window.localStorage
            : undefined
          : AsyncStorage
      ),
    }
  )
);
