-- Seed a couple of rows to exercise GET /notes/:id (found + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the notes table itself is created by the learner's own code
-- (Step 2), so this assumes it already exists.
TRUNCATE notes RESTART IDENTITY CASCADE;

INSERT INTO notes (title, body, tags, created_at, updated_at) VALUES
  ('Grocery list', 'Milk, eggs, bread', ARRAY['home', 'shopping'], '2026-06-01T09:00:00Z', '2026-06-01T09:00:00Z'),
  ('Standup notes', 'Discuss sprint planning', ARRAY['work'], '2026-06-02T09:00:00Z', '2026-06-02T09:00:00Z');
