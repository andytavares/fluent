# Step 2 — PUT a key

Step 1 gave you a running server. This step adds persistence: the
`kv_entries` table and the write path. Every later step reads or
overwrites the rows it writes. The write sets the value of a key, with
an optional expiry.

This step also adds two things that every later step needs. You read a
request body from the raw socket. You connect to Postgres with the
`postgres` crate.

## The task

Add a handler for `PUT /kv/:key`. It sets the value of a key. If the key
already exists, it overwrites the key (an upsert).

**Request body:**

```json
{ "value": "hello", "ttl_seconds": 60 }
```

`ttl_seconds` is optional. When it is present, the key expires
`ttl_seconds` seconds from now. When it is absent, the key never
expires.

**Response:** `200 OK` with the stored entry:

```json
{
  "key": "user:1",
  "value": "hello",
  "expires_at": "2026-07-10 12:01:00+00"
}
```

When the request has no `ttl_seconds`, `expires_at` is `null`:

```json
{
  "key": "perm:1",
  "value": "world",
  "expires_at": null
}
```

### Connecting to Postgres

Your `Cargo.toml` already declares `postgres = "0.19"` as its only
dependency. Your session already has the crate, and no other crate is
available. It is the synchronous, blocking client, so you need no async
runtime.

`Client::connect` accepts a libpq-style connection string, including the
`postgresql://user:pass@host/db` URI format. `DATABASE_URL` already has
that format, so you do not change it:

```rust
use postgres::{Client, NoTls};

let url =
    std::env::var("DATABASE_URL").unwrap();
let mut client =
    Client::connect(&url, NoTls)
        .expect("postgres connect failed");
```

Create the table on startup if it does not exist:

```rust
const CREATE_TABLE: &str = "
CREATE TABLE IF NOT EXISTS kv_entries (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT NOW()
)";

client
    .batch_execute(CREATE_TABLE)
    .expect("failed to create table");
```

### Upserting with `ON CONFLICT`

The key can already exist. `PUT` must overwrite it in place, and not fail
on a duplicate primary key. Postgres does this in one statement with
`INSERT ... ON CONFLICT ... DO UPDATE`. The usual name for this pattern
is "upsert":

```rust
const UPSERT: &str = "
INSERT INTO kv_entries
  (key, value, expires_at, updated_at)
VALUES (
  $1,
  $2,
  CASE WHEN $3::bigint IS NULL THEN NULL
    ELSE NOW()
      + ($3::bigint * INTERVAL '1 second')
  END,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW()
RETURNING key, value, expires_at::text";

let row = client
    .query_one(
        UPSERT,
        &[&key, &value, &ttl_seconds],
    )
    .expect("upsert failed");

let key: String = row.get(0);
let value: String = row.get(1);
let expires_at: Option<String> =
    row.get(2);
```

`ttl_seconds` is an `Option<i64>` from the request body. It is `None`
when the field is absent. The `CASE` expression computes `expires_at` in
SQL, not in Rust. The default build of the `postgres` crate does not
include the `chrono` or `time` feature flags. So Rust cannot do
`SystemTime + Duration` arithmetic and send the timestamp as a parameter.
Postgres computes `NOW() + interval` instead, and the query casts the
result to `text`. You send a plain integer and get back a plain string.

`EXCLUDED` refers to the row that the insert proposed. The `DO UPDATE
SET` clause uses it, so you do not write the `CASE` expression a second
time.

### Reading the request body

Unlike Step 1, you now read past the headers to reach the body. The
simplest method for this capstone has three parts:

1. Read from the socket until you see the blank line that ends the
   headers (`\r\n\r\n`).
2. Get `Content-Length` from the header text.
3. Read until you have that number of body bytes.

```rust
fn read_request(
    stream: &mut TcpStream,
) -> (String, String, String) {
    let mut buf = Vec::new();
    let mut chunk = [0u8; 4096];
    let header_end = loop {
        if let Some(end) =
            find_double_crlf(&buf)
        {
            break end;
        }
        let n = stream.read(&mut chunk)
            .unwrap_or(0);
        if n == 0 {
            return Default::default();
        }
        buf.extend_from_slice(&chunk[..n]);
    };
    let headers = String::from_utf8_lossy(
        &buf[..header_end],
    )
    .to_string();
    let length =
        parse_content_length(&headers);
    let start = header_end + 4;
    while buf.len() < start + length {
        let n = stream.read(&mut chunk)
            .unwrap_or(0);
        if n == 0 {
            break;
        }
        buf.extend_from_slice(&chunk[..n]);
    }
    let body = String::from_utf8_lossy(
        &buf[start..start + length],
    )
    .to_string();
    let request_line = headers
        .lines()
        .next()
        .unwrap_or("")
        .to_string();
    (request_line, headers, body)
}
```

`GET` and `DELETE` requests have no body. If `Content-Length` is absent,
treat the body as empty.

### Hand-rolled JSON

Your session has no JSON crate either. Every request and response body
in this capstone has a small, fixed shape. A minimal string-scanning
parser is enough: find the quoted key, then read the value after it.
`value` is always a quoted string. `ttl_seconds`, when present, is a
bare number:

```rust
fn extract_string_field(
    body: &str,
    key: &str,
) -> Option<String> {
    let needle = format!("\"{key}\"");
    let key_pos = body.find(&needle)?;
    let after_key =
        &body[key_pos + needle.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon =
        after_key[colon_pos + 1..]
            .trim_start();
    let rest =
        after_colon.strip_prefix('"')?;
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}

fn extract_int_field(
    body: &str,
    key: &str,
) -> Option<i64> {
    let needle = format!("\"{key}\"");
    let key_pos = body.find(&needle)?;
    let after_key =
        &body[key_pos + needle.len()..];
    let colon_pos = after_key.find(':')?;
    let after_colon =
        after_key[colon_pos + 1..]
            .trim_start();
    let end = after_colon.find(
        |c: char| !c.is_ascii_digit(),
    )?;
    after_colon[..end].parse().ok()
}
```

Build the response JSON with plain `format!`. Map `None` to a bare
`null`, as in the sample response above:

```rust
let expires_at_json = match expires_at {
    Some(ts) => format!("\"{ts}\""),
    None => "null".to_string(),
};
format!(
    "{{\"key\":\"{key}\",\
     \"value\":\"{value}\",\
     \"expires_at\":{expires_at_json}}}"
)
```

Requirements:

- Connect to Postgres with the `DATABASE_URL` environment variable. Your
  session already sets it. Use the `postgres` crate with `NoTls`.
- Your server must create the `kv_entries` table on startup if it does
  not exist.
- `value` must be present and not empty in the request body. If it is
  missing, return `400 Bad Request`.
- `ttl_seconds` is optional. When it is present, set `expires_at` to
  `ttl_seconds` seconds from now. When it is absent, `expires_at` is
  `null`.
- Read the full request body with `Content-Length` before you respond.
  Do not expect the whole body to arrive in one `read()` call.
- If the key already exists, overwrite its value, its expiry and
  `updated_at`. Do not fail on a duplicate key.
