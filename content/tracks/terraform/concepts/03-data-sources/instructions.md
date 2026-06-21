# Data Sources

## What you'll learn

How `data` blocks let you read existing infrastructure — things Terraform didn't create and shouldn't destroy — and thread that information into resources you do manage.

## Key concepts

### `data` vs `resource`

The distinction is ownership:

- `resource` blocks declare objects Terraform **creates, updates, and destroys**.
- `data` blocks are **read-only lookups** — Terraform queries the provider's API during plan and returns the result. No apply needed.

A common pattern: you manage your application infra in Terraform, but your networking team owns the VPC. You look it up via a data source rather than hardcoding IDs.

### Basic data source syntax

```hcl
data "aws_vpc" "shared" {
  filter {
    name   = "tag:Name"
    values = ["shared-network-vpc"]
  }
}
```

The two labels are `<type>` and `<name>`. Reference attributes with `data.<type>.<name>.<attribute>`:

```hcl
resource "aws_subnet" "app" {
  vpc_id     = data.aws_vpc.shared.id
  cidr_block = "10.1.0.0/24"
}
```

### Lookup by ID

When you know the exact ID, skip the filter:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}
```

Then: `ami = data.aws_ami.ubuntu.id`

### Data sources execute during plan

Unlike resources, data sources are read during `terraform plan`, not `terraform apply`. This means if a data source targets something that doesn't exist yet, plan fails. You can defer execution with `depends_on` (covered in concept 05) or the `lifecycle { postcondition {} }` block.

### `terraform_remote_state` — a special data source

This reads outputs from another Terraform state file, letting root modules share data without coupling their configs:

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-tf-state"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id
}
```

## vs other tools

| Tool | Equivalent |
|------|-----------|
| **CloudFormation** | `Fn::ImportValue` reads exported stack outputs — tightly coupled to CF stacks only |
| **Pulumi** | `StackReference` for cross-stack state; provider SDKs have `get*` functions for read-only lookups |
| **Ansible** | `gather_facts` + `ec2_instance_info` tasks — imperative, runs at task execution time |

Terraform's data sources are cleaner than CloudFormation's cross-stack exports because they can query arbitrary provider APIs, not just other CF stacks.

## The task

Write a Terraform configuration that:

1. Declares a `data "aws_vpc" "main"` block that filters by tag `Name` = `"production-vpc"`.
2. Declares a `data "aws_ami" "ubuntu"` block that sets `most_recent = true`, filters `owners` to `["099720109477"]`, and filters by `name` pattern `"ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"`.
3. Declares an `aws_instance` resource named `"web"` that:
   - Sets `ami` from `data.aws_ami.ubuntu.id`
   - Sets `instance_type = "t3.micro"`
   - Sets `subnet_id` from a sub-filter on `data.aws_vpc.main` — specifically reference `data.aws_vpc.main.id` as a value in the resource (in `tags` is fine if subnet filtering isn't applicable).
4. Declares an `output "vpc_id"` that outputs `data.aws_vpc.main.id`.
