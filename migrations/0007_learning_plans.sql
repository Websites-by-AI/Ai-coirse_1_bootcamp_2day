CREATE TABLE IF NOT EXISTS vibelab_learning_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  goal TEXT NOT NULL,
  city_preference TEXT,
  resume_text TEXT NOT NULL,
  recommended_track TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vibelab_learning_plans_email ON vibelab_learning_plans(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_learning_plans_track ON vibelab_learning_plans(recommended_track, created_at DESC);
