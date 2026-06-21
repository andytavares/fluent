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

## The task

Write a Terraform configuration using `locals` (covered more in concept 05, but needed here) that demonstrates:

1. A `variable "environment"` of type `string` with default `"staging"`.
2. A `variable "project"` of type `string` with default `"myapp"`.
3. A `variable "region"` of type `string` with default `"us-east-1"`.
4. A `locals` block containing:
   - `bucket_name` built by string interpolation of `var.project` and `var.environment`.
   - `instance_type` using a conditional: `"t3.large"` if `var.environment == "production"`, otherwise `"t3.micro"`.
   - `common_tags` as a map using `merge()` combining a base map `{ Project = var.project }` with `{ Environment = var.environment }`.
   - `az_set` using `toset()` on the list `["us-east-1a", "us-east-1b", "us-east-1a"]` (demonstrates deduplication).
5. An `output "bucket_name"` that outputs `local.bucket_name`.
6. An `output "instance_type"` that outputs `local.instance_type`.
