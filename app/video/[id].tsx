import { ActionBar } from "@/components/ActionBar.tsx";
import { AppHeader } from "@/components/AppHeader.tsx";
import { FullScreenStatusView } from "@/components/FullScreenStatusView.tsx";
import { UserInfo } from "@/components/UserInfo.tsx";
import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { useAuthStore } from "@/store/auth-store.ts";
import { useVideoStore } from "@/store/video-store.ts";
import type {
  Comment as CommentType,
  Video as VideoType,
} from "@/types/video.ts";
import { formatLikes, formatTimeAgo } from "@/utils/time-format.ts";
import { Ionicons } from "@expo/vector-icons";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
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

  // Modern header
  const renderHeader = () => (
    <AppHeader
      title={video?.caption ? video.caption.slice(0, 24) : "Video"}
      leftAccessory={
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      }
    />
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <FullScreenStatusView status="loading" message="Cargando video..." />
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
        {renderHeader()}
        <FullScreenStatusView
          status="error"
          message={
            isSessionError
              ? "Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión para ver este video."
              : error
          }
          onRetry={
            isSessionError
              ? () => router.push("/auth/login")
              : () => router.back()
          }
        />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <FullScreenStatusView
          status="empty"
          message="Video no encontrado."
          emptyIconName="Video"
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  // Modern user info and actions
  const renderUserInfo = () => (
    <UserInfo
      avatarUrl={video.user?.avatar}
      name={video.user?.username || "Usuario"}
      secondaryText={formatTimeAgo(video.timestamp)}
      onPress={() => video.user?.id && router.push(`/profile/${video.user.id}`)}
      avatarSize={40}
      showRole
      role={video.user?.role}
    />
  );

  const renderActionBar = () => (
    <ActionBar
      actions={[
        {
          iconName: "heart-outline",
          onPress: handleLike,
          count: video.likes,
          isActive: isLiked,
          color: colors.text,
          fillColor: colors.primary,
        },
        {
          iconName: "bookmark-outline",
          onPress: handleSave,
          isActive: isSaved,
          color: colors.text,
          fillColor: colors.primary,
        },
        {
          iconName: "share-outline",
          onPress: () => {},
          color: colors.text,
        },
        {
          iconName: "send-outline",
          onPress: () => {},
          color: colors.text,
        },
      ]}
      iconSize={28}
      spacing={24}
      layout="iconWithText"
      containerStyle={{ marginVertical: 12 }}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {renderHeader()}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
          {renderUserInfo()}
          <Text style={styles.caption}>{video.caption}</Text>
          <Text style={styles.hashtags}>{video.hashtags?.join(" ")}</Text>
          {renderActionBar()}
        </View>

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

        <View style={styles.commentsSection}>
          <Text style={[styles.commentsSectionTitle, { color: colors.text }]}>
            Comments
          </Text>
          <CommentsList comments={video.comments || []} colors={colors} />
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
            <Ionicons name="send" size={18} color="#fff" />
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
});
