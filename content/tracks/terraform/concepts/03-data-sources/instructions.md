## What you build

You connect an EC2 instance to infrastructure your team does not own: an existing VPC and the latest Ubuntu AMI. `data` blocks read objects that Terraform did not create and must not destroy. This lesson builds on **Variables & Outputs**.

## Key concepts

### `data` reads, `resource` owns

- A `resource` block declares an object that Terraform **creates, updates and destroys**.
- A `data` block is a **read-only lookup**. Terraform queries the provider's API and returns the result.

A common case: your team manages the application, but the network team owns the VPC. You look up the VPC with a data source instead of hardcoding its ID.

### A `filter` block selects the object

```hcl
data "aws_vpc" "shared" {
  filter {
    name   = "tag:Name"
    values = ["shared-network-vpc"]
  }
}
```

The two labels are `<type>` and `<name>`. Read an attribute with `data.<type>.<name>.<attribute>`.

```hcl
resource "aws_subnet" "app" {
  vpc_id     = data.aws_vpc.shared.id
  cidr_block = "10.1.0.0/24"
}
```

### Owners and a name pattern find an AMI

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  # Canonical
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}
```

A resource then uses `ami = data.aws_ami.ubuntu.id`.

### Terraform reads data sources during plan

Terraform reads a data source during `terraform plan`, not `terraform apply`. It defers the read to apply when an argument depends on a value known only at apply time. `depends_on` also defers the read until its dependencies finish. Concept 05 covers `depends_on`.

### `terraform_remote_state` reads another state

This special data source reads the outputs of another state file. Root modules share data without sharing configuration.

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
  # HCL ignores newlines inside parentheses
  subnet_id = (
    data.terraform_remote_state.network
    .outputs.public_subnet_id
  )
}
```

CloudFormation's `Fn::ImportValue` reads only other stacks' exports; a Terraform data source can query any provider API.

## Watch out

- A data source with literal arguments reads during plan. If the object does not exist yet, the plan fails.
- Use data sources for objects that exist independently of this run.
- `filter` is a nested block, not an attribute. Repeat it to combine conditions with AND.
- You do not set attributes such as `id` in a `data` block. You write criteria, and the provider returns the attributes.
- A data reference needs the `data.` prefix. `aws_vpc.main.id` for a data source gives "undeclared resource".

## The task

Connect an EC2 instance to an existing VPC and the latest Ubuntu AMI. Look up the VPC by tag, and the AMI by owner and name pattern.

1. `data "aws_vpc" "main"` has a `filter` block with `name = "tag:Name"` and `values = ["production-vpc"]`.
2. `data "aws_ami" "ubuntu"` sets `most_recent = true`.
3. It sets `owners = ["099720109477"]`. This is the account ID of Canonical.
4. It has a `filter` block with `name = "name"` and this name pattern in `values`: `"ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"`.
5. `resource "aws_instance" "web"` sets `ami = data.aws_ami.ubuntu.id`. Do not hardcode an AMI ID.
6. It sets `instance_type = "t3.micro"`.
7. It has a `tags` map with one key, for example `VpcId`, set to `data.aws_vpc.main.id`.
8. `output "vpc_id"` has `value = data.aws_vpc.main.id`.

```hcl
data "aws_vpc" "main" {
  filter {
    # name, values
  }
}

data "aws_ami" "ubuntu" {
  # most_recent, owners

  filter {
    # name, values
  }
}

resource "aws_instance" "web" {
  # ami, instance_type, tags
}

output "vpc_id" {
  # value
}
```
