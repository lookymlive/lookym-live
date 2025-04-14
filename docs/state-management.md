# LOOKYM - State Management

This document outlines the state management approach used in the LOOKYM application.

## Zustand

LOOKYM uses Zustand for state management, which provides a simple and flexible approach to managing application state.

### Benefits of Zustand

- Minimal boilerplate
- TypeScript support
- Middleware support for persistence
- Easy integration with React hooks
- Selective component re-rendering

## Store Structure

The application state is divided into multiple stores, each responsible for a specific domain:

### Auth Store (`/store/auth-store.ts`)

Manages authentication state:

- Current user information
- Authentication status
- Login/logout operations
- Profile updates

```typescript
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string, role: 'user' | 'business') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### Video Store (`/store/video-store.ts`)

Manages video-related state:

- Video feed
- Video interactions (likes, comments)
- Video uploads
- Video search and filtering

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

### Chat Store (`/store/chat-store.ts`)

Manages chat-related state:

- Chat conversations
- Messages
- Unread counts
- Chat creation and management

```typescript
interface ChatState {
  chats: Chat[];
  loadChats: () => Promise<void>;
  getChat: (chatId: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => void;
  createChat: (participantId: string, initialMessage: string) => string;
  markChatAsRead: (chatId: string) => void;
}
```

## Persistence

Zustand's persistence middleware is used to persist certain parts of the state to AsyncStorage:

```typescript
persist(
  (set, get) => ({
    // Store implementation
  }),
  {
    name: 'store-name',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      // Only persist these fields
      field1: state.field1,
      field2: state.field2,
    }),
  }
)
```

## Best Practices

### Store Access

Access stores using the hook pattern:

```typescript
const { currentUser, login } = useAuthStore();
```

### Selective Updates

Update only the necessary parts of the state:

```typescript
set((state) => ({
  videos: [...state.videos, newVideo]
}));
```

### Async Operations

Handle async operations with loading and error states:

```typescript
try {
  set({ isLoading: true, error: null });
  // Async operation
  set({ isLoading: false });
} catch (error) {
  set({ error: error.message, isLoading: false });
}
```

### Store Interaction

When one store needs to access another store's state, use the `getState()` method:

```typescript
const currentUser = useAuthStore.getState().currentUser;
