# Step 5 — Ingredient search

A recipe box is useful only if you can search it. This step queries the
`ingredients` array column from Step 2 directly. You need no separate
join table, because Postgres arrays support containment queries.

## The task

Add a handler for `GET /recipes`. It lists the recipes that contain a
given ingredient:

```
GET /recipes?ingredient=butter
```

**Response:** `200 OK` with:

```json
{
  "recipes": [
    {
      "id": 1,
      "name": "Butter Cookies",
      "ingredients":
        ["butter", "flour", "sugar"],
      "minutes": 25
    },
    {
      "id": 2,
      "name": "Toast",
      "ingredients": ["bread", "butter"],
      "minutes": 5
    }
  ]
}
```

Requirements:

- Match the recipes whose `ingredients` array contains the value. Use
  the Postgres array containment operator, `@>`, against a
  single-element array literal.
- Order the results by `name` ascending.
- If the query string has no `ingredient`, return `400 Bad Request`.
  This endpoint only searches. It does not list all recipes.
- Use the query-string parsing from earlier steps. Use the array-reading
  pattern from Step 2 to render the `ingredients` of each recipe.

The query:

```sql
SELECT id, name, ingredients, minutes
FROM recipes
WHERE ingredients @> ARRAY[?]::text[]
ORDER BY name
```

`= ANY(ingredients)` works too. `@>` reads as "this recipe's ingredients
contain X". It is the idiomatic choice for containment checks against a
Postgres array column.
