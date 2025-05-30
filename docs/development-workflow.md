
# Onboarding rápido para IA Product Manager, UX/UI y Devs

Este documento te guía para que cualquier IA o humano pueda continuar el desarrollo, testing, diseño o gestión del producto de forma profesional y rápida.

## Pasos iniciales recomendados

1. Lee `/docs/overview.md` para la visión general y arquitectura.
2. Consulta `/docs/ui-components.md` para conocer los componentes UI y su uso.
3. El estado y roadmap están en `/docs/progreso-y-roadmap.md` y `/docs/3TODO.txt`.
4. El contexto técnico y decisiones clave están en `/memory-bank/`.

## Testing y calidad

- Ejecuta los tests con `npm test` o desde la tarea "Run App Tests" en VS Code.
- Los tests de stores usan mocks realistas de usuario y servicios externos (ver `/store/__tests__`).
- El patrón de mock de Zustand y usuario global está documentado más abajo en este archivo.

## Documentación y buenas prácticas

- Actualiza siempre `/docs/ui-components.md`, `/docs/chat-implementation.md` y este archivo al agregar features.
- Usa ejemplos de código y explica los patrones para facilitar el onboarding.

---

# Mock de Zustand y usuario global para tests (patrón recomendado)

Para testear stores que dependen de autenticación o Zustand, sigue este patrón:

1. **Tipa el usuario global:**

   ```ts
   import type { User } from "../../types/user.ts";
   declare global {
     // eslint-disable-next-line no-var
     var __FAKE_USER__: User;
   }
   globalThis.__FAKE_USER__ = {
     id: "user1",
     email: "test@example.com",
     username: "Test",
     displayName: "Test User",
     avatar: "",
     bio: "",
     role: "user",
     verified: false,
   };
   ```

2. **Mockea el store de Zustand con la API real:**

   ```ts
   jest.mock("../auth-store", () => ({
     useAuthStore: {
       getState: () => ({ currentUser: globalThis.__FAKE_USER__ }),
       // Agrega otros métodos si tu store los usa
     },
   }));
   ```

3. **¿Cómo funciona?**
   - Cualquier llamada a `useAuthStore.getState()` en el código de producción o tests devolverá el usuario simulado.
   - Así puedes testear lógica de autenticación, permisos, etc. sin depender de la implementación real ni de Supabase.
   - Si tu store crece, puedes agregar más métodos al mock.

4. **¿Dónde usarlo?**
   - En archivos de test que requieran un usuario autenticado o lógica de sesión.
   - Útil para stores como `chat-store`, `notifications-store`, etc.

---

# LOOKYM - Development Workflow

This document outlines the development workflow and best practices for contributing to the LOOKYM project.

## Development Environment

1. Ensure you have Node.js (v16+) and npm/yarn installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Set up environment variables as described in [configuration.md](./configuration.md)

## Project Structure

The project follows a modular architecture:

- `/app`: Screens and navigation (Expo Router)
- `/components`: Reusable UI components
- `/store`: Zustand stores for state management
- `/utils`: Utility functions and API clients
- `/types`: TypeScript type definitions
- `/mocks`: Mock data for development
- `/docs`: Project documentation

## Development Process

### 1. Feature Planning

- Document feature requirements in the appropriate issue
- Break down the feature into smaller tasks
- Identify dependencies and potential challenges

### 2. Implementation

- Create a new branch for your feature: `feature/feature-name`
- Follow the coding standards and best practices
- Write tests for your code when applicable
- Use mock data for development when external services are not available

### 3. Testing

- Test your changes on multiple devices/platforms
- Ensure the application works in both light and dark modes
- Verify that your changes don't break existing functionality

### 4. Code Review

- Submit a pull request with a clear description of your changes
- Address any feedback from code reviews
- Ensure all tests pass before merging

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures in the `/types` directory
- Use proper type annotations for function parameters and return values

### React Native

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Use the React Native StyleSheet for styling

### State Management

- Use Zustand for global state management
- Keep state minimal and normalized
- Use local state for UI-specific state that doesn't need to be shared

### File Naming Conventions

- Use PascalCase for component files: `ComponentName.tsx`
- Use kebab-case for utility files: `utility-name.ts`
- Use camelCase for hook files: `useHookName.ts`

## Working with External Services

### Supabase

- Use the Supabase client from `/utils/supabase.ts`
- Handle errors properly and provide user feedback
- Use TypeScript types for database tables

### Cloudinary

- Use the Cloudinary utilities from `/utils/cloudinary.ts`
- Optimize video uploads for mobile devices
- Handle upload progress and errors gracefully

## Testing

- Use Expo's testing tools for component testing
- Test on both iOS and Android when possible
- Test on web to ensure cross-platform compatibility
