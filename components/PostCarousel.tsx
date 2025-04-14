import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions, FlatList } from 'react-native';
import { PostMedia } from '@/types/post';
import VideoThumbnail from './VideoThumbnail';

interface PostCarouselProps {
  media: PostMedia[];
}

const { width } = Dimensions.get('window');

export default function PostCarousel({ media }: PostCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }: { item: PostMedia }) => {
    if (item.type === 'video') {
      return (
        <VideoThumbnail
          video={{
            id: 'temp_id', // Provide a temporary ID
            user: {
              id: 'temp_user_id',
              username: 'temp_username',
              avatar: '',
              role: 'user',
              verified: false,
            },
            thumbnailUrl: item.thumbnail || '',
            videoUrl: item.url,
            caption: '',
            likes: 0,
            comments: [],
            timestamp: Date.now(),
            hashtags: [],
          }}
        />
      );
    }
    
    return (
      <Image 
        source={{ uri: item.url }} 
        style={styles.mediaItem} 
        resizeMode="cover" 
      />
    );
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      
      {media.length > 1 && (
        <View style={styles.pagination}>
          {media.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: width,
  },
  mediaItem: {
    width,
    height: width,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
});