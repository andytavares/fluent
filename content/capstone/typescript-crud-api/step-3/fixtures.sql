-- Seed a couple of rows to exercise GET /users/:id (found + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated verify
-- runs; the users table itself is created by the learner's own code
-- (Step 2), so this assumes it already exists.
TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, created_at) VALUES
  ('Ada Lovelace', 'ada@example.com', '2026-07-01T09:00:00Z'),
  ('Grace Hopper', 'grace@example.com', '2026-07-02T09:00:00Z');
