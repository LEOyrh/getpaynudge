ALTER TABLE public.voice_profiles
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN NOT NULL DEFAULT false;