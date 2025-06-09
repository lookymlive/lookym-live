# Guía de uso y pruebas funcionales (actualizado al 2025-05-10)

> ℹ️ **Para IA y desarrolladores:** Sigue siempre la [guía de buenas prácticas Markdown](./guia-documentacion.md) para evitar errores de formato y mantener la documentación consistente.

---

## Checklist de validación real con comercios y usuarios (2025-06)

1. **Verificar configuración de Supabase y Cloudinary**
   - Revisar variables de entorno y credenciales.
   - Probar subida y consulta de videos reales.

2. **Validar flujo de negocio real**
   - Crear cuenta de comercio, subir video real.
   - Verificar que el video aparece en el feed y perfil.

3. **Validar flujo de usuario real**
   - Crear cuenta de usuario, navegar el feed, interactuar (like, comentario, guardar).
   - Probar chat real con un comercio.

4. **Recoger feedback**
   - Documentar problemas, sugerencias y oportunidades detectadas por usuarios y comercios reales.
   - Registrar hallazgos en `docs/progreso-y-roadmap.md` o `memory-bank/activeContext.md`.

---

## Script de onboarding y validación con comercios/usuarios reales (2025-06)

> Utiliza este guion para validar la idea principal de LOOKYM con comercios y usuarios reales, usando datos reales y recogiendo feedback genuino.

### Para comercios

1. Crea una cuenta de negocio desde la app/web.
2. Completa el perfil de tu comercio (nombre, avatar, descripción, categoría).
3. Sube al menos un video real mostrando tu vidriera, local o productos.
4. Verifica que el video aparece en el feed y en tu perfil de negocio.
5. Prueba responder mensajes de usuarios reales desde el chat.
6. Anota cualquier dificultad, sugerencia o mejora que detectes.

### Para usuarios

1. Crea una cuenta de usuario desde la app/web.
2. Navega el feed de videos y explora diferentes comercios.
3. Interactúa: dale like, comenta y guarda videos que te interesen.
4. Usa la búsqueda para encontrar comercios, productos o hashtags.
5. Inicia un chat real con un comercio y haz preguntas sobre productos o servicios.
6. Anota cualquier dificultad, sugerencia o mejora que detectes.

### Para el equipo (IA, DEV, UX/UI, Product Manager)

- Recoge feedback cualitativo y cuantitativo de cada sesión.
- Documenta hallazgos en `docs/progreso-y-roadmap.md` o `memory-bank/activeContext.md`.
- Prioriza mejoras en base a la experiencia real de usuarios y comercios.

---

## 1. Inicio y Autenticación

- Arranca la app con `npx expo start` y abre en emulador o dispositivo.
- Prueba el flujo de login y registro (usuario y negocio).
- Verifica distinción de roles y acceso a rutas protegidas.
- Prueba login con Google si está configurado.

### 2. Navegación y Estructura

- Navega entre pantallas principales usando la barra/tab de navegación.
- Asegúrate de que las rutas protegidas solo sean accesibles si estás autenticado.

### 3. Perfil de Negocio (`ShowcaseView`)

- Ve al perfil de un negocio.
- Verifica:
  - Avatar real (o inicial si no hay imagen).
  - Video principal con controles (`expo-av`).
  - Grid de productos con imágenes reales (`product.imageUrl`) o placeholder.
  - Layout responsivo.

### 4. Sistema de Video

- **Subida:** Sube un video desde galería o graba uno nuevo. Verifica subida a Cloudinary y guardado en Supabase.
- **Feed:** Navega el feed tipo TikTok. Prueba reproducción automática, pausa, animaciones y botones de interacción (like, guardar, comentarios).
- **Detalle:** Accede a un video y revisa datos, comentarios y botones.

### 5. Chat Básico

- Inicia un chat entre usuario y negocio. Envía y recibe mensajes.
- Verifica la UI de chat y lista de conversaciones.

### 6. Búsqueda

- Usa la búsqueda para encontrar videos, hashtags y usuarios.
- Prueba filtros por categoría y visualización en grid.

### 7. Documentación y Sincronía

- Revisa que `/docs/ui-components.md` y `memory-bank/progress.md` estén alineados con la app.
- Si hay diferencias, anótalas para corregirlas.

### 8. Errores y Detalles

- Prueba flujos con datos faltantes (sin avatar, sin productos, sin videos).
- Observa el manejo de errores y mensajes al usuario.

---
Si todo funciona como esperas, ¡puedes avanzar con nuevas features! Si encuentras bugs, documenta el caso antes de seguir.

## LOOKYM - Project Overview

LOOKYM is a mobile application that connects users with businesses through short-form video content. The platform allows businesses to showcase their products and services, while users can discover, interact with, and directly communicate with these businesses.

## Core Features

- **Video Content**: Businesses can upload short videos to showcase their products and services
- **User Discovery**: Users can browse, search, and discover business content
- **Direct Messaging**: In-app chat functionality between users and businesses
- **Authentication**: Secure user authentication with different roles (user/business)
- **Profile Management**: Customizable profiles for both users and businesses

## Technical Architecture

LOOKYM is built using the following technologies:

- **Frontend**: React Native with Expo
- **Backend**: Supabase for authentication, database, and real-time features
- **Media Storage**: Cloudinary for video hosting and streaming
- **State Management**: Zustand with persistence
- **Styling**: React Native StyleSheet/shadcn option

## Project Structure

The project follows a modular architecture with the following main directories:

- `/app`: Contains all screens and navigation using Expo Router
- `/components`: Reusable UI components
- `/store`: Zustand stores for state management
- `/utils`: Utility functions and API clients
- `/types`: TypeScript type definitions
- `/mocks`: Mock data for development
- `/docs`: Project documentation

## Getting Started

See the [configuration.md](./configuration.md) file for setup instructions and environment configuration.

## Development Workflow

The development process is documented in [development-workflow.md](./development-workflow.md), including guidelines for contributing to the project.

## External Services

LOOKYM integrates with several external services:

- **Supabase**: For authentication, database, and real-time features
- **Cloudinary**: For video storage and streaming
- **Google OAuth**: For social authentication

See [external-services.md](./external-services.md) for detailed integration information.
