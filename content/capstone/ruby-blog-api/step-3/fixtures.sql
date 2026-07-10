-- Seed a couple of draft posts to exercise GET /posts/:id (found + not
-- found). TRUNCATE ... RESTART IDENTITY keeps this idempotent across
-- repeated verify runs; the posts table itself is created by the
-- learner's own code (Step 2), so this assumes it already exists.
TRUNCATE posts RESTART IDENTITY CASCADE;

INSERT INTO posts (title, body, published, published_at, created_at) VALUES
  ('Hello, World', 'This is my first post.', false, NULL, '2026-07-01T09:00:00Z'),
  ('Draft Two', 'Still working on this one.', false, NULL, '2026-07-02T09:00:00Z');
