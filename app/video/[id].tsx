import { useLocalSearchParams, router } from "expo-router";
import { useVideoStore } from "@/store/video-store";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import React, { useEffect, useState } from "react";
import type { Video as VideoType, Comment as CommentType } from "@/types/video";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { fetchVideoById } = useVideoStore();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading video...</Text>
      </View>
    );
  }

  if (error) {
    const isSessionError =
      error.toLowerCase().includes('session') ||
      error.toLowerCase().includes('auth') ||
      error.toLowerCase().includes('token');
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', marginBottom: 12 }}>
          {isSessionError
            ? 'Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión para ver este video.'
            : error}
        </Text>
        {isSessionError ? (
          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Ir a Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.centered}>
        <Text>Video not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <ExpoVideo
        source={{ uri: video.videoUrl, type: "video/mp4" }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onError={(e) => {
          // Type-safe: handle both event object and string error
          const errorMsg =
            typeof e === "object" && e !== null && "nativeEvent" in e && (e as any).nativeEvent?.error
              ? (e as any).nativeEvent.error
              : typeof e === "string"
              ? e
              : "Unknown video playback error";
          console.error('Video playback error:', errorMsg);
          setError(errorMsg);
        }}
      />
      <Text style={styles.caption}>{video.caption}</Text>
      <Text style={styles.hashtags}>{video.hashtags?.join(" ")}</Text>
      <Text style={styles.meta}>By {video.user?.username || "Unknown"}</Text>
      <Text style={styles.meta}>Likes: {video.likes ?? 0} · Comments: {video.comments?.length ?? 0}</Text>
      <CommentsList comments={video.comments} />
    </ScrollView>
  );
}

type CommentsListProps = { comments: CommentType[] };

const CommentsList = ({ comments }: CommentsListProps) => {
  if (!comments || comments.length === 0) return (
    <Text style={{ color: '#888', marginTop: 12 }}>No comments yet.</Text>
  );
  return (
    <View style={{ width: '100%', marginTop: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Comments</Text>
      {comments.map(comment => (
        <View key={comment.id} style={{ marginBottom: 10, padding: 8, backgroundColor: '#f2f2f2', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>{comment.user.username}</Text>
          <Text>{comment.text}</Text>
          <Text style={{ fontSize: 12, color: '#888' }}>{new Date(comment.timestamp).toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  video: {
    width: 270, // ~90% of a typical phone width
    height: 480, // 9:16 aspect ratio (vertical)
    borderRadius: 16,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginBottom: 16,
    maxWidth: '100%',
    maxHeight: 500,
  },
  caption: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  hashtags: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
    textAlign: "center",
  },
  meta: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
});
