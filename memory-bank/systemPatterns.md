# Estilos y Gradientes

* **Estilo y Gradientes:**

  * El prop `colors` de Expo LinearGradient debe ser siempre un array de al menos dos strings, tipado como `[string, string]`.
  * Para colores con opacidad, usa el helper `getColorWithOpacity` del hook `useColorScheme`.
  * Documenta cualquier cambio en gradientes en `/constants/colors.ts` y en `/docs/styling-guide.md`.

## System Patterns

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

## UI Patterns & Reusable Components (2024-06)

### Common UI Patterns Identified

* **User/Author Display Block:** Avatar + username + optional secondary text (role, location, timestamp). Used in video posts, search, notifications, store cards, etc.
* **Card Layout/Container:** Consistent card-like containers with borderRadius, backgroundColor, padding, margin, and optional shadow. Used for posts, notifications, product cards, etc.
* **Action Button/Icon Row:** Horizontal/vertical row of interactive icons (like, comment, share, save, chat).
* **List Item Variant:** Leading element (avatar/icon), primary/secondary text, optional trailing element. Used in notifications, search results, etc.
* **Empty State/Loading Placeholders:** Centered content for loading or empty states, with icon and message.
* **Screen/Section Headers:** Standardized titles for screens/sections, with consistent fontSize/fontWeight.
* **Interactive Grid Item:** Pressable grid items with image/video thumbnail and text, used in search and product grids.

### Code Duplication Examples

* **Avatar Styling:** Circular images with width/height/borderRadius patterns, repeated with different sizes.
* **Username/Primary Text:** fontWeight: 600/bold, fontSize varies, used for user/entity names.
* **Card Container Styles:** borderRadius: 12, padding, marginBottom, backgroundColor from theme.
* **Centering Content:** flex: 1, justifyContent: 'center', alignItems: 'center'.
* **Action Icons:** Repeated use of lucide-react-native icons with similar props.

### Suggested Reusable Components

* **UserInfo (EntityInfoBlock):**
  * Props: avatarUrl, avatarInitial, name, secondaryText, avatarSize, onPress, nameStyle, secondaryTextStyle, containerStyle, showRole/role
* **AppCard (ContentCard):**
  * Props: children, style, onPress, padding, margin, useThemeColor, elevation
* **ActionBar:**
  * Props: actions (array of {iconName, onPress, text, color, fillColor, count, isActive}), iconSize, spacing, layout, containerStyle
* **AppListItem:**
  * Props: leadingElement, title, subtitle, trailingElement, onPress, containerStyle, titleStyle, subtitleStyle, highlightUnread
* **FullScreenStatusView (StatusIndicator):**
  * Props: status ('loading' | 'empty' | 'error' | 'loginRequired'), message, emptyIconName, onRetry, onLogin, style
* **AppHeader (TitleHeader):**
  * Props: title, level, style, containerStyle, leftAccessory, rightAccessory
* **MediaGridItem:**
  * Props: mediaUri, mediaType, title, subtitle, onPress, aspectRatio, imageStyle, textContainerStyle, titleStyle, cardStyle

#### Generalization Notes

* VideoThumbnail can be a specialization of MediaGridItem.
* FollowButton/ChatButton could be unified under a base AppButton if more variants appear.
* Post.tsx and VideoPost.tsx share header, actions, and content info patterns; consider a generic FeedItemCard with slot props.
* All new components should use useColorScheme for themeable colors.

#### Implementation Guidance

* All new screens/components should use these base components to ensure consistency and reduce duplication.
* Update this section as new patterns/components emerge.
