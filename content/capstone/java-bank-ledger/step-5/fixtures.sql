-- Seed two accounts to exercise a successful transfer, a failed
-- (insufficient-funds) transfer, and an unknown-account transfer.
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the tables themselves are created by the learner's own
-- code (Step 2), so this assumes they already exist.
TRUNCATE entries, accounts RESTART IDENTITY CASCADE;

INSERT INTO accounts (owner, balance_cents) VALUES
  ('Alice', 1000),
  ('Bob', 500);
