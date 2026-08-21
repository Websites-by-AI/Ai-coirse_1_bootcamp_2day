CREATE TABLE IF NOT EXISTS vibelab_telegram_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  update_id INTEGER,
  chat_id INTEGER,
  username TEXT,
  first_name TEXT,
  text TEXT,
  command TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vibelab_telegram_events_chat ON vibelab_telegram_events(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_telegram_events_command ON vibelab_telegram_events(command, created_at DESC);
