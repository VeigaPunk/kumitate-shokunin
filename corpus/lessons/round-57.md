# Round 57 — kumitate (hyaku run 5, attempt 2 lands it)

Base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (the round-56 verifier-spotcheck tip; lane clean, ahead=0).
Plan `.ufo/waves/round-57/plan.md`. Claims: C1 `readme-map` capability acquisition
(ATTEST57), C2 sourced frontier entry `worker-heartbeat-liveness.md` (DOCTRINE57).

## Gate

Candidates considered: 4 source rows opened this round (S117 Temporal
detecting-activity-failures, S118 Kafka consumer configs, S119 Kubernetes
liveness probes, S120 RabbitMQ heartbeats) plus the `readme-map` gate itself
(instrument, not a knowledge admission).

| Row | URL | Accessed | Located quote | Decision |
|---|---|---|---|---|
| S117 | https://docs.temporal.io/encyclopedia/detecting-activity-failures | 2026-10-24 | "An Activity Heartbeat is a ping from the Worker that is executing the Activity to the Temporal Service." (§Activity Heartbeats) | ADMITTED tier A — primary docs for Temporal worker liveness |
| S118 | https://kafka.apache.org/43/configuration/consumer-configs | 2026-10-24 | "The timeout used to detect client failures when using Kafka's group management facility. The client sends periodic heartbeats to indicate its liveness to the broker." (§session.timeout.ms) | ADMITTED tier A — authoritative config reference for consumer session liveness |
| S119 | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | 2026-10-24 | "Kubernetes provides liveness probes to detect and remedy such situations." (§Define a liveness command, lead) | ADMITTED tier A — official docs for kubelet liveness probes |
| S120 | https://www.rabbitmq.com/docs/heartbeats | 2026-10-24 | "AMQP 0-9-1 offers a heartbeat feature to ensure that the application layer promptly finds out about disrupted connections" (§Overview) | REJECTED — TCP/connection keepalive, not worker/task liveness; flip: a lane-owned mapping of connection-level liveness onto the dispatcher's transport tier |

Status/recheck/used-by changes: none on prior rows. S117–S119 written `mined`
(used-by `corpus/knowledge/worker-heartbeat-liveness.md`), S120 `rejected`.

Spot-check result: `<pending>` — the independent non-author source-decision review
runs at closure (per Q45 this line is closed next round by an append-only correction).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| coverage-map drift | R56-V3 (`corpus/lessons/round-56-verifier-spotcheck.md` §6): `corpus/lessons/round-56-verifier-spotcheck.md` landed post-close without a `corpus/README.md` map row — third recurrence of the class (r52, r55 spotchecks; proxy read `C2_TOTAL_DRIFT declared=132 computed=133` at base) | `none` until this round — the count-only C2 term could not name WHICH file lacked a row | R57-1: the `readme-map` gate (`scripts/readme-map.mjs`, contract `kumitate-readme-map-v1`) makes the bimap mechanical — every file must have exactly one row, every row a live file, every file pinned in `.ufo/pins/readme-map.json`; the missing row is added in this commit. Shown able to fail: selftest cases `uncovered`/`orphan-row`/`stale-covered`/`unpinned` each exit 1 for the named reason |
| stale frozen literal | R56-V2 (same artifact §1): frozen A54 `exactly 24` and A55 `exactly 25` checklist literals read `UNMET 9/10` at the r56 close rev because item 26 exists — capability moves retreading named obsolescence every round | `none` — no convention bound which supersession shape a frozen count literal may take | R57-2: the A57 B7 arm freezes the amended convention — `items === 27` AND the full item-id→gate binding (24→counter-pins, 25→source-capture, 26→source-dupes, 27→readme-map); future capability moves must re-express every item binding, never only the newest; recorded in LOG.md and the plan §Routed-defect answers |
| process carry | R56-V1 (same artifact §1): the round-56 wave was prepared-but-undispatched; the L2 floor note records the orchestrator dispatches waves between rounds | n/a — orchestrator ruling/process convention, not a lane defect the lane can fix inside the repo | R57-3: this round prepares and validates the 64-seat v2 wave (`w1-spec.json`, `w1-validate.json`, `w1-taskcall.json`, `w1/swarm-registry.json`) and reports it prepared; dispatch is the orchestrator's |

## Round-56 carryover (routed)

- R56-V1 answered-by-convention above (R57-3); the wave is prepared and the
  orchestrator dispatches it between rounds.
- R56-V2 repaired-by-convention above (R57-2): the amended B7 arm makes the
  supersession shape part of the scored predicate itself.
- R56-V3 repaired above (R57-1): the row exists AND the class is gated.
- Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation, R53-2 seat-accounting convention.

## Round-58 routed defects (from the dispatched w1 attack seats)

- **R57-V1 — A57 B8's cross-round nonce arm is dead, and its argv arm is
  absent** (found by seat ExecReceiptSpan; `.ufo/waves/round-57/w1/ExecReceiptSpan.md`).
  `attest57-probe.mjs` B8 scans older corpora with `git grep … --
  '.ufo/waves/round-4[89]' '.ufo/waves/round-5[0-6]'`. A pathspec must cover
  the whole path: a bare directory-name wildcard does not descend, so the
  grep matches nothing and exits 1; the arm only compares when
  `older.status === 0`, so a failed scan silently counts as fresh.
  Demonstrated by a scratch clone carrying a round-56 file that reuses
  round-57 `attest-run-1`'s nonce: A57 still prints `held=10/10 … B8 PASS`.
  The frozen plan also states B8 "asserts exactly these" planned argv; B8
  reads no `argv`. Fix for round 58 (frozen counters are not edited after
  scoring): (a) spell the scan `:(glob).ufo/waves/round-4[89]/**` +
  `:(glob).ufo/waves/round-5[0-6]/**` — measured same 100 nonce lines as the
  explicit-dir list; never `?` or `round-5*`, both swallow round-57 itself;
  (b) fail on grep exit ≥ 2 AND prove coverage (pathspec resolves to ≥1
  file; a known-present sentinel token found) — exit 1 is a legitimate
  no-match, 128 an unparseable rev; (c) assert each receipt's body `argv`
  against the plan's frozen list; (d) prefer the body `wall_start` over the
  prelude `run-at` when measuring the span.
- **R57-V2 — A57's in-band verdict accepts a drop-one mutant** (found by
  seat MutA57DropCheck; `.ufo/waves/round-57/w1/MutA57DropCheck.md`).
  K3's predicted `held=9/10` shape is wrong: a dropped check yields
  `held=9/9` → `ATTEST57_HELD`, exit 0. The vacuous-HELD guard covers only
  `checks.length === 0`; no arm enforces the frozen count of ten checks, so
  any consumer trusting the verdict token or exit code accepts the
  mutant — the kill holds only through the external frozen-predicate
  literal `held=10/10 checks=10`. Fix for round 58: the counter asserts
  `checks.length === <frozen>` as a fail-closed arm, not only `=== 0`.
- **R57-V3 — `readme-map` covered entries are name-only** (found by seat
  SentinelRegistryPaths; `.ufo/waves/round-57/w1/SentinelRegistryPaths.md`;
  two LOW findings). A `covered` entry or README row naming a directory or
  symlink is still scored CLEAN — corpus members compare by name, not by
  lstat'd regular-file. Captured-by: none (gate limitation). Fix for round
  58 or a `kumitate-readme-map-v2`: lstat each `covered` member and require
  `S_ISREG`; a non-file member is DRIFT (`covered-not-file`), a dangling
  symlink DRIFT (`stale-covered`).
- **R57-V4 — A57 B8's doctored-replay arm is defeated by forged receipts**
  (found by seat CriticReceiptForgery;
  `.ufo/waves/round-57/w1/CriticReceiptForgery.md`). Receipts fabricated at
  commit time without `receipt-attest run` pass `verify --ledger` AND score
  `B8 PASS`, including a set replaying a nonce committed in round 52 —
  inside the directories the sweep intends to cover; the sweep reads zero
  bytes at the judged rev (R57-V1's dead-grep cause). Reproduced end-to-end
  on sandbox commits. Fix: folded into R57-V1's remediation — B8 must fail
  closed on grep exit ≥ 2, prove coverage (sentinel token found), assert
  the frozen argv, and the sweep's pathspec must descend
  (`:(glob)…/round-5[0-6]/**`).
- **In-round repair, not routed — SKILL.md "all sixteen" prose literal**
  (found by seat CriticNoHarm, F1; the R56-V2 stale-literal class in doc
  prose one section above the guarded checklist). Re-expressed to "all
  seventeen" (`SKILL.md` verdict-map paragraph) in the wave-evidence
  commit — the B7 arm guards checklist items only; the registry-table
  count stays a named-unbounded literal by convention.
