import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Ensure WebBrowser redirects are handled properly
WebBrowser.maybeCompleteAuthSession();

// Get client IDs from environment variables
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Hook for Google authentication
 */
export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    clientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      // For development, we'll use a mock implementation
      if (__DEV__) {
        console.log("Mock Google sign-in with token:", accessToken);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          user: {
            id: "google-user-123",
            email: "google-user@example.com",
          },
          session: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        };
      }

      // In production, exchange the Google token for a Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: accessToken,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      // For development, we'll use a mock implementation
      if (__DEV__) {
        console.log("Mock Google sign-in initiated");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          user: {
            id: "google-user-123",
            email: "google-user@example.com",
          },
          session: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        };
      }

      // In production, prompt the user to sign in with Google
      return await promptAsync();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
    request,
  };
};

/**
 * Standalone function for Google Sign-In (Mock for Development)
 */
export const signInWithGoogle = async () => {
  if (__DEV__) {
    console.log("Mock Google sign-in initiated (standalone)");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data similar to what the hook provides
    return {
      user: {
        id: "google-user-standalone-123",
        email: "google-user-standalone@example.com",
      },
      session: {
        access_token: "mock-access-token-standalone",
        refresh_token: "mock-refresh-token-standalone",
      },
    };
  }

  // In a real non-hook scenario, you might need to use AuthSession.startAsync
  // or handle the token exchange differently.
  // For now, this primarily handles the __DEV__ case needed by the store.
  throw new Error(
    "Standalone Google Sign-In not fully implemented for production builds. Use useGoogleAuth hook in components."
  );
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  if (__DEV__) {
    console.log("Mock sign out");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: null };
  }

  return await supabase.auth.signOut();
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  if (__DEV__) {
    console.log("Mock get current user");
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return mock user for development
    return {
      id: "google-user-123",
      email: "google-user@example.com",
      user_metadata: {
        full_name: "Google User",
        avatar_url:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      },
    };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};
