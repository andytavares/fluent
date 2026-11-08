## What you build

You store the state of a root module in S3 and read the state of another team's network layer. Remote state lets a team work together, and locking stops two applies from writing at once. This lesson builds on **State Management**.

## Key concepts

### The `backend` block sets where state lives

A backend controls where Terraform stores state. With no backend, state is in a local `terraform.tfstate` file. That is correct for solo experiments, not for teams. The `backend` block goes inside `terraform {}`.

```hcl
terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "my-tf-state-prod"
    key            = "network.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

`encrypt = true` turns on server-side encryption of the state file in S3. `dynamodb_table` turns on state locking. Terraform writes a lock record before it writes state and removes it at the end. A second `apply` at the same time waits or fails; it does not corrupt state.

Terraform 1.11 deprecates `dynamodb_table`. `use_lockfile = true` locks with a file in S3 instead. You can set both while you migrate.

### Common backends

| Backend | Locking | Notes |
|---------|---------|-------|
| `s3` | Yes | Most common on AWS |
| `gcs` | Yes, native | GCP |
| `azurerm` | Yes, blob lease | Azure |
| `http` | Optional | REST API; GitLab |
| `local` | No | The default |

HCP Terraform uses a `cloud` block inside `terraform {}`, not a `backend` block. It runs plans and applies on its servers.

### Partial configuration keeps values out of code

Terraform reads the backend before the rest of the configuration, so a backend cannot use variables or locals. To keep a bucket name or a region out of source control, leave the block empty. Then pass the values to `terraform init`.

```bash
# With an empty backend "s3" {} block
terraform init \
  -backend-config=bucket=my-tf-state-prod \
  -backend-config=key=network.tfstate
```

You can also put the values in a file.

```bash
terraform init \
  -backend-config=prod.backend.hcl
```

### `terraform_remote_state` reads another state

This data source reads the outputs of another root module's state. The configurations stay separate.

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-tf-state-prod"
    key    = "network.tfstate"
    region = "us-east-1"
  }
}

locals {
  net = (
    data.terraform_remote_state.network
    .outputs
  )
}

resource "aws_instance" "app" {
  subnet_id = local.net.public_subnet_id
  vpc_security_group_ids = [
    local.net.app_sg_id,
  ]
}
```

The task's check reads one line, so the task writes the full reference: `data.terraform_remote_state.network.outputs.public_subnet_id`.

The consumer needs read access to the state bucket. It needs no knowledge of how the network was built. CloudFormation's `Fn::ImportValue` works in one account and region; `terraform_remote_state` can read any output across accounts and regions.

### Locking in practice

- Terraform locks state for every operation that can write state.
- A crash during an apply can leave the lock in place. `terraform force-unlock <lock-id>` releases it.
- Use `force-unlock` only for your own lock, when you are sure no apply runs. Otherwise two writers can change state.
- `terraform state push` overwrites the remote state. `-force` skips its lineage and serial checks, which is why it is dangerous.

## Watch out

- A `backend` block cannot reference variables, locals or resources. `bucket = var.state_bucket` is invalid. Use literals or `-backend-config`.
- Remote outputs are under `.outputs.`. `data.terraform_remote_state.network.public_subnet_id` is the most common mistake.
- Remote state exposes only declared `output` blocks. A value the network stack does not output is not available.
- A team setup needs `encrypt = true` and locking. With no lock, two concurrent applies can corrupt the state with no warning.

## The task

Configure a root module that stores its state in S3. It reads the network team's state to place an EC2 instance in a subnet.

1. `terraform { backend "s3" { ... } }` sets `bucket = "my-tf-state-prod"` and `key = "app/terraform.tfstate"`.
2. The backend also sets `region = "us-east-1"`, `encrypt = true` and `dynamodb_table = "terraform-state-lock"`.
3. `data "terraform_remote_state" "network"` sets `backend = "s3"`.
4. Its `config` map sets `bucket = "my-tf-state-prod"`, `key = "network/terraform.tfstate"` and `region = "us-east-1"`.
5. The bucket and region match this module's backend. The `key` differs: it is the network layer's state file.
6. `resource "aws_instance" "app"` sets `ami = "ami-0c55b159cbfafe1f0"` and `instance_type = "t3.micro"`.
7. The instance sets `subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id`.
8. `output "instance_id"` has `value = aws_instance.app.id`.

```hcl
terraform {
  backend "s3" {
    # bucket, key, region,
    # encrypt, dynamodb_table
  }
}

data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    # bucket, key, region
  }
}

resource "aws_instance" "app" {
  # ami, instance_type
  # subnet_id from the remote outputs
}

output "instance_id" {
  # value
}
```
