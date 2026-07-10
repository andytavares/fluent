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

{"id":1,"name":"Ada Lovelace","email":"ada@example.com","created_at":"2026-07-01T09:00:00.000Z"}
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
- Parse the path segment after `/users/` as an integer (e.g. via
  `Number()` and a `Number.isInteger` check on `url.pathname.split("/")`).
  If it isn't numeric, return `400 Bad Request`.
- Reuse the same `Pool` you set up in Step 2 — `pg`'s pool manages
  connections for you; don't open a new client per request.
