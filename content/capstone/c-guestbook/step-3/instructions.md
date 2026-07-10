# Step 3 — GET /entries/:id

Now that entries can be created, add a read path. This is the first
endpoint that reads existing rows rather than writing new ones — the
fixtures loaded for this step already contain rows to fetch.

## The task

Add a handler for `GET /entries/:id` that fetches a single entry by its
integer `id`.

**Sample request/response (found):**

```
GET /entries/1

200 OK
Content-Type: application/json

{"id":1,"name":"Ada Lovelace","message":"First!","created_at":"2026-07-01 09:00:00+00"}
```

**Sample request/response (not found):**

```
GET /entries/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

**Sample request/response (non-numeric id):**

```
GET /entries/abc

400 Bad Request
```

### Parsing the id with `strtol`, not `atoi`

`atoi` silently returns `0` for anything it can't parse — `atoi("abc")`
and `atoi("0")` are indistinguishable, which is exactly the ambiguity you
need to avoid here. `strtol` gives you an end pointer so you can tell
whether the *whole* string was consumed as digits:

```c
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>
#include <string.h>

static int parse_id(const char *id_str, long *out_id) {
    if (*id_str == '\0') return -1;
    char *endptr;
    errno = 0;
    long val = strtol(id_str, &endptr, 10);
    if (errno != 0 || *endptr != '\0' || endptr == id_str) return -1;
    *out_id = val;
    return 0;
}
```

`endptr == id_str` catches an empty or entirely non-numeric string (no
digits were consumed at all); `*endptr != '\0'` catches trailing garbage
like `"12abc"`; `errno` catches overflow. Strip the `/entries/` prefix off
the path before calling it:

```c
const char *prefix = "/entries/";
if (strncmp(path, prefix, strlen(prefix)) == 0) {
    const char *id_str = path + strlen(prefix);
    long id;
    if (parse_id(id_str, &id) != 0) {
        // 400 Bad Request
    }
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
    "SELECT id, name, message, created_at::text FROM entries WHERE id = $1",
    1, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res) == PGRES_TUPLES_OK && PQntuples(res) == 1) {
    const char *found_id = PQgetvalue(res, 0, 0);
    const char *name = PQgetvalue(res, 0, 1);
    const char *message = PQgetvalue(res, 0, 2);
    const char *created_at = PQgetvalue(res, 0, 3);
    // build 200 response
} else {
    // build 404 response with {"error":"not found"}
}
PQclear(res);
```

Requirements:

- Return `200` with the entry as JSON if the id exists.
- Return `404` with body `{"error": "not found"}` if no entry with that id
  exists.
- Return `400 Bad Request` if the path segment isn't a valid integer — use
  `strtol` with an end-pointer check, not `atoi`, so trailing garbage
  (`"12abc"`) and pure garbage (`"abc"`) are both rejected.
- Reuse the same database connection you set up in Step 2.
