#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566
BUCKET=fluent-s3-advanced

# TODO: create the bucket

# TODO: enable versioning — s3api put-bucket-versioning --versioning-configuration Status=Enabled

# TODO: delete report.csv, then list-object-versions to show the delete marker
# TODO: add a comment: # answer: <why delete-object didn't remove any data>

# TODO: put-bucket-lifecycle-configuration — rule "archive-old-logs", prefix "logs/",
#       transition to STANDARD_IA after 30 days, expire after 365 days

# TODO: put-bucket-policy allowing public s3:GetObject on arn:aws:s3:::fluent-s3-advanced/public/*

# TODO: put-bucket-encryption with SSEAlgorithm aws:kms

# TODO: put-bucket-website with IndexDocument index.html and ErrorDocument error.html
