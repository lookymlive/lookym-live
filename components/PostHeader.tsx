import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MoreHorizontal, BadgeCheck } from 'lucide-react-native';
import { PostUser } from '@/types/post';

interface PostHeaderProps {
  user: PostUser;
  location?: string;
}

export default function PostHeader({ user, location }: PostHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.userContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{user.username}</Text>
            {user.verified && (
              <BadgeCheck size={16} color="#3897F0" style={styles.verifiedBadge} />
            )}
          </View>
          {location && <Text style={styles.location}>{location}</Text>}
        </View>
      </View>
      <TouchableOpacity>
        <MoreHorizontal size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
});