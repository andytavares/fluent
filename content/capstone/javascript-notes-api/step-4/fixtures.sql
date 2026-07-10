-- Seed a couple of rows to exercise PUT /notes/:id (partial update on an
-- existing note + 404 on a missing id). Idempotent across repeated verify
-- runs.
TRUNCATE notes RESTART IDENTITY CASCADE;

INSERT INTO notes (title, body, tags, created_at, updated_at) VALUES
  ('Grocery list', 'Milk, eggs, bread', ARRAY['home', 'shopping'], '2026-06-01T09:00:00Z', '2026-06-01T09:00:00Z'),
  ('Standup notes', 'Discuss sprint planning', ARRAY['work'], '2026-06-02T09:00:00Z', '2026-06-02T09:00:00Z');
