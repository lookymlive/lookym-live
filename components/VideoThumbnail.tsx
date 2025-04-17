import { useVideoStore } from '@/store/video-store';
import { Video } from '@/types/video';
import { formatTimeAgo } from '@/utils/time-format';
import { Image } from 'expo-image';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Play, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

interface VideoThumbnailProps {
  video: Video;
}

const { width } = Dimensions.get('window');

import { Video as ExpoVideo, ResizeMode } from 'expo-av';

export default function VideoThumbnail({ video }: VideoThumbnailProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  // Modern web: video always visible, styled like Instagram/TikTok

  const { likedVideos, savedVideos, likeVideo, unlikeVideo, saveVideo, unsaveVideo } = useVideoStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const isLiked = likedVideos[video.id] || false;
  const isSaved = savedVideos[video.id] || false;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeVideo(video.id);
      } else {
        await likeVideo(video.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      unsaveVideo(video.id);
    } else {
      saveVideo(video.id);
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
            {video.user.verified && <Text style={styles.verified}>Verified</Text>}
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {Platform.OS === 'web' ? (
        <video
          src={video.videoUrl}
          controls
          autoPlay={false}
          playsInline
          muted={false}
          poster={video.thumbnailUrl}
          style={{
            width: '100%',
            display: 'block',
            aspectRatio: '9/16',
            objectFit: 'cover',
            background: '#000',
            borderRadius: 20,
            marginBottom: 12,
          }}
        />
      ) : (
        showPlayer ? (
          <ExpoVideo
            source={{ uri: video.videoUrl }}
            style={{ width: '100%', aspectRatio: 9/16, backgroundColor: '#000' }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
          />
        ) : (
          <TouchableOpacity onPress={() => setShowPlayer(true)}>
            <Image
              source={{ uri: video.thumbnailUrl }}
              style={{ width: '100%', aspectRatio: 9/16, backgroundColor: '#000' }}
            />
          </TouchableOpacity>
        )
      )}

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart size={24} color={isLiked ? "#FF3B30" : "#000"} fill={isLiked ? "#FF3B30" : "transparent"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Send size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Bookmark size={24} color={isSaved ? "#007AFF" : "#000"} fill={isSaved ? "#007AFF" : "transparent"} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.likes}>{video.likes.toLocaleString()} likes</Text>
        <View style={styles.captionContainer}>
          <Text style={styles.captionUsername}>{video.user.username}</Text>
          <Text style={styles.caption}>{video.caption}</Text>
        </View>
        <View style={styles.hashtagsContainer}>
          {video.hashtags.map((hashtag, index) => (
            <Text key={index} style={styles.hashtag}>#{hashtag}</Text>
          ))}
        </View>
        <TouchableOpacity>
          <Text style={styles.viewComments}>
            View all {video.comments.length} comments
          </Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formatTimeAgo(video.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  verified: {
    fontSize: 12,
    color: '#007AFF',
  },
  thumbnailContainer: {
    position: 'relative',
    width: width,
    height: width,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  footer: {
    paddingHorizontal: 12,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  captionUsername: {
    fontWeight: '600',
    marginRight: 4,
  },
  caption: {
    flex: 1,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  hashtag: {
    color: '#007AFF',
    marginRight: 4,
  },
  viewComments: {
    color: '#8E8E93',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
});