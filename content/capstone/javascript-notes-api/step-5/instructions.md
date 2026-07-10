# Step 5 — GET /notes?tag=

Now that notes carry a `tags` array, add a way to filter by one. This is
where the Postgres array type pays for itself: membership testing is a
single operator, not a join against a separate tags table.

## The task

Add a handler for `GET /notes` that, when a `tag` query param is present,
returns only notes whose `tags` array contains that value:

```
GET /notes?tag=work
```

**Response:** `200 OK` with an array of matching notes, newest first:

```json
{
  "notes": [
    { "id": 3, "title": "Note C", "body": "...", "tags": ["work"], "created_at": "...", "updated_at": "..." },
    { "id": 1, "title": "Note A", "body": "...", "tags": ["work", "urgent"], "created_at": "...", "updated_at": "..." }
  ]
}
```

Requirements:

- Use Postgres's array containment to test membership — don't fetch every
  row and filter in JS:

  ```javascript
  const result = await client.query(
    "SELECT id, title, body, tags, created_at, updated_at FROM notes " +
      "WHERE $1 = ANY(tags) ORDER BY created_at DESC",
    [tag]
  );
  ```

  (`tags @> ARRAY[$1]` works equally well — either is fine.)
- Order results by `created_at` **descending** — newest note first.
- If no `tag` query param is given, this same route falls through to
  Step 6's behavior (search + pagination) — you'll wire that up next, but
  make sure adding the `tag` branch doesn't break `GET /notes` with no
  params.
- If no notes match the given tag, return `200` with `{"notes": []}` — an
  empty result set is not an error.
