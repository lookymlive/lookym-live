import { useVideoStore } from "@/store/video-store.ts";
import { Video } from "@/types/video.ts";
import { formatTimeAgo } from "@/utils/time-format.ts";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VideoThumbnailProps {
  video: Video;
  height?: number;
}

import { Video as ExpoVideo, ResizeMode } from "expo-av";

export default function VideoThumbnail({ video, height }: VideoThumbnailProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [errorRetryCount, setErrorRetryCount] = useState(0);
  // Modern web: video always visible, styled like Instagram/TikTok

  const {
    likedVideos,
    savedVideos,
    likeVideo,
    unlikeVideo,
    saveVideo,
    unsaveVideo,
  } = useVideoStore();

  const isLiked = likedVideos[video.id] || false;
  const isSaved = savedVideos[video.id] || false;

  // Manejar errores de video
  const handleVideoError = (error: any) => {
    console.error("Video thumbnail error:", error);

    // Verificar si es un error específico de dispositivos Samsung con Exynos
    if (
      error &&
      (error.message?.includes("Decoder init failed: OMX.Exynos") ||
        error.message?.includes("OMX.Exynos"))
    ) {
      console.log(
        "Detectado error de decodificador hardware Exynos en miniatura"
      );
      setVideoError(true);

      // Mostrar alerta solo una vez
      if (errorRetryCount === 0) {
        setShowPlayer(false);
      }

      setErrorRetryCount((prev) => prev + 1);
    } else {
      // Otro tipo de error
      setVideoError(true);
      setShowPlayer(false);
    }
  };

  // Reintentar reproducción
  const retryPlayback = () => {
    if (errorRetryCount < 2) {
      setVideoError(false);
      setShowPlayer(true);
      setErrorRetryCount((prev) => prev + 1);
    } else {
      // Demasiados intentos, quedarse con la miniatura
      setShowPlayer(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeVideo(video.id);
      } else {
        await likeVideo(video.id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      unsaveVideo(video.id);
    } else {
      saveVideo(video.id);
    }
  };

  const renderVideoContent = () => {
    if (Platform.OS === "web") {
      return (
        <video
          src={video.videoUrl}
          controls
          autoPlay={false}
          playsInline
          muted={false}
          poster={video.thumbnailUrl}
          style={{
            width: "100%",
            display: "block",
            aspectRatio: "9/16",
            objectFit: "cover",
            background: "#000",
            borderRadius: 20,
            marginBottom: 12,
          }}
          onError={(e) => handleVideoError(e)}
        />
      );
    } else if (showPlayer) {
      if (videoError) {
        // Fallback cuando hay error de video
        return (
          <View style={styles.errorContainer}>
            <Image
              source={{ uri: video.thumbnailUrl || video.videoUrl }}
              style={{
                width: "100%",
                aspectRatio: 9 / 16,
                backgroundColor: "#000",
              }}
              contentFit="cover"
            />
            <View style={styles.errorOverlay}>
              <Ionicons name="warning-outline" size={30} color="#fff" />
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
            source={{ uri: video.videoUrl }}
            style={{
              width: "100%",
              aspectRatio: 9 / 16,
              backgroundColor: "#000",
            }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            onError={handleVideoError}
          />
        );
      }
    } else {
      // Miniatura estática predeterminada
      return (
        <TouchableOpacity onPress={() => setShowPlayer(true)}>
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={{
              width: "100%",
              aspectRatio: 9 / 16,
              backgroundColor: "#000",
            }}
          />
        </TouchableOpacity>
      );
    }
  };

  return (
    <LinearGradient
      colors={["#4f8cff", "#a259f7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBg}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: video.user.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View>
              <Text style={styles.username}>{video.user.username}</Text>
              {video.user.verified && (
                <Text style={styles.verified}>Verified</Text>
              )}
            </View>
          </View>
          <TouchableOpacity>
            <MoreHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {renderVideoContent()}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={handleLike}>
            <Heart
              size={28}
              color={isLiked ? "#F91880" : "#4f8cff"}
              fill={isLiked ? "#F91880" : "none"}
            />
            <Text style={styles.actionText}>{video.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <MessageCircle size={28} color="#4f8cff" />
            <Text style={styles.actionText}>{video.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={handleSave}>
            <Bookmark
              size={28}
              color={isSaved ? "#FFCC00" : "#4f8cff"}
              fill={isSaved ? "#FFCC00" : "none"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.action}>
            <Send size={28} color="#4f8cff" />
          </TouchableOpacity>
        </View>

        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{video.caption}</Text>
          <Text style={styles.hashtags}>
            {video.hashtags?.map((tag) => `#${tag}`).join(" ")}
          </Text>
          <Text style={styles.timestamp}>{formatTimeAgo(video.timestamp)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    borderRadius: 28,
    margin: 12,
    padding: 0,
    minHeight: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  container: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    padding: 16,
    margin: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
  verified: {
    fontSize: 12,
    color: "#a259f7",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  action: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 6,
    shadowColor: "#4f8cff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: "#4f8cff",
    fontWeight: "bold",
    marginTop: 2,
  },
  captionContainer: {
    marginTop: 8,
  },
  caption: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 4,
  },
  hashtags: {
    fontSize: 14,
    color: "#e0e0e0",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#bdbdbd",
  },
  errorContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 9 / 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
