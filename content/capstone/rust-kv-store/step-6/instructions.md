# Step 6 — Prefix listing

The final ticket: a collection endpoint for browsing keys by prefix, since
real clients rarely want to fetch keys one at a time when they're managing
a whole namespace (`user:*`, `session:*`, and so on).

## The task

Add a handler for `GET /kv` that lists unexpired keys matching a prefix,
with offset-based pagination:

```
GET /kv?prefix=user:&page=1&limit=10
```

- `prefix` is matched against the start of the key.
- `page` defaults to `1` if omitted.
- `limit` defaults to `10` if omitted, and is clamped to a maximum of
  `100` if a caller requests more.
- Results are ordered by key, ascending.
- Expired keys are excluded, same as Step 3.

**Response:** `200 OK` with:

```json
{
  "entries": [
    { "key": "user:01", "value": "val01" },
    { "key": "user:02", "value": "val02" }
  ],
  "total": 12,
  "page": 1,
  "limit": 10
}
```

### Parsing the query string

The path component of your request line now includes a `?` — split on it,
then split the query string on `&` and `=`. `prefix` needs URL-decoding
in a real system, but every prefix used in this capstone is already
URL-safe, so a plain split is enough here:

```rust
fn parse_query(path: &str) -> (String, i64, i64) {
    let mut prefix = String::new();
    let mut page = 1i64;
    let mut limit = 10i64;
    if let Some((_, query)) = path.split_once('?') {
        for pair in query.split('&') {
            if let Some((key, value)) = pair.split_once('=') {
                match key {
                    "prefix" => prefix = value.to_string(),
                    "page" => page = value.parse().unwrap_or(1),
                    "limit" => limit = value.parse().unwrap_or(10),
                    _ => {}
                }
            }
        }
    }
    (prefix, page.max(1), limit.clamp(1, 100))
}
```

### Escaping the prefix for `LIKE`

A prefix match in SQL is `LIKE 'prefix%'` — but `%` and `_` are wildcard
characters in `LIKE` patterns, and a caller's prefix might legitimately
contain either one literally (imagine a namespace like `100%complete:`).
Escape them before building the pattern, and tell Postgres what escape
character you used:

```rust
fn escape_like(input: &str) -> String {
    input
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

let pattern = format!("{}%", escape_like(&prefix));
```

```rust
let total: i64 = client
    .query_one(
        "SELECT COUNT(*) FROM kv_entries
         WHERE key LIKE $1 ESCAPE '\\' AND (expires_at IS NULL OR expires_at > NOW())",
        &[&pattern],
    )
    .expect("count failed")
    .get(0);

let offset = (page - 1) * limit;
let rows = client
    .query(
        "SELECT key, value FROM kv_entries
         WHERE key LIKE $1 ESCAPE '\\' AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY key
         LIMIT $2 OFFSET $3",
        &[&pattern, &limit, &offset],
    )
    .expect("list query failed");
```

Without the explicit escaping, a prefix containing `%` or `_` would match
far more (or fewer) keys than the caller intended — the classic bug with
building `LIKE` patterns straight from user input.

### Building the JSON array

Map each `Row` to a JSON object string, join them with commas, and wrap in
`[...]`:

```rust
let entries_json: Vec<String> = rows
    .iter()
    .map(|row| {
        let key: String = row.get(0);
        let value: String = row.get(1);
        format!(r#"{{"key":"{key}","value":"{value}"}}"#)
    })
    .collect();

let body = format!(
    r#"{{"entries":[{}],"total":{total},"page":{page},"limit":{limit}}}"#,
    entries_json.join(",")
);
```

Requirements:

- Only include keys that start with `prefix` and haven't expired
  (`expires_at IS NULL OR expires_at > NOW()`).
- Escape `%`, `_`, and `\` in the caller-supplied prefix before using it
  in a `LIKE` pattern.
- Order results by key, ascending.
- `total` is the total count of matching, unexpired keys, independent of
  the current page — use a separate `COUNT(*)` query with the same
  filter.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `100` max even if a caller requests a larger value.
- With the seeded fixtures (12 unexpired `user:` keys) and the default
  `limit=10`, page 1 returns 10 keys and page 2 returns the remaining 2.
