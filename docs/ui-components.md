# LOOKYM - UI Components

This document provides an overview of the UI components used in the LOOKYM application.

## Component Structure

LOOKYM follows a component-based architecture with reusable UI components organized in the `/components` directory.

## Core Components

### Post Components

- **Post**: Main component for displaying a post in the feed
- **PostHeader**: Displays user information and post metadata
- **PostCarousel**: Handles multiple images in a post
- **PostActions**: Like, comment, and share buttons
- **PostFooter**: Caption, comments, and timestamp

### Video Components

- **VideoPost**: Main component for displaying video content
- **VideoThumbnail**: Thumbnail preview of a video
- **VideoPlayer**: Custom video player with controls
- **VideoActions**: Like, comment, and share buttons for videos

### User Components

- **Avatar**: User profile picture with optional indicators
- **UserInfo**: Displays user name, role, and verification status
- **StoryCircle**: Circular avatar for stories feature
- **Stories**: Horizontal scrollable list of stories

### Chat Components

- **ChatList**: List of chat conversations
- **ChatItem**: Individual chat preview in the list
- **MessageList**: List of messages in a conversation
- **MessageBubble**: Individual message bubble
- **ChatInput**: Text input for sending messages

### Common UI Components

- **Button**: Reusable button component with variants
- **Input**: Text input with optional icon and validation
- **Header**: Screen header with title and actions
- **TabBar**: Custom tab bar for navigation
- **Loading**: Loading indicator
- **ErrorMessage**: Error display component

## Styling Approach

LOOKYM uses React Native's StyleSheet for styling components:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Theming

The application supports both light and dark themes through the `useColorScheme` hook:

```typescript
const { isDark, colors } = useColorScheme();

// Use in styles
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <Text style={[styles.text, { color: colors.text }]}>Content</Text>
</View>
```

## Responsive Design

Components are designed to be responsive across different device sizes:

- Use of flex layouts
- Percentage-based dimensions
- Platform-specific adjustments
- Safe area insets

## Accessibility

Components are built with accessibility in mind:

- Proper contrast ratios
- Adequate touch targets
- Screen reader support
- Keyboard navigation (for web)

## Component Usage Example

```tsx
import { Post } from '@/components/Post';
import { posts } from '@/mocks/posts';

export default function FeedScreen() {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Post post={item} />}
    />
  );
}
