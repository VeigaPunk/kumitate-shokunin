# Kumitate — Round 55

## Work performed

Declared claims:

1. **C1 — operability, lowest non-retired axis:** acquire the `source-capture`
   capability (`kumitate-source-capture-v1`), the opened-source byte-persistence
   gate — mechanically binding every opened `corpus/SOURCES.md` `S###` row to
   committed capture bytes or an explicit exemption (routed defect R54-C1).
2. **C2 — coverage frontier (learning, sourced):** add
   `corpus/knowledge/bounded-redelivery-budgets.md`, the durable-execution
   frontier's *bound* side, sourced on S109 (Kafka 4.3 design), S110 (RabbitMQ
   DLX) and S111 (AWS Builders' Library).

- Added `scripts/source-capture.mjs`, its 13-case hermetic suite,
  `.ufo/pins/source-captures.json` (5 captures + 107 declared pre-rule
  exemptions), and `pin.source-capture` registration; `SOURCE_CAPTURE: CLEAN
  captures=5 exemptions=107`, selftest `13/13` (`scripts/source-capture.mjs`;
  close receipts under `.ufo/waves/round-55/close/`).
- Registered the gate and checklist item 25; updated the separate gate-pin map
  in `scripts/proxy-check.mjs` without widening the parent-frozen 23-key proxy
  stanza. The updated `proxy-check --selftest` is `122/122`; the strict live
  proxy is `MATCH` (`SKILL.md`; `SCORECARD.md`; `close/harm-battery.txt`).
- Added the sourced frontier entry and S109–S112 rows, including S112's
  retained rejection (Temporal Event-History/Replay is a different durability
  mechanism) and the S108 standing reject re-adjudicated on committed bytes;
  the entry's 13 clauses carry distinct committed receipt bindings under
  `.ufo/waves/round-55/build/` (`corpus/knowledge/bounded-redelivery-budgets.md`;
  `corpus/SOURCES.md`; D55 receipts).
- Repaired the routed defect R54-C1 (R55-1): S108's rejected-source bytes were
  never committed, so the round-54 non-author spot-check could not re-open the
  reject. The dated capture
  `.ufo/waves/round-55/build/ScoutMicroservices/idempotent-consumer.html`
  (sha256 `3edddaa1959c…`, 19,749 bytes, HTTP 200) is committed and pinned; the
  reject stands on re-read. Codified as QUALITY Q46.
- Repaired an inherited README drift (same R54-2 class): the round-54 verifier
  spot-check file `corpus/lessons/round-54-verifier-spotcheck.md` landed at the
  r54 integrator commit without a `corpus/README.md` map row — C2_total drifted
  126→127. The row is added; strict proxy reads `PROXY: MATCH (C2=129/129
  coverage=10)`.
- Added QUALITY Q46 (the capture-commit rule) and moved the durable-execution
  frontier band in `PROVINCE.md` and `corpus/README.md`.
- Prepared **one v2 wave** under policy v2: 64 seats; executor 19, reviewer 13,
  scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2,
  revenger 1, connector 1. Attack roles are 24/64 = 37.5%. The L1 holds the
  planner seat. The validated taskCall and registry are committed at
  `.ufo/waves/round-55/w1-taskcall.json`, `w1-validate.json` and
  `w1/swarm-registry.json`. **Prepared-but-undispatched:** no seats were
  spawned, returned, or killed; returned-without-report=0, dead=0, round
  total=64 prepared seats; residual call=none. The orchestrator dispatches the
  prepared wave between rounds.
- **Counter-obsolescence, named:** the frozen round-54 counter A54 asserts the
  checklist is *exactly* 24 items; this round's capability move adds item 25,
  so A54 at the close revision reads `held=9/10` (B7 MISS `items=25`). This is
  the intended cost of a capability-acquisition claim: a frozen counter that
  pins an item count is superseded by the round that adds the item, and the
  registry pins carry it without regression. All other prior-round probes
  remain HELD at R3 (A53 17/17, D53 5/5, D54 5/5).
- Misroot sweep: `git -C /home/vgpnk/Projects/shokunin status --porcelain`
  showed driver runtime changes only; this lane dispatched no seats and wrote
  no fleet-root files. `.ufo/state/*` and `.ufo/watchdog.log` untouched.
- Tool installs/updates: none. **Stale-lane:** respawn-per-round; no other
  kumitate mission is open.
- Open L0 items carried, not changed: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation; R53-2 seat-accounting convention applied above. No new
  L0 question was filed.

## Landed changes

- R1 `68940c66f7482c4bb3bbb4f3a6ffea5aee53c1bc` — freeze+integration (r54-style
  single commit): plan, frozen counters A55/D55, base receipts, receipts
  (3 minted + doctored control), wave spec+taskCall+registry, source-capture
  gate + both registries, SKILL row + checklist item 25, SCORECARD stanza +
  capability row + move log, entry + S109–S112 rows + lesson + README +
  PROVINCE + QUALITY Q46, S108 captured bytes, counter-mutant transcript.
- R1b `465a96f5caad46a7fe9fd5cfe43f6e7f4672c678` — named freeze-repair: A55 v1
  arm fixes (B1 whole-output scan, B3 undo-restore + expectation strings, B5
  optional `counter-pins` pin + self-pin, B9 per-field detail) and the
  re-pinned probe digest.
- R2 `3b3e1e965cc100b102f1222ff71d0538d367ed87` — FINAL claim receipts measured
  at the repaired tip (`close/FINAL-attest55-R2.txt`,
  `close/FINAL-doctrine55-R2.txt`).
- R3 `2750454b9dcd3de7ae3ed14b004d2122bab4c756` — idempotence re-run at R3,
  harm battery + selftests + prior-round probes (`close/harm-battery.txt`,
  `close/selftests.txt`, `close/IDEMPOTENCE-3b3e1e96….txt`), witness files.

## Before → after measurements

**C1 — operability / `source-capture` capability.** Frozen command:
`node .ufo/waves/round-55/probe/attest55-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base `c562d28557067bf35d78171c5737feee3c8679fd`: `ATTEST55_UNMET held=0/10
checks=10`, exit 1 (`base/attest55-base.txt`). At the measured tip
`465a96f5caad46a7fe9fd5cfe43f6e7f4672c678`: `ATTEST55_HELD held=10/10
checks=10`, exit 0 (`close/FINAL-attest55-R2.txt`); idempotence at R3
`3b3e1e965cc100b102f1222ff71d0538d367ed87` also held 10/10
(`close/IDEMPOTENCE-3b3e1e965cc100b102f1222ff71d0538d367ed87.txt`).
`node scripts/source-capture.mjs` reads `CLEAN captures=5 exemptions=107`; its
selftest is 13/13. Operability is 9→9 (terminal): A=81→84, C=24→25, and
`floor(10×(A+C)/(A+C+3))` remains 9. Capability row: `SCORECARD.md`
`source-capture`.

**C2 — coverage frontier / `bounded-redelivery-budgets.md`.** Frozen command:
`node .ufo/waves/round-55/probe/doctrine55-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
At base `c562d28557067bf35d78171c5737feee3c8679fd`: `DOCTRINE55_UNMET held=2/5
checks=5`, exit 1 (`base/doctrine55-base.txt`). At the measured tip
`465a96f5caad46a7fe9fd5cfe43f6e7f4672c678`: `DOCTRINE55_HELD held=5/5
checks=5`, exit 0 (`close/FINAL-doctrine55-R2.txt`); R3 idempotence also held
5/5. The retired coverage aggregate is 10 after the inherited README repair
restores C2/C2_total to 129/129; the frontier advance is the sourced entry,
not a claimed scalar increase.

## Sources & frontier

The frozen census command (run at round start and round end) was
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.

Before — exit 0 (and after, identical, `close/harm-battery.txt`):
```text
kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate W04 S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate W04 S084 duplicate url infection.github.io/guide across scopes
kumitate W04 S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
```

Row count: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
→ 108 before / 112 after. Tier histogram → A=91 B=9 C=8 before / A=93 B=10 C=8
after. New rows by tier: S109/S110 A admitted; S111 B admitted; S112 B
rejected. Existing status/recheck/used-by rows touched: S108 re-adjudicated
(stands rejected). `SOURCES_CHECK: CLEAN (rows=112 tiers=A:93,B:11,C:8
status=queued:12,mined:82,rejected:18 entries_with_source=12 legacy=38)`
(`close/harm-battery.txt` — note the sources-check tier histogram counts kind,
not registry tier). Frontier advanced: durable-execution and multi-agent
failure research via the sourced fifth entry; it remains Frontier, not Core.

- **S109 — admitted, tier A.** Apache Kafka 4.3 Design,
  https://kafka.apache.org/43/design/design/; opened 2026-10-24T11:09Z; §Message
  delivery semantics: “At least once — Messages are never lost but may be
  redelivered.” Saved body + sha256 pinned in `.ufo/pins/source-captures.json`.
- **S110 — admitted, tier A for RabbitMQ's own behavior.** RabbitMQ Dead Letter
  Exchanges, https://www.rabbitmq.com/docs/dlx; opened 2026-10-24T11:09Z; “The
  message is returned more times to a quorum queue than the delivery-limit.”
- **S111 — admitted, tier B.** AWS Builders' Library, Timeouts retries and
  backoff with jitter; opened 2026-10-24T11:09Z; “…limiting retries locally
  using a token bucket.” Scoped client-side, not broker redelivery.
- **S112 — rejected, tier B.** Temporal Workflow Execution,
  https://docs.temporal.io/workflow-execution; Event-History/Replay is a
  different durability mechanism than this entry's delivery-guarantee +
  broker-budget scope; flip condition recorded.
- **S108 — standing reject, re-adjudicated** on committed bytes (R54-C1
  repair); the SQL-transaction recipe still does not map to the lane's
  file-backed queue + nonce-ledger surfaces.

## Trend verdicts

- **Expansion — improved.** One sourced entry advances the named
  durable-execution frontier band (S109/S110/S111); S112 is retained as an
  explicit scope rejection and S108 re-adjudicated. The `source-capture`
  capability also enters the repertoire. Evidence: `corpus/README.md`,
  `corpus/SOURCES.md`, `SCORECARD.md`, D55 at R2.
- **Quality — improved.** The capture registry gate runs CLEAN with 5
  captures + 107 exemptions and has a 13/13 hermetic suite; strict proxy and
  source gates are clean; the routed R54-C1 defect is shown red-before and
  repaired with a mechanical gate (Q46) that cannot silently regress. H2–H6
  recorded in `close/harm-battery.txt` + `close/selftests.txt`; the A54 frozen
  24-item literal is recorded as named counter-obsolescence, not hidden.
- **Discernment — unchanged pending outside review.** The lane records
  S109/S110/S111 admissions and S112 rejection, but does not self-grade that
  taste; the independent non-author source-decision review is pending. No
  discernment improvement is claimed without that verdict.

## SHONEN

- [~] SKILL.md contains decision tables, error patterns, checklists and cited
  sources — `SKILL.md` §Gate registry / §Verifiable checklist (25 items);
  `SCORECARD.md` `source-capture` row.
- [~] At least one end-to-end domain task executed and logged —
  `source-capture` run/selftest; `LOG.md` round 55; measured tip
  `465a96f5caad46a7fe9fd5cfe43f6e7f4672c678`.
- [~] Instructions executable without oral context —
  `node scripts/source-capture.mjs [--registry <path>] [--sources <path>]`, the
  13-case selftest, and the saved plan/counter contract.
- [~] No cross-domain bleed; PROVINCE remains accurate — `PROVINCE.md` frontier
  update stays in orchestration/tooling and explicitly leaves other
  broker/workflow families open.
