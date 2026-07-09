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

## Watch out

- **`module` blocks have one label, not two.** `module "network" { ... }` — unlike `resource`/`data`, there's no separate "type" label; the module's identity comes entirely from its `source`.
- **`version` is only valid (and only meaningful) for registry sources.** A local path (`./modules/vpc`) has no version — it's whatever's on disk. Adding `version` to a local module source is a no-op at best, an error in some Terraform versions.
- **You must `terraform init` after adding or changing a module block** — Terraform downloads/copies the module source into `.terraform/modules/` during init, not during plan.
- **A module's outputs must be declared inside the module itself** to be readable from the caller. `module.network.vpc_id` only resolves if `modules/vpc/outputs.tf` has `output "vpc_id" { ... }` — the caller can't reach into the module's resources directly.

## The task

You're writing a root module that composes two VPCs: one from a local module your team maintains, one from the public Terraform Registry.

```hcl
variable "environment" {
  # type = string, default = "staging"
}

variable "project" {
  # type = string, default = "myapp"
}

module "network" {
  source = "..." # local path

  cidr_block  = "..."
  environment = ...
  project     = ...
}

module "managed_vpc" {
  source  = "..." # registry source
  version = "..."

  name = "managed"
  cidr = "..."
}

output "vpc_id" {
  # value from module.network
}

output "managed_vpc_id" {
  # value from module.managed_vpc
}
```

Fill it in so that:

1. `module "network"` has `source = "./modules/vpc"` and passes `cidr_block = "10.0.0.0/16"`, `environment = var.environment`, `project = var.project`.
2. `module "managed_vpc"` has `source = "terraform-aws-modules/vpc/aws"`, `version = "~> 5.0"`, and passes `name = "managed"`, `cidr = "10.1.0.0/16"`.
3. `variable "environment"` (string, default `"staging"`) and `variable "project"` (string, default `"myapp"`) are declared.
4. `output "vpc_id"` has `value = module.network.vpc_id`.
5. `output "managed_vpc_id"` has `value = module.managed_vpc.vpc_id`.
