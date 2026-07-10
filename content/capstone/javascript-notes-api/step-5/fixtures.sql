-- Seed notes with overlapping tags to exercise tag filtering + ordering.
-- Two notes are tagged "work" (Note A and Note C); Note C is newer than
-- Note A, so a tag=work query should return [Note C, Note A] in that
-- order. Note B (tagged "home") should never appear in that result.
TRUNCATE notes RESTART IDENTITY CASCADE;

INSERT INTO notes (title, body, tags, created_at, updated_at) VALUES
  ('Note A', 'body a', ARRAY['work', 'urgent'], NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('Note B', 'body b', ARRAY['home'], NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('Note C', 'body c', ARRAY['work'], NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');
