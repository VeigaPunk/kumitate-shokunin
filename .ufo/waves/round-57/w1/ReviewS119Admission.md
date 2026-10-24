# ReviewS119Admission — S119 admission review (kumitate round 57, wave 1)

Seat: ReviewS119Admission (reviewer, leaf). Scope: re-open S119, verify quote
verbatim + located, judge tier A for platform-liveness scope.
Verdict: **CORROBORATED — no findings.** Quote verbatim and located; tier A upheld.

## Item under review

`corpus/SOURCES.md` row S119 (lane rev base `7178bfd3…`, unchanged at current tip):

| field | value |
|---|---|
| id | S119 |
| source | Configure Liveness, Readiness and Startup Probes — Kubernetes documentation |
| URL | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| kind / tier | docs / A |
| scope | Kubernetes container liveness: the kubelet probes a container (exec/HTTP/TCP/gRPC) on `periodSeconds`; a failed liveness probe restarts the container — the platform's remedy for workers stuck in unrecoverable states |
| anchor | §Define a liveness command, saved HTML; fetched 2026-10-24, HTTP 200, 554,624 bytes, body sha256 2a69b9a5…fad7e |
| teaches | "Kubernetes provides liveness probes to detect and remedy such situations." |
| status | mined (used-by → `corpus/knowledge/worker-heartbeat-liveness.md`) |

## Re-open evidence (live fetch, 2026-10-24)

- **URL:** https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- **Access date:** 2026-10-24. **HTTP 200**, `text/html`, rendered successfully.
- **Located quote (≤25 words):** "Many applications running for long periods of
  time eventually transition to broken states, and cannot recover except by
  being restarted. Kubernetes provides liveness probes to detect and remedy
  such situations." — §Define a liveness command, lead paragraph.
- **Tier judgment: A.** Per the frozen fleet contract
  (`SOURCES-CONTRACT-v1.md` §tier: "A: primary or authoritative for that scope
  (spec, official docs, source code…)"), official Kubernetes documentation is
  authoritative for kubelet liveness-probe semantics — the exact scope the row
  claims. Upheld.

## Verification details

1. **Quote verbatim + located (row `teaches`).** On the live page AND on the
   pinned capture, the sentence appears verbatim immediately under the
   `## Define a liveness command` heading (the row's anchor). In the pinned
   capture the sentence is split across two source lines inside a `<p>` —
   verified on whitespace-normalized bytes at offset 496047
   (`quote-verification.txt`), tag-stripped rendered text confirms verbatim.
2. **Capture integrity.** `sha256(.ufo/waves/round-57/build/ScoutK8s/k8s-liveness-probes.html)`
   = `2a69b9a5354d355147f562bce0c808c875bb046b7b15b045f012c757c87fad7e`,
   554,624 bytes — byte-identical to both the row's anchor cell and
   `.ufo/pins/source-captures.json` S119 entry (path, sha256, bytes, date).
3. **Scope accuracy.** The page documents exactly what the scope cell claims:
   exec/HTTP/TCP/gRPC probe kinds (TOC: "Define a liveness command", "…HTTP
   request", "…TCP liveness probe", "…gRPC liveness probe" — 30 `grpc`/13
   `gRPC` mentions in capture); `periodSeconds` cadence and
   `initialDelaySeconds` grace (both sentences verified verbatim); failed
   liveness probe → "the kubelet kills the container and restarts it"
   (verbatim). The "platform's remedy" framing is the page's own: "liveness
   probes to detect and remedy such situations."
4. **Entry bindings.** Both S119 clauses in `worker-heartbeat-liveness.md`
   quote the page verbatim with receipt bindings; computed sha256 of
   `liveness-remedy.txt` = `c0e53b5e…` and `probe-timing.txt` = `aa70f640…`
   match the entry's `@sha256:` pins; `source-metadata.txt` = `51b59ca0…`
   matches the byte-count receipt. (Receipt hashes coincide with D57 E2
   coverage; no E3/E5 check re-run — the D57 counter owner is another seat.)
5. **Ledger consistency.** `corpus/lessons/round-57.md` records S119 ADMITTED
   tier A with the same quote + anchor; D57 probe header and plan.md §C2 name
   S119 "liveness/startup probes + the kubelet restart remedy" — consistent
   with the row and the page (startup probes are documented on the same page;
   row scope focuses on liveness, defensibly narrower).

## Findings by severity

None. Row contents are accurate, sourced, and correctly tiered.

## Residual risk / verification gaps

- **Pinned capture vs live page:** live fetch returns different body bytes than
  the pinned capture (generated-HTML churn; page meta `article:modified_time`
  2026-06-30). Quote-bearing content is identical between them; the pinned
  capture is the durable evidence and was checked directly. Not a defect — this
  is precisely why the row pins bytes — but recheck `on-release` remains apt.
- **Depth limit:** tier A is scoped to "kubelet liveness-probe semantics" as
  the row's scope cell names it. For a broader "worker liveness" scope the
  page is still primary for the Kubernetes mechanism, but the entry's
  cross-system synthesis (push-vs-pull) is labeled `[INFERENCE]` in the entry
  itself — correct handling, noted for completeness.
- Not verified here: D57 predicate outcome, S117/S118 rows, S120 rejection
  (owned by sibling seats).

## Commands run (evidence: `.ufo/waves/round-57/build/ReviewS119Admission/`)

- `read https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/` → HTTP 200 page text
- `sha256sum k8s-liveness-probes.html` → `2a69b9a5…fad7e` (554,624 B) — matches pin
- `sha256sum liveness-remedy.txt probe-timing.txt source-metadata.txt` → match entry `@sha256:` bindings
- `python3` whitespace-normalized + tag-stripped quote search → `quote-verification.txt` (all five quotes verbatim)
- `grep -n S119 SOURCES.md / .ufo/pins/source-captures.json / lessons/round-57.md` → ledger consistency
- `grep -n "tier" SOURCES-CONTRACT-v1.md` → tier A definition applied

No lane production files modified; no git/jj mutations. Tool installs: none.
