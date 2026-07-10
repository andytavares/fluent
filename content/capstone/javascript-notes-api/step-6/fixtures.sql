-- Seed 7 notes matching "meeting" (in title or body) and 2 decoys that
-- don't, so q=meeting exercises both the ILIKE filter and pagination:
-- total=7, page 1 (limit 5) returns 5, page 2 returns the remaining 2.
TRUNCATE notes RESTART IDENTITY CASCADE;

INSERT INTO notes (title, body, tags, created_at, updated_at) VALUES
  ('Meeting notes 1', 'Discuss roadmap', '{}', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
  ('Meeting notes 2', 'Sprint planning meeting', '{}', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'),
  ('Team sync', 'Weekly meeting recap', '{}', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
  ('Meeting notes 4', 'Budget review', '{}', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
  ('Meeting notes 5', 'Client call', '{}', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  ('Meeting notes 6', 'Retro', '{}', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  ('Meeting notes 7', 'Onboarding meeting', '{}', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  ('Grocery list', 'Milk and eggs', '{}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('Random thought', 'Nothing important', '{}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');
