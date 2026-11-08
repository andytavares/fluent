## What you build

You write `stub.sh`, a script that reads the `Orders` table with `Query` and `Scan`, adds a filter, adds a secondary index and pages through results. The cost difference between `Query` and `Scan` is large, and the lesson shows why. This lesson builds on **DynamoDB Tables**.

## Key concepts

### `Query` reads one partition, `Scan` reads the whole table

- **`Query`** finds items by **partition key** (required) and an optional sort key condition. DynamoDB goes straight to that partition. You pay for each item that matches the key condition, also items a filter drops later.
- **`Scan`** reads **every item in the table**, then applies any filter. You pay for the whole table size, each time, however few items you want.

```bash
# Query: cheap, needs the partition key
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values \
  '{":pk": {"S": "CUSTOMER#123"}}'

# Scan: reads the whole table every time
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb scan \
  --table-name Orders
```

**Never use `Scan` as your main access pattern in production.** It is fine for one-off admin scripts, small tables and full exports. On the request path of an application, use a `Query` against a key or index designed for that pattern. If a user-facing feature needs `Scan`, the key design is missing an access pattern. Add a GSI (below) instead of the scan.

`Query` and `Scan` are different API calls, so DynamoDB shows the cost choice up front. In SQL, a full scan hides behind a `WHERE` on an unindexed column until you run `EXPLAIN`.

### A key condition matches the partition key exactly

```bash
# Orders for one customer in a date range
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb query \
  --table-name Orders \
  --key-condition-expression \
"PK = :pk AND SK BETWEEN :start AND :end" \
  --expression-attribute-values '{
    ":pk": {"S": "CUSTOMER#123"},
    ":start": {"S": "ORDER#2024-01-01"},
    ":end": {"S": "ORDER#2024-12-31"}
  }'
```

The partition key condition is always an exact `=` match. The optional sort key condition supports `=`, `<`, `<=`, `>`, `>=`, `BETWEEN` and `begins_with(SK, :prefix)`. Single-table design uses `begins_with(SK, "ORDER#")` for all orders of a customer, and `SK = "METADATA"` for the metadata item only.

### A filter expression runs after the read

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --filter-expression "Status = :status" \
  --expression-attribute-values '{
    ":pk": {"S": "CUSTOMER#123"},
    ":status": {"S": "SHIPPED"}
  }'
```

This looks like it limits what DynamoDB reads. **It does not.** DynamoDB first reads every item that matches the key condition, and bills you for all of them. Then it drops the items that do not match the filter, before it returns the response.

A customer has 500 orders, and 3 are `SHIPPED`. You pay to read all 500. The filter makes only the *response* smaller, not the *read cost* or the count of items read.

If this pattern repeats, put `Status` in a key, often a GSI. The filtering then happens in a key condition, not after the read.

### A GSI can use a different partition key, an LSI cannot

| | GSI | LSI |
|---|---|---|
| Partition key | Any attribute | Same as table |
| Sort key | Any, or none | A different attribute |
| Created | Any time | At table creation only |
| Capacity | Its own | Shared with table |
| Consistency | Eventual only | Strong reads too |

A GSI is a global secondary index, and an LSI is a local secondary index. On on-demand tables, a GSI shares the on-demand billing.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb update-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=Status,AttributeType=S \
  --global-secondary-index-updates '[{
  "Create": {
    "IndexName": "StatusIndex",
    "KeySchema": [{
      "AttributeName": "Status",
      "KeyType": "HASH"
    }],
    "Projection": {"ProjectionType": "ALL"}
  }
}]'
```

This adds a new query path: all orders with one `Status`, across all customers. The `PK` and `SK` of the base table cannot answer it. Prefer a GSI by default. You can add it later without a new table, so it forgives access patterns you did not plan for.

### Large results come back in pages

A DynamoDB response stops at 1 MB, or at `--limit` items, whichever comes first. A larger result returns a `LastEvaluatedKey`. Pass it as `--exclusive-start-key` to get the next page.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values \
  '{":pk": {"S": "CUSTOMER#123"}}' \
  --page-size 25
```

`--page-size` is a CLI option. It sets how many items the CLI asks for in each API call. The CLI still follows every page and prints all items. `--no-paginate` makes the CLI call only once, for the first page. You then read `LastEvaluatedKey` and pass it as `--exclusive-start-key` for exact page control. `--starting-token` is different: it takes the `NextToken` that the CLI prints when you use `--max-items`.

## Watch out

- You write a `Query` with a filter and no key condition. The call is invalid. A query needs the partition key.
- You treat `--filter-expression` like a free SQL `WHERE`. You pay for every item read. This is the most common DynamoDB cost surprise.
- You add an LSI later. You cannot; LSIs exist only from table creation. With an LSI, each partition key value has a 10 GB limit.
- You need strong reads on another sort key. That is the main reason for an LSI today. Otherwise, use a GSI.
- You read your own write through a GSI. A GSI is always eventually consistent, so the new item can be missing for a moment.

## The task

Fill in `stub.sh`. Use the `Orders` table from the previous concept. Do these steps in order:

1. Run a `Query` for `PK = CUSTOMER#123`, with `--key-condition-expression` and `--expression-attribute-values`.
2. Run a `Scan` on the same table, with no filter.
3. Add a comment `# answer: <one sentence>` with the word "scan" or "cost". Say why the scan costs more, even for the same one item.
4. Run a `Query` for `PK = CUSTOMER#123` with `--filter-expression "Status = :status"` for `SHIPPED`.
5. Add a comment `# answer: <one sentence>` with the word "filter". Say when the filter runs relative to the read, and what that means for cost.
6. Add a GSI named `StatusIndex` with `update-table`. Its partition key is `Status` (string), with `"ProjectionType": "ALL"`.
7. Run a paginated `Query` for `PK = CUSTOMER#123` with `--page-size 25`.

The calls look like the key concepts above. Keep `"AttributeName": "Status"` on one line. The scan and its answer look like this:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb scan \
  --table-name Orders
# answer: a scan reads the whole table,
# so its cost grows with table size.
```

To run it against LocalStack, first create the `Orders` table and its item with the script from the previous concept. Then run `bash stub.sh`.
