import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StoryCircle from './StoryCircle.tsx';

// Mock data for stories
const stories = [
  {
    id: '1',
    username: 'Your Story',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80',
    isYourStory: true,
    hasStory: false,
  },
  {
    id: '2',
    username: 'fashionbrand',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    isYourStory: false,
    hasStory: true,
    isVerified: true,
  },
  {
    id: '3',
    username: 'traveladventures',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    isYourStory: false,
    hasStory: true,
  },
  {
    id: '4',
    username: 'foodieheaven',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    isYourStory: false,
    hasStory: true,
    isVerified: true,
  },
  {
    id: '5',
    username: 'wanderlust',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    isYourStory: false,
    hasStory: true,
  },
  {
    id: '6',
    username: 'styleicon',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    isYourStory: false,
    hasStory: true,
    isVerified: true,
  },
  {
    id: '7',
    username: 'sweetooth',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80',
    isYourStory: false,
    hasStory: false,
  },
];

export default function Stories() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story) => (
          <StoryCircle
            key={story.id}
            username={story.username}
            avatar={story.avatar}
            isYourStory={story.isYourStory}
            hasStory={story.hasStory}
            isVerified={story.isVerified}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
});