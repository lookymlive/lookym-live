# LOOKYM - Project Overview

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
