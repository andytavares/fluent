-- Seed a couple of rows to exercise DELETE /expenses/:id (delete existing +
-- 404 on a missing id). Idempotent across repeated verify runs.
TRUNCATE expenses RESTART IDENTITY CASCADE;

INSERT INTO expenses (category, amount_cents, note, spent_on, created_at) VALUES
  ('food', 1250, 'Lunch with team', '2026-06-15', '2026-06-15T12:30:00Z'),
  ('transport', 500, 'Bus fare', '2026-06-16', '2026-06-16T08:00:00Z');
