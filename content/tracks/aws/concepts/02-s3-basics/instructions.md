## What you build

You write `stub.sh`, a script that creates a bucket, moves data in and out, makes a temporary link and sets a storage class. This lesson builds on **CLI & LocalStack**.

## Key concepts

### S3 is a flat namespace of keys

A bucket is a named container. Its name is unique across all of AWS, not only your account. An object is a blob of bytes plus a **key**, a string like `photos/2024/vacation.jpg`.

S3 has no directories. The `/` in a key is an ordinary character. The Console shows common prefixes as folders, and the `s3` commands copy filesystem verbs. Every operation is still a flat key lookup.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3 mb s3://fluent-s3-basics
```

`mb` means "make bucket". A bucket name must be DNS-compatible: lowercase, no underscores, 3 to 63 characters.

### `cp`, `mv` and `sync` wrap the API in filesystem verbs

The `s3` commands (not `s3api`) give the raw API familiar names:

```bash
# Upload a local file to a key
aws --endpoint-url "$ENDPOINT_URL" \
  s3 cp ./data.txt \
  s3://fluent-s3-basics/data.txt

# Copy, then delete: S3 has no rename
aws --endpoint-url "$ENDPOINT_URL" \
  s3 mv s3://fluent-s3-basics/data.txt \
  s3://fluent-s3-basics/archive/data.txt

# Upload a directory, skip unchanged files
aws --endpoint-url "$ENDPOINT_URL" \
  s3 sync ./local-dir \
  s3://fluent-s3-basics/local-dir
```

`sync` compares the size and the last-modified time to decide what to skip. It does not compare bytes. Use it to publish a static site or mirror a data folder without a full upload on each run.

### A presigned URL grants temporary access to one object

A presigned URL gives access to a private object without credentials. The URL holds a signature that stays valid for a fixed time:

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3 presign \
  s3://fluent-s3-basics/archive/data.txt \
  --expires-in 3600
```

A browser can then upload to S3 or download from S3 directly. The bytes do not go through your backend, and the bucket stays private. The URL is the credential for one action on one object until it expires.

### The storage class trades cost for retrieval time

| Class | Retrieval | Use |
|---|---|---|
| `STANDARD` | Milliseconds | Active data |
| `STANDARD_IA` | Milliseconds, fee per GB | Rare access, instant need |
| `ONEZONE_IA` | Like IA, one AZ | Data you can rebuild |
| `GLACIER`, `DEEP_ARCHIVE` | Minutes to hours, restore first | Archive, compliance |

Use `ONEZONE_IA` only for data you can afford to lose, because a second copy exists elsewhere. You set the storage class per object, not per bucket. A lifecycle rule can also set it, as the next concept shows.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-object \
  --bucket fluent-s3-basics \
  --key big-export.bin \
  --body ./big-export.bin \
  --storage-class STANDARD_IA
```

### S3 replaces objects whole

S3 has no partial writes. A write replaces the whole object. A multipart upload assembles parts, but the result is still one atomic object. A local filesystem can `write()` at any offset, and its `rename()` is atomic. S3 needs two API calls to rename: a copy and a delete.

### Folder delete means prefix delete

There is no `rm -rf s3://bucket/folder/`, because `folder/` does not exist. You delete every object whose key starts with that prefix. `s3 rm --recursive` does this for you.

## Watch out

- You treat `s3 mv` between two S3 locations as a cheap rename. It copies, then deletes. Large objects take real transfer time and request cost.
- You upload `photos/2024/` with nothing after it. S3 creates a real zero-byte object with that key. Some tools use it as a folder placeholder. S3 gives it no special meaning.
- You use a plain name like `fluent-s3-basics` on real AWS. Bucket names are global, so it can collide. LocalStack does not check this. Add an account-specific or random suffix in production.
- You expect `sync` to delete remote files. `aws s3 sync local/ s3://bucket/` uploads new and changed files only. Add `--delete` to remove objects that no longer exist locally.

## The task

Fill in `stub.sh`. The top of the stub already defines `ENDPOINT_URL=http://localhost:4566`. Every command uses `--endpoint-url "$ENDPOINT_URL"`. Do these steps in order:

1. Create the bucket `fluent-s3-basics`.
2. Copy the local file `./data.txt` to the key `data.txt` in that bucket.
3. Move that object to `archive/data.txt` in the same bucket. Use `s3 mv`, not `s3api`.
4. Sync the local directory `./local-dir` to the bucket, under the prefix `local-dir`.
5. Make a presigned URL for `archive/data.txt` that is valid for 3600 seconds.
6. Upload `big-export.bin` with `s3api put-object` and `--storage-class STANDARD_IA`.

Keep each `s3 cp` and `s3 sync` source and target on one line, as below.

```bash
aws --endpoint-url "$ENDPOINT_URL" \
  s3 mb s3://fluent-s3-basics
aws --endpoint-url "$ENDPOINT_URL" \
  s3 cp ./data.txt s3://fluent-s3-basics/data.txt
aws --endpoint-url "$ENDPOINT_URL" \
  s3 mv s3://fluent-s3-basics/data.txt \
  s3://fluent-s3-basics/archive/data.txt
aws --endpoint-url "$ENDPOINT_URL" \
  s3 sync ./local-dir s3://fluent-s3-basics/local-dir
aws --endpoint-url "$ENDPOINT_URL" \
  s3 presign \
  s3://fluent-s3-basics/archive/data.txt \
  --expires-in 3600
aws --endpoint-url "$ENDPOINT_URL" \
  s3api put-object \
  --bucket fluent-s3-basics \
  --key big-export.bin \
  --body ./big-export.bin \
  --storage-class STANDARD_IA
```

To run it against LocalStack, create `data.txt`, `local-dir/f.txt` and `big-export.bin`, then run `bash stub.sh`. Then run `s3 ls s3://fluent-s3-basics --recursive`. You see `archive/data.txt`, `local-dir/f.txt` and `big-export.bin`.
