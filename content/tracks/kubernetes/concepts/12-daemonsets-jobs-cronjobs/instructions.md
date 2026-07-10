# DaemonSets, Jobs & CronJobs

## What you'll learn

Not every workload fits the "N interchangeable replicas" model. Some things
need exactly one instance per node (log shippers, node monitoring agents).
Some things need to run to completion and stop, not stay alive
(migrations, batch processing). Some things need to run on a schedule.
Three purpose-built controllers cover these: DaemonSet, Job, and CronJob.

## Key concepts

**DaemonSet — one Pod per matching node, automatically.** No `replicas`
field at all; the controller schedules exactly one Pod on every node
(or every node matching a `nodeSelector`), and automatically adds a Pod
when a new node joins the cluster:

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

Canonical uses: log collectors (Fluentd/Fluent Bit), node monitoring
(node-exporter), CNI/CSI node plugins — anything that must exist
per-node rather than per-replica-count.

**Job — run to completion, then stop.**

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

- `completions` — how many Pods must **successfully complete** (exit 0) for
  the Job to be considered done.
- `parallelism` — how many Pods may run concurrently while working toward
  `completions`.
- `backoffLimit` — how many Pod failures are tolerated (with exponential
  backoff between retries) before the Job is marked `Failed` outright.
- `ttlSecondsAfterFinished` — auto-delete the Job (and its Pods) this many
  seconds after it finishes — without it, completed Jobs and their Pods
  accumulate forever, cluttering `kubectl get pods`.
- **`restartPolicy` must be `OnFailure` or `Never`** inside a Job's Pod
  template — `Always` (the Pod/Deployment default) is invalid here, because
  a Job Pod is *supposed* to exit; `Always` would fight the completion
  model.

**CronJob — a Job on a schedule.**

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

- `schedule` — standard 5-field cron syntax (minute, hour, day-of-month,
  month, day-of-week), evaluated in the **kube-controller-manager's**
  configured timezone (UTC by default, unless the CronJob's `.spec.timeZone`
  field is set, GA since 1.27).
- `concurrencyPolicy` — what happens if the previous run's Job hasn't
  finished when the next scheduled time arrives: `Allow` (default — run
  concurrently), `Forbid` (skip this run entirely), `Replace` (kill the
  still-running Job and start the new one).
- `startingDeadlineSeconds` — how late a scheduled run is allowed to start
  before being counted as **missed** entirely (not run at all). If the
  controller manager was down, or the cluster was under load, and this
  deadline passes, that scheduled invocation is simply skipped — no
  automatic catch-up. This matters: CronJob is not a guaranteed-execution
  system; if reliability matters more than "close enough," build
  idempotency and monitoring around it.

## vs other tools

| | DaemonSet | Job | CronJob |
|---|---|---|---|
| Closest analog | Ansible/Chef "run on every host" | `systemd` oneshot unit / CI job | `crontab` + a job scheduler |
| Scaling model | Automatic — tracks node count | Fixed `completions`/`parallelism` | Spawns a new Job per scheduled tick |
| Retry semantics | N/A (long-running) | `backoffLimit`, exponential backoff | Inherited from the Job it creates |
| Missed-run handling | N/A | N/A | Skipped past `startingDeadlineSeconds` — no automatic backfill |

Coming from plain cron: the biggest surprise is that a missed run is simply
*gone*, not queued or backfilled. If a scheduled backup absolutely must run
even after an outage, you need external monitoring (alert on "no successful
Job in the last 25 hours") rather than relying on CronJob to self-heal that
gap.

## Watch out

- **Forgetting `restartPolicy: OnFailure`/`Never` on a Job** — the default
  `Always` is rejected by the API server for Job Pod templates.
- **No `ttlSecondsAfterFinished`** — completed Jobs and their Pods pile up
  indefinitely; large clusters running frequent CronJobs without this set
  can accumulate thousands of dead Pod objects.
- **`concurrencyPolicy: Allow` (the default) can silently stack overlapping
  runs** if a Job occasionally runs longer than the schedule interval — for
  anything non-idempotent (a backup job, a batch write), set `Forbid` or
  `Replace` deliberately rather than leaving the default.
- **DaemonSets ignore `replicas`** — there's no such field; Pod count is
  always "one per matching node," full stop.

## The task

Produce three YAML documents separated by `---`.

**Document 1** — a DaemonSet log shipper:

- `apiVersion: apps/v1`, `kind: DaemonSet`, `metadata.name: log-agent`
- `spec.selector.matchLabels`: `app: log-agent`
- `spec.template.metadata.labels`: `app: log-agent`
- `spec.template.spec.containers` with one container: `name: log-agent`,
  `image: fluentd:1.16`

**Document 2** — a one-off database migration Job:

- `apiVersion: batch/v1`, `kind: Job`, `metadata.name: db-migrate`
- `spec.completions: 1`, `spec.parallelism: 1`, `spec.backoffLimit: 3`,
  `spec.ttlSecondsAfterFinished: 3600`
- `spec.template.spec.restartPolicy: OnFailure`
- `spec.template.spec.containers` with one container: `name: migrate`,
  `image: migrate:1.0`

**Document 3** — a nightly backup CronJob:

- `apiVersion: batch/v1`, `kind: CronJob`, `metadata.name: nightly-backup`
- `spec.schedule: "0 2 * * *"`
- `spec.concurrencyPolicy: Forbid`
- `spec.startingDeadlineSeconds: 300`
- `spec.jobTemplate.spec.template.spec.restartPolicy: OnFailure`
- `spec.jobTemplate.spec.template.spec.containers` with one container:
  `name: backup`, `image: backup:1.0`

Expected shape:

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
