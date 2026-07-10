#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: secretsmanager create-secret --name prod/orders-db/password
#       --secret-string '{"username":"app_user","password":"correct-horse-battery-staple"}'

# TODO: secretsmanager get-secret-value --secret-id prod/orders-db/password

# TODO: ssm put-parameter --name /fluent/orders/api-key --value "sk_live_abc123" --type SecureString

# TODO: ssm get-parameter --name /fluent/orders/api-key --with-decryption

# TODO: write secret-access-policy.json via heredoc — Effect Allow,
#       Action secretsmanager:GetSecretValue,
#       Resource arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*

# TODO: secretsmanager rotate-secret --secret-id prod/orders-db/password
#       --rotation-lambda-arn arn:aws:lambda:us-east-1:000000000000:function:rotate-db-password
#       --rotation-rules AutomaticallyAfterDays=30

# TODO: add a comment: # answer: <which checklist item a hardcoded committed password violates, and why>
