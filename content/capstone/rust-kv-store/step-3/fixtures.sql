-- Seed one active key and one already-expired key to exercise GET /kv/:key
-- (found, expired, and never-existed). TRUNCATE ... RESTART IDENTITY keeps
-- this idempotent across repeated verify runs; the kv_entries table itself
-- is created by the learner's own code (Step 2), so this assumes it
-- already exists.
TRUNCATE kv_entries RESTART IDENTITY CASCADE;

INSERT INTO kv_entries (key, value, expires_at, updated_at) VALUES
  ('greeting', 'hello world', NULL, NOW()),
  ('stale', 'old value', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours');
