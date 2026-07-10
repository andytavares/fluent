-- Seed a draft (publishable) and an already-published post to exercise
-- both branches, plus the standard 404 case. Idempotent across repeated
-- verify runs.
TRUNCATE posts RESTART IDENTITY CASCADE;

INSERT INTO posts (title, body, published, published_at, created_at) VALUES
  ('Hello, World', 'This is my first post.', false, NULL, '2026-07-01T09:00:00Z'),
  ('Already Live', 'This one shipped already.', true, '2026-07-02T10:00:00Z', '2026-07-02T09:00:00Z');
