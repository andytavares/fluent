# Step 3 — GET /entries/:id

Step 2 creates entries, so you add a read path. This is the first
endpoint that reads existing rows. The fixtures for this step already
contain rows to fetch.

## The task

Add a handler for `GET /entries/:id`. It fetches one entry by its integer
`id`.

**Sample request and response (found):**

```
GET /entries/1

200 OK
Content-Type: application/json

{"id":1,
 "name":"Ada Lovelace",
 "message":"First!",
 "created_at":"2026-07-01 09:00:00+00"}
```

**Sample request and response (not found):**

```
GET /entries/9999

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

**Sample request and response (non-numeric id):**

```
GET /entries/abc

400 Bad Request
```

### Parsing the id with `strtol`, not `atoi`

`atoi` returns `0` for any text that it cannot parse, and it reports no
error. You cannot tell `atoi("abc")` from `atoi("0")`. `strtol` gives you
an end pointer, so you can check that it read the *whole* string as
digits:

```c
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>
#include <string.h>

static int parse_id(const char *id_str,
                    long *out_id) {
    if (*id_str == '\0') return -1;
    char *endptr;
    errno = 0;
    long val =
        strtol(id_str, &endptr, 10);
    if (errno != 0 || *endptr != '\0'
        || endptr == id_str) return -1;
    *out_id = val;
    return 0;
}
```

Each check catches one kind of bad input:

- `endptr == id_str` catches an empty or fully non-numeric string. No
  digits were read.
- `*endptr != '\0'` catches trailing text, such as `"12abc"`.
- `errno` catches overflow.

Remove the `/entries/` prefix from the path before you call it:

```c
const char *prefix = "/entries/";
if (strncmp(path, prefix,
            strlen(prefix)) == 0) {
    const char *id_str =
        path + strlen(prefix);
    long id;
    if (parse_id(id_str, &id) != 0) {
        // 400 Bad Request
    }
}
```

### Querying

Pass the id as a text parameter. libpq text parameters work for integers
too, because the server casts the literal. Check `PQntuples` to tell
"found" from "not found":

```c
char id_str[32];
snprintf(id_str, sizeof(id_str),
         "%ld", id);
const char *params[1] = { id_str };

PGresult *res = PQexecParams(
    conn,
    "SELECT id, name, message, "
    "created_at::text FROM entries "
    "WHERE id = $1",
    1, NULL, params, NULL, NULL, 0);

if (PQresultStatus(res) == PGRES_TUPLES_OK
    && PQntuples(res) == 1) {
    const char *found_id =
        PQgetvalue(res, 0, 0);
    const char *name =
        PQgetvalue(res, 0, 1);
    const char *message =
        PQgetvalue(res, 0, 2);
    const char *created_at =
        PQgetvalue(res, 0, 3);
    // build 200 response
} else {
    // build 404 response with
    // {"error":"not found"}
}
PQclear(res);
```

Requirements:

- If the id exists, return `200` with the entry as JSON.
- If no entry has that id, return `404` with body
  `{"error": "not found"}`.
- If the path segment is not a valid integer, return `400 Bad Request`.
- Use `strtol` with an end-pointer check, not `atoi`. It must reject
  trailing text (`"12abc"`) and non-numeric text (`"abc"`).
- Use the same database connection that you set up in Step 2.
