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

## Watch out

- **`local.x`, never `locals.x`.** The block keyword is plural (`locals { ... }`) but the reference is always singular (`local.name_prefix`). Writing `locals.name_prefix` is a reference to an undeclared resource, not a typo Terraform silently fixes.
- **Locals can reference other locals**, including ones defined earlier in the same block — `is_prod = local.environment == "production"` works fine as long as `environment` is a local too. There's no forward-reference restriction based on file order, only genuine circular dependencies fail.
- **`depends_on` takes a list of resource/module *references*, not strings.** `depends_on = ["aws_iam_role_policy_attachment.app_basic"]` (quoted) is wrong — it must be `depends_on = [aws_iam_role_policy_attachment.app_basic]`, an actual expression.
- **Reach for `depends_on` last.** If the dependency can be expressed by referencing an attribute (`role = aws_iam_role.app.arn`), that reference alone is enough to order the graph correctly — you don't also need `depends_on` for the same relationship. Use `depends_on` only for dependencies with no attribute to reference, like IAM eventual consistency.

## The task

You're wiring a Lambda function to an IAM role, where the role's policy attachment must complete before the function is created — a dependency that exists in AWS reality but isn't expressed through any attribute reference.

```hcl
variable "project" {
  # type = string, default = "myapp"
}

variable "environment" {
  # type = string, default = "production"
}

locals {
  name_prefix = "..."  # combines project + environment
  is_prod     = ...    # true when environment is "production"
  common_tags = {}     # Project and Environment keys
}

resource "aws_iam_role" "app" {
  # name (from name_prefix), assume_role_policy = "{}", tags (from common_tags)
}

resource "aws_iam_role_policy_attachment" "app_basic" {
  # role (a reference to aws_iam_role.app), policy_arn
}

resource "aws_lambda_function" "app" {
  function_name = "${local.name_prefix}-handler"
  # role (a reference to aws_iam_role.app's arn), depends_on
}
```

Fill it in so that:

1. `variable "project"` (string, default `"myapp"`) and `variable "environment"` (string, default `"production"`) are declared.
2. `locals.name_prefix = "${var.project}-${var.environment}"`, `locals.is_prod` is `true` exactly when `var.environment == "production"`, and `locals.common_tags` is a map with at least `Project` and `Environment` keys sourced from the variables.
3. `resource "aws_iam_role" "app"` sets `name = local.name_prefix`, `assume_role_policy = "{}"` (a placeholder — real configs use `data.aws_iam_policy_document`), and `tags = local.common_tags`.
4. `resource "aws_iam_role_policy_attachment" "app_basic"` sets `role = aws_iam_role.app.name` and a `policy_arn` (any ARN string, e.g. `"arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"`).
5. `resource "aws_lambda_function" "app"` sets `role = aws_iam_role.app.arn` and `depends_on = [aws_iam_role_policy_attachment.app_basic]` — this is the explicit dependency, since nothing in the Lambda resource references the attachment's attributes directly.
