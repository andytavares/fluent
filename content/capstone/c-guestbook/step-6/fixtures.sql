-- Seed 15 rows to exercise pagination: default limit=10 should produce a
-- full page 1 (10 entries, oldest first) and a partial page 2 (5 entries).
-- Idempotent across repeated verify runs.
TRUNCATE entries RESTART IDENTITY CASCADE;

INSERT INTO entries (name, message, created_at) VALUES
  ('Visitor One', 'msg1', '2026-07-01T09:00:00Z'),
  ('Visitor Two', 'msg2', '2026-07-01T09:01:00Z'),
  ('Visitor Three', 'msg3', '2026-07-01T09:02:00Z'),
  ('Visitor Four', 'msg4', '2026-07-01T09:03:00Z'),
  ('Visitor Five', 'msg5', '2026-07-01T09:04:00Z'),
  ('Visitor Six', 'msg6', '2026-07-01T09:05:00Z'),
  ('Visitor Seven', 'msg7', '2026-07-01T09:06:00Z'),
  ('Visitor Eight', 'msg8', '2026-07-01T09:07:00Z'),
  ('Visitor Nine', 'msg9', '2026-07-01T09:08:00Z'),
  ('Visitor Ten', 'msg10', '2026-07-01T09:09:00Z'),
  ('Visitor Eleven', 'msg11', '2026-07-01T09:10:00Z'),
  ('Visitor Twelve', 'msg12', '2026-07-01T09:11:00Z'),
  ('Visitor Thirteen', 'msg13', '2026-07-01T09:12:00Z'),
  ('Visitor Fourteen', 'msg14', '2026-07-01T09:13:00Z'),
  ('Visitor Fifteen', 'msg15', '2026-07-01T09:14:00Z');
