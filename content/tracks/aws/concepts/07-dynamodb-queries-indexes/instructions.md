# DynamoDB Queries & Indexes

## What you'll learn

This concept builds on `dynamodb-tables` and covers the two ways to read many items (`Query` vs `Scan`, and why the cost difference between them is not a minor detail), the syntax for both, the classic filter-expression trap, secondary indexes for querying by an attribute other than the primary key, and pagination for result sets larger than one response page.

## Key concepts

### Query vs Scan — the cost model, taught hard

- **`Query`**: looks up items by **partition key** (required) and optionally a sort-key condition. DynamoDB jumps straight to the relevant partition — cost is proportional to items *returned* (well, items matching the key condition, read cost is billed per item read regardless of whether it's later filtered out — see below).
- **`Scan`**: reads **every single item in the entire table**, then applies any filter you specified. Cost is proportional to the *whole table size*, every time, regardless of how few items you actually wanted.

```bash
# Query: cheap, scales with result set, requires knowing the partition key
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk": {"S": "CUSTOMER#123"}}'

# Scan: expensive, reads the whole table no matter what you're looking for
aws --endpoint-url http://localhost:4566 dynamodb scan \
  --table-name Orders
```

**Never use `Scan` as your primary access pattern in production.** It's fine for one-off admin scripts, small tables, or full-table exports — anything on the request path of an application should be a `Query` against a key schema (or index) designed for that exact access pattern. If you find yourself reaching for `Scan` to serve a user-facing feature, that's a sign the table's key design is missing an access pattern — go add a GSI (below), don't just accept the scan.

### `key-condition-expression` syntax

```bash
# Sort key range: orders for this customer placed in a date range
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk AND SK BETWEEN :start AND :end" \
  --expression-attribute-values '{
    ":pk": {"S": "CUSTOMER#123"},
    ":start": {"S": "ORDER#2024-01-01"},
    ":end": {"S": "ORDER#2024-12-31"}
  }'
```

The partition key condition must always be an exact `=` match. The sort key condition (optional) supports `=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, and `begins_with(SK, :prefix)` — the last of which is exactly how the single-table pattern queries "give me all orders for this customer" (`begins_with(SK, "ORDER#")`) versus "give me just the metadata item" (`SK = "METADATA"`).

### Filter expressions — evaluated *after* the read, the classic trap

```bash
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --filter-expression "Status = :status" \
  --expression-attribute-values '{
    ":pk": {"S": "CUSTOMER#123"},
    ":status": {"S": "SHIPPED"}
  }'
```

This looks like it filters what gets read — **it does not.** DynamoDB first reads every item matching the key condition (and bills you for reading all of them), *then* discards the ones that don't match the filter expression before returning the response. If a customer has 500 orders and only 3 are `SHIPPED`, this query is billed for reading all 500 — the filter only shrinks the *response payload*, not the *read cost or the scanned item count*.

The fix, when this pattern recurs often, is to design a key (often a GSI, below) where `Status` is part of the key itself, so the filtering happens as a `Query`'s key condition instead of a post-read filter.

### GSI vs LSI

| | Global Secondary Index (GSI) | Local Secondary Index (LSI) |
|---|---|---|
| Partition key | Can be a **different** attribute than the base table | Must be the **same** partition key as the base table |
| Sort key | Any attribute, or none | A different attribute, same partition key |
| Created | Any time (added to an existing table) | Only at table creation — cannot be added later |
| Capacity | Its own separate throughput (or shares on-demand billing) | Shares the base table's capacity |
| Consistency | Eventually consistent only | Supports strongly consistent reads |

```bash
aws --endpoint-url http://localhost:4566 dynamodb update-table \
  --table-name Orders \
  --attribute-definitions AttributeName=Status,AttributeType=S \
  --global-secondary-index-updates '[{
    "Create": {
      "IndexName": "StatusIndex",
      "KeySchema": [{"AttributeName": "Status", "KeyType": "HASH"}],
      "Projection": {"ProjectionType": "ALL"}
    }
  }]'
```

This creates a new query path — "give me all orders with this `Status`, across every customer" — that the base table's `PK`/`SK` schema can't answer directly. In practice, reach for a GSI by default; its ability to be added later without recreating the table makes it far more forgiving of access patterns you didn't anticipate at design time.

### Pagination

DynamoDB responses cap out at 1 MB (whichever comes first between that and any `--limit`/count) — larger result sets return a `LastEvaluatedKey`, which you feed back in as `--exclusive-start-key` to get the next page:

```bash
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk": {"S": "CUSTOMER#123"}}' \
  --page-size 25
```

`--page-size` (a CLI-level convenience) controls how many items the CLI requests per underlying API call while it auto-paginates and prints everything; `--no-paginate` combined with manually reading `LastEvaluatedKey` from the output and passing it as `--starting-token` gives you full manual control when scripting exact page boundaries.

## vs other languages

| | DynamoDB Query/Scan | SQL `WHERE` on an indexed column | SQL `WHERE` on a non-indexed column |
|---|---|---|---|
| Cost signal is visible upfront | Yes — `Query` vs `Scan` is an explicit, different API call | Hidden in the query planner | Hidden in the query planner (until `EXPLAIN`) |
| "Accidentally expensive" query | Hard to write by accident — you must call `Scan` | Rare — the optimizer usually picks the index | Common — full table scan under the hood, same problem as DynamoDB `Scan` |

DynamoDB actually makes this cost tradeoff *more* visible than SQL, not less — `Query` and `Scan` are different function names you must choose between, versus SQL where an accidental full scan hides silently behind a `WHERE` clause on an unindexed column until someone runs `EXPLAIN ANALYZE`.

## Watch out

- **A `Query` with only a filter expression and no key condition is invalid** — you cannot filter-only; you must supply at least the partition key.
- **`--filter-expression` billing is the single most common DynamoDB cost surprise** for engineers coming from SQL, where `WHERE` conditions are "free" from a billing perspective (the planner handles it). Reread the previous section if this hasn't fully clicked yet — it's worth the re-read.
- **LSIs must be created with the table and count against the same 10 GB per-partition-key soft limit as the base table's item collection** — this is why GSIs are the default choice today; LSIs are mostly a legacy option for the specific case of needing strongly consistent reads on an alternate sort key.
- **A GSI is eventually consistent, always** — if your application logic assumes read-your-writes consistency through an index, you'll intermittently not see an item you just wrote, moments earlier, through that GSI.

## The task

Fill in `stub.sh` so it, in order, against the `Orders` table from the previous concept:

1. Runs a `Query` for `PK = CUSTOMER#123`, using `--key-condition-expression` and `--expression-attribute-values`.
2. Runs a `Scan` on the same table with no filter, and adds a comment `# answer: <one sentence>` explaining why this scan is more expensive than the query above even if both return the exact same one item.
3. Runs a `Query` for `PK = CUSTOMER#123` with an additional `--filter-expression "Status = :status"` for `Status = SHIPPED`, and adds a comment `# answer: <one sentence>` explaining exactly when the filter is applied relative to the read, and what that means for cost.
4. Adds a Global Secondary Index named `StatusIndex` to the `Orders` table via `update-table`, with partition key `Status` (string) and `ProjectionType: ALL`.
5. Runs a paginated `Query` for `PK = CUSTOMER#123` with `--page-size 25`.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
# (create the Orders table and put-item from the previous concept's script first)
bash stub.sh   # once filled in
```
