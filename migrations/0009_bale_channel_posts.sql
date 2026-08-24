CREATE TABLE IF NOT EXISTS vibelab_bale_channel_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_url TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_vibelab_bale_channel_posts_status ON vibelab_bale_channel_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_bale_channel_posts_channel ON vibelab_bale_channel_posts(channel_id, created_at DESC);
