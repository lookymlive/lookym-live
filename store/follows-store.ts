import { createFollowNotification } from "@/utils/notifications.ts";
import { supabase } from "@/utils/supabase.ts";
import { create } from "zustand";
import { useAuthStore } from "./auth-store.ts";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  role: "user" | "business";
}

interface FollowsSummary {
  followersCount: number;
  followingCount: number;
}

interface FollowsState {
  followerIds: string[];
  followingIds: string[];
  followers: User[];
  following: User[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  // Métodos
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  fetchFollowersOfUser: (userId: string) => Promise<User[]>;
  fetchFollowingOfUser: (userId: string) => Promise<User[]>;
  isFollowing: (userId: string) => boolean;
  getUserFollowsSummary: (userId: string) => Promise<FollowsSummary>;
  refreshFollowsData: () => Promise<void>;
}

export const useFollowsStore = create<FollowsState>((set, get) => ({
  followerIds: [],
  followingIds: [],
  followers: [],
  following: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  followUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const currentUser = useAuthStore.getState().currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // No seguir a uno mismo
      if (userId === currentUser.id) {
        throw new Error("Cannot follow yourself");
      }

      // Verificar si ya sigue al usuario
      if (get().isFollowing(userId)) {
        set({ isLoading: false });
        return; // Ya está siguiendo
      }

      // Registrar en Supabase
      const { error } = await supabase
        .from("followers")
        .insert([{ follower_id: currentUser.id, following_id: userId }]);

      if (error) throw error;

      // Crear notificación para el usuario seguido
      try {
        await createFollowNotification(
          userId,
          currentUser.id,
          currentUser.username
        );
      } catch (notifError) {
        console.error(
          "Error al crear notificación de seguimiento:",
          notifError
        );
        // No interrumpimos el flujo si falla la notificación
      }

      // Actualizar estado local
      set((state) => ({
        followingIds: [...state.followingIds, userId],
        isLoading: false,
      }));

      // Refrescar datos
      await get().refreshFollowsData();
    } catch (error: any) {
      console.error("Error following user:", error.message);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  unfollowUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const currentUser = useAuthStore.getState().currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Eliminar en Supabase
      const { error } = await supabase.from("followers").delete().match({
        follower_id: currentUser.id,
        following_id: userId,
      });

      if (error) throw error;

      // Actualizar estado local
      set((state) => ({
        followingIds: state.followingIds.filter((id) => id !== userId),
        isLoading: false,
      }));

      // Refrescar datos
      await get().refreshFollowsData();
    } catch (error: any) {
      console.error("Error unfollowing user:", error.message);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchFollowersOfUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Obtener IDs de seguidores
      const { data: followersData, error: followersError } = await supabase
        .from("followers")
        .select("follower_id")
        .eq("following_id", userId);

      if (followersError) throw followersError;

      const followerIds = followersData.map((item) => item.follower_id);

      // Si no hay seguidores, devolver lista vacía
      if (followerIds.length === 0) {
        set({
          followers: [],
          followerIds: [],
          isLoading: false,
        });
        return [];
      }

      // Obtener detalles de usuarios seguidores
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, verified, role")
        .in("id", followerIds);

      if (usersError) throw usersError;

      const formattedUsers = usersData.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar_url,
        verified: user.verified,
        role: user.role,
      }));

      // Actualizar estado
      set({
        followers: formattedUsers,
        followerIds: followerIds,
        isLoading: false,
      });

      return formattedUsers;
    } catch (error: any) {
      console.error("Error fetching followers:", error.message);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  fetchFollowingOfUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Obtener IDs de seguidos
      const { data: followingData, error: followingError } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      const followingIds = followingData.map((item) => item.following_id);

      // Si no sigue a nadie, devolver lista vacía
      if (followingIds.length === 0) {
        set({
          following: [],
          followingIds: [],
          isLoading: false,
        });
        return [];
      }

      // Obtener detalles de usuarios seguidos
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, verified, role")
        .in("id", followingIds);

      if (usersError) throw usersError;

      const formattedUsers = usersData.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar_url,
        verified: user.verified,
        role: user.role,
      }));

      // Actualizar estado
      set({
        following: formattedUsers,
        followingIds: followingIds,
        isLoading: false,
        isInitialized: true,
      });

      return formattedUsers;
    } catch (error: any) {
      console.error("Error fetching following:", error.message);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  isFollowing: (userId: string) => {
    return get().followingIds.includes(userId);
  },

  getUserFollowsSummary: async (userId: string) => {
    try {
      // Obtener cantidad de seguidores
      const { count: followersCount, error: followersError } = await supabase
        .from("followers")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", userId);

      if (followersError) throw followersError;

      // Obtener cantidad de seguidos
      const { count: followingCount, error: followingError } = await supabase
        .from("followers")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (followingError) throw followingError;

      return {
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      };
    } catch (error: any) {
      console.error("Error getting follows summary:", error.message);
      throw error;
    }
  },

  refreshFollowsData: async () => {
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      // Cargar seguidores y seguidos del usuario actual
      await Promise.all([
        get().fetchFollowersOfUser(currentUser.id),
        get().fetchFollowingOfUser(currentUser.id),
      ]);

      set({ isInitialized: true });
    } catch (error: any) {
      console.error("Error refreshing follows data:", error.message);
    }
  },
}));
