import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabase.ts';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { getVideoUrl, getVideoThumbnailUrl } from '@/utils/cloudinary.ts';

interface VideoRow {
  id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  created_at: string;
}

export default function VideoTestScreen() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setVideos(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#111' }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginBottom: 20 }}>
        Lookym (Supabase)
      </Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {(() => {
              // Detectar si es un video de Cloudinary
              const isCloudinary = item.video_url.includes('cloudinary.com');
              const videoUrl = isCloudinary
                ? getVideoUrl(
                    // extraer publicId del video_url
                    item.video_url.split('/upload/')[1]?.replace(/\.(mp4|webm|mov|ogg|mkv|avi).*$/, '') || '',
                    { quality: 'auto', format: 'mp4' }
                  )
                : item.video_url;
              const thumbnailUrl = isCloudinary
                ? getVideoThumbnailUrl(
                    item.video_url.split('/upload/')[1]?.replace(/\.(mp4|webm|mov|ogg|mkv|avi).*$/, '') || '',
                    { quality: 'auto', format: 'jpg', time: '1' }
                  )
                : item.thumbnail_url;
              return Platform.OS === 'web' ? (
                <video
                  src={videoUrl}
                  controls
                  style={{
                    width: '100%',
                    aspectRatio: '9/16',
                    borderRadius: 16,
                    background: '#000',
                    objectFit: 'cover',
                  }}
                  poster={thumbnailUrl}
                />
              ) : (
                <ExpoVideo
                  source={{ uri: videoUrl }}
                  style={{ width: '100%', aspectRatio: 9/16, borderRadius: 16, backgroundColor: '#000' }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
                  posterStyle={{ resizeMode: 'cover', borderRadius: 16 }}
                />
              );
            })()}
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.date}>{item.created_at}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  date: {
    color: '#aaa',
    fontSize: 12,
  },
});
