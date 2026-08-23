CREATE TABLE IF NOT EXISTS vibelab_internship_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  track TEXT NOT NULL,
  location_id TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  portfolio_url TEXT,
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'جدید',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vibelab_internship_applications_email ON vibelab_internship_applications(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_internship_applications_location ON vibelab_internship_applications(location_id, created_at DESC);
