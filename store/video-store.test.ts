import { useVideoStore } from "./video-store.ts";
// @ts-ignore
import { useAuthStore } from "./auth-store";

// Mock Supabase client
type SupabaseMock = {
  from: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
  match: jest.Mock;
  rpc: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
  then?: jest.Mock;
  storage: {
    from: jest.Mock;
    upload: jest.Mock;
    getPublicUrl: jest.Mock;
    remove: jest.Mock;
    list: jest.Mock;
  };
  auth: {
    getUser: jest.Mock;
  };
};

const mockSupabase: SupabaseMock = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  limit: jest.fn(),
  insert: jest.fn(),
  delete: jest.fn(),
  match: jest.fn(),
  rpc: jest.fn(),
  order: jest.fn(),
  range: jest.fn(),
  storage: {
    from: jest.fn(),
    upload: jest.fn(() =>
      Promise.resolve({ data: { path: "mock/path" }, error: null })
    ),
    getPublicUrl: jest.fn(() => ({ data: { publicUrl: "mock_url" } })),
    remove: jest.fn(() => Promise.resolve({ error: null })),
    list: jest.fn(() => Promise.resolve({ data: [], error: null })),
  },
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
  },
};

// Mock the createClient function to return our mock client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock the internal supabase instance used in the store
jest.mock("@/utils/supabase.ts", () => ({
  supabase: mockSupabase,
}));

// Mock auth store to control currentUser
jest.mock("./auth-store", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ currentUser: null })),
  },
}));

// Mock utility functions
jest.mock("@/utils/cloudinary.ts", () => ({
  uploadVideo: jest.fn(() => Promise.resolve({ public_id: "mock_id" })),
  getVideoThumbnailUrl: jest.fn(() => "mock_thumbnail_url"),
}));

jest.mock("@/utils/notifications.ts", () => ({
  createVideoLikeNotification: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-async-storage and expo-secure-store for persistence
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock zustand persist storage to avoid setItem errors in tests
jest.mock("zustand/middleware", () => {
  const actual = jest.requireActual("zustand/middleware");
  return {
    ...actual,
    createJSONStorage: (getStorage: any) => {
      // Provide a dummy async storage for tests (API compatible with Zustand)
      return () => {
        return {
          getItem: function (key: string): Promise<string | null> {
            return Promise.resolve(null);
          },
          setItem: function (key: string, value: string): Promise<void> {
            return Promise.resolve();
          },
          removeItem: function (key: string): Promise<void> {
            return Promise.resolve();
          },
        };
      };
    },
  };
});

describe("useVideoStore", () => {
  // Reset store state before each test (optional, depending on testing strategy)
  beforeEach(() => {
    useVideoStore.setState({
      videos: [],
      likedVideos: {},
      savedVideos: {},
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  test("should return initial state", () => {
    const state = useVideoStore.getState();
    expect(state.videos).toEqual([]);
    expect(state.likedVideos).toEqual({});
    expect(state.savedVideos).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test("should like a video successfully", async () => {
    const videoId = "v1";
    const userId = "u1";
    const initialVideos = [
      {
        id: videoId,
        videoUrl: "url1",
        thumbnailurl: "thumb1",
        caption: "cap1",
        hashtags: [],
        createdAt: "date1",
        likes: 0,
        user: {
          id: "u2",
          username: "user2",
          avatar_url: "avatar2",
          verified: false,
          role: "user",
        },
        comments: [],
      },
    ];

    useVideoStore.setState({ videos: initialVideos, likedVideos: {} });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId, username: "user1" },
    });

    // Mock Supabase responses
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null }); // increment_video_likes
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockResolvedValue({ data: null, error: null }); // video_likes insert

    const { likeVideo } = useVideoStore.getState();
    await likeVideo(videoId);

    const state = useVideoStore.getState();
    // Expect likes count to increase and video to be marked as liked
    expect(state.videos[0].likes).toBe(1);
    expect(state.likedVideos[videoId]).toBe(true);
    // Expect Supabase calls
    expect(mockSupabase.rpc).toHaveBeenCalledWith("increment_video_likes", {
      video_id: videoId,
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("video_likes");
    expect(mockSupabase.insert).toHaveBeenCalledWith([
      { user_id: userId, video_id: videoId },
    ]);
    // Expect notification creation call
    expect(
      require("@/utils/notifications.ts").createVideoLikeNotification
    ).toHaveBeenCalledWith(initialVideos[0].user.id, userId, "user1", videoId);
  });

  test("should unlike a video successfully", async () => {
    const videoId = "v1";
    const userId = "u1";
    const initialVideos = [
      {
        id: videoId,
        videoUrl: "url1",
        thumbnailurl: "thumb1",
        caption: "cap1",
        hashtags: [],
        createdAt: "date1",
        likes: 1,
        user: {
          id: "u2",
          username: "user2",
          avatar_url: "avatar2",
          verified: false,
          role: "user",
        },
        comments: [],
      },
    ];

    useVideoStore.setState({
      videos: initialVideos,
      likedVideos: { [videoId]: true },
    });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId, username: "user1" },
    });

    // Mock Supabase responses
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null }); // decrement_video_likes
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.match.mockResolvedValue({ data: null, error: null }); // video_likes delete

    const { unlikeVideo } = useVideoStore.getState();
    await unlikeVideo(videoId);

    const state = useVideoStore.getState();
    // Expect likes count to decrease and video to be marked as unliked
    expect(state.videos[0].likes).toBe(0);
    expect(state.likedVideos[videoId]).toBeUndefined();
    // Expect Supabase calls
    expect(mockSupabase.rpc).toHaveBeenCalledWith("decrement_video_likes", {
      video_id: videoId,
    });
    expect(mockSupabase.from).toHaveBeenCalledWith("video_likes");
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.match).toHaveBeenCalledWith({
      user_id: userId,
      video_id: videoId,
    });
  });

  test("should save a video successfully", async () => {
    const videoId = "v1";
    const userId = "u1";

    useVideoStore.setState({ savedVideos: {} });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId },
    });

    // Mock Supabase response
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue({
      // Return a mock promise-like object
      then: jest.fn((callback) => {
        // Simulate immediate local state update, then async API call
        // For testing, we can directly resolve the promise
        return Promise.resolve({ data: null, error: null }).then(callback);
      }),
    });

    const { saveVideo } = useVideoStore.getState();
    saveVideo(videoId); // saveVideo is not async in the store

    const state = useVideoStore.getState();
    // Expect video to be marked as saved immediately
    expect(state.savedVideos[videoId]).toBe(true);

    // Wait for the async Supabase call to complete (optional, but good practice)
    // We can wait for the insert promise to resolve
    await mockSupabase.insert().then(() => {});

    // Expect Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    expect(mockSupabase.insert).toHaveBeenCalledWith([
      { user_id: userId, video_id: videoId },
    ]);
  });

  test("should unsave a video successfully", async () => {
    const videoId = "v1";
    const userId = "u1";

    useVideoStore.setState({ savedVideos: { [videoId]: true } });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId },
    });

    // Mock Supabase response
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.match.mockReturnValue({
      // Return a mock promise-like object
      then: jest.fn((callback) => {
        // Simulate immediate local state update, then async API call
        // For testing, we can directly resolve the promise
        return Promise.resolve({ data: null, error: null }).then(callback);
      }),
    });

    const { unsaveVideo } = useVideoStore.getState();
    unsaveVideo(videoId); // unsaveVideo is not async in the store

    const state = useVideoStore.getState();
    // Expect video to be marked as unsaved immediately
    expect(state.savedVideos[videoId]).toBeUndefined();

    // Wait for the async Supabase call to complete (optional, but good practice)
    // We can wait for the delete promise to resolve
    await mockSupabase.match().then(() => {});

    // Expect Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.match).toHaveBeenCalledWith({
      user_id: userId,
      video_id: videoId,
    });
  });

  test("should add a comment successfully", async () => {
    const videoId = "v1";
    const userId = "u1";
    const commentText = "Test comment";
    const initialVideos = [
      {
        id: videoId,
        videoUrl: "url1",
        thumbnailurl: "thumb1",
        caption: "cap1",
        hashtags: [],
        createdAt: "date1",
        likes: 0,
        user: {
          id: "u2",
          username: "user2",
          avatar_url: "avatar2",
          verified: false,
          role: "user",
        },
        comments: [],
      },
    ];
    const mockNewCommentData = {
      id: "c1",
      video_id: videoId,
      user_id: userId,
      text: commentText,
      created_at: new Date().toISOString(),
      user: {
        id: userId,
        username: "commenter1",
        avatar_url: "commenter_avatar",
        verified: false,
        role: "user",
      },
    };

    useVideoStore.setState({ videos: initialVideos });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId, username: "commenter1" },
    });

    // Mock Supabase response for inserting comment and selecting user data
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.select.mockResolvedValueOnce({
      data: [mockNewCommentData],
      error: null,
    }); // For insert...select

    const { addComment } = useVideoStore.getState();
    await addComment(videoId, commentText);

    const state = useVideoStore.getState();
    // Find the video in the state
    const updatedVideo = state.videos.find((v: any) => v.id === videoId);
    expect(updatedVideo?.comments.length).toBe(1);
    expect(updatedVideo?.comments[0].text).toBe(commentText);
    expect(updatedVideo?.comments[0].user.id).toBe(userId);

    // Expect Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith("comments");
    expect(mockSupabase.insert).toHaveBeenCalledWith([
      {
        video_id: videoId,
        user_id: userId,
        text: commentText,
      },
    ]);
    expect(mockSupabase.select).toHaveBeenCalledWith("*, user:users(*)");
  });

  test("should upload a video successfully", async () => {
    const userId = "u1";
    const videoUri = "mock_video_uri";
    const caption = "My test video";
    const hashtags = ["test", "video"];
    const mockCloudinaryPublicId = "cloudinary_public_id";
    const mockVideoData = {
      id: "new_video_id",
      user: {
        id: userId,
        username: "uploader",
        avatar: "uploader_avatar",
        verified: false,
        role: "user",
      },
      videoUrl: "mock_url",
      thumbnailUrl: "mock_thumbnail_url",
      caption,
      hashtags,
      likes: 0,
      comments: [],
      timestamp: Date.now(),
    };

    useVideoStore.setState({ videos: [] });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId },
    });

    // Mock Cloudinary upload
    const mockCloudinaryUpload = require("@/utils/cloudinary.ts")
      .uploadVideo as jest.Mock;
    mockCloudinaryUpload.mockResolvedValue({
      public_id: mockCloudinaryPublicId,
    });

    // Mock Supabase insert
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.select.mockResolvedValueOnce({
      data: [
        {
          ...mockVideoData,
        },
      ],
      error: null,
    }); // For insert...select

    const { uploadVideo } = useVideoStore.getState();
    const uploadedVideo = await uploadVideo(videoUri, caption, hashtags);

    const state = useVideoStore.getState();
    // Expect video to be added to the state
    expect(state.videos.length).toBe(1);
    expect(state.videos[0].caption).toBe(caption);
    expect(state.videos[0].hashtags).toEqual(hashtags);
    // Expect correct calls to dependencies
    expect(mockCloudinaryUpload).toHaveBeenCalledWith(
      videoUri,
      expect.any(Function)
    ); // Check for URI and progress callback
    expect(
      require("@/utils/cloudinary.ts").getVideoThumbnailUrl
    ).toHaveBeenCalledWith(mockCloudinaryPublicId);
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    expect(mockSupabase.insert).toHaveBeenCalledWith([
      {
        user_id: userId,
        videoUrl: "mock_url", // Assuming getPublicUrl uses the public_id
        thumbnailUrl: "mock_thumbnail_url",
        caption,
        hashtags,
        // createdAt is generated by DB, likes/comments default
      },
    ]);
    expect(mockSupabase.select).toHaveBeenCalledWith("*, user:users(*)");
    // Expect the uploaded video data to be returned
    expect(uploadedVideo).toEqual(
      expect.objectContaining({ id: "new_video_id", caption, hashtags })
    );
  });

  // TODO: Add more test cases for other actions (fetchVideosByUser, fetchVideoById)
  // TODO: Add test cases for error scenarios
  // TODO: Add test cases for authenticated/unauthenticated user scenarios
  // TODO: Add test cases for persistence if needed
});
// TODO: Add test cases for persistence if needed
// TODO: Add more test cases for other actions (fetchVideosByUser, fetchVideoById)
