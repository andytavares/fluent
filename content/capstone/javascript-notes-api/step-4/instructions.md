# Step 4 — PUT /notes/:id

With create and read working, add the update path. Learners often make
this endpoint accept only full replacements — this ticket specifically
calls for partial updates, since that's what real API clients expect, and
it needs to track when a note last changed.

## The task

Add a handler for `PUT /notes/:id` that updates an existing note's
`title`, `body`, and/or `tags`.

The request body is **partial** — only the fields that should change are
sent:

```
PUT /notes/1
{ "tags": ["home", "shopping", "urgent"] }
```

**Response:** `200 OK` with the full updated record (not just the changed
fields), and `updated_at` bumped to the current time:

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

If the id doesn't exist, return `404 Not Found` with body
`{"error": "not found"}`.

Requirements:

- Accept a body containing `title`, `body`, `tags`, or any combination —
  build the `UPDATE` statement dynamically based on which keys are
  present in the parsed JSON object (e.g. `"tags" in parsed`).
- Always set `updated_at = NOW()` as part of the same `UPDATE`, regardless
  of which fields changed. `created_at` never changes.
- Always return the complete, current row on success, not just the fields
  that were sent.
- Return `404` if no note with the given id exists.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
