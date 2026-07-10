#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" s3 mb s3://fluent-s3-basics

aws --endpoint-url "$ENDPOINT_URL" s3 cp ./data.txt s3://fluent-s3-basics/data.txt

aws --endpoint-url "$ENDPOINT_URL" s3 mv \
  s3://fluent-s3-basics/data.txt s3://fluent-s3-basics/archive/data.txt

aws --endpoint-url "$ENDPOINT_URL" s3 sync ./local-dir s3://fluent-s3-basics/local-dir

aws --endpoint-url "$ENDPOINT_URL" s3 presign \
  s3://fluent-s3-basics/archive/data.txt --expires-in 3600

aws --endpoint-url "$ENDPOINT_URL" s3api put-object \
  --bucket fluent-s3-basics --key big-export.bin \
  --body ./big-export.bin --storage-class STANDARD_IA
