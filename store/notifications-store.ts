import { supabase } from "@/utils/supabase";
import { create } from "zustand";
import { useAuthStore } from "./auth-store";

export interface Notification {
  id: string;
  userId: string;
  type: "new_follower" | "video_like" | "new_comment" | "new_message";
  content: string;
  relatedEntityId?: string;
  relatedEntityType?: "video" | "user" | "message" | "comment";
  originUserId?: string;
  originUser?: {
    id: string;
    username: string;
    avatar: string;
  };
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  // Métodos
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
  refreshNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      const currentUser = useAuthStore.getState().currentUser;

      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener notificaciones de Supabase
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          content,
          related_entity_id,
          related_entity_type,
          origin_user_id,
          read,
          created_at,
          origin_user:origin_user_id (id, username, avatar_url)
        `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformar datos al formato de la interfaz
      const formattedNotifications: Notification[] = data.map((item: any) => ({
        id: item.id,
        userId: currentUser.id,
        type: item.type,
        content: item.content,
        relatedEntityId: item.related_entity_id,
        relatedEntityType: item.related_entity_type,
        originUserId: item.origin_user_id,
        originUser: item.origin_user
          ? {
              id: item.origin_user.id,
              username: item.origin_user.username,
              avatar: item.origin_user.avatar_url,
            }
          : undefined,
        read: item.read,
        createdAt: item.created_at,
      }));

      // Contar notificaciones no leídas
      const unreadCount = formattedNotifications.filter((n) => !n.read).length;

      set({
        notifications: formattedNotifications,
        unreadCount,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error: any) {
      console.error("Error al obtener notificaciones:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) throw new Error("Usuario no autenticado");

      // Actualizar en Supabase
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      // Actualizar estado local
      set((state) => {
        const updatedNotifications = state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        );

        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter((n) => !n.read).length,
        };
      });
    } catch (error: any) {
      console.error("Error al marcar notificación como leída:", error.message);
      set({ error: error.message });
    }
  },

  markAllAsRead: async () => {
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) throw new Error("Usuario no autenticado");

      // Actualizar en Supabase
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", currentUser.id)
        .eq("read", false);

      if (error) throw error;

      // Actualizar estado local
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error.message
      );
      set({ error: error.message });
    }
  },

  getUnreadCount: () => {
    return get().unreadCount;
  },

  refreshNotifications: async () => {
    await get().fetchNotifications();
  },
}));
