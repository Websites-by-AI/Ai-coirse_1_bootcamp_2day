CREATE TABLE IF NOT EXISTS vibelab_admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vibelab_admin_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES vibelab_admin_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vibelab_student_admin_status (
  user_id INTEGER PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'جدید',
  track TEXT NOT NULL DEFAULT 'ماراتن دو روزه VibeLab',
  source TEXT NOT NULL DEFAULT 'ثبت‌نام Cloudflare D1',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vibelab_admin_sessions_user ON vibelab_admin_sessions(user_id);
