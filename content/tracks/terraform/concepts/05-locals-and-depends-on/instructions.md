# Locals & depends_on

## What you'll learn

How `locals` DRY up repeated expressions without exposing them as module inputs, and how `depends_on` handles the rare cases where Terraform's implicit dependency graph isn't enough.

## Key concepts

### `locals` block

Locals are named intermediate values computed within a module. They're not inputs (unlike `variable`) and not exported (unlike `output`) — they're private to the module.

```hcl
locals {
  name_prefix = "${var.project}-${var.environment}"
  is_prod     = var.environment == "production"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

Reference with `local.<name>` (note: `local`, not `locals`):

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

### locals vs variables

| | `variable` | `local` |
|---|---|---|
| Set by caller | Yes | No |
| Has default | Optional | Always (it's the expression) |
| Exported by module | Only via `output` | No |
| Use case | Public interface | Internal computed values |

Don't use variables for things callers should never control. Don't use locals for things that legitimately vary per deployment — that's what variables are for.

### `depends_on` — explicit dependencies

Terraform builds a dependency graph automatically by tracking resource references. Most of the time you don't need `depends_on`. Use it only when a dependency exists that isn't expressed through attribute references — typically IAM propagation or ordering between a resource and a module.

```hcl
resource "aws_iam_role_policy_attachment" "lambda_exec" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "processor" {
  function_name = "order-processor"
  role          = aws_iam_role.lambda.arn

  # IAM changes can take seconds to propagate globally.
  # The reference to aws_iam_role.lambda.arn creates an implicit dependency,
  # but the policy attachment is a separate resource that isn't referenced here.
  depends_on = [aws_iam_role_policy_attachment.lambda_exec]
}
```

`depends_on` accepts a list of resource or module references. It forces the listed objects to be fully applied before the annotated resource is touched.

### When NOT to use `depends_on`

If you can express the dependency through a reference (e.g., `subnet_id = aws_subnet.app.id`), do that instead. `depends_on` is coarser — it blocks the entire resource, not just the attribute. Overusing it creates unnecessary serialization and slows apply times.

## vs other tools

| Tool | Explicit dependency handling |
|------|----------------------------|
| **CloudFormation** | `DependsOn:` attribute — same idea, string-based resource logical IDs |
| **Pulumi** | `opts=ResourceOptions(depends_on=[...])` — equivalent, code-native |
| **Ansible** | Task ordering is explicit by default; `when:` for conditional execution |

The difference from CloudFormation: Terraform's implicit graph is usually smarter, so `depends_on` is needed far less often than CF's `DependsOn`.

## The task

Write a Terraform configuration that:

1. Declares `variable "project"` (string, default `"myapp"`) and `variable "environment"` (string, default `"production"`).
2. Declares a `locals` block with:
   - `name_prefix = "${var.project}-${var.environment}"`
   - `is_prod` as a boolean: `true` when `var.environment == "production"`
   - `common_tags` as a map with at least `Project` and `Environment` keys using the variables.
3. Declares an `aws_iam_role` resource named `"app"` using `local.name_prefix` in its `name` and `local.common_tags` in `tags`. (Use a placeholder `assume_role_policy = "{}"` for the policy JSON.)
4. Declares an `aws_iam_role_policy_attachment` resource named `"app_basic"` that references `aws_iam_role.app.name`.
5. Declares an `aws_lambda_function` resource named `"app"` that uses `depends_on = [aws_iam_role_policy_attachment.app_basic]` and references `aws_iam_role.app.arn` for `role`.
