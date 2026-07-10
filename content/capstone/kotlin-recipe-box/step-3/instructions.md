# Step 3 — GET /recipes/:id

With recipes persisted, add a read path — and this is where the "no
rating yet" case matters. A brand-new recipe has zero rows in `ratings`,
so `AVG(stars)` over zero rows is SQL `NULL`, not zero. That's a genuine
three-state value (no ratings / some ratings / recipe doesn't exist at
all), and Kotlin's `Int?`/`Double?` map onto it directly instead of you
inventing a sentinel like `0.0` that would lie about an unrated recipe
looking like the worst possible one.

## The task

Add a handler for `GET /recipes/:id` that fetches a single recipe along
with its average rating.

**Sample request/response (rated):**

```
GET /recipes/1

200 OK
Content-Type: application/json

{"id":1,"name":"Pancakes","ingredients":["flour","milk","eggs"],"minutes":20,"avg_stars":4.5}
```

**Sample request/response (unrated):**

```
GET /recipes/2

200 OK
Content-Type: application/json

{"id":2,"name":"Salad","ingredients":["lettuce"],"minutes":null,"avg_stars":null}
```

**Sample request/response (not found):**

```
GET /recipes/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Compute the average with a `LEFT JOIN` from `recipes` to `ratings`, not
  an `INNER JOIN` — an inner join would silently drop unrated recipes
  from the result entirely instead of returning them with a null average:

  ```sql
  SELECT r.id, r.name, r.ingredients, r.minutes,
         ROUND(AVG(rt.stars)::numeric, 1) AS avg_stars
  FROM recipes r
  LEFT JOIN ratings rt ON rt.recipe_id = r.id
  WHERE r.id = ?
  GROUP BY r.id
  ```

  `ROUND(..., 1)` does the one-decimal rounding in the database, so you
  don't need to format floating point averages by hand in Kotlin.

- Read the average with `rs.getObject("avg_stars")` rather than
  `rs.getDouble(...)` — `getDouble` on a SQL `NULL` silently returns
  `0.0`, which is exactly the wrong-answer sentinel this step exists to
  avoid. `getObject` returns Kotlin `null` for a SQL `NULL`, which you can
  hold as a `BigDecimal?` and render as the bare JSON token `null` (no
  quotes) when absent, or its numeric value when present.
- Return `200` with the recipe object (including `avg_stars`) if the id
  exists, whether or not it has ratings.
- Return `404` with body `{"error": "not found"}` if no recipe with that
  id exists.
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
- Reuse the `extractStringArray`/array-reading pattern from Step 2 to
  render `ingredients`.
