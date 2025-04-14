# Supabase Setup Guide

This guide will walk you through setting up Supabase for the LOOKYM app, reflecting the schema defined in `sql/schema.sql`.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "lookym")
4. Set a secure database password
5. Choose a region closest to your users
6. Wait for your project to be created (this may take a few minutes)

## 2. Set Up Database Schema via SQL Editor

Once your project is ready, navigate to the SQL Editor in the Supabase dashboard.
**It is highly recommended to copy the entire contents of the `sql/schema.sql` file from the project repository and run it directly in the SQL Editor.** This ensures all tables, functions, triggers, views, and RLS policies are created correctly.

The script includes the following components (summary):

### Tables

* `public.users`: User profile information, linked to `auth.users`.
* `public.videos`: Video metadata (URLs likely point to Cloudinary).
* `public.comments`: Comments on videos.
* `public.video_likes`: Tracks individual user likes on videos.
* `public.saved_videos`: Tracks user bookmarks/saves of videos.
* `public.followers`: Tracks follow relationships between users.
* `public.chats`: Represents chat conversations.
* `public.chat_participants`: Links users to chats.
* `public.messages`: Individual chat messages.
* `public.notifications`: Stores user notifications (added during development).

### Functions

* `public.handle_new_user()`: Trigger function to create a user profile upon signup.
* `public.increment_video_likes(UUID)`: Increments denormalized like count on `videos`.
* `public.decrement_video_likes(UUID)`: Decrements denormalized like count on `videos`.
* `public.update_updated_at()`: Trigger function to update `updated_at` timestamps automatically.

### Views

* `public.video_feed`: Combines video and user data for feed display (added during development).

### Triggers

* `on_auth_user_created`: Calls `handle_new_user()` after user signup.
* `update_*_updated_at`: Calls `update_updated_at()` before updates on relevant tables.

*(Refer to `sql/schema.sql` for the complete definitions and comments)*

## 3. Set Up Storage Buckets

* This step might be less critical if Cloudinary is the primary storage for videos/thumbnails, but useful for avatars.*

1. Navigate to the Storage section in the Supabase dashboard
2. Create the following buckets:
   * `avatars` (for user profile pictures)
   * Optionally: `videos`, `thumbnails` (if needed as fallback or alongside Cloudinary)

3. Set appropriate bucket policies for `avatars` (examples below, adjust as needed). Refer to Supabase docs for policies if using buckets for `videos`/`thumbnails`.

```sql
-- Example Policies for 'avatars' bucket:

-- Allow public read access for avatars
DROP POLICY IF EXISTS "Public avatars are viewable" ON storage.objects;
CREATE POLICY "Public avatars are viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

```

## 4. Set Up Authentication

1. Navigate to the Authentication section in the Supabase dashboard
2. Under "Providers", enable the desired providers:
   * Email (enabled by default)
   * Google (requires configuring credentials in Supabase Auth settings)
   * Others as needed (Apple, Facebook, etc.)
3. Under "Settings" > "Auth Settings", configure:
   * **Site URL:** Set to your application's URL (important for email links).
   * **Redirect URLs:** Add any URLs Supabase needs to redirect back to after authentication.
   * Disable "Confirm email" if not desired during development, but **enable for production**.
4. Under "Templates", customize email templates (Confirmation, Password Reset, etc.).

## 5. Set Up API Access & Environment Variables

1. Go to Project Settings > API in the Supabase dashboard
2. Find your **Project URL** and the **`anon` public key**.
3. Create a `.env` file at the root of your LOOKYM project (if it doesn't exist).
4. Add the following lines to your `.env` file, replacing the placeholders with your actual values:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Add other keys (Cloudinary, Google OAuth) as documented elsewhere
```

5.Ensure your Supabase client initialization code (likely in `utils/supabase.ts` or similar) reads these environment variables correctly.

## 6. Set Up Row Level Security (RLS)

The `sql/schema.sql` script already enables RLS on all tables and provides a set of example policies.

**IMPORTANT:**

* **Review Policies:** Carefully review the RLS policies defined at the end of `sql/schema.sql`.
* **Customize:** Modify these policies to match the exact access control requirements of your LOOKYM application. The provided policies are examples and might need adjustment for your specific use cases (e.g., admin roles, specific business logic).
* **Test Thoroughly:** Test RLS extensively to ensure users can only access the data they are permitted to see and modify.

## 7. Testing Your Setup

1. Run the application.
2. Try signing up a new user. Verify:
   * The user is created in Supabase Auth (Authentication > Users).
   * A corresponding row is created in the `public.users` table (use the Table Editor).
3. Try logging in and logging out.
4. If other features are implemented, test their interaction with Supabase (e.g., creating a comment, liking a video) and check the database tables and RLS policies.
5. Use the Supabase dashboard's SQL Editor or Table Editor to manually insert/query data for testing purposes.

## 8. Monitoring and Maintenance

1. Regularly check the Supabase dashboard for usage metrics and potential errors.
2. Consider setting up database backups (Database > Backups).
3. Monitor API usage and performance (Reports section).

## 9. Production Considerations

1. Ensure RLS policies are robust and secure.
2. Enable email confirmations in Auth settings.
3. Consider enabling Point-in-Time Recovery (PITR) for the database (paid plan feature).
4. Set up custom domain(s) if needed.
5. Configure appropriate CORS settings (API > CORS Settings).
6. Review Supabase pricing plans based on expected usage.
7. **Never** commit your `service_role` key or database password to your repository.
