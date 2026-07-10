# Step 2 — PUT a key

With the server up from Step 1, it's time to add persistence. This step
introduces the `kv_entries` table and the write path every later step reads
or overwrites: setting a key's value, with an optional expiry.

It also introduces the two things every later step needs: reading a
request body off the raw socket, and connecting to Postgres with the
`postgres` crate.

## The task

Add a handler for `PUT /kv/:key` that sets a key's value, upserting it if
the key already exists.

**Request body:**

```json
{ "value": "hello", "ttl_seconds": 60 }
```

`ttl_seconds` is optional. When present, the key expires `ttl_seconds`
seconds from now. When absent, the key never expires.

**Response:** `200 OK` with the stored entry:

```json
{ "key": "user:1", "value": "hello", "expires_at": "2026-07-10 12:01:00+00" }
```

When no `ttl_seconds` was given, `expires_at` is `null`:

```json
{ "key": "perm:1", "value": "world", "expires_at": null }
```

### Connecting to Postgres

Your `Cargo.toml` already declares `postgres = "0.19"` as its only
dependency (pre-fetched — no other crate is reachable from this session).
It's the synchronous, blocking client, so no async runtime is involved.

`Client::connect` accepts a libpq-style connection string directly,
including the `postgresql://user:pass@host/db` URI format — `DATABASE_URL`
is already in that format, so no reformatting is needed:

```rust
use postgres::{Client, NoTls};

let mut client = Client::connect(&std::env::var("DATABASE_URL").unwrap(), NoTls)
    .expect("failed to connect to postgres");
```

Create the table on startup if it doesn't exist:

```rust
client
    .batch_execute(
        "CREATE TABLE IF NOT EXISTS kv_entries (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            expires_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )",
    )
    .expect("failed to create table");
```

### Upserting with `ON CONFLICT`

A key might already exist, and `PUT` should overwrite it in place rather
than fail on a duplicate primary key. Postgres's `INSERT ... ON CONFLICT
... DO UPDATE` handles this in one statement — the pattern usually called
an "upsert":

```rust
let row = client
    .query_one(
        "INSERT INTO kv_entries (key, value, expires_at, updated_at)
         VALUES (
             $1,
             $2,
             CASE WHEN $3::bigint IS NULL THEN NULL
                  ELSE NOW() + ($3::bigint * INTERVAL '1 second')
             END,
             NOW()
         )
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value,
             expires_at = EXCLUDED.expires_at,
             updated_at = NOW()
         RETURNING key, value, expires_at::text",
        &[&key, &value, &ttl_seconds],
    )
    .expect("upsert failed");

let key: String = row.get(0);
let value: String = row.get(1);
let expires_at: Option<String> = row.get(2);
```

`ttl_seconds` is an `Option<i64>` extracted from the request body (`None`
when the field was absent). The `CASE` expression computes `expires_at`
inside SQL rather than in Rust — the `postgres` crate's default build
doesn't include the `chrono`/`time` feature flags, so there's no
`SystemTime + Duration` arithmetic producing a timestamp Postgres would
accept as a parameter. Letting Postgres do `NOW() + interval` and casting
the result to `text` sidesteps that entirely: you send it a plain integer,
it hands back a plain string.

`EXCLUDED` refers to the row that *would* have been inserted — reusing it
in the `DO UPDATE SET` clause means you don't have to repeat the same
`CASE` expression twice.

### Reading the request body

Unlike Step 1, you now need to read past the headers to reach the body.
The simplest approach for this capstone: keep reading off the socket until
you've seen the blank line that ends the headers (`\r\n\r\n`), pull
`Content-Length` out of the header text, then keep reading until you have
that many body bytes.

```rust
fn read_request(stream: &mut TcpStream) -> (String, String, String) {
    let mut buf = Vec::new();
    let mut chunk = [0u8; 4096];
    loop {
        let n = stream.read(&mut chunk).unwrap_or(0);
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&chunk[..n]);
        if let Some(header_end) = find_double_crlf(&buf) {
            let headers = String::from_utf8_lossy(&buf[..header_end]).to_string();
            let content_length = parse_content_length(&headers);
            let body_start = header_end + 4;
            while buf.len() < body_start + content_length {
                let n = stream.read(&mut chunk).unwrap_or(0);
                if n == 0 {
                    break;
                }
                buf.extend_from_slice(&chunk[..n]);
            }
            let body = String::from_utf8_lossy(&buf[body_start..body_start + content_length]).to_string();
            let request_line = headers.lines().next().unwrap_or("").to_string();
            return (request_line, headers, body);
        }
    }
    (String::new(), String::new(), String::new())
}
```

If `Content-Length` is absent (no body expected — GET/DELETE requests),
treat the body as empty.

### Hand-rolled JSON

There's no JSON crate available either. Every request/response body in
this capstone has a small, fixed shape, so a minimal string-scanning parser
is enough — find the key's quoted literal, then read the value that
follows it. `value` is always a quoted string; `ttl_seconds`, when present,
is a bare number:

```rust
fn extract_string_field(body: &str, key: &str) -> Option<String> {
    let needle = format!("\"{key}\"");
    let key_pos = body.find(&needle)?;
    let after_key = &body[key_pos + needle.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon = after_key[colon_pos + 1..].trim_start();
    let rest = after_colon.strip_prefix('"')?;
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}

fn extract_int_field(body: &str, key: &str) -> Option<i64> {
    let needle = format!("\"{key}\"");
    let key_pos = body.find(&needle)?;
    let after_key = &body[key_pos + needle.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon = after_key[colon_pos + 1..].trim_start();
    let end = after_colon.find(|c: char| !c.is_ascii_digit())?;
    after_colon[..end].parse().ok()
}
```

Build response JSON with plain `format!`, mapping `None` to a bare `null`
so it matches the sample response above:

```rust
let expires_at_json = match expires_at {
    Some(ts) => format!("\"{ts}\""),
    None => "null".to_string(),
};
format!(r#"{{"key":"{key}","value":"{value}","expires_at":{expires_at_json}}}"#)
```

Requirements:

- Connect to Postgres using the `DATABASE_URL` environment variable
  (already set in your session) via the `postgres` crate with `NoTls`.
- Your server should create the `kv_entries` table itself on startup if it
  doesn't already exist.
- Validate that `value` is present (and non-empty) in the request body. If
  it's missing, return `400 Bad Request`.
- `ttl_seconds` is optional. When present, `expires_at` is set to
  `ttl_seconds` seconds from now; when absent, `expires_at` is `null`.
- Read the full request body using `Content-Length` before responding —
  don't assume the whole body arrives in a single `read()` call.
- If the key already exists, overwrite its value, expiry, and
  `updated_at` — don't fail on a duplicate key.
