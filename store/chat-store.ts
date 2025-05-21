import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Chat, Message } from "../types/chat.ts";
import { supabase } from "../utils/supabase.ts";
import { useAuthStore } from "./auth-store.ts";

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
  // Add other chat fields if necessary
  participants?: ChatParticipant[]; // Optional: to store participant details
  last_message?: any; // TODO: Define proper type for last message preview
}

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
  sendMessage: (chatId: string, content: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<string | null>;
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

          const chatIds = participantsData.map((p) => p.chat_id);

          if (chatIds.length === 0) {
            set({ chats: [], isLoading: false });
            return;
          }

          // Fetch chats based on the retrieved chat IDs
          const { data: chatsData, error: chatsError } = await supabase
            .from("chats")
            .select(
              "id, created_at, participants:chat_participants(user_id, users(id, username, avatar_url)), last_message:messages(content, created_at)"
            ) // Refined select statement
            .in("id", chatIds)
            .order("created_at", { ascending: false }); // Order chats by creation date or last message date
          // TODO: Ordering by last message timestamp is preferable but might require a different query structure or processing after fetching.
          // The current join might not reliably give the *last* message this way.

          if (chatsError) throw chatsError;

          // Process chats data if needed (e.g., extract last message, format participants)
          // For now, mapping to Chat interface and ensuring participant/message structure is correct.
          const processedChats: Chat[] = (chatsData as any[]).map((chat) => ({
            id: chat.id,
            created_at: chat.created_at,
            participants: chat.participants.map((p: any) => ({
              // Map participants
              user_id: p.user_id,
              chat_id: chat.id, // chat_id is not in the joined users object, add it from the chat object
              users: p.users, // Keep the nested users object
            })),
            last_message: chat.last_message ? chat.last_message[0] : undefined, // Assuming last_message is an array due to the join, take the first (most recent if order works)
          }));

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
            .select("*, users(*)") // Select message fields and join with users table
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true }); // Order by timestamp

          if (error) throw error;

          set({ messages: data as Message[], isLoading: false });
        } catch (error: any) {
          console.error("Error fetching messages:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      sendMessage: async (chatId, content) => {
        set({ error: null });
        const { currentUser } = useAuthStore.getState();

        if (!currentUser) {
          set({ error: "User not authenticated" });
          return;
        }

        try {
          // Insert the new message
          const { data, error } = await supabase
            .from("messages")
            .insert({
              chat_id: chatId,
              user_id: currentUser.id,
              content: content,
            })
            .select("*, users(*)"); // Select the inserted message with user details

          if (error) throw error;

          if (data && data.length > 0) {
            const newMessage = data[0] as Message;
            // Append the new message to the current messages list if the active chat matches
            if (get().activeChatId === chatId) {
              set((state) => ({
                messages: [...state.messages, newMessage],
              }));
            }
            // Optionally update the last message preview in the chats list
            set((state) => ({
              chats: state.chats.map((chat) => {
                if (chat.id === chatId) {
                  return { ...chat, last_message: newMessage };
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

        const allParticipantIds = [...participantIds, currentUser.id];
        // Optional: Check if a chat already exists with these participants
        // This can be complex depending on exact participant matching requirements.
        // For now, we'll allow creating multiple chats with the same participants.

        try {
          // 1. Create the chat entry
          const { data: chatData, error: chatError } = await supabase
            .from("chats")
            .insert({}) // Insert an empty row, other fields like created_at will be set by DB
            .select("id") // Select the generated ID
            .single(); // Expect a single row back

          if (chatError) throw chatError;
          if (!chatData) throw new Error("Failed to create chat entry");

          const newChatId = chatData.id;

          // 2. Add participants to chat_participants table
          const participantInserts = allParticipantIds.map((userId) => ({
            chat_id: newChatId,
            user_id: userId,
          }));

          const { error: participantsError } = await supabase
            .from("chat_participants")
            .insert(participantInserts);

          if (participantsError) throw participantsError;

          // Optional: Fetch the newly created chat with participant details
          // and add it to the local chats state. This might duplicate effort with fetchChats.
          // For now, we'll rely on a subsequent fetchChats call to update the list.

          set({ isLoading: false });
          return newChatId; // Return the ID of the newly created chat
        } catch (error: any) {
          console.error("Error creating chat:", error);
          set({ error: error.message, isLoading: false });
          return null;
        }
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
            .neq("user_id", currentUser.id); // Only mark messages sent by others

          if (messageIds && messageIds.length > 0) {
            query = query.in("id", messageIds);
          }

          const { error } = await query;

          if (error) throw error;

          // Update local state: find the chat and mark relevant messages as read
          set((state) => ({
            chats: state.chats.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  // Assuming unreadCount is calculated based on messages in the chat object
                  // If not, this might need refinement.
                  // A simpler approach for local state might be to just update the messages array.
                  // Let's update the messages array within the store.
                };
              }
              return chat;
            }),
            messages: state.messages.map((msg) => {
              // Mark messages as read if they belong to this chat, are not sent by the current user,
              // and are included in messageIds (if provided), and are currently not read.
              if (
                msg.chat_id === chatId &&
                msg.user_id !== currentUser.id &&
                !msg.read
              ) {
                if (!messageIds || messageIds.includes(msg.id)) {
                  return { ...msg, read: true };
                }
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
