-- Seed one account with a known starting balance to exercise deposits,
-- withdrawals, and the insufficient-funds path. TRUNCATE ... RESTART
-- IDENTITY keeps this idempotent across repeated verify runs; the tables
-- themselves are created by the learner's own code (Step 2), so this
-- assumes they already exist.
TRUNCATE entries, accounts RESTART IDENTITY CASCADE;

INSERT INTO accounts (owner, balance_cents) VALUES
  ('Test User', 1000);
