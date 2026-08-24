ALTER TABLE vibelab_internship_applications ADD COLUMN source TEXT;
ALTER TABLE vibelab_internship_applications ADD COLUMN utm_source TEXT;
ALTER TABLE vibelab_internship_applications ADD COLUMN utm_medium TEXT;
ALTER TABLE vibelab_internship_applications ADD COLUMN utm_campaign TEXT;
ALTER TABLE vibelab_internship_applications ADD COLUMN referrer TEXT;

CREATE INDEX IF NOT EXISTS idx_vibelab_internship_source ON vibelab_internship_applications(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibelab_internship_utm_source ON vibelab_internship_applications(utm_source, created_at DESC);
