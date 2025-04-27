import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "@/store/auth-store";
import { useVideoStore } from "@/store/video-store";
import type { Comment as CommentType, Video as VideoType } from "@/types/video";
import { formatLikes, formatTimeAgo } from "@/utils/time-format";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BookmarkIcon,
  Heart,
  Send,
  Share,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const {
    fetchVideoById,
    likeVideo,
    unlikeVideo,
    saveVideo,
    unsaveVideo,
    addComment,
    likedVideos,
    savedVideos,
  } = useVideoStore();
  const { currentUser } = useAuthStore();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const { colors, isDark } = useColorScheme();
  const videoRef = useRef<ExpoVideo>(null);

  // Verifica si el video está likeado/guardado
  const isLiked = video ? !!likedVideos[video.id] : false;
  const isSaved = video ? !!savedVideos[video.id] : false;

  useEffect(() => {
    let isMounted = true;
    async function loadVideo() {
      setLoading(true);
      setError(null);
      try {
        const vid = await fetchVideoById(id as string);
        if (isMounted) {
          setVideo(vid);
        }
      } catch (e: any) {
        setError(e?.message || "Could not load video");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadVideo();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleLike = () => {
    if (!video) return;

    if (isLiked) {
      unlikeVideo(video.id)
        .then(() => {
          // Update local video state
          setVideo((prev) =>
            prev ? { ...prev, likes: Math.max(0, (prev.likes || 0) - 1) } : null
          );
        })
        .catch((err) => console.error("Error unliking video:", err));
    } else {
      likeVideo(video.id)
        .then(() => {
          // Update local video state
          setVideo((prev) =>
            prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null
          );
        })
        .catch((err) => console.error("Error liking video:", err));
    }
  };

  const handleSave = () => {
    if (!video) return;

    if (isSaved) {
      unsaveVideo(video.id);
    } else {
      saveVideo(video.id);
    }
  };

  const handleSubmitComment = async () => {
    if (!video || !comment.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      await addComment(video.id, comment.trim());
      // Refrescar el video para obtener el comentario
      const updatedVideo = await fetchVideoById(video.id);
      setVideo(updatedVideo);
      setComment(""); // Limpiar campo
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading video...</Text>
      </View>
    );
  }

  if (error) {
    const isSessionError =
      error.toLowerCase().includes("session") ||
      error.toLowerCase().includes("auth") ||
      error.toLowerCase().includes("token");
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error, marginBottom: 12 }}>
          {isSessionError
            ? "Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión para ver este video."
            : error}
        </Text>
        {isSessionError ? (
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={[
              styles.backButton,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              Ir a Login
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Video not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.primaryLight }]}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Video Details
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Share color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.videoContainer}>
          <ExpoVideo
            ref={videoRef}
            source={{ uri: video.videoUrl, type: "video/mp4" }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onError={(e) => {
              // Type-safe: handle both event object and string error
              const errorMsg =
                typeof e === "object" &&
                e !== null &&
                "nativeEvent" in e &&
                (e as any).nativeEvent?.error
                  ? (e as any).nativeEvent.error
                  : typeof e === "string"
                  ? e
                  : "Unknown video playback error";
              console.error("Video playback error:", errorMsg);
              setError(errorMsg);
            }}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/profile",
                  params: { userId: video.user.id },
                })
              }
              style={styles.userContainer}
            >
              <Image
                source={{ uri: video.user.avatar }}
                style={styles.userAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={[styles.username, { color: colors.text }]}>
                  {video.user.username}
                </Text>
                <Text
                  style={[styles.userRole, { color: colors.textSecondary }]}
                >
                  {video.user.role === "business" ? "Business" : "User"}
                </Text>
              </View>
            </TouchableOpacity>

            {video.user.role === "business" && (
              <TouchableOpacity
                style={[
                  styles.chatButton,
                  { backgroundColor: colors.primaryLight },
                ]}
                onPress={() => router.push(`/chat/${video.user.id}`)}
              >
                <Text
                  style={[styles.chatButtonText, { color: colors.primary }]}
                >
                  Chat
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.caption, { color: colors.text }]}>
            {video.caption}
          </Text>
          <Text style={[styles.hashtags, { color: colors.primary }]}>
            {video.hashtags?.map((tag) => `#${tag}`).join(" ")}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatLikes(video.likes || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Likes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {video.comments?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Comments
              </Text>
            </View>
            <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
              {formatTimeAgo(video.timestamp)}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Heart
                color={isLiked ? colors.error : colors.text}
                fill={isLiked ? colors.error : "none"}
                size={24}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: isLiked ? colors.error : colors.text,
                  },
                ]}
              >
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <BookmarkIcon
                color={isSaved ? colors.primary : colors.text}
                fill={isSaved ? colors.primary : "none"}
                size={24}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: isSaved ? colors.primary : colors.text,
                  },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsSectionTitle, { color: colors.text }]}>
              Comments
            </Text>
            <CommentsList comments={video.comments || []} colors={colors} />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.commentInputContainer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: isDark ? "#333" : "#f0f0f0",
              color: colors.text,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textSecondary}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: comment.trim()
                ? colors.primary
                : colors.primaryLight,
              opacity: comment.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSubmitComment}
          disabled={!comment.trim() || submittingComment}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send color="#fff" size={18} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

type CommentsListProps = {
  comments: CommentType[];
  colors: any;
};

const CommentsList = ({ comments, colors }: CommentsListProps) => {
  if (!comments || comments.length === 0)
    return (
      <Text style={{ color: colors.textLight, marginTop: 12 }}>
        No comments yet. Be the first to comment!
      </Text>
    );

  return (
    <View style={{ width: "100%", marginTop: 8 }}>
      {comments.map((comment) => (
        <View
          key={comment.id}
          style={[
            styles.commentItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.commentHeader}>
            <Image
              source={{ uri: comment.user.avatar }}
              style={styles.commentAvatar}
              contentFit="cover"
            />
            <View>
              <Text style={[styles.commentUsername, { color: colors.text }]}>
                {comment.user.username}
              </Text>
              <Text
                style={[styles.commentTime, { color: colors.textSecondary }]}
              >
                {formatTimeAgo(comment.timestamp)}
              </Text>
            </View>
          </View>
          <Text style={[styles.commentText, { color: colors.text }]}>
            {comment.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: "600",
    fontSize: 16,
  },
  userRole: {
    fontSize: 14,
  },
  chatButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chatButtonText: {
    fontWeight: "600",
  },
  caption: {
    fontSize: 16,
    marginBottom: 8,
  },
  hashtags: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    marginRight: 16,
  },
  statValue: {
    fontWeight: "600",
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 12,
    marginLeft: "auto",
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  commentItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
});
