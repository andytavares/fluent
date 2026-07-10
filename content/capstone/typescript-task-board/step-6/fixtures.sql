-- Seed tasks across all three statuses (3 todo, 2 in_progress, 1 done) to
-- exercise the grouped board view. Idempotent across repeated verify runs.
TRUNCATE tasks RESTART IDENTITY CASCADE;

INSERT INTO tasks (title, status, assignee, created_at) VALUES
  ('Write launch checklist', 'todo', 'Priya', '2026-07-01T09:00:00Z'),
  ('Draft release notes', 'todo', 'Sam', '2026-07-01T09:01:00Z'),
  ('Update onboarding docs', 'todo', NULL, '2026-07-01T09:02:00Z'),
  ('Fix flaky deploy job', 'in_progress', 'Sam', '2026-07-01T09:03:00Z'),
  ('Wire up alerting', 'in_progress', 'Priya', '2026-07-01T09:04:00Z'),
  ('Rotate API keys', 'done', 'Priya', '2026-07-01T09:05:00Z');
