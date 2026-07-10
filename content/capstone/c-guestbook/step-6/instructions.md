# Step 6 — Paginated history

The final ticket: a full paginated history of the guestbook, oldest
entries first — the chronological read of "how did this guestbook fill
up," as opposed to Step 5's "what's new" view.

## The task

Add a handler for `GET /entries` that lists entries oldest-first with
offset-based pagination via query params:

```
GET /entries?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of `50`
  if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "entries": [
    { "id": 1, "name": "...", "message": "...", "created_at": "..." },
    { "id": 2, "name": "...", "message": "...", "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Parsing the query string

The path component of your request line now includes a `?`. Find it with
`strchr`, then pull each parameter out with `strstr` and parse its number
with `sscanf` — safer than `atol` here, since `sscanf`'s return value
tells you whether a conversion actually happened, rather than silently
handing back `0` for garbage:

```c
static void parse_query(const char *path, long *page, long *limit) {
    *page = 1;
    *limit = 10;

    const char *query = strchr(path, '?');
    if (!query) return;
    query++;

    const char *p = strstr(query, "page=");
    if (p) sscanf(p + strlen("page="), "%ld", page);

    const char *l = strstr(query, "limit=");
    if (l) sscanf(l + strlen("limit="), "%ld", limit);

    if (*page < 1) *page = 1;
    if (*limit < 1) *limit = 1;
    if (*limit > 50) *limit = 50;
}
```

### Querying with a count and a page

Run two queries: one for the total row count, one for the current page,
ordered oldest-first:

```c
PGresult *count_res = PQexec(conn, "SELECT COUNT(*) FROM entries");
long total = atol(PQgetvalue(count_res, 0, 0));
PQclear(count_res);

char limit_str[16], offset_str[16];
snprintf(limit_str, sizeof(limit_str), "%ld", limit);
snprintf(offset_str, sizeof(offset_str), "%ld", (page - 1) * limit);
const char *params[2] = { limit_str, offset_str };

PGresult *res = PQexecParams(
    conn,
    "SELECT id, name, message, created_at::text FROM entries "
    "ORDER BY created_at ASC LIMIT $1 OFFSET $2",
    2, NULL, params, NULL, NULL, 0);
```

### Building the JSON array

Reuse the running-offset `snprintf` pattern from Step 5 to build the
`entries` array, then wrap it with the pagination fields:

```c
char entries_json[8192];
int offset = 0;
int n = PQntuples(res);
for (int i = 0; i < n; i++) {
    offset += snprintf(entries_json + offset, sizeof(entries_json) - offset,
        "%s{\"id\":%s,\"name\":\"%s\",\"message\":\"%s\",\"created_at\":\"%s\"}",
        i > 0 ? "," : "",
        PQgetvalue(res, i, 0), PQgetvalue(res, i, 1),
        PQgetvalue(res, i, 2), PQgetvalue(res, i, 3));
}
PQclear(res);

char body[8500];
snprintf(body, sizeof(body),
    "{\"entries\":[%s],\"total\":%ld,\"page\":%ld,\"limit\":%ld}",
    entries_json, total, page, limit);
```

Requirements:

- Order results by `created_at ASC` so the oldest entries appear first —
  the opposite order from Step 5.
- `total` is the total count of entries in the table, independent of the
  current page — use a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `50` max even if a caller requests a larger value.
- With the seeded fixtures (15 entries) and the default `limit=10`, page 1
  returns 10 entries and page 2 returns the remaining 5.
