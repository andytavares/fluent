-- Seed 7 published posts and 3 drafts (interleaved) to exercise the
-- published-only feed and pagination: total published = 7, so
-- limit=5 gives a full page 1 (5 posts) and a partial page 2 (2 posts).
-- Drafts must never appear. Idempotent across repeated verify runs.
TRUNCATE comments, posts RESTART IDENTITY CASCADE;

INSERT INTO posts (title, body, published, published_at, created_at) VALUES
  ('Draft A', 'Not ready yet.', false, NULL, '2026-07-01T08:00:00Z'),
  ('Published One', 'First published post.', true, '2026-07-01T09:00:00Z', '2026-07-01T08:30:00Z'),
  ('Published Two', 'Second published post.', true, '2026-07-02T09:00:00Z', '2026-07-02T08:30:00Z'),
  ('Draft B', 'Still drafting.', false, NULL, '2026-07-02T10:00:00Z'),
  ('Published Three', 'Third published post.', true, '2026-07-03T09:00:00Z', '2026-07-03T08:30:00Z'),
  ('Published Four', 'Fourth published post.', true, '2026-07-04T09:00:00Z', '2026-07-04T08:30:00Z'),
  ('Published Five', 'Fifth published post.', true, '2026-07-05T09:00:00Z', '2026-07-05T08:30:00Z'),
  ('Published Six', 'Sixth published post.', true, '2026-07-06T09:00:00Z', '2026-07-06T08:30:00Z'),
  ('Draft C', 'Not ready either.', false, NULL, '2026-07-06T10:00:00Z'),
  ('Published Seven', 'Seventh and newest published post.', true, '2026-07-07T09:00:00Z', '2026-07-07T08:30:00Z');
