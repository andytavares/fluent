-- Seed 15 rows to exercise pagination: default limit=10 should produce a
-- full page 1 (10 users) and a partial page 2 (5 users). Idempotent across
-- repeated verify runs.
TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, created_at) VALUES
  ('User One', 'user1@example.com', '2026-07-01T09:00:00Z'),
  ('User Two', 'user2@example.com', '2026-07-01T09:01:00Z'),
  ('User Three', 'user3@example.com', '2026-07-01T09:02:00Z'),
  ('User Four', 'user4@example.com', '2026-07-01T09:03:00Z'),
  ('User Five', 'user5@example.com', '2026-07-01T09:04:00Z'),
  ('User Six', 'user6@example.com', '2026-07-01T09:05:00Z'),
  ('User Seven', 'user7@example.com', '2026-07-01T09:06:00Z'),
  ('User Eight', 'user8@example.com', '2026-07-01T09:07:00Z'),
  ('User Nine', 'user9@example.com', '2026-07-01T09:08:00Z'),
  ('User Ten', 'user10@example.com', '2026-07-01T09:09:00Z'),
  ('User Eleven', 'user11@example.com', '2026-07-01T09:10:00Z'),
  ('User Twelve', 'user12@example.com', '2026-07-01T09:11:00Z'),
  ('User Thirteen', 'user13@example.com', '2026-07-01T09:12:00Z'),
  ('User Fourteen', 'user14@example.com', '2026-07-01T09:13:00Z'),
  ('User Fifteen', 'user15@example.com', '2026-07-01T09:14:00Z');
