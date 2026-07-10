-- Seed a sensor with multiple readings at different times to exercise
-- "latest" ordering, plus an unrelated sensor. temp-99 is left with no rows
-- to exercise the 404 path. Idempotent across repeated verify runs; the
-- readings table itself is created by the learner's own code (Step 2), so
-- this assumes it already exists.
TRUNCATE readings RESTART IDENTITY CASCADE;

INSERT INTO readings (sensor, value_milli, taken_at) VALUES
  ('temp-1', 21000, '2026-07-01T09:00:00Z'),
  ('temp-1', 22000, '2026-07-01T10:00:00Z'),
  ('temp-2', 18500, '2026-07-01T09:30:00Z');
