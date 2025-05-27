# Tech Context: LOOKYM

## Core Technologies

- **Runtime/Framework:** React Native with Expo SDK
- **Language:** TypeScript
- **State Management:** Zustand (with `zustand/middleware` for persistence)
- **Persistence:** AsyncStorage (via `zustand/middleware/persist` and `createJSONStorage`)
- **Navigation:** Expo Router (file-based routing)
- **Backend-as-a-Service (BaaS):** Supabase
  - Authentication (Email/Password, Google OAuth)
  - PostgreSQL Database (with Row Level Security)
  - Realtime Subscriptions
  - Storage (Used for avatars, potentially bypassed for videos)
- **Media Management:** Cloudinary (Video upload, storage, streaming)
  - Client-side upload implemented using `fetch` API and unsigned presets.
- **UI:** React Native core components, `lucide-react-native` for icons.
- **Video Handling:**
  - `expo-video` for playback/preview (replaced deprecated `expo-av`)
  - `expo-image-picker` for selection and recording

## Development Environment

- **Package Manager:** npm
- **Expo CLI:** For running the development server, building.
- **Environment Variables:** Managed via `.env` file (using `EXPO_PUBLIC_` prefix for client-side access).
- **Testing:** Jest with babel-jest and ts-jest for unit testing.

## Supabase Setup Details

- **Schema Source of Truth:** The complete database schema (tables, functions, views, triggers, RLS policies) is defined in `sql/schema.sql`. This script should be run in the Supabase SQL Editor.
- **Key Components:**
  - Tables: `users`, `videos`, `comments`, `video_likes`, `saved_videos`, `followers`, `chats`, `chat_participants`, `messages`, `notifications`.
  - Functions: `handle_new_user` (trigger), like helpers, `update_updated_at` (trigger).
  - Views: `video_feed`.
  - Triggers: `on_auth_user_created`, `update_*_updated_at`.
  - RLS: Enabled on tables with appropriate policies.
- **Client:** `@supabase/supabase-js` initialized in `utils/supabase.ts`, using env vars from `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- **Storage:** Primarily for `avatars`; Cloudinary used for `videos`/`thumbnails`.

## Cloudinary Setup Details

- Requires cloud name (`EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`) and an **unsigned upload preset** (`EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) configured in `.env`.
- CORS configuration needed on Cloudinary settings.
- Implementation primarily in `utils/cloudinary.ts` for video uploads with progress tracking.

## Project Dependencies

- **Core:**
  - `expo` and related modules
  - `@supabase/supabase-js`
  - `zustand` for state management
  - `@react-native-async-storage/async-storage`

- **UI/UX:**
  - `lucide-react-native` for icons
  - `expo-image` for efficient image display
  - `expo-blur` for UI effects
  - `expo-haptics` for tactile feedback
  - `expo-linear-gradient` for visual effects

- **Media:**
  - `expo-video` for video playback
  - `expo-image-picker` for media selection
  - `expo-camera` for video recording
  - `expo-media-library` for accessing device media

- **Authentication:**
  - `expo-auth-session` and `expo-web-browser` for OAuth
  - `expo-secure-store` for secure credential storage

- **Navigation/Routing:**
  - `expo-router` for file-based navigation
  - `react-native-gesture-handler` for touch interactions
  - `react-native-screens` for navigation performance
  - `react-native-safe-area-context` for safe rendering

- **Development:**
  - TypeScript and related types
  - Jest, babel-jest, ts-jest for testing
  - Various Babel presets and configs

## Build & Deployment

- Expo Application Services (EAS) for building native apps.
- Web deployment via standard Expo web build process.
- Environment variables management critical for different environments.

## Technical Constraints & Considerations

- Reliant on Supabase and Cloudinary service availability.
- Mobile-first design, with web as secondary platform.
- Performance considerations for video processing/streaming on various devices/networks.
- Known bundling error with `react-native-url-polyfill` needs resolution.
- Video playback performance optimization needed, especially for slower connections.
- Chat message ordering and realtime functionality needs refinement.

## Fuente de verdad de la estructura de datos

La estructura de datos de LOOKYM está definida y versionada en el archivo:

- `sql/schema.sql` (fuente de verdad para todas las tablas, relaciones, funciones y triggers de la base de datos Supabase)

Cualquier cambio en el modelo de datos debe realizarse y documentarse en este archivo. La documentación funcional y de producto en la memory-bank debe referenciar siempre este archivo como la definición oficial.

---

## Tablas principales (MVP)

- **users:** Perfiles de usuario y negocio, enlazados a Supabase Auth.
- **videos:** Videos subidos por negocios, con metadatos y relación a usuario.
- **video_tags:** Etiquetas interactivas de productos sobre los videos de vidriera. Permite asociar nombre, precio, descripción y posición opcional a cada producto destacado en un video.
- **video_likes:** Relación de likes de usuarios a videos.
- **saved_videos:** Relación de guardados (bookmarks) de usuarios a videos.
- **followers:** Seguimiento entre usuarios y negocios.
- **chats, chat_participants, messages:** Sistema de mensajería en tiempo real.
- **notifications:** Notificaciones in-app para usuarios.

---

## Arquitectura técnica

- **Frontend:** React Native + Expo, Expo Router, Zustand para estado, componentes UI reutilizables, subida de video a Cloudinary, reproducción con expo-video.
- **Backend:** Supabase (Auth, Database, Realtime, RLS), Cloudinary para videos.
- **Integraciones:** Chat y notificaciones en tiempo real, etiquetas de producto en video.

---

## Relación con el MVP y wireframes

Cada pantalla y funcionalidad del MVP tiene respaldo directo en la estructura de datos definida en `sql/schema.sql`. La tabla `video_tags` permite implementar la funcionalidad de etiquetas interactivas sobre los videos, alineando la base de datos con la visión de producto y los wireframes documentados.

---

> Para cualquier cambio estructural, primero modificar `sql/schema.sql` y luego actualizar la documentación funcional aquí y en los archivos de producto.
  