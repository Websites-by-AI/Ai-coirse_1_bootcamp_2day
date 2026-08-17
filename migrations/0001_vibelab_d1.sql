CREATE TABLE IF NOT EXISTS vibelab_student_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  google_subject TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'password',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vibelab_student_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vibelab_student_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  goal TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL,
  project_idea TEXT NOT NULL,
  score INTEGER NOT NULL,
  fit_level TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  analysis_source TEXT NOT NULL DEFAULT 'rule_based',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vibelab_student_sessions_user ON vibelab_student_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vibelab_student_assessments_user ON vibelab_student_assessments(user_id, created_at DESC);
