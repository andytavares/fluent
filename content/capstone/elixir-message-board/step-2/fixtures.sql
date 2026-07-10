-- Seed one existing channel ("general") to exercise the duplicate-name
-- 409 path. The tables themselves are created by the learner's own code
-- on startup (this step), so this assumes they already exist. Idempotent
-- across repeated verify runs.
TRUNCATE messages, channels RESTART IDENTITY CASCADE;

INSERT INTO channels (name, created_at) VALUES
  ('general', '2026-07-01T09:00:00Z');
