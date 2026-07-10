# Step 3 — GET /users/:id

Now that users can be created, add a read path. This is the first endpoint
that reads existing rows rather than writing new ones — the fixtures loaded
for this step already contain rows to fetch.

## The task

Add a handler for `GET /users/:id` that fetches a single user by their
integer `id`.

**Sample request/response (found):**

```
GET /users/1

200 OK
Content-Type: application/json

{"id":1,"name":"Ada Lovelace","email":"ada@example.com","created_at":"2026-07-01T09:00:00Z"}
```

**Sample request/response (not found):**

```
GET /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- Return `200` with the user object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Parse the path parameter as an integer. Everything after `/users/` is
  the id — use `Integer.parse/1` (it returns `:error` on non-numeric
  input, unlike `String.to_integer/1` which raises) so you can return
  `400 Bad Request` for a non-numeric segment instead of crashing the
  connection handler.
- Reuse the same Postgrex connection `pid` you started in Step 2, and use
  `Postgrex.query!/3` with a `$1` placeholder for the id.
