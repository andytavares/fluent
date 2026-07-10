-- Seed four rated recipes with distinct, exact averages (5.0, 4.0, 3.0,
-- 2.0) and one unrated recipe that must never appear in the top-rated
-- list. TRUNCATE ... RESTART IDENTITY keeps this idempotent across
-- repeated verify runs; the tables themselves are created by the
-- learner's own code (Step 2), so this assumes they already exist.
TRUNCATE ratings, recipes RESTART IDENTITY CASCADE;

INSERT INTO recipes (name, ingredients, minutes) VALUES
  ('Butter Cookies', ARRAY['butter', 'flour'], 25),
  ('Toast', ARRAY['bread', 'butter'], 5),
  ('Oatmeal', ARRAY['oats', 'milk'], 10),
  ('Plain Rice', ARRAY['rice', 'water'], 20),
  ('Unrated Stew', ARRAY['beef', 'carrots'], 90);

INSERT INTO ratings (recipe_id, stars) VALUES
  (1, 5), (1, 5),
  (2, 4),
  (3, 3), (3, 3), (3, 3),
  (4, 2);
