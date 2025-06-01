/// <reference types="jest" />

// Asegura que Jest reconozca los tipos y mocks correctamente en TypeScript

// Mock de expo-constants para evitar errores en Node
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));
// Mock de react-native para evitar errores en Node
jest.mock("react-native", () => ({}));
// Mock de AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock zustand/middleware antes de importar el store para evitar errores de persist/bind
jest.mock("zustand/middleware", () => {
  const actual = jest.requireActual("zustand/middleware");
  return {
    ...actual,
    persist: (config: any, options: any) => (set: any, get: any, api: any) =>
      config(set, get, api),
    createJSONStorage: () => {
      return () => ({
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
      });
    },
  };
});

import { act } from "react-test-renderer";
import { useVideoStore } from "../video-store.ts";

jest.mock("@/utils/supabase", () => ({
  supabase: {
    rpc: jest.fn(() => Promise.resolve({ error: null })),
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

jest.mock("@/store/auth-store", () => ({
  useAuthStore: {
    getState: () => ({
      currentUser: { id: "user1", username: "test", role: "user" },
    }),
  },
}));

describe("video-store", () => {
  beforeEach(() => {
    useVideoStore.setState({
      videos: [],
      likedVideos: {},
      savedVideos: {},
      isLoading: false,
      error: null,
    });
  });

  it("should add and fetch videos", async () => {
    act(() => {
      useVideoStore.getState().addVideo({
        id: "v1",
        caption: "test",
        hashtags: ["#a"],
        user: {
          id: "user1",
          username: "test",
          avatar: "",
          verified: false,
          role: "user",
        },
        videoUrl: "",
        thumbnailUrl: "",
        likes: 0,
        comments: [],
        timestamp: Date.now(),
      });
    });
    const videos = useVideoStore.getState().videos;
    expect(videos.length).toBe(1);
    expect(videos[0].caption).toBe("test");
  });

  it("should like a video (mocked)", async () => {
    act(() => {
      useVideoStore.getState().addVideo({
        id: "v2",
        caption: "like",
        hashtags: [],
        user: {
          id: "user1",
          username: "test",
          avatar: "",
          verified: false,
          role: "user",
        },
        videoUrl: "",
        thumbnailUrl: "",
        likes: 0,
        comments: [],
        timestamp: Date.now(),
      });
    });
    await useVideoStore.getState().likeVideo("v2");
    // No error expected
    expect(useVideoStore.getState().error).toBeNull();
  });
});
