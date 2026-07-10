-- Seed a couple of rows to exercise PUT /users/:id (update existing + 404
-- on a missing id). Idempotent across repeated verify runs.
TRUNCATE users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, created_at) VALUES
  ('Ada Lovelace', 'ada@example.com', '2026-07-01T09:00:00Z'),
  ('Grace Hopper', 'grace@example.com', '2026-07-02T09:00:00Z');
