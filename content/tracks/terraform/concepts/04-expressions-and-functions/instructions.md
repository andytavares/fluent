# Expressions & Functions

## What you'll learn

HCL's expression syntax and the built-in functions that make configurations dynamic without requiring a general-purpose programming language.

## Key concepts

### String interpolation

Embed any expression inside a string with `${}`:

```hcl
locals {
  bucket_name = "myapp-${var.environment}-assets"
  full_name   = "${var.project}-${var.environment}"
}
```

Multi-line strings use heredoc syntax:

```hcl
user_data = <<-EOT
  #!/bin/bash
  echo "Environment: ${var.environment}"
  apt-get update
EOT
```

### Conditional expression

Terraform's ternary: `condition ? true_val : false_val`

```hcl
locals {
  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"
  enable_logs   = var.environment != "dev" ? true : false
}
```

Both branches must return the same type.

### Type conversion functions

```hcl
toset(["a", "b", "a"])   # => {"a", "b"}  — deduplicated set
tolist(toset(var.azs))   # => list from set (order not guaranteed)
tostring(42)             # => "42"
tonumber("3.14")         # => 3.14
```

`toset` is particularly common before `for_each` (which requires a set or map, not a list).

### Collection functions

```hcl
# lookup(map, key, default)
lookup(var.ami_map, var.region, "ami-default")

# merge(map1, map2, ...) — later maps win on key conflicts
merge(local.common_tags, { Environment = var.environment })

# coalesce(val1, val2, ...) — returns first non-null, non-empty value
coalesce(var.custom_name, "default-name")

# concat(list1, list2)
concat(var.base_cidrs, ["10.99.0.0/24"])

# length(), keys(), values(), contains()
length(var.subnet_ids)
contains(["us-east-1", "us-west-2"], var.region)
```

### For expressions

Transform collections inline:

```hcl
# list comprehension
[for s in var.subnets : upper(s)]

# map comprehension
{for k, v in var.tags : k => lower(v)}

# filter with if
[for id in var.instance_ids : id if id != ""]
```

## vs other tools

| Tool | Expression system |
|------|------------------|
| **CloudFormation** | `Fn::If`, `Fn::Sub`, `Fn::Select` — intrinsic functions in YAML; no real type system |
| **Pulumi** | Full programming language (`if`/`?:` etc.); much more power but also more complexity |
| **Helm** | Go templates (`{{- if .Values.foo }}`); string-only, no type safety |
| **Bicep** | Similar ternary and string interpolation; Azure-only |

Terraform's expression language hits a sweet spot: richer than YAML intrinsics, simpler than a full PL runtime. The tradeoff is no loops or iteration beyond `for` expressions and meta-arguments.

## Watch out

- **Both branches of a conditional must produce the same type.** `var.environment == "production" ? "t3.large" : 0` fails — one branch is a string, the other a number. If the branches are complex expressions, Terraform sometimes needs an explicit `tostring()`/`tonumber()` to unify them.
- **`merge()` is not deep.** `merge({a = {x = 1}}, {a = {y = 2}})` gives `{a = {y = 2}}` — the second map's `a` key fully replaces the first's, it doesn't merge nested objects.
- **String interpolation of a non-string silently converts it.** `"count: ${5}"` produces `"count: 5"` — no error, which can mask a type mistake that was meant to be caught elsewhere.
- **`toset()` drops both order and duplicates.** If you need the original order preserved, `toset()` is the wrong function — sets are unordered by definition. Use it specifically when the caller (e.g. `for_each`) doesn't care about order and does care about uniqueness.

## The task

You're computing a handful of derived values with `locals` (covered in depth in concept 05, but the syntax is straightforward: a name assigned to an expression) that exercise interpolation, conditionals, and two collection functions.

```hcl
variable "environment" {
  # type = string, default = "staging"
}

variable "project" {
  # type = string, default = "myapp"
}

variable "region" {
  # type = string, default = "us-east-1"
}

locals {
  bucket_name   = "..." # string interpolation of var.project and var.environment
  instance_type = "..." # conditional: "t3.large" in production, else "t3.micro"
  common_tags   = {}    # merge() of two maps
  az_set        = []    # toset() applied to a list with a duplicate
}

output "bucket_name" {
  # value
}

output "instance_type" {
  # value
}
```

Fill it in so that:

1. `variable "environment"` (type `string`, default `"staging"`), `variable "project"` (type `string`, default `"myapp"`), and `variable "region"` (type `string`, default `"us-east-1"`) are declared.
2. `locals.bucket_name` uses `${}` string interpolation to combine `var.project` and `var.environment` into one string (e.g. `"myapp-staging-assets"` when using the defaults).
3. `locals.instance_type` is a conditional expression: `"t3.large"` when `var.environment == "production"`, otherwise `"t3.micro"`.
4. `locals.common_tags` is built with `merge(...)`, combining a map `{ Project = var.project }` with a map `{ Environment = var.environment }` into one map with both keys.
5. `locals.az_set` applies `toset(...)` to the list `["us-east-1a", "us-east-1b", "us-east-1a"]` — the result should deduplicate the repeated entry.
6. `output "bucket_name"` has `value = local.bucket_name`, and `output "instance_type"` has `value = local.instance_type`.
