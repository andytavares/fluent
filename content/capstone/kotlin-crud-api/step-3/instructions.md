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

- `HttpServer` doesn't do path-parameter routing for you — pull the id out
  of `exchange.requestURI.path` yourself, e.g. by splitting on `/` and
  parsing the last segment:

  ```kotlin
  val path = exchange.requestURI.path // "/users/1"
  val id = path.substringAfterLast('/').toIntOrNull()
  if (id == null) {
    // 400 Bad Request
  }
  ```

  `toIntOrNull()` is the idiomatic Kotlin way to parse-or-null instead of
  catching `NumberFormatException` yourself.

- Return `200` with the user object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists — check this with `ResultSet.next()`: if it returns `false`, no
  row matched.
- Parse the path parameter as an integer. If it isn't numeric, return
  `400 Bad Request`.
- Reuse the same database connection you set up in Step 2.
