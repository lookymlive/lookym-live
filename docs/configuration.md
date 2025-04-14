# LOOKYM - Configuration Guide

This document provides instructions for setting up and configuring the LOOKYM application for development and production environments.

## Environment Setup

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Copy `.env.example` to `.env` and fill in the required values (see below)

## Environment Variables (`.env`)

The application requires the following environment variables:

### Supabase Configuration

* `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL (from Project Settings > API).
* `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project `anon` key (public) (from Project Settings > API).

```dotenv
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Cloudinary Configuration

* `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
* `EXPO_PUBLIC_CLOUDINARY_API_KEY`: Your Cloudinary API key (may be needed for certain operations).
* `EXPO_PUBLIC_CLOUDINARY_API_SECRET`: Your Cloudinary API secret (should **not** be exposed client-side; use for backend signing if needed).
* `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset (for unsigned uploads from client).

```dotenv
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
EXPO_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-api-key
# EXPO_PUBLIC_CLOUDINARY_API_SECRET=your-cloudinary-api-secret # WARNING: Do not expose secret client-side
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
```

### Google OAuth Configuration (if used)

* `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google OAuth Web Client ID.
* `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: Google OAuth Android Client ID.
* `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: Google OAuth iOS Client ID.

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-google-android-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
```

## Supabase Setup

Refer to the detailed `docs/supabase-setup.md` guide for creating the project and setting up Authentication and Storage.

**The primary method for setting up the database schema is to run the `sql/schema.sql` script in the Supabase SQL Editor.**

This script defines the following tables (summary - see `sql/schema.sql` for details):

* `users`: Profiles linked to `auth.users`.
* `videos`: Video metadata.
* `comments`: Video comments.
* `video_likes`: Tracks likes.
* `saved_videos`: Tracks saved videos.
* `followers`: User follow relationships.
* `chats`: Chat conversations.
* `chat_participants`: Links users to chats.
* `messages`: Chat messages (uses `content` column).
* `notifications`: User notifications.

It also sets up necessary functions (`handle_new_user`, like helpers, timestamp updates), triggers, a `video_feed` view, and enables Row Level Security (RLS) with example policies.

**Remember to review and customize the RLS policies in `sql/schema.sql` for your specific security needs.**

## Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Find your Cloud Name, API Key, and API Secret in the dashboard.
3. Go to Settings > Upload.
4. Create an **unsigned** upload preset (e.g., `lookym_videos`) for client-side video uploads. Note the preset name for your `.env` file.
5. Configure CORS settings (Settings > Security > Allowed fetch domains) to allow uploads from your app domains/localhost during development.

## Running the Application

* **Start Development Server:** `npx expo start` (or `yarn start`, `npm start`)
* Follow prompts to open on iOS simulator, Android emulator, or web browser.

## Building for Production

Follow the Expo Application Services (EAS) documentation:

* [EAS Build Setup](https://docs.expo.dev/build/setup/)
* Ensure production environment variables are configured correctly within EAS Secrets if applicable.
