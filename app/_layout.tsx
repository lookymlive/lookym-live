import { useColorScheme } from "@/hooks/useColorScheme.ts";
import { initializeAuth } from "@/store/auth-store.ts";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";

// Polyfills para dependencias de Node en web
if (typeof window !== "undefined") {
  // @ts-ignore
  window.global = window;
  // Polyfill vacío para 'net' y 'tls'
  // @ts-ignore
  window.net = {};
  // @ts-ignore
  window.tls = {};
}

export default function RootLayout() {
  const { isDark } = useColorScheme();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Log In" }} />
        <Stack.Screen name="auth/register" options={{ title: "Sign Up" }} />
        <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
