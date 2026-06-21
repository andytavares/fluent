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

## The task

Write a Terraform configuration that uses `terraform.workspace` to drive environment-specific behavior:

1. A `locals` block with:
   - `environment = terraform.workspace`
   - `is_prod` that is `true` when workspace is `"production"`
   - `instance_type` — `"t3.large"` for production, `"t3.micro"` otherwise
   - `name_prefix = "myapp-${terraform.workspace}"`
2. An `aws_instance` resource named `"app"` using:
   - `instance_type = local.instance_type`
   - `ami = "ami-0c55b159cbfafe1f0"`
   - Tags: `Environment = local.environment` and `Name = "${local.name_prefix}-app"`
3. An `aws_s3_bucket` resource named `"state_backup"` with `bucket = "${local.name_prefix}-state-backup"` and a tag `Environment = local.environment`.
4. An `output "environment"` that outputs `local.environment`.
5. An `output "instance_type"` that outputs `local.instance_type`.
