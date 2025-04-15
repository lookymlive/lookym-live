
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useVideoStore } from '@/store/video-store';
import VideoThumbnail from '@/components/VideoThumbnail';
import Header from '@/components/Header';
import Stories from '@/components/Stories';

import { useEffect } from 'react';

export default function HomeScreen() {
  const { videos, fetchVideos } = useVideoStore();

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Stories />}
        renderItem={({ item }) => (
          <VideoThumbnail video={item} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});