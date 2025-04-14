import { videos as initialVideos } from "@/mocks/videos";
import { Video } from "@/types/video";
import {
  uploadVideo as cloudinaryUpload,
  getVideoThumbnailUrl,
} from "@/utils/cloudinary";
import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";

interface VideoState {
  videos: Video[];
  likedVideos: Record<string, boolean>;
  savedVideos: Record<string, boolean>;
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
  ) => Promise<void>;
  addVideo: (videoData: Partial<Video>) => void;
  fetchVideos: (page?: number, limit?: number) => Promise<void>;
  fetchVideosByUser: (userId: string) => Promise<void>;
  fetchVideoById: (videoId: string) => Promise<Video | null>;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: initialVideos,
      likedVideos: {},
      savedVideos: {},
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

      addVideo: (videoData: Partial<Video>) => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");

          // Create a new video object
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

          // Add to state
          set((state) => ({
            videos: [newVideo, ...state.videos],
          }));
        } catch (error: any) {
          console.error("Add video error:", error.message);
          throw error;
        }
      },

      uploadVideo: async (
        videoUri: string,
        caption: string,
        hashtags: string[]
      ) => {
        try {
          set({ isLoading: true, error: null });

          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) throw new Error("User not authenticated");
          if (currentUser.role !== "business")
            throw new Error("Only business accounts can upload videos");

          // Get file extension and MIME type
          const fileExtension =
            videoUri.split(".").pop()?.toLowerCase() || "mp4";
          const mimeType = `video/${
            fileExtension === "mov" ? "quicktime" : fileExtension
          }`;

          // Create form data for upload
          const formData = new FormData();

          if (Platform.OS !== "web") {
            // For native platforms, create a file object
            formData.append("file", {
              uri: videoUri,
              type: mimeType,
              name: `video_${Date.now()}.${fileExtension}`,
            } as any);
          } else {
            // For web platform
            const response = await fetch(videoUri);
            const blob = await response.blob();
            formData.append(
              "file",
              blob,
              `video_${Date.now()}.${fileExtension}`
            );
          }

          // Upload to Cloudinary
          const uploadResult = await cloudinaryUpload(videoUri, {
            resource_type: "video",
            folder: `lookym/${currentUser.id}`,
            public_id: `video_${Date.now()}`,
          });

          // Save to Supabase
          const { data, error } = await supabase
            .from("videos")
            .insert([
              {
                user_id: currentUser.id,
                video_url: uploadResult.secure_url,
                thumbnail_url: getVideoThumbnailUrl(uploadResult.public_id),
                caption,
                hashtags,
                mime_type: mimeType,
              },
            ])
            .select("*, user:users(*)");

          if (error) throw error;

          // Format the video for our app
          const newVideo: Video = {
            id: data[0].id,
            user: {
              id: data[0].user.id,
              username: data[0].user.username,
              avatar: data[0].user.avatar_url,
              verified: data[0].user.verified,
              role: data[0].user.role,
            },
            videoUrl: data[0].video_url,
            thumbnailUrl: data[0].thumbnail_url,
            caption: data[0].caption,
            hashtags: data[0].hashtags,
            likes: 0,
            comments: [],
            timestamp: new Date(data[0].created_at).getTime(),
            mimeType: data[0].mime_type,
          };

          // Update local state
          set((state) => ({
            videos: [newVideo, ...state.videos],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchVideos: async (page = 1, limit = 10) => {
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
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

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
            .eq("id", videoId)
            .single();

          if (error) throw error;

          // Format the video for our app
          const formattedVideo: Video = {
            id: data.id,
            user: {
              id: data.user.id,
              username: data.user.username,
              avatar: data.user.avatar_url,
              verified: data.user.verified,
              role: data.user.role,
            },
            videoUrl: data.video_url,
            thumbnailUrl: data.thumbnail_url,
            caption: data.caption,
            hashtags: data.hashtags,
            likes: data.likes,
            comments: data.comments.map((comment: any) => ({
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
            timestamp: new Date(data.created_at).getTime(),
          };

          set({ isLoading: false });
          return formattedVideo;
        } catch (error: any) {
          console.error("Fetch video by ID error:", error.message);
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: "video-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        likedVideos: state.likedVideos,
        savedVideos: state.savedVideos,
      }),
    }
  )
);
