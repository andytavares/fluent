# Step 4 — Rate a recipe

Add the write path that gives the Step 3 average its meaning: a star
rating for a recipe.

## The task

Add a handler for `POST /recipes/:id/ratings`:

**Request body:**

```json
{ "stars": 5 }
```

**Response:** `201 Created` with the new rating and the recipe's updated
average:

```json
{
  "recipe_id": 1,
  "stars": 5,
  "avg_stars": 4.0
}
```

Requirements:

- `stars` must be an integer from `1` to `5` inclusive. If it is
  missing or out of range, return `400 Bad Request`.
- The `ratings` table from Step 2 has `CHECK (stars BETWEEN 1 AND 5)` as
  a backstop. Check the range in your handler too.
- Without the handler check, a bad request gets a raw
  constraint-violation error from the driver, not a clean `400`.
- If the recipe id does not exist, return `404 Not Found` with body
  `{"error": "not found"}`.
- Check the recipe before you insert. Otherwise a `ratings.recipe_id`
  foreign-key violation gives a different, worse failure than `404`.
- After the insert, compute the average again with the
  `ROUND(AVG(stars)::numeric, 1)` query from Step 3.
- Return it in the response body as `avg_stars`. It always includes
  **all** ratings for the recipe, not only the new one.
- Use the `extractIntField` helper from Step 2 to parse `stars` from the
  request body.
