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

## Watch out

- **A `backend` block can't reference variables, locals, or resources.** It's evaluated before the rest of the configuration graph exists, so `bucket = var.state_bucket` is invalid — backend values must be literals (or supplied out-of-band via `-backend-config`).
- **`data.terraform_remote_state.<name>.outputs.<key>`** — note the `.outputs.` segment. Forgetting it (`data.terraform_remote_state.network.public_subnet_id`) is the most common mistake; the remote state's outputs are nested one level deeper than a normal data source's attributes.
- **Reading a remote state only exposes its declared `output` blocks**, nothing else. If the network stack never outputs `public_subnet_id`, no amount of correct syntax on the consumer side will make it appear.
- **`encrypt = true` and a lock table are not optional in any team setting.** Skipping `dynamodb_table` means two concurrent `apply` runs can corrupt the same state file with no warning.

## The task

You're configuring a root module that stores its own state in S3 and reads another team's state (the network layer) to wire an EC2 instance into an existing subnet.

```hcl
terraform {
  backend "s3" {
    # bucket, key, region, encrypt, dynamodb_table
  }
}

data "terraform_remote_state" "network" {
  backend = "..."
  config = {
    # bucket, key, region — same backend, different key
  }
}

resource "aws_instance" "app" {
  # ami, instance_type, subnet_id (from the remote state's outputs)
}

output "instance_id" {
  # value
}
```

Fill it in so that:

1. `terraform { backend "s3" { ... } }` sets `bucket = "my-tf-state-prod"`, `key = "app/terraform.tfstate"`, `region = "us-east-1"`, `encrypt = true`, `dynamodb_table = "terraform-state-lock"`.
2. `data "terraform_remote_state" "network"` sets `backend = "s3"` and a `config` map with `bucket = "my-tf-state-prod"`, `key = "network/terraform.tfstate"`, `region = "us-east-1"` — the same bucket/region as this module's own backend, but a different `key` (a different state file, for the network layer).
3. `resource "aws_instance" "app"` sets `ami = "ami-0c55b159cbfafe1f0"`, `instance_type = "t3.micro"`, and `subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id`.
4. `output "instance_id"` has `value = aws_instance.app.id`.
