-- Seed rows across three categories with deterministic totals:
--   food:          1200 + 800 + 500 = 2500 cents, count 3
--   entertainment: 1500 cents,                    count 1
--   transport:     700 + 300 = 1000 cents,         count 2
-- Expected order (total_cents DESC): food, entertainment, transport.
TRUNCATE expenses RESTART IDENTITY CASCADE;

INSERT INTO expenses (category, amount_cents, note, spent_on) VALUES
  ('food', 1200, 'Groceries', '2026-06-05'),
  ('food', 800, 'Dinner out', '2026-06-20'),
  ('food', 500, 'Snacks', '2026-06-22'),
  ('transport', 700, 'Taxi', '2026-06-10'),
  ('transport', 300, 'Bus fare', '2026-06-11'),
  ('entertainment', 1500, 'Concert tickets', '2026-06-15');
