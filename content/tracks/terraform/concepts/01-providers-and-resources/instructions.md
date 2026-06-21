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

## The task

Write a Terraform configuration that:

1. Declares a `terraform {}` block requiring the `hashicorp/aws` provider at version `~> 5.0` and Terraform itself at `>= 1.5.0`.
2. Configures the `aws` provider with `region = "us-west-2"`.
3. Declares an `aws_vpc` resource named `"main"` with:
   - `cidr_block = "10.0.0.0/16"`
   - A `tags` map containing `Name = "main-vpc"` and `Environment = "production"`.
4. Declares an `aws_subnet` resource named `"public"` that references `aws_vpc.main.id` as its `vpc_id` and uses `cidr_block = "10.0.1.0/24"`.
