# Step 6 — GET /users (paginated)

The final ticket: a collection endpoint for listing users, since real
clients rarely want every row at once. The fixtures for this step seed
enough rows to actually exercise pagination across two pages.

## The task

Add a handler for `GET /users` that lists users with offset-based
pagination via query params:

```
GET /users?page=1&limit=10
```

- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `100` if a caller requests more.

**Response:** `200 OK` with:

```json
{
  "users": [
    { "id": 15, "name": "...", "email": "...", "created_at": "..." },
    { "id": 14, "name": "...", "email": "...", "created_at": "..." }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Parsing the query string

The path component of your request line now includes a `?` — split on it
with `strchr`, then scan the query string for `page=` and `limit=` with
`strstr` and `atoi`:

```c
static void parse_query(const char *path, long *page, long *limit) {
    *page = 1;
    *limit = 10;

    const char *query = strchr(path, '?');
    if (!query) return;
    query++;

    const char *p = strstr(query, "page=");
    if (p) *page = atol(p + strlen("page="));

    const char *l = strstr(query, "limit=");
    if (l) *limit = atol(l + strlen("limit="));

    if (*page < 1) *page = 1;
    if (*limit < 1) *limit = 1;
    if (*limit > 100) *limit = 100;
}
```

### Querying with a count and a page

Run two queries: one for the total row count, one for the current page,
ordered newest-first:

```c
PGresult *count_res = PQexec(conn, "SELECT COUNT(*) FROM users");
long total = atol(PQgetvalue(count_res, 0, 0));
PQclear(count_res);

char limit_str[16], offset_str[16];
snprintf(limit_str, sizeof(limit_str), "%ld", limit);
snprintf(offset_str, sizeof(offset_str), "%ld", (page - 1) * limit);
const char *params[2] = { limit_str, offset_str };

PGresult *res = PQexecParams(
    conn,
    "SELECT id, name, email, created_at::text FROM users "
    "ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    2, NULL, params, NULL, NULL, 0);
```

### Building the JSON array

Walk `PQntuples(res)` rows, format each into a small buffer, and
concatenate them into the `users` array with commas between entries. A
single large output buffer built with repeated `snprintf`/`strcat` is
enough given this capstone's fixed field set:

```c
char users_json[8192] = "";
int n = PQntuples(res);
for (int i = 0; i < n; i++) {
    char row_json[512];
    snprintf(row_json, sizeof(row_json),
        "%s{\"id\":%s,\"name\":\"%s\",\"email\":\"%s\",\"created_at\":\"%s\"}",
        i > 0 ? "," : "",
        PQgetvalue(res, i, 0), PQgetvalue(res, i, 1),
        PQgetvalue(res, i, 2), PQgetvalue(res, i, 3));
    strcat(users_json, row_json);
}
PQclear(res);

char body[8500];
snprintf(body, sizeof(body),
    "{\"users\":[%s],\"total\":%ld,\"page\":%ld,\"limit\":%ld}",
    users_json, total, page, limit);
```

Requirements:

- Order results by `created_at DESC` so the newest users appear first.
- `total` is the total count of users in the table, independent of the
  current page — use a separate `COUNT(*)` query.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `100` max even if a caller requests a larger value.
- With the seeded fixtures (15 users) and the default `limit=10`, page 1
  returns 10 users and page 2 returns the remaining 5.
