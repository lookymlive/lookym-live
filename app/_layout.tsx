import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeAuth, useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { isDark } = useColorScheme();
  const { isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Log In" }} />
        <Stack.Screen name="auth/register" options={{ title: "Sign Up" }} />
        <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
      </Stack>
    </SafeAreaProvider>
  );
}