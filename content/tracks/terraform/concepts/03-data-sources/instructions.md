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

## Watch out

- **`data` blocks read during plan, not apply.** If the object your `filter` targets doesn't exist yet — including one being created earlier in the *same* apply — the plan fails with "no matching resource found." Data sources are for things that already exist independently of this run.
- **`filter` is itself a nested block, not an attribute.** `filter { name = "..." ; values = [...] }` — you can repeat the `filter` block multiple times inside one `data` block to AND multiple conditions together.
- **Data source attributes are read-only outputs of a query, not something you set.** You never write `ami = "ami-123"` inside a `data "aws_ami"` block — you write filter *criteria*, and the provider returns attributes like `id` for you to reference elsewhere.
- **Referencing `data.<type>.<name>.<attr>`** looks just like a resource reference (`data.` prefix instead of nothing) — mixing them up (writing `aws_vpc.main.id` when you meant `data.aws_vpc.main.id`) is a common typo that produces "undeclared resource."

## The task

You're wiring an EC2 instance to infrastructure your team doesn't own: an existing VPC (looked up by tag) and the latest Ubuntu AMI (looked up by owner + name pattern).

```hcl
data "aws_vpc" "main" {
  filter {
    # name and values go here
  }
}

data "aws_ami" "ubuntu" {
  # most_recent, owners go here

  filter {
    # name and values go here
  }
}

resource "aws_instance" "web" {
  # ami (from the data source), instance_type, and a tag referencing the VPC lookup go here
}

output "vpc_id" {
  # value goes here
}
```

Fill it in so that:

1. `data "aws_vpc" "main"` has a `filter` block matching tag `Name` = `"production-vpc"` (i.e. `name = "tag:Name"`, `values = ["production-vpc"]`).
2. `data "aws_ami" "ubuntu"` sets `most_recent = true`, `owners = ["099720109477"]` (Canonical's account ID), and a `filter` block matching `name = "name"`, `values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]`.
3. `resource "aws_instance" "web"` sets `ami = data.aws_ami.ubuntu.id` (a reference, not a hardcoded AMI ID), `instance_type = "t3.micro"`, and a `tags` map containing a key (e.g. `VpcId`) whose value is `data.aws_vpc.main.id`.
4. `output "vpc_id"` has `value = data.aws_vpc.main.id`.
