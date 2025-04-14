# Tech Context: LOOKYM

## Core Technologies

- **Runtime/Framework:** React Native with Expo SDK
- **Language:** TypeScript
- **State Management:** Zustand (with `zustand/middleware` for persistence)
- **Persistence:** AsyncStorage (via `zustand/middleware/persist` and `createJSONStorage`)
- **Navigation:** Expo Router
- **Backend-as-a-Service (BaaS):** Supabase
  - Authentication (Email/Password, Google OAuth)
  - PostgreSQL Database (with Row Level Security)
  - Realtime Subscriptions
  - Storage (Used for avatars, potentially bypassed for videos)
- **Media Management:** Cloudinary (Video upload, storage, streaming)
  - Client-side upload implemented using `fetch` API and unsigned presets.
- **UI:** React Native core components, potentially `shadcn/ui` adapted for RN, `lucide-react-native` for icons.
- **Video:** `expo-video` for playback/preview, `expo-image-picker` for selection.

## Development Environment

- **Package Manager:** npm or yarn
- **Expo CLI:** For running the development server, building.
- **Environment Variables:** Managed via `.env` file (using `EXPO_PUBLIC_` prefix for client-side access). See `docs/configuration.md`.
- **Code Editor:** Likely VS Code or similar with relevant extensions (ESLint, Prettier).

## Supabase Setup Details

- **Schema Source of Truth:** The complete database schema (tables, functions, views, triggers, RLS policies) is defined in `sql/schema.sql`. This script should be run in the Supabase SQL Editor. (Reviewed and confirmed aligned with project goals).
- **Key Components:**
  - Tables: `users`, `videos`, `comments`, `video_likes`, `saved_videos`, `followers`, `chats`, `chat_participants`, `messages`, `notifications`.
  - Functions: `handle_new_user` (trigger), like helpers, `update_updated_at` (trigger).
  - Views: `video_feed`.
  - Triggers: `on_auth_user_created`, `update_*_updated_at`.
  - RLS: Enabled on tables with example policies provided in the script (requires review/customization, especially for chat/notification creation).
- **Client:** `@supabase/supabase-js` initialized likely in `utils/supabase.ts`, using env vars from `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- **Storage:** Primarily for `avatars`; Cloudinary used for `videos`/`thumbnails`.

## Cloudinary Setup Details

- Requires cloud name (`EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`) and an **unsigned upload preset** (`EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) configured in `.env`.
- CORS configuration needed on Cloudinary settings.
- See `docs/configuration.md`.

## Potential Dependencies/Libraries

- `react-native-video` or `expo-av` for video playback.
- Date/Time library (e.g., `date-fns`).
- Form handling library (e.g., `react-hook-form`).
- `@react-native-async-storage/async-storage`.
- `@supabase/supabase-js`.
- `react-native-url-polyfill` (mentioned in TODO for bundling error).
- `expo-video` (used for video playback/preview)
- `expo-image-picker` (used for video selection from gallery)
- `expo-camera` (will be needed for video recording)

## Build & Deployment

- Expo Application Services (EAS) for building (`eas build`).
- Deployment to Google Play Store and Apple App Store.

## Tech Context

- **Primary Language(s):** TypeScript
- **Frameworks/Libraries:**
  - React Native with Expo (Core Framework/Platform)
  - Expo Router (Navigation)
  - Zustand (State Management)
  - React Native StyleSheet (Styling)
  - Lucide Icons (Icons)
  - `expo-video` (Video Playback/Preview)
  - `expo-image-picker` (Media Selection)
  - expo-auth-session, expo-web-browser (Google Auth)
- **Database(s):** Supabase PostgreSQL (via Supabase client)
- **Key Infrastructure / External Services:**
  - Supabase (Authentication, Database, Realtime Subscriptions, Storage Policies)
  - Cloudinary (Video Storage, Processing, Streaming/CDN)
  - Google Cloud Platform (for Google OAuth Client IDs)
- **Development Environment Setup:** Node.js (v16+), npm/yarn, Expo CLI. Requires `.env` file with credentials for Supabase, Cloudinary, and Google OAuth (see `docs/configuration.md`).
- **Build/Deployment Process:** Uses Expo Build service (`eas build`) for creating native Android/iOS builds. Web deployment via standard Expo web build process.
- **Dependencies:** See `package.json`. Critical external dependencies are Supabase client library, Cloudinary SDK/API usage, Expo core modules.
- **Technical Constraints:**
  - Reliant on Supabase and Cloudinary service availability.
  - Mobile-first design, potential UI/UX differences on web.
  - Performance considerations for video processing/streaming on various devices/networks.
  