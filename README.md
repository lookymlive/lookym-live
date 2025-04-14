# LOOKYM

> **For the latest project status, priorities, and step-by-step development guide, see [`PROJECT_STATUS.md`](./PROJECT_STATUS.md). All contributors (human or AI) should check this file before making changes.**


LOOKYM is a mobile application that connects users with businesses through short-form video content.

## Features

- **Video Content**: Businesses can upload short videos to showcase their products and services
- **User Discovery**: Users can browse, search, and discover business content
- **Direct Messaging**: In-app chat functionality between users and businesses
- **Authentication**: Secure user authentication with different roles (user/business)
- **Profile Management**: Customizable profiles for both users and businesses

## Getting Started

See [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the current project state, what works, and next steps.

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository

   git clone <https://github.com/yourusername/lookym.git>

   cd lookym

2. Install dependencies

   npm install
   or
   yarn install

3. Create a `.env` file based on `.env.example` and fill in your credentials
   cp .env.example .env

4. Start the development server

   npm start

## or

   yarn start

## Project Structure

- `/app`: Screens and navigation (Expo Router)
- `/components`: Reusable UI components
- `/store`: Zustand stores for state management
- `/utils`: Utility functions and API clients
- `/types`: TypeScript type definitions
- `/mocks`: Mock data for development
- `/docs`: Project documentation

## Documentation

For detailed documentation, see the `/docs` directory:

- [Overview](./docs/overview.md)
- [Configuration](./docs/configuration.md)
- [Development Workflow](./docs/development-workflow.md)
- [External Services](./docs/external-services.md)
- [State Management](./docs/state-management.md)
- [UI Components](./docs/ui-components.md)
- [Styling Guide](./docs/styling-guide.md)
- [Authentication](./docs/authentication.md)
- [Video System](./docs/video-system.md)
- [Chat Implementation](./docs/chat-implementation.md)

## Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **Supabase**: Backend as a Service for authentication, database, and real-time features
- **Cloudinary**: Cloud-based media management
- **Zustand**: State management library
- **TypeScript**: Type-safe JavaScript

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
