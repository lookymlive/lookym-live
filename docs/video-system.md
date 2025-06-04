# LOOKYM - Sistema de Video

Este documento describe el sistema de video utilizado en la aplicación LOOKYM.

## Arquitectura de Video

LOOKYM utiliza una combinación de Cloudinary para almacenamiento y entrega de videos, y Supabase para almacenamiento de metadatos e interacciones. El sistema ha sido optimizado para ofrecer una experiencia fluida y eficiente.

### Características Principales

- Reproducción optimizada con buffering inteligente
- Compresión adaptativa según la conexión del usuario
- Generación automática de miniaturas de alta calidad
- Sistema de caché para mejorar el rendimiento

## Video Upload Flow

1. User selects a video from their device
2. The app uploads the video to Cloudinary
3. Cloudinary processes the video (transcoding, thumbnail generation)
4. The app saves the video metadata to Supabase
5. The video becomes available in the feed

## Video Data Structure

```typescript
interface Video {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
    role: 'user' | 'business';
  };
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: Comment[];
  timestamp: number;
}

interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
    role: 'user' | 'business';
  };
  text: string;
  timestamp: number;
  likes: number;
}
```

## Video Components

### VideoPost

The main component for displaying a video in the feed:

```tsx
<VideoPost
  video={video}
  onLike={handleLike}
  onComment={handleComment}
  onShare={handleShare}
/>
```

### VideoPlayer

Custom video player with controls:

```tsx
<VideoPlayer
  uri={video.videoUrl}
  thumbnailUri={video.thumbnailUrl}
  autoPlay={isVisible}
  muted={isMuted}
  onPlaybackStatusUpdate={handlePlaybackUpdate}
/>
```

### VideoThumbnail

Thumbnail preview of a video:

```tsx
<VideoThumbnail
  uri={video.thumbnailUrl}
  onPress={() => navigateToVideo(video.id)}
/>
```

## Video Store

The video state is managed through the `useVideoStore` Zustand store:

```typescript
interface VideoState {
  videos: Video[];
  likedVideos: Record<string, boolean>;
  savedVideos: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  likeVideo: (videoId: string) => Promise<void>;
  unlikeVideo: (videoId: string) => Promise<void>;
  saveVideo: (videoId: string) => void;
  unsaveVideo: (videoId: string) => void;
  addComment: (videoId: string, comment: string) => Promise<void>;
  uploadVideo: (videoUri: string, caption: string, hashtags: string[]) => Promise<void>;
  fetchVideos: (page?: number, limit?: number) => Promise<void>;
  fetchVideosByUser: (userId: string) => Promise<void>;
  fetchVideoById: (videoId: string) => Promise<Video | null>;
}
```

## Video Upload

The video upload process is handled by the `uploadVideo` function:

```typescript
uploadVideo: async (videoUri: string, caption: string, hashtags: string[]) => {
  try {
    set({ isLoading: true, error: null });
    
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'business') throw new Error('Only business accounts can upload videos');
    
    // 1. Upload to Cloudinary
    const uploadResult = await uploadVideo(videoUri, {
      resource_type: 'video',
      folder: `lookym/${currentUser.id}`,
      public_id: `video_${Date.now()}`,
    });
    
    // 2. Save to Supabase
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          user_id: currentUser.id,
          video_url: uploadResult.secure_url,
          thumbnail_url: getVideoThumbnailUrl(uploadResult.public_id),
          caption,
          hashtags,
        }
      ])
      .select('*, user:users(*)');
      
    if (error) throw error;
    
    // 3. Format the video for our app
    const newVideo: Video = {
      id: data[0].id,
      user: {
        id: data[0].user.id,
        username: data[0].user.username,
        avatar: data[0].user.avatar_url,
        verified: data[0].user.verified,
        role: data[0].user.role,
      },
      videoUrl: data[0].video_url,
      thumbnailUrl: data[0].thumbnail_url,
      caption: data[0].caption,
      hashtags: data[0].hashtags,
      likes: 0,
      comments: [],
      timestamp: new Date(data[0].created_at).getTime(),
    };
    
    // 4. Update local state
    set((state) => ({
      videos: [newVideo, ...state.videos],
      isLoading: false
    }));
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
}
```

## Video Playback

The application uses Expo AV for video playback:

```tsx
import { Video } from 'expo-av';

function VideoPlayer({ uri, thumbnailUri, autoPlay, muted }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.playAsync();
    } else if (!autoPlay && videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [autoPlay]);
  
  return (
    <View>
      <Video
        ref={videoRef}
        source={{ uri }}
        posterSource={{ uri: thumbnailUri }}
        usePoster={true}
        resizeMode="cover"
        isLooping
        isMuted={muted}
        style={{ width: '100%', height: 300 }}
      />
    </View>
  );
}
```

## Video Feed

The video feed is implemented using FlatList with optimizations:

```tsx
<FlatList
  data={videos}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <VideoPost
      video={item}
      isVisible={visibleIndex === index}
      onViewableChange={handleViewableChange}
    />
  )}
  onViewableItemsChanged={onViewableItemsChanged}
  viewabilityConfig={{
    itemVisiblePercentThreshold: 50
  }}
/>
```

## Video Interactions

### Liking a Video

```typescript
likeVideo: async (videoId: string) => {
  try {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    // In a real app with Supabase
    // 1. Update likes count in videos table
    const { error: updateError } = await supabase.rpc('increment_video_likes', {
      video_id: videoId
    });
    
    if (updateError) throw updateError;
    
    // 2. Add record to video_likes table
    const { error: likeError } = await supabase
      .from('video_likes')
      .insert([
        { user_id: currentUser.id, video_id: videoId }
      ]);
      
    if (likeError) throw likeError;
    
    // Update local state
    set((state) => {
      const updatedVideos = state.videos.map(video => 
        video.id === videoId ? { ...video, likes: video.likes + 1 } : video
      );
      return { 
        videos: updatedVideos,
        likedVideos: { ...state.likedVideos, [videoId]: true }
      };
    });
  } catch (error: any) {
    console.error('Like video error:', error.message);
    throw error;
  }
}
```

### Adding a Comment

```typescript
addComment: async (videoId: string, commentText: string) => {
  try {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    
    // In a real app with Supabase
    const { data, error } = await supabase
      .from('comments')
      .insert([
        { 
          video_id: videoId,
          user_id: currentUser.id,
          text: commentText
        }
      ])
      .select('*, user:users(*)');
      
    if (error) throw error;
    
    // Format the comment for our app
    const newComment = {
      id: data[0].id,
      user: {
        id: data[0].user.id,
        username: data[0].user.username,
        avatar: data[0].user.avatar_url,
        verified: data[0].user.verified,
        role: data[0].user.role,
      },
      text: data[0].text,
      timestamp: new Date(data[0].created_at).getTime(),
      likes: 0,
    };
    
    // Update local state
    set((state) => {
      const updatedVideos = state.videos.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            comments: [...video.comments, newComment]
          };
        }
        return video;
      });
      return { videos: updatedVideos };
    });
  } catch (error: any) {
    console.error('Add comment error:', error.message);
    throw error;
  }
}
```

## Video Download Prevention

To ensure that videos cannot be downloaded by users, the following measures have been implemented:

1. **Web Platform**:
   - The `controlsList="nodownload"` attribute is added to the `<video>` element to disable the download option in the browser.
   - A `onContextMenu` event listener is added to prevent right-click actions and display an alert notifying users that downloads are disabled.

2. **Native Platforms**:
   - The `ExpoVideo` component is used without native download controls.

### Code Example

```tsx
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
    Alert.alert(
      "Download Disabled",
      "Downloading videos is not allowed in this app."
    );
  }}
>
  <source src={video.videoUrl} type={video.mimeType || "video/mp4"} />
  Your browser does not support the video tag.
</video>
```

This ensures a consistent user experience across platforms while protecting video content from unauthorized downloads.

## Performance Considerations

- Videos are lazy-loaded
- Only one video plays at a time
- Videos pause when not visible
- Thumbnails are loaded first
- Videos use adaptive bitrate streaming
- Video metadata is cached locally
