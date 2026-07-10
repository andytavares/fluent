# DynamoDB Tables

## What you'll learn

DynamoDB is a managed key-value/document store built for predictable, single-digit-millisecond access at any scale — in exchange, it demands that you design your key schema around your access patterns *before* you write data, not after. This concept covers partition/sort key design thinking, billing modes, basic item operations, and the single-table pattern that DynamoDB's model actively encourages.

## Key concepts

### Partition key and sort key — design first, query later

Every DynamoDB table has a **primary key**, which is either:

- **Simple**: just a partition key (e.g., `UserId`) — one item per key value.
- **Composite**: a partition key + a sort key (e.g., `UserId` + `OrderId`) — many items can share a partition key, ordered/queryable by sort key.

The partition key determines *which physical partition* an item lands on — DynamoDB hashes it internally to distribute load. This is why partition key choice is the single most important DynamoDB design decision: pick something with **high cardinality** and **even access distribution**. A partition key of `Status` (values: `PENDING`/`SHIPPED`/`DONE`) is a classic anti-pattern — three possible values means at most three partitions ever get traffic, no matter how much you scale.

Unlike a relational schema (design the tables, then write whatever query you need), DynamoDB inverts this: **you must know your access patterns before you design the key schema**, because DynamoDB efficiently answers exactly one kind of question well — "give me the item(s) with this partition key [and this sort key / sort key range]." Anything else requires a scan (next concept) or a secondary index.

### On-demand vs provisioned capacity

| Mode | Billing | Best for |
|---|---|---|
| `PAY_PER_REQUEST` (on-demand) | Per read/write actually performed | Unpredictable or spiky traffic, new tables, prototypes |
| `PROVISIONED` | Reserved read/write capacity units per second, billed whether used or not | Steady, predictable traffic where you can tune capacity and save cost |

```bash
aws --endpoint-url http://localhost:4566 dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

`KeyType=HASH` is the partition key; `KeyType=RANGE` is the sort key (DynamoDB's API still uses the original "hash/range" terminology internally, even though the console and docs mostly say "partition/sort" now). `--attribute-definitions` only declares the *types* of attributes used in keys/indexes — it is not a schema for the whole item; DynamoDB is schemaless beyond the key attributes.

### Basic item operations

```bash
# Write (creates or fully replaces) an item
aws --endpoint-url http://localhost:4566 dynamodb put-item \
  --table-name Orders \
  --item '{
    "PK": {"S": "CUSTOMER#123"},
    "SK": {"S": "ORDER#456"},
    "Total": {"N": "89.99"},
    "Status": {"S": "SHIPPED"}
  }'

# Read one exact item by full primary key
aws --endpoint-url http://localhost:4566 dynamodb get-item \
  --table-name Orders \
  --key '{"PK": {"S": "CUSTOMER#123"}, "SK": {"S": "ORDER#456"}}'
```

Every attribute value is a typed map: `{"S": "..."}` for string, `{"N": "..."}` for number (sent as a string, to avoid floating-point precision loss), `{"BOOL": true}`, `{"L": [...]}` for list, `{"M": {...}}` for nested map, `{"NULL": true}`, `{"B": "..."}` for binary. This verbose typed format is what the raw API always uses; SDK "document clients" in most languages convert to/from native types automatically, but the CLI speaks the raw format directly.

### Item size limits

**400 KB per item, total, across all attributes.** This is a hard ceiling with no exceptions — there's no "large object" mode. Data that can exceed this (file contents, large blobs) belongs in S3, with DynamoDB storing just the S3 key/URL as a pointer. This limit is also *why* DynamoDB doesn't support complex joins or unbounded nested collections — every item has to fit in one bounded, independently-storable unit.

### Single-table design (introduction)

DynamoDB pricing and performance are per-table-independent of item count, and cross-table queries don't exist (no joins) — which pushes toward a pattern that looks bizarre coming from relational design: **one table holding multiple, unrelated-looking entity types**, disambiguated by generic key names and prefixed values:

```
PK              SK                  (attributes...)
CUSTOMER#123    METADATA            Name, Email
CUSTOMER#123    ORDER#456           Total, Status
CUSTOMER#123    ORDER#789           Total, Status
PRODUCT#001     METADATA            Name, Price
```

Naming the key attributes generically (`PK`/`SK` rather than `CustomerId`/`OrderId`) is deliberate — it lets one table host customers, orders, and products together, each with a different "shape" of value in the same two physical columns. A query for `PK = CUSTOMER#123` returns the customer's metadata *and* all their orders in one request — the join happened at write time (by choosing the key layout), not at query time. This is covered in depth in the next concept; for now, recognize the pattern when you see generic key names.

## vs other languages

| | DynamoDB | PostgreSQL / MySQL | MongoDB |
|---|---|---|---|
| Schema | Only key attributes are typed/required | Full schema, enforced | Schemaless, per-document |
| Joins | None — denormalize at write time | Native, first-class | `$lookup` (limited, discouraged at scale) |
| Query flexibility | Only via primary key or defined indexes | Arbitrary `WHERE` on any column (with cost) | Arbitrary filters (with cost) |
| Scaling model | Horizontal, automatic, partition-key-driven | Usually vertical, or manual sharding | Horizontal via sharding, manual tuning |

Coming from SQL, the adjustment is mental, not syntactic: you can't "just add a `WHERE` clause" for a new access pattern later without adding a new index (or a scan, which doesn't scale) — the schema-then-query workflow is inverted to query-then-schema.

## Watch out

- **`AttributeType` in `--attribute-definitions` must exactly match every attribute used as a key in the table or any index** — declaring `PK` as `S` (string) and then trying to `put-item` with `PK` as a number will fail validation.
- **Choosing a low-cardinality partition key is the most common and hardest-to-fix DynamoDB mistake** — it's a physical data distribution problem, not something an index can patch after the fact. Think about your write/read pattern's spread across values *before* creating the table.
- **`put-item` fully replaces the item** if the key already exists — there is no partial update via `put-item`; partial updates require `update-item` with an `UpdateExpression` (not covered here, but expect to reach for it in real work).
- **On-demand mode has its own default scaling limits** (an item collection can only scale up so fast) — very bursty new traffic on a brand-new on-demand table can still throttle; this is rare in practice but not impossible.

## The task

Fill in `stub.sh` so it, in order:

1. Creates a table named `Orders` with a composite primary key: partition key `PK` (string) and sort key `SK` (string), billing mode `PAY_PER_REQUEST`.
2. Puts one item with `PK = CUSTOMER#123`, `SK = ORDER#456`, a numeric `Total` of `89.99`, and a string `Status` of `SHIPPED`.
3. Gets that exact item back by its full primary key (`PK`/`SK`).
4. Adds a comment `# answer: <one sentence>` explaining why `Status` (with only a handful of possible values) would be a poor choice of partition key for this table.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
aws --endpoint-url http://localhost:4566 dynamodb scan --table-name Orders
```

You should see the one item you wrote, with its typed attribute map.
