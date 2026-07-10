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

{"id":1,"name":"Ada Lovelace","email":"ada@example.com","created_at":"2026-07-01 09:00:00+00"}
```

**Sample request/response (not found):**

```
GET /users/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

You're matching paths by hand off the request line's path component
(`/users/1`). Strip the `/users/` prefix and validate the remainder is
numeric before converting it:

```c
#include <ctype.h>
#include <stdlib.h>
#include <string.h>

static int parse_id(const char *path, long *out_id) {
    const char *prefix = "/users/";
    if (strncmp(path, prefix, strlen(prefix)) != 0) return -1;
    const char *id_str = path + strlen(prefix);
    if (*id_str == '\0') return -1;
    for (const char *p = id_str; *p; p++) {
        if (!isdigit((unsigned char)*p)) return -1;
    }
    *out_id = atol(id_str);
    return 0;
}
```

### Querying

Pass the id as a text parameter (libpq's text-format params work for
integers too — the server casts the literal) and check `PQntuples` to
tell "found" from "not found":

```c
char id_str[32];
snprintf(id_str, sizeof(id_str), "%ld", id);
const char *params[1] = { id_str };

PGresult *res = PQexecParams(
    conn,
    "SELECT id, name, email, created_at::text FROM users WHERE id = $1",
    1, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res) == PGRES_TUPLES_OK && PQntuples(res) == 1) {
    const char *found_id = PQgetvalue(res, 0, 0);
    const char *name = PQgetvalue(res, 0, 1);
    const char *email = PQgetvalue(res, 0, 2);
    const char *created_at = PQgetvalue(res, 0, 3);
    // build 200 response
} else {
    // build 404 response with {"error":"not found"}
}
PQclear(res);
```

Requirements:

- Return `200` with the user object as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no user with that id
  exists.
- Parse the path segment as an integer. If it isn't numeric, return
  `400 Bad Request`.
- Reuse the same database connection you set up in Step 2.
