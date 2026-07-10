# Step 4 — Rate a recipe

Add the write path that makes Step 3's average mean something: submitting
a star rating for a recipe.

## The task

Add a handler for `POST /recipes/:id/ratings`:

**Request body:**

```json
{ "stars": 5 }
```

**Response:** `201 Created` with the new rating and the recipe's updated
average:

```json
{ "recipe_id": 1, "stars": 5, "avg_stars": 4.0 }
```

Requirements:

- `stars` must be an integer between `1` and `5` inclusive. If it's
  missing or out of range, return `400 Bad Request`. The `ratings` table
  already has `CHECK (stars BETWEEN 1 AND 5)` from Step 2 as a backstop,
  but check it in your handler too so a bad request gets a clean `400`
  instead of a raw constraint-violation error from the driver.
- If the recipe id doesn't exist, return `404 Not Found` with body
  `{"error": "not found"}`. Check this before inserting — a
  `ratings.recipe_id` foreign-key violation would otherwise produce a
  different, uglier failure than the clean `404` callers expect.
- After inserting the rating, recompute the recipe's average with the
  same `ROUND(AVG(stars)::numeric, 1)` query from Step 3 and return it in
  the response body as `avg_stars` — this always reflects **all** ratings
  for the recipe, not just the one just submitted.
- Reuse the `extractIntField` helper from Step 2 to parse `stars` from the
  request body.
