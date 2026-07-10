-- Seed three channels, alphabetically: empty-room (zero messages, to
-- exercise the LEFT JOIN null last_message_at case), general (3 messages),
-- random (2 messages). limit=2 should produce a full page 1 (empty-room,
-- general) and a partial page 2 (random). Idempotent across repeated
-- verify runs.
TRUNCATE messages, channels RESTART IDENTITY CASCADE;

INSERT INTO channels (name, created_at) VALUES
  ('empty-room', '2026-07-01T08:00:00Z'),
  ('general', '2026-07-01T09:00:00Z'),
  ('random', '2026-07-01T09:30:00Z');

INSERT INTO messages (channel_id, author, body, created_at) VALUES
  (2, 'ada', 'first', '2026-07-01T09:01:00Z'),
  (2, 'ada', 'second', '2026-07-01T09:02:00Z'),
  (2, 'grace', 'third', '2026-07-01T09:03:00Z'),
  (3, 'grace', 'hey', '2026-07-01T09:31:00Z'),
  (3, 'grace', 'anyone here', '2026-07-01T09:32:00Z');
