# LOOKYM - External Services Integration

This document provides details on how LOOKYM integrates with external services and APIs.

## Supabase

LOOKYM uses Supabase for authentication, database, and real-time features.

### Authentication

- Email/Password authentication
- Social authentication with Google (optional)
- JWT token management and refresh
- Role-based access control (user/business)

### Database

Supabase PostgreSQL database is used to store:

- User profiles
- Videos metadata
- Comments
- Chat messages
- Likes and interactions

### Real-time Features

Supabase Realtime is used for:

- Live chat messaging
- Real-time notifications
- Content updates

### Integration

The Supabase client is initialized in `/utils/supabase.ts` and provides methods for:

- Authentication operations
- Database queries
- Real-time subscriptions

## Cloudinary

Cloudinary is used for video storage, processing, and delivery.

### Video Upload

- Direct upload from mobile devices
- Upload progress tracking
- Automatic video optimization

### Video Processing

- Thumbnail generation
- Transcoding for different qualities
- Adaptive streaming

### Video Delivery

- CDN delivery for fast loading
- Adaptive bitrate streaming
- Video analytics

### Integration Cloudinary

The Cloudinary utilities in `/utils/cloudinary.ts` provide methods for:

- Uploading videos
- Generating video URLs
- Creating video thumbnails

## Google OAuth

Google OAuth is used for social authentication.

### Features

- One-click sign-in
- Profile information retrieval
- Cross-platform authentication

### Integration Google

The Google Auth utilities in `/utils/google-auth.ts` handle:

- OAuth flow
- Token management
- Profile data extraction

## Environment Configuration

All external service credentials are managed through environment variables:

## Supabase .env

EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY

## Cloudinary .env

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
EXPO_PUBLIC_CLOUDINARY_API_KEY
EXPO_PUBLIC_CLOUDINARY_API_SECRET
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET

## Google OAuth .env

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

See [configuration.md](./configuration.md) for setup instructions.
