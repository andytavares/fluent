-- Seed exactly 7 rows so GET /count has a deterministic expected value.
-- Idempotent across repeated verify runs.
TRUNCATE entries RESTART IDENTITY CASCADE;

INSERT INTO entries (name, message, created_at) VALUES
  ('Visitor One', 'msg1', '2026-07-01T09:00:00Z'),
  ('Visitor Two', 'msg2', '2026-07-01T09:01:00Z'),
  ('Visitor Three', 'msg3', '2026-07-01T09:02:00Z'),
  ('Visitor Four', 'msg4', '2026-07-01T09:03:00Z'),
  ('Visitor Five', 'msg5', '2026-07-01T09:04:00Z'),
  ('Visitor Six', 'msg6', '2026-07-01T09:05:00Z'),
  ('Visitor Seven', 'msg7', '2026-07-01T09:06:00Z');
