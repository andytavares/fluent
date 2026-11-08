# Step 6 — Prefix listing

This is the final ticket: a collection endpoint that lists keys by
prefix. Clients that manage a whole namespace (`user:*`, `session:*` and
so on) rarely fetch keys one at a time.

## The task

Add a handler for `GET /kv`. It lists unexpired keys that match a
prefix, with offset-based pagination:

```
GET /kv?prefix=user:&page=1&limit=10
```

- `prefix` must match the start of the key.
- When `page` is missing, it is `1`.
- When `limit` is missing, it is `10`. If a caller asks for more than
  `100`, clamp `limit` to `100`.
- Order results by key, ascending.
- Exclude expired keys, as in Step 3.

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

The path part of your request line now contains a `?`. Split on it.
Then split the query string on `&` and `=`. A real system must
URL-decode `prefix`. Every prefix in this capstone is already URL-safe,
so a plain split is enough here:

```rust
fn param(query: &str, name: &str)
    -> Option<String> {
    query.split('&').find_map(|pair| {
        let (k, v) = pair.split_once('=')?;
        (k == name).then(|| v.to_string())
    })
}

fn parse_query(
    path: &str,
) -> (String, i64, i64) {
    let query = path
        .split_once('?')
        .map_or("", |(_, q)| q);
    let prefix = param(query, "prefix")
        .unwrap_or_default();
    let page: i64 = param(query, "page")
        .and_then(|v| v.parse().ok())
        .unwrap_or(1);
    let limit: i64 = param(query, "limit")
        .and_then(|v| v.parse().ok())
        .unwrap_or(10);
    let page = page.max(1);
    let limit = limit.clamp(1, 100);
    (prefix, page, limit)
}
```

### Escaping the prefix for `LIKE`

A prefix match in SQL is `LIKE 'prefix%'`. But `%` and `_` are wildcard
characters in `LIKE` patterns. The prefix of a caller can contain either
one as a literal character, for example the namespace `100%complete:`.
Escape them before you build the pattern, and tell Postgres which escape
character you use:

```rust
fn escape_like(input: &str) -> String {
    input
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

let pattern =
    format!("{}%", escape_like(&prefix));
```

```rust
const COUNT_SQL: &str = "
SELECT COUNT(*) FROM kv_entries
WHERE key LIKE $1 ESCAPE '\\'
  AND (expires_at IS NULL
       OR expires_at > NOW())";

const LIST_SQL: &str = "
SELECT key, value FROM kv_entries
WHERE key LIKE $1 ESCAPE '\\'
  AND (expires_at IS NULL
       OR expires_at > NOW())
ORDER BY key
LIMIT $2 OFFSET $3";

let total: i64 = client
    .query_one(COUNT_SQL, &[&pattern])
    .expect("count failed")
    .get(0);

let offset = (page - 1) * limit;
let rows = client
    .query(
        LIST_SQL,
        &[&pattern, &limit, &offset],
    )
    .expect("list query failed");
```

Without the escaping, a prefix with `%` or `_` matches more or fewer
keys than the caller wants. This is the classic bug when you build
`LIKE` patterns directly from user input.

### Building the JSON array

Map each `Row` to a JSON object string. Join the strings with commas,
and put them in `[...]`:

```rust
let entries_json: Vec<String> = rows
    .iter()
    .map(|row| {
        let key: String = row.get(0);
        let value: String = row.get(1);
        format!(
            "{{\"key\":\"{key}\",\
             \"value\":\"{value}\"}}"
        )
    })
    .collect();

let entries = entries_json.join(",");
let body = format!(
    "{{\"entries\":[{entries}],\
     \"total\":{total},\
     \"page\":{page},\"limit\":{limit}}}"
);
```

Requirements:

- Include only keys that start with `prefix` and have not expired
  (`expires_at IS NULL OR expires_at > NOW()`).
- Escape `%`, `_` and `\` in the prefix from the caller before you use it
  in a `LIKE` pattern.
- Order results by key, ascending.
- `total` is the count of matching, unexpired keys, independent of the
  current page. Use a separate `COUNT(*)` query with the same filter.
- Use `OFFSET (page - 1) * limit` for pagination.
- Clamp `limit` to `100` at most, even if a caller asks for a larger
  value.
- The fixtures contain 12 unexpired `user:` keys. With the default
  `limit=10`, page 1 returns 10 keys and page 2 returns the other 2.
