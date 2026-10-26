source: S195 — https://docs.temporal.io/worker-versioning.md — § Versioning behaviors → § Pinned Workflows / § Auto-Upgrade Workflows; § Continue-as-new, Child Workflow, and Retry Semantics
verified-at: 2026-10-25 (raw markdown opened by kumitate; response HTTP 200; captured body sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc)
recheck: 90d — `curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'guaranteed to complete on a single Worker Deployment Version'` (expected 1)
coverage-map: frontier band "Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies)" (PROVINCE.md §Frontier)
ground: frontier item **4** — durable execution and multi-agent failure research.

# Temporal Worker Versioning: code-version boundaries in durable workflows

## Scope

This entry records the version-pinning contract Temporal documents for Workflow execution. It does not infer a general exactly-once guarantee, and it does not claim what a top-level pinned Workflow's retry does when the documentation's inheritance conditions do not apply.

## Pinned and Auto-Upgrade behaviors

[S195 § Versioning behaviors → § Pinned Workflows](https://docs.temporal.io/worker-versioning.md) states: “A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.” The page describes the alternative, Auto-Upgrade, as moving to the latest Worker Deployment Version when the current version changes, while requiring the Workflow to remain replay-safe through manual patching.

The versioned unit is a Worker Deployment Version, identified by deployment name plus Build ID. A pinned Workflow stays on one such version; Auto-Upgrade trades that stability for moving with the deployment's current version. This is a code-version boundary, not a promise about every Activity or child execution.

## Inheritance limits

The same page states that Auto-Upgrade Workflows never inherit versions. Pinned children and Continue-As-New runs can inherit a pinned version when their Task Queue belongs to that version. Retry inheritance is narrower: the run must be effectively pinned at retry time, must have inherited a pinned version when it started, and must use a Task Queue in that inherited version. Cron runs never inherit a version.

The page does not state which version a retry of a top-level Pinned run uses when it did not inherit a version. That case remains UNKNOWN here; do not generalize the inheritance rule beyond its stated conditions.

## Operational use

For orchestration that must replay under the same Workflow code, select Pinned behavior for that Workflow type; use Auto-Upgrade only when the Workflow's replay safety is maintained by the documented patching discipline. Check Independent Activities separately: they can use the Current or Ramping version of their own Task Queue rather than the Workflow's pinned version.

The source-grounding quote is 13 words, located under § Pinned Workflows in the captured page at `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md:39`.
