## What you build

You manage two EC2 instances and adopt an existing instance into state with an `import` block. State maps your configuration to real objects, and you can inspect and change it safely. This lesson builds on **Modules**.

## Key concepts

### State maps configuration to real objects

Terraform stores the mapping between your HCL and the real objects in `terraform.tfstate`, a JSON file. Each managed resource has an entry with:

- The resource address, for example `aws_instance.web`.
- The ID from the provider, for example `i-0abc123def456`.
- All current attribute values.

With state, Terraform knows if a resource exists, what it looks like and what must change. Without state, every plan queries every resource again. That is slow, and impossible for resources with no stable query key.

### State holds secrets

`terraform.tfstate` can contain database passwords and private keys in plain text. Never commit it to version control. Use a remote backend with encryption, such as S3 with SSE or HCP Terraform. Concept 09 covers backends.

### `terraform state` commands change state

```bash
# List all resources in state
terraform state list

# Show the full state of one resource
terraform state show aws_instance.web

# Rename with no destroy and recreate
terraform state mv \
  aws_instance.web aws_instance.app

# Stop managing it; it keeps running
terraform state rm aws_s3_bucket.legacy

# Print the current state as JSON
terraform state pull

# Upload a local state file to the
# backend. Use with extreme care.
terraform state push terraform.tfstate
```

### Drift is a change made outside Terraform

Drift comes from console edits, other tools or failed applies. `terraform plan` finds drift when it compares state with the live API.

```bash
# Deprecated: terraform refresh
terraform apply -refresh-only
```

`terraform apply -refresh-only` shows what drifted. If you approve, it updates state to match reality and changes no infrastructure. It does not revert the drift. To make the real objects match your configuration again, run a normal `terraform apply`.

### Import brings an existing object into state

```bash
terraform import \
  aws_instance.web i-0abc123def456
```

This command creates a state entry, but it does not write HCL. Write the `resource` block yourself, import, then run `terraform plan` and check that it shows no changes.

Terraform 1.5 and later also accepts `import` blocks in HCL. You can review them in a pull request like other code.

```hcl
import {
  to = aws_instance.web
  id = "i-0abc123def456"
}
```

CloudFormation manages stack state for you; Terraform lets you move, remove or import single resources, but you manage the state file.

## Watch out

- `terraform state rm` destroys nothing. The object keeps running, and Terraform forgets it. `terraform destroy` deletes it.
- You can keep an applied `import` block in the configuration. Terraform skips the import when the address is already in state.
- Import fills only state. If the `resource` block does not match the real object, the next plan changes the object. That change can be destructive.
- `terraform state mv` renames an address and recreates nothing. Use it to rename a resource or move it into a module.

## The task

Manage two EC2 instances in HCL. Use an `import` block to adopt an existing instance as `aws_instance.web`.

1. `resource "aws_instance" "web"` sets `ami = "ami-0c55b159cbfafe1f0"` and `instance_type = "t3.micro"`.
2. The `web` instance has a tag `Name = "web-server"`.
3. `resource "aws_instance" "app"` sets `ami = "ami-0c55b159cbfafe1f0"` and `instance_type = "t3.small"`.
4. The `app` instance has a tag `Name = "app-server"`.
5. An `import` block sets `to = aws_instance.web`. This is an HCL address, not a string.
6. The `import` block sets `id = "i-0abc123def456"`. This is the real instance ID, as a string.
7. `output "web_instance_id"` has `value = aws_instance.web.id`.
8. `output "app_instance_id"` has `value = aws_instance.app.id`.

```hcl
resource "aws_instance" "web" {
  # ami, instance_type, tags
}

resource "aws_instance" "app" {
  # ami, instance_type, tags
}

import {
  # to, id
}

output "web_instance_id" {
  # value
}

output "app_instance_id" {
  # value
}
```
