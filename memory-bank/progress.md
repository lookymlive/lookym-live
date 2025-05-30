# Progress: LOOKYM

> **This file tracks progress history and current state for onboarding and context.**

## What Works

- **Project Setup:** React Native/Expo project initialized with TypeScript.
- **Directory Structure:** Established project layout.
- **Navigation:** Basic navigation setup with Expo Router.
- **State Management:** Zustand configured with persistence.
- **Authentication:**
  - Supabase Auth integration complete.
  - Login/Registration screens functional.
  - User/Business role distinction implemented.
  - Session persistence using AsyncStorage.
  - Protected routes based on authentication state.
  - Google OAuth integration.
- **Supabase Database:**
  - Schema (`sql/schema.sql`) successfully applied to the Supabase project.
  - Tables, functions, views, triggers, and RLS policies created.
  - Schema reviewed against project docs and confirmed to be aligned and comprehensive.
  - `handle_new_user` trigger successfully verified: correctly creates profiles in `public.users` upon signup when client passes required metadata (`username`, `role`).
- **Video System:**
  - **Upload:**
    - Cloudinary setup complete.
    - Video selection from gallery implemented (`expo-image-picker`).
    - Video recording implemented (`expo-image-picker` with camera).
    - Video preview implemented (`expo-video`).
    - UI for caption/hashtags added.
    - Successful upload to Cloudinary from client-side implemented.
    - Progress tracking for uploads implemented.
    - Metadata saved to Supabase `videos` table after successful Cloudinary upload.
    - Business role check implemented to restrict uploads.
    - Error handling and validation in place.
  - **Feed:**
    - Visualización de videos en un feed de desplazamiento vertical tipo TikTok.
    - Reproducción automática cuando un video está visible en pantalla.
    - Navegación fluida entre videos con animaciones suaves.
    - Interacciones básicas (likes, comentarios, guardar).
  - **Detail Screen:**
    - Pantalla de detalle de video con información completa.
    - Sistema de comentarios con capacidad para añadir nuevos comentarios.
    - Botones para like y guardar con retroalimentación visual.
    - Navegación directa al perfil del creador.

## Business Profile: ShowcaseView

- `ShowcaseView` integrated and documentado as vidriera virtual para perfiles de negocios.
- Avatar real del comercio usando `expo-image`.
- Video principal mostrado con `expo-av` y controles nativos.
- El grid de productos ahora muestra la imagen real (`product.imageUrl`) if available, usando `expo-image`.
- Documentación en `/docs/ui-components.md` actualizada after each improvement.
- Mantener sincronía between code and documentation.
- Last update: 2025-05-14
  - Added back button to header.
  - Made product grid items pressable (navigation placeholder added).
  - Implemented interactive video tags displaying product details overlay on press.
  - Added state and logic for product details overlay visibility.
  - Corrected TypeScript interface definitions for clarity.
  - Integrated horizontal carousel for suggested businesses using `FlatList` and `SuggestedStoreCard`.
  - Created `SuggestedStoreCard.tsx` component.
  - Replaced dummy data fetch with Supabase query for suggested businesses (note: Supabase client export linter error persists, likely external).
  - Made suggested store cards pressable (navigation placeholder added).
- **Search Functionality:**
  - Búsqueda por videos, hashtags y usuarios.
  - Filtros por categoría para refinar resultados.
  - UI para descubrir hashtags populares.
  - Visualización de videos en formato grid.
- **Basic Chat UI:**
  - Chat list and conversation screens exist.
  - Mensajes básicos entre usuarios/negocios.
- **Documentation:**
  - Memory bank estructurado y organizado.
  - README con información básica del proyecto.
  - Documentación de testing y configuración.
  - Chat migrado a Supabase: ahora los mensajes y conversaciones son reales y en tiempo real, usando el store actualizado (`store/chat-store.ts`).
  - Documentación y ejemplos de integración en `/docs/chat-implementation.md`.

## What's Left to Build (Core - Phase 2)

- **Profile System (In Progress):**
  - Completar pantalla de perfil de usuario/negocio.
  - Mostrar videos subidos en perfil.
  - Añadir estadísticas para negocios.
  - Implementar funcionalidad de seguimiento de usuarios.
  - Edición de perfil mejorada.

- **Notification System (Planned):**
  - Implementar notificaciones para interacciones.
  - Diseñar UI para pantalla de notificaciones.
  - Integrar con navegación principal.

- **Chat System Improvements:**
  - Ensure full real-time functionality.
  - Implement unread indicators.
  - Refine UI/UX.
  - Fix message ordering issues.

- **Video System Optimizations:**
  - Implementar carga progresiva.
  - Añadir caché para videos populares.
  - Mejorar rendimiento de reproducción.
  - Optimizar para web.

- **Social Features:**
  - Compartir videos dentro/fuera de la app.
  - Añadir seguimiento de usuarios.

## Current Status

- En Fase 2 del plan de desarrollo: Implementación de Características Core.
- Sistema de Video funcional con upload, feed y pantalla de detalle.
- Búsqueda implementada con filtros por categoría.
- Pantallas de perfil y notificaciones en desarrollo.
- Documentación actualizada y sincronizada.
- **Próxima Prioridad:** Completar sistema de perfil de usuario/negocio y notificaciones.

## Known Issues/TODOs (High Priority)

- Bundling error con `react-native-url-polyfill` (necesita resolverse para producción).
- Optimizar rendimiento de reproducción de videos (especialmente en conexiones lentas).
- Mejorar la experiencia en web, especialmente para reproducción de video.
- Implementar sistema de caché para videos frecuentemente vistos.
- Address chat message ordering issues.
- Implementar funcionalidad de seguimiento de usuarios.
- Complete tests for core components and stores.

## Future Development Plan

For a detailed breakdown of planned features and improvements by role and quarter for 2025, please refer to the [Future Roadmap (2025)] section in `memory-bank/activeContext.md`.

## QA y Validación

> Para checklist de QA y validación visual/fucional, consulta únicamente `docs/QA-checklist.md`.
