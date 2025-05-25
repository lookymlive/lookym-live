import { useVideoStore } from "@/store/video-store.ts";
import { Video } from "@/types/video.ts";
import { formatTimeAgo } from "@/utils/time-format.ts";
import { Image } from "expo-image";
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
}

import { Video as ExpoVideo, ResizeMode } from "expo-av";

export default function VideoThumbnail({ video }: VideoThumbnailProps) {
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
              <AlertTriangle size={30} color="#fff" />
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
          <MoreHorizontal size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {renderVideoContent()}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <Heart
            size={24}
            color={isLiked ? "#F91880" : "#000"}
            fill={isLiked ? "#F91880" : "none"}
          />
          <Text style={styles.actionText}>{video.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <MessageCircle size={24} color="#000" />
          <Text style={styles.actionText}>{video.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={handleSave}>
          <Bookmark
            size={24}
            color={isSaved ? "#FFCC00" : "#000"}
            fill={isSaved ? "#FFCC00" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Send size={24} color="#000" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  verified: {
    color: "#1D9BF0",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontWeight: "600",
  },
  captionContainer: {
    paddingHorizontal: 4,
  },
  caption: {
    fontSize: 14,
    marginBottom: 4,
  },
  hashtags: {
    fontSize: 14,
    color: "#1D9BF0",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#71767B",
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
