-- Seed three recipes: two containing "butter" (in name order: "Butter
-- Cookies" then "Toast") and one that doesn't ("Salad"), to exercise
-- ingredient search and its ordering. TRUNCATE ... RESTART IDENTITY keeps
-- this idempotent across repeated verify runs; the tables themselves are
-- created by the learner's own code (Step 2), so this assumes they
-- already exist.
TRUNCATE ratings, recipes RESTART IDENTITY CASCADE;

INSERT INTO recipes (name, ingredients, minutes) VALUES
  ('Toast', ARRAY['bread', 'butter'], 5),
  ('Butter Cookies', ARRAY['butter', 'flour', 'sugar'], 25),
  ('Salad', ARRAY['lettuce', 'tomato'], 10);
