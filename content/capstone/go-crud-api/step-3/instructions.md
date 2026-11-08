# Step 3 — GET /users/:id

Users exist now, so add a read path. This is the first endpoint that reads
rows instead of writing them. The fixtures for this step already contain
rows to fetch.

## The task

Add a handler for `GET /users/:id`. It fetches one user by the integer
`id`.

**Sample request and response (found):**

```
GET /users/1

200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "created_at": "2026-07-01T09:00:00Z"
}
```

**Sample request and response (not found):**

```
GET /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

Requirements:

- If the id exists, return `200` with the user object as JSON.
- If no user has that id, return `404` with the body
  `{"error": "not found"}`.
- Parse the path parameter as an integer. If it is not numeric, return
  `400 Bad Request`.
- Use the same database connection pool that you set up in Step 2.
