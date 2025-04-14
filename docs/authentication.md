# LOOKYM - Authentication System

This document outlines the authentication system used in the LOOKYM application.

## Authentication Flow

LOOKYM uses Supabase for authentication with the following features:

- Email/Password authentication
- Social authentication (Google)
- JWT token management
- Session persistence
- Role-based access control

## User Roles

The application supports two user roles:

1. **User**: Regular users who can browse content, interact with videos, and chat with businesses
2. **Business**: Business accounts that can upload videos and interact with users

## Authentication Screens

### Login Screen

- Email/Password login
- Google login option
- Demo account options (for testing)
- Link to registration

### Registration Screen

- Email/Password registration
- Username selection
- Role selection (User/Business)
- Terms and conditions acceptance

### Password Reset

- Email-based password reset flow
- Reset token validation
- New password creation

## Authentication Store

The authentication state is managed through the `useAuthStore` Zustand store:

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

## Session Management

Sessions are persisted using AsyncStorage (or SecureStore on native platforms):

```typescript
persist(
  (set, get) => ({
    // Auth store implementation
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      currentUser: state.currentUser,
      isAuthenticated: state.isAuthenticated,
    }),
  }
)
```

## Protected Routes

Routes that require authentication are protected using a route guard:

```typescript
// In _layout.tsx
export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="auth"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
```

## User Profile

The user profile contains the following information:

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'business';
  verified: boolean;
}
```

## Security Considerations

- JWT tokens are securely stored
- Passwords are never stored in the application
- API requests are authenticated using JWT
- Session expiration and refresh handling
- Input validation for all authentication forms

## Implementation Details

### Supabase Auth Configuration

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Login Implementation

```typescript
login: async (email: string, password: string) => {
  try {
    set({ isLoading: true, error: null });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Get user profile from the database
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: profileData.username,
        displayName: profileData.display_name,
        avatar: profileData.avatar_url,
        bio: profileData.bio,
        role: profileData.role,
        verified: profileData.verified,
      };
      
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
    }
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
}
```

### Registration Implementation

```typescript
register: async (email: string, password: string, username: string, role: 'user' | 'business') => {
  try {
    set({ isLoading: true, error: null });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Create user profile in the database
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            username,
            display_name: username,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
            bio: '',
            role,
            verified: false,
          }
        ]);
        
      if (profileError) throw profileError;
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username,
        displayName: username,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
        bio: '',
        role,
        verified: false,
      };
      
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
    }
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
}
