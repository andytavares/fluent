-- Seed a couple of rows to exercise GET /entries/:id (found + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the entries table itself is created by the learner's own
-- code (Step 2), so this assumes it already exists.
TRUNCATE entries RESTART IDENTITY CASCADE;

INSERT INTO entries (name, message, created_at) VALUES
  ('Ada Lovelace', 'First!', '2026-07-01T09:00:00Z'),
  ('Grace Hopper', 'Nice guestbook.', '2026-07-02T09:00:00Z');
