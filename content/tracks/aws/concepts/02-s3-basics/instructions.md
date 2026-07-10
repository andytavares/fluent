# S3 Basics

## What you'll learn

S3 is object storage: buckets hold objects, objects are identified by a key, and that's almost the entire model. There are no real directories, no in-place edits, and no filesystem semantics — understanding that flat model up front prevents a whole class of "why doesn't this behave like a folder" confusion. You'll create buckets, move data in and out with `cp`/`mv`/`sync`, generate time-limited shareable links, and see how storage classes trade cost for retrieval latency.

## Key concepts

### Buckets and objects — the flat namespace truth

A bucket is a globally-unique (across all of AWS, not just your account) named container. An object is a blob of bytes plus a **key** — a string like `photos/2024/vacation.jpg`. That's it. S3 has no concept of a "directory" — the `/` in a key is just a character. The Console *renders* common prefixes as folders for convenience, and the CLI's `s3` commands (as opposed to the lower-level `s3api`) mimic filesystem verbs, but underneath, every operation is a flat key lookup.

```bash
aws --endpoint-url http://localhost:4566 s3 mb s3://fluent-s3-basics
```

`mb` = "make bucket." Bucket names must be DNS-compatible: lowercase, no underscores, 3–63 characters.

### `cp`, `mv`, `sync` — the filesystem-flavored commands

The CLI's `s3` (not `s3api`) subcommands wrap the raw API in familiar verbs:

```bash
# Upload a local file to a key
aws --endpoint-url http://localhost:4566 s3 cp ./data.txt s3://fluent-s3-basics/data.txt

# "Move" — actually implemented as copy-then-delete, since S3 has no rename
aws --endpoint-url http://localhost:4566 s3 mv \
  s3://fluent-s3-basics/data.txt s3://fluent-s3-basics/archive/data.txt

# Recursively upload/update a whole local directory, skipping unchanged files
aws --endpoint-url http://localhost:4566 s3 sync ./local-dir s3://fluent-s3-basics/local-dir
```

`sync` compares size and last-modified timestamp to decide what to skip — it is not a byte-level diff. It's the tool you reach for to publish a static site directory or mirror a data folder without re-uploading everything on every run.

### Presigned URLs

A presigned URL lets you grant **temporary, credential-free** access to a private object — the caller doesn't need AWS credentials at all, just the URL, which embeds a signature valid for a bounded time window:

```bash
aws --endpoint-url http://localhost:4566 s3 presign \
  s3://fluent-s3-basics/archive/data.txt --expires-in 3600
```

This is how you let a browser upload/download directly to/from S3 without routing bytes through your own backend, and without making the bucket public. The URL itself *is* the credential for that one action, for that one object, until it expires.

### Storage classes — same object, different cost/retrieval tradeoff

| Class | Retrieval | Use case |
|---|---|---|
| `STANDARD` | Milliseconds, always available | Actively-accessed data |
| `STANDARD_IA` | Milliseconds, but a per-GB retrieval fee | Infrequently accessed, still needs instant access |
| `ONEZONE_IA` | Same as IA, single AZ | Reproducible data you can afford to lose (a second copy exists) |
| `GLACIER` / `DEEP_ARCHIVE` | Minutes to hours (a *restore* request first) | Long-term archive, compliance retention |

Storage class is set per-object (or via a lifecycle rule, covered in the next concept), not per-bucket:

```bash
aws --endpoint-url http://localhost:4566 s3api put-object \
  --bucket fluent-s3-basics --key big-export.bin \
  --body ./big-export.bin --storage-class STANDARD_IA
```

## vs other languages

| | S3 | Local filesystem | Traditional block storage (EBS) |
|---|---|---|---|
| Addressing | Flat key per object | Path through directory tree | Byte offsets on a mounted volume |
| Rename | Copy + delete (two API calls) | `rename()`, atomic, instant | Not applicable |
| Partial writes | None — objects are replaced wholesale (multipart upload assembles parts, but the result is still one atomic object) | `write()` at any offset | Yes, in-place |
| Access model | HTTPS API, IAM/policy-gated, presignable | POSIX permissions, requires the host | Attached to one EC2 instance at a time |

The biggest adjustment for engineers used to a filesystem: there is no `rm -rf s3://bucket/folder/` in the OS sense, because `folder/` isn't a real thing — you're deleting every object whose key happens to start with that prefix. The CLI's `--recursive` flag on `s3 rm` does exactly this under the hood.

## Watch out

- **`s3 mv` between two S3 locations is copy-then-delete, not a rename.** For very large objects this means real data transfer, not a cheap pointer update — budget time and (on real AWS) request cost accordingly.
- **A trailing slash in a key isn't a folder marker unless you explicitly create one.** Uploading `photos/2024/` (with nothing after it) creates a real, zero-byte object with that literal key — some tools use this as a folder placeholder, but S3 itself doesn't require or recognize it as special.
- **Bucket names are global.** `fluent-s3-basics` might collide with someone else's bucket on real AWS; LocalStack doesn't enforce this, but production naming should include an account-specific or random suffix.
- **`sync` only looks one direction by default** — `aws s3 sync local/ s3://bucket/` uploads new/changed local files but does not delete objects in the bucket that no longer exist locally unless you pass `--delete`.

## The task

Fill in `stub.sh` so it, in order:

1. Creates a bucket named `fluent-s3-basics`.
2. Copies a local file `./data.txt` to the key `data.txt` in that bucket.
3. Moves that object to `archive/data.txt` within the same bucket (still using the `s3` subcommand, not `s3api`).
4. Syncs a local directory `./local-dir` to the bucket under the prefix `local-dir`.
5. Generates a presigned URL for `archive/data.txt` valid for 3600 seconds.
6. Uploads a second object, `big-export.bin`, using `s3api put-object` with `--storage-class STANDARD_IA`.

Every command targets `--endpoint-url "$ENDPOINT_URL"` where `ENDPOINT_URL=http://localhost:4566` (already defined at the top of the stub).

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
echo "hello" > data.txt && mkdir -p local-dir && echo "x" > local-dir/f.txt && touch big-export.bin
bash stub.sh   # once filled in
aws --endpoint-url http://localhost:4566 s3 ls s3://fluent-s3-basics --recursive
```

You should see `archive/data.txt`, `local-dir/f.txt`, and `big-export.bin` listed.
