# Step 6 — GET /notes?q=&page=&limit=

The final ticket: free-text search over the collection, plus pagination
since real clients rarely want every matching row at once. This is the
same `GET /notes` route as Step 5 — when `tag` isn't present, fall
through to this search-and-paginate behavior instead.

## The task

Extend the `GET /notes` handler to support a `q` query param (free-text
search) with offset-based pagination:

```
GET /notes?q=meeting&page=1&limit=5
```

- `q` matches case-insensitively against `title` **or** `body`.
- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of `50`
  if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "notes": [
    { "id": 7, "title": "...", "body": "...", "tags": [...], "created_at": "...", "updated_at": "..." }
  ],
  "total": 7,
  "page": 1,
  "limit": 5
}
```

Use the `URL` global to read query params from `req.url`:

```javascript
const url = new URL(req.url, "http://localhost");
const q = url.searchParams.get("q") ?? "";
const page = Number(url.searchParams.get("page") ?? "1");
const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), 50);
```

Requirements:

- Use `ILIKE` for the case-insensitive substring match, against both
  columns:

  ```javascript
  const result = await client.query(
    "SELECT id, title, body, tags, created_at, updated_at FROM notes " +
      "WHERE title ILIKE $1 OR body ILIKE $1 " +
      "ORDER BY created_at DESC OFFSET $2 LIMIT $3",
    [`%${q}%`, (page - 1) * limit, limit]
  );
  ```

- `total` is the total count of **matching** rows (same `WHERE` clause),
  independent of the current page — use a separate `COUNT(*)` query with
  the same `ILIKE` filter, not the total row count of the whole table.
- Order matches by `created_at` **descending** — newest first.
- Clamp `limit` to `50` max even if a caller requests a larger value.
- If `q` is omitted or empty, treat it as matching everything (i.e.
  `%%` matches all rows) rather than returning an error.
