-- Seed a channel with one message to exercise GET /messages/:id (found +
-- not found). Idempotent across repeated verify runs.
TRUNCATE messages, channels RESTART IDENTITY CASCADE;

INSERT INTO channels (name, created_at) VALUES
  ('general', '2026-07-01T09:00:00Z');

INSERT INTO messages (channel_id, author, body, created_at) VALUES
  (1, 'ada', 'hello, general', '2026-07-01T09:05:00Z');
