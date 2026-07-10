# Step 4 — PUT /users/:id

With create and read working, add the update path. Learners often make
this endpoint accept only full replacements — this ticket specifically
calls for partial updates, since that's what real API clients expect.

## The task

Add a handler for `PUT /users/:id` that updates an existing user's `name`
and/or `email`.

The request body is **partial** — only the fields that should change are
sent:

```
PUT /users/1
{ "email": "ada.lovelace@example.com" }
```

**Response:** `200 OK` with the full updated record (not just the changed
fields):

```json
{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada.lovelace@example.com",
  "created_at": "2026-07-01T09:00:00Z"
}
```

If the id doesn't exist, return `404 Not Found` with body
`{"error": "not found"}`.

Requirements:

- Accept a body containing `name`, `email`, or both. Reuse the
  `extract_field/2` helper from Step 2 — if a key isn't present in the
  parsed body, don't include it in the `UPDATE`. Building up the `SET`
  clause and parameter list together, one optional field at a time, works
  well:

  ```elixir
  {sets, params} =
    [{"name", name}, {"email", email}]
    |> Enum.filter(fn {_field, value} -> value != nil end)
    |> Enum.with_index(1)
    |> Enum.map(fn {{field, value}, idx} -> {"#{field} = $#{idx}", value} end)
    |> Enum.unzip()
  ```

- Always return the complete, current row on success, not just the fields
  that were sent — append `RETURNING *` to the `UPDATE` to get this in one
  round trip.
- Return `404` if no user with the given id exists (check
  `result.num_rows == 0` on the `Postgrex.Result`).
- Parse the path parameter as an integer with `Integer.parse/1`. If it
  isn't numeric, return `400 Bad Request`.
