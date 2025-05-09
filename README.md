## Guía de estilos y gradientes

Para el uso correcto de gradientes y colores en componentes Expo LinearGradient, consulta la sección "Uso de gradientes y colores" en `/docs/styling-guide.md`. Allí encontrarás reglas, ejemplos y advertencias para desarrolladores y sistemas de IA.

Resumen de reglas clave:

- Siempre tipa el prop `colors` de LinearGradient como `[string, string]`.
- Usa el helper `getColorWithOpacity` del hook `useColorScheme` para colores con opacidad.
- Documenta cualquier cambio en gradientes en `/constants/colors.ts` y en la guía de estilos.

# LOOKYM - Plataforma de Conexión por Video

LOOKYM es una aplicación móvil que conecta usuarios con negocios a través de contenido de video de formato corto. La plataforma permite a los negocios mostrar sus productos y servicios, mientras que los usuarios pueden descubrir, interactuar y comunicarse directamente con estos negocios.

## Estado Actual del Proyecto

### Características Implementadas

#### Sistema de Autenticación

- Registro e inicio de sesión con email/contraseña
- Inicio de sesión con Google (parcialmente implementado)
- Roles diferenciados (usuario/negocio)
- Persistencia de sesión con AsyncStorage

#### Sistema de Videos

- Subida de videos a Cloudinary
- Feed de videos estilo TikTok
- Interacciones básicas (likes, comentarios, guardar)
- Pantalla de detalle con información completa

#### Sistema de Notificaciones

- Tipos soportados: nuevos seguidores, likes en videos, comentarios, mensajes
- Marcado de notificaciones como leídas
- Navegación contextual según tipo de notificación

#### Sistema de Chat

- Visualización de conversaciones
- Envío de mensajes
- Creación de nuevas conversaciones
- Marcado de mensajes como leídos

#### Búsqueda

- Búsqueda por videos, hashtags y usuarios
- Filtros por categoría
- Visualización en formato grid

### Estructura de Carpetas Relevante

- `/app` — Pantallas y navegación usando Expo Router
- `/components` — Componentes UI reutilizables
- `/store` — Gestión de estado con Zustand
- `/utils` — Utilidades y clientes API
- `/types` — Definiciones de tipos TypeScript
- `/mocks` — Datos de ejemplo para desarrollo
- `/docs` — Documentación del proyecto
- `/sql` — Esquemas y migraciones de base de datos

## Tecnologías Utilizadas

- **Frontend**: React Native con Expo
- **Backend**: Supabase para autenticación, base de datos y funciones en tiempo real
- **Almacenamiento de Media**: Cloudinary para alojamiento y streaming de videos
- **Gestión de Estado**: Zustand con persistencia
- **Estilizado**: React Native StyleSheet

## Áreas de Mejora Identificadas

1. **Navegación duplicada:** Existen dos archivos para la gestión de chat (`chat/[id].tsx` y `chat/[userId].tsx`) con funcionalidades superpuestas.

2. **Gestión de estado inconsistente:** El sistema de chat utiliza datos simulados mientras que el sistema de notificaciones está conectado a Supabase.

3. **Componentes UI duplicados:** Existen patrones de UI similares en diferentes pantallas que podrían extraerse como componentes reutilizables.

## Próximas Tareas

1. **Integración de chat con Supabase**
   - Crear tablas necesarias en Supabase
   - Implementar funciones para gestionar conversaciones y mensajes
   - Añadir suscripciones en tiempo real

2. **Unificación de la navegación de chat**
   - Consolidar la lógica en un solo archivo
   - Mejorar la experiencia de usuario al navegar entre notificaciones y chat

3. **Mejora del perfil de usuario**
   - Completar la implementación del perfil
   - Añadir funcionalidad para seguir/dejar de seguir usuarios
   - Implementar edición de perfil

4. **Optimización de rendimiento**
   - Implementar paginación para listas largas
   - Mejorar la gestión de caché
   - Optimizar el uso de imágenes y recursos

5. **Pruebas y depuración**
   - Añadir pruebas unitarias para componentes clave
   - Implementar pruebas de integración
   - Depurar problemas conocidos

## Documentación Detallada

Para información más detallada sobre aspectos específicos del proyecto, consulta los siguientes documentos en la carpeta `/docs`:

- [Visión General](./docs/overview.md) - Descripción general del proyecto
- [Configuración de Supabase](./docs/supabase-setup.md) - Guía para configurar Supabase
- [Implementación de Chat](./docs/chat-implementation.md) - Detalles sobre el sistema de chat
- [Gestión de Estado](./docs/state-management.md) - Enfoque de gestión de estado con Zustand
- [Flujo de Desarrollo](./docs/development-workflow.md) - Guía para contribuir al proyecto
- [Progreso y Roadmap](./docs/progreso-y-roadmap.md) - Estado actual y próximos pasos

## Configuración del Entorno

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` basado en `.env.example`
4. Configura las variables de entorno para Supabase y Cloudinary
5. Inicia el servidor de desarrollo: `npx expo start`

## Testing

La configuración de testing está optimizada para proyectos con Expo y React Native usando Jest, Babel y TypeScript:

- Usa `babel-jest` como transformador principal para `.ts` y `.tsx`
- Archivo de configuración: `jest.config.cjs` (CommonJS, compatible con Babel y ESM)
- Babel configurado en `babel.config.cjs`

Ejecuta las pruebas con: `npm test`

## Contribución

Consulta [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para conocer las pautas de contribución al proyecto.

---

_Última actualización: 2025-04-16
