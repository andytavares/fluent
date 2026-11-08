# Step 6 — Statement

The final ticket is a bank statement for an account. Real customers want
to see their transaction history, not only a running total. Each
deposit, withdrawal and transfer from Steps 3 and 5 already wrote a row
into `entries`. This step reads them back, one page at a time.

## The task

Add a handler for `GET /accounts/:id/entries`. It lists an account's
entries with offset-based pagination through query parameters:

```
GET /accounts/1/entries?page=1&limit=10
```

- `page` is `1` when the caller leaves it out.
- `limit` is `10` when the caller leaves it out. A request for more than
  `100` gets `100`.

**Response:** `200 OK` with:

```json
{
  "entries": [
    {
      "id": 15,
      "amount_cents": 1500,
      "kind": "deposit",
      "created_at": "..."
    },
    {
      "id": 14,
      "amount_cents": 1400,
      "kind": "deposit",
      "created_at": "..."
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

Requirements:

- Order the results by `created_at DESC`, so the most recent entry comes
  first. A statement reads from newest to oldest, like a bank app.
- `total` is the count of all entries for that account, independent of
  the current page. Use a separate `COUNT(*)` query filtered by
  `account_id`.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to a maximum of `100`, even if a caller asks for a larger
  value.
- If the account id does not exist, return `404 Not Found` with body
  `{"error": "not found"}`.
- `HttpServer` does not parse query strings.
  `exchange.getRequestURI().getQuery()` returns the raw
  `"page=1&limit=10"` string. Split it on `&`, then split each pair on
  `=`:

```java
static Map<String, String> parseQuery(
    String query) {
  Map<String, String> params =
      new HashMap<>();
  if (query == null) return params;
  for (String pair : query.split("&")) {
    String[] kv = pair.split("=", 2);
    params.put(
        kv[0], kv.length > 1 ? kv[1] : "");
  }
  return params;
}
```
