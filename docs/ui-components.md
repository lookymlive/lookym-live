
<!-- filepath: c:\Users\usuario\Desktop\lookym-live\docs\ui-components.md -->
# LOOKYM - UI Components

## Actualización 2025-05-12

- El sistema de chat ahora utiliza Supabase para mensajes y conversaciones reales.
- El store `useChatStore` fue migrado para usar Supabase en vez de mocks locales.
- Consulta `/docs/chat-implementation.md` para detalles técnicos y ejemplos de uso.

This document provides an overview of the UI components used in the LOOKYM application.

## Component Structure

LOOKYM follows a component-based architecture with reusable UI components organized in the `/components` directory.

## Core Components

### Post Components

- **Post**: Main component for displaying a post in the feed
- **PostHeader**: Displays user information and post metadata
- **PostCarousel**: Handles multiple images in a post
- **PostActions**: Like, comment, and share buttons
- **PostFooter**: Caption, comments, and timestamp

### Video Components

- **VideoPost**: Main component for displaying video content
- **VideoThumbnail**: Thumbnail preview of a video
- **VideoPlayer**: Custom video player with controls
- **VideoActions**: Like, comment, and share buttons for videos

### User Components

- **Avatar**: User profile picture with optional indicators
- **UserInfo**: Displays user name, role, and verification status
- **StoryCircle**: Circular avatar for stories feature
- **Stories**: Horizontal scrollable list of stories

### Chat Components

- **ChatList**: List of chat conversations
- **ChatItem**: Individual chat preview in the list
- **MessageList**: List of messages in a conversation
- **MessageBubble**: Individual message bubble
- **ChatInput**: Text input for sending messages

### Common UI Components

- **Button**: Reusable button component with variants
- **Input**: Text input with optional icon and validation
- **Header**: Screen header with title and actions
- **TabBar**: Custom tab bar for navigation
- **Loading**: Loading indicator
- **ErrorMessage**: Error display component

## Styling Approach

LOOKYM uses React Native's StyleSheet for styling components:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Theming

The application supports both light and dark themes through the `useColorScheme` hook:

```typescript
const { isDark, colors } = useColorScheme();

// Use in styles
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <Text style={[styles.text, { color: colors.text }]}>Content</Text>
</View>
```

## Responsive Design

Components are designed to be responsive across different device sizes:

- Use of flex layouts
- Percentage-based dimensions
- Platform-specific adjustments
- Safe area insets

## Accessibility

Components are built with accessibility in mind:

- Proper contrast ratios
- Adequate touch targets
- Screen reader support
- Keyboard navigation (for web)

## Component Usage Example

```tsx
import { Post } from '@/components/Post';
import { posts } from '@/mocks/posts';

export default function FeedScreen() {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Post post={item} />}
    />
  );
}
```

---

## Business Components

### ShowcaseView

- **Propósito:**
  - Vidriera virtual para perfiles de comercios. Simula la experiencia de "ver la vidriera desde la calle".
  - Muestra avatar, nombre, video principal con etiquetas de productos, grid de productos y (futuro) carrusel de otras vidrieras.
  - **Incluye botones de Seguir/Dejar de seguir y Chat con feedback visual y accesibilidad.**

- **Props:**
  - `store: StoreProfile` — Objeto con la información del comercio, videos y productos.

- **Estructura esperada:**

  ```typescript
  interface StoreProfile {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    location?: string;
    category?: string;
    videos: StoreVideo[];
    products: StoreProduct[];
  }
  interface StoreVideo {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    tags: ProductTag[];
  }
  interface ProductTag {
    id: string;
    label: string;
    x: number; // posición relativa (0-1)
    y: number;
    productId: string;
  }
  interface StoreProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    videoId?: string;
    description?: string;
    sizes?: string[];
    colors?: string[];
  }
  ```

- **Ejemplo de uso:**

  ```tsx
  import ShowcaseView from '@/components/ShowcaseView';
  <ShowcaseView store={storeProfile} />
  ```

- **Integración de botones de acción:**
  - El header muestra los botones `FollowButton` y `ChatButton` si el usuario no es el dueño del perfil.
  - Ambos botones muestran feedback visual (loading, error) y cumplen con accesibilidad (labels, roles).
  - El botón de chat inicia una conversación real usando el store de chat.
  - El botón de seguir usa el store de follows y actualiza el estado global.

- **Documentación de componentes:**
  - `FollowButton`: Botón reutilizable para seguir/dejar de seguir usuarios/negocios.
  - `ChatButton`: Botón reutilizable para iniciar chat con feedback visual.

- **Actualiza esta sección si agregas más acciones o mejoras la UI.**

- **Integración:**
  - Usado en la pantalla de perfil de negocios (`/app/(tabs)/profile.tsx`).
  - Si agregas lógica de interacción (seguir, chat, etiquetas interactivas), documenta aquí y enlaza a la sección correspondiente.

### Notas

- El componente ahora muestra el avatar real del comercio usando la imagen de perfil (`store.avatar`). Si no hay avatar, muestra la inicial como fallback.
- El video principal ahora se muestra usando un reproductor real (`expo-av`), con controles nativos y miniatura si está disponible.
- Ahora el grid de productos muestra la imagen real (`product.imageUrl`) si está disponible, usando `expo-image`.
- Si se integran más componentes reales (botones de interacción, etiquetas interactivas), actualiza esta sección y enlaza a la documentación relevante.
- **Dependencias:** `expo-av` para video, `expo-image` para imágenes.
- Última actualización: 2025-05-10
