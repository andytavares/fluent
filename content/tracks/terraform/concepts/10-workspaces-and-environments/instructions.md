## What you build

You write a configuration that sizes, names and tags its resources from the current workspace. Workspaces let one configuration manage several separate state files. This lesson builds on **Backends & Remote State**.

## Key concepts

### A workspace is a separate state

Each workspace has its own state in the same backend. An apply in workspace `staging` uses a different state than workspace `production`, with the same configuration files.

```bash
# List workspaces; the first is "default"
terraform workspace list

# Create a workspace and switch to it
terraform workspace new staging
terraform workspace new production

# Switch to an existing workspace
terraform workspace select staging

# Delete a workspace; its state must
# be empty first
terraform workspace delete staging
```

### `terraform.workspace` holds the name

Read the name of the current workspace with `terraform.workspace`.

```hcl
locals {
  environment = terraform.workspace
  name_prefix = "myapp-${terraform.workspace}"
  is_prod     = local.environment == "production"

  instance_type = (
    local.is_prod ? "t3.large" : "t3.micro"
  )
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

### The S3 backend stores each workspace under `env:/`

```
# The default workspace
s3://bucket/path/terraform.tfstate
# Other workspaces
s3://bucket/env:/staging/path/...
s3://bucket/env:/production/path/...
```

### Workspaces fit similar environments

Workspaces are a good fit for:

- Short-lived preview environments per pull request: create, apply, destroy, delete.
- Small teams whose staging and production configurations are nearly the same.
- Temporary test environments in CI.

Use separate root modules instead when:

- Environments differ a lot in resource counts, providers or topology.
- You need independent state locking, so a bad production apply cannot affect staging.
- Different teams own different environments.
- You want a review step per environment, such as `terraform apply -var-file=production.tfvars`.

Do not use workspaces for very different infrastructure. More than two or three `terraform.workspace == "production"` checks usually mean you need separate root modules.

### Two ways to separate environments

Option 1: workspaces, with one configuration.

```
infra/
  main.tf
  variables.tf
```

You run `terraform workspace select production`, then `terraform apply`.

Option 2: separate root modules, one directory each.

```
infra/
  staging/
    main.tf
    terraform.tfvars
  production/
    main.tf
    terraform.tfvars
```

Option 2 gives each environment its own blast radius and its own lock. You can plan in staging before you apply the same change in production, with a review per environment. Pulumi stacks are the same idea as workspaces; Kustomize overlay directories are closest to Option 2.

## Watch out

- `terraform.workspace` is built in. Do not declare `var.workspace` or `local.workspace` for it.
- The name of the default workspace is `"default"`, not `""` or `"prod"`. Check for that name if your logic needs it.
- Three or more `== "production"` checks mean the environments differ too much. Use separate root modules.
- All workspaces share the same `.tf` files. A resource block exists in every workspace or in none.
- Not every backend supports workspaces.

## The task

Write a configuration that adapts to the workspace it runs in. It sizes, names and tags resources from `terraform.workspace`.

1. `local.environment` is `terraform.workspace`.
2. `local.is_prod` is `true` only when `terraform.workspace == "production"`.
3. `local.instance_type` is `"t3.large"` in production. Otherwise it is `"t3.micro"`.
4. `local.name_prefix` is `"myapp-${terraform.workspace}"`.
5. `resource "aws_instance" "app"` sets `instance_type = local.instance_type` and `ami = "ami-0c55b159cbfafe1f0"`.
6. The instance has tags `Environment = local.environment` and `Name = "${local.name_prefix}-app"`.
7. `resource "aws_s3_bucket" "state_backup"` sets `bucket = "${local.name_prefix}-state-backup"`.
8. The bucket has a tag `Environment = local.environment`.
9. `output "environment"` has `value = local.environment`.
10. `output "instance_type"` has `value = local.instance_type`.

In workspace `staging`, the values are:

```hcl
# environment   = "staging"
# instance_type = "t3.micro"
# name_prefix   = "myapp-staging"

locals {
  # environment, is_prod,
  # instance_type, name_prefix
}

resource "aws_instance" "app" {
  # ami, instance_type
  # tags: Environment, Name
}

resource "aws_s3_bucket" "state_backup" {
  # bucket, tags: Environment
}

output "environment" {
  # value
}

output "instance_type" {
  # value
}
```
