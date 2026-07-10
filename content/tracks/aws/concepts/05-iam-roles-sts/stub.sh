#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: write trust-policy.json via heredoc:
#       Effect Allow, Principal {"Service": "lambda.amazonaws.com"}, Action sts:AssumeRole

# TODO: iam create-role --role-name lambda-exec-role --assume-role-policy-document file://trust-policy.json

# TODO: iam attach-role-policy --role-name lambda-exec-role
#       --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# TODO: sts assume-role --role-arn arn:aws:iam::000000000000:role/lambda-exec-role
#       --role-session-name demo-session

# TODO: add a comment: # answer: <why a Lambda execution role has no long-lived access keys>
