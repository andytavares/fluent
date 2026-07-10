-- Seed one recipe with a single existing rating (3 stars) so that adding a
-- new 5-star rating produces a deterministic average of exactly 4.0.
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the tables themselves are created by the learner's own
-- code (Step 2), so this assumes they already exist.
TRUNCATE ratings, recipes RESTART IDENTITY CASCADE;

INSERT INTO recipes (name, ingredients, minutes) VALUES
  ('Pancakes', ARRAY['flour', 'milk', 'eggs'], 20);

INSERT INTO ratings (recipe_id, stars) VALUES
  (1, 3);
