-- Seed two tasks in "todo" so we can exercise a legal transition
-- (todo -> in_progress) and an illegal one (todo -> done, skipping a
-- state) independently. Idempotent across repeated verify runs.
TRUNCATE tasks RESTART IDENTITY CASCADE;

INSERT INTO tasks (title, status, assignee, created_at) VALUES
  ('Write launch checklist', 'todo', 'Priya', '2026-07-01T09:00:00Z'),
  ('Fix flaky deploy job', 'todo', 'Sam', '2026-07-02T09:00:00Z');
