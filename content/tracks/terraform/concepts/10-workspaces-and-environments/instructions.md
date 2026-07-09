# Workspaces & Environments

## What you'll learn

How Terraform workspaces let one configuration manage multiple isolated state files, when workspaces are the right tool for environment separation, and when separate root modules are a better answer.

## Key concepts

### What a workspace is

A workspace is an isolated state file within the same backend. Each workspace has its own `terraform.tfstate`. When you run `terraform apply` in workspace `staging`, it uses a different state than workspace `production` — even though the config files are identical.

```bash
# See current workspace (default: "default")
terraform workspace list

# Create and switch to a new workspace
terraform workspace new staging
terraform workspace new production

# Switch between existing workspaces
terraform workspace select staging

# Delete a workspace (state must be empty first)
terraform workspace delete staging
```

### `terraform.workspace`

Inside HCL, read the current workspace name with `terraform.workspace`:

```hcl
locals {
  environment  = terraform.workspace
  name_prefix  = "myapp-${terraform.workspace}"
  is_prod      = terraform.workspace == "production"

  instance_type = terraform.workspace == "production" ? "t3.large" : "t3.micro"
}

resource "aws_instance" "app" {
  instance_type = local.instance_type
  ami           = "ami-0c55b159cbfafe1f0"

  tags = {
    Environment = local.environment
    Name        = "${local.name_prefix}-app"
  }
}
```

### Workspaces on S3

With an S3 backend, workspaces are stored at:
```
s3://bucket/path/to/terraform.tfstate            # default workspace
s3://bucket/env:/staging/path/to/terraform.tfstate
s3://bucket/env:/production/path/to/terraform.tfstate
```

### When to use workspaces — and when not to

**Good fit for workspaces:**
- Short-lived per-PR preview environments (create workspace, apply, destroy, delete workspace)
- Small teams where staging and production are nearly identical configs
- Ephemeral test environments spun up in CI

**Use separate root modules instead when:**
- Environments differ significantly in resource counts, providers, or topology
- You need independent state locking (one bad production apply shouldn't affect staging state)
- Different teams own different environments
- You want explicit `terraform apply -var-file=production.tfvars` review gates

The common anti-pattern: using workspaces to manage fundamentally different infrastructure. If you find yourself writing `if terraform.workspace == "production"` more than two or three times, you likely want separate root modules.

### Environment isolation patterns

Two dominant approaches in practice:

**Option 1 — Workspaces (same config):**
```
infra/
  main.tf
  variables.tf
# Operated with: terraform workspace select production && terraform apply
```

**Option 2 — Separate root modules (different dirs):**
```
infra/
  staging/
    main.tf
    terraform.tfvars
  production/
    main.tf
    terraform.tfvars
```

Option 2 gives you independent blast radius, independent state locking, and the ability to use `terraform plan` in staging before applying the same config in production — with PR reviews per environment.

## vs other tools

| Tool | Environment separation |
|------|----------------------|
| **CloudFormation** | Stack names + parameter files; each stack is naturally isolated |
| **Pulumi** | Stack per environment (`pulumi stack init production`); conceptually identical to TF workspaces |
| **Helm** | `--namespace` + separate `values-*.yaml` files per environment |
| **Kustomize** | Overlay directories per environment — closest analog to the "separate roots" pattern |

Pulumi stacks and Terraform workspaces are the same concept. The ergonomics differ: Pulumi stacks are more first-class in the CLI; Terraform workspaces are tacked on and not supported in every backend.

## Watch out

- **`terraform.workspace` is a top-level expression, not `var.workspace` or `local.workspace`.** There's no variable to declare for it — it's built into the language, always available, and always reflects whichever workspace is currently selected.
- **The default workspace is literally named `"default"`,** not `""` or `"prod"`. If you never run `terraform workspace new`, every apply happens in `"default"` — check for that name explicitly if your logic needs to special-case "no workspace selected yet."
- **Overusing `terraform.workspace == "production"` conditionals is the anti-pattern this concept warns about.** Once you're threading three or more such checks through a config, you likely want separate root modules (Option 2 above) instead of packing every environment's differences into `if`-like expressions.
- **Workspaces share the exact same `.tf` files.** If staging and production ever need genuinely different resources (not just different sizes/tags), workspaces can't express that — a resource block either exists for every workspace or none of them.

## The task

You're writing a config that adapts its behavior to whichever workspace it's applied in — sizing an instance, naming resources, and tagging them all based on `terraform.workspace`.

```hcl
locals {
  environment   = ...  # terraform.workspace
  is_prod       = ...  # true when workspace is "production"
  instance_type = ...  # "t3.large" in production, "t3.micro" otherwise
  name_prefix   = "..." # e.g. "myapp-<workspace>"
}

resource "aws_instance" "app" {
  # ami, instance_type (from locals), tags (Environment, Name)
}

resource "aws_s3_bucket" "state_backup" {
  # bucket (from name_prefix), tags (Environment)
}

output "environment" {
  # value
}

output "instance_type" {
  # value
}
```

Fill it in so that:

1. `locals.environment = terraform.workspace`, `locals.is_prod` is `true` exactly when `terraform.workspace == "production"`, `locals.instance_type` is `"t3.large"` in production and `"t3.micro"` otherwise, and `locals.name_prefix = "myapp-${terraform.workspace}"`.
2. `resource "aws_instance" "app"` sets `instance_type = local.instance_type`, `ami = "ami-0c55b159cbfafe1f0"`, and tags `Environment = local.environment` and `Name = "${local.name_prefix}-app"`.
3. `resource "aws_s3_bucket" "state_backup"` sets `bucket = "${local.name_prefix}-state-backup"` and a tag `Environment = local.environment`.
4. `output "environment"` has `value = local.environment`.
5. `output "instance_type"` has `value = local.instance_type`.
