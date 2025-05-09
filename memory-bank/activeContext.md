## Reglas de estilo y gradientes (resumen IA)

- Siempre tipa los gradientes como `[string, string]` al usarlos en Expo LinearGradient.
- Usa `getColorWithOpacity` del hook para colores con opacidad.
- Documenta cambios en `/constants/colors.ts` y `/docs/styling-guide.md`.

# Active Context: LOOKYM

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
