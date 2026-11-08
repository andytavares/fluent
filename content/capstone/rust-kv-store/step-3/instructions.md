# Step 3 — GET a key

Clients can now set keys. This step adds a read path. It is the first
endpoint that reads existing rows. It is also the first place where
expiry matters: an expired key must behave exactly like a key that
nobody set.

## The task

Add a handler for `GET /kv/:key`. It fetches the current value of a key.

**Sample request and response (found):**

```
GET /kv/greeting

200 OK
Content-Type: application/json

{
  "key": "greeting",
  "value": "hello world",
  "expires_at": null
}
```

**Sample request and response (not found or expired):**

```
GET /kv/stale

404 Not Found
Content-Type: application/json

{"error":"not found"}
```

### Parsing the path

You match paths by hand on the path part of the request line
(`/kv/greeting`). Remove the `/kv/` prefix. The rest is the key. Keys in
this capstone can contain colons, such as `user:1`, so do not split on
`:`:

```rust
let path = "/kv/greeting";
let key = path.strip_prefix("/kv/");
if let Some(key) = key {
    // look up key
}
```

### Filtering expiry in SQL, not in Rust

You can fetch the row, read `expires_at` into Rust, and compare it with
the current time. But then the clock of your application server must
agree with the clock of the database. You also repeat the same
comparison in every handler that reads a key. It is simpler and more
correct to put expiry in the `WHERE` clause, so an expired row does not
match:

```rust
const GET_LIVE: &str = "
SELECT key, value, expires_at::text
FROM kv_entries
WHERE key = $1
  AND (expires_at IS NULL
       OR expires_at > NOW())";

let row = client
    .query_opt(GET_LIVE, &[&key])
    .expect("query failed");

match row {
    Some(row) => {
        let key: String = row.get(0);
        let value: String = row.get(1);
        let expires_at: Option<String> =
            row.get(2);
        // build 200 response
    }
    None => {
        // 404 with {"error":"not found"}
    }
}
```

`query_opt` returns `Result<Option<Row>, Error>`. `None` now means "no
such key" or "the key expired". Your handler does not need to tell them
apart. That one `WHERE` clause is the only place for expiry logic. Every
later endpoint that reads keys uses the same condition.

Requirements:

- If the key exists and has not expired, return `200` with its current
  value as JSON.
- Return `404` with body `{"error": "not found"}` if the key does not
  exist, **or** if it exists and `expires_at` is in the past.
- Filter expiry in the SQL query itself
  (`expires_at IS NULL OR expires_at > NOW()`). Do not fetch the row and
  check the timestamp in Rust.
- Use the same database connection from Step 2.
