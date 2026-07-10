-- Seed three distinct sensors with different reading counts, ordered
-- alphabetically by name (temp-1, temp-2, temp-3), to exercise pagination:
-- limit=2 should produce a full page 1 (temp-1, temp-2) and a partial
-- page 2 (temp-3). Idempotent across repeated verify runs.
TRUNCATE readings RESTART IDENTITY CASCADE;

INSERT INTO readings (sensor, value_milli, taken_at) VALUES
  ('temp-1', 20000, '2026-07-01T09:00:00Z'),
  ('temp-1', 20500, '2026-07-01T10:00:00Z'),
  ('temp-1', 21000, '2026-07-01T11:00:00Z'),
  ('temp-1', 21500, '2026-07-01T12:00:00Z'),
  ('temp-1', 22000, '2026-07-01T13:00:00Z'),
  ('temp-2', 18000, '2026-07-01T09:10:00Z'),
  ('temp-2', 18200, '2026-07-01T09:20:00Z'),
  ('temp-2', 18500, '2026-07-01T09:30:00Z'),
  ('temp-3', 30000, '2026-07-01T09:00:00Z'),
  ('temp-3', 30500, '2026-07-01T09:15:00Z');
