# Step 5 — Expiry semantics

Clients that set a TTL often want to know how much of it is left before
they refresh a key. This step exposes that directly instead of making
every caller re-derive it from `expires_at` and its own clock.

## The task

Add a handler for `GET /kv/:key/ttl` that reports the remaining seconds
before a key expires.

**Sample request/response (key with a TTL):**

```
GET /kv/future:key/ttl

200 OK
Content-Type: application/json

{"key":"future:key","ttl_seconds":315360000}
```

**Sample request/response (key with no expiry):**

```
GET /kv/forever:key/ttl

200 OK
Content-Type: application/json

{"key":"forever:key","ttl_seconds":null}
```

**Sample request/response (expired or missing):**

```
GET /kv/expired:key/ttl

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

The path now has a suffix as well as a prefix. Strip `/kv/` off the front
and `/ttl` off the back; whatever's left is the key:

```rust
let path = "/kv/future:key/ttl";
if let Some(rest) = path.strip_prefix("/kv/") {
    if let Some(key) = rest.strip_suffix("/ttl") {
        // look up key
    }
}
```

### Computing the remaining seconds in SQL

As in Step 3, do the expiry comparison in SQL rather than pulling a
timestamp into Rust and subtracting. `EXTRACT(EPOCH FROM ...)` on an
interval gives you a `double precision` number of seconds; `FLOOR` rounds
it down to a whole number of seconds remaining, and casting to `bigint`
gives you a value the `postgres` crate can read straight into an
`Option<i64>`:

```rust
let row = client
    .query_opt(
        "SELECT
             CASE WHEN expires_at IS NULL THEN NULL
                  ELSE FLOOR(EXTRACT(EPOCH FROM (expires_at - NOW())))::bigint
             END AS ttl_seconds
         FROM kv_entries
         WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())",
        &[&key],
    )
    .expect("query failed");

match row {
    Some(row) => {
        let ttl_seconds: Option<i64> = row.get(0);
        // build 200 response — ttl_seconds may itself be None (no expiry)
    }
    None => {
        // build 404 response with {"error":"not found"}
    }
}
```

Notice the same `WHERE ... (expires_at IS NULL OR expires_at > NOW())`
guard from Step 3 reappears here — an already-expired key is a 404 for
this endpoint too, not a `ttl_seconds` of zero or negative.

Requirements:

- Return `200` with `{"key": ..., "ttl_seconds": N}` when the key exists
  and has a TTL — `N` is the whole number of seconds remaining, rounded
  down.
- Return `200` with `{"key": ..., "ttl_seconds": null}` when the key
  exists but has no expiry set.
- Return `404` with body `{"error": "not found"}` when the key doesn't
  exist or has already expired.
- Reuse the same expiry filter from Step 3 (`expires_at IS NULL OR
  expires_at > NOW()`) in the `WHERE` clause.
