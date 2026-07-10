# Step 5 — Ingredient search

A recipe box is only useful if you can search it. This step queries
directly against the `ingredients` array column from Step 2 — no separate
join table, since Postgres arrays support containment queries natively.

## The task

Add a handler for `GET /recipes` that lists recipes containing a given
ingredient:

```
GET /recipes?ingredient=butter
```

**Response:** `200 OK` with:

```json
{
  "recipes": [
    { "id": 1, "name": "Butter Cookies", "ingredients": ["butter", "flour", "sugar"], "minutes": 25 },
    { "id": 2, "name": "Toast", "ingredients": ["bread", "butter"], "minutes": 5 }
  ]
}
```

Requirements:

- Match recipes whose `ingredients` array contains the given value using
  Postgres's array containment operator, `@>`, against a single-element
  array literal:

  ```sql
  SELECT id, name, ingredients, minutes
  FROM recipes
  WHERE ingredients @> ARRAY[?]::text[]
  ORDER BY name
  ```

  (`= ANY(ingredients)` works too — `@>` reads more naturally as "this
  recipe's ingredients contain X" and is the idiomatic choice for
  containment checks against a Postgres array column.)
- Order results by `name` ascending.
- If `ingredient` is missing from the query string, return
  `400 Bad Request` — this endpoint is search-only, not a full listing.
- Reuse the query-string parsing from earlier steps and the array-reading
  pattern from Step 2 to render each recipe's `ingredients`.
