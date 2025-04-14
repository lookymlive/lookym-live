# Google Authentication Setup Guide

This guide will walk you through setting up Google Authentication for the LOOKYM app.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Give your project a name (e.g., "LOOKYM App")
4. Wait for the project to be created

## 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to "APIs & Services" > "OAuth consent screen"
2. Select the appropriate user type (External or Internal)
3. Fill in the required information:
   - App name: "LOOKYM"
   - User support email: Your email address
   - Developer contact information: Your email address
4. Add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
5. Add test users if you selected External user type
6. Review and publish the consent screen

## 3. Create OAuth 2.0 Client IDs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Select "Web application" as the application type
4. Name your client (e.g., "LOOKYM Web Client")
5. Add authorized JavaScript origins:
   - For development: `http://localhost:19006`
   - For production: Your production URL
6. Add authorized redirect URIs:
   - For development: `http://localhost:19006/auth/callback`
   - For production: `https://your-production-domain.com/auth/callback`
   - For Supabase: `https://your-project-id.supabase.co/auth/v1/callback`
7. Click "Create" and note down your Client ID and Client Secret

8. Create another OAuth client ID for mobile applications:
   - Select "Android" or "iOS" as the application type
   - For Android, provide your package name and SHA-1 signing certificate
   - For iOS, provide your bundle identifier

## 4. Configure Supabase Google Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers > Google
3. Toggle Google auth to enabled
4. Enter your Google Client ID and Client Secret
5. Save the changes

## 5. Update Your App Configuration

1. Add the Google Client IDs to your `.env` file:

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id

2.Update your app.config.js to include the Google client IDs:

```javascript
module.exports = {
  expo: {
    // ... other config
    extra: {
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    },
  },
};
```

## 6. Install Required Packages

```bash
npm install expo-auth-session expo-web-browser
```

## 7. Testing Google Sign-In

1. Make sure you've added the correct redirect URIs in the Google Cloud Console
2. Test the sign-in flow in your app
3. Check the Supabase authentication logs to verify successful sign-ins

## 8. Troubleshooting

If you encounter issues with Google Sign-In:

1. Verify that your client IDs and redirect URIs are correct
2. Check that you've enabled the Google Identity API in the Google Cloud Console
3. Ensure your OAuth consent screen is properly configured
4. Look for errors in the Expo development server logs
5. Check the Supabase authentication logs for detailed error messages
