import { posts as initialPosts } from "@/mocks/posts.ts";
import { Post, Comment as PostComment } from "@/types/post.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FeedState {
  posts: Post[];
  likedPosts: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
  addComment: (postId: string, comment: string) => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: initialPosts,
      likedPosts: {},
      savedPosts: {},
      likePost: (postId: string) =>
        set((state) => {
          const updatedPosts = state.posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          );
          return {
            posts: updatedPosts,
            likedPosts: { ...state.likedPosts, [postId]: true },
          };
        }),
      unlikePost: (postId: string) =>
        set((state) => {
          const updatedPosts = state.posts.map((post) =>
            post.id === postId
              ? { ...post, likes: Math.max(0, post.likes - 1) }
              : post
          );
          const newLikedPosts = { ...state.likedPosts };
          delete newLikedPosts[postId];
          return {
            posts: updatedPosts,
            likedPosts: newLikedPosts,
          };
        }),
      savePost: (postId: string) =>
        set((state) => ({
          savedPosts: { ...state.savedPosts, [postId]: true },
        })),
      unsavePost: (postId: string) =>
        set((state) => {
          const newSavedPosts = { ...state.savedPosts };
          delete newSavedPosts[postId];
          return { savedPosts: newSavedPosts };
        }),
      addComment: (postId: string, commentText: string) =>
        set((state) => {
          const updatedPosts = state.posts.map((post) => {
            if (post.id === postId) {
              const newComment: PostComment = {
                id: `c${Date.now()}`,
                user: {
                  id: "currentUser",
                  username: "me",
                  displayName: "Me",
                  avatar:
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
                  verified: false,
                },
                text: commentText,
                timestamp: String(Date.now()),
                likes: 0,
              };
              const updatedPost: Post = {
                ...post,
                comments: [...post.comments, newComment],
              };
              return updatedPost;
            }
            return post;
          });
          return { posts: updatedPosts };
        }),
    }),
    {
      name: "feed-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        likedPosts: state.likedPosts,
        savedPosts: state.savedPosts,
      }),
    }
  )
);
