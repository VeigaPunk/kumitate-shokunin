# executable scorecard — this lane's own axes, re-derived

`scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`): zero-dep ESM, node
≥20, READ-ONLY on every input, no network. It reads this repo's own tree —
`SCORECARD.md`, `SKILL.md`, `corpus/README.md`, `corpus/knowledge/`,
`corpus/lessons/` — and, for the two round-16 layer terms only, the origin tree
`--src`; it recomputes the twelve frozen terms, the four scores and the five
script pins (`SCORECARD.md:15-179`), and turns them into one verdict. Text mode's
last line is
`PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q> coverage=<s>; S=<s>/<m> coverage:script-layer=<s>; R=<s>/<m> coverage:runtime-layer=<s>; pins=<n> match)`
or `PROXY: DRIFT (…)` (`scripts/proxy-check.mjs:115-120`); `--json` is a single
object, schema id `kumitate-proxy-v1`. Exit 0 match · 1 drift · 2 fail-closed ·
64 usage. The four legacy terms stay self-only; the layer terms read the origin
tree once, in process, through `scripts/claims-check.mjs`'s `probeSections()` (an
import, never a subprocess), with `SRC_NOT_A_DIR` fail-closed
(`scripts/proxy-check.mjs:144-150`).

## The interface (frozen; quoted, not paraphrased)

```
usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--json] [--strict]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1
```

Modes (one per run; argument parsing precedes modes, so an unknown flag or a flag
without a value is refused with 64 even when `--selftest` is present —
`scripts/proxy-check.mjs:122-125`, `parseArgs()` at
`scripts/proxy-check.mjs:1508`, `main()` at `scripts/proxy-check.mjs:1540`):
default = recompute the twelve terms (`A`, `C`, `C1`, `C1_total`, `C2`,
`C2_total`, `S_members`, `S_sections`, `R_members`, `R_sections`,
`coverage_script`, `coverage_runtime`), the four scores and the five pins under
`--self`, then compare them with the `kumitate-proxy-v1` stanza in `--scorecard`
(default `<self>/SCORECARD.md`); `--selftest` = hermetic fixture suite (tmp dirs
only — it never reads this repo, the scorecard, the origin tree or the
environment); `-h|--help` = print USAGE, exit 0. `--self DIR` defaults to the
repo root containing the script (`DEFAULT_SELF` at
`scripts/proxy-check.mjs:174`), the same sibling convention
`scripts/surface-probe.mjs` and `scripts/round-gate.mjs` use. `--src DIR` selects
the origin tree the two layer terms are counted over — walked exactly once, in
process, by the claims gate's `probeSections()` on every default-mode run (the
layer terms are not optional) — defaulting to `$UFO_SRC` or this lane's origin
checkout (`process.env.UFO_SRC || …`, the tool's only environment read); a
non-directory is refused as `SRC_NOT_A_DIR` (exit 2), because the layer terms
cannot be scored without it. `--strict` promotes the one
advisory kind (`PIN_UNPINNED`) to a failure (`summarize()` at
`scripts/proxy-check.mjs:612`).

## The contract it executes — term → frozen command → what it guards

Each term is defined once, in `SCORECARD.md`, and never restated as a second
source here; the module's own patterns are
`scripts/proxy-check.mjs:216-224`:

| Term | Frozen command (source) | What it guards |
|---|---|---|
| `A` — runnable artifacts | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` (`SCORECARD.md:25-38`) | the operability numerator counts *files* — any `.git` tree pruned (`scripts/proxy-check.mjs:312-323`) — so "N runnable artifacts" cannot drift from the tree |
| `C` — executable checklist items | `grep -c '^\s*- \[' SKILL.md` (`SCORECARD.md:39-51`) | the checklist term counts GFM task lines that `node scripts/surface-probe.mjs --checklists` actually executes under `CHECKLIST_RE` (`scripts/surface-probe.mjs:162`, parse site `scripts/surface-probe.mjs:781-785`) — a prose bullet is not credited |
| `C1` — in-scope surface coverage | rows `^\| (S\|R)\d+ \|` in `SCORECARD.md` whose 4th `\|`-separated cell, trimmed, starts with `yes`; `C1_total` = **all** such rows (table `SCORECARD.md:114-153`; `scripts/proxy-check.mjs:336-361`) | a family counts as covered only when its row says `yes`; `partial` (S6) therefore counts as not covered, and the denominator is the table's own size. Escaped `\|` inside a cell is **not** a cell break (`splitRowCells()` at `scripts/proxy-check.mjs:336-348`): round 11 found by falsification that a naive `split('|')` let a `\|`-bearing row shift the 4th-cell test to a prose cell and silently stop counting that row — fixed, with two regression cases in the suite |
| `C2` — README-map freshness | rows in `corpus/README.md` matching `^\| \`(knowledge\|lessons)/` over `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` (`SCORECARD.md:88-94`; `scripts/proxy-check.mjs:325-335`) | every corpus note has a README row; a deleted note or a deleted row moves the term |
| `S_members` / `R_members` — declared layer members | one walk of the **origin tree**: `scripts/<name>.mjs` plus any file under `scripts/<dir>/` (recursive) → script layer; `crates/ufo-core-runtime/src/<name>.rs` plus `crates/ufo-cli/src/<name>.rs` → runtime layer (`S_members` 114 = 72 + 42; `R_members` 98 = 93 + 5, 2026-09-28) | the denominators are the same 212-file universe the unscored residue diagnostic walks — counted from the origin tree, so a member added or deleted upstream moves the term and the universe cannot silently shrink to flatter the ratio |
| `S_sections` / `R_sections` — gate-verified member sections | Σ in-family section **occurrences** from `scripts/claims-check.mjs`'s `probeSections()` derivation (`inFamily === true`): 74 script-layer + **69** runtime-layer; raw total 146, with R9's 3 out-of-family sections excluded | one section must resolve to a declared member and carry a live own-file anchor + verbatim symbol. Limit found round 17: this counter is occurrence-based while the gate's declared-count finding dedupes files; require occurrence=distinct for a score-changing row until the queued distinct-numerator hardening lands |
| `coverage_script` / `coverage_runtime` — successor scores | `floor(10 × C1s/C1s_total × S_sections/S_members)` = `floor(10 × 8/8 × 74/114)` = **6**; `floor(10 × C1r/C1r_total × R_sections/R_members)` = `floor(10 × 11/11 × 69/98)` = **7** (`C1s`/`C1r` = `yes` rows among ids starting `S`/`R`) | the retired `coverage` split at its own saturation: the honesty term is what the aggregate's saturated `C2` pair never measured. Round 16 first measured 6/6 at runtime 60/98; round 17 moved runtime to 69/98 and 7 |
| pins | `sha256` of `scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs`, `scripts/claims-check.mjs` (`scripts/proxy-check.mjs:188-195`) | the tools a document describes are byte-for-byte the tools on disk; a pin whose file is absent is reported `computed=absent (…)`, never skipped (`scripts/proxy-check.mjs:527-549`) |
| derived scores | `operability = floor(10 × (A+C)/(A+C+3))`, `coverage = floor(10 × C1/C1_total × C2/C2_total)` (`SCORECARD.md:20-113`; `scripts/proxy-check.mjs:363-369`) | the arithmetic in `## Axes` is the arithmetic of the recomputed terms, not a remembered number |

The registry is parsed out of the **same** `SCORECARD.md` the stanza lives in
(`scripts/proxy-check.mjs:351-361`), so a registry edit and a stanza edit cannot
silently disagree: the next run raises `REGISTRY_MISSING` if the table is gone,
`C1_DRIFT` / `C1_TOTAL_DRIFT` if the counted rows change.

## The stanza grammar (the machine-readable claim block)

Exactly one HTML comment block in `<self>/SCORECARD.md`, first line
`<!-- kumitate-proxy-v1`, body lines `key=value`, closed by a line containing
`-->` (`scripts/proxy-check.mjs:88-104`, parser at
`scripts/proxy-check.mjs:452-506`). All **seventeen** keys are required exactly
once; no other key is accepted — twelve integer terms (`A`, `C`, `C1`,
`C1_total`, `C2`, `C2_total`, `S_members`, `S_sections`, `R_members`,
`R_sections`, `coverage_script`, `coverage_runtime`) plus the five `pin.*` keys:

```
<!-- kumitate-proxy-v1
A=5
C=10
C1=19
C1_total=19
C2=52
C2_total=52
S_members=114
S_sections=74
R_members=98
R_sections=60
coverage_script=6
coverage_runtime=6
pin.cite-check=a11ead17e20a3a6ff0663ff9b269c154e58dce27aa3a1b90f36528e1ad7d8352
pin.surface-probe=86bdcd9af7f6f4135c2958b32ebd5c835db8c3a3c2b565b068136a3e9a97cb61
pin.round-gate=4c44746384cfe4485f133ff02b00931426ef9f16382dd86142bd92abf79ab946
pin.proxy-check=<64-hex sha256 of scripts/proxy-check.mjs after the round-16 edit>
pin.claims-check=<64-hex sha256 of scripts/claims-check.mjs after the round-16 edit>
-->
```

The values above are this lane's **round-16** block — the twelve terms as
measured 2026-09-28 (`C2=52` once the round's two notes and rows land); the two
pins the round actually changes are shown as placeholders because their hex is
the sha256 of the edited files themselves, and the live hex is in
`SCORECARD.md:167-179`. The **round-11** block — the historical snapshot from
before the two layer terms and the successor scores existed — read `A=4 C=9
C1=14 C1_total=18 C2=39 C2_total=39`, ten keys. The pins are full hex rather
than abbreviating `…` because the tool requires `[0-9a-f]{64}`
(`scripts/proxy-check.mjs:224`). Every value is a *claim*: the tool re-derives
each one from the tree and never trusts it, and it never rewrites the block
(`scripts/proxy-check.mjs:88-104`).

Fail-closed outcomes of the grammar itself (`scripts/proxy-check.mjs:127-143`,
`scripts/proxy-check.mjs:452-506`): no block → `STANZA_MISSING`; **more than one
block**, no `-->` terminator, a body line that is not `key=value`, a **required
key absent**, or a value outside `\d+` (counts) / `[0-9a-f]{64}` (pins) →
`STANZA_MALFORMED`; an unknown key → `STANZA_KEY_UNKNOWN`; a repeated key →
`STANZA_KEY_DUPLICATE`.

Consequence to keep in mind: the block must be re-pinned after ANY edit to the
five pinned scripts, including an edit to `proxy-check.mjs` itself —
`pin.proxy-check` is the checker's own sha256, so an unrecorded edit shows up as
`PIN_DRIFT` exit 1 rather than as a silently stale claim (the maintenance tax is
the point).

## The axes cross-check

The four derived scores **must equal** the integers in `SCORECARD.md`'s `## Axes`
rows — `| operability | N |` (term `operability`), `| coverage | N |` (term
`coverage`) and the two round-16 rows `| coverage:script-layer | N |` /
`| coverage:runtime-layer | N |` (terms `coverage_script` / `coverage_runtime`),
paired by the frozen `AXIS_ROWS` mapping
(`scripts/proxy-check.mjs:197`, `scripts/proxy-check.mjs:591-610`). A mismatch —
*including a missing row or a missing `## Axes` section* — is `AXES_DRIFT`
(error, exit 1), so the scorecard's prose and its arithmetic are tied together by
an executable check. The lookup is scoped to the `## Axes` section body on
purpose (`scripts/proxy-check.mjs:576-589`): an unscoped search would let a
move-log row (`| 11 | operability | … |`) shadow the current axis row. The move
log is **not** parsed — it is history, and the tool grades the present state only.

## Exit map and verdict line

| Exit | Meaning |
|---|---|
| 0 | match — `PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q> coverage=<s>; S=<s>/<m> coverage:script-layer=<s>; R=<s>/<m> coverage:runtime-layer=<s>; pins=<n> match)` |
| 1 | drift — `PROXY: DRIFT (<KIND term=… declared=… computed=… delta=…>…)`, one finding per mismatching term (kinds `A_DRIFT`, `C_DRIFT`, `C1_DRIFT`, `C1_TOTAL_DRIFT`, `C2_DRIFT`, `C2_TOTAL_DRIFT`, `S_MEMBERS_DRIFT`, `S_SECTIONS_DRIFT`, `R_MEMBERS_DRIFT`, `R_SECTIONS_DRIFT`, `COVERAGE_SCRIPT_DRIFT`, `COVERAGE_RUNTIME_DRIFT`), per pin (`PIN_DRIFT`) and per axis (`AXES_DRIFT`) |
| 2 | fail-closed — `PROXY: FAIL-CLOSED (<TOKEN>) <detail>` |
| 64 | usage (unknown flag, or a flag without a value) |

Same four-value shape as the three gates beside it (`cite-check.mjs`,
`surface-probe.mjs`, `round-gate.mjs`: 0/1/2/64), so the checklist grammar's
`exit <n>[|<m>…]` reads identically for all four. `--json` mirrors the same
verdict in one object (`{"contract":"kumitate-proxy-v1","mode":"check","ok":…,
"verdict":…,"exitCode":…,"self":…,"scorecard":…,"src":…,"terms":{…},
"findings":[…]}` — the `src` key is the round-16 addition, next to `self` and
`scorecard`; a fail-closed body carries `"verdict":"FAIL-CLOSED"` with the token
as its single finding).

## Fail-closed arms (exit 2)

The principle is the one `corpus/knowledge/round-close-gate.md` records for the
round contract: when the claim surface cannot be read, "absent" must never be
reported as `MATCH`.

| Arm (printed token, in check order) | Trigger (`scripts/proxy-check.mjs:127-143`, `scripts/proxy-check.mjs:234-238`) |
|---|---|
| `SELF_NOT_A_DIR` | `--self DIR` (or the script's own root) is absent or not a directory |
| `SRC_NOT_A_DIR` | `--src DIR` (or its `$UFO_SRC` / default origin checkout) is absent or not a directory — the four legacy terms do not need it, but the two layer terms cannot be derived, so the whole verdict is refused rather than one score printed |
| `SCORECARD_MISSING` | `<self>/SCORECARD.md`, or `--scorecard FILE`, absent — no claim block and no registry to compare against |
| `STANZA_MISSING` | no HTML comment block whose first line is `<!-- kumitate-proxy-v1` |
| `STANZA_MALFORMED` | more than one block, no `-->` terminator, a body line not `key=value`, a required key absent, or a value outside `\d+` / 64-hex |
| `STANZA_KEY_UNKNOWN` | a key outside the frozen seventeen — the twelve integer terms (`A`, `C`, `C1`, `C1_total`, `C2`, `C2_total`, `S_members`, `S_sections`, `R_members`, `R_sections`, `coverage_script`, `coverage_runtime`) plus the five `pin.*` keys |
| `STANZA_KEY_DUPLICATE` | a key declared twice |
| `REGISTRY_MISSING` | no `\| S<n> \|` / `\| R<n> \|` registry row in the scorecard |
| `SKILL_MISSING` | `<self>/SKILL.md` absent — term C has no input |
| `README_MISSING` | `<self>/corpus/README.md` absent — term C2 has no input |
| `CORPUS_DIRS_MISSING` | either corpus dir absent, **or** the corpus census is empty (no `*.md`) — the C2 denominator would otherwise be zero, and a proxy that divides by zero still prints a number |

Not in that frozen list: `INTERNAL_ERROR`, the crash net, so an unexpected throw
is a refused verdict rather than a stack trace
(`scripts/proxy-check.mjs:1554-1557`).

## What it deliberately does not check

- **No writes and no subprocess on the measurement path.** Under `--self` +
  scorecard + the `--src` origin tree it reads only: no writes, no network, no
  subprocess, no git, no lock (`scripts/proxy-check.mjs:144-148`) — the origin
  tree is opened through the imported `probeSections()`, never a shell-out.
  `--selftest` is the only writer *and* the only spawner — it runs the script as
  a child into a fresh `mkdtemp` it removes afterwards
  (`scripts/proxy-check.mjs:830`, `scripts/proxy-check.mjs:872`,
  `scripts/proxy-check.mjs:1461`).
- **Exactly one environment variable is consulted.** `proxy-check.mjs` takes its
  own tree and scorecard from the script's location, so a polluted env cannot
  move the legacy terms; since round 16 the sole env read is `UFO_SRC`, used only
  as `--src`'s default (the origin tree the two layer terms count over), so the
  self-only half of the verdict stays env-independent — and `--selftest` reads
  no environment and no live tree at all, which is why it is hermetic by
  construction (`scripts/proxy-check.mjs:144-148`).
- **No claim well-foundedness.** It recomputes each term *exactly as
  `SCORECARD.md` defines it*; whether the definition measures what its name
  suggests (e.g. that a file counted by `A` really "has a documented invocation
  that exits with a verdict", `SCORECARD.md:25-27`) is a reading question, not a
  mechanical one. Flipping a registry row to `yes` without a note behind it
  still passes; the note's own citations remain `scripts/cite-check.mjs`'s job.
- **No coverage-depth question.** Which sources lack a note is the coverage
  axis's own "Known gaps" prose (`corpus/README.md:56-129`); the tool counts rows
  and registry cells only.
- **No definition reading.** It implements the frozen definitions; a prose edit
  that leaves the counts unchanged (tightening "C = GFM task lines" to "C =
  executed items", say) is invisible to it, so definition changes must be
  pre-registered. The frozen `C` regex also admits `- [x]` lines that
  `--checklists` skips — a theoretical farming vector, unused this round
  (`CHECKLIST_SKIPPED: 0`).
- **No provenance for `A`.** The frozen `find` admits any matching file, so an
  untracked scratch script inflates the term; round 11's stray `audit-env.sh` was
  caught as `A_DRIFT declared=4 computed=5` (exit 1), not silently ignored.
- **No file-level residue diagnostic.** `SCORECARD.md:95-112` records a
  basename-level residue ratio explicitly *not* scored; the frozen contract
  covers `A`, `C`, `C1`, `C2`, the four layer terms and the pins only. The
  pre-registered alternative that would have scored the layer residue
  (`F_layer`) was refuted by measurement in round 16, so the residue stays a
  diagnostic.
- **No live-surface read and no round-record read — and the origin tree only for
  the layer terms.** Before round 16 the measurement path read this repo alone;
  the two successor terms changed that by exactly one input: the origin tree,
  read once in **process** through an `import` of `scripts/claims-check.mjs`'s
  `probeSections()` — a module import, never a subprocess, and the gate's single
  walk is reused, not repeated. The four legacy terms (`A`, `C`, `C1`, `C2`)
  remain self-only; only `S_members`, `S_sections`, `R_members`, `R_sections` and
  the two scores they feed depend on `--src`, and a missing `--src` is
  `SRC_NOT_A_DIR` exit 2, never a guessed 0. Cost: the `Proxy recompute` checklist
  item now needs the origin tree, like the other three gates (`cite-check.mjs`,
  `surface-probe.mjs`, `round-gate.mjs`); live-surface and round-record reads
  remain those gates' job.
- **No fleet grade.** It grades one repo's own scorecard — the lane-local
  analogue of the boundary `corpus/knowledge/round-close-gate.md` records against
  the integrator's fleet-conformance step.

## How it composes with the other three gates

| Gate | Contract | Reads | Failure domain |
|---|---|---|---|
| `scripts/cite-check.mjs` | `kumitate-cite-check-v1` | every path/line/symbol/pin in `SKILL.md` + `corpus/**/*.md` vs the origin tree | prose rot against the origin tree |
| `scripts/surface-probe.mjs` | `kumitate-surface-probe-v1` | the live `ufo-sighting surface --json` + `fleet-dispatcher.mjs status` surfaces vs origin bytes; `--checklists` executes the checklist | live-surface drift |
| `scripts/round-gate.mjs` | `kumitate-round-gate-v1` | this repo's git record, `.ufo/reports/round-<N>/`, the main repo; `--tracked` = the filed-report tracking clause for every round older than the newest | the round contract |
| `scripts/proxy-check.mjs` | `kumitate-proxy-v1` | this repo's `SCORECARD.md` + `SKILL.md` + `corpus/README.md` + corpus dirs for the legacy terms, plus the origin tree `--src` through the **imported** claims gate (`probeSections()`) for the two layer terms | the lane's own axis arithmetic |
| `scripts/claims-check.mjs` | `kumitate-claims-v1` | the same scorecard's registry cells **plus the corpus notes behind them** and the origin tree the members resolve against — the same `probeSections()` derivation `proxy-check.mjs` now imports for the layer terms | the registry's `yes` claim: one member section per member with a live own-file anchor and a verbatim symbol |

Five instruments; none shells another — but since round 16 they are no longer
five *disjoint* input sets: `proxy-check.mjs` **imports** `claims-check.mjs` in
process for the two layer terms (that gate's own derivation, reused rather than
re-implemented), so the layer half of the successor scores has one owner. The
`SKILL.md` checklist is the other shared surface: `surface-probe.mjs --checklists`
runs every item, so one command exercises all five gates.

## Terminal values and retirement (round 15)

A proxy with a saturating form reaches a value it cannot leave. Here
`coverage = floor(10 × C1/C1_total × C2/C2_total)` is a product of two ratios
that both hit 1.0 in round 15 (`C1 19/19`, `C2 50/50`), so the integer became 10
and stopped responding to the object it names — while the file-level residue was
still 201/211 ≈ 0.952 and 9 of 19 registry rows could be probed only for note
existence. Three consequences a reusing lane should take from this repo's move,
all recorded in `SCORECARD.md`:

- **A terminal value is recorded, not claimed.** `coverage` is retired at
  saturation (`SCORECARD.md` `## Retired`) with its successors named; the
  scorecard's `## Axes` row keeps the integer (the proxy's `AXES_DRIFT` check
  needs it) and marks it saturated.
- **A split must expose a worse number, not conceal it.** The lane replaced the
  terminal integer with two sub-axes whose honesty term is machine-derived
  (gate-verified member sections over declared members); their pre-registered
  alternative — each successor "keeping its own C1/C2 pair" — was measured and
  refuted *before* landing, because `C2_layer` is 1.0 by construction and both
  successors would have read 10 under new names.
- **The split's terms are pre-registered a round early.** The proxy implements
  frozen definitions; changing them is a re-charter, so the terms are written
  down in `## Planned` for the round that measures them, never in the same round
  that measures a first.

**Round 16 gave the successors their first measurement.** The pre-registered
terms are now machine-derived in `scripts/proxy-check.mjs`:
`coverage:script-layer` = `floor(10 × 8/8 × 74/114)` = **6** and
`coverage:runtime-layer` = `floor(10 × 11/11 × 60/98)` = **6** (the `R` numerator
is the member-only 60; the raw all-section count is 63), against the retired
aggregate's terminal 10. The pre-registered fallback — `floor(10 × C1_layer ×
F_layer)`, the file-level residue — was **refuted by measurement**: `C1_layer`
is 1.0 on both layers while `V_layer` reads 0.649 (74/114) and 0.612 (60/98), so
the two terms do not double-count and the fallback's extra origin-tree I/O was
never needed beyond the single `probeSections()` walk. That is the split exposing
a worse number (6/6) rather than 10 under two new names — and the parent stays
retired.

**Round 17 moved the runtime successor, not its definition.** R1 gained eight
distinct member sections and R8 gained `native_dispatch_topology.rs`, moving
`R_sections` 60 → 69 and `coverage_runtime` 6 → 7; script remains 74/114 ⇒ 6.
The proxy verdict is now `S=74/114 coverage:script-layer=6; R=69/98
coverage:runtime-layer=7`. The critic reproduced a limitation in the frozen
derivation: `layerTerms()` counts section occurrences, while the claims gate
dedupes files for the row's declared-count check. Live R1/R8 are protected by
strict adv=0 plus an explicit occurrence=distinct census (8=8, 4=4); changing
the derivation is queued as operability work rather than hidden in this
coverage round.
*Round 35 (2026-10-20):* that operability work landed — `layerTerms()` now
counts distinct in-family `section.file` identities per layer, and the
duplicate-one/drop-one mutation is killed for S and R (`SCORECARD.md`
`## Move log` round 35). The table row above keeps its round-17 wording.


## Reuse path (portability)

Lane-agnostic by construction: it reads `--self`'s tree and — for the two layer
terms only — the origin tree `--src`, takes no network, and its only env read is
`UFO_SRC` as `--src`'s default. Its lane-specific constants are the default
self-root (the repo containing the script, `scripts/proxy-check.mjs:174`) and the
default origin checkout. A second lane reuses it by (1) invoking it as
`node <kumitate>/scripts/proxy-check.mjs --self <this-lane-repo> --src <origin-tree>`
(or copying the file plus `scripts/claims-check.mjs` into its own `scripts/`,
which the in-process import needs); (2) adding the `<!-- kumitate-proxy-v1` block
to its own `SCORECARD.md` with its own measured terms (seventeen keys);
(3) authoring the operability/coverage definitions those terms come from — the
tool derives numbers, not the frozen proxies. Keys lane-local by nature:
`C1_total` (registry size) and `C2_total` (corpus note count) come from the
target lane's tree, and the four layer terms (`S_members`, `S_sections`,
`R_members`, `R_sections`) come from its origin tree — so one script yields
different integers per lane without a code change. A lane with no `| S<n> |`
registry table gets `REGISTRY_MISSING`, and one whose origin tree is absent gets
`SRC_NOT_A_DIR`: both are the honest answers, not a guessed 0.

## Inputs as measured 2026-09-28 (round 16)

The live values are always the stanza's; these are the round-16 readings, taken
around the two tool edits (`scripts/proxy-check.mjs`, `scripts/claims-check.mjs`)
that give the successors their derivation. The round-15 block below is a
historical snapshot.

- term A: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name
  '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → **5** (unchanged:
  the round edits two existing scripts and adds no file).
- term C: `grep -c '^\s*- \[' SKILL.md` → **10** (unchanged; the `Proxy recompute`
  item stays one line, now needing the origin tree).
- term C1: `grep -cE '^\| (S|R)[0-9]+ \|' SCORECARD.md` → **19**; `yes` cell →
  **19** ⇒ **19/19** (unchanged — the round works under rows that already read
  `yes`).
- term C2: `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **52**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **52** (the
  round's two notes, `knowledge/layer-axes.md` and `lessons/round-16.md`).
- layer terms (new stanza keys): `S_members` **114** = `ls scripts/*.mjs | wc -l`
  → 72 + `find scripts -mindepth 2 -type f | wc -l` → 42 (recursive; a depth-1
  count reads 38 and is wrong); `R_members` **98** = 93 + 5. `S_sections` **74**;
  `R_sections` **60** — the member-only numerator (`inFamily === true`), because
  the all-section count reads 63 and `R9`'s three sibling-suite sections are
  `SECTION_FILE_NOT_MEMBER` warnings the gate does not verify as members.
- successor scores (new stanza keys): `coverage_script` =
  `floor(10 × 8/8 × 74/114)` = **6**; `coverage_runtime` =
  `floor(10 × 11/11 × 60/98)` = **6**.
- pins: **three unchanged** (`pin.cite-check` a11ead17…, `pin.surface-probe`
  86bdcd9a…, `pin.round-gate` 4c447463…, re-checked with `sha256sum`);
  `pin.proxy-check` and `pin.claims-check` are **re-pinned**, because the round
  edits both files — the live hex is the stanza's, and an unrecorded edit surfaces
  as `PIN_DRIFT`, never as a silently stale claim.

Derived: `A+C = 15` ⇒ operability **8** (unchanged, `15/18 = 0.8333`); the
retired `coverage` stays **10** (its terminal value); the two successors read
**6** / **6**.

The two re-pinned hashes are written by the round close (L1 re-pins from
`sha256sum` after the tool edits stop), so the live run is open on `PIN_DRIFT ×2`
alone; on a scratch copy of `SCORECARD.md` with only those two lines substituted,
every term and all four `## Axes` rows tie out:

```
$ node scripts/proxy-check.mjs --scorecard /tmp/r16-corpusdocs/sc-pins.md
PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=52/52 coverage=10; S=74/114 coverage:script-layer=6; R=60/98 coverage:runtime-layer=6; pins=5 match)   # exit 0
```

## Inputs as measured 2026-09-28 (round 15, historical)

The live values are always the stanza's; these are the round-15 readings as that
round recorded them (its run line is in that round's four-segment format — the
`S=`/`R=` segments arrive in round 16). The round-12 and round-11 blocks below
are again historical snapshots — round 12's heading claimed to be "current" while
its numbers were already two rounds old, which is exactly the recall drift a
frozen command is supposed to catch.

- term A: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name
  '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → **5** (unchanged
  since round 14: the round adds a corpus note, not a script).
- term C: `grep -c '^\s*- \[' SKILL.md` → **10** (unchanged; `surface-probe
  --checklists` → `CHECKLIST: 10/10 pass`, `CHECKLIST_SKIPPED: 0`).
- term C1: `grep -cE '^\| (S|R)[0-9]+ \|' SCORECARD.md` → **19**; `yes` cell →
  **19** ⇒ **19/19** (`R11` — the runtime remainder + CLI, 47 members — is the
  last `no` cell closed; `--row R11` → `CLAIMS: MATCH (rows=1 yes=1 notes=1
  sections=47 adv=0)`).
- term C2: `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **50**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **50** (2 rows
  for `knowledge/runtime-remainder-census.md`, `lessons/round-15.md`).
- pins: all five unchanged — this round edits no `scripts/*.mjs`, which is
  itself checked: an unrecorded edit would surface as `PIN_DRIFT`.

Derived: `A+C = 15` ⇒ operability **8** (unchanged, `15/18 = 0.8333`);
coverage `floor(10 × 19/19 × 50/50)` = **10** — the terminal value, which is why
`coverage` is retired with two successors declared (`SCORECARD.md` `## Retired`).
The live run:

```
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10; pins=5 match)   # exit 0
```

## Inputs as measured 2026-09-28 (round 12, historical)

The round-12 readings as that round recorded them, and the
round-11 block below is kept as the historical snapshot it labels itself.

- term A: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name
  '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → **4** (unchanged:
  the round adds notes, not scripts).
- term C: `grep -c '^\s*- \[' SKILL.md` → **9** (unchanged; the three round-12
  pointer bullets in `### Watchers & helpers` begin `- \``, not `- [`, and
  `surface-probe --checklists` still executes 9/9).
- term C1: `grep -cE '^\| (S|R)[0-9]+ \|' SCORECARD.md` → **18**; `yes` 5th cell
  → **16** ⇒ **16/18** (S6 ops watchers and R10 gate flipped after their notes
  named every member at internals level; S7 stays `no` at 9 of 69 named).
- term C2: `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **43**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **43** (4 rows for
  `knowledge/ops-watchers.md`, `knowledge/gate-verdict.md`,
  `knowledge/route-probe-cluster.md`, `lessons/round-12.md`).
- pins: all four unchanged from round 11 — this round edits no `scripts/*.mjs`,
  which is itself checked: an unrecorded edit would surface as `PIN_DRIFT`.

Derived: `A+C = 13` ⇒ operability **8** (unchanged);
coverage `floor(10 × 16/18 × 43/43)` = **8** (was 7). The live run:

```
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)   # exit 0
```

## Inputs as measured 2026-09-28 (round 11, historical)

Every number below came from the frozen command in this repo, read-only:

- term A: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name
  '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → **4**
  (`./scripts/cite-check.mjs`, `./scripts/proxy-check.mjs`,
  `./scripts/round-gate.mjs`, `./scripts/surface-probe.mjs`; was 3).
- term C: `grep -c '^\s*- \[' SKILL.md` → **9** (was 6; the three round-11 items
  are executed by `surface-probe --checklists` → `CHECKLIST: 9/9 pass`).
- term C1: `grep -cE '^\| (S|R)[0-9]+ \|' SCORECARD.md` → **18**; `yes` 4th cell
  → **14** ⇒ **14/18**.
- term C2: `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **39**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **39** (38 at this
  round's own landing plus the third-party `lessons/round-8-aggregator-box3-coldrun.md`
  the aggregator lane committed into this repo mid-round, which gains a row here
  the way the round-6 audit artifact already had one).
- pins: `scripts/proxy-check.mjs` sha256
  a 64-hex sha256 (1173 L at round 11; superseded, so not restated —
  55-case hermetic suite); `scripts/round-gate.mjs`
  `4c44746384cfe4485f133ff02b00931426ef9f16382dd86142bd92abf79ab946` (1426 L,
  57-case suite after the `--tracked` mode and the round-11 simplifier pass);
  `scripts/cite-check.mjs` and `scripts/surface-probe.mjs` unchanged from
  round 10.

Derived: `A+C = 4+9 = 13` ⇒ `f_O = 13/16 = 0.8125` ⇒ operability **8**;
coverage `floor(10 × 14/18 × 1.0)` = **7** (C1 unchanged). Both integers also
appear in the `## Axes` table, and the live run ties them together:

```
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)   # exit 0
```