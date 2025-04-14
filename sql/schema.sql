-- LOOKYM Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'business')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'User profile information, linked to Supabase auth users.';

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT, -- Nullable as decided
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0, -- Denormalized count, updated by triggers or functions
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.videos IS 'Stores video metadata and references.';

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.comments IS 'Comments on videos.';

-- Create video_likes table (for tracking which users liked which videos)
CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
COMMENT ON TABLE public.video_likes IS 'Tracks individual likes given by users to videos.';

-- Create saved_videos table (for tracking which users saved which videos)
CREATE TABLE IF NOT EXISTS public.saved_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
COMMENT ON TABLE public.saved_videos IS 'Tracks videos saved (bookmarked) by users.';

-- Create followers table (Added based on documentation review)
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);
COMMENT ON TABLE public.followers IS 'Tracks follow relationships between users.';

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.chats IS 'Represents a chat conversation.';

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);
COMMENT ON TABLE public.chat_participants IS 'Links users to chat conversations.';

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Sender ID
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.messages IS 'Individual chat messages within a conversation.';

-- Create notifications table (Added during schema development)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- The user who receives the notification
  type TEXT NOT NULL, -- e.g., 'new_comment', 'new_follower', 'new_message', 'video_like'
  content TEXT NOT NULL, -- Description of the notification
  related_entity_id UUID, -- Optional: ID of the related entity (e.g., video_id, user_id, message_id)
  related_entity_type TEXT, -- Optional: Type of the related entity (e.g., 'video', 'user', 'message')
  origin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Optional: User who caused the notification (e.g., who liked the video)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.notifications IS 'Stores notifications for users.';

-- Functions
-- Create function to handle new user signup (Added based on documentation review)
-- This function runs as a trigger when a new user signs up in Supabase Auth.
-- It inserts a corresponding row into the public.users table.
-- Ensure your client-side signup passes 'username' and 'role' in options.data.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- SET search_path = ''; -- No es estrictamente necesario aquí si usas public.users
AS $$
BEGIN
  -- INSERTA la fila en public.users usando los datos pasados desde el cliente
  INSERT INTO public.users (id, email, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,                         -- El ID del nuevo usuario en auth.users
    NEW.email,                      -- El email del nuevo usuario
    NEW.raw_user_meta_data->>'username', -- El username pasado en options.data
    NEW.raw_user_meta_data->>'display_name', -- El display_name pasado en options.data
    NEW.raw_user_meta_data->>'avatar_url', -- El avatar_url pasado en options.data
    NEW.raw_user_meta_data->>'role'      -- El role pasado en options.data
  );
  RETURN NEW; -- Devuelve el objeto NEW para completar el trigger
END;
$$;

-- Create functions for incrementing/decrementing likes count on videos table (Added based on documentation review)
-- These can be called via RPC or potentially triggers on video_likes table.
-- From sql/schema.sql (Lines 139-147)
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE videos
    SET likes = likes + 1
    WHERE id = video_id;
END;
$$;

-- Create a trigger function to update the updated_at column (Added during schema development)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Views
-- Create a view for video feed with user details (Added during schema development)
DROP VIEW IF EXISTS public.video_feed;

CREATE OR REPLACE VIEW public.video_feed WITH (security_invoker = true) AS
SELECT
  v.id,
  v.video_url,
  v.thumbnail_url,
  v.caption,
  v.hashtags,
  v.likes,
  v.views,
  v.created_at,
  v.updated_at,
  u.id as user_id,
  u.username,
  u.display_name,
  u.avatar_url,
  u.role,
  u.verified
FROM public.videos v
JOIN public.users u ON v.user_id = u.id
ORDER BY v.created_at DESC;
COMMENT ON VIEW public.video_feed IS 'Provides a convenient view combining video details with basic user information for feed display.';

-- Triggers
-- Trigger to create user profile on signup (Added based on documentation review)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Drop existing trigger if it exists
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Calls handle_new_user() after a user signs up.';

-- Apply the updated_at trigger to all tables with updated_at (Added during schema development)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Row Level Security (RLS)
-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY; -- Added RLS for followers
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Define specific policies below)
-- NOTE: These are placeholders/examples. Review and adjust them carefully based on your application's access control needs.

-- USERS Table Policies
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.users;
CREATE POLICY "Allow public read access to profiles"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own profile via trigger" ON public.users;
CREATE POLICY "Allow users to insert their own profile via trigger"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id); -- Restrict direct inserts, rely on handle_new_user trigger

-- VIDEOS Table Policies
DROP POLICY IF EXISTS "Allow public read access to videos" ON public.videos;
CREATE POLICY "Allow public read access to videos"
  ON public.videos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert videos" ON public.videos;
CREATE POLICY "Allow authenticated users to insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own videos" ON public.videos;
CREATE POLICY "Allow users to update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own videos" ON public.videos;
CREATE POLICY "Allow users to delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- COMMENTS Table Policies
DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;
CREATE POLICY "Allow public read access to comments"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON public.comments;
CREATE POLICY "Allow authenticated users to insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.comments;
CREATE POLICY "Allow users to delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- VIDEO_LIKES Table Policies
DROP POLICY IF EXISTS "Allow public read access to video likes" ON public.video_likes;
CREATE POLICY "Allow public read access to video likes"
  ON public.video_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert/delete video likes" ON public.video_likes;
CREATE POLICY "Allow authenticated users to insert/delete video likes"
  ON public.video_likes FOR ALL -- Covers INSERT and DELETE
  USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- SAVED_VIDEOS Table Policies
DROP POLICY IF EXISTS "Allow users to view their own saved videos" ON public.saved_videos;
CREATE POLICY "Allow users to view their own saved videos"
  ON public.saved_videos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert/delete their own saved videos" ON public.saved_videos;
CREATE POLICY "Allow users to insert/delete their own saved videos"
  ON public.saved_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FOLLOWERS Table Policies
DROP POLICY IF EXISTS "Allow public read access to follower relationships" ON public.followers;
CREATE POLICY "Allow public read access to follower relationships"
  ON public.followers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert/delete follow relationships" ON public.followers;
CREATE POLICY "Allow authenticated users to insert/delete follow relationships"
  ON public.followers FOR ALL
  USING (auth.role() = 'authenticated' AND (auth.uid() = follower_id OR auth.uid() = following_id))
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = follower_id);

-- CHATS Table Policies
DROP POLICY IF EXISTS "Allow participants to access chat" ON public.chats;
CREATE POLICY "Allow participants to access chat"
  ON public.chats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.chat_id = id AND cp.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow authenticated users to create chats" ON public.chats;
CREATE POLICY "Allow authenticated users to create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'); -- Further checks might be needed in application logic or functions

-- CHAT_PARTICIPANTS Table Policies
DROP POLICY IF EXISTS "Allow participants to view their own participation" ON public.chat_participants;
CREATE POLICY "Allow participants to view their own participation"
  ON public.chat_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to be added to chats (potentially via a function or backend logic)
DROP POLICY IF EXISTS "Allow chat participants to be added" ON public.chat_participants;
CREATE POLICY "Allow chat participants to be added"
  ON public.chat_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'); -- Or more specific logic

-- MESSAGES Table Policies
DROP POLICY IF EXISTS "Allow participants to access messages in their chats" ON public.messages;
CREATE POLICY "Allow participants to access messages in their chats"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow participants to insert messages in their chats" ON public.messages;
CREATE POLICY "Allow participants to insert messages in their chats"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.chat_id = messages.chat_id AND cp.user_id = auth.uid()
  ));

-- NOTIFICATIONS Table Policies
DROP POLICY IF EXISTS "Allow users to access their own notifications" ON public.notifications;
CREATE POLICY "Allow users to access their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to mark their own notifications as read" ON public.notifications;
CREATE POLICY "Allow users to mark their own notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow notifications to be inserted (likely via backend functions or triggers)
DROP POLICY IF EXISTS "Allow notifications to be inserted" ON public.notifications;
CREATE POLICY "Allow notifications to be inserted"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated'); -- Or more specific logic, e.g., SERVICE_ROLE