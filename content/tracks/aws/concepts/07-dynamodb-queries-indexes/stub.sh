#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: query Orders for PK = CUSTOMER#123 (key-condition-expression + expression-attribute-values)

# TODO: scan Orders (no filter)
# TODO: add a comment: # answer: <why the scan costs more than the query above>

# TODO: query Orders for PK = CUSTOMER#123 with --filter-expression "Status = :status" (Status = SHIPPED)
# TODO: add a comment: # answer: <when the filter is applied relative to the read, and the cost implication>

# TODO: update-table — add GSI "StatusIndex" on Status (S), ProjectionType ALL

# TODO: paginated query for PK = CUSTOMER#123 with --page-size 25
