import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';

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
        Prueba de videos (Supabase)
      </Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {Platform.OS === 'web' ? (
              <video
                src={item.video_url}
                controls
                style={{
                  width: '100%',
                  aspectRatio: '9/16',
                  borderRadius: 16,
                  background: '#000',
                  objectFit: 'cover',
                }}
                poster={item.thumbnail_url}
              />
            ) : (
              <ExpoVideo
                source={{ uri: item.video_url }}
                style={{ width: '100%', aspectRatio: 9/16, borderRadius: 16, backgroundColor: '#000' }}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
              />
            )}
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
