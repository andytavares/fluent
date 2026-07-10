# Step 6 — Top rated

The final ticket: a leaderboard of the best-rated recipes. This is
Step 3's `LEFT JOIN` average turned inside out — here, an unrated recipe
must be **excluded** entirely rather than shown with a null average,
since "top rated" doesn't mean anything for a recipe nobody has rated
yet.

## The task

Add a handler for `GET /recipes/top` that lists the highest-rated
recipes:

```
GET /recipes/top?limit=3
```

- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `10` if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "recipes": [
    { "id": 1, "name": "Butter Cookies", "ingredients": ["butter", "flour"], "minutes": 25, "avg_stars": 5.0, "ratings_count": 2 },
    { "id": 2, "name": "Toast", "ingredients": ["bread", "butter"], "minutes": 5, "avg_stars": 4.0, "ratings_count": 1 }
  ]
}
```

Requirements:

- Use an `INNER JOIN` this time, not a `LEFT JOIN` — a recipe with zero
  ratings has no row to average, and an inner join correctly drops it
  from the results instead of you having to filter nulls out afterward:

  ```sql
  SELECT r.id, r.name, r.ingredients, r.minutes,
         ROUND(AVG(rt.stars)::numeric, 1) AS avg_stars,
         COUNT(rt.id) AS ratings_count
  FROM recipes r
  JOIN ratings rt ON rt.recipe_id = r.id
  GROUP BY r.id
  ORDER BY avg_stars DESC
  LIMIT ?
  ```

- Order by `avg_stars` descending — highest-rated first.
- `ratings_count` is the number of ratings that recipe has received
  (`COUNT(rt.id)` from the same grouped query, no second round trip
  needed).
- Clamp `limit` to `10` max even if a caller requests a larger value; it
  defaults to `10` if omitted.
- Recipes with zero ratings must never appear in this list, regardless of
  `limit`.
