# Modules

## What you'll learn

How Terraform modules package reusable infrastructure patterns, how to call them with `module` blocks, and how data flows in (variables) and out (outputs).

## Key concepts

### What a module is

Any directory containing `.tf` files is a module. The directory you run `terraform apply` in is the **root module**. Subdirectories you call with `module` blocks are **child modules**.

A well-structured module looks like:

```
modules/
  vpc/
    main.tf       # resources
    variables.tf  # input variables
    outputs.tf    # output values
```

### Calling a module

```hcl
module "network" {
  source = "./modules/vpc"

  # Pass values to the module's variables
  cidr_block  = "10.0.0.0/16"
  environment = var.environment
  project     = var.project
}
```

After calling the module, access its outputs with `module.<name>.<output_name>`:

```hcl
resource "aws_instance" "app" {
  subnet_id = module.network.public_subnet_id
  vpc_security_group_ids = [module.network.app_sg_id]
}
```

### Module sources

```hcl
# Local path
source = "./modules/vpc"

# Public Terraform Registry (namespace/module/provider)
source  = "terraform-aws-modules/vpc/aws"
version = "~> 5.0"

# Git
source = "git::https://github.com/myorg/tf-modules.git//vpc?ref=v2.1.0"

# GitHub shorthand
source = "github.com/myorg/tf-modules//vpc"
```

Registry modules work exactly like local ones — `module` block, pass variables, consume outputs. The `version` constraint follows the same semver syntax as provider versions.

### Module composition

Modules can call other modules. A common pattern stacks a low-level `vpc` module under a higher-level `network` module:

```hcl
# modules/network/main.tf
module "vpc" {
  source     = "../vpc"
  cidr_block = var.cidr_block
}

module "subnets" {
  source = "../subnets"
  vpc_id = module.vpc.vpc_id
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
```

### Module versioning discipline

- Always pin registry modules with `version`. Unpinned modules will upgrade on `terraform init -upgrade` and break unexpectedly.
- Use `~>` for minor-version ranges: `"~> 5.1"` allows `5.x` but not `6.0`.
- Local modules don't need version pinning — they're versioned with your repo.

## vs other tools

| Tool | Reuse mechanism |
|------|----------------|
| **CloudFormation** | Nested stacks (an S3 URL per template) — stateful, harder to test in isolation |
| **Pulumi** | Component resources (classes in your language) — natural for devs, less portable |
| **Helm** | Charts — package Kubernetes manifests; no resource graph, no plan |
| **Ansible** | Roles — good for configuration management, not declarative infra |

Terraform's module registry (`registry.terraform.io`) is the largest catalog of vetted, community-maintained infra patterns. Most teams start there before writing modules from scratch.

## The task

Write a Terraform root module configuration that:

1. Calls a local module at `./modules/vpc` named `"network"`, passing:
   - `cidr_block = "10.0.0.0/16"`
   - `environment = var.environment`
   - `project     = var.project`
2. Calls the registry module `"terraform-aws-modules/vpc/aws"` named `"managed_vpc"` at version `"~> 5.0"`, passing `name = "managed"` and `cidr = "10.1.0.0/16"`.
3. Declares `variable "environment"` (string, default `"staging"`) and `variable "project"` (string, default `"myapp"`).
4. Declares an `output "vpc_id"` that outputs `module.network.vpc_id`.
5. Declares an `output "managed_vpc_id"` that outputs `module.managed_vpc.vpc_id`.
