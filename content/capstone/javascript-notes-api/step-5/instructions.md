# Step 5 — GET /notes?tag=

Notes carry a `tags` array now. Add a way to filter by one tag. Here the
Postgres array type pays for itself. A membership test is a single
operator, not a join against a separate tags table.

## The task

Add a handler for `GET /notes`. When a `tag` query parameter is present,
it returns only the notes whose `tags` array contains that value:

```
GET /notes?tag=work
```

**Response:** `200 OK` with an array of matching notes, newest first:

```json
{
  "notes": [
    {
      "id": 3,
      "title": "Note C",
      "body": "...",
      "tags": ["work"],
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": 1,
      "title": "Note A",
      "body": "...",
      "tags": ["work", "urgent"],
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

Requirements:

- Use a Postgres array operator to test membership. Do not fetch every
  row and filter in JavaScript.
- Order the results by `created_at` **descending**: newest note first.
- With no `tag` query parameter, the same route uses the Step 6 behavior
  (search and pagination). You build that next. Make sure that the `tag`
  branch does not break `GET /notes` with no parameters.
- If no notes match the tag, return `200` with `{"notes": []}`. An empty
  result is not an error.

The query:

```javascript
const result = await client.query(
  "SELECT id, title, body, tags, " +
    "created_at, updated_at FROM notes " +
    "WHERE $1 = ANY(tags) " +
    "ORDER BY created_at DESC",
  [tag]
);
```

`tags @> ARRAY[$1]` works too. Either one is correct.
