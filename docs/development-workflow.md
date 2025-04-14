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
