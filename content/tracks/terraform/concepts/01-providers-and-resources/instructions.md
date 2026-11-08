## What you build

You write the root module for a small AWS network: a `terraform {}` block, an `aws` provider, a VPC and a subnet. The root module is the directory you run `terraform init`, `plan` and `apply` in.

## Key concepts

### The `terraform {}` block pins versions

Every root module declares the providers it needs and the versions it accepts. Terraform downloads matching provider plugins from the registry during `terraform init`.

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

The `source` string is `<namespace>/<type>`. Terraform looks it up in the public registry at `registry.terraform.io`. A private registry uses `<hostname>/<namespace>/<type>`.

### The `provider` block configures the plugin

The `provider` block sets the region, the credentials and the role to assume. Most real configurations read sensitive values from environment variables, not from this block.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

To use two configurations of one provider, give the second one an `alias`. A resource then selects it with `provider = aws.secondary`.

### A `resource` block declares one object

The resource is the basic unit of Terraform. Each block declares one infrastructure object.

```hcl
resource "aws_s3_bucket" "logs" {
  bucket = "my-app-logs-prod"

  tags = {
    Environment = "production"
    Team        = "platform"
  }
}
```

The two labels are `<type>` and `<name>`. Together they form the **resource address**, here `aws_s3_bucket.logs`. Terraform sends each argument you set to the provider's API. The values the provider returns, such as ARNs, are **exported attributes**.

### A reference creates a dependency

Use `<type>.<name>.<attribute>` to read an exported attribute of another resource.

```hcl
resource "aws_s3_bucket_versioning" "log" {
  bucket = aws_s3_bucket.logs.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

`aws_s3_bucket.logs.id` is a **resource reference**. Terraform adds an implicit dependency and creates `aws_s3_bucket.logs` first.

### The plan shows the change before it happens

`terraform plan` separates intent from execution. You see the exact diff before Terraform creates, changes or destroys anything. CloudFormation, Pulumi, Ansible and CDK manage infrastructure too, but Ansible runs ordered procedural tasks, and CloudFormation and CDK support AWS only.

## Watch out

- A resource has two labels. The first is the type from the provider; the second is your name. Drop one and Terraform reports a parse error.
- Version constraints are strings. `version = ~> 5.0` without quotes is invalid HCL. Write `version = "~> 5.0"`.
- Strings need quotes in HCL. `true`, `false` and numbers do not.
- A reference works only if the resource block exists in the same module. A typo gives "reference to undeclared resource" at plan time.
- `required_providers` goes inside `terraform {}`, not beside it.

## The task

Write the root module for a small AWS network. Use this structure:

1. The `terraform {}` block requires Terraform `>= 1.5.0`.
2. It also requires the `aws` provider with `source = "hashicorp/aws"` and version `"~> 5.0"`.
3. The `aws` provider block sets `region = "us-west-2"`.
4. `resource "aws_vpc" "main"` sets `cidr_block = "10.0.0.0/16"`.
5. The VPC has a `tags` map with `Name = "main-vpc"` and `Environment = "production"`.
6. `resource "aws_subnet" "public"` sets `cidr_block = "10.0.1.0/24"`.
7. The subnet sets `vpc_id = aws_vpc.main.id`. Use the reference, not a hardcoded ID string.

```hcl
terraform {
  # required_version, required_providers
}

provider "aws" {
  # region
}

resource "aws_vpc" "main" {
  # cidr_block, tags
}

resource "aws_subnet" "public" {
  # vpc_id (a reference), cidr_block
}
```
