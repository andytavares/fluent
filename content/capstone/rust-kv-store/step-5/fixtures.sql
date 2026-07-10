-- Seed three keys to exercise every branch of GET /kv/:key/ttl: one already
-- expired, one with no expiry at all, and one with a far-future expiry so
-- the remaining-seconds calculation is deterministically positive. Timestamps
-- are computed relative to NOW() at fixture-load time, so this is idempotent
-- across repeated verify runs.
TRUNCATE kv_entries RESTART IDENTITY CASCADE;

INSERT INTO kv_entries (key, value, expires_at, updated_at) VALUES
  ('expired:key', 'old', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours'),
  ('forever:key', 'permanent', NULL, NOW()),
  ('future:key', 'ticking', NOW() + INTERVAL '3650 days', NOW());
