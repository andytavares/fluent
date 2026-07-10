-- Seed 12 unexpired "user:" keys (zero-padded so lexicographic order matches
-- numeric order), one already-expired "user:" key that must be excluded from
-- both the listing and the total count, and two keys under other prefixes
-- that must never match a "user:" prefix query. Idempotent across repeated
-- verify runs.
TRUNCATE kv_entries RESTART IDENTITY CASCADE;

INSERT INTO kv_entries (key, value, expires_at, updated_at) VALUES
  ('user:01', 'val01', NULL, NOW()),
  ('user:02', 'val02', NULL, NOW()),
  ('user:03', 'val03', NULL, NOW()),
  ('user:04', 'val04', NULL, NOW()),
  ('user:05', 'val05', NULL, NOW()),
  ('user:06', 'val06', NULL, NOW()),
  ('user:07', 'val07', NULL, NOW()),
  ('user:08', 'val08', NULL, NOW()),
  ('user:09', 'val09', NULL, NOW()),
  ('user:10', 'val10', NULL, NOW()),
  ('user:11', 'val11', NULL, NOW()),
  ('user:12', 'val12', NULL, NOW()),
  ('user:99', 'stale', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours'),
  ('session:01', 'sess', NULL, NOW()),
  ('cache:01', 'cached', NULL, NOW());
