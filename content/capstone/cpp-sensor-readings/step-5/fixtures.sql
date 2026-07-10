-- Seed a sensor with three readings to exercise a full purge, plus an
-- unrelated sensor that must survive untouched. temp-99 is left with no
-- rows to exercise the 404 path. Idempotent across repeated verify runs.
TRUNCATE readings RESTART IDENTITY CASCADE;

INSERT INTO readings (sensor, value_milli, taken_at) VALUES
  ('temp-1', 20000, '2026-07-01T09:00:00Z'),
  ('temp-1', 21000, '2026-07-01T10:00:00Z'),
  ('temp-1', 22000, '2026-07-01T11:00:00Z'),
  ('temp-2', 18500, '2026-07-01T09:30:00Z');
