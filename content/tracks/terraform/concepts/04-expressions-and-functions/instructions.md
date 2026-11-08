## What you build

You compute derived values with interpolation, a conditional and two collection functions. HCL expressions make a configuration dynamic without a general-purpose programming language. This lesson builds on **Data Sources**.

## Key concepts

### `${}` puts an expression in a string

```hcl
locals {
  bucket_name = "myapp-${var.environment}"
  full_name   = "${var.project}-${var.env}"
}
```

A heredoc writes a string on many lines.

```hcl
user_data = <<-EOT
  #!/bin/bash
  echo "Env: ${var.environment}"
  apt-get update
EOT
```

### `condition ? a : b` picks one value

```hcl
locals {
  instance_type = (
    var.environment == "production"
    ? "t3.large"
    : "t3.micro"
  )
  enable_logs = var.environment != "dev"
}
```

Both branches must return the same type.

### Type conversion functions change the type

```hcl
# {"a", "b"}: a set has no duplicates
toset(["a", "b", "a"])
# a list from a set; order not guaranteed
tolist(toset(var.azs))
# "42"
tostring(42)
# 3.14
tonumber("3.14")
```

`toset` often comes before `for_each`, because `for_each` needs a set or a map, not a list.

### Collection functions combine values

```hcl
# lookup(map, key, default)
lookup(var.ami_map, var.region, "ami-x")

# The later map wins on a key conflict
merge(local.common_tags, {
  Environment = var.environment
})

# The first value that is not null or ""
coalesce(var.custom_name, "default-name")

# Joins two lists
concat(var.base_cidrs, ["10.99.0.0/24"])

length(var.subnet_ids)
contains(["us-east-1"], var.region)
```

`keys()` and `values()` return the keys and the values of a map.

### `for` expressions transform a collection

```hcl
# A list
[for s in var.subnets : upper(s)]

# A map
{ for k, v in var.tags : k => lower(v) }

# A filter
[for id in var.ids : id if id != ""]
```

HCL has no loops other than `for` expressions and meta-arguments. CloudFormation intrinsics such as `Fn::If` have no real type system; Pulumi uses a full programming language.

## Watch out

- `var.env == "production" ? "t3.large" : 0` fails. One branch is a string, the other a number.
- Complex branches can need `tostring()` or `tonumber()` to make the types match.
- `merge()` is not deep. The second map's `a` replaces the first map's `a` completely.
- Interpolation converts a non-string with no error. `"count: ${5}"` gives `"count: 5"`, which can hide a type mistake.
- `toset()` drops the order and the duplicates. Do not use it when the order matters.

## The task

Compute derived values in a `locals` block. A local is a name assigned to an expression. Concept 05 covers locals in depth.

1. Declare `variable "environment"` with type `string` and default `"staging"`.
2. Declare `variable "project"` with type `string` and default `"myapp"`.
3. Declare `variable "region"` with type `string` and default `"us-east-1"`.
4. `local.bucket_name` uses `${}` interpolation to combine `var.project` and `var.environment`.
5. `local.instance_type` is `"t3.large"` when `var.environment == "production"`. Otherwise it is `"t3.micro"`.
6. `local.common_tags` uses `merge(...)` on `{ Project = var.project }` and `{ Environment = var.environment }`.
7. `local.az_set` applies `toset(...)` to `["us-east-1a", "us-east-1b", "us-east-1a"]`.
8. `output "bucket_name"` has `value = local.bucket_name`.
9. `output "instance_type"` has `value = local.instance_type`.

With the defaults, the values are:

```hcl
# For example:
# bucket_name = "myapp-staging-assets"
# instance_type = "t3.micro"
# common_tags = {
#   Project     = "myapp"
#   Environment = "staging"
# }
# az_set = ["us-east-1a", "us-east-1b"]

variable "environment" {
  # type, default
}

variable "project" {
  # type, default
}

variable "region" {
  # type, default
}

locals {
  # bucket_name, instance_type,
  # common_tags, az_set
}

output "bucket_name" {
  # value
}

output "instance_type" {
  # value
}
```
