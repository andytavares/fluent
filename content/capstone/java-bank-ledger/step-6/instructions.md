# Step 6 — Statement

The final ticket: a bank statement for an account, since real customers
want to see their transaction history, not just a running total. Every
deposit, withdrawal, and transfer from Steps 3 and 5 already wrote a row
into `entries` — this step just reads them back, paginated.

## The task

Add a handler for `GET /accounts/:id/entries` that lists an account's
entries with offset-based pagination via query params:

```
GET /accounts/1/entries?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `100` if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "entries": [
    { "id": 15, "amount_cents": 1500, "kind": "deposit", "created_at": "..." },
    { "id": 14, "amount_cents": 1400, "kind": "deposit", "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

Requirements:

- Order results by `created_at DESC` so the most recent entry appears
  first — a statement reads newest-to-oldest, same as a bank app.
- `total` is the total count of entries for that account, independent of
  the current page — use a separate `COUNT(*)` query filtered by
  `account_id`.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `100` max even if a caller requests a larger value.
- If the account id doesn't exist, return `404 Not Found` with body
  `{"error": "not found"}`.
- `HttpServer` doesn't parse query strings for you.
  `exchange.getRequestURI().getQuery()` gives you the raw
  `"page=1&limit=10"` string — split it on `&`, then each pair on `=`:

  ```java
  static Map<String, String> parseQuery(String query) {
    Map<String, String> params = new HashMap<>();
    if (query == null) return params;
    for (String pair : query.split("&")) {
      String[] kv = pair.split("=", 2);
      params.put(kv[0], kv.length > 1 ? kv[1] : "");
    }
    return params;
  }
  ```
