## What you build

You write a DaemonSet log shipper, a database migration Job and a nightly backup CronJob. Some workloads need one Pod per node, some run to completion, and some run on a schedule. This lesson builds on **StatefulSets**.

## Key concepts

### A DaemonSet runs one Pod per node

A DaemonSet has no `replicas` field. The controller schedules one Pod on every node, or on every node that matches a `nodeSelector`. When a new node joins the cluster, the controller adds a Pod to it.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
        - name: log-agent
          image: fluentd:1.16
```

Typical uses are log collectors (Fluentd, Fluent Bit), node monitoring (node-exporter) and CNI or CSI node plugins. The closest analog is an Ansible or Chef "run on every host" play.

### A Job runs to completion, then stops

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: migrate:1.0
```

- `completions` is the number of Pods that must exit 0 for the Job to be done.
- `parallelism` is the number of Pods that can run at the same time.
- `backoffLimit` is the number of Pod failures before the Job is `Failed`. Retries use exponential backoff.
- `ttlSecondsAfterFinished` deletes the Job and its Pods that many seconds after it finishes. Without it, finished Jobs and Pods stay forever.
- `restartPolicy` must be `OnFailure` or `Never`. A Job Pod must exit, so `Always`, the Pod default, is not valid.

### A CronJob creates a Job on a schedule

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid
  startingDeadlineSeconds: 300
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: backup:1.0
```

- `schedule` uses 5-field cron syntax: minute, hour, day of month, month, day of week. Without `.spec.timeZone`, the schedule uses the local time zone of kube-controller-manager. `.spec.timeZone` is GA since Kubernetes 1.27.
- `concurrencyPolicy` acts when the previous Job still runs at the next scheduled time. `Allow` (the default) runs both. `Forbid` skips the new run. `Replace` stops the old Job and starts the new one.
- `startingDeadlineSeconds` is how late a run can start. After the deadline, the controller counts the run as missed and does not run it.

Each CronJob run creates a new Job, and the Job retries with its own `backoffLimit`.

### A missed CronJob run is gone

Unlike a queue, a CronJob does not backfill a missed run. A controller outage or a busy cluster can skip a run. For a backup that must run, make the Job idempotent and alert on "no successful Job in the last 25 hours".

## Watch out

- The API server rejects a Job Pod template with `restartPolicy: Always`. Set `OnFailure` or `Never`.
- Without `ttlSecondsAfterFinished`, finished Jobs pile up. Frequent CronJobs can leave thousands of dead Pod objects.
- `concurrencyPolicy: Allow` stacks runs when a Job takes longer than the interval. Set `Forbid` or `Replace` for non-idempotent work.
- A DaemonSet has no `replicas` field. The Pod count is always one per matching node.

## The task

Write three YAML documents in `stub.yaml`, separated by `---` lines.

1. Document 1 is a DaemonSet named `log-agent`.
2. Its selector and Pod template use the label `app: log-agent`.
3. It has one container `log-agent` with `image: fluentd:1.16`.
4. Document 2 is a Job named `db-migrate`.
5. It sets `completions: 1`, `parallelism: 1` and `backoffLimit: 3`.
6. It sets `ttlSecondsAfterFinished: 3600`.
7. Its Pod template sets `restartPolicy: OnFailure`.
8. It has one container `migrate` with `image: migrate:1.0`.
9. Document 3 is a CronJob named `nightly-backup`.
10. It sets `schedule: "0 2 * * *"`, with the quotes.
11. It sets `concurrencyPolicy: Forbid` and `startingDeadlineSeconds: 300`.
12. Its Job template sets `restartPolicy: OnFailure`.
13. It has one container `backup` with `image: backup:1.0`.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
        - name: log-agent
          image: fluentd:1.16
---
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: migrate:1.0
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid
  startingDeadlineSeconds: 300
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: backup:1.0
```
