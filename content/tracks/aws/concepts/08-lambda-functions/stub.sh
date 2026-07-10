#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: write index.js via heredoc — exports.handler returns { statusCode: 200, body: "hello" }

# TODO: zip function.zip index.js

# TODO: lambda create-function --function-name hello-world --runtime nodejs18.x
#       --handler index.handler --role arn:aws:iam::000000000000:role/lambda-exec-role
#       --zip-file fileb://function.zip

# TODO: lambda invoke --function-name hello-world --payload '{"name": "world"}'
#       --cli-binary-format raw-in-base64-out response.json

# TODO: lambda update-function-configuration --function-name hello-world
#       --environment "Variables={TABLE_NAME=Orders,LOG_LEVEL=info}"

# TODO: lambda update-function-configuration --function-name hello-world --timeout 10 --memory-size 512

# TODO: lambda publish-version --function-name hello-world

# TODO: lambda create-alias --function-name hello-world --name prod --function-version 1
