-- Seed a channel with 12 messages at increasing timestamps, so the "10
-- most recent" limit is actually exercised (message 12 must appear,
-- message 1 must not). "ghost" is deliberately left absent to exercise
-- the 404 path. Idempotent across repeated verify runs.
TRUNCATE messages, channels RESTART IDENTITY CASCADE;

INSERT INTO channels (name, created_at) VALUES
  ('general', '2026-07-01T09:00:00Z');

INSERT INTO messages (channel_id, author, body, created_at) VALUES
  (1, 'ada', 'message one', '2026-07-01T09:01:00Z'),
  (1, 'ada', 'message two', '2026-07-01T09:02:00Z'),
  (1, 'ada', 'message three', '2026-07-01T09:03:00Z'),
  (1, 'ada', 'message four', '2026-07-01T09:04:00Z'),
  (1, 'ada', 'message five', '2026-07-01T09:05:00Z'),
  (1, 'ada', 'message six', '2026-07-01T09:06:00Z'),
  (1, 'ada', 'message seven', '2026-07-01T09:07:00Z'),
  (1, 'ada', 'message eight', '2026-07-01T09:08:00Z'),
  (1, 'ada', 'message nine', '2026-07-01T09:09:00Z'),
  (1, 'ada', 'message ten', '2026-07-01T09:10:00Z'),
  (1, 'ada', 'message eleven', '2026-07-01T09:11:00Z'),
  (1, 'grace', 'message twelve', '2026-07-01T09:12:00Z');
