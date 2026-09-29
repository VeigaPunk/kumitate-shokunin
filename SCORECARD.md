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
  hermetic suite, 10 fail-closed arms, exit 0/1/2/64); → **5** after round 14
  (+ `scripts/claims-check.mjs`, contract `kumitate-claims-v1`, 791 L, 12 finding
  kinds, 35-case hermetic suite, 5 fail-closed arms + 3 usage arms, exit
  0/1/2/64, sha256 `7bb9451d…`).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0** at `7a4c9a0`; → **4**
  after round 9 (`## Verifiable checklist`: citation gate verdict, citation gate
  hermetic suite, live sighting-surface conformance, surface-probe hermetic
  suite); → **6** after round 10 (+ round-gate hermetic suite, round-close
  artifact audit); → **9** after round 11 (+ filed-report tracking, proxy
  recompute, proxy-check hermetic suite); → **10** after round 14 (+ the
  member-claims gate). All ten are *executed*, not merely
  listed: `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`,
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

- **The family standard, stated (round 12).** A registry family counts as
  covered only when a corpus note names **every** member at internals level —
  a line anchor or a named symbol describing *that member's own behavior*.
  Usage lists, `Sources:` footers, `corpus/README.md` map/hole rows and
  `SKILL.md` do **not** count, and neither does a note that names a fraction of
  the family. This was implicit in rounds 8–11 (S6 read `partial — 2 of 5`);
  round 12 wrote it down and re-adjudicated S6 against it line by line.
- **C1 — in-scope surface coverage.** Surface families whose registry cell
  starts `yes`, over the registry below: **18 / 19 = 0.947** after round 13. The
  round-12 catch-all `S7` is partitioned into `S7` = the route-probe cluster
  (9 members; `knowledge/route-probe-cluster.md`) and the new `S8` = the
  remaining scripts (60 members; `knowledge/remaining-scripts-census.md`) — both
  `yes`, R11 stays `no`. C1_total therefore moves 18 → 19; that is a **registry**
  change and it was pre-registered in round 12's `## Planned`, not slipped into
  the round that measures it. 16 / 18 = 0.888 at round 12, 14 / 18 = 0.778 at
  round 11.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **47**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **47** after
  round 14 (rows added for `knowledge/member-claims-gate.md` and
  `lessons/round-14.md`) ⇒ **1.0** (45/45 at round-13 close).

Diagnostic, deliberately **not** scored — file granularity over the in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 42 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5 = **212** files / **211** unique basenames),
basename-matched against `corpus/**/*.md` + `SKILL.md`: **195 / 211 ≈ 0.924**
after round 13 (the numerator rose from 150 because the S8 census names 45
basenames no earlier note carried; the components re-measure 72 + 42 + 93 + 5 =
212 files / 211 unique basenames), up from **150 / 211 ≈ 0.711** at round 12,
**140 / 211 ≈ 0.663** at rounds 9–11 and 105 / 211 ≈ 0.50 in round 8 (method:
recursive walk of `corpus/**.md` + `SKILL.md`, `basename` containment).
Basename matching is collision-prone in both directions, which is why it is not
the scored term; the registry's `scripts/*/` row is 42.

#### In-scope surface registry (19 families)

| # | Family | Members (origin tree) | Corpus note |
|---|---|---|---|
| S1 | dispatcher core | `fleet-dispatcher.mjs` (14769 L) | yes — successor-chain · queue-and-claim · enqueue-admission · reconcile-and-cycle · queue-summary |
| S2 | native trial path | `run-omp-native-trial.mjs` (4693 L) + `collect-omp-native-handoff.mjs` (1943 L) + `collect-omp-native-handoff-lib/` (6) | yes — native-trial-launch · failure-telemetry |
| S3 | swarm path | `ufo-swarm-wave.mjs` (2711 L) + `ufo-swarm-collect.mjs` (988 L) | yes — dispatch-shapes · swarm-wave-lifecycle |
| S4 | sighting wall | `ufo-sighting.mjs` (396 L) + `ufo-sighting` (224 L bash) + `ufo-sighting-lib/` (26 files / 10620 L) | yes — sighting-wall |
| S5 | routing & result helpers | `omp-global-config.mjs` (735 L) + `ufo-mission-result.mjs` (3691 L) | yes — route-resolution · failure-telemetry · singleton-and-queue-ownership |
| S6 | ops watchers | `ufo-stale-watchdog.mjs` (1010 L) + `ufo-l0-monitor.mjs` (1638 L) + `ufo-l0-watch.mjs` (1679 L) + `the-tick-ping.mjs` (831 L) + `ufo-ground-handler.mjs` (859 L) | yes — ops-watchers (5 of 5 named at internals level, round 12; the round-11 reading `2 of 5` was right in number, wrong in members — `ufo-stale-watchdog.mjs` had only a usage list and a `Sources:` footer, while `ufo-l0-monitor.mjs` was named in `lessons/round-6.md`) |
| S7 | route-probe cluster + shared helpers | 9 members: 7 `probe-*.mjs` + `atomic-write.mjs` + `fake-omp.mjs` (3,132 L) — the round-12 cluster reading, now the family's whole membership (`ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9) | yes — `knowledge/route-probe-cluster.md`: 9 of 9 named at internals level, one `## ` section per member with own-file anchors and verbatim named symbols (round 13) |
| S8 | remaining scripts | 60 members: 50 top-level `*.mjs` + `charter-scribe/` (6) + `lean-cargo/` (4), 54,874 L (`ls scripts/*.mjs` → 72 − 13 S1–S6 basenames − 9 S7 members = 50; rebuilt from the tree by an independent scout, `comm -3` against the authoritative list empty) | yes — `knowledge/remaining-scripts-census.md`: 60 of 60 named at internals level, one `## ` section per member with ≥1 anchor in that member's own file and ≥1 symbol verbatim in it (605 OK refs, 0 errors, round 13) |
| R1 | judge pipeline | 8 `native*.rs` core modules | yes — native-judge-pipeline |
| R2 | loop driver + state | 12 files (`loop_driver*.rs` ×10, `state.rs`, `state_tests.rs`) | yes — loop-driver |
| R3 | profile & cost | 5 files (`execution_profile*`, `cost_ledger*`, `native_profile.rs`) | yes — cost-and-profile |
| R4 | runtime support | 6 files (`lane_overlay*`, `lease*`, `live*`) | yes — runtime-support |
| R5 | seats & admission | 4 files (`native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs`) | yes — native-admission-detail |
| R6 | dedupe + L3 | 4 files (`distill*`, `l3_swarm*`) | yes — distill-and-l3 (r7) |
| R7 | local ship + fs layer | 5 files (`local_ship*`, `bounded_fs*`, `fs_durability.rs`) | yes — local-ship (r7) |
| R8 | transcript / ledger / seat coverage | 4 files (`native_transcript.rs`, `native_ledger.rs`, `native_seat_coverage.rs`, `native_dispatch_topology.rs`) | yes — native-transcript-ledger-seats (r7) |
| R9 | judge test suite | `native_tests.rs` (340 cases; other big test files sit inside R2/R6/R7) | yes — test-inventories (r7) |
| R10 | gate | `gate.rs` (254 L) + `gate_tests.rs` (426 L) | yes — gate-verdict (2 of 2 named at internals level, round 12: enum arms with anchors, the `verdict` ladder, the five refusal literals, `validate_vector` precedence, the echo ceiling, consumers, and the 19-`#[test]` census) |
| R11 | runtime remainder + CLI | 42 runtime `.rs` + `ufo-cli/src/*.rs` (5) | no |

Covered = **18** of 19; R11 (0 of 47 named) counts as **not** covered, and so does
any family whose note names only part of it. Families are disjoint and
exhaustive: the script layer is the same 114 files it was in round 9 (72
top-level `*.mjs` + 42 under `scripts/*/`; round 8 recorded 41 and the origin
tree added one file), and round 13 cuts it three ways — S1–S6 **45** (13
top-level `*.mjs` basenames + `collect-omp-native-handoff-lib/` 6 +
`ufo-sighting-lib/` 26), S7 **9** (the probe cluster + its two helpers), S8
**60** (the remaining 50 top-level `*.mjs` + `charter-scribe/` 6 +
`lean-cargo/` 4): 45 + 9 + 60 = 114. Runtime+CLI members sum to **98** = 93 + 5.
The count does not include the five unattributed top-level shell scripts
(`scripts/dev-verify.sh`, `gates.sh`, `self-iter.sh`, `smoke.sh`,
`ufo-night-watchdog.sh`) — the frozen universe is `scripts/*.mjs` plus files
under `scripts/*/`, so they belong to no family; that is a definitional limit of
the proxy, not a member this round silently dropped.

### Machine-readable claim block (`kumitate-proxy-v1`)

`scripts/proxy-check.mjs` recomputes every term below from this tree, re-derives
both scores, and compares them with this block and with the `## Axes` integers;
`node scripts/proxy-check.mjs` → `PROXY: MATCH (…)` exit 0, `PROXY: DRIFT (…)`
exit 1, fail-closed exit 2, usage 64. The values are **claims** — the tool
re-derives and never trusts them, and it never rewrites this block. The five pins
are full sha256 hex of `scripts/*.mjs`; re-pin them after ANY edit to those files,
including `proxy-check.mjs` itself (an unrecorded edit then shows up as
`PIN_DRIFT`, not as a silently stale claim). Grammar and boundary:
`corpus/knowledge/executable-scorecard.md`.

<!-- kumitate-proxy-v1
A=5
C=10
C1=18
C1_total=19
C2=47
C2_total=47
pin.cite-check=a11ead17e20a3a6ff0663ff9b269c154e58dce27aa3a1b90f36528e1ad7d8352
pin.surface-probe=86bdcd9af7f6f4135c2958b32ebd5c835db8c3a3c2b565b068136a3e9a97cb61
pin.round-gate=4c44746384cfe4485f133ff02b00931426ef9f16382dd86142bd92abf79ab946
pin.proxy-check=d0a722c5cb06cb4edabba6cbb38d09f151a322117c273af93659bdf2fad29ba4
pin.claims-check=d0f95fa051687a8235678d4b212351c04d562abece394ae7727aa9bf763cb188
-->

## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 8 | `f_O = (A+C)/(A+C+3)` with A=5 (`scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs`, `scripts/claims-check.mjs`) and C=10 (`## Verifiable checklist`, all 10 executed by `surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`) ⇒ 15/18 = 0.8333 ⇒ 8 — 9 needs A+C ≥ 27 (12 more honest items), so the proxy saturates long before the axis does | round 14 |
| coverage | 9 | `floor(10 × 0.947 × 1.0)` = 9; C1 registry below (**18/19** — the round-12 `S7` catch-all partitioned into `S7` 9 + `S8` 60, both `yes`), C2 47/47 (`grep -c` + `find … \| wc -l`), file-level residue 195/211 ≈ 0.924 (unchanged — round 14 adds a gate, not coverage, but the `yes` cells it rests on are now machine-checked for the 9 section-form rows) | round 14 |

Why not 10 on either axis: operability now has five runnable artifacts and ten
executed checklist items, but still no CI/schedule leg, and the probes cover
citations, two live surfaces, the round record, this lane's own scorecard and the
registry's member claims — not the other 17 registry families. The next integer
needs A+C ≥ 27 (12 more honest items): the proxy saturates, the axis walks. Coverage now has **one** uncovered family
(R11, 42 runtime `.rs` + 5 CLI `.rs`, 0 of 47 named) and ~8% of in-scope source
files uncited (16 of 211 basenames never named anywhere in this lane's prose,
counting basenames rather than files and ignoring family membership); a note that
names a fraction of a family is exactly what the standard above refuses to count.
Why not 0/lower: the whole judgment path (dispatcher,
launcher, judge pipeline, loop driver, wall) is mapped at internals level with
line-level citations, and the gates that check those citations, two of those live
surfaces, this lane's round record and the scorecard claim itself now run on
demand.

Round 13 changed the *shape* of the registry, not only its value: the round-12
catch-all `S7` (69 members) was partitioned at the boundary the round-12 residue
note already drew — `S7` is now the 9-member route-probe cluster and `S8` the
60-member remainder — so both halves are judged against notes that name every
member, and `C1_total` moved 18 → 19 as a pre-registered registry change. The
partition was forced to keep top-level ids: `scripts/proxy-check.mjs` counts
registry rows with `/^\| (S|R)\d+ \|/`, so the plan's original `S7a`/`S7b` labels
would have been invisible to the tool (`C1_TOTAL_DRIFT`, measured). One more move
landed in the same round and moved no proxy term: `scripts/cite-check.mjs` could
die on a doc containing a backticked `Object.prototype` member name
(`toString`/`valueOf`/`constructor`) — a real crash reproduced before the fix and
now a hermetic case (19 → 20 cases).

Round 12 changed what the coverage score *rests on*, not only its value: the
family standard ("every member named at internals level") was written down after
being applied re-adjudicating S6, and the two families that flipped are the
fully-enumerable ones — S6 (5 members) and R10 (2) — not the 69-member S7, which
a single-cluster note could have flipped while S6 sat denied at a higher
completion ratio. Re-chartering the proxy to score the same artifacts higher is
still explicitly rejected: the formula is unchanged since round 8 and the round-12
terms are counted by the same commands the frozen definitions name.

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
| 14 | operability | A=4, C=9 ⇒ `f_O = 13/16 = 0.8125` ⇒ 8; the registry's `yes` claim was checkable only by hand (round 13 measured a renamed member section still reading `PROXY: MATCH … coverage=9` exit 0) | A=**5** (`scripts/claims-check.mjs`, contract `kumitate-claims-v1`, 791 L, 12 finding kinds, 35-case hermetic suite, 5 fail-closed + 3 usage arms, exit 0/1/2/64) + C=**10** (the member-claims gate added to `## Verifiable checklist`) ⇒ `f_O = 15/18 = 0.8333` ⇒ **8** (9 needs A+C ≥ 27 — the saturating proxy walks, it does not jump) | `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)` exit 0 (0.13 s); `--selftest` → `CLAIMS_SELFTEST: 35/35 pass` `VERDICT: PASS` exit 0; `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=5 C=10 operability=8; C1=18/19 C2=47/47 coverage=9; pins=5 match)` exit 0; `surface-probe --checklists` → `CHECKLIST: 10/10 pass` |
| 14 | operability (the compensating arm, on a doctored copy) | a `yes` cell with a renamed or deleted member section passed everything | rename → `SECTION_FILE_UNRESOLVED row=S8 …` `CLAIMS: DRIFT` exit 1; delete → `MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 59 distinct sections` exit 1; **on the same copies** `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 … coverage=9; pins=4 match)` exit 0 (claims-check moved out to hold the frozen A=4) | `LOG.md` round 14; `/tmp/kumitate-r14/census.md` §8 (independent probe, same two outcomes); critic arms 03/04 |
| 14 | coverage (uncounted) | C2 45/45; C1 18/19; the `yes` cells rested on lane prose | C2 **47/47** (two new rows); C1 unchanged 18/19 ⇒ `floor(10 × 0.947 × 1.0)` = **9**; the claim itself is now machine-checked for the 9 section-form rows (90 member sections) and the residue is printed: 9 × `ROW_NO_SECTIONS`, 4 × `MEMBER_COUNT_SUSPECT`, 3 × `SECTION_FILE_NOT_MEMBER` | `grep -c '^\| `\(knowledge\|lessons\)/' corpus/README.md` → 47; `find … | wc -l` → 47; `node scripts/proxy-check.mjs` → `C1=18/19 C2=47/47` |
| 13 | coverage | C1 16/18 (C1_total 18), C2 43/43, residue 150/211 ≈ 0.711 ⇒ `floor(10 × 0.888 × 1.0)` = 8; the pre-registered plan offered a partition (17/19 = 0.894 ⇒ **still 8**) or a census of the 60-member remainder, and named the arithmetic: only 17/18 covered or a stated partition reaches 9 | C1 **18/19** (S7 = the 9-member probe cluster, S8 = the 60-member remainder — both `yes` at internals level, one `## ` section per member with an own-file anchor and a verbatim symbol), C2 **45/45** (`knowledge/remaining-scripts-census.md` + `lessons/round-13.md`), residue **195/211 ≈ 0.924** ⇒ `floor(10 × 0.947 × 1.0)` = **9**; operability untouched (A=4, C=9 — no script and no `- [` line added) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)` exit 0; member probe `MEMBER_PROBE: 60/60 ok` (S8) and `9/9 ok` (S7); `grep -c '^\| `\(knowledge\|lessons\)/' corpus/README.md` → 45, `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 45 |
| 13 | coverage (registry change — pre-registered in round 12's `## Planned`) | S7 = a 69-member catch-all whose cell read `no`, pointed at a 9-member residue note; the plan's labels were `S7a`/`S7b` | S7 = 9 members `yes` (`knowledge/route-probe-cluster.md`, now with one `## ` section per member) + new S8 = 60 members `yes` (`knowledge/remaining-scripts-census.md`); C1_total 18 → 19. `S7a`/`S7b` were **refused on measurement**: `RE_REGISTRY_ROW = /^\| (S\|R)\d+ \|/` (`scripts/proxy-check.mjs:140-144`) makes a suffixed id invisible — the critic's arm measured `C1_TOTAL_DRIFT declared=18 computed=17` | registry rows 108-109; independent scout census (`comm -3` vs the authoritative list → empty; `wc -l` total 54874); critic arms (i)/(iii)/(iv)/(v) |
| 13 | operability (uncounted: a defect repair inside a coverage round, no proxy term moves) | `scripts/cite-check.mjs` — the lane's citation gate — died with an uncaught `TypeError [ERR_INVALID_ARG_TYPE] … Received function toString` (no verdict line) on any doc containing a backticked `Object.prototype` member name (`toString`, `valueOf`, `constructor`, `hasOwnProperty`): `ALIASES` was a plain object literal, so `ALIASES['toString']` returned the inherited function and `aliasRec` joined `opts.src` with it; `GENERATED_POINTERS` had the same shape. 19 hermetic cases | three token-keyed maps are null-prototype; a fixture doc + a hermetic regression case added; `node scripts/cite-check.mjs --selftest` → `20/20 cases passed (hermetic)` `VERDICT: PASS` exit 0. The un-fixed file with the same fixture dies inside the suite (exit 1) — failing-before/passing-after both recorded | `node scripts/cite-check.mjs --selftest`; A and C unchanged (A=4, C=9), so `operability` stays 8 and only `pin.cite-check` is re-pinned; defect found by an L2 executor, reproduced by L1 before repair |
| 12 | coverage | C1 14/18 (S6 `partial — 2 of 5 named`, R10 `no`), C2 39/39, residue 140/211 ≈ 0.663 ⇒ `floor(10 × 0.778 × 1.0)` = 7; round 11's plan named S7's route-probe cluster as the route | C1 **16/18** (S6 5 of 5, R10 2 of 2 — both notes landed at internals level with a per-member probe), C2 **43/43** (3 knowledge notes + `lessons/round-12.md`), residue **150/211 ≈ 0.711** ⇒ `floor(10 × 0.888 × 1.0)` = **8**; the pre-registered S7 route was **deviated from on evidence** — a 9-of-69 cluster note would have flipped a family at 13% named while S6 sat denied at 40%, so S7 keeps `no` and the cluster note lands as C2-only residue progress; operability untouched (A=4, C=9 — the round adds no script and no `- [` line) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)` exit 0; `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 43; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 43; member probes in `knowledge/ops-watchers.md` and `knowledge/gate-verdict.md` (both printed with their output); 7/7 mutation arms re-proved incl. a dishonest `yes` flip → `C1_DRIFT` |
| 12 | coverage (uncounted) | S7 69 members, 0 named | S7 row keeps `no`; `knowledge/route-probe-cluster.md` names 9 members at internals level (`ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9; `wc -l … \| tail -1` → `3132 total`; the narrower `probe-*` glob is 7 files / 2,651 L — both measurements recorded) | registry S7 cell; `corpus/knowledge/route-probe-cluster.md` (`## Scope — this note does NOT cover S7`); README row |
| 11 | operability | A=3, C=6 ⇒ `f_O = 9/12 = 0.75` ⇒ 7; the plan fixed the arithmetic (`A+C ≥ 12` for 8) and named (a) a scheduled/CI leg or (b) three more genuinely executed items | A=4 (`scripts/proxy-check.mjs`, contract `kumitate-proxy-v1`, 1173 L, 9 finding kinds, 10 fail-closed arms, 55-case hermetic suite) + C=9 (+ filed-report tracking, proxy recompute, proxy-check hermetic suite) ⇒ `f_O = 13/16 = 0.8125` ⇒ **8**; option (a) refused on evidence — the only schedulers on this host are `systemd --user` timers owned by other identities (`ai-usage`, `webzites-probe`, `charter-scribe`) and the kake lane's recorded precedent is that a lane does not toggle host state itself (`.ufo/l0-questions.md`, kake round-12); a parse defect found by L1 falsification AFTER the suite was green — a `\|` inside a registry cell shifted the 4th-cell test and silently stopped counting that row — was fixed with two regression cases (suite 53 → 55, re-pinned) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)` exit 0; `--selftest` → `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0; `surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass` exit 0; `round-gate.mjs --tracked` → `ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)` exit 0; `round-gate.mjs --selftest` 57/57 exit 0; failures kept: `--tracked --close` exit 64, `--tracked --lane other` exit 2 `NO_FILED_REPORTS`, stanza/registry/pin mutations → `PROXY: DRIFT` exit 1; the `\|`-row falsification that exposed the parse defect produced a false MATCH before the fix and the correct parse after it; close: `node scripts/round-gate.mjs --close` → `ROUND_GATE: CLEAN (round=11 lane=kumitate checks=13 errors=0 warnings=0)` exit 0 |
| 11 | coverage | C1 14/18, C2 36/36 | C2 39/39 (rows: `knowledge/executable-scorecard.md`, `lessons/round-11.md`, and the third-party `lessons/round-8-aggregator-box3-coldrun.md` the aggregator lane committed into this repo mid-round); C1 unchanged 14/18; residue 140/211 ≈ 0.663 (re-measured, unchanged — both notes cite this lane's own tools and fleet docs, not origin sources) ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 39; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 39; residue loop over 211 unique basenames |
| 10 | operability | A=2, C=4 ⇒ `f_O = 6/9` ⇒ 6; round 9's plan offered (a) a third live surface — which "raises no proxy term" — or (b) widening the checklist to the round-close gates | A=3 (`scripts/round-gate.mjs`, contract `kumitate-round-gate-v1`, 1226 L, 14 finding kinds, 49-case hermetic suite) + C=6 (2 new executed items) ⇒ `f_O = 9/12 = 0.75` ⇒ **7** | `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass` exit 0; `round-gate.mjs --selftest` → `ROUND_GATE_SELFTEST: 49/49 pass` `VERDICT: PASS` exit 0 (3.1 s); default audit → `ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10 errors=0 warnings=1)` exit 0; `--round 42` → `DRIFT` exit 1; `--reports-dir /nonexistent` → exit 2 `REPORTS_DIR_MISSING`; `--repo /tmp` → exit 2 `NOT_A_GIT_WORKTREE`; `--bogus` → exit 64; cited-commit arms falsified live (`COMMIT_CITED_UNRESOLVED [deadbeef0]`; `COMMIT_CITED_NOT_ANCESTOR [d65aa24 31f09cd 0ac2272]` against a clone checked out at `efe19da`) |
| 10 | coverage | C1 14/18, C2 35/35 | C2 36/36 (2 rows: `knowledge/round-close-gate.md`, `lessons/round-10.md`); C1 unchanged 14/18; residue 140/211 unsplit ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 36; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 36; residue loop over 211 unique basenames |
| 9 | operability | A=1, C=0 ⇒ `f_O = 1/4` ⇒ 2; and the one gate had a non-hermetic suite (`--selftest` 27/28, `VERDICT: FAIL`, exit 1, broken by a sibling lane's doc) | A=2 (`scripts/surface-probe.mjs`, 1438 L: 12 conformance checks, 38 hermetic fixtures, `--json`, exit 0/1/2/64) + C=4 (executed checklist) ⇒ 6/9 ⇒ 6; `cite-check --selftest` split to 19 hermetic cases (`VERDICT: PASS`, exit 0 any tree state) with live assertions behind `--integrations` (exit 1, findings preserved) | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` exit 0 (0.19 s); `surface-probe --selftest` 38/38 exit 0 (0.35 s); `surface-probe --checklists` `CHECKLIST: 4/4 pass` exit 0; `cite-check --selftest` 19/19 exit 0; `cite-check --integrations` exit 1 naming the third-party rows; `JSON` totals in LOG.md r9 |
| 9 | coverage | C2 31/31, residue 105/211 | C2 35/35 (3 rows added), residue 140/211; C1 unchanged at 14/18 ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 34; `find … \| wc -l` → 34; residue command in the diagnostic block above |
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 13 (executed) vs the forecast above.** The pre-registered 13-plan is the
row that ran, with one substitution and one addition, both measured:

- The partition was executed, but **not with the `S7a`/`S7b` labels the plan
  used**: a suffixed id is invisible to `RE_REGISTRY_ROW` (`/^\| (S|R)\d+ \|/`,
  `scripts/proxy-check.mjs:140-144`), so the split is `S7` = the 9-member cluster
  and `S8` = the new 60-member remainder. The plan's id labels would have
  produced `C1_TOTAL_DRIFT`, measured on a copy before landing.
- Option 1 alone (partition ⇒ 17/19 = 0.894) would have moved **no** score; the
  round did option 1 **and** option 2 (name all 60 members), so the forecast's
  "plus a smaller remainder to name later" is already named: C1 18/19 ⇒ 9.
- The forecast's "17/18 ⇒ 9" for the un-partitioned registry was right and is now
  unreachable by construction — the 69-member catch-all no longer exists.

**round 14 (executed) vs the forecast above.** The round-13 plan's option 2 (the
`--claims` mode) ran, as an **operability** move (this lane's lowest axis), with
two measured deviations from the forecast:

- It landed as a **separate artifact**, not a mode inside `scripts/proxy-check.mjs`.
  The forecast's `A=4 → 5` for the in-proxy placement is **refuted by the frozen
  definition**: `A` is a file count (`scripts/proxy-check.mjs:281`), so a new mode
  in an existing file moves no term. The separate artifact also keeps the proxy's
  self-only arithmetic free of origin-tree I/O.
- `C` moved 9 → 10 (the forecast said "C unchanged"): the gate needs its S
  execution path, and `surface-probe --checklists` executes it — measured
  `CHECKLIST: 10/10 pass`.
- Neither option 1 (R11) nor option 3 (the `C` regex tightening) was combined in:
  the round is one axis-move.

**round 15 (pre-register, one move).** Coverage, and it must be declared *before*
it is measured, because it saturates:

1. **R11** — the last uncovered family (42 runtime `.rs` + 5 CLI `.rs`, 0 of 47
   named) at internals level ⇒ C1 **19/19** ⇒ `floor(10 × 1.0 × 1.0)` = **10**,
   i.e. saturation. The same round must therefore **split coverage** into
   `coverage:script-layer` (`S1`–`S8`, 114 members) and `coverage:runtime-layer`
   (`R1`–`R11`, 98 members), each keeping its own C1/C2 pair and the family
   standard — a **definition change, pre-registered here** rather than slipped
   into the round that measures it. If the split is judged too large for one
   round, R11 lands alone and coverage is *retired as saturated* with the split
   recorded as the successor axis.
2. Alternative single move if R11 is judged too large: extend `claims-check` with
   a paragraph-level arm (a member named with a live anchor **and** a verbatim
   symbol outside any member section), which would let the 9 topic-form rows be
   probed weakly — an **operability** move again, `A+C` 15 → 16, still ⇒ 8.

**round 14's pre-plan (kept for the record, executed in part).** In preference
order:

1. **R11 coverage** — the last uncovered family (42 runtime `.rs` + 5 CLI `.rs`),
   named at internals level the same way. Pure coverage work, but it lands at
   C1 19/19 ⇒ `floor(10 × 1.0 × 1.0)` = **10**, i.e. saturation, which this
   scorecard must not claim while the file-level residue is 0.924 and the family
   standard rests on lane prose. If it lands, coverage retires or splits (see
   `## Retired`).
2. **The `--claims` mode** — move the member probe into `scripts/proxy-check.mjs`
   so a `yes` cell is re-derived from the notes. That is an **operability** move
   (A=4 → 5, C unchanged; `f_O = 14/17 = 0.823` ⇒ still 8) and it closes the
   loudest hole both the round-12 and round-13 critics found; it needs its own
   pin, its own hermetic cases and its own before/after row.
3. **The frozen `C` regex tightening** (`^\s*- \[` admits `- [x]` lines that
   `surface-probe --checklists` skips) — still a **definition** change, still
   changes no number today (`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`), so it
   must be declared in the round whose *before* state is measured against it.

Only one of these is one axis-move; they are pre-registered here and must not be
combined in a round that also claims a first.

## Limits (recorded, not hidden)

- **The family standard is lane prose, and it was re-adjudicated (round 12).**
  `SCORECARD.md` now states the rule the registry had been applying implicitly
  ("every member named at internals level; usage lists, `Sources:` footers,
  README hole rows and `SKILL.md` do not count"), and S6 was re-adjudicated
  against it line by line: the number stayed 2 of 5, the *members* changed
  (`ufo-l0-watch.mjs` and `ufo-l0-monitor.mjs` were named; `ufo-stale-watchdog.mjs`
  was only a usage list plus a `Sources:` footer). A scout's looser reading
  (counting those as naming ⇒ "3 of 5") was rejected, and both readings are
  recorded so a non-author can see the disagreement rather than one number.
- **Member completeness is not machine-checked by `proxy-check.mjs`.** It parses
  the registry cell (`cells[4].startsWith('yes')`) and the C2 row regex, never
  note contents, so the *cheapest* fake — flip two cells, update the stanza and
  the `## Axes` integer — passes all arithmetic checks. The answer is the
  per-note member probe (one `## ` heading per member, each with an anchor in that
  member's own file and a verbatim symbol, printed with its output in the note);
  it is a documentation check a reader or lane can re-run, not a gate. Round 13
  measured the hole rather than restating it: with one member section renamed,
  `MEMBER_PROBE: 58/60 ok` exit 1 (S8) and `7/9 ok` exit 1 (S7) while
  `scripts/proxy-check.mjs` still printed `PROXY: MATCH … coverage=9` exit 0, and
  a registry row flipped to `yes` with no note behind it also passes. Turning the
  probe into a gate (`--claims` mode re-deriving member coverage from the notes)
  is pre-registered for round 14 and is deliberately not slipped into this round.
  The probe is also blind to what it cannot read: it checks shape (heading, live
  anchor, symbol presence), never whether the sentence around the anchor is true.
- **The route-probe cluster's boundary is a stated rule, not a natural kind.**
  9 members (`probe-*.mjs` ×7 + `atomic-write.mjs` + `fake-omp.mjs`; 3,132 L) is
  this lane's cluster definition, chosen because both helpers are imported by the
  cluster's suites; the narrower `probe-*` glob gives 7 files / 2,651 L. The
  round-11 plan's "8 uncited companions / 3,132 L" matches the 9-member reading
  (8 companions = members − hub), so its figure was a membership-boundary
  artifact, not a wrong number. Round 13 promoted this rule to a **registry
  boundary** (S7 = these 9, S8 = the other 60), which is what makes S7's `yes`
  honest: the same 9 files that were "13% of a family" in round 12 are now 100%
  of a smaller one. `scripts/omp-global-config.mjs` is excluded (S5 member,
  already covered).
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
- **Suite split (round 9).** `--selftest` measures the tool only
  (`cite-check` 20 hermetic cases after the round-13 regression case;
  `round-gate --selftest` follows the same rule — 57 cases after round 11,
  `proxy-check --selftest` with 55); live-tree assertions sit behind
  `--integrations`, which is red for third-party content rather than for
  tooling. One run shows both: `--selftest --integrations`.
- **A gate that dies is not a gate that disagrees.** Round 13 repaired a real
  crash in `scripts/cite-check.mjs`: a backticked `Object.prototype` member name
  in ANY doc (`toString`, `valueOf`, `constructor`, `hasOwnProperty`) walked the
  prototype chain of three token-keyed map literals and threw
  `ERR_INVALID_ARG_TYPE` from `path.join` before any verdict line — the process
  died, so a reader saw no `CLEAN`/`DRIFT`. Reproduced by L1 before the fix, fixed
  by making the three maps null-prototype, covered by a hermetic case that fails
  on the un-fixed file (`--selftest` dies, no verdict) and passes after
  (`20/20 cases passed (hermetic)`). The class matters more than the instance:
  this lane's gates are also its evidence, so an unhandled throw in one is a
  silent hole in the round record, not just a tool bug.
- **`REF_OWNER_AMBIG` can rebind a ref to the wrong file.** `cite-check`
  attributes a short `:N` ref to the most recent explicit path token; when a
  sentence mentions another file's path before the ref, the ref is rebound to a
  file whose length fits. In round 13, 17 refs across the two new notes were
  ambiguous and **three of them** (`scripts/ufo-swarm-wave.test.mjs:158/573/980`)
  were rebound to the SUT `scripts/ufo-swarm-wave.mjs`, which also fits — the
  author's intent was the suite. Both notes were repaired to cite the intended
  file explicitly (17 → 0 ambiguities), and the durable rule is: a ref that
  follows a foreign path token must be written with its own full path.
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
  reported, neither owned here. Round 13 measures the drift it must survive:
  origin HEAD moved `ee907f1cf` → `daa371583` → `4f34e7dab` over rounds 12–13 with
  35 dirty paths at the round-13 reading, and every one of the 69 census targets
  was checked for a same-day mtime (none; newest 2026-09-27 20:17) before its
  anchors were written, so the 605 + 270 refs in the two new notes are pinned to a
  revision the origin was not editing. A future re-census must re-run the probes,
  not trust this file's numbers.
- **The census counts 45 + 9 + 60 + the five unattributed shell scripts.** The
  frozen universe is `scripts/*.mjs` plus files under `scripts/*/`; five
  top-level shell scripts (`scripts/dev-verify.sh`, `gates.sh`, `self-iter.sh`,
  `smoke.sh`, `ufo-night-watchdog.sh`) sit outside it and belong to no family, so
  no registry row can ever name them. Recorded as a definitional limit rather
  than absorbed into S8, whose cell would otherwise be inflated by files the
  family definition does not cover.

- **The claims gate is blind exactly where the registry is prose (round 14).**
  Measured: the 9 topic-form rows (S1–S5, R1, R2, R5, R7 — zero path-like member
  headings) get only note existence and `NOTE_FOREIGN`; a note that names one
  member of five passes (the critic's cheapest surviving fake). Pointing a `yes`
  cell at a *larger* foreign note passes too, as a warning spike (`sections=145
  adv=76`, still `MATCH` exit 0). The arms are armed for the 9 section-form rows
  (90 sections) and for the shape rules everywhere — shape, never sentence truth.
- **The proxy's saturating integer is now the binding constraint (round 14).**
  `f_O = (A+C)/(A+C+3)` gives 8 for 13 ≤ A+C ≤ 26 and 9 only at A+C ≥ 27, so a
  round can add two honest terms and still read `8 → 8`. The before→after row
  therefore records `f_O` (0.8125 → 0.8333), not the integer, and the axis is
  walked rather than inflated.
- **The hermetic suite is nominal, not mutation-complete (round 14, measured by
  an L2 audit lane).** 41 one-line mutations were applied to the gate: the suite
  killed 16 and let 25 through, 12 of which change the frozen acceptance itself
  (a symbol-heading exemption → `sections` 90→106; the bare-`:N` own-file binding
  → 17 errors; the exact-path resolver → 2 errors; the covered-row test → `yes`
  19; the escape-aware splitter → `yes=17 sections=81`; the `adv`/`notes`/
  `sections`/`yes` totals → 0/0/0/19; the directory-family matcher → `adv=24`;
  the extension set / trailing-prose headings → `sections=76`). The suite was
  strengthened in the same round with three cases — unknown-row usage, the symbol
  threshold, the anchor-liveness boundary — and now pins the **exact verdict line**
  on two fixtures so a kind-blind totals mutation fails, but the audit's verdict
  stands: it is a regression net for the arms, not a proof that the arms are
  correct. Treated as a worklist, and the paragraph-level arm is pre-registered
  for round 15.
- **Two `--symbols` findings are pre-existing and belong to older rounds.**
  `SKILL.md` `PROTOCOL.md:264-265` / `HEAD` (`--symbols`-only `SYMBOL_OFF_LINE`,
  the sentence was `SKILL.md:607` at HEAD and moved to `:620` when round 14's
  bullet was inserted) and `corpus/knowledge/live-surface-probe.md:176`
  (`base.mjs:586` / `UNEXPECTED_ERROR`). Plain-mode lane-local errors are 0;
  the repo-wide 14 are the two third-party aggregator artifacts.

## Retired

None. Neither owned axis is saturated. Coverage now stands at 18/19 with **R11**
(42 runtime `.rs` + 5 CLI `.rs`, 0 of 47 named) as the only uncovered family; if
that lands, C1 reaches 19/19 and the axis is saturated at 10 — at which point
coverage splits into `coverage:script-layer` vs `coverage:runtime-layer` (the
file-level residue is 0.924, not 1.0, and the family standard is still lane prose
rather than a gate) rather than being retired.
