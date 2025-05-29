import { useVideoStore } from "@/store/video-store.ts";
import { Video } from "@/types/video.ts";
import { formatLikes, formatTimeAgo } from "@/utils/time-format.ts";
import { Ionicons } from "@expo/vector-icons";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "../hooks/useColorScheme.ts";

interface VideoPostProps {
  video: Video;
  isActive?: boolean;
  isVisible?: boolean;
}

export default function VideoPost({
  video,
  isActive = false,
  isVisible = false,
}: VideoPostProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [errorRetryCount, setErrorRetryCount] = useState(0);
  const videoRef = useRef<ExpoVideo>(null);
  const {
    likedVideos,
    savedVideos,
    likeVideo,
    unlikeVideo,
    saveVideo,
    unsaveVideo,
  } = useVideoStore();
  const { isDark, colors } = useColorScheme();

  const isLiked = !!likedVideos[video.id];
  const isSaved = !!savedVideos[video.id];

  // Detectar y manejar errores de video
  const handleVideoError = (error: any) => {
    console.error("Video playback error:", error);

    // Verificar si es un error específico de dispositivos Samsung con Exynos
    if (
      error &&
      (error.message?.includes("Decoder init failed: OMX.Exynos") ||
        error.message?.includes("OMX.Exynos"))
    ) {
      console.log("Detectado error de decodificador hardware Exynos");
      setVideoError(true);

      // Solo mostrar alerta en el primer error
      if (errorRetryCount === 0) {
        // Opcional: informar al usuario sobre el problema
        Alert.alert(
          "Problema de reproducción de video",
          "Su dispositivo tiene dificultades para reproducir este video. Se mostrará una versión simplificada.",
          [{ text: "OK" }]
        );
      }

      setErrorRetryCount((prev) => prev + 1);
    } else {
      // Otro tipo de error
      setVideoError(true);
    }
  };

  // Reintentar reproducción
  const retryPlayback = () => {
    if (errorRetryCount < 2) {
      setVideoError(false);
      setErrorRetryCount((prev) => prev + 1);
    }
  };

  // Efecto para manejar la reproducción automática basada en visibilidad
  useEffect(() => {
    if (!videoRef.current || videoError) return;

    const handleVisibilityChange = async () => {
      try {
        if (isActive && isVisible) {
          await videoRef.current?.playAsync();
          setIsPlaying(true);
          // Ocultar controles después de un tiempo
          setTimeout(() => setShowControls(false), 2000);
        } else {
          await videoRef.current?.pauseAsync();
          setIsPlaying(false);
          setShowControls(true);
        }
      } catch (error) {
        console.error("Error changing video playback state:", error);
        handleVideoError(error);
      }
    };

    handleVisibilityChange();
  }, [isActive, isVisible, videoError]);

  const handlePlayPause = async () => {
    if (!videoRef.current || videoError) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }

      setIsPlaying(!isPlaying);

      // Hide controls after a delay
      if (!isPlaying) {
        setTimeout(() => {
          setShowControls(false);
        }, 2000);
      } else {
        setShowControls(true);
      }
    } catch (error) {
      console.error("Error on play/pause:", error);
      handleVideoError(error);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      unlikeVideo(video.id);
    } else {
      likeVideo(video.id);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      unsaveVideo(video.id);
    } else {
      saveVideo(video.id);
    }
  };

  const handleComment = () => {
    // Navigate to comments screen
    router.push(`/video/${video.id}`);
  };

  const handleShare = () => {
    // Open share dialog
    console.log("Open share dialog");
  };

  const handleUserProfile = () => {
    // Navigate to user profile
    router.push({
      pathname: "/(tabs)/profile",
      params: { userId: video.user.id },
    });
  };

  const handleVideoPress = () => {
    if (videoError) {
      retryPlayback();
      return;
    }

    setShowControls(!showControls);
    handlePlayPause();
  };

  const handleChatWithBusiness = () => {
    if (video.user.role === "business") {
      router.push(`/chat/${video.user.id}`);
    }
  };

  const handleDownloadPrevention = () => {
    Alert.alert(
      "Download Disabled",
      "Downloading videos is not allowed in this app."
    );
  };

  // Renderizar componente de video o fallback de imagen según el estado
  const renderVideoContent = () => {
    if (Platform.OS === "web") {
      return (
        <video
          style={styles.video as any}
          controlsList="nodownload"
          autoPlay
          playsInline
          muted
          poster={video.thumbnailUrl}
          onError={(e) => handleVideoError(e)}
          onContextMenu={(e) => {
            e.preventDefault();
            handleDownloadPrevention();
          }}
        >
          <source src={video.videoUrl} type={video.mimeType || "video/mp4"} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (videoError) {
      // Fallback a imagen estática cuando hay error de video
      return (
        <View style={styles.errorContainer}>
          <Image
            source={{ uri: video.thumbnailUrl || video.videoUrl }}
            style={styles.thumbnailImage}
            contentFit="cover"
          />
          <View style={styles.errorOverlay}>
            <Ionicons name="warning-outline" size={40} color="#fff" />
            <Text style={styles.errorText}>Error de reproducción</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryPlayback}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <ExpoVideo
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
          isLooping
          posterSource={{ uri: video.thumbnailUrl }}
          onError={handleVideoError}
        />
      );
    }
  };

  if (Platform.OS === "web") {
    console.log("video.videoUrl:", video.videoUrl);
    console.log("video object:", video);
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserProfile}>
          <Image
            source={{ uri: video.user.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View>
            <Text style={[styles.username, { color: colors.text }]}>
              {video.user.username}
            </Text>
            {video.user.role === "business" && (
              <Text style={[styles.businessTag, { color: colors.primary }]}>
                Business
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {video.user.role === "business" && (
          <TouchableOpacity
            style={[
              styles.chatButton,
              { backgroundColor: colors.primaryLight },
            ]}
            onPress={handleChatWithBusiness}
          >
            <Text style={[styles.chatButtonText, { color: colors.primary }]}>
              Chat
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
      >
        {renderVideoContent()}

        {showControls && !videoError && (
          <View style={styles.videoControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <View style={styles.playButtonInner}>
                {isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View
                      style={[styles.pauseBar, { backgroundColor: "#fff" }]}
                    />
                    <View
                      style={[styles.pauseBar, { backgroundColor: "#fff" }]}
                    />
                  </View>
                ) : (
                  <Ionicons
                    name="play-circle-outline"
                    size={24}
                    color="#fff"
                    fill="#fff"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? colors.error : colors.text}
              fill={isLiked ? colors.error : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Ionicons name="chatbubble-outline" size={26} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="send-outline" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={26}
            color={colors.text}
            fill={isSaved ? colors.text : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.likes, { color: colors.text }]}>
          {formatLikes(video.likes)} likes
        </Text>

        <View style={styles.captionContainer}>
          <Text style={[styles.caption, { color: colors.text }]}>
            <Text style={styles.username}>{video.user.username}</Text>{" "}
            {video.caption}{" "}
            {video.hashtags.map((tag) => (
              <Text
                key={tag}
                style={[styles.hashtag, { color: colors.primary }]}
              >
                #{tag}{" "}
              </Text>
            ))}
          </Text>
        </View>

        {video.comments.length > 0 && (
          <TouchableOpacity onPress={handleComment}>
            <Text
              style={[styles.viewComments, { color: colors.textSecondary }]}
            >
              View{" "}
              {video.comments.length > 1
                ? `all ${video.comments.length} comments`
                : "comment"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatTimeAgo(video.timestamp)} ago
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
  },
  businessTag: {
    fontSize: 12,
    fontWeight: "500",
  },
  chatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    position: "relative",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  poster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  webVideoFallback: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  videoControls: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonInner: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIcon: {
    width: 24,
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: "600",
    marginBottom: 6,
  },
  captionContainer: {
    marginBottom: 6,
  },
  caption: {
    lineHeight: 18,
  },
  hashtag: {
    fontWeight: "500",
  },
  viewComments: {
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
