ALTER TABLE vibelab_channel_posts ADD COLUMN category TEXT;
CREATE INDEX IF NOT EXISTS idx_vibelab_channel_posts_category ON vibelab_channel_posts(category, created_at DESC);
