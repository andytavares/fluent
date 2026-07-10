-- Seed a couple of rows to exercise GET /tasks/:id (found + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the tasks table itself is created by the learner's own code
-- (Step 2), so this assumes it already exists.
TRUNCATE tasks RESTART IDENTITY CASCADE;

INSERT INTO tasks (title, status, assignee, created_at) VALUES
  ('Write launch checklist', 'todo', 'Priya', '2026-07-01T09:00:00Z'),
  ('Fix flaky deploy job', 'in_progress', 'Sam', '2026-07-02T09:00:00Z');
