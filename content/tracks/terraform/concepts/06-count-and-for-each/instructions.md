# count & for_each

## What you'll learn

How to create multiple instances of a resource from a single block using `count` (index-based) and `for_each` (key-based), and why the choice matters when resources are added or removed mid-list.

## Key concepts

### `count`

```hcl
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-${count.index}"
  }
}
```

This creates three instances addressed as `aws_instance.web[0]`, `aws_instance.web[1]`, `aws_instance.web[2]`.

`count` can also be used as a boolean — `count = var.enable_monitoring ? 1 : 0` creates the resource conditionally.

**The problem with count and lists:** if you remove `web-1` from the middle of a list, Terraform renumbers everything after it. `web[2]` becomes `web[1]`, which Terraform interprets as a destroy + recreate. This causes unintended churn.

### `for_each`

```hcl
variable "buckets" {
  type    = set(string)
  default = ["raw", "processed", "archive"]
}

resource "aws_s3_bucket" "data" {
  for_each = var.buckets
  bucket   = "myapp-${each.key}"

  tags = {
    Purpose = each.value  # for sets, each.key == each.value
  }
}
```

Instances are addressed by key: `aws_s3_bucket.data["raw"]`, `aws_s3_bucket.data["processed"]`. Removing `"raw"` from the set destroys only that bucket — others are untouched.

### `for_each` with maps

```hcl
variable "environments" {
  type = map(string)
  default = {
    staging    = "t3.micro"
    production = "t3.large"
  }
}

resource "aws_instance" "env" {
  for_each      = var.environments
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

`each.key` is the map key (`"staging"`), `each.value` is the map value (`"t3.micro"`).

### `toset()` before `for_each`

`for_each` requires a `set` or `map` — not a `list`. Lists can contain duplicates and maintain order, which doesn't map cleanly to HCL's keyed instances. Convert with `toset()`:

```hcl
for_each = toset(var.availability_zones)
```

### When to use which

| Situation | Use |
|-----------|-----|
| N identical resources (e.g., 3 replicas) | `count` |
| Resources differ by a stable identifier | `for_each` |
| Optional resource (0 or 1) | `count = condition ? 1 : 0` |
| Resources from a map of config | `for_each` with map |

Default to `for_each` for anything keyed by a name or ID. Use `count` only when the resources are truly interchangeable.

## vs other tools

| Tool | Multiple resources |
|------|-------------------|
| **CloudFormation** | No native loops — use nested stacks or macros (complex); condition functions for optional resources |
| **Pulumi** | Normal `for` loops in code; much more natural, but mixes infrastructure and application logic |
| **Helm** | `{{- range .Values.items }}` Go template loops — string rendering only |
| **Bicep** | `[for item in items: { ... }]` — similar to Terraform's for expression |

Terraform's `for_each` is more stable than `count` for the same reason database rows have primary keys instead of sequence numbers.

## Watch out

- **`for_each` requires a `set(string)` or `map`, never a `list`.** Passing a `list(string)` variable straight to `for_each` is a plan-time error — wrap it in `toset()` first (or restructure it as a map if you need keys and values that differ).
- **Inside a `for_each` block, `each.key` and `each.value` — not `count.index`.** Inside a `count` block, `count.index` — not `each.key`. Mixing the two vocabularies up is the single most common error when converting one to the other.
- **For a `set(string)`, `each.key == each.value`** (both are the string itself). For a `map`, they differ: `each.key` is the map key, `each.value` is the value at that key. Know which one you're iterating before reaching for `each.value`.
- **`count.index` is a plain 0-based integer**, with no guaranteed stable identity — removing `aws_eip.nat[0]` shifts every later resource's index down by one, which Terraform treats as destroying and recreating them. This is exactly the "count churn" problem the Key concepts section describes.

## The task

You're provisioning three kinds of repeated resources that each call for a different multiplicity strategy: subnets keyed by name, instances keyed by environment, and interchangeable Elastic IPs.

```hcl
variable "subnet_names" {
  # type = set(string), default = toset([...])
}

variable "environments" {
  # type = map(string), default = { ... }
}

resource "aws_subnet" "app" {
  for_each = ...  # var.subnet_names

  vpc_id     = "vpc-placeholder"
  cidr_block = "..." # uses each.key

  tags = {
    Name = ... # each.key
  }
}

resource "aws_instance" "env" {
  for_each = ...  # var.environments

  ami           = "ami-placeholder"
  instance_type = ... # each.value

  tags = {
    Name = ... # each.key
  }
}

resource "aws_eip" "nat" {
  count = ... # 2

  tags = {
    Index = ... # count.index
  }
}
```

Fill it in so that:

1. `variable "subnet_names"` has `type = set(string)` and default `toset(["public", "private", "data"])`.
2. `variable "environments"` has `type = map(string)` and a default mapping `staging` to `"t3.micro"` and `production` to `"t3.large"`.
3. `resource "aws_subnet" "app"` uses `for_each = var.subnet_names`, sets `vpc_id = "vpc-placeholder"`, a `cidr_block` that incorporates `each.key` somehow (any pattern that's valid HCL is fine — the point is using the key, not a specific CIDR), and a tag `Name = each.key`.
4. `resource "aws_instance" "env"` uses `for_each = var.environments`, sets `ami = "ami-placeholder"`, `instance_type = each.value`, and a tag `Name = each.key`.
5. `resource "aws_eip" "nat"` uses `count = 2` and a tag `Index = count.index`.
