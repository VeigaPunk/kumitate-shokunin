# S195 source open — Temporal "Worker Versioning" (concepts page)

## Access record

| Field | Value |
|---|---|
| URL | https://docs.temporal.io/worker-versioning.md (listed in https://docs.temporal.io/llms.txt line 147 as "Worker Versioning") |
| Access date | 2026-10-25 (fetched 2026-10-25T09:40:58Z per response `date` header) |
| HTTP status | 200; `content-type: text/markdown; charset=utf-8`; no redirect (`url_effective` = request URL) |
| Server cache headers | `last-modified: Sat, 24 Oct 2026 00:21:02 GMT`; `etag: "689e2563eb73d2382351d119ee1d4ad5"`; `x-vercel-cache: HIT` |
| Reader | `curl -sSL` (raw markdown, no HTML reader) |
| Byte size | 9645 bytes (`wc -c`) |
| sha256 | `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` |
| Saved body | `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (verbatim; includes Temporal's llms.txt preamble lines 3–5) |

Caveat: this is the **concepts** page. The how-to page is a different document (`/production-deployment/worker-deployments/worker-versioning`, linked at body.md:9 and :35), and the legacy Build-ID page is `/encyclopedia/worker-versioning-legacy.md` (llms.txt:187). Neither was opened, because the brief allowed one document only.

## Grounding quote (§ "Pinned Workflows", body.md:37 heading, sentence at body.md:39)

> A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.

This is 13 words and appears exactly once in body.md (`grep -c` returned 1). The source renders "Pinned" in bold. As plain text: "A Pinned Workflow is guaranteed to complete on a single Worker Deployment Version."

The same paragraph has a companion sentence, useful if the row's teaches covers the escape hatch (body.md:39): "If you need to move a pinned Workflow to a new version, use `temporal workflow update-options`."

## Versioning-behavior facts relevant to durable execution

Behaviors (§ Versioning behaviors, body.md:31–43)
- Each Workflow **type** declares a Versioning Behavior, either Pinned or Auto-Upgrade, through an SDK or the CLI (body.md:33).
- **Pinned** means the Workflow completes on one Deployment Version, and you mark it Pinned at registration (body.md:39).
- **Auto-Upgrade** Workflows "will move to the latest Worker Deployment Version automatically whenever you change the current version" and "need to be kept replay-safe manually, that is with patching" (body.md:43). This is the durable-execution tradeoff: Pinned avoids non-determinism by never changing code mid-run, while Auto-Upgrade puts determinism back on the developer.
- Identity: a Deployment Version is identified by deployment name plus Build ID, and Workers report their Deployment Version when polling (body.md:26–29).

Activities (body.md:45–62)
- A Pinned Workflow's Activities start on the pinned version. An Auto-Upgrade Workflow's Activities start on its Target Version, and the Workflow "moves to its Target Version immediately before starting the Activity" if that version differs from the last one used (body.md:50–51).
- "Independent Activities" are Activities on a Task Queue outside the Workflow's version. They start on the Current or Ramping Version of their own Task Queue (body.md:53–56).

Routing and lifecycle (body.md:64–77)
- Current and Ramping Versions route Workflows "unless they were previously pinned on a different version" (body.md:66–67). Ramp assignment is decided by Workflow ID (body.md:68).
- The version states are Inactive, Active, Draining, and Drained. A version is Draining while it still has open pinned Workflows after it stops being Current or Ramping (body.md:76). Even a Drained version can still re-run code paths for Queries during the Retention Period while its Workers are polling (body.md:77). So old Workers must keep running until pinned runs close, and longer if Queries matter.

Inheritance across new runs (§ Continue-as-new, Child Workflow, and Retry Semantics, body.md:79–148)
- New runs (child, continue-as-new, retry, cron) "may inherit their versioning behavior" (body.md:81).
- "Auto-upgrade Workflows never inherit versions." (body.md:94). "By default, Pinned workflows will pass their version to any Pinned children." (body.md:95).
- **Child of a Pinned parent:**
  - The child inherits the parent's version if its Task Queue belongs to that version, and its first Workflow task runs on the parent's version (body.md:105–106).
  - A Pinned child stays on that version for its lifetime. An Auto-Upgrade child becomes Auto-Upgrade after its first task completes (body.md:107–108).
  - If the child's Task Queue is in a different Deployment, nothing is inherited and the child starts on Current (body.md:109).
- **Child of an Auto-Upgrade parent:** nothing is inherited, and the child starts on Current (body.md:112–114).
- **Continue-As-New:** "The Pinned version is inherited across the Continue-As-New chain" (body.md:120). There is no inheritance if the new run's Task Queue is in another Deployment (body.md:121), and none for Auto-Upgrade runs (body.md:125).
- **Retries:** the version is inherited only if all three conditions hold (body.md:129–133):
  - the run is effectively pinned at retry time,
  - it *inherited* a pinned version when it started (as a child of a pinned parent or a continue-as-new of a pinned run),
  - its Task Queue is in the inherited version.

  Otherwise nothing is inherited (body.md:135–137).
  - [INFERENCE] By the literal conditions, a top-level Pinned run that did not inherit its version does not get version inheritance on retry through this rule. The page does not say which version such a retry starts on. Treat this as an unresolved gap and do not state it as fact in the row.
- **Cron:** never inherits the versioning behavior or the version (body.md:141).
- **Versioning Override:** children, crons, retries, and continue-as-new inherit a source run's override only if the override is pinned **and** the new Task Queue belongs to the override version. The override is evaluated separately and takes precedence over the inherited base version (body.md:145–148).

## Remaining unknowns
- The page has no publish or version date in its body. The only freshness signal is the `last-modified` header (2026-10-24).
- I did not check how SDKs declare Pinned in code. That is in the production how-to page, which was not opened.
- Which version a retry of a non-inherited Pinned run uses is not stated (see the inference above).
