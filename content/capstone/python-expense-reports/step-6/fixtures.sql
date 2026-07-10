-- Seed rows across different months/years so the year+month filter is
-- actually exercised, not just an unfiltered aggregate.
--
-- June 2026 (the queried period):
--   food:      1200 + 800 = 2000 cents, count 2
--   transport: 300 cents,               count 1
--   total for June 2026: 2300 cents
-- May 2026 (different month — must be excluded):
--   food: 5000 cents
-- June 2025 (same month/day, different year — must be excluded):
--   entertainment: 9999 cents
TRUNCATE expenses RESTART IDENTITY CASCADE;

INSERT INTO expenses (category, amount_cents, note, spent_on) VALUES
  ('food', 1200, 'Groceries', '2026-06-05'),
  ('food', 800, 'Dinner out', '2026-06-20'),
  ('transport', 300, 'Taxi', '2026-06-10'),
  ('food', 5000, 'Big grocery run', '2026-05-15'),
  ('entertainment', 9999, 'Concert', '2025-06-15');
