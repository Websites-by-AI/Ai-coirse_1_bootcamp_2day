CREATE VIEW IF NOT EXISTS vibelab_user_names_model AS
SELECT
  id,
  full_name AS display_name,
  email,
  phone,
  auth_provider,
  created_at
FROM vibelab_student_users;
