import { User } from "@/types/user.ts";
import {
  signInWithGoogle as googleSignIn,
  signOut as googleSignOut,
} from "@/utils/google-auth.ts";
import { supabase, uploadFile } from "@/utils/supabase.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Default avatar URL for new users - replace if needed
const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Indicates loading for auth actions
  isInitialized: boolean; // Indicates if the initial session check is done
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    role: "user" | "business"
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>; // Renamed from refreshUser for clarity
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false, // Start as false until checkSession runs
      error: null,

      // --- LOGIN ---
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Sign in with Supabase Auth
          const { data: authData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) {
            console.error("Supabase login error:", signInError.message);
            throw signInError;
          }

          if (!authData.user) {
            throw new Error("Login successful but no user data returned.");
          }
          console.log(
            "[login] Supabase auth successful, User ID:",
            authData.user.id
          );

          // 2. Fetch user profile from public.users table
          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authData.user.id)
            .single(); // Use single() as ID is primary key

          if (profileError) {
            console.error("Error fetching user profile:", profileError.message);
            // Decide how to handle: log out? show error? For now, throw.
            throw new Error(
              `Login successful but failed to fetch profile: ${profileError.message}`
            );
          }

          if (!profileData) {
            throw new Error(
              "Login successful but no profile found for the user."
            );
          }
          console.log("[login] User profile fetched:", profileData);

          // 3. Construct User object and update state
          const user: User = {
            id: authData.user.id,
            email: authData.user.email || profileData.email, // Prefer auth email, fallback to profile
            username: profileData.username,
            displayName: profileData.display_name,
            avatar: profileData.avatar_url,
            bio: profileData.bio,
            role: profileData.role,
            verified: profileData.verified, // Or maybe use authData.user.email_confirmed_at?
          };

          console.log("[login] Setting authenticated state:", user);
          set({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
        } catch (error: any) {
          console.error("Login process error:", error.message);
          set({
            error: error.message,
            isLoading: false,
            currentUser: null,
            isAuthenticated: false,
            isInitialized: true,
          }); // Ensure initialized is true even on error
          // Re-throw the error so the calling component knows login failed
          throw error;
        }
      },

      // --- GOOGLE LOGIN (Mocked) ---
      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace mock with actual Supabase OAuth flow
          // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
          await googleSignIn(); // Assuming this handles the OAuth flow externally for now

          const user: User = {
            id: "google-user1",
            email: "google-user@example.com",
            username: "googleuser",
            displayName: "Google User",
            avatar: DEFAULT_AVATAR_URL,
            bio: "Signed in with Google",
            role: "user",
            verified: true,
          };

          set({ currentUser: user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          console.error("Google login error:", error.message);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // --- REGISTER ---
      register: async (
        email: string,
        password: string,
        username: string,
        role: "user" | "business"
      ) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Sign up with Supabase Auth
          // Pass username, role, and default avatar in options.data
          // This metadata will be used by the handle_new_user trigger
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                role,
                display_name: username, // Set initial display name
                avatar_url: DEFAULT_AVATAR_URL, // Set default avatar
              },
            },
          });

          if (signUpError) {
            console.error("Supabase registration error:", signUpError.message);
            throw signUpError;
          }

          // Handle case where user already exists but might not be confirmed
          if (
            data.user &&
            data.user.identities &&
            data.user.identities.length === 0
          ) {
            // This can happen if the user exists but isn't confirmed.
            // Supabase might resend the confirmation email in some scenarios.
            console.warn(
              "[register] User already exists but might not be confirmed."
            );
            // Optionally: throw new Error("User already exists.");
            // Or inform the user to check their email / try logging in.
            // For now, we'll let it proceed as Supabase might handle resending confirmation.
          }

          if (!data.user) {
            // Should not happen if signUpError is null, but check just in case
            throw new Error(
              "Registration seems successful but no user data returned."
            );
          }

          console.log(
            "[register] Supabase signup initiated for User ID:",
            data.user.id
          );
          // IMPORTANT: With email confirmation enabled, the user is NOT authenticated yet.
          // The handle_new_user trigger WILL run and create the profile in public.users.
          // We do NOT set isAuthenticated: true here.
          // The UI calling register should inform the user to check their email.

          set({ isLoading: false, error: null }); // Registration request sent successfully
          // Optionally set partial user info if needed by UI, but keep isAuthenticated false:
          // set({ currentUser: { id: data.user.id, email: data.user.email }, isAuthenticated: false, isLoading: false, error: null });
        } catch (error: any) {
          console.error(
            "Full registration error object:",
            JSON.stringify(error, null, 2)
          );
          console.error("Registration process error:", error.message);
          set({
            error: error.message,
            isLoading: false,
            currentUser: null,
            isAuthenticated: false,
          });
          // Re-throw error for the UI
          throw error;
        }
      },

      // --- LOGOUT ---
      logout: async () => {
        set({ isLoading: true }); // Indicate loading starts
        try {
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Supabase sign out error:", error.message);
            // Don't necessarily block logout if Supabase fails, but log it
          } else {
            console.log("[logout] Supabase sign out successful.");
          }

          // Sign out from Google if needed (optional, depends on how googleSignIn was implemented)
          try {
            await googleSignOut();
            console.log("[logout] Google sign out successful.");
          } catch (googleError: any) {
            console.warn(
              "Google sign out error during logout:",
              googleError.message
            );
          }

          // Reset the Zustand store state *after* sign out attempts
          set({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: true, // Logout implies initialization check is done or irrelevant
          });

          // Clear the persisted state from AsyncStorage (optional, but good practice)
          // Do this *after* resetting state in case of errors during removal
          try {
            await AsyncStorage.removeItem("auth-storage");
            console.log("[logout] Cleared auth-storage from AsyncStorage.");
          } catch (clearError: any) {
            console.error(
              "Error clearing auth-storage from AsyncStorage:",
              clearError.message
            );
          }
        } catch (error: any) {
          // Catch unexpected errors during the logout process itself
          console.error("Unexpected Logout error:", error.message);
          // Still attempt to reset state to ensure user is logged out locally
          set({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
            isInitialized: true,
          });
        }
      },

      // --- UPDATE PROFILE ---
      updateProfile: async (userData: Partial<User>) => {
        console.log("[updateProfile] Started with userData:", userData);
        set({ isLoading: true, error: null }); // Set loading true at the start

        const currentUser = get().currentUser;
        if (!currentUser) {
          const errMsg = "No user logged in";
          console.error("[updateProfile] Error:", errMsg);
          set({ error: errMsg, isLoading: false });
          throw new Error(errMsg);
        }

        try {
          console.log("[updateProfile] Current user ID:", currentUser.id);

          let updatedUserData = { ...userData };
          let publicAvatarUrl: string | undefined = currentUser.avatar; // Start with current avatar

          // Check if the avatar is being updated and is a local URI
          if (
            userData.avatar &&
            userData.avatar !== currentUser.avatar && // Only process if avatar actually changed
            (userData.avatar.startsWith("file://") ||
              userData.avatar.startsWith("content://") ||
              (Platform.OS === "web" && userData.avatar.startsWith("blob:"))) // Handle web blobs too
          ) {
            const localImageUri = userData.avatar;
            console.log(
              "[updateProfile] Detected local avatar URI:",
              localImageUri
            );

            const fileExtension =
              localImageUri.split(".").pop()?.split("?")[0]?.toLowerCase() ||
              "jpg"; // Handle potential query params
            const mimeType = `image/${
              fileExtension === "jpg" ? "jpeg" : fileExtension
            }`;
            const fileName = `avatar_${
              currentUser.id
            }_${Date.now()}.${fileExtension}`;
            // Use user's ID as the folder path for better organization
            const filePath = `${currentUser.id}/${fileName}`;
            console.log(
              `[updateProfile] Preparing upload: path=${filePath}, mime=${mimeType}`
            );

            let fileToUpload: Blob | null = null;

            try {
              console.log("[updateProfile] Fetching blob from URI...");
              const response = await fetch(localImageUri);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch image: ${response.status} ${response.statusText}`
                );
              }
              fileToUpload = await response.blob();
              console.log(
                "[updateProfile] Blob fetched successfully, size:",
                fileToUpload?.size
              );
            } catch (fetchError: any) {
              console.error("[updateProfile] Error fetching blob:", fetchError);
              throw new Error(
                `Failed to create blob from image URI: ${fetchError.message}`
              );
            }

            if (!fileToUpload) {
              throw new Error("Failed to create blob from image URI");
            }

            // Upload to Supabase Storage
            console.log(
              "[updateProfile] Uploading to Supabase avatars bucket..."
            );
            let uploadResult: { path: string };
            try {
              uploadResult = await uploadFile(
                "avatars", // Ensure this bucket name is correct
                filePath,
                fileToUpload,
                {
                  contentType: mimeType,
                  cacheControl: "3600", // Cache for 1 hour
                  upsert: true, // Overwrite if file exists (optional, default is false)
                }
              );
              console.log(
                "[updateProfile] Supabase upload successful:",
                uploadResult
              );
            } catch (uploadError: any) {
              console.error(
                "[updateProfile] Supabase upload error:",
                uploadError
              );
              throw new Error(
                `Failed to upload avatar: ${uploadError.message}`
              );
            }

            // Get public URL *after* successful upload
            const { data: urlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(uploadResult.path); // Use path from uploadResult

            publicAvatarUrl = urlData?.publicUrl;
            console.log("[updateProfile] Got public URL:", publicAvatarUrl);
            if (!publicAvatarUrl) {
              console.warn(
                "[updateProfile] Warning: getPublicUrl returned null/empty."
              );
              // Decide how to handle: throw error or keep old avatar? Keeping old for now.
              publicAvatarUrl = currentUser.avatar; // Fallback to existing avatar
            }
            updatedUserData.avatar = publicAvatarUrl; // Use the potentially new URL
          } else if (userData.avatar === null || userData.avatar === "") {
            // Handle case where user wants to remove avatar
            console.log("[updateProfile] User requested avatar removal.");
            publicAvatarUrl = undefined; // Or set to null depending on DB schema
            updatedUserData.avatar = undefined;
          } else {
            // Avatar didn't change or wasn't a local URI, keep the existing URL
            publicAvatarUrl = userData.avatar ?? currentUser.avatar;
            updatedUserData.avatar = publicAvatarUrl;
          }

          // Prepare data for Supabase 'users' table update
          const dbUpdateData: Record<string, any> = {};
          if (updatedUserData.displayName !== undefined)
            dbUpdateData.display_name = updatedUserData.displayName;
          if (updatedUserData.bio !== undefined)
            dbUpdateData.bio = updatedUserData.bio;
          // Only update avatar_url if it has potentially changed
          if (publicAvatarUrl !== currentUser.avatar)
            dbUpdateData.avatar_url = publicAvatarUrl;

          // Update user profile in Supabase database only if there are changes
          if (Object.keys(dbUpdateData).length > 0) {
            console.log("[updateProfile] Data for DB update:", dbUpdateData);
            console.log("[updateProfile] Updating user profile in DB...");
            const { error: updateError } = await supabase
              .from("users")
              .update(dbUpdateData)
              .eq("id", currentUser.id);

            if (updateError) {
              console.error("[updateProfile] DB update error:", updateError);
              throw updateError;
            }
            console.log("[updateProfile] DB update successful.");
          } else {
            console.log("[updateProfile] No changes detected for DB update.");
          }

          // Update local state with the final data
          set((state) => {
            if (!state.currentUser) return {}; // Should not happen if initial check passed

            const finalUpdatedUser: User = {
              ...state.currentUser, // Start with current state
              displayName:
                updatedUserData.displayName ?? state.currentUser.displayName,
              bio: updatedUserData.bio ?? state.currentUser.bio,
              avatar: publicAvatarUrl ?? state.currentUser.avatar, // Use final URL
            };
            console.log(
              "[updateProfile] Final currentUser state:",
              finalUpdatedUser
            );
            return {
              currentUser: finalUpdatedUser,
              isLoading: false,
              error: null,
            };
          });
        } catch (error: any) {
          console.error("Profile update process error:", error.message);
          // Set error state but don't clear currentUser optimistically
          set({ error: error.message, isLoading: false });
          throw error; // Re-throw for UI handling
        }
      },

      // --- CHECK SESSION ---
      checkSession: async () => {
        console.log("[checkSession] Checking Supabase session...");
        set({ isLoading: true }); // Indicate initial check is loading
        try {
          // Attempt to get the current user session from Supabase
          const {
            data: { user: authUser },
            error: sessionError,
          } = await supabase.auth.getUser();

          if (sessionError) {
            console.error(
              "[checkSession] Error getting session:",
              sessionError.message
            );
            // Treat error as logged out
            set({
              currentUser: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              error: sessionError.message,
            });
            return;
          }

          if (authUser) {
            console.log(
              "[checkSession] Active session found for User ID:",
              authUser.id
            );
            // Session exists, fetch profile data like in login
            const { data: profileData, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", authUser.id)
              .single();

            if (profileError || !profileData) {
              console.error(
                "[checkSession] Error fetching profile for active session:",
                profileError?.message || "No profile data found"
              );
              // Session exists but profile is missing/error - critical issue
              // Log out the user to force re-authentication or handle appropriately
              await get().logout(); // Attempt to logout fully
              set({
                currentUser: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                error: profileError?.message || "User profile not found.",
              });
              return;
            }

            console.log("[checkSession] Profile fetched:", profileData);
            console.log(
              "[checkSession] Avatar URL from DB:",
              profileData.avatar_url
            );

            // Construct User object and set authenticated state
            const user: User = {
              id: authUser.id,
              email: authUser.email || profileData.email,
              username: profileData.username,
              displayName: profileData.display_name,
              avatar: profileData.avatar_url,
              bio: profileData.bio,
              role: profileData.role,
              verified: profileData.verified, // Or authUser.email_confirmed_at
            };
            console.log("[checkSession] Restoring session:", user);
            set({
              currentUser: user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          } else {
            // No active session
            console.log("[checkSession] No active session found.");
            set({
              currentUser: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        } catch (error: any) {
          console.error("[checkSession] Unexpected error:", error.message);
          set({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: error.message,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        Platform.OS === "web"
          ? typeof globalThis !== "undefined" &&
            typeof (globalThis as any).window !== "undefined"
            ? (globalThis as any).window.localStorage
            : undefined
          : AsyncStorage
      ),
      partialize: (state) => ({
        // Only persist these fields
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist isLoading, isInitialized, or error
      }),
      // Custom function to run after rehydration (loading from AsyncStorage)
      onRehydrateStorage: (_state) => {
        // Parameter renamed to avoid confusion
        console.log("[AuthStore] Hydration finished.");
        // Triggering checkSession is now handled by initializeAuth in _layout.tsx useEffect
        // No need to return a function here unless specific post-hydration logic is required
        // that depends on the rehydrated state BEFORE checkSession runs.
      },
    }
  )
);

// Function to trigger session check on app start
// Call this from your root layout or App component
export const initializeAuth = () => {
  useAuthStore.getState().checkSession();
};
