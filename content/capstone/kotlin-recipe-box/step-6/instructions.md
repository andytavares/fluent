# Step 6 — Top rated

The final ticket is a leaderboard of the best-rated recipes. It turns
the Step 3 `LEFT JOIN` average inside out. Here the list **excludes** an
unrated recipe completely, not with a null average. "Top rated" has no
meaning for a recipe that nobody rated yet.

## The task

Add a handler for `GET /recipes/top`. It lists the highest-rated
recipes:

```
GET /recipes/top?limit=3
```

- `limit` is `10` when the caller leaves it out. A request for more than
  `10` gets `10`.

**Response:** `200 OK` with:

```json
{
  "recipes": [
    {
      "id": 1,
      "name": "Butter Cookies",
      "ingredients": ["butter", "flour"],
      "minutes": 25,
      "avg_stars": 5.0,
      "ratings_count": 2
    },
    {
      "id": 2,
      "name": "Toast",
      "ingredients": ["bread", "butter"],
      "minutes": 5,
      "avg_stars": 4.0,
      "ratings_count": 1
    }
  ]
}
```

Requirements:

- Use an `INNER JOIN` this time, not a `LEFT JOIN`. A recipe with zero
  ratings has no row to average. The inner join drops it, so you do not
  filter out nulls afterward.
- Order by `avg_stars` descending: highest-rated first.
- `ratings_count` is the number of ratings the recipe has. Use
  `COUNT(rt.id)` in the same grouped query. You need no second round
  trip.
- Clamp `limit` to a maximum of `10`, even if a caller asks for a larger
  value. It is `10` when the caller leaves it out.
- Recipes with zero ratings must never appear in this list, whatever the
  `limit`.

The query:

```sql
SELECT r.id, r.name, r.ingredients,
       r.minutes,
       ROUND(AVG(rt.stars)::numeric, 1)
         AS avg_stars,
       COUNT(rt.id) AS ratings_count
FROM recipes r
JOIN ratings rt ON rt.recipe_id = r.id
GROUP BY r.id
ORDER BY avg_stars DESC
LIMIT ?
```
