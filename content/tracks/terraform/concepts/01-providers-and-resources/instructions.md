# Providers & Resources

## What you'll learn

How Terraform structures a configuration: the `terraform {}` block pins your provider versions, the `provider` block configures credentials and regions, and `resource` blocks declare the infrastructure objects you want to exist.

## Key concepts

### The `terraform {}` block

Every root module should declare which providers it needs and what versions are acceptable. Terraform downloads matching plugins from the registry during `terraform init`.

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

The `source` string is `<namespace>/<type>` — defaults to the public registry at `registry.terraform.io`. Private registries use `<hostname>/<namespace>/<type>`.

### The `provider` block

Configures the provider plugin itself — region, credentials, assumed role, etc. Most real configs pull sensitive values from environment variables rather than hardcoding them here.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

You can declare multiple configurations of the same provider using `alias` and reference them with `provider = aws.secondary` on a resource.

### The `resource` block

The fundamental unit of Terraform. A resource block declares one infrastructure object:

```hcl
resource "aws_s3_bucket" "logs" {
  bucket = "my-app-logs-prod"

  tags = {
    Environment = "production"
    Team        = "platform"
  }
}
```

The two labels are `<type>` and `<name>`. Together they form the **resource address**: `aws_s3_bucket.logs`. Every attribute you set becomes an argument sent to the provider's API. Attributes the provider returns (like ARNs) become **exported attributes** you can reference elsewhere.

### Referencing a resource

```hcl
resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

`aws_s3_bucket.logs.id` is a **resource reference** — Terraform automatically creates an implicit dependency and applies `aws_s3_bucket.logs` first.

## vs other tools

| Tool | Mental model |
|------|-------------|
| **CloudFormation** | YAML/JSON templates; providers are baked in (AWS only); stack drift is harder to detect |
| **Pulumi** | Same graph model, but resources are objects in a real programming language (TS/Python/Go); no HCL |
| **Ansible** | Procedural playbooks; not declarative — order of tasks matters; weak drift detection |
| **CDK** | Compiles to CloudFormation; type-safe but tied to AWS and CF's limitations |

Terraform's key difference: the **plan** step separates intent from execution. You always see an exact diff before anything is created, changed, or destroyed.

## Watch out

- **Two labels, not one.** `resource "aws_vpc" "main"` — the first string is always the resource *type* (defined by the provider), the second is *your* name for this instance. Swap them or drop one and it's a parse error.
- **Version constraints are strings.** `version = ~> 5.0` (unquoted) is invalid HCL — it must be `version = "~> 5.0"`. Every scalar value in HCL follows this: strings need quotes, `true`/`false`/numbers don't.
- **References only work between declared resources.** `aws_vpc.main.id` resolves only if a `resource "aws_vpc" "main"` block exists in the same module. Typo the name and Terraform reports "reference to undeclared resource" at plan time — not a silent null.
- **`required_providers` lives inside `terraform {}`**, not beside it. A top-level `required_providers {}` block outside `terraform {}` is simply ignored (and, in recent Terraform versions, a parse error).

## The task

You're writing the root module for a small AWS network — the file `terraform init` / `plan` / `apply` would run against. Structure it like this:

```hcl
terraform {
  # required_version and required_providers go here
}

provider "aws" {
  # region goes here
}

resource "aws_vpc" "main" {
  # cidr_block and tags go here
}

resource "aws_subnet" "public" {
  # vpc_id (a reference to the VPC) and cidr_block go here
}
```

Fill it in so that:

1. The `terraform {}` block requires Terraform `>= 1.5.0` and the `hashicorp/aws` provider (`source = "hashicorp/aws"`) at version `~> 5.0`.
2. The `aws` provider block sets `region = "us-west-2"`.
3. `resource "aws_vpc" "main"` sets `cidr_block = "10.0.0.0/16"` and a `tags` map containing `Name = "main-vpc"` and `Environment = "production"`.
4. `resource "aws_subnet" "public"` sets `vpc_id` to a **reference** to the VPC's exported `id` attribute (`aws_vpc.main.id` — not a hardcoded string) and `cidr_block = "10.0.1.0/24"`.
