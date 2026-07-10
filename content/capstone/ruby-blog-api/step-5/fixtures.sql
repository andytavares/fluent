-- Seed one post with two existing comments (oldest first) to exercise
-- GET /posts/:id/comments ordering, plus a bare post to receive a new
-- comment via POST. Idempotent across repeated verify runs.
TRUNCATE comments, posts RESTART IDENTITY CASCADE;

INSERT INTO posts (title, body, published, published_at, created_at) VALUES
  ('Hello, World', 'This is my first post.', false, NULL, '2026-07-01T09:00:00Z');

INSERT INTO comments (post_id, author, body, created_at) VALUES
  (1, 'Grace', 'Nice writeup.', '2026-07-01T09:10:00Z'),
  (1, 'Ada', 'Great post!', '2026-07-01T09:20:00Z');
