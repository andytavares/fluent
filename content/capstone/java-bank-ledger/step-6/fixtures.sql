-- Seed one account with 15 entries (distinct amount_cents and increasing
-- created_at) to exercise pagination across two pages and newest-first
-- ordering. TRUNCATE ... RESTART IDENTITY keeps this idempotent across
-- repeated verify runs; the tables themselves are created by the
-- learner's own code (Step 2), so this assumes they already exist.
TRUNCATE entries, accounts RESTART IDENTITY CASCADE;

INSERT INTO accounts (owner, balance_cents) VALUES ('Statement Test', 999999);

INSERT INTO entries (account_id, amount_cents, kind, created_at) VALUES
  (1, 100, 'deposit', '2026-07-01T09:00:00Z'),
  (1, 200, 'deposit', '2026-07-01T09:01:00Z'),
  (1, 300, 'deposit', '2026-07-01T09:02:00Z'),
  (1, 400, 'deposit', '2026-07-01T09:03:00Z'),
  (1, 500, 'deposit', '2026-07-01T09:04:00Z'),
  (1, 600, 'deposit', '2026-07-01T09:05:00Z'),
  (1, 700, 'deposit', '2026-07-01T09:06:00Z'),
  (1, 800, 'deposit', '2026-07-01T09:07:00Z'),
  (1, 900, 'deposit', '2026-07-01T09:08:00Z'),
  (1, 1000, 'deposit', '2026-07-01T09:09:00Z'),
  (1, 1100, 'deposit', '2026-07-01T09:10:00Z'),
  (1, 1200, 'deposit', '2026-07-01T09:11:00Z'),
  (1, 1300, 'deposit', '2026-07-01T09:12:00Z'),
  (1, 1400, 'deposit', '2026-07-01T09:13:00Z'),
  (1, 1500, 'deposit', '2026-07-01T09:14:00Z');
