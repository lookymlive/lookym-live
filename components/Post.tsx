
import { View, StyleSheet } from 'react-native';
import { Post as PostType } from '@/types/post.ts';
import PostHeader from './PostHeader.tsx';
import PostCarousel from './PostCarousel.tsx';
import PostActions from './PostActions.tsx';
import PostFooter from './PostFooter.tsx';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  return (
    <View style={styles.container}>
      <PostHeader user={post.user} location={post.location} />
      <PostCarousel media={post.media} />
      <PostActions likes={post.likes} saved={post.saved} />
      <PostFooter 
        username={post.user.username} 
        caption={post.caption} 
        comments={post.comments} 
        timestamp={post.timestamp} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});