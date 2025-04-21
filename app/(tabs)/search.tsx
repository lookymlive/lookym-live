
import React, { useState, useEffect } from 'react';
import type { Video } from '@/types/video';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useVideoStore } from '@/store/video-store';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export default function SearchScreen() {
  const { colors } = useColorScheme();
  const { videos, fetchVideos } = useVideoStore();
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchVideos();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    const lower = query.toLowerCase();
    setFiltered(
      videos.filter(
        v => v.caption.toLowerCase().includes(lower) ||
             (v.hashtags && v.hashtags.some((tag: string) => tag.toLowerCase().includes(lower)))
      )
    );
  }, [query, videos]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Buscar Videos</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Busca por título o hashtag..."
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : query && filtered.length === 0 ? (
        <Text style={{ marginTop: 20, color: colors.textSecondary }}>No se encontraron resultados.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          style={{ width: '100%' }}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/video/${item.id}`)}>
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>{item.caption}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.hashtags?.map((t: string) => `#${t}`).join(' ')}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', margin: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginHorizontal: 24, marginBottom: 12, fontSize: 16 },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, backgroundColor: '#0001', borderRadius: 10, padding: 8 },
  thumbnail: { width: 60, height: 90, borderRadius: 8, marginRight: 14, backgroundColor: '#ccc' },
  caption: { fontWeight: '600', fontSize: 16 },
});