-- Seed one channel ("general") to post messages into. "ghost" is
-- deliberately left absent to exercise the 404 path. Idempotent across
-- repeated verify runs.
TRUNCATE messages, channels RESTART IDENTITY CASCADE;

INSERT INTO channels (name, created_at) VALUES
  ('general', '2026-07-01T09:00:00Z');
