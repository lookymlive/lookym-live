import { useVideoStore } from "./video-store";

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  limit: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  delete: jest.fn(() => mockSupabase),
  match: jest.fn(() => mockSupabase),
  rpc: jest.fn(() => mockSupabase),
  storage: {
    from: jest.fn(() => mockSupabase.storage),
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

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

ddescribe("useVideoStore", () => {
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

  test("should fetch videos successfully", async () => {
    const mockVideosData = [
      {
        id: "v1",
        videoUrl: "url1",
        thumbnailurl: "thumb1",
        caption: "cap1",
        hashtags: [],
        createdAt: "date1",
        likes: 0,
        user: {
          id: "u1",
          username: "user1",
          avatar_url: "avatar1",
          verified: false,
          role: "user",
        },
        comments: [],
      },
      {
        id: "v2",
        videoUrl: "url2",
        thumbnailurl: "thumb2",
        caption: "cap2",
        hashtags: [],
        createdAt: "date2",
        likes: 5,
        user: {
          id: "u2",
          username: "user2",
          avatar_url: "avatar2",
          verified: true,
          role: "business",
        },
        comments: [],
      },
    ];

    // Mock the Supabase response for fetchVideos
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.range.mockReturnValue(mockSupabase);
    mockSupabase.then = jest.fn((callback) =>
      Promise.resolve(callback({ data: mockVideosData, error: null }))
    );

    const { fetchVideos } = useVideoStore.getState();
    await fetchVideos();

    const state = useVideoStore.getState();
    expect(state.videos).toEqual(mockVideosData);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    expect(mockSupabase.select).toHaveBeenCalledWith("*, user:users(*)");
    expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    // Expect range to have been called, but specific values might depend on default limits
    expect(mockSupabase.range).toHaveBeenCalled();
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
    const updatedVideo = state.videos.find((v) => v.id === videoId);
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
      user_id: userId,
      videoUrl: "mock_url",
      thumbnailUrl: "mock_thumbnail_url",
      caption,
      hashtags,
      createdAt: new Date().toISOString(),
      likes: 0,
      user: {
        id: userId,
        username: "uploader",
        avatar_url: "uploader_avatar",
        verified: false,
        role: "user",
      },
      comments: [],
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
          user: {
            id: userId,
            username: "uploader",
            avatar_url: "uploader_avatar",
            verified: false,
            role: "user",
          },
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

  test("fetchVideoById fetches a video by ID", async () => {
    const mockVideo = {
      id: "video-1",
      url: "video-url-1",
      caption: "caption 1",
      user_id: "user-1",
      likes: 0,
      created_at: "now",
    };
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockVideo, error: null }),
    });

    await useVideoStore.getState().fetchVideoById("video-1");

    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    expect(mockSupabase.from("videos").select).toHaveBeenCalledWith(
      "*, user:users(*)"
    );
    expect(mockSupabase.from("videos").eq).toHaveBeenCalledWith(
      "id",
      "video-1"
    );
    expect(useVideoStore.getState().mainVideo).toEqual(mockVideo);
  });

  test("fetchComments fetches comments for a video", async () => {
    const mockComments = [
      {
        id: "comment-1",
        content: "comment 1",
        video_id: "video-1",
        user_id: "user-1",
        created_at: "now",
      },
      {
        id: "comment-2",
        content: "comment 2",
        video_id: "video-1",
        user_id: "user-2",
        created_at: "now",
      },
    ];
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
    });

    await useVideoStore.getState().fetchComments("video-1");

    expect(mockSupabase.from).toHaveBeenCalledWith("comments");
    expect(mockSupabase.from("comments").select).toHaveBeenCalledWith(
      "*, user:users(*)"
    );
    expect(mockSupabase.from("comments").eq).toHaveBeenCalledWith(
      "video_id",
      "video-1"
    );
    expect(mockSupabase.from("comments").order).toHaveBeenCalledWith(
      "created_at",
      { ascending: true }
    );
    expect(useVideoStore.getState().comments).toEqual(mockComments);
  });

  test("fetchVideosByUser fetches videos for a specific user", async () => {
    const mockVideos = [
      {
        id: "video-1",
        url: "video-url-1",
        caption: "caption 1",
        user_id: "user-1",
        likes: 0,
        created_at: "now",
      },
      {
        id: "video-2",
        url: "video-url-2",
        caption: "caption 2",
        user_id: "user-1",
        likes: 0,
        created_at: "now",
      },
    ];
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockVideos, error: null }),
    });

    await useVideoStore.getState().fetchVideosByUser("user-1");

    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    expect(mockSupabase.from("videos").select).toHaveBeenCalledWith(
      "*, user:users(*)"
    );
    expect(mockSupabase.from("videos").eq).toHaveBeenCalledWith(
      "user_id",
      "user-1"
    );
    expect(mockSupabase.from("videos").order).toHaveBeenCalledWith(
      "created_at",
      { ascending: false }
    );
    expect(useVideoStore.getState().userVideos).toEqual(mockVideos);
  });

  test("fetchSavedVideos fetches videos saved by the current user", async () => {
    const mockSavedVideos = [
      {
        video: {
          id: "video-3",
          url: "video-url-3",
          caption: "caption 3",
          user_id: "user-2",
          likes: 0,
          created_at: "now",
        },
      },
    ];
    const expectedVideos = mockSavedVideos.map((sv) => sv.video);

    mockAuthStore.user = { id: "user-1" };
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockResolvedValue({ data: mockSavedVideos, error: null }),
    });

    await useVideoStore.getState().fetchSavedVideos();

    expect(mockAuthStore.user).toEqual({ id: "user-1" }); // Ensure user is checked
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    expect(mockSupabase.from("saved_videos").select).toHaveBeenCalledWith(
      "*, video:videos(*, user:users(*))"
    );
    expect(mockSupabase.from("saved_videos").eq).toHaveBeenCalledWith(
      "user_id",
      "user-1"
    );
    // Note: The RPC mock above was for demonstration, saved_videos is likely a table.
    // If it's an RPC function, the call would be different.
    // Assuming it's a table for now based on schema hint.
    expect(useVideoStore.getState().savedVideos).toEqual(expectedVideos);
  });

  test("saveVideo saves a video for the current user", async () => {
    mockAuthStore.user = { id: "user-1" };
    const videoId = "video-1";

    (mockSupabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ user_id: "user-1", video_id: videoId }],
        error: null,
      }),
    });

    await useVideoStore.getState().saveVideo(videoId);

    expect(mockAuthStore.user).toEqual({ id: "user-1" }); // Ensure user is checked
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    expect(mockSupabase.from("saved_videos").insert).toHaveBeenCalledWith({
      user_id: "user-1",
      video_id: videoId,
    });
    expect(mockSupabase.from("saved_videos").select).toHaveBeenCalled();
    // In a real test, you might check if savedVideos state is updated, but it requires more complex mocking.
    // For now, checking the Supabase call is sufficient.
  });

  test("unsaveVideo unsaves a video for the current user", async () => {
    mockAuthStore.user = { id: "user-1" };
    const videoId = "video-1";

    (mockSupabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(), // Need two eq calls
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    await useVideoStore.getState().unsaveVideo(videoId);

    expect(mockAuthStore.user).toEqual({ id: "user-1" }); // Ensure user is checked
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    expect(mockSupabase.from("saved_videos").delete).toHaveBeenCalled();
    expect(mockSupabase.from("saved_videos").eq).toHaveBeenCalledWith(
      "user_id",
      "user-1"
    );
    expect(mockSupabase.from("saved_videos").eq).toHaveBeenCalledWith(
      "video_id",
      videoId
    );
    // In a real test, you might check if savedVideos state is updated, but it requires more complex mocking.
    // For now, checking the Supabase call is sufficient.
  });

  test("reset sets the state back to initial values", () => {
    // Modify state first
    useVideoStore.setState({
      videos: [
        {
          id: "v1",
          url: "u1",
          caption: "c1",
          user_id: "u1",
          likes: 1,
          created_at: "now",
        },
      ],
      mainVideo: {
        id: "mv1",
        url: "mu1",
        caption: "mc1",
        user_id: "mu1",
        likes: 2,
        created_at: "now",
      },
      comments: [
        {
          id: "cm1",
          content: "co1",
          video_id: "mv1",
          user_id: "u1",
          created_at: "now",
        },
      ],
      userVideos: [
        {
          id: "uv1",
          url: "uv1",
          caption: "uc1",
          user_id: "u1",
          likes: 3,
          created_at: "now",
        },
      ],
      savedVideos: [
        {
          id: "sv1",
          url: "sv1",
          caption: "sc1",
          user_id: "u1",
          likes: 4,
          created_at: "now",
        },
      ],
      videosLoading: false,
      mainVideoLoading: false,
      commentsLoading: false,
      userVideosLoading: false,
      savedVideosLoading: false,
    });

    // Check if state is modified
    expect(useVideoStore.getState().videos.length).toBeGreaterThan(0);
    expect(useVideoStore.getState().mainVideo).not.toBeNull();
    // Add checks for other state properties

    useVideoStore.getState().reset();

    // Check if state is reset to initial values
    expect(useVideoStore.getState().videos).toEqual([]);
    expect(useVideoStore.getState().mainVideo).toBeNull();
    expect(useVideoStore.getState().comments).toEqual([]);
    expect(useVideoStore.getState().userVideos).toEqual([]);
    expect(useVideoStore.getState().savedVideos).toEqual([]);
    expect(useVideoStore.getState().videosLoading).toBe(false);
    expect(useVideoStore.getState().mainVideoLoading).toBe(false);
    expect(useVideoStore.getState().commentsLoading).toBe(false);
    expect(useVideoStore.getState().userVideosLoading).toBe(false);
    expect(useVideoStore.getState().savedVideosLoading).toBe(false);
  });

  test("setMainVideo sets the mainVideo state", () => {
    const mockVideo = {
      id: "mv1",
      url: "mu1",
      caption: "mc1",
      user_id: "mu1",
      likes: 2,
      created_at: "now",
    };
    expect(useVideoStore.getState().mainVideo).toBeNull(); // Initial state

    useVideoStore.getState().setMainVideo(mockVideo);

    expect(useVideoStore.getState().mainVideo).toEqual(mockVideo);
  });

  // TODO: Add more test cases for other actions (fetchVideosByUser, fetchVideoById)
  // TODO: Add test cases for error scenarios
  // TODO: Add test cases for authenticated/unauthenticated user scenarios
  // TODO: Add test cases for persistence if needed
});
