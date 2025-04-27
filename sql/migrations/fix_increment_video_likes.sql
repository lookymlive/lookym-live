-- Migración para corregir la función increment_video_likes
-- El problema era que la función esperaba un bigint pero los IDs de videos son UUID

-- Primero eliminar las funciones existentes
DROP FUNCTION IF EXISTS public.increment_video_likes(bigint);
DROP FUNCTION IF EXISTS public.increment_video_likes(uuid);

-- Actualizar la función increment_video_likes para usar UUID
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id UUID)
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

-- También eliminar decrement_video_likes por si acaso
DROP FUNCTION IF EXISTS public.decrement_video_likes(bigint);
DROP FUNCTION IF EXISTS public.decrement_video_likes(uuid);

-- Verificar que decrement_video_likes también use UUID
CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE videos
    SET likes = GREATEST(0, likes - 1)
    WHERE id = video_id;
END;
$$; 