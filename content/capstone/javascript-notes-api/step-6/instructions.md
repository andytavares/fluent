# Step 6 — GET /notes?q=&page=&limit=

The final ticket adds free-text search over the collection, plus
pagination. Real clients rarely want every matching row at once. This is
the same `GET /notes` route as in Step 5. When `tag` is not present, the
route uses this search-and-paginate behavior.

## The task

Extend the `GET /notes` handler with a `q` query parameter for free-text
search, with offset-based pagination:

```
GET /notes?q=meeting&page=1&limit=5
```

- `q` matches `title` **or** `body`, case-insensitively.
- `page` is `1` when the caller leaves it out.
- `limit` is `10` when the caller leaves it out. A request for more than
  `50` gets `50`.

**Response:** `200 OK` with:

```json
{
  "notes": [
    {
      "id": 7,
      "title": "...",
      "body": "...",
      "tags": [...],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 5
}
```

Use the `URL` global to read query parameters from `req.url`:

```javascript
const url = new URL(
  req.url, "http://localhost"
);
const params = url.searchParams;
const q = params.get("q") ?? "";
const page = Number(
  params.get("page") ?? "1"
);
const limit = Math.min(
  Number(params.get("limit") ?? "10"),
  50
);
```

Requirements:

- Use `ILIKE` for the case-insensitive substring match against both
  columns.
- `total` is the count of **matching** rows, independent of the current
  page.
- For `total`, use a separate `COUNT(*)` query with the same `ILIKE`
  filter. Do not count every row of the table.
- Order the matches by `created_at` **descending**: newest first.
- Clamp `limit` to a maximum of `50`, even if a caller asks for a larger
  value.
- If `q` is missing or empty, match everything: `%%` matches all rows.
  Do not return an error.

The query:

```javascript
const result = await client.query(
  "SELECT id, title, body, tags, " +
    "created_at, updated_at FROM notes " +
    "WHERE title ILIKE $1 " +
    "OR body ILIKE $1 " +
    "ORDER BY created_at DESC " +
    "OFFSET $2 LIMIT $3",
  [`%${q}%`, (page - 1) * limit, limit]
);
```
