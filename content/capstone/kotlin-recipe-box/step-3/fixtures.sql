-- Seed a rated recipe (avg_stars exactly 4.5), an unrated recipe (avg_stars
-- null), to exercise GET /recipes/:id (rated + unrated + not found).
-- TRUNCATE ... RESTART IDENTITY keeps this idempotent across repeated
-- verify runs; the tables themselves are created by the learner's own
-- code (Step 2), so this assumes they already exist.
TRUNCATE ratings, recipes RESTART IDENTITY CASCADE;

INSERT INTO recipes (name, ingredients, minutes) VALUES
  ('Pancakes', ARRAY['flour', 'milk', 'eggs'], 20),
  ('Salad', ARRAY['lettuce'], NULL);

INSERT INTO ratings (recipe_id, stars) VALUES
  (1, 4),
  (1, 5);
