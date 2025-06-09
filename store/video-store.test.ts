import { useVideoStore } from "./video-store.ts";
// @ts-ignore
import { useAuthStore } from "./auth-store";

// Mock Supabase client
type MockChainable = {
  select: jest.Mock;
  eq: jest.Mock;
  limit: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
  match: jest.Mock;
  single: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
  then: jest.Mock;
};

type SupabaseClientMock = {
  from: jest.Mock<[string], MockChainable>;
  rpc: jest.Mock;
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

// Factory function to create a fresh mockSupabase object
const createMockSupabase = (): SupabaseClientMock => {
  const chainable: MockChainable = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    single: jest.fn(), // Will be resolved by individual tests, this is the terminal method for single fetches
    insert: jest.fn().mockReturnThis(), // Allow chaining .select() after insert
    delete: jest.fn().mockReturnThis(), // Allow chaining .match() after delete
    then: jest.fn((cb) => cb({ data: null, error: null })), // Generic then for un-mocked chains
  };

  const supabaseMock: SupabaseClientMock = {
    from: jest.fn((tableName: string) => {
      // For each call to .from(), return a new instance of the chainable object
      const freshChainable: MockChainable = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(), // Ensure insert also returns a chainable
        delete: jest.fn().mockReturnThis(), // Ensure delete also returns a chainable
        then: jest.fn((cb) => cb({ data: null, error: null })),
      };
      return freshChainable;
    }),
    rpc: jest.fn(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      list: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
    },
  };

  return supabaseMock;
};

// Globally, declare a mutable mockSupabase instance
let mockSupabase: SupabaseClientMock;

// Mock the createClient function to return our mutable mock client
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock the internal supabase instance used in the store, pointing to the mutable instance
jest.mock("@/utils/supabase.ts", () => ({
  // Use a getter to ensure the latest mockSupabase is always returned
  get supabase() {
    return mockSupabase;
  },
}));

// Mock auth store to control currentUser
jest.mock("./auth-store", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ currentUser: null })),
  },
}));

// Mock utility functions
jest.mock("@/utils/cloudinary.ts", () => ({
  uploadVideo: jest.fn(), // Will be mocked with specific resolved value in tests
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

describe("useVideoStore", () => {
  // Reset store state before each test (optional, depending on testing strategy)
  beforeEach(() => {
    // Create a fresh mock instance for each test
    mockSupabase = createMockSupabase();

    useVideoStore.setState({
      videos: [],
      likedVideos: {},
      savedVideos: {},
      isLoading: false,
      error: null,
    });
    // jest.clearAllMocks() is removed because we are re-creating the mock instance

    // Set default resolved values for the newly created mocks
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
    mockSupabase.storage.upload.mockResolvedValue({ data: null, error: null });
    mockSupabase.storage.remove.mockResolvedValue({ data: null, error: null });
    mockSupabase.storage.list.mockResolvedValue({ data: null, error: null });
    mockSupabase.auth.getUser.mockResolvedValue({ data: null, error: null });

    // Clear mocks for other utilities that are mocked globally
    jest.requireMock("@/utils/cloudinary.ts").uploadVideo.mockClear();
    jest
      .requireMock("@/utils/notifications.ts")
      .createVideoLikeNotification.mockClear();
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
        thumbnailUrl: "thumb1",
        caption: "cap1",
        hashtags: [],
        timestamp: Date.now(),
        likes: 0,
        user: {
          id: "u2",
          username: "user2",
          avatar: "avatar2",
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

    // Mock Supabase responses for this specific test
    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null }); // increment_video_likes

    // Capture the specific mock chain for video_likes
    const videoLikesTableMock = mockSupabase.from("video_likes");
    videoLikesTableMock.insert.mockResolvedValueOnce({ data: [], error: null }); // video_likes insert

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
    // Assert on the captured insert mock
    expect(videoLikesTableMock.insert).toHaveBeenCalledWith([
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
        thumbnailUrl: "thumb1",
        caption: "cap1",
        hashtags: [],
        timestamp: Date.now(),
        likes: 1,
        user: {
          id: "u2",
          username: "user2",
          avatar: "avatar2",
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

    // Mock Supabase responses for this specific test
    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null }); // decrement_video_likes

    // Capture the specific mock chain for video_likes
    const videoLikesTableMock = mockSupabase.from("video_likes");
    videoLikesTableMock.delete.mockReturnThis(); // delete returns this to allow chaining match
    videoLikesTableMock.match.mockResolvedValueOnce({ data: [], error: null }); // match is terminal

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
    // Assert on the captured delete and match mocks
    expect(videoLikesTableMock.delete).toHaveBeenCalled();
    expect(videoLikesTableMock.match).toHaveBeenCalledWith({
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

    // Capture the specific mock chain for saved_videos
    const savedVideosTableMock = mockSupabase.from("saved_videos");
    savedVideosTableMock.insert.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { saveVideo } = useVideoStore.getState();
    saveVideo(videoId); // saveVideo is not async in the store

    const state = useVideoStore.getState();
    // Expect video to be marked as saved immediately
    expect(state.savedVideos[videoId]).toBe(true);

    // No need to await mock.results[0].value as saveVideo is not async in the store
    // The effect of insert is observed by the state change

    // Expect Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    // Assert on the captured insert mock
    expect(savedVideosTableMock.insert).toHaveBeenCalledWith([
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

    // Capture the specific mock chain for saved_videos
    const savedVideosTableMock = mockSupabase.from("saved_videos");
    savedVideosTableMock.delete.mockReturnThis(); // delete returns this to allow chaining match
    savedVideosTableMock.match.mockResolvedValueOnce({ data: [], error: null });

    const { unsaveVideo } = useVideoStore.getState();
    unsaveVideo(videoId); // unsaveVideo is not async in the store

    const state = useVideoStore.getState();
    // Expect video to be marked as unsaved immediately
    expect(state.savedVideos[videoId]).toBeUndefined();

    // No need to await mock.results[0].value as unsaveVideo is not async in the store
    // The effect of delete is observed by the state change

    // Expect Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith("saved_videos");
    // Assert on the captured delete and match mocks
    expect(savedVideosTableMock.delete).toHaveBeenCalled();
    expect(savedVideosTableMock.match).toHaveBeenCalledWith({
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
        thumbnailUrl: "thumb1",
        caption: "cap1",
        hashtags: [],
        timestamp: Date.now(),
        likes: 0,
        user: {
          id: "u2",
          username: "user2",
          avatar: "avatar2",
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

    // Capture the specific mock chain for comments
    const commentsTableMock = mockSupabase.from("comments");
    commentsTableMock.insert.mockResolvedValueOnce({
      data: [mockNewCommentData],
      error: null,
    });
    commentsTableMock.select.mockResolvedValueOnce({
      data: [mockNewCommentData],
      error: null,
    });

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
    // Assert on the captured insert and select mocks
    expect(commentsTableMock.insert).toHaveBeenCalledWith([
      {
        video_id: videoId,
        user_id: userId,
        text: commentText,
      },
    ]);
    expect(commentsTableMock.select).toHaveBeenCalledWith("*, user:users(*)");
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
      video_url: "mock_video_url", // Matches DB schema
      thumbnail_url: "mock_thumbnail_url", // Matches DB schema
      caption,
      hashtags,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    useVideoStore.setState({ videos: [] });
    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      currentUser: { id: userId },
    });

    // Mock Cloudinary upload
    const mockCloudinaryUpload = require("@/utils/cloudinary.ts")
      .uploadVideo as jest.Mock;
    mockCloudinaryUpload.mockResolvedValueOnce({
      public_id: mockCloudinaryPublicId,
      secure_url: "mock_video_url",
    });

    // Capture the specific mock chain for videos
    const videosTableMock = mockSupabase.from("videos");
    videosTableMock.insert.mockResolvedValueOnce({
      data: [mockVideoData],
      error: null,
    });
    videosTableMock.select.mockResolvedValueOnce({
      data: [mockVideoData],
      error: null,
    });

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
      undefined // No options provided in test
    );
    expect(
      require("@/utils/cloudinary.ts").getVideoThumbnailUrl
    ).toHaveBeenCalledWith(mockCloudinaryPublicId);
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    // Assert on the captured insert and select mocks
    expect(videosTableMock.insert).toHaveBeenCalledWith([
      {
        user_id: userId,
        video_url: "mock_video_url",
        thumbnail_url: "mock_thumbnail_url",
        caption,
        hashtags,
        likes: 0,
      },
    ]);
    expect(videosTableMock.select).toHaveBeenCalledWith(
      `*, user:users(*), comments:comments(*, user:users(*))`
    );
    // Expect the uploaded video data to be returned
    expect(uploadedVideo).toEqual(
      expect.objectContaining({ id: "new_video_id", caption, hashtags })
    );
  });

  test("should fetch videos successfully", async () => {
    const mockVideosData = [
      {
        id: "v1",
        video_url: "url1",
        thumbnail_url: "thumb1",
        caption: "cap1",
        hashtags: [],
        created_at: new Date().toISOString(),
        likes: 5,
        user: {
          id: "u1",
          username: "user1",
          avatar_url: "avatar1",
          verified: false,
          role: "user",
        },
        comments: [],
      },
    ];

    // Capture the specific mock chain for videos
    const videosTableMock = mockSupabase.from("videos");
    videosTableMock.select.mockReturnThis(); // select returns this for chaining
    videosTableMock.order.mockReturnThis(); // order returns this for chaining
    videosTableMock.range.mockResolvedValueOnce({
      // range is terminal
      data: mockVideosData,
      error: null,
    });

    const { fetchVideos } = useVideoStore.getState();
    await fetchVideos();

    const state = useVideoStore.getState();
    expect(state.videos.length).toBe(1);
    expect(state.videos[0].id).toBe("v1");
    expect(state.isLoading).toBe(false);
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    // Assert on the captured select, order, and range mocks
    expect(videosTableMock.select).toHaveBeenCalledWith(
      `*, user:users(*), comments:comments(*, user:users(*))`
    );
    expect(videosTableMock.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(videosTableMock.range).toHaveBeenCalledWith(0, 9);
  });

  test("should fetch videos by user successfully", async () => {
    const userId = "u1";
    const mockVideosData = [
      {
        id: "v1",
        video_url: "url1",
        thumbnail_url: "thumb1",
        caption: "cap1",
        hashtags: [],
        created_at: new Date().toISOString(),
        likes: 5,
        user: {
          id: userId,
          username: "user1",
          avatar_url: "avatar1",
          verified: false,
          role: "user",
        },
        comments: [],
      },
    ];

    // Capture the specific mock chain for videos
    const videosTableMock = mockSupabase.from("videos");
    videosTableMock.select.mockReturnThis(); // select returns this for chaining
    videosTableMock.eq.mockReturnThis(); // eq returns this for chaining
    videosTableMock.order.mockResolvedValueOnce({
      // order is terminal
      data: mockVideosData,
      error: null,
    });

    const { fetchVideosByUser } = useVideoStore.getState();
    await fetchVideosByUser(userId);

    const state = useVideoStore.getState();
    expect(state.videos.length).toBe(1);
    expect(state.videos[0].id).toBe("v1");
    expect(state.videos[0].user.id).toBe(userId);
    expect(state.isLoading).toBe(false);
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    // Assert on the captured select, eq, and order mocks
    expect(videosTableMock.select).toHaveBeenCalledWith(`
              *,
              user:users(*),
              comments:comments(
                *,
                user:users(*)
              )
            `);
    expect(videosTableMock.eq).toHaveBeenCalledWith("user_id", userId);
    expect(videosTableMock.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  test("should fetch video by ID successfully", async () => {
    const videoId = "v1";
    const mockVideoData = {
      id: videoId,
      video_url: "url1",
      thumbnail_url: "thumb1",
      caption: "cap1",
      hashtags: [],
      created_at: new Date().toISOString(),
      likes: 10,
      user: {
        id: "u1",
        username: "user1",
        avatar_url: "avatar1",
        verified: false,
        role: "user",
      },
      products: [],
      tags: [],
    };

    // Capture the specific mock chain for videos
    const videosTableMock = mockSupabase.from("videos");
    videosTableMock.select.mockReturnThis(); // select returns this for chaining
    videosTableMock.eq.mockReturnThis(); // eq returns this for chaining
    videosTableMock.single.mockResolvedValueOnce({
      // single is terminal
      data: mockVideoData,
      error: null,
    });

    const { fetchVideoById } = useVideoStore.getState();
    const video = await fetchVideoById(videoId);

    expect(video).not.toBeNull();
    expect(video?.id).toBe(videoId);
    expect(video?.mainVideoLoading).toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith("videos");
    // Assert on the captured select, eq, and single mocks
    expect(videosTableMock.select).toHaveBeenCalledWith(
      "*, user:users(*), products(*), tags(*)"
    );
    expect(videosTableMock.eq).toHaveBeenCalledWith("id", videoId);
    expect(videosTableMock.single).toHaveBeenCalled();
  });

  test("should set main video", () => {
    const mockVideo: any = { id: "v1" };
    const { setMainVideo } = useVideoStore.getState();
    setMainVideo(mockVideo);
    expect(useVideoStore.getState().mainVideo).toEqual(mockVideo);
  });
});
