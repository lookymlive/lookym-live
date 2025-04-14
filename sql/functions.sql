-- Functions for video management in LOOKYM

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET likes = likes + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement video likes
CREATE OR REPLACE FUNCTION decrement_video_likes(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET likes = GREATEST(0, likes - 1)
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user is a business
CREATE OR REPLACE FUNCTION is_business_account(user_id UUID)
RETURNS boolean AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;
  
  RETURN user_role = 'business';
END;
$$ LANGUAGE plpgsql;

-- Function to get trending videos
CREATE OR REPLACE FUNCTION get_trending_videos(limit_count INTEGER DEFAULT 10)
RETURNS SETOF videos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM videos
  ORDER BY (likes * 2 + views) DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get videos by hashtag
CREATE OR REPLACE FUNCTION get_videos_by_hashtag(tag TEXT, limit_count INTEGER DEFAULT 20)
RETURNS SETOF videos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM videos
  WHERE tag = ANY(hashtags)
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create a notification when a video is liked
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  video_owner_id UUID;
  liker_username TEXT;
BEGIN
  -- Get the video owner's ID
  SELECT user_id INTO video_owner_id
  FROM videos
  WHERE id = NEW.video_id;
  
  -- Don't create notification if user likes their own video
  IF video_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get the username of the person who liked the video
  SELECT username INTO liker_username
  FROM users
  WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    content,
    related_id
  ) VALUES (
    video_owner_id,
    'like',
    liker_username || ' liked your video',
    NEW.video_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like notifications
CREATE TRIGGER video_like_notification
AFTER INSERT ON video_likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

-- Function to create a notification when a video is commented on
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  video_owner_id UUID;
  commenter_username TEXT;
BEGIN
  -- Get the video owner's ID
  SELECT user_id INTO video_owner_id
  FROM videos
  WHERE id = NEW.video_id;
  
  -- Don't create notification if user comments on their own video
  IF video_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get the username of the commenter
  SELECT username INTO commenter_username
  FROM users
  WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    content,
    related_id
  ) VALUES (
    video_owner_id,
    'comment',
    commenter_username || ' commented on your video',
    NEW.video_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment notifications
CREATE TRIGGER video_comment_notification
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_notification();

-- Function to check if a user can upload videos (must be a business account)
CREATE OR REPLACE FUNCTION can_upload_video(user_id UUID)
RETURNS boolean AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;
  
  RETURN user_role = 'business';
END;
$$ LANGUAGE plpgsql;

-- Row level security policy for video uploads
CREATE POLICY insert_videos_policy ON videos
FOR INSERT
TO authenticated
WITH CHECK (
  can_upload_video(auth.uid())
);