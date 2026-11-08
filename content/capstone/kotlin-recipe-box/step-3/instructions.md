# Step 3 — GET /recipes/:id

Recipes are in the database now. Add a read path. Here the "no rating
yet" case matters. A new recipe has zero rows in `ratings`, so
`AVG(stars)` over zero rows is SQL `NULL`, not zero.

That gives three states: no ratings, some ratings, or no recipe at all.
Kotlin's `Int?` and `Double?` map to them directly. A sentinel like
`0.0` would lie: an unrated recipe would look like the worst one.

## The task

Add a handler for `GET /recipes/:id`. It fetches one recipe with its
average rating.

**Sample request and response (rated):**

```
GET /recipes/1

200 OK
Content-Type: application/json

{"id":1,"name":"Pancakes",
 "ingredients":["flour","milk","eggs"],
 "minutes":20,"avg_stars":4.5}
```

**Sample request and response (unrated):**

```
GET /recipes/2

200 OK
Content-Type: application/json

{"id":2,"name":"Salad",
 "ingredients":["lettuce"],
 "minutes":null,"avg_stars":null}
```

**Sample request and response (not found):**

```
GET /recipes/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Compute the average with a `LEFT JOIN` from `recipes` to `ratings`,
  not an `INNER JOIN`.
- An inner join drops unrated recipes from the result without an error.
  You get no row instead of a row with a null average.
- Read the average with `rs.getObject("avg_stars")`, not
  `rs.getDouble(...)`.
- `getDouble` on a SQL `NULL` returns `0.0` without an error. This step
  exists to avoid exactly that wrong sentinel.
- `getObject` returns Kotlin `null` for a SQL `NULL`. Hold it as a
  `BigDecimal?`.
- Render an absent average as the bare JSON token `null`, with no
  quotes. Render a present average as its number.
- If the id exists, return `200` with the recipe object, including
  `avg_stars`. This applies whether the recipe has ratings or not.
- If no recipe has that id, return `404` with body
  `{"error": "not found"}`.
- Parse the path parameter as an integer. If it is not numeric, return
  `400 Bad Request`.
- Use the array-reading pattern from Step 2 to render `ingredients`.

The query:

```sql
SELECT r.id, r.name, r.ingredients,
       r.minutes,
       ROUND(AVG(rt.stars)::numeric, 1)
         AS avg_stars
FROM recipes r
LEFT JOIN ratings rt
  ON rt.recipe_id = r.id
WHERE r.id = ?
GROUP BY r.id
```

`ROUND(..., 1)` rounds to one decimal place in the database. You do not
need to format floating-point averages by hand in Kotlin.
