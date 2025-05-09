* **Estilo y Gradientes:**
  * El prop `colors` de Expo LinearGradient debe ser siempre un array de al menos dos strings, tipado como `[string, string]`.
  * Para colores con opacidad, usa el helper `getColorWithOpacity` del hook `useColorScheme`.
  * Documenta cualquier cambio en gradientes en `/constants/colors.ts` y en `/docs/styling-guide.md`.

# System Patterns

* **Overall Architecture:** Mobile Client-Server architecture. React Native/Expo frontend communicates with Supabase (Backend-as-a-Service) and Cloudinary (Media PaaS).
* **Key Technical Decisions:**
* React Native with Expo: Cross-platform development efficiency.
* Supabase: Integrated backend solution (Auth, DB, Realtime, Storage Policies).
* Cloudinary: Specialized video hosting, processing, and delivery.
* Zustand: Simple, lightweight state management with persistence.
* Expo Router: File-based routing for navigation.
* **Core Design Patterns:**
* Component-Based Architecture (Screens, Containers, Presentational, Atomic components).
* State Management Stores (Auth, Video, Chat) using Zustand.
* API Layer Abstraction (`/utils` for Supabase, Cloudinary clients).
* File-based Routing (Expo Router).
* **Data Flow:**
    1. User interacts with UI (Component Layer).
    2. Interaction triggers action in Zustand Store.
    3. Store action calls API Layer (`/utils`) if external data/operation is needed.
    4. API Layer communicates with Supabase/Cloudinary.
    5. Response updates Store state.
    6. Components re-render based on updated Store state.
    7. Supabase Realtime pushes updates (e.g., chat messages) directly to subscribed clients, updating the relevant Store.
* **Component Relationships:**
* `app/` directory defines screens using Expo Router.
* Screens orchestrate data fetching/updates via hooks connected to Zustand Stores (`/store`).
* Screens compose reusable UI elements from `/components`.
* Stores interact with backend services via utility functions in `/utils`.
