# Step 5 — Expiry semantics

Clients that set a TTL often need to know how much of it is left before
they refresh a key. This step gives them that number directly. Without
it, every caller computes it from `expires_at` and its own clock.

## The task

Add a handler for `GET /kv/:key/ttl`. It returns the number of seconds
left before a key expires.

**Sample request and response (key with a TTL):**

```
GET /kv/future:key/ttl

200 OK
Content-Type: application/json

{
  "key": "future:key",
  "ttl_seconds": 315360000
}
```

**Sample request and response (key with no expiry):**

```
GET /kv/forever:key/ttl

200 OK
Content-Type: application/json

{"key":"forever:key","ttl_seconds":null}
```

**Sample request and response (expired or missing):**

```
GET /kv/expired:key/ttl

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

The path now has a suffix and a prefix. Remove `/kv/` from the front
and `/ttl` from the back. The rest is the key:

```rust
let path = "/kv/future:key/ttl";
let key = path
    .strip_prefix("/kv/")
    .and_then(|r| r.strip_suffix("/ttl"));
if let Some(key) = key {
    // look up key
}
```

### Computing the remaining seconds in SQL

As in Step 3, compare expiry in SQL. Do not read a timestamp into Rust
and subtract. `EXTRACT(EPOCH FROM ...)` on an interval gives a
`double precision` number of seconds. `FLOOR` rounds it down to whole
seconds. The cast to `bigint` gives a value that the `postgres` crate
reads directly into an `Option<i64>`:

```rust
const TTL_QUERY: &str = "
SELECT
  CASE WHEN expires_at IS NULL THEN NULL
    ELSE FLOOR(EXTRACT(EPOCH FROM
      (expires_at - NOW())))::bigint
  END AS ttl_seconds
FROM kv_entries
WHERE key = $1
  AND (expires_at IS NULL
       OR expires_at > NOW())";

let row = client
    .query_opt(TTL_QUERY, &[&key])
    .expect("query failed");

match row {
    Some(row) => {
        let ttl_seconds: Option<i64> =
            row.get(0);
        // build 200 response.
        // ttl_seconds is None for a key
        // with no expiry.
    }
    None => {
        // 404 with {"error":"not found"}
    }
}
```

The `WHERE ... (expires_at IS NULL OR expires_at > NOW())` guard from
Step 3 is here again. For this endpoint too, an expired key is a 404. It
is not a `ttl_seconds` of zero or a negative number.

Requirements:

- When the key exists and has a TTL, return `200` with
  `{"key": ..., "ttl_seconds": N}`. `N` is the number of whole seconds
  left, rounded down.
- When the key exists and has no expiry, return `200` with
  `{"key": ..., "ttl_seconds": null}`.
- When the key does not exist or has already expired, return `404` with
  body `{"error": "not found"}`.
- Use the same expiry filter from Step 3
  (`expires_at IS NULL OR expires_at > NOW()`) in the `WHERE` clause.
