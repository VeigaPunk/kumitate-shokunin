# kumitate-shokunin — Scorecard

Lane axes per `../MISSION.md` (fleet-2 table): **operability + coverage** —
orchestration & tooling (OMP task/hub dispatch, ufo-fsd scripts,
`crates/ufo-core-runtime`). depth / freshness / calibration / adjacency belong
to other lanes and are not scored here; cross-domain evidence this lane finds is
reported, never absorbed — precedent:
`corpus/lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md`
(the `membrane-seal write` argv defect has no owning repo).

Baselines are measured against lane HEAD `7a4c9a0` (2026-09-28 17:49) and origin
tree `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` at HEAD `ee907f1cf`.
Every count carries its command.

## Measurement proxies

Fixed before the move so before→after is verifiable; both read only this repo
plus the origin tree and re-run in seconds.

### operability

`f_O = (A + C) / (A + C + 3)`, score `= floor(10 × f_O)` — saturating, so one
artifact cannot claim the axis.

- **A — runnable artifacts.** Executable files in this repo (excluding `.git`)
  with a documented invocation that exits with a verdict.
  `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l`
  → **0** at `7a4c9a0`; → **1** after round 8 (`scripts/cite-check.mjs`); →
  **2** after round 9 (`scripts/cite-check.mjs` + `scripts/surface-probe.mjs`,
  both with a documented invocation, a verdict line and a firmware-style exit
  map); → **3** after round 10 (+ `scripts/round-gate.mjs`, contract
  `kumitate-round-gate-v1`: 1226 L, 14 finding kinds, 49-case hermetic suite,
  exit 0/1/2/64, sha256 `2c6c580b…`); → **4** after round 11
  (+ `scripts/proxy-check.mjs`, contract `kumitate-proxy-v1`, 1173 L, 55-case
  hermetic suite, 10 fail-closed arms, exit 0/1/2/64).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0** at `7a4c9a0`; → **4**
  after round 9 (`## Verifiable checklist`: citation gate verdict, citation gate
  hermetic suite, live sighting-surface conformance, surface-probe hermetic
  suite); → **6** after round 10 (+ round-gate hermetic suite, round-close
  artifact audit); → **9** after round 11 (+ filed-report tracking, proxy
  recompute, proxy-check hermetic suite). All nine are *executed*, not merely
  listed: `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass`,
  `VERDICT: PASS`, exit 0 (each item names a command, an accepted exit set and
  an expected verdict substring; a miss fails the item). At round-8 close the
  count was still 0 — the round-8 Working-rules bullet had a real command but no
  GFM task item, so the frozen proxy did not credit it.

No partial credit for prose: an item counts only when a machine can run it and
the stated outcome is checkable. Cross-lane calibration: kake (operability 6)
has 3 proven scripts plus partially executable checklists; kagi moved 5→7 with
two self-tested gates (`kagi-shokunin/SCORECARD.md`, verified by
`drift-pins.sh --selftest` → `DRIFT_SELFTEST: PASS (11 cases)` when this line was
first written; re-measured 2026-09-28 in round 11 by both an L2 connector lane
and L1 → `DRIFT_SELFTEST: PASS (13 cases)`, owner: kagi). This lane had 0
and 0 — the one gate-shaped command `SKILL.md` stated, `ufo membrane-seal write`,
is a filed defect that cannot run at all.

### coverage

`score = floor(10 × C1 × C2)` — a product, so neither a broad surface registry
nor a fresh map alone can inflate the axis.

- **C1 — in-scope surface coverage.** Surface families with ≥1 internals-level
  corpus note, over the registry below: **14 / 18 = 0.778**. Unchanged in rounds
  9–11: `corpus/knowledge/round-close-gate.md` and
  `corpus/knowledge/executable-scorecard.md` document this lane's own tools, not
  one of the 18 source families below, and `live-surface-probe.md` (round 9)
  covers S1/S4 surfaces that already had notes.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **39**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **39** after
  round 11 (rows added for `knowledge/executable-scorecard.md`,
  `lessons/round-11.md` and the third-party `lessons/round-8-aggregator-box3-coldrun.md`
  the aggregator lane committed into this repo mid-round) ⇒ **1.0** (36/36 at
  round-10 close).

Diagnostic, deliberately **not** scored — file granularity over the in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 42 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5 = **212** files / **211** unique basenames),
basename-matched against `corpus/**/*.md` + `SKILL.md`: **140 / 211 ≈ 0.663**,
re-measured unchanged in round 11 (both round-11 notes cite this lane's own
tools, the fleet protocol files and this repo's scripts — no origin basename was
added), up from 105 / 211 ≈ 0.50 in round 8 (method: recursive walk of
`corpus/**.md` + `SKILL.md`, `basename` containment). Basename matching is
collision-prone in both directions, which is why it is not the scored term. The
denominator itself is stable at 212 files; the registry's `scripts/*/` row is 42.

#### In-scope surface registry (18 families)

| # | Family | Members (origin tree) | Corpus note |
|---|---|---|---|
| S1 | dispatcher core | `fleet-dispatcher.mjs` (14769 L) | yes — successor-chain · queue-and-claim · enqueue-admission · reconcile-and-cycle · queue-summary |
| S2 | native trial path | `run-omp-native-trial.mjs` (4693 L) + `collect-omp-native-handoff.mjs` (1943 L) + `collect-omp-native-handoff-lib/` (6) | yes — native-trial-launch · failure-telemetry |
| S3 | swarm path | `ufo-swarm-wave.mjs` (2711 L) + `ufo-swarm-collect.mjs` (988 L) | yes — dispatch-shapes · swarm-wave-lifecycle |
| S4 | sighting wall | `ufo-sighting.mjs` (396 L) + `ufo-sighting` (224 L bash) + `ufo-sighting-lib/` (26 files / 10620 L) | yes — sighting-wall |
| S5 | routing & result helpers | `omp-global-config.mjs` (735 L) + `ufo-mission-result.mjs` (3691 L) | yes — route-resolution · failure-telemetry · singleton-and-queue-ownership |
| S6 | ops watchers | `ufo-stale-watchdog.mjs` (1010 L) + `ufo-l0-monitor.mjs` (1638 L) + `ufo-l0-watch.mjs` + `the-tick-ping.mjs` (831 L) + `ufo-ground-handler.mjs` (859 L) | partial — 2 of 5 named; `the-tick-ping`/`ufo-ground-handler` live only in `SKILL.md` |
| S7 | remaining scripts | 69 members: 59 top-level `*.mjs` + `charter-scribe/` (6) + `lean-cargo/` (4) — re-counted round 11 (`ls scripts/*.mjs \| wc -l` → 72 minus the 13 S1–S6 `.mjs` basenames → 59; `find scripts/charter-scribe -type f \| wc -l` → 6, where the round-10 row said 5: the origin tree grew a file, owner: origin) | no |
| R1 | judge pipeline | 8 `native*.rs` core modules | yes — native-judge-pipeline |
| R2 | loop driver + state | 12 files (`loop_driver*.rs` ×10, `state.rs`, `state_tests.rs`) | yes — loop-driver |
| R3 | profile & cost | 5 files (`execution_profile*`, `cost_ledger*`, `native_profile.rs`) | yes — cost-and-profile |
| R4 | runtime support | 6 files (`lane_overlay*`, `lease*`, `live*`) | yes — runtime-support |
| R5 | seats & admission | 4 files (`native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs`) | yes — native-admission-detail |
| R6 | dedupe + L3 | 4 files (`distill*`, `l3_swarm*`) | yes — distill-and-l3 (r7) |
| R7 | local ship + fs layer | 5 files (`local_ship*`, `bounded_fs*`, `fs_durability.rs`) | yes — local-ship (r7) |
| R8 | transcript / ledger / seat coverage | 4 files (`native_transcript.rs`, `native_ledger.rs`, `native_seat_coverage.rs`, `native_dispatch_topology.rs`) | yes — native-transcript-ledger-seats (r7) |
| R9 | judge test suite | `native_tests.rs` (340 cases; other big test files sit inside R2/R6/R7) | yes — test-inventories (r7) |
| R10 | gate | `gate.rs` + `gate_tests.rs` | no — verdict vocabulary only (inside native-judge-pipeline) |
| R11 | runtime remainder + CLI | 42 runtime `.rs` + `ufo-cli/src/*.rs` (5) | no |

Covered = 14; partial (S6) counts as **not** covered. Families are disjoint and
exhaustive: script-layer members sum to **114** = 72 + 42 (round-9 re-measure;
round 8 recorded 41, the origin tree added one file); runtime+CLI members sum to
**98** = 93 + 5.

### Machine-readable claim block (`kumitate-proxy-v1`)

`scripts/proxy-check.mjs` recomputes every term below from this tree, re-derives
both scores, and compares them with this block and with the `## Axes` integers;
`node scripts/proxy-check.mjs` → `PROXY: MATCH (…)` exit 0, `PROXY: DRIFT (…)`
exit 1, fail-closed exit 2, usage 64. The values are **claims** — the tool
re-derives and never trusts them, and it never rewrites this block. The four pins
are full sha256 hex of `scripts/*.mjs`; re-pin them after ANY edit to those files,
including `proxy-check.mjs` itself (an unrecorded edit then shows up as
`PIN_DRIFT`, not as a silently stale claim). Grammar and boundary:
`corpus/knowledge/executable-scorecard.md`.

<!-- kumitate-proxy-v1
A=4
C=9
C1=14
C1_total=18
C2=39
C2_total=39
pin.cite-check=8a6b5c9dd9e2fde8180dbee8293264c2b78618a15532d9c9f9e13224a4de74ce
pin.surface-probe=86bdcd9af7f6f4135c2958b32ebd5c835db8c3a3c2b565b068136a3e9a97cb61
pin.round-gate=4c44746384cfe4485f133ff02b00931426ef9f16382dd86142bd92abf79ab946
pin.proxy-check=9d35ae743102e517448e93558fd8479f0930b2c9b281e58d083a3ea639070a6e
-->

## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 8 | `f_O = (A+C)/(A+C+3)` with A=4 (`scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs`) and C=9 (`## Verifiable checklist`, all 9 executed by `surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass`) ⇒ 13/16 = 0.8125 ⇒ 8 | round 11 |
| coverage | 7 | `floor(10 × 0.778 × 1.0)` = 7; C1 registry below (14/18), C2 39/39 (`grep -c` + `find … \| wc -l`), file-level residue 140/211 ≈ 0.663 (unchanged — both round-11 notes cite fleet/tool artifacts, not origin sources) — no score change | round 11 (bookkeeping) |

Why not 10 on either axis: operability now has four runnable artifacts and nine
executed checklist items, but still no CI/schedule leg, and the probes cover
citations, two live surfaces, the round record and this lane's own scorecard —
not the other 16 registry families. Coverage still has four uncovered/partial
families (S6, S7, R10, R11) and ~33% of in-scope source files uncited. Why not
0/lower: the whole judgment path (dispatcher, launcher, judge pipeline, loop
driver, wall) is mapped at internals level with line-level citations, and the
gates that check those citations, two of those live surfaces, this lane's round
record and the scorecard claim itself now run on demand.

Round 11 changed what the score *means*, not only its value: the proxy terms are
no longer hand-typed prose. `scripts/proxy-check.mjs` recomputes A/C/C1/C2 and
the four artifact sha256 pins from the tree and compares them with a
machine-readable claim block in this file (`<!-- kumitate-proxy-v1 … -->`), so a
non-author can re-derive the numbers — the aggregator's round-6 complaint about
lane scores (`AXES.md` defines six axes, but no proxy exists for the names a lane
invents) is answered for this lane by construction. Re-chartering the proxy to
score the same artifacts higher is still explicitly rejected: the formula is
unchanged since round 8 and the round-11 terms are counted by the same commands
the frozen definitions name.

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 11 | operability | A=3, C=6 ⇒ `f_O = 9/12 = 0.75` ⇒ 7; the plan fixed the arithmetic (`A+C ≥ 12` for 8) and named (a) a scheduled/CI leg or (b) three more genuinely executed items | A=4 (`scripts/proxy-check.mjs`, contract `kumitate-proxy-v1`, 1173 L, 9 finding kinds, 10 fail-closed arms, 55-case hermetic suite) + C=9 (+ filed-report tracking, proxy recompute, proxy-check hermetic suite) ⇒ `f_O = 13/16 = 0.8125` ⇒ **8**; option (a) refused on evidence — the only schedulers on this host are `systemd --user` timers owned by other identities (`ai-usage`, `webzites-probe`, `charter-scribe`) and the kake lane's recorded precedent is that a lane does not toggle host state itself (`.ufo/l0-questions.md`, kake round-12); a parse defect found by L1 falsification AFTER the suite was green — a `\|` inside a registry cell shifted the 4th-cell test and silently stopped counting that row — was fixed with two regression cases (suite 53 → 55, re-pinned) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)` exit 0; `--selftest` → `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0; `surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass` exit 0; `round-gate.mjs --tracked` → `ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)` exit 0; `round-gate.mjs --selftest` 57/57 exit 0; failures kept: `--tracked --close` exit 64, `--tracked --lane other` exit 2 `NO_FILED_REPORTS`, stanza/registry/pin mutations → `PROXY: DRIFT` exit 1; the `\|`-row falsification that exposed the parse defect produced a false MATCH before the fix and the correct parse after it |
| 11 | coverage | C1 14/18, C2 36/36 | C2 39/39 (rows: `knowledge/executable-scorecard.md`, `lessons/round-11.md`, and the third-party `lessons/round-8-aggregator-box3-coldrun.md` the aggregator lane committed into this repo mid-round); C1 unchanged 14/18; residue 140/211 ≈ 0.663 (re-measured, unchanged — both notes cite this lane's own tools and fleet docs, not origin sources) ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 39; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 39; residue loop over 211 unique basenames |
| 10 | operability | A=2, C=4 ⇒ `f_O = 6/9` ⇒ 6; round 9's plan offered (a) a third live surface — which "raises no proxy term" — or (b) widening the checklist to the round-close gates | A=3 (`scripts/round-gate.mjs`, contract `kumitate-round-gate-v1`, 1226 L, 14 finding kinds, 49-case hermetic suite) + C=6 (2 new executed items) ⇒ `f_O = 9/12 = 0.75` ⇒ **7** | `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass` exit 0; `round-gate.mjs --selftest` → `ROUND_GATE_SELFTEST: 49/49 pass` `VERDICT: PASS` exit 0 (3.1 s); default audit → `ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10 errors=0 warnings=1)` exit 0; `--round 42` → `DRIFT` exit 1; `--reports-dir /nonexistent` → exit 2 `REPORTS_DIR_MISSING`; `--repo /tmp` → exit 2 `NOT_A_GIT_WORKTREE`; `--bogus` → exit 64; cited-commit arms falsified live (`COMMIT_CITED_UNRESOLVED [deadbeef0]`; `COMMIT_CITED_NOT_ANCESTOR [d65aa24 31f09cd 0ac2272]` against a clone checked out at `efe19da`) |
| 10 | coverage | C1 14/18, C2 34/34 | C2 36/36 (2 rows: `knowledge/round-close-gate.md`, `lessons/round-10.md`); C1 unchanged 14/18; residue 140/211 unsplit ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 36; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 36; residue loop over 211 unique basenames |
| 9 | operability | A=1, C=0 ⇒ `f_O = 1/4` ⇒ 2; and the one gate had a non-hermetic suite (`--selftest` 27/28, `VERDICT: FAIL`, exit 1, broken by a sibling lane's doc) | A=2 (`scripts/surface-probe.mjs`, 1438 L: 12 conformance checks, 38 hermetic fixtures, `--json`, exit 0/1/2/64) + C=4 (executed checklist) ⇒ 6/9 ⇒ 6; `cite-check --selftest` split to 19 hermetic cases (`VERDICT: PASS`, exit 0 any tree state) with live assertions behind `--integrations` (exit 1, findings preserved) | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` exit 0 (0.19 s); `surface-probe --selftest` 38/38 exit 0 (0.35 s); `surface-probe --checklists` `CHECKLIST: 4/4 pass` exit 0; `cite-check --selftest` 19/19 exit 0; `cite-check --integrations` exit 1 naming the third-party rows; `JSON` totals in LOG.md r9 |
| 9 | coverage | C2 31/31, residue 105/211 | C2 34/34 (3 rows added), residue 140/211; C1 unchanged at 14/18 ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 34; `find … \| wc -l` → 34; residue command in the diagnostic block above |
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 12 (coverage, 7 — now the lowest axis): one internals-level family
note out of the S7 census, landed from the route-probe cluster.**
Operability sits at 8 and its remaining gap is unchanged and out of this lane's
reach: the only schedulers on this host are other identities' `systemd --user`
timers, and this round refused option (a) on that evidence rather than toggling
host state (recorded in the move log). Coverage therefore moves next, and the
route is C1: `14/18 → 15/18 = 0.8333 ⇒ floor(10 × 0.8333 × 1.0) = 8` at
C2 38/38 — one note, no proxy change. Round 11's L2 census measured S7 at **69
members / 58,075 L (re-measured by L1: the scout's 68 was the stale row count;
`charter-scribe/` holds 6 files, not 5)**, of which **55 of 69 carry no
`.mjs`-basename mention anywhere in `corpus/**/*.md` + `SKILL.md`** (strict
containment; the scout's looser "in any form" count was 46 — both measured, the
strict one is this lane's diagnostic method). The recommended entry point is the
route-probe cluster the scout ranked first (`scripts/probe-ufo-route-health.mjs`,
1,364 L, 8 uncited companions, 3,132 L to read); `scripts/fake-omp.mjs` is a
no-network NDJSON fixture that could later carry a hermetic checklist item for
that surface — an operability term, deliberately not claimed until the note
exists. The other uncovered families are the alternatives, in descending value:
S6 (2 of 5 ops watchers named), R11 and R10. S7 stays the largest gap and is the
only one whose census is already done.

One hardening is deliberately *not* applied here: the frozen `C` definition's
regex (`^\s*- \[`) admits `- [x]` lines that `surface-probe --checklists` skips,
so the term has a theoretical farming vector. Tightening it to "executed `- [ ]`
items only" changes **no number today** (all nine items are `- [ ]` and executed:
`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`), which is exactly why it must be
pre-registered as a definition change in the round whose *before* state it is
measured against — the round-11 critic raised it, and slipping it in now would
change the meaning of a before→after that is already recorded.

## Limits (recorded, not hidden)

- **A quotation of a finding is itself a finding.** The aggregator lane's
  `corpus/lessons/round-6-aggregator-audit.md` quotes its own ERROR rows; the
  round-11 re-measure counts `errors=14`, **all** inside third-party aggregator
  artifacts — `corpus/lessons/round-6-aggregator-audit.md` (2 × `LINE_OOR` at its
  :23 and :116) and `corpus/lessons/round-8-aggregator-box3-coldrun.md` (12,
  including the `PIN_MISMATCH`/`REV_UNKNOWN`/`UNRESOLVED audit-env.sh` rows),
  which the aggregator lane committed into this repo mid-round as `e79fefa` and
  then extended while this round ran: the count moved 7 → 14 inside one round,
  which is why the durable claim is lane-local ("zero errors in this lane's own
  prose"), not the third-party total. No
  quotation exemption exists or was added: those artifacts are the auditor's,
  reported and not rewritten. Owner: aggregator lane. Zero of the seven are in
  this lane's own prose.
- **Suite split (round 9).** `--selftest` measures the tool only (19 hermetic
  cases; `round-gate --selftest` follows the same rule — 57 cases after round 11,
  `proxy-check --selftest` with 55); live-tree assertions sit behind
  `--integrations`, which is red for third-party content rather than for
  tooling. One run shows both: `--selftest --integrations`.
- **The claim block recomputes, it does not justify.** `proxy-check.mjs` verifies
  that `SCORECARD.md`'s terms match the tree and that the derived scores match
  the `## Axes` rows; it cannot show that a term measures what its name suggests
  (a registry row flipped to `yes` with no note behind it passes) and it does not
  cover the file-level residue diagnostic. It also cannot see a scorecard
  *reason* — only arithmetic. Two sharper edges, both raised by the round-11
  critic: (i) a *definition edit* in the prose that leaves the counts unchanged
  (e.g. tightening "C = GFM task lines" to "C = executed items") is invisible to
  the tool, since it implements the definitions as they were frozen — the
  stanza's numbers stay satisfied while the prose means something else, so
  definition changes must be pre-registered, not slipped in; (ii) the frozen `C`
  regex `^\s*- \[` also matches `- [x]` lines that `surface-probe --checklists`
  SKIPs, so the term has a theoretical farming vector — measured, this round uses
  none of it (`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`, all nine `- [ ]`).
- **`A` counts files, not provenance.** The frozen `find` admits any matching
  file anywhere in the repo, so an untracked scratch script inflates the term —
  round 11 grew a stray `audit-env.sh` (an L2 lane's env file, removed before
  close) and `proxy-check` reported `A_DRIFT declared=4 computed=5` exit 1 rather
  than a silent +1. The detector works; the term cannot distinguish scaffolding
  from an artifact, so `A+C ≥ 12` must be re-derived at close, not assumed.
- **`round-gate --tracked` excludes the newest report** (the in-flight round), so
  a round that files once and never again keeps its own blind spot until the next
  report exists; and like audit mode it sees only *filed* reports. Both are
  recorded in `corpus/knowledge/round-close-gate.md`, not hidden.
- **YAGNI residue, re-measured in round 11.** Applied: the unreachable
  `UNPUSHED ahead=?(raw=…)` arm and the duplicate missing-`SCORECARD.md` warning
  (−3 L, no case-count change). Deferred with a reason: `citations.
  mainProbeable`/`originProbeable` (2 net lines) stay because they are observable
  `--json` diagnostics, not dead writes; the round-11 simplifier measured the
  full option set of `proxy-check.mjs` as keep (no drop).
- 49 of 52 warnings are suffix-resolved citations (real hits, under-specified
  paths) and 22 pins remain `PIN_UNTYPED` (bare hex without a declared kind).
  Round-10 delta measured in place:
  `files=36 tokens=2324 errors=2 warnings=52` → `files=37 tokens=2415 errors=2
  warnings=52`.
- **The audit mode of `round-gate.mjs` cannot see a round that filed no report**
  (it pins the latest *existing* report for the lane) — `--round N` is the
  explicit path, and the tool is a tripwire, not a monitor. Its 1024-byte and
  2-heading thresholds are this lane's bar, not fleet law; only the two citation
  checks and the `SHONEN` heading trace to written protocol
  (`PROTOCOL.md:151-152`, `:263-265`).
- **The origin tree grows under the citations.** `scripts/charter-scribe/` went
  5 → 6 files (the S7 member row in this file is corrected to 69 in round 11) and
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json` is red on the origin's
  own `sync-ufo-contracts.mjs --check` (ownerLane `nc8-runtime`, exit 1) — both
  reported, neither owned here.

## Retired

None. Neither owned axis is saturated. If the surface registry reaches 18/18
while the file-level residue stays above ~20%, coverage splits into
`coverage:script-layer` vs `coverage:runtime-layer` rather than being retired.
