# Guía de uso y pruebas funcionales (actualizado al 2025-05-10)

> ℹ️ **Para IA y desarrolladores:** Sigue siempre la [guía de buenas prácticas Markdown](./guia-documentacion.md) para evitar errores de formato y mantener la documentación consistente.

Sigue estos pasos para probar y validar las funciones principales de LOOKYM antes de avanzar con nuevas features:

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
