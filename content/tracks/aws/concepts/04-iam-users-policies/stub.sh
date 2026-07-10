#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: create IAM user deploy-bot

# TODO: write s3-read-policy.json via heredoc:
#       Effect Allow, Action [s3:GetObject, s3:ListBucket],
#       Resource [arn:aws:s3:::fluent-data, arn:aws:s3:::fluent-data/*]

# TODO: create-policy --policy-name s3-read-only --policy-document file://s3-read-policy.json

# TODO: attach-user-policy --user-name deploy-bot --policy-arn arn:aws:iam::000000000000:policy/s3-read-only

# TODO: create-access-key --user-name deploy-bot

# TODO: add a comment: # answer: <why least privilege beats s3:*/Resource:*>
