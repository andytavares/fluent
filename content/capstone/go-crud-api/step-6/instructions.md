# Step 6 — GET /users (paginated)

The final ticket adds a collection endpoint that lists users. Real clients
seldom want every row at once. The fixtures for this step seed enough rows
to fill two pages.

## The task

Add a handler for `GET /users`. It lists users with offset-based
pagination. The query parameters `page` and `limit` select the page:

```
GET /users?page=1&limit=10
```

- If `page` is missing, it defaults to `1`.
- If `limit` is missing, it defaults to `10`.
- If a caller asks for a `limit` above `100`, use `100`.

**Response:** `200 OK` with this shape:

```json
{
  "users": [
    {
      "id": 15,
      "name": "...",
      "email": "...",
      "created_at": "..."
    },
    {
      "id": 14,
      "name": "...",
      "email": "...",
      "created_at": "..."
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

Requirements:

- Order the results by `created_at DESC`, so the newest users come first.
- `total` is the count of all users in the table, for every page. Get it
  with a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to a maximum of `100`, also when a caller asks for more.
- The fixtures seed 15 users. With the default `limit=10`, page 1 returns
  10 users and page 2 returns the other 5.
