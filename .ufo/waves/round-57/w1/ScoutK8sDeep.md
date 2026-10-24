# ScoutK8sDeep — round 57 w1

## Item
Re-open S119 `https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/`:
capture probe kinds, `failureThreshold` semantics, `restartPolicy` interaction, and startup-probe
role vs liveness. Judged on operability + coverage.

## Source re-open (row judgment)
- URL: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
  (title: "Configure Liveness, Readiness and Startup Probes"; last modified 2026-06-30 per page footer)
- Accessed: 2026-10-24T12:53:57Z; HTTP 200; 554,624 bytes; body sha256
  `2a69b9a5354d355147f562bce0c808c875bb046b7b15b045f012c757c87fad7e` — **byte-identical** to the
  ScoutK8s seat capture and the S119 pin in `corpus/SOURCES.md` (same hash), so the pinned capture
  is independently corroborated, not drifted.
- Located quote (22 words, §Define a liveness command): "Many applications running for long periods
  of time eventually transition to broken states, and cannot recover except by being restarted."
- Tier judgment: **tier A** — official Kubernetes documentation for the platform liveness contract.
  Agree with the S119 admission: CORROBORATED.
- Companion fetch for deeper field semantics (the page links it): the concept page
  `…/docs/concepts/configuration/liveness-readiness-startup-probes/` — HTTP 200, 544,899 bytes,
  sha256 `e73fcec5a6fe631d4f04ab6cc5f73029360344ebc139b88c2959c750fd126db1`. Facts below cite
  "task page" (S119) vs "concept page" explicitly; the task page alone already covers the four
  assigned points.

## Observed facts (evidence: `build/ScoutK8sDeep/`, line refs to extracted .txt)

### 1) Probe kinds
Three probe *purposes* (liveness, readiness, startup) × four check *mechanisms*:
- **exec** — kubelet runs a command in the container; exit 0 = alive, non-zero → "the kubelet kills
  the container and restarts it" (task L48–54).
- **httpGet** — HTTP GET to pod IP/port/path; "Any code greater than or equal to 200 and less than
  400 indicates success" (task L124–125). Alpha: `protocol: HTTP2` (h2c) behind `H2CContainerProbe`
  gate, v1.37 (task L151–188).
- **tcpSocket** — kubelet opens a socket; connect = healthy, refused = failure (task L189–193);
  immediate close after open still counts healthy (concept page).
- **grpc** — gRPC Health Checking Protocol, `SERVING` = success; Stable since v1.27; "There are no
  error codes for built-in probes. All errors are considered as probe failures" (task L259–263);
  TLS mode Alpha v1.37 via `mode: TLS`/`GRPCContainerProbeTLS`.
- Named ports work for HTTP and TCP probes; "gRPC probes do not support named ports" (task L299).
- Concept page caution: `exec` forks processes per run — CPU overhead at high pod density / low
  intervals; prefer other mechanisms there.

### 2) `failureThreshold` semantics
- It is a **count of consecutive failures**, not a duration: the kill/dead window =
  `failureThreshold × periodSeconds`. Task page worked example: startup `failureThreshold: 30,
  periodSeconds: 10` ⇒ "a maximum of 5 minutes (30 * 10 = 300s) to finish its startup"; "If the
  startup probe never succeeds, the container is killed after 300s" (task L321–345).
- Concept page verbatim: "After a probe fails `failureThreshold` times in a row, Kubernetes
  considers that the overall check has failed … Defaults to 3. Minimum value is 1."
- Per-probe-type consequence: startup/liveness ⇒ "treats the container as unhealthy and triggers a
  restart for that specific container" (kubelet honors `terminationGracePeriodSeconds`); readiness ⇒
  container keeps running, Pod `Ready` set false, traffic stops.
- Sibling fields: `periodSeconds` default 10 s/min 1; `timeoutSeconds` default 1 s; `successThreshold`
  default 1 and "Must be 1 for liveness and startup Probes"; `initialDelaySeconds` default 0.
- Default-liveness posture in the task example: `failureThreshold: 1, periodSeconds: 10` — one miss
  kills, fast deadlock response.

### 3) `restartPolicy` interaction
- Probes only **kill**; restart is governed by the Pod's `restartPolicy`: "the container is killed
  after 300s and subject to the pod's `restartPolicy`" (task L344–345); same sentence for startup
  and liveness failure on the concept page ("subjected to its restart policy").
- Concept page prescriptive: "If you'd like your container to be killed and restarted if a probe
  fails, then specify a liveness probe, and specify a `restartPolicy` of `Always` or `OnFailure`."
- If the app can crash on its own, "the kubelet will automatically perform the correct action in
  accordance with the Pod's `restartPolicy`" — liveness probe optional then.
- Restart is **container-scoped** ("restart for that specific container"), surfaced as the Pod's
  RESTARTS counter incrementing (task L88–90); it is not a pod reschedule and not a work-item
  reclaim.
- Probe result `Unknown` → no action; absent probe → always `Success`; readiness `Failure` before
  initial delay. Caution box: wrong liveness config "can lead to cascading failures."

### 4) Startup-probe role vs liveness
- Startup probe is a **one-shot startup lease**: "only executed at startup, unlike liveness and
  readiness probes, which are run periodically" (concept L25–26).
- While configured, it **disarms the other probes**: "Kubernetes does not execute liveness or
  readiness probes until the startup probe succeeds" (concept L22–23); "liveness and readiness
  probe delays do not begin until the startup probe has succeeded" (concept field defs).
- Hand-off verbatim (task L342–343): "Once the startup probe has succeeded once, the liveness
  probe takes over to provide a fast response to container deadlocks."
- Sizing rule (concept L73–77): if startup usually exceeds
  `initialDelaySeconds + failureThreshold × periodSeconds`, give the *startup* probe the same
  endpoint with a high `failureThreshold` — protecting slow boot **without** loosening the
  steady-state liveness detector.
- Readiness is orthogonal: runs the container's "whole lifecycle", "readiness and liveness probes
  do not depend on each other to succeed", failure = unready/no Service traffic, never a kill
  (task L347–376).

## Synthesis — the liveness contract (axis relevance)
Kubelet **pulls** liveness on a periodic deadline: `failureThreshold × periodSeconds` is the
detection bound; the remedy is a container restart gated by `restartPolicy` (Always/OnFailure) —
a kill-and-respawn at container scope, not the task/lease reclaim of Temporal or Kafka's
partition-reassign. Startup probe is a separate, longer initial lease so slow boot cannot trip the
armed steady-state detector — the same launch-grace/heartbeat-miss separation the lane draws for
its own dispatcher liveness. [INFERENCE] this mapping is my read across the sources, not wording
the page states.

## Coverage delta vs lane records
`corpus/knowledge/worker-heartbeat-liveness.md` S119 clauses (lines 24–25) cite pull-based probing,
kubelet restart remedy, `periodSeconds`/`initialDelaySeconds`, and the startup slot — all verbatim-
accurate against this re-open. **Beyond entry coverage** (corroborated present in the source, not
in cited clauses): `failureThreshold` consecutive-failure semantics + default 3; `restartPolicy`
Always/OnFailure prescription and Never implication; gRPC `SERVING`/no-error-codes and no named
ports; h2c/TLS alpha gates; readiness/liveness independence; container-scoped restart and
`Unknown` result; exec-overhead caution. Candidates if the entry is ever deepened.

## Limits / unknowns
- Field defaults/mins are from the linked concept page (same docs site); the S119 task page itself
  does not enumerate defaults beyond the worked examples.
- `restartPolicy: Never` outcome is inferred from the Always/OnFailure prescription (kill without
  respawn) — the page does not state the Never case literally. [INFERENCE]
- Alpha features (h2c, gRPC TLS, both v1.37) reflect this page revision; feature-gate state is
  version-dated.
- Did not verify the kubelet-side behavior (e.g., readiness probe cadence while unready) beyond
  doc wording; this is a doc-level capture, not a cluster test.

## Evidence files (`build/ScoutK8sDeep/`)
`k8s-probes-page.html` (554,624 B, sha256 `2a69b9a5…ad7e`), `k8s-probes-concept.html` (544,899 B,
sha256 `e73fcec5…26db1`), plain-text extractions `k8s-probes-page.txt` / `k8s-probes-concept.txt`,
`findings.txt` (consolidated verbatim quotes + line refs), `access-date.txt`, `curl-stderr.txt`,
`evidence-sha256.txt` (hashes of extractions).

## Ops
No installs (none needed; curl/python3 already present — pacman paused host-wide). No production or
lane files mutated; no git/jj commands run; writes confined to `build/ScoutK8sDeep/` and this
report.
