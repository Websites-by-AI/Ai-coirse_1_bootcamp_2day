CREATE TABLE IF NOT EXISTS vibelab_telegram_user_state (
  chat_id INTEGER PRIMARY KEY,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  channel_nudged INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vibelab_local_groups (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  zone TEXT NOT NULL,
  track TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vibelab_local_group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  chat_id INTEGER NOT NULL,
  username TEXT,
  first_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, chat_id)
);

CREATE INDEX IF NOT EXISTS idx_vibelab_local_group_members_group ON vibelab_local_group_members(group_id, status);
