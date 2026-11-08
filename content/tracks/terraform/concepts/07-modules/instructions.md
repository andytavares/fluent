## What you build

You write a root module that uses two VPC modules: a local one and one from the public Terraform Registry. Modules package reusable infrastructure; variables go in and outputs come out. This lesson builds on **count & for_each**.

## Key concepts

### A module is a directory of `.tf` files

The directory where you run `terraform apply` is the **root module**. A directory that a `module` block calls is a **child module**.

```
modules/
  vpc/
    # resources
    main.tf
    # input variables
    variables.tf
    # output values
    outputs.tf
```

### A `module` block calls a module

```hcl
module "network" {
  source = "./modules/vpc"

  # Values for the module's variables
  cidr_block  = "10.0.0.0/16"
  environment = var.environment
  project     = var.project
}
```

Read an output of the module with `module.<name>.<output_name>`.

```hcl
resource "aws_instance" "app" {
  subnet_id = module.network.subnet_id
  vpc_security_group_ids = [
    module.network.app_sg_id,
  ]
}
```

### `source` says where the module comes from

```hcl
# A local path
source = "./modules/vpc"

# The public registry:
# namespace/name/provider
source  = "terraform-aws-modules/vpc/aws"
version = "~> 5.0"

# GitHub shorthand
source = "github.com/myorg/tf-modules//vpc"
```

A Git source names the repository, a subdirectory after `//` and a tag in `ref`: `git::https://github.com/myorg/tf-modules.git//vpc?ref=v2.1.0`.

You use a registry module the same way as a local one. The `version` constraint has the same syntax as a provider version.

### A module can call other modules

A common pattern puts a low-level `vpc` module under a higher-level `network` module.

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

### Pin every registry module

- Always set `version` on a registry module. Without it, `terraform init -upgrade` installs a new version that can break the configuration.
- `"~> 5.1"` allows any `5.x` from `5.1`, but not `6.0`.
- A local module needs no version. Your repository versions it.

Most teams look in the registry at `registry.terraform.io` before they write a module. CloudFormation reuses templates with nested stacks; Helm charts package Kubernetes manifests with no plan.

## Watch out

- A `module` block has one label, not two. The `source` gives the module its identity.
- `version` works only with a registry source. A module from a local path does not support it.
- Run `terraform init` after you add or change a `module` block. Init copies the source into `.terraform/modules/`.
- The caller reads only the outputs the module declares. `module.network.vpc_id` needs `output "vpc_id"` inside the module.

## The task

Write a root module that uses two VPC modules. One is local; your team maintains it. One comes from the public registry.

1. Declare `variable "environment"` with type string and default `"staging"`.
2. Declare `variable "project"` with type string and default `"myapp"`.
3. `module "network"` has `source = "./modules/vpc"`.
4. It passes `cidr_block = "10.0.0.0/16"`, `environment = var.environment` and `project = var.project`.
5. `module "managed_vpc"` has `source = "terraform-aws-modules/vpc/aws"` and `version = "~> 5.0"`.
6. It passes `name = "managed"` and `cidr = "10.1.0.0/16"`.
7. `output "vpc_id"` has `value = module.network.vpc_id`.
8. `output "managed_vpc_id"` has `value = module.managed_vpc.vpc_id`.

```hcl
variable "environment" {
  # type, default
}

variable "project" {
  # type, default
}

module "network" {
  # source: a local path
  # cidr_block, environment, project
}

module "managed_vpc" {
  # source: a registry address
  # version
  name = "managed"
  # cidr
}

output "vpc_id" {
  # value from module.network
}

output "managed_vpc_id" {
  # value from module.managed_vpc
}
```
