# Step 4 — PUT /notes/:id

Create and read work. Add the update path. Learners often make this
endpoint accept only full replacements. This ticket asks for partial
updates, because real API clients expect them. The endpoint also records
when a note last changed.

## The task

Add a handler for `PUT /notes/:id`. It updates the `title`, `body` or
`tags` of an existing note, or any combination of them.

The request body is **partial**. It contains only the fields to change:

```
PUT /notes/1
{ "tags": ["home", "shopping", "urgent"] }
```

**Response:** `200 OK` with the full updated record, not only the
changed fields. `updated_at` moves to the current time:

```json
{
  "id": 1,
  "title": "Grocery list",
  "body": "Milk, eggs, bread",
  "tags": ["home", "shopping", "urgent"],
  "created_at": "2026-06-01T09:00:00.000Z",
  "updated_at": "2026-07-10T14:22:00.000Z"
}
```

If the id does not exist, return `404 Not Found` with body
`{"error": "not found"}`.

Requirements:

- Accept a body with `title`, `body`, `tags` or any combination of them.
- Build the `UPDATE` statement from the keys present in the parsed JSON
  object, for example `"tags" in parsed`.
- Always set `updated_at = NOW()` in the same `UPDATE`, whichever fields
  change. `created_at` never changes.
- On success, always return the complete current row, not only the
  fields in the request.
- Return `404` if no note has the given id.
- Parse the path segment as an integer. If it is not numeric, return
  `400 Bad Request`.
