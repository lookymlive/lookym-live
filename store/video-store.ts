import { Video } from "@/types/video.ts";
import {
  uploadVideo as cloudinaryUpload,
  getVideoThumbnailUrl,
} from "@/utils/cloudinary.ts";
import { createVideoLikeNotification } from "@/utils/notifications.ts";
import { supabase } from "@/utils/supabase.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store.ts";

interface VideoState {
  videos: Video[];
  likedVideos: Record<string, boolean>;
  savedVideos: Record<string, boolean>;
  mainVideo: Video | null;
  mainVideoLoading: boolean;
  isLoading: boolean;
  error: string | null;
  likeVideo: (videoId: string) => Promise<void>;
  unlikeVideo: (videoId: string) => Promise<void>;
  saveVideo: (videoId: string) => void;
  unsaveVideo: (videoId: string) => void;
  addComment: (videoId: string, comment: string) => Promise<void>;
  uploadVideo: (
    videoUri: string,
    caption: string,
    hashtags: string[]
  ) => Promise<Video>;
  addVideo: (videoData: Partial<Video>) => void;
  fetchVideos: (page?: number, limit?: number) => Promise<void>;
  fetchVideosByUser: (userId: string) => Promise<void>;
  fetchVideoById: (videoId: string) => Promise<Video | null>;
  setMainVideo: (video: Video | null) => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: [],
      likedVideos: {},
      savedVideos: {},
      mainVideo: null,
      mainVideoLoading: false,
      isLoading: false,
      error: null,

      likeVideo: async (videoId: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // In a real app with Supabase
          // 1. Update likes count in videos table
          const { error: updateError } = await supabase.rpc(
            "increment_video_likes",
            {
              video_id: videoId,
            }
          );

          if (updateError) throw updateError;

          // 2. Add record to video_likes table
          const { error: likeError } = await supabase
            .from("video_likes")
            .insert([{ user_id: currentUser.id, video_id: videoId }]);

          if (likeError) throw likeError;

          // Update local state
          set((state) => {
            const updatedVideos = state.videos.map((video) =>
              video.id === videoId
                ? { ...video, likes: video.likes + 1 }
                : video
            );
            return {
              videos: updatedVideos,
              likedVideos: { ...state.likedVideos, [videoId]: true },
            };
          });

          // Crear notificación para el propietario del video
          const videoToUpdate = get().videos.find((v) => v.id === videoId);
          if (videoToUpdate && videoToUpdate.user.id !== currentUser.id) {
            try {
              await createVideoLikeNotification(
                videoToUpdate.user.id,
                currentUser.id,
                currentUser.username,
                videoId
              );
            } catch (notifError) {
              console.error("Error al crear notificación de like:", notifError);
              // No interrumpimos el flujo si falla la notificación
            }
          }
        } catch (error: any) {
          console.error("Like video error:", error.message);
          // Don't update state if the API call fails
          throw error;
        }
      },

      unlikeVideo: async (videoId: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // In a real app with Supabase
          // 1. Update likes count in videos table
          const { error: updateError } = await supabase.rpc(
            "decrement_video_likes",
            {
              video_id: videoId,
            }
          );

          if (updateError) throw updateError;

          // 2. Remove record from video_likes table
          const { error: unlikeError } = await supabase
            .from("video_likes")
            .delete()
            .match({ user_id: currentUser.id, video_id: videoId });

          if (unlikeError) throw unlikeError;

          // Update local state
          set((state) => {
            const updatedVideos = state.videos.map((video) =>
              video.id === videoId
                ? { ...video, likes: Math.max(0, video.likes - 1) }
                : video
            );
            const newLikedVideos = { ...state.likedVideos };
            delete newLikedVideos[videoId];
            return {
              videos: updatedVideos,
              likedVideos: newLikedVideos,
            };
          });
        } catch (error: any) {
          console.error("Unlike video error:", error.message);
          // Don't update state if the API call fails
          throw error;
        }
      },

      saveVideo: (videoId: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // In a real app with Supabase
          // Add record to saved_videos table
          supabase
            .from("saved_videos")
            .insert([{ user_id: currentUser.id, video_id: videoId }])
            .then(({ error }) => {
              if (error) throw error;
            });

          // Update local state immediately for better UX
          set((state) => ({
            savedVideos: { ...state.savedVideos, [videoId]: true },
          }));
        } catch (error: any) {
          console.error("Save video error:", error.message);
          // State is already updated, so no need to revert
        }
      },

      unsaveVideo: (videoId: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // In a real app with Supabase
          // Remove record from saved_videos table
          supabase
            .from("saved_videos")
            .delete()
            .match({ user_id: currentUser.id, video_id: videoId })
            .then(({ error }) => {
              if (error) throw error;
            });

          // Update local state immediately for better UX
          set((state) => {
            const newSavedVideos = { ...state.savedVideos };
            delete newSavedVideos[videoId];
            return { savedVideos: newSavedVideos };
          });
        } catch (error: any) {
          console.error("Unsave video error:", error.message);
          // State is already updated, so no need to revert
        }
      },

      addComment: async (videoId: string, commentText: string) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // In a real app with Supabase
          const { data, error } = await supabase
            .from("comments")
            .insert([
              {
                video_id: videoId,
                user_id: currentUser.id,
                text: commentText,
              },
            ])
            .select("*, user:users(*)");

          if (error) throw error;

          // Format the comment for our app
          const newComment = {
            id: data[0].id,
            user: {
              id: data[0].user.id,
              username: data[0].user.username,
              avatar: data[0].user.avatar_url,
              verified: data[0].user.verified,
              role: data[0].user.role,
            },
            text: data[0].text,
            timestamp: new Date(data[0].created_at).getTime(),
            likes: 0,
          };

          // Update local state
          set((state) => {
            const updatedVideos = state.videos.map((video) => {
              if (video.id === videoId) {
                return {
                  ...video,
                  comments: [...video.comments, newComment],
                };
              }
              return video;
            });
            return { videos: updatedVideos };
          });
        } catch (error: any) {
          console.error("Add comment error:", error.message);
          throw error;
        }
      },

      /**
       * uploadVideo
       *
       * Sube un video real a Cloudinary y lo registra en Supabase.
       * Actualiza el estado local y maneja el loading y errores.
       */
      uploadVideo: async (
        videoUri: string,
        caption: string,
        hashtags: string[],
        options?: { onProgress?: (progress: number) => void }
      ) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          console.log(
            "[uploadVideo] Iniciando subida a Cloudinary...",
            videoUri
          );
          // Subir video a Cloudinary
          const uploadResult = await cloudinaryUpload(videoUri, options);
          if (!uploadResult || !uploadResult.secure_url)
            throw new Error("Error subiendo a Cloudinary");
          console.log(
            "[uploadVideo] Video subido a Cloudinary:",
            uploadResult.secure_url
          );

          // Opcional: obtener thumbnail (si tienes lógica, si no, deja string vacío)
          let thumbnailUrl = "";
          if (typeof getVideoThumbnailUrl === "function") {
            try {
              // CORREGIDO: usar public_id, no secure_url
              thumbnailUrl = getVideoThumbnailUrl(uploadResult.public_id);
            } catch (e) {
              console.warn("No se pudo obtener thumbnail automáticamente:", e);
            }
          }

          // Insertar en Supabase
          const { data, error } = await supabase
            .from("videos")
            .insert([
              {
                user_id: currentUser.id,
                video_url: uploadResult.secure_url,
                thumbnail_url: thumbnailUrl,
                caption,
                hashtags,
                likes: 0,
              },
            ])
            .select(`*, user:users(*), comments:comments(*, user:users(*))`);
          if (error) throw error;
          if (!data || !data[0])
            throw new Error("Supabase no devolvió datos del video subido");

          // Formatear el video para el estado local
          const video = data[0];
          const newVideo: Video = {
            id: video.id,
            user: {
              id: video.user.id,
              username: video.user.username,
              avatar: video.user.avatar_url,
              verified: video.user.verified,
              role: video.user.role,
            },
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url,
            caption: video.caption,
            hashtags: video.hashtags,
            likes: video.likes,
            comments: (video.comments || []).map((comment: any) => ({
              id: comment.id,
              user: {
                id: comment.user.id,
                username: comment.user.username,
                avatar: comment.user.avatar_url,
                verified: comment.user.verified,
                role: comment.user.role,
              },
              text: comment.text,
              timestamp: new Date(comment.created_at).getTime(),
              likes: comment.likes,
            })),
            timestamp: new Date(video.created_at).getTime(),
          };

          set((state) => ({
            videos: [newVideo, ...state.videos],
            isLoading: false,
          }));
          console.log(
            "[uploadVideo] Video subido y registrado correctamente en Supabase."
          );

          // Refrescar la lista completa desde Supabase
          if (typeof get().fetchVideos === "function") {
            await get().fetchVideos();
          }

          return newVideo;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          console.error("[uploadVideo] Error en el proceso:", error);
          throw error;
        }
      },

      /**
       * addVideo
       *
       * Esta función solo agrega un video local/mock al estado para pruebas o demos.
       * No sube archivos a Cloudinary ni guarda registros en Supabase.
       * Para subir videos reales, usa uploadVideo.
       */
      addVideo: (videoData: Partial<Video>) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // Crear un nuevo objeto Video mock/local
          const newVideo: Video = {
            id: `video-${Date.now()}`,
            user: {
              id: currentUser.id,
              username: currentUser.username,
              avatar: currentUser.avatar,
              verified: currentUser.verified,
              role: currentUser.role,
            },
            videoUrl: videoData.videoUrl || "",
            thumbnailUrl:
              videoData.thumbnailUrl ||
              "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000",
            caption: videoData.caption || "",
            hashtags: videoData.hashtags || [],
            likes: 0,
            comments: [],
            timestamp: Date.now(),
          };

          // Agregar al estado local (solo para pruebas/mocks)
          set((state) => ({
            videos: [newVideo, ...state.videos],
          }));
        } catch (error: any) {
          console.error("addVideo error:", error.message);
        }
      },

      fetchVideos: async (page = 1, limit = 10) => {
        try {
          set({ isLoading: true, error: null });

          // Fetch videos from Supabase
          const { data, error } = await supabase
            .from("videos")
            .select(`*, user:users(*), comments:comments(*, user:users(*))`)
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

          if (error) throw error;

          console.log("[fetchVideos] Raw data from Supabase:", data);

          // Format the videos for our app
          const formattedVideos: Video[] = data.map((video: any) => ({
            id: video.id,
            user: {
              id: video.user.id,
              username: video.user.username,
              avatar: video.user.avatar_url,
              verified: video.user.verified,
              role: video.user.role,
            },
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url,
            caption: video.caption,
            hashtags: video.hashtags,
            likes: video.likes,
            comments: (video.comments || []).map((comment: any) => ({
              id: comment.id,
              user: {
                id: comment.user.id,
                username: comment.user.username,
                avatar: comment.user.avatar_url,
                verified: comment.user.verified,
                role: comment.user.role,
              },
              text: comment.text,
              timestamp: new Date(comment.created_at).getTime(),
              likes: comment.likes,
            })),
            timestamp: new Date(video.created_at).getTime(),
          }));

          console.log("[fetchVideos] Formatted videos:", formattedVideos);

          // Update local state
          set((state) => ({
            videos:
              page === 1
                ? formattedVideos
                : [...state.videos, ...formattedVideos],
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Fetch videos error:", error.message);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      fetchVideosByUser: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });

          // In a real app with Supabase
          const { data, error } = await supabase
            .from("videos")
            .select(
              `
              *,
              user:users(*),
              comments:comments(
                *,
                user:users(*)
              )
            `
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Format the videos for our app
          const formattedVideos: Video[] = data.map((video) => ({
            id: video.id,
            user: {
              id: video.user.id,
              username: video.user.username,
              avatar: video.user.avatar_url,
              verified: video.user.verified,
              role: video.user.role,
            },
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url,
            caption: video.caption,
            hashtags: video.hashtags,
            likes: video.likes,
            comments: video.comments.map((comment: any) => ({
              id: comment.id,
              user: {
                id: comment.user.id,
                username: comment.user.username,
                avatar: comment.user.avatar_url,
                verified: comment.user.verified,
                role: comment.user.role,
              },
              text: comment.text,
              timestamp: new Date(comment.created_at).getTime(),
              likes: comment.likes,
            })),
            timestamp: new Date(video.created_at).getTime(),
          }));

          // Update local state
          set({
            videos: formattedVideos,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("Fetch user videos error:", error.message);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchVideoById: async (videoId: string) => {
        set({ mainVideoLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("videos")
            .select("*, user:users(*), products(*), tags(*)")
            .eq("id", videoId)
            .single();

          if (error) throw error;

          if (data) {
            // Aseguramos el mapeo correcto de snake_case a camelCase
            const video: Video = {
              id: data.id,
              videoUrl: data.video_url, // <-- CORREGIDO: snake_case a camelCase
              thumbnailUrl: data.thumbnail_url, // <-- CORREGIDO: snake_case a camelCase
              caption: data.caption,
              hashtags: data.hashtags || [],
              timestamp: new Date(data.created_at).getTime(),
              user: {
                id: data.user.id,
                username: data.user.username,
                avatar: data.user.avatar_url,
                verified: data.user.verified,
                role: data.user.role,
              },
              products: data.products || [],
              tags: data.tags || [],
              likes: data.likes || 0,
              comments: [],
            };
            set({ mainVideo: video, mainVideoLoading: false });
            return video;
          } else {
            set({ mainVideo: null, mainVideoLoading: false });
            return null;
          }
        } catch (error: any) {
          console.error("Error fetching video by ID:", error.message);
          set({ error: error.message, mainVideoLoading: false });
          throw error;
        }
      },

      setMainVideo: (video: Video | null) => {
        set({ mainVideo: video });
      },
    }),
    {
      name: "video-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        likedVideos: state.likedVideos,
        savedVideos: state.savedVideos,
      }),
      // Limpia videos del estado al rehidratar para evitar mostrar videos viejos
      onRehydrateStorage: (state) => {
        if (state) state.videos = [];
      },
    }
  )
);
