-- Seed one key to delete; deleting a missing key is exercised against a
-- key that was never inserted. Idempotent across repeated verify runs.
TRUNCATE kv_entries RESTART IDENTITY CASCADE;

INSERT INTO kv_entries (key, value, expires_at, updated_at) VALUES
  ('todelete', 'temporary', NULL, NOW());
