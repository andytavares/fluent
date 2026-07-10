-- Seed one finished task (deletable) and one unfinished task (not
-- deletable) to exercise both branches, plus the standard 404 case.
-- Idempotent across repeated verify runs.
TRUNCATE tasks RESTART IDENTITY CASCADE;

INSERT INTO tasks (title, status, assignee, created_at) VALUES
  ('Write launch checklist', 'done', 'Priya', '2026-07-01T09:00:00Z'),
  ('Fix flaky deploy job', 'in_progress', 'Sam', '2026-07-02T09:00:00Z');
