import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Chat, Message } from "../types/chat.ts";
import { supabase } from "../utils/supabase.ts";
import { useAuthStore } from "./auth-store.ts";

interface ChatState {
  chats: Chat[];
  loadChats: () => Promise<void>;
  getChat: (chatId: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  createChat: (
    participantId: string,
    initialMessage: string
  ) => Promise<string>;
  markChatAsRead: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],

      loadChats: async () => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return;
          // Fetch chats with participants and messages from Supabase
          const { data, error } = await supabase
            .from("chats")
            .select(
              `
              id,
              chat_participants!inner(user_id),
              messages(
                id,
                sender_id,
                text,
                read,
                created_at
              ),
              users:chat_participants!inner(
                users(
                  id,
                  username,
                  avatar_url,
                  role,
                  verified
                )
              )
            `
            )
            .eq("chat_participants.user_id", currentUser.id)
            .order("created_at", {
              foreignTable: "messages",
              ascending: false,
            });
          if (error) throw error;
          const formattedChats: Chat[] = (data || []).map((chat: any) => {
            const messages = (chat.messages || []).map(
              (msg: any): Message => ({
                id: msg.id,
                senderId: msg.sender_id,
                text: msg.text,
                timestamp: new Date(msg.created_at).getTime(),
                read: msg.read,
              })
            );
            const participants = (chat.users || []).map((user: any) => ({
              id: user.users.id,
              username: user.users.username,
              avatar: user.users.avatar_url,
              role: user.users.role,
              verified: user.users.verified,
            }));
            const lastMessage = messages[0];
            const unreadCount = messages.filter(
              (msg: Message) => !msg.read && msg.senderId !== currentUser.id
            ).length;
            return {
              id: chat.id,
              participants,
              messages,
              lastMessage,
              unreadCount,
            };
          });
          set({ chats: formattedChats });
        } catch (error) {
          console.error("Load chats error:", error);
        }
      },

      getChat: (chatId: string) => {
        return get().chats.find((chat) => chat.id === chatId);
      },

      sendMessage: async (chatId: string, text: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return;
          const { data, error } = await supabase
            .from("messages")
            .insert([
              {
                chat_id: chatId,
                sender_id: currentUser.id,
                text,
              },
            ])
            .select();
          if (error) throw error;
          const newMessage: Message = {
            id: data[0].id,
            senderId: currentUser.id,
            text,
            timestamp: new Date(data[0].created_at).getTime(),
            read: false,
          };
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage,
                  unreadCount: 0,
                };
              }
              return chat;
            }),
          }));
        } catch (error) {
          console.error("Send message error:", error);
        }
      },

      createChat: async (participantId: string, initialMessage: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return "";
          // 1. Create chat
          const { data: chatData, error: chatError } = await supabase
            .from("chats")
            .insert({})
            .select();
          if (chatError) throw chatError;
          const chatId = chatData[0].id;
          // 2. Add participants
          const { error: participantsError } = await supabase
            .from("chat_participants")
            .insert([
              { chat_id: chatId, user_id: currentUser.id },
              { chat_id: chatId, user_id: participantId },
            ]);
          if (participantsError) throw participantsError;
          // 3. Send initial message
          const { data: messageData, error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                chat_id: chatId,
                sender_id: currentUser.id,
                text: initialMessage,
              },
            ])
            .select();
          if (messageError) throw messageError;
          // 4. Get participant info
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, username, avatar_url, role, verified")
            .eq("id", participantId)
            .single();
          if (userError) throw userError;
          // 5. Create chat object
          const newMessage: Message = {
            id: messageData[0].id,
            senderId: currentUser.id,
            text: initialMessage,
            timestamp: new Date(messageData[0].created_at).getTime(),
            read: false,
          };
          const newChat: Chat = {
            id: chatId,
            participants: [
              {
                id: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar || "",
                role: currentUser.role,
                verified: currentUser.verified,
              },
              {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar_url,
                role: userData.role,
                verified: userData.verified,
              },
            ],
            messages: [newMessage],
            lastMessage: newMessage,
            unreadCount: 0,
          };
          set((state) => ({
            chats: [newChat, ...state.chats],
          }));
          return chatId;
        } catch (error) {
          console.error("Create chat error:", error);
          return "";
        }
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
