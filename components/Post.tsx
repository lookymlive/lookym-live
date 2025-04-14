
import { View, StyleSheet } from 'react-native';
import { Post as PostType } from '@/types/post';
import PostHeader from './PostHeader';
import PostCarousel from './PostCarousel';
import PostActions from './PostActions';
import PostFooter from './PostFooter';

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