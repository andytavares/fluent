# Step 6 — Paginated history

This is the final step: a full paginated history of the guestbook, oldest
entries first. It shows how the guestbook filled up over time. Step 5
shows only what is new.

## The task

Add a handler for `GET /entries`. It lists entries oldest first, with
offset-based pagination through query parameters:

```
GET /entries?page=1&limit=10
```

- If the query has no `page`, use `1`.
- If the query has no `limit`, use `10`. If a caller asks for more than `50`,
  use `50`.

**Response:** `200 OK` with:

```json
{
  "entries": [
    { "id": 1, "name": "...",
      "message": "...",
      "created_at": "..." },
    { "id": 2, "name": "...",
      "message": "...",
      "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Parsing the query string

The path in your request line now contains a `?`. Find it with `strchr`.
Then find each parameter with `strstr`, and parse its number with
`sscanf`. `sscanf` is safer than `atol` here. Its return value tells you
if a conversion happened, and `atol` returns `0` for bad input with no
error:

```c
static void parse_query(const char *path,
                        long *page,
                        long *limit) {
    *page = 1;
    *limit = 10;

    const char *query = strchr(path, '?');
    if (!query) return;
    query++;

    const char *p = strstr(query, "page=");
    if (p) sscanf(p + strlen("page="),
                  "%ld", page);

    const char *l =
        strstr(query, "limit=");
    if (l) sscanf(l + strlen("limit="),
                  "%ld", limit);

    if (*page < 1) *page = 1;
    if (*limit < 1) *limit = 1;
    if (*limit > 50) *limit = 50;
}
```

### Querying with a count and a page

Run two queries. The first gets the total row count. The second gets the
current page, oldest first:

```c
PGresult *count_res = PQexec(conn,
    "SELECT COUNT(*) FROM entries");
long total =
    atol(PQgetvalue(count_res, 0, 0));
PQclear(count_res);

char limit_str[16], offset_str[16];
snprintf(limit_str, sizeof(limit_str),
         "%ld", limit);
snprintf(offset_str, sizeof(offset_str),
         "%ld", (page - 1) * limit);
const char *params[2] =
    { limit_str, offset_str };

PGresult *res = PQexecParams(
    conn,
    "SELECT id, name, message, "
    "created_at::text FROM entries "
    "ORDER BY created_at ASC "
    "LIMIT $1 OFFSET $2",
    2, NULL, params, NULL, NULL, 0);
```

### Building the JSON array

Use the running-offset `snprintf` pattern from Step 5 to build the
`entries` array. Then wrap it with the pagination fields:

```c
char entries_json[8192];
int offset = 0;
int n = PQntuples(res);
for (int i = 0; i < n; i++) {
    offset += snprintf(
        entries_json + offset,
        sizeof(entries_json) - offset,
        "%s{\"id\":%s,"
        "\"name\":\"%s\","
        "\"message\":\"%s\","
        "\"created_at\":\"%s\"}",
        i > 0 ? "," : "",
        PQgetvalue(res, i, 0),
        PQgetvalue(res, i, 1),
        PQgetvalue(res, i, 2),
        PQgetvalue(res, i, 3));
}
PQclear(res);

char body[8500];
snprintf(body, sizeof(body),
    "{\"entries\":[%s],"
    "\"total\":%ld,"
    "\"page\":%ld,"
    "\"limit\":%ld}",
    entries_json, total, page, limit);
```

Requirements:

- Order the results by `created_at ASC`, so the oldest entries come
  first. Step 5 uses the opposite order.
- `total` is the count of all entries in the table, for every page. Get
  it with a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination.
- If a caller asks for a `limit` above `50`, use `50`.
- The fixtures seed 15 entries. With the default `limit=10`, page 1
  returns 10 entries and page 2 returns the other 5.
