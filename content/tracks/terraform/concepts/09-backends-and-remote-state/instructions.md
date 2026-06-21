# Backends & Remote State

## What you'll learn

How to store Terraform state remotely so teams can collaborate safely, how state locking prevents concurrent apply conflicts, and how to read another stack's state outputs using `terraform_remote_state`.

## Key concepts

### The `backend` block

Backends control where state is stored and how operations like `terraform plan` run. Without a backend config, state is stored locally in `terraform.tfstate`. That's fine for solo experiments — not for teams.

The backend block goes inside `terraform {}`:

```hcl
terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "my-tf-state-prod"
    key            = "network/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

`encrypt = true` enables server-side encryption of the state file in S3. `dynamodb_table` enables state locking — Terraform writes a lock record before any operation that writes state and removes it on completion. If two engineers run `apply` simultaneously, the second one waits or errors rather than corrupting state.

### Common backends

| Backend | Lock support | Notes |
|---------|-------------|-------|
| `s3` | Yes (DynamoDB) | Most common for AWS teams |
| `gcs` | Yes (native) | GCP equivalent |
| `azurerm` | Yes (blob lease) | Azure |
| `http` | Optional | Generic REST API; used by GitLab |
| `cloud` (Terraform Cloud) | Yes | HCP Terraform; handles runs server-side |
| `local` | No | Default; no sharing |

### Backend configuration and partial configuration

Backend config can't use variables or locals — it's evaluated before the rest of the config. For values you don't want in source control (bucket names, regions), use partial configuration:

```hcl
# terraform {}  with empty backend "s3" {}
terraform init -backend-config="bucket=my-tf-state-prod" \
               -backend-config="key=network/terraform.tfstate"
```

Or a `-backend-config` file:

```bash
terraform init -backend-config=prod.backend.hcl
```

### `terraform_remote_state` data source

Read outputs from another root module's state without coupling the configs:

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-tf-state-prod"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id
  vpc_security_group_ids = [
    data.terraform_remote_state.network.outputs.app_sg_id
  ]
}
```

The consuming module needs read access to the state bucket but doesn't need to know anything about how the network was built.

### State locking in practice

- Lock is acquired at the start of `apply`, `plan -out`, and `destroy`.
- If a process crashes mid-apply, the lock may remain. Use `terraform force-unlock <lock-id>` to release it — only do this when you're certain no apply is actually running.
- `terraform state push` bypasses the normal locking flow, which is why it's dangerous.

## vs other tools

| Tool | Remote state / sharing |
|------|----------------------|
| **CloudFormation** | `Fn::ImportValue` across stacks in the same account/region — no cross-account without custom resources |
| **Pulumi** | Stack references (`StackReference`) in Pulumi Cloud or self-managed backends |
| **Ansible** | Stateless; share data via inventory, host vars, or external stores |
| **CDK** | Shares through CF exports — same limitations as CF |

`terraform_remote_state` is more flexible than CF exports: it works cross-account, cross-region, and can share any output, not just CF export values.

## The task

Write a Terraform configuration that:

1. Declares a `terraform {}` block with a `backend "s3"` configured for:
   - `bucket = "my-tf-state-prod"`
   - `key    = "app/terraform.tfstate"`
   - `region = "us-east-1"`
   - `encrypt = true`
   - `dynamodb_table = "terraform-state-lock"`
2. Declares a `data "terraform_remote_state" "network"` block that reads from the same S3 backend at key `"network/terraform.tfstate"`.
3. Declares an `aws_instance` resource named `"app"` that:
   - Uses `instance_type = "t3.micro"` and `ami = "ami-0c55b159cbfafe1f0"`
   - Sets `subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id`
4. Declares an `output "instance_id"` that outputs `aws_instance.app.id`.
