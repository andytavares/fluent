## What you build

You write `stub.sh`, a script that creates a DynamoDB table with a composite key, writes one item and reads it back. DynamoDB gives predictable single-digit-millisecond access at any scale. In return, you design the key schema around your access patterns *before* you write data. This lesson builds on **IAM Roles & STS**.

## Key concepts

### The primary key is a partition key, with an optional sort key

Every DynamoDB table has a **primary key** of one of two kinds:

- **Simple**: a partition key only, for example `UserId`. One item per key value.
- **Composite**: a partition key and a sort key, for example `UserId` and `OrderId`. Many items share a partition key. The sort key orders them, and you can query by it.

### The partition key decides where an item lives

DynamoDB hashes the partition key to pick a physical partition and spread the load. So the partition key is the most important design decision. Pick a key with **high cardinality** and **even access**.

A partition key of `Status`, with values `PENDING`, `SHIPPED` and `DONE`, is a classic anti-pattern. Three values means at most three partitions ever get traffic, however much you scale.

### You design for access patterns first

In a relational database, you design the tables, then write any query you need. DynamoDB inverts this. You **must know your access patterns before you design the key schema**. DynamoDB answers one kind of question well: "give me the items with this partition key, and this sort key or sort key range." Anything else needs a scan (next concept) or a secondary index.

### The billing mode is on-demand or provisioned

| Mode | Billing | Use |
|---|---|---|
| `PAY_PER_REQUEST` | Per read and write | Spiky traffic, new tables, prototypes |
| `PROVISIONED` | Capacity per second, used or not | Steady traffic you can tune |

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

`KeyType=HASH` is the partition key, and `KeyType=RANGE` is the sort key. The API keeps the original "hash" and "range" names. The console and docs now mostly say "partition" and "sort".

`--attribute-definitions` declares only the *types* of key and index attributes. It is not a schema for the whole item. Beyond the key attributes, DynamoDB has no schema.

### `put-item` writes, `get-item` reads one item

```bash
# Create or fully replace an item
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb put-item \
  --table-name Orders \
  --item '{
    "PK": {"S": "CUSTOMER#123"},
    "SK": {"S": "ORDER#456"},
    "Total": {"N": "89.99"},
    "Status": {"S": "SHIPPED"}
  }'

# Read one item by its full primary key
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb get-item \
  --table-name Orders \
  --key '{
    "PK": {"S": "CUSTOMER#123"},
    "SK": {"S": "ORDER#456"}
  }'
```

### Every attribute value is a typed map

| Type | Format |
|---|---|
| String | `{"S": "..."}` |
| Number | `{"N": "..."}` |
| Boolean | `{"BOOL": true}` |
| List | `{"L": [...]}` |
| Map | `{"M": {...}}` |
| Null | `{"NULL": true}` |
| Binary | `{"B": "..."}` |

A number travels as a string, so it keeps its precision. The raw API always uses this typed format, and the CLI speaks it directly. SDK "document clients" in most languages convert to and from native types for you.

### An item has a hard limit of 400 KB

The **400 KB** limit covers all attributes of one item. It has no exceptions and no "large object" mode. Put large data, like file contents, in S3, and store only the S3 key or URL in DynamoDB. The limit is also why DynamoDB has no joins and no unbounded nested collections. Every item must fit in one bounded unit.

### Single-table design keeps many entity types in one table

DynamoDB has no joins and no cross-table queries. Performance per table does not depend on item count. This leads to a pattern that looks strange after relational design: **one table that holds many entity types**. Generic key names and prefixed values tell them apart:

```
PK            SK         attributes
CUSTOMER#123  METADATA   Name, Email
CUSTOMER#123  ORDER#456  Total, Status
CUSTOMER#123  ORDER#789  Total, Status
PRODUCT#001   METADATA   Name, Price
```

The generic names `PK` and `SK`, not `CustomerId` and `OrderId`, are deliberate. One table can then hold customers, orders and products, each with a different value shape in the same two columns. A query for `PK = CUSTOMER#123` returns the customer metadata *and* all orders in one request. The join happens at write time, when you choose the key layout. The next concept covers this in depth.

### New access patterns need new indexes

In SQL, you add a `WHERE` clause for a new access pattern. In DynamoDB, a new access pattern needs a new index, or a scan, which does not scale.

## Watch out

- The type of a key attribute does not match `--attribute-definitions`. The write fails validation, for example a number in a `PK` declared as `S`.
- You choose a low-cardinality partition key. It is a physical distribution problem, and no index can fix it later. Check the spread of values first.
- You use `put-item` for a partial update. It replaces the whole item when the key exists. Use `update-item` with an `UpdateExpression` instead.
- You send very bursty traffic to a new on-demand table. On-demand mode has its own default scaling limits, so the table can throttle. This is rare.

## The task

Fill in `stub.sh` with these steps, in order:

1. Create the table `Orders` with billing mode `PAY_PER_REQUEST`.
2. Give it a composite primary key: partition key `PK` (string) and sort key `SK` (string).
3. Put one item with `PK` `CUSTOMER#123` and `SK` `ORDER#456`.
4. Give the item a number `Total` of `89.99` and a string `Status` of `SHIPPED`.
5. Get that item back by its full primary key, `PK` and `SK`.
6. Add a comment `# answer: <one sentence>`. Say why `Status`, with a few possible values, is a poor partition key.

The `create-table`, `put-item` and `get-item` calls look like the key concepts above. Keep each `AttributeName=...` pair on one line. The table setup looks like this:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
# answer: Status has few values, so all
# traffic hits a few partitions.
```

To run it against LocalStack, run `bash stub.sh`. Then run `dynamodb scan --table-name Orders`. You see the one item you wrote, with its typed attribute map.
