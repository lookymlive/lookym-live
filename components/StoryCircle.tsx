import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus, CheckCircle } from 'lucide-react-native';

interface StoryCircleProps {
  username: string;
  avatar: string;
  isYourStory?: boolean;
  hasStory?: boolean;
  isVerified?: boolean;
}

export default function StoryCircle({
  username,
  avatar,
  isYourStory = false,
  hasStory = false,
  isVerified = false,
}: StoryCircleProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View
        style={[
          styles.avatarContainer,
          hasStory && styles.hasStoryBorder,
          isYourStory && styles.yourStoryBorder,
        ]}
      >
        <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
        {isYourStory && (
          <View style={styles.addButton}>
            <Plus size={14} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.username} numberOfLines={1}>
          {username}
        </Text>
        {isVerified && (
          <CheckCircle size={12} color="#007AFF" fill="#007AFF" style={styles.verifiedBadge} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    position: 'relative',
  },
  hasStoryBorder: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  yourStoryBorder: {
    borderWidth: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  username: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '85%',
  },
  verifiedBadge: {
    marginLeft: 2,
  },
});