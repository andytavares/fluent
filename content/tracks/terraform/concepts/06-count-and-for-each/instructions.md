## What you build

You create repeated resources three ways: subnets keyed by name, instances keyed by environment, and identical Elastic IPs. `count` gives index-based instances, and `for_each` gives key-based instances. This lesson builds on **Locals & depends_on**.

## Key concepts

### `count` makes N numbered instances

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

The addresses are `aws_instance.web[0]`, `aws_instance.web[1]` and `aws_instance.web[2]`.

`count = var.enable_monitoring ? 1 : 0` creates the resource only when the condition is true.

### Removing from the middle renumbers `count`

Remove `web-1` from the middle of a list, and every later index shifts down. `web[2]` becomes `web[1]`. Terraform destroys and recreates those instances.

### `for_each` makes one instance per key

```hcl
variable "buckets" {
  type = set(string)
  default = [
    "raw", "processed", "archive",
  ]
}

resource "aws_s3_bucket" "data" {
  for_each = var.buckets
  bucket   = "myapp-${each.key}"

  tags = {
    # For a set, each.key == each.value
    Purpose = each.value
  }
}
```

The addresses use the key: `aws_s3_bucket.data["raw"]` and `aws_s3_bucket.data["processed"]`. Remove `"raw"`, and Terraform destroys only that bucket.

### `for_each` over a map gives keys and values

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

`each.key` is the map key, `"staging"`. `each.value` is the map value, `"t3.micro"`.

### `toset()` turns a list into a set

`for_each` needs a set or a map, not a list. A list can hold duplicates and has an order, so it does not map to keyed instances.

```hcl
for_each = toset(var.availability_zones)
```

### Choose by identity

| Situation | Use |
|-----------|-----|
| N identical resources | `count` |
| A stable name or ID | `for_each` |
| An optional resource | `count = cond ? 1 : 0` |
| A map of configuration | `for_each` on a map |

Use `for_each` for anything keyed by a name or an ID. Use `count` only for interchangeable resources. Database rows use primary keys instead of sequence numbers for the same reason.

## Watch out

- `for_each` on a `list(string)` fails at plan time. Wrap the list in `toset()`, or use a map.
- Inside `for_each`, use `each.key` and `each.value`. Inside `count`, use `count.index`. Mixing them is the most common error.
- For a set, `each.key` equals `each.value`. For a map, they differ.
- `count.index` is a 0-based integer with no stable identity. Removing `aws_eip.nat[0]` recreates every later instance.
- A variable `default` must be a literal value. Write `["public"]`, not `toset(["public"])`. The `type` converts it.

## The task

Create three kinds of repeated resources. Each one uses a different way to repeat.

1. `variable "subnet_names"` has `type = set(string)`.
2. Its default is `["public", "private", "data"]`.
3. `variable "environments"` has `type = map(string)`.
4. Its default maps `staging` to `"t3.micro"` and `production` to `"t3.large"`.
5. `resource "aws_subnet" "app"` uses `for_each = var.subnet_names` and sets `vpc_id = "vpc-placeholder"`.
6. Its `cidr_block` uses `each.key`. Any valid HCL pattern is correct.
7. The subnet has a tag `Name = each.key`.
8. `resource "aws_instance" "env"` uses `for_each = var.environments`.
9. It sets `ami = "ami-placeholder"` and `instance_type = each.value`.
10. The instance has a tag `Name = each.key`.
11. `resource "aws_eip" "nat"` uses `count = 2` and a tag `Index = count.index`.

```hcl
variable "subnet_names" {
  # type, default
}

variable "environments" {
  # type, default
}

resource "aws_subnet" "app" {
  # for_each
  vpc_id = "vpc-placeholder"
  # cidr_block with each.key
  # tags: Name = each.key
}

resource "aws_instance" "env" {
  # for_each
  ami = "ami-placeholder"
  # instance_type = each.value
  # tags: Name = each.key
}

resource "aws_eip" "nat" {
  # count = 2
  # tags: Index = count.index
}
```
