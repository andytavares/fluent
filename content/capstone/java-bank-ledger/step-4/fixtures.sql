-- Seed a couple of accounts to exercise GET /accounts/:id (found + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated verify
-- runs; the tables themselves are created by the learner's own code
-- (Step 2), so this assumes they already exist.
TRUNCATE entries, accounts RESTART IDENTITY CASCADE;

INSERT INTO accounts (owner, balance_cents) VALUES
  ('Ada Lovelace', 5000),
  ('Grace Hopper', 2500);
