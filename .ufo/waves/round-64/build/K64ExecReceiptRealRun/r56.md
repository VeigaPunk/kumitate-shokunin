# Kumitate — Round 56

## Work performed

Declared claims:

1. **C1 — operability, lowest non-retired axis:** acquire the `source-dupes`
   capability (`kumitate-source-dupes-v1`), the SOURCES duplicate-URL ratchet —
   the fleet `sources-census` W04 warning class (the same normalized URL carried
   under differing scopes) promoted into a pinned, scored gate
   (`scripts/source-dupes.mjs` + `.ufo/pins/source-dupes.json`).
2. **C2 — coverage frontier (learning, sourced):** add
   `corpus/knowledge/visibility-lease-ack-deadlines.md`, the durable-execution
   frontier's lease/ack side, sourced on S113 (Google Cloud Pub/Sub
   subscriber), S114 (AWS SQS visibility timeout) and S115 (NATS JetStream
   acks), with S116 (Temporal Visibility) opened and rejected.

- Added `scripts/source-dupes.mjs`, its 12-case hermetic suite and
  `.ufo/pins/source-dupes.json` (4 pinned duplicate groups). `SOURCE_DUPES:
  CLEAN groups=4 known=4`; `--selftest` 12/12 (close receipts under
  `.ufo/waves/round-56/close/selftests.txt`).
- Registered `pin.source-dupes` in the separate gate-pin map of
  `scripts/proxy-check.mjs` (parent-frozen 23-key stanza untouched); the
  strict live proxy reads `PROXY: MATCH`. New `SCORECARD.md` capability row
  and SKILL.md gate row; the verifiable checklist grows to 26 items and the
  round-56 item executor passed 26/26.
- Added the frontier entry plus S113–S116 rows: three mined-and-captured
  admissions (Pub/Sub, SQS, JetStream) and S116 opened-then-rejected
  (Temporal Visibility = operator search, not a delivery lease). Entry
  clauses are bound to committed receipt files under
  `.ufo/waves/round-56/build/Scout{Pubsub,Sqs,Nats}/`; the S116 reject receipt
  is `build/ScoutTemporalVis/`; `sources-check` reads
  `CLEAN (rows=116 tiers=A:96,B:12,C:8 status=queued:12,mined:85,rejected:19 entries_with_source=19 legacy=38)`.
- Routed-defect corrections (append-only, filed bytes unchanged):
  - **R55-V1 —** the round-55 report's `Landed changes` omitted bookkeeping
    commits `e7a07111`/`26c886d7` (SCORECARD measured-slot fills). Correction:
    this report's `Landed changes` names every lane commit authored under
    round 56, and LOG.md records the named defect.
  - **R55-V2 —** the round-55 report filed `B 9→10` while committed bytes
    measure `B 9→11` (S111 admitted-B plus S112 rejected-B both count in the
    tier histogram). The correction is recorded here (Sources & frontier
    below), in `corpus/lessons/round-56.md ## Mistakes` and in LOG.md — the
    round-55 report itself is a filed artifact and is not rewritten.
- Repaired an inherited README drift (same R54-2/R55 class): the r55 verifier
  spotcheck `corpus/lessons/round-55-verifier-spotcheck.md` existed at base
  without a `corpus/README.md` map row — C2_total drifted 129→130. The row is
  restored; strict proxy reads `PROXY: MATCH (C2=132/132 coverage=10)`.
- Prepared **one v2 wave** under policy v2: 64 seats; executor 19, reviewer 13,
  scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2,
  revenger 1, connector 1. Attack roles 24/64 = 37.5%; planner seat held by
  the L1. Validated taskCall + registry committed at
  `.ufo/waves/round-56/w1-validate.json`, `w1-taskcall.json` and
  `w1/swarm-registry.json`. **Prepared-but-undispatched:** no seats spawned,
  returned or killed; returned-without-report=0, dead=0, total=64 prepared.
- **Counter-obsolescence, named:** frozen A54 asserts the checklist is
  *exactly* 24 items and A55 *exactly* 25; this round's capability move makes
  it 26, so at the close revision A54 reads 9/10 (B7 `items=26`) and A55 9/10
  (B7 `items=26`). Named cost of a capability-acquisition claim, recorded in
  `close/prior-probes.txt`, not hidden; A53 17/17, D53/D54/D55 5/5 remain HELD.
- Misroot sweep: `git -C /home/vgpnk/Projects/shokunin status --porcelain`
  showed driver runtime `.ufo/state/*` changes only; the lane wrote no
  fleet-root files besides this report. `.ufo/state/*` and `.ufo/watchdog.log`
  untouched.
- Tool installs/updates: none. **Stale-lane:** respawn-per-round; no other
  kumitate mission open.
- Open L0 items carried, not changed: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation. No new L0 question filed.

## Landed changes

- `e4a49432b36f23646df31a68354d2c14a03fa9e3` — freeze + integrate: plan,
  frozen counters A56/D56 v1, base receipts, witness files, wave
  spec/taskCall/registry, `source-dupes` gate + registry +
  `pin.source-dupes`, SKILL row + checklist item 26, SCORECARD stanza +
  capability row + move log + round-56 section, frontier entry + S113–S116
  rows + three captures + S116 reject + lesson + README + PROVINCE + QUALITY
  Q47, counter-mutant transcript, LOG.md round-56 entry, R55-V1/V2
  corrections.
- `d7da54abf9611984da7a2d9f79705411d9ff7a2e` — claim receipts: three minted
  receipt-attest runs (short span, superseded) + doctored replay control +
  close batteries (selftests, harm part1, prior probes at R1).
- `e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843` — re-minted receipt run-3 so the
  three receipts span ≥300 s (the measured close revision: A56 10/10, D56 5/5
  are attested here).
- `0fb5c61b2aa25deac03d7f1503b8b141fa2a8f08` — R2 claim receipts committed:
  `close/FINAL-attest56-R2.txt`, `close/FINAL-doctrine56-R2.txt`, interim
  `d7da54ab` receipts retained; SCORECARD measured-commit slots filled.
- `e70913006594476dc2624cc50c75d9137b1d39e7` — idempotence re-run at the
  bookkeeping tip (`close/IDEMPOTENCE-0fb5c61b….txt`): A56 10/10, D56 5/5.

(Complete r56 lane-commit list — the R55-V1 repair: every commit above was
authored under round 56 with the lane identity.)

## Before → after measurements

**C1 — operability / `source-dupes` capability.** Frozen command:
`node .ufo/waves/round-56/probe/attest56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base `3eae059e929e4da317c45eba18b4099b90f7541b`: `ATTEST56_UNMET held=0/10
checks=10`, exit 1 (`base/attest56-base.txt`). At the measured tip
`e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843`: `ATTEST56_HELD held=10/10
checks=10`, exit 0 (`close/FINAL-attest56-R2.txt`); idempotence at
`0fb5c61b…`/`e7091300…` also held 10/10
(`close/IDEMPOTENCE-0fb5c61b2aa25deac03d7f1503b8b141fa2a8f08.txt`).
`node scripts/source-dupes.mjs` reads `CLEAN groups=4 known=4`; selftest 12/12.
Operability is 9→9 (terminal): A=84→87, C=25→26, `floor(10×(A+C)/(A+C+3))`
remains 9. Capability row: `SCORECARD.md` `source-dupes`.

**C2 — coverage frontier / `visibility-lease-ack-deadlines.md`.** Frozen
command:
`node .ufo/waves/round-56/probe/doctrine56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base `3eae059e929e4da317c45eba18b4099b90f7541b`: `DOCTRINE56_UNMET held=2/5
checks=5`, exit 1 (`base/doctrine56-base.txt`). At the measured tip
`e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843`: `DOCTRINE56_HELD held=5/5
checks=5`, exit 0 (`close/FINAL-doctrine56-R2.txt`); idempotence also 5/5. The
retired coverage aggregate is 10 after the inherited README repair restores
C2/C2_total to 132/132; the frontier advance is the sourced entry, not a
claimed scalar increase.

## Sources & frontier

Frozen census command (run at round start and round end):
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.
Before — exit 0 (and after, identical, `close/harm-battery-part1.txt`):

```text
kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate W04 S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate W04 S084 duplicate url infection.github.io/guide across scopes
kumitate W04 S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
```

Row count: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
→ 112 before / 116 after. Tier histogram → A=93 B=11 C=8 before / A=96 B=12
C=8 after. New rows by tier: S113/S115 A admitted; S114 A admitted; S116 B
rejected. Existing status/recheck/used-by rows touched: none.
`SOURCES_CHECK: CLEAN (rows=116 tiers=A:96,B:12,C:8 status=queued:12,mined:85,rejected:19 entries_with_source=19 legacy=38)`
(`close/harm-battery-part1.txt` — the sources-check histogram counts kind, not
registry tier). Frontier advanced: durable-execution and multi-agent failure
research via the sixth sourced entry; it remains Frontier, not Core.

- **S113 — admitted, tier A.** Google Cloud Pub/Sub Subscriber Overview,
  https://cloud.google.com/pubsub/docs/subscriber; opened 2026-10-24;
  the expiry of the ack deadline is quoted inside the entry. Saved body +
  sha256 pinned in `.ufo/pins/source-captures.json`.
- **S114 — admitted, tier A.** AWS SQS Visibility Timeout,
  https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html;
  opened 2026-10-24; the processing-time-during-visibility clause is quoted.
- **S115 — admitted, tier A.** NATS JetStream Consumers (ack responses),
  https://docs.nats.io/nats-concepts/jetstream/consumers; opened 2026-10-24;
  the ack-wait redelivery clause is quoted.
- **S116 — rejected, tier B.** Temporal Visibility,
  https://docs.temporal.io/visibility; opened 2026-10-24; Visibility is a
  list/search operator surface, not a delivery lease — reject receipt
  `build/ScoutTemporalVis/`.

**R55-V2 correction (append-only):** the round-55 report's `B 9→10` is hereby
corrected to `B 9→11` — B counts registry-tier B rows including rejected ones
(S111 admitted-B + S112 rejected-B); committed bytes and the tier histogram
confirm 11. The filed round-55 report is not rewritten.

## Trend verdicts

- **Expansion — improved.** One sourced entry advances the durable-execution
  frontier band (S113/S114/S115), S116 is retained as an explicit scope
  rejection, and `source-dupes` enters the repertoire. Evidence:
  `corpus/README.md`, `corpus/SOURCES.md`, `SCORECARD.md`, D56 at the measured
  tip.
- **Quality — improved.** The duplicate-URL ratchet runs CLEAN with a 12/12
  hermetic suite; strict proxy and both source gates read clean; the routed
  R54-C1 lineage's gate discipline carries (captures pinned, reject re-read);
  the R55-V1/V2 corrections are recorded rather than hidden; QUALITY Q47
  codifies the wave-prepared reporting convention. Harm battery + selftests in
  `close/`; frozen item-count literals are named counter-obsolescence, not
  hidden.
- **Discernment — unchanged pending outside review.** The lane records
  S113/S114/S115 admissions and the S116 rejection but does not self-grade
  that taste; the independent non-author source-decision review is pending.

## SHONEN

- [~] SKILL.md contains decision tables, error patterns, checklists and cited
  sources — `SKILL.md` §Gate registry / §Verifiable checklist (26 items);
  `SCORECARD.md` `source-dupes` row.
- [~] At least one end-to-end domain task executed and logged —
  `source-dupes` run/selftest; `LOG.md` round 56; measured tip
  `e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843`.
- [~] Instructions executable without oral context —
  `node scripts/source-dupes.mjs [--registry <path>] [--sources <path>]`, the
  12-case selftest, and the saved plan/counter contract.
- [~] No cross-domain bleed; PROVINCE remains accurate — `PROVINCE.md`
  frontier update stays in orchestration/tooling and explicitly leaves the
  sibling lanes' broker/workflow families open.
