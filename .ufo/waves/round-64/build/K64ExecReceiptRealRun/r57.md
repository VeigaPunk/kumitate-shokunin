# Kumitate — Round 57

## Work performed

Declared claims:

1. **C1 — operability, lowest non-retired axis:** acquire the `readme-map`
   capability (`kumitate-readme-map-v1`), the corpus file↔README-row bimap
   gate (`scripts/readme-map.mjs` + `.ufo/pins/readme-map.json`). It turns the
   count-only C2 proxy term into a per-file contract that names WHICH corpus
   file lacks its `corpus/README.md` map row — the defect class routed as
   R56-V3, now on its third recurrence.
2. **C2 — coverage frontier (learning, sourced):** add
   `corpus/knowledge/worker-heartbeat-liveness.md`, the durable-execution
   frontier's liveness-signal side, sourced on S117 (Temporal detecting
   activity failures), S118 (Kafka 4.3 consumer configs) and S119
   (Kubernetes liveness/readiness/startup probes), with S120 (RabbitMQ
   heartbeats) opened and rejected.

- Added `scripts/readme-map.mjs`, its 14-case hermetic suite and
  `.ufo/pins/readme-map.json` (135 covered paths). `README_MAP: CLEAN
  files=135 rows=135 covered=135`; `--selftest` 14/14 (close receipts under
  `.ufo/waves/round-57/close/selftests.txt`).
- Registered `pin.readme-map` in the separate gate-pin map of
  `scripts/proxy-check.mjs` (parent-frozen stanza keys untouched;
  `pin.proxy-check` re-pinned); strict proxy reads `PROXY: MATCH (A=90 C=27
  operability=9; C1=19/19 C2=135/135 coverage=10; …)`. New `SCORECARD.md`
  capability row and SKILL.md gate row; the verifiable checklist grows to 27
  items.
- Added the frontier entry plus S117–S120 rows: three mined-and-captured
  admissions and S120 opened-then-rejected (AMQP heartbeats are TCP
  connection liveness, not worker/task liveness). All 13 entry clauses are
  bound to distinct committed receipts under
  `.ufo/waves/round-57/build/Scout{TemporalHb,Kafka,K8s,Queue,RabbitmqHb}/`;
  `sources-check` reads
  `CLEAN (rows=120 tiers=A:99,B:13,C:8 status=queued:12,mined:88,rejected:20 entries_with_source=14 legacy=38)`.
- Routed-defect answers (append-only; filed bytes unchanged):
  - **R56-V1 — L2 floor unmet (prepared-undispatched wave).** The round
    prepares and validates its wave; dispatch is the orchestrator's between
    rounds — this round the orchestrator-side machinery dispatched the
    frozen 64-seat spec in-round (see the wave bullet below), so the defect
    is answered in the strongest available form: the wave ran.
  - **R56-V2 — stale frozen A54/A55 exactly-N literals.** Chosen shape:
    append-only correction plus a frozen convention, not a re-pin of old
    counters. A57's B7 arm binds `items === 27` AND every item id→gate
    mapping (24 counter-pins, 25 source-capture, 26 source-dupes, 27
    readme-map). Future capability moves must re-express every binding, never
    only the newest. The frozen A54/A55/A56 counters stay byte-identical and
    read 9/10 at R1 on their B7 count arm only — named counter-obsolescence,
    recorded in `close/prior-probes.txt`.
  - **R56-V3 — spotcheck lesson without README map row.** The row for
    `corpus/lessons/round-56-verifier-spotcheck.md` is restored (base proxy:
    `C2_TOTAL_DRIFT declared=132 computed=133`), and the class is now gated by
    C1 (QUALITY Q48).
- Prepared **one v2 wave** under policy v2: 64 seats; executor 19, reviewer 13,
  scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2,
  revenger 1, connector 1. Attack roles (reviewer+critic+mutation-tester)
  24/64 = 37.5%; planner seat held by the L1. Spec, validation, taskCall and
  registry committed at `.ufo/waves/round-57/w1-spec.json`,
  `w1-validate.json`, `w1-taskcall.json` and `w1/swarm-registry.json`.
  **Dispatched during the round** (the orchestrator-side wave machinery ran
  the frozen spec at 2026-10-24 12:50:32Z, rewriting the working-copy
  `w1/swarm-registry.json` into `ufo-swarm-registry-v1` (64 members) and
  preserving the committed file as `swarm-registry.legacy-wave-v1.json`
  byte-identical). **Seat accounting:** 64/64 reports filed under
  `w1/<Seat>.md` (last landed ~10:20); dead=0,
  returned-without-report=0, round total 64 (no residual call needed —
  wave 1 carried the §3 L2 floor). Seat workspaces under `build/<Seat>/`
  were committed after pruning extraction trees and nested `.git` clones
  (they would have doubled proxy term A; scripts preserved as
  `seat-scripts.tar.gz` per seat). Wave attack findings: four defects
  routed to round 58 (`corpus/lessons/round-57.md` §Round-58 routed
  defects — R57-V1 B8 dead nonce-grep + absent argv assert
  (ExecReceiptSpan/CriticReceiptForgery reproductions), R57-V2 drop-one
  `held=9/9` in-band acceptance (MutA57DropCheck), R57-V3 name-only
  `covered` entries (SentinelRegistryPaths), R57-V4 forged-receipt defeat
  of the replay arm); one in-round repair — SKILL.md `all sixteen` →
  `all seventeen` (CriticNoHarm F1, the R56-V2 doc-literal class).
  ReviewMistakeR56V1's NO-verdict notes the R56-V1 answer rests on
  convention, not a recorded ruling — the wave's in-round dispatch is
  the stronger answer now on record.
- Pre-score witness (QUALITY Q43/M5): both frozen counters were run against a
  scratch conformant post-state commit in a `/tmp` clone before scoring —
  A57 10/10, D57 5/5 (`witness/`, scratch rev
  `1cd6d667e20075fd2e77e6e655bc755f95e3d940`). Reuse audit: attempt-1's
  inherited witness was UNMET (1/10, 1/5 — its scratch carried the base
  state), so it was re-run; the audit also found and repaired, before any
  R1 scoring: a B3-arm(d) `ReferenceError` crash in the frozen A57 counter
  (`lines` out of scope; probe re-pinned in `counter-pins.json` before any
  score was taken), a receipt span of 189 s (< 300 s; run-3 re-minted, final
  span 326,213 ms), the entry's receipt tokens on continuation lines (E2
  bound 0/13 — the E2 fix folded each token onto its clause line), one
  receipt path shared by two clauses (E2 distinct 12/13 — clause 11 moved
  to a new `grace-window.txt` receipt), a lane-internal `ScratchWitness`
  clone that doubled proxy term A (180 vs 90 — removed), and a mutant
  transcript run against pre-state; it was replaced by the all-hold-deleted
  mutant the B5c arm specifies (`held=0/0`, exit 1).
- Misroot sweep: the lane wrote no fleet-root files besides this report.
  `.ufo/state/*` and `.ufo/watchdog.log` untouched. Two misrouted IRC messages
  about kotodama's r67 counters reached this lane's sessions: an alert from
  `L1-kotodama-r67.CriticFrontier` (answered by attempt-2's L1 with a
  decline-to-act, cross-lane scope) and the resolution from
  `L1-kotodama-r67` (read; no reply owed). Neither was acted on
  (cross-lane); the kotodama orchestrator should confirm the alert reached
  its own L1.
- Tool installs/updates: none. **Stale-lane:** respawn-per-round; no other
  kumitate mission open.
- Open L0 items carried, not changed: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation, R53-2 seat-accounting convention. No new L0 question
  filed.

## Landed changes

- `f0dc6d1160e66af65355bd353665adac22bbf4a9` — R1, freeze + integrate (the
  measured close revision): plan, frozen counters A57/D57 v1, base receipts,
  witness files, time-spaced receipts (span ≥300 s) + doctored replay control,
  wave spec/validate/taskCall/registry, `readme-map` gate + registry +
  `pin.readme-map`, SKILL row + checklist item 27, SCORECARD stanza +
  capability row + move log + round-57 section, frontier entry + S117–S120
  rows + captures + lesson + README rows + PROVINCE + QUALITY Q48,
  counter-mutant transcript, LOG.md round-57 entry, R56-V1/V2/V3 answers.
- `b3bd0633aec43ad2559f980b400e4d7077e10af3` — **concurrent writer
  (`L1-kumitate-r57-attempt2`, the second dispatched L1)**: its own R1 over
  the same post-state plus the corrected receipts (run-3 re-mint, span
  326,213 ms), HELD witness files, honest mutant transcript and the
  B3-arm(d) probe fix with re-pin.
- `798d4d23743487d0c642239ca54deba421021af3` — **concurrent writer
  (attempt-2)**: a second set of close receipts scored at `b3bd0633`
  (`attest57-final.txt` 10/10, `doctrine57-final.txt` 5/5,
  `prior-counters-at-close.txt`, `sources-census-after.txt`,
  `harm-battery.txt`).
- `c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7` — SCORECARD measured-commit slots
  filled with R1.
- `1238575b6522d839699df443ed40b29c49d2b5a7` — **concurrent writer
  (attempt-2)**: idempotence re-run at `798d4d23`
  (`close/IDEMPOTENCE-798d4d2.txt`): A57 10/10, D57 5/5.
- `8c6f5b017d149b18134917378cdbed3b492d8e89` — idempotence re-run at the
  bookkeeping tip (`close/IDEMPOTENCE-c42afe1c….txt`): A57 10/10, D57 5/5
  (lane tip at report time).

(Complete r57 lane-commit list: `0162083f44b1508a22b8bd6d16d6f0822f99d3c8`
— wave-1 evidence commit (64 seat reports `w1/*.md`, settled
`ufo-swarm-registry-v1` + preserved `swarm-registry.legacy-wave-v1.json`,
`build/` seat evidence with workspace trees pruned and scripts tarred,
lesson round-58 routed defects R57-V1..V4, SKILL `all seventeen` repair);
`617a9414c32913b8fe75fbd76741febc68d3e80c` — tip recheck transcript
`close/tip-recheck-0162083f….txt`: A57 10/10, D57 5/5 at the wave-evidence
tip. All eight r57 commits carry the lane identity; two L1 sessions
interleaved on the same round — attempt 1
(`L1-kumitate-r57`, presumed dead on PROVIDER_ERROR but alive) and attempt 2
(`L1-kumitate-r57-attempt2`). Every claim was independently re-measured at
both branches' tips: A57 10/10, D57 5/5 at `f0dc6d1`, `b3bd063`, `798d4d2`,
`8c6f5b0` and `0162083f`. The orchestrator should confirm only one kumitate
r57 L1 was meant to be live.)

## Before → after measurements

**C1 — operability / `readme-map` capability.** Frozen command:
`node .ufo/waves/round-57/probe/attest57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`: `ATTEST57_UNMET held=0/10
checks=10`, exit 1 (`base/attest57-base.txt`). At R1
`f0dc6d1160e66af65355bd353665adac22bbf4a9`: `ATTEST57_HELD held=10/10
checks=10`, exit 0 (`close/FINAL-attest57-R1.txt`); idempotence at the
bookkeeping tip also 10/10. `node scripts/readme-map.mjs` reads `CLEAN
files=135 rows=135 covered=135`; selftest 14/14. Operability is 9→9
(terminal): A=87→90, C=26→27, `floor(10×(A+C)/(A+C+3))` remains 9. The command
that would show it unmoved: the same probe at base (0/10), or `readme-map` on
the base tree (gate absent).

**C2 — coverage frontier / `worker-heartbeat-liveness.md`.** Frozen command:
`node .ufo/waves/round-57/probe/doctrine57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base: `DOCTRINE57_UNMET held=2/5 checks=5`, exit 1
(`base/doctrine57-base.txt`). At R1: `DOCTRINE57_HELD held=5/5 checks=5`,
exit 0 (`close/FINAL-doctrine57-R1.txt`); idempotence also 5/5. The retired
coverage aggregate stays 10 after the R56-V3 repair restores C2/C2_total to
135/135; the frontier advance is the sourced entry, not a claimed scalar
increase.

## Sources & frontier

Frozen census command (run at round start and round end):
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.
Before — exit 0 with the four pinned W04 duplicate-URL warnings (S034, S068,
S084, S095); after — exit 0 with the same four warnings (`close/harm-battery.txt`,
standalone re-run section; the earlier `census_exit` line there is `tail`'s
exit and is superseded).

Row count: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
→ 116 before / 120 after. Tier histogram → A=96 B=12 C=8 before / A=99 B=13
C=8 after. New rows: S117/S118/S119 A admitted; S120 B rejected. Existing
status/recheck/used-by cells touched: none. Frontier advanced: durable-execution
and multi-agent failure research via its seventh sourced entry; it remains
Frontier, not Core.

- **S117 — admitted, tier A.** Temporal, Detecting Activity Failures,
  https://docs.temporal.io/encyclopedia/detecting-activity-failures; opened
  2026-10-24; "An Activity Heartbeat is a ping from the Worker that is
  executing the Activity to the Temporal Service."
- **S118 — admitted, tier A.** Apache Kafka 4.3 consumer configs,
  https://kafka.apache.org/43/configuration/consumer-configs; opened
  2026-10-24; `session.timeout.ms`: "The client sends periodic heartbeats to
  indicate its liveness to the broker."
- **S119 — admitted, tier A.** Kubernetes, Configure Liveness, Readiness and
  Startup Probes,
  https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/;
  opened 2026-10-24; "Kubernetes provides liveness probes to detect and remedy
  such situations."
- **S120 — rejected, tier B.** RabbitMQ Heartbeats,
  https://www.rabbitmq.com/docs/heartbeats; opened 2026-10-24; AMQP
  heartbeats detect dead TCP connections at connection scope — transport
  keepalive, not worker/task liveness. Flip condition recorded in the row;
  reject receipt `build/ScoutRabbitmqHb/`.

Captured bodies + sha256 for S117–S120 are pinned in
`.ufo/pins/source-captures.json` (`SOURCE_CAPTURE: CLEAN captures=13
exemptions=107`); `SOURCE_DUPES: CLEAN groups=4 known=4` (no new duplicate).

## Trend verdicts

- **Expansion — improved.** One sourced entry advances the durable-execution
  frontier band (S117/S118/S119), S120 is kept as an explicit scope rejection,
  and `readme-map` enters the repertoire. Evidence: `corpus/README.md`,
  `corpus/SOURCES.md`, `SCORECARD.md` capabilities, D57 at R1.
- **Quality — improved.** A recurring coverage-map defect class (r52, r55,
  r56) is now mechanically gated with a 14/14 hermetic suite; all ten gate
  selftests, strict proxy, and the source gates read clean at close; the
  R56-V2 supersession convention is frozen into a scored arm instead of
  re-pinning old counters; QUALITY Q48 codifies the rule. Prior counters'
  item-count misses are named obsolescence, not hidden.
- **Discernment — unchanged pending outside review.** The lane records the
  S117–S119 admissions and S120 rejection but does not self-grade that taste;
  the independent non-author source-decision review is pending
  (`corpus/lessons/round-57.md` Spot-check line).

## SHONEN

- [~] SKILL.md contains decision tables, error patterns, checklists and cited
  sources — `SKILL.md` §Gate registry / §Verifiable checklist (27 items);
  `SCORECARD.md` `readme-map` row.
- [~] At least one end-to-end domain task executed and logged — `readme-map`
  run/selftest; `LOG.md` round 57; measured R1
  `f0dc6d1160e66af65355bd353665adac22bbf4a9`.
- [~] Instructions executable without oral context —
  `node scripts/readme-map.mjs [--registry <path>] [--readme <path>] [--corpus <dirs>]`,
  the 14-case selftest, and the saved plan/counter contract.
- [~] No cross-domain bleed; PROVINCE remains accurate — `PROVINCE.md`
  frontier update stays in orchestration/tooling; sibling broker/workflow
  families remain open; the misrouted kotodama alert was not absorbed.
