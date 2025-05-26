# Reglas de estilo y gradientes (resumen IA)

- Siempre tipa los gradientes como `[string, string]` al usarlos en Expo LinearGradient.
- Usa `getColorWithOpacity` del hook para colores con opacidad.
- Documenta cambios en `/constants/colors.ts` y `/docs/styling-guide.md`.

## Active Context: LOOKYM

## Current Focus

Refinamiento del sistema de video y desarrollo de funcionalidades sociales clave, incluyendo la experiencia de perfil de usuario/negocio y notificaciones.

## Recent Changes

- **AI Action:** Implementado el componente VideoFeed con desplazamiento vertical y reproducción automática para una experiencia tipo TikTok/Instagram Reels.
- **AI Action:** Mejorado el componente VideoPost para soportar reproducción automática basada en visibilidad.
- **AI Action:** Actualizada la pantalla principal para utilizar el nuevo componente VideoFeed para la navegación de videos.
- **AI Action:** Mejorada la pantalla de detalles de video con una UI más atractiva, interacciones (like, guardar) y comentarios.
- **AI Action:** Implementada una nueva experiencia de búsqueda con filtros por categoría (videos, usuarios, hashtags) y descubrimiento de contenido.
- **AI Action:** Añadida la funcionalidad para navegar fácilmente entre perfiles de usuario, videos y chats.
- **AI Action:** Corregidos errores de tipado en el sistema de navegación para mejorar la tipo-seguridad.
- **AI Action:** Resueltos problemas con tipos en VideoFeed para el manejo correcto de índices y visibilidad.
- **AI Action:** Actualizado el uso de colores en interfaz para usar las propiedades correctas del tema.
- **AI Action:** Optimizada la función de carga de videos para mantener la compatibilidad de tipos.
- **AI Action:** Revisada y sincronizada toda la documentación del proyecto para mantener coherencia.
- **AI Action:** Developed and refined the `ShowcaseView` component to serve as a virtual storefront for business profiles.
- **AI Action:** Added a back button to the `ShowcaseView` header for improved navigation.
- **AI Action:** Implemented interactive product tags on the hero video within `ShowcaseView`, displaying product details on press.
- **AI Action:** Made product grid items in `ShowcaseView` pressable, preparing for navigation to product details.
- **AI Action:** Created the `SuggestedStoreCard` component for displaying individual suggested businesses.
- **AI Action:** Integrated a horizontal carousel (using `FlatList` and `SuggestedStoreCard`) in `ShowcaseView` to display suggested businesses, initially with dummy data.
- **AI Action:** Replaced dummy data fetching with actual Supabase query for suggested businesses (note: a linter error related to Supabase client export persists, likely external to ShowcaseView).
- **AI Action:** Made suggested store cards in the carousel pressable, preparing for navigation to their respective showcase views.

## Next Steps (Priorizado)

1. **Completar la pantalla de perfil (Alta prioridad):**
   - Implementar vista de perfil para usuarios y negocios
   - Mostrar videos subidos en grid
   - Añadir estadísticas para perfil de negocio
   - Implementar funcionalidad de seguimiento de usuarios

2. **Implementar sistema de notificaciones (Alta prioridad):**
   - Crear notificaciones para interacciones (likes, comentarios, seguidores)
   - Diseñar pantalla de notificaciones con indicadores visuales
   - Integrar con la navegación principal

3. **Refinar el sistema de chat (Media prioridad):**
   - Mejorar la UI/UX del sistema de chat
   - Añadir indicadores de mensajes no leídos
   - Solucionar problema de ordenamiento de mensajes

4. **Optimizar rendimiento de video (Media prioridad):**
   - Implementar carga progresiva y caché para videos
   - Resolver problemas de rendimiento en la reproducción
   - Mejorar la experiencia en web

5. **Añadir funcionalidad de compartir (Baja prioridad):**
   - Permitir compartir videos dentro y fuera de la aplicación
   - Generar enlaces compartibles para videos

## Active Considerations

- Optimización del rendimiento para la carga y reproducción de video en el feed.
- Implementación de un sistema de caché para videos populares.
- Refinamiento de la experiencia de búsqueda con sugerencias y tendencias.
- Posible adición de filtros para el feed de video (por tendencia, siguiendo, etc.).
- Considerar la adición de efectos o filtros básicos para la grabación de video.
- Mejorar la experiencia de onboarding para nuevos usuarios.
- Explorar la posibilidad de añadir historias efímeras.
- Revisar y mejorar la seguridad general de la aplicación, especialmente en permisos y roles.
- Corregir errores de bundling con react-native-url-polyfill.

## Future Roadmap (2025)

### Q2 2025

- **Developer:** Implement Robust Navigation Routes (Product Details, Video Comments, Suggested Showcase), Address Supabase Client Export Error, Write Comprehensive Tests (initial).
- **UI/UX:** Refined Interactive Tag Visuals, Implement "Nearby Product Info" Tooltip, Smooth Transitions and Animations.
- **Product Manager:** (Planning and requirements gathering for Q3 features)

### Q3 2025

- **Product Manager:** Showcase Analytics Dashboard, Intuitive Tag Management Tool.
- **Developer:** Optimize Video Playback Performance, Implement Pagination/Infinite Scrolling (Profile/Grids), Develop Backend for Analytics and Tag Management (initial), Continue Comprehensive Tests.
- **UI/UX:** Clearer Business Profile Differentiation, Optimized Media Loading Feedback.

### Q4 2025

- **Product Manager:** Enhanced Product Catalog Integration, Curated Showcase Feeds.
- **Developer:** Develop Backend for Analytics and Tag Management ( lanjutan), Continue Comprehensive Tests.
- **UI/UX:** (Refining existing UI based on user feedback and testing)

### : UI Patterns & Reusable Components Analysis

- Added a detailed section to systemPatterns.md documenting common UI patterns and proposed reusable components (UserInfo, AppCard, ActionBar, AppListItem, FullScreenStatusView, AppHeader, MediaGridItem, etc.).
- Next step: Optionally create base files for these components in /components to accelerate UI refactor and ensure consistency.
- All future UI work should reference these patterns/components for guidance.

### 2024-06: UI Refactor - Core Screens Migrated

- Followers, Following, Profile, and Video screens have been fully migrated to use the new reusable UI components (AppHeader, FullScreenStatusView, AppListItem, UserInfo, ActionBar, MediaGridItem).
- All loading, empty, and error states now use FullScreenStatusView for consistency.
- User and video lists use AppListItem and MediaGridItem for a modern, unified look.
- Action bars and headers are now consistent across the app.
- The UI is now visually coherent and professional across web and mobile.
- Next: QA review, polish, and update documentation as new patterns/components emerge.

## QA y Validación

> La checklist de QA y validación visual/fucional se encuentra centralizada en [`docs/QA-checklist.md`]. Mantén solo esa fuente para verificación y actualizaciones.

## Guía de pasos realizados y siguientes

### Pasos realizados

- Migración de pantallas clave (seguidores, siguiendo, perfil, video) a componentes base modernos (`AppHeader`, `FullScreenStatusView`, `AppListItem`, `UserInfo`, `ActionBar`, `MediaGridItem`).
- Unificación de estados de loading, vacío y error.
- Refactor de headers, listas y grids para máxima coherencia visual y de código.
- Actualización de la documentación y Memory Bank.

### Siguientes pasos sugeridos

- Realizar QA visual y funcional usando la checklist en `docs/QA-checklist.md`.
- Ajustar detalles visuales o de UX según feedback de pruebas.
- Actualizar la documentación si se agregan nuevos patrones o componentes.
- (Opcional) Migrar pantallas secundarias o legacy restantes siguiendo el mismo patrón.
- Mantener la coherencia visual y de código en futuras features.
