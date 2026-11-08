## What you build

You connect a Lambda function to an IAM role. The role's policy attachment must finish before Terraform creates the function. `locals` remove repeated expressions, and `depends_on` adds a dependency that no reference shows. This lesson builds on **Expressions & Functions**.

## Key concepts

### `locals` are private named values

A local is not an input like a `variable`, and it is not exported like an `output`. Only its own module can read it.

```hcl
locals {
  name_prefix = "${var.project}-${var.env}"
  is_prod     = var.env == "production"

  common_tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }
}
```

Read a local with `local.<name>`: singular `local`, not `locals`.

```hcl
resource "aws_s3_bucket" "app" {
  bucket = "${local.name_prefix}-app-data"
  tags   = local.common_tags
}

resource "aws_s3_bucket" "logs" {
  bucket = "${local.name_prefix}-logs"
  tags   = local.common_tags
}
```

### Variables are inputs, locals are internal

| | `variable` | `local` |
|---|---|---|
| Set by caller | Yes | No |
| Has a default | Optional | Always: the expression |
| Exported | Only by an `output` | No |
| Use | Public interface | Internal values |

Do not use a variable for a value callers must never control. Do not use a local for a value that changes per deployment.

### `depends_on` adds an explicit dependency

Terraform builds the dependency graph from references. Use `depends_on` only for a dependency that no attribute reference shows. Typical cases are IAM propagation and the order between a resource and a module.

```hcl
resource "aws_iam_role_policy_attachment" "exec" {
  role       = aws_iam_role.lambda.name
  policy_arn = var.basic_policy_arn
}

resource "aws_lambda_function" "orders" {
  function_name = "order-processor"
  role          = aws_iam_role.lambda.arn

  # IAM changes can take seconds to
  # propagate.
  # Nothing here references the attachment.
  depends_on = [
    aws_iam_role_policy_attachment.exec,
  ]
}
```

`depends_on` takes a list of resource or module references. Terraform applies every listed object completely before it touches the resource.

### A reference is better than `depends_on`

If a reference can show the dependency, such as `subnet_id = aws_subnet.app.id`, use the reference. `depends_on` blocks the whole resource, not one attribute. Too many make the apply serial and slow. CloudFormation has `DependsOn` too, but Terraform's implicit graph needs it far less often.

## Watch out

- Write `local.x`, never `locals.x`. `locals.name_prefix` is a reference to an undeclared resource.
- A local can reference other locals in any order. Only a circular dependency fails.
- `depends_on` takes references, not strings. Write `[aws_iam_role_policy_attachment.app_basic]` with no quotes.
- Do not add `depends_on` next to a reference for the same dependency. The reference already orders the graph.

## The task

Connect a Lambda function to an IAM role. The policy attachment must finish first, but no attribute reference shows this.

1. Declare `variable "project"` with type string and default `"myapp"`.
2. Declare `variable "environment"` with type string and default `"production"`.
3. `local.name_prefix` is `"${var.project}-${var.environment}"`.
4. `local.is_prod` is `true` only when `var.environment == "production"`.
5. `local.common_tags` is a map with `Project` and `Environment` keys from the variables.
6. `resource "aws_iam_role" "app"` sets `name = local.name_prefix` and `tags = local.common_tags`.
7. The role sets `assume_role_policy = "{}"`. This is a placeholder for `data.aws_iam_policy_document`.
8. `resource "aws_iam_role_policy_attachment" "app_basic"` sets `role = aws_iam_role.app.name`.
9. The attachment sets a `policy_arn`. Any ARN string is correct.
10. `resource "aws_lambda_function" "app"` sets `role = aws_iam_role.app.arn`.
11. The function sets `depends_on = [aws_iam_role_policy_attachment.app_basic]`.

A valid `policy_arn`:

```hcl
# arn:aws:iam::aws:policy/service-role/
#   AWSLambdaBasicExecutionRole
# (one string, no spaces)

variable "project" {
  # type, default
}

variable "environment" {
  # type, default
}

locals {
  # name_prefix, is_prod, common_tags
}

resource "aws_iam_role" "app" {
  # name, assume_role_policy, tags
}

resource "aws_iam_role_policy_attachment" "app_basic" {
  # role, policy_arn
}

resource "aws_lambda_function" "app" {
  # function_name is set in the stub
  # role, depends_on
}
```
