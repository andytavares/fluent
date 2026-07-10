#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: create bucket fluent-s3-basics — s3 mb s3://fluent-s3-basics

# TODO: upload ./data.txt to s3://fluent-s3-basics/data.txt — s3 cp

# TODO: move data.txt to archive/data.txt within the bucket — s3 mv

# TODO: sync ./local-dir to s3://fluent-s3-basics/local-dir — s3 sync

# TODO: presign archive/data.txt, valid for 3600 seconds — s3 presign ... --expires-in 3600

# TODO: upload big-export.bin via s3api put-object with --storage-class STANDARD_IA
