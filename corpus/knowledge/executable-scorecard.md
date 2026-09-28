# executable scorecard — this lane's own axes, re-derived

`scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`): zero-dep ESM, node
≥20, READ-ONLY on every input, no network. It reads this repo's own tree —
`SCORECARD.md`, `SKILL.md`, `corpus/README.md`, `corpus/knowledge/`,
`corpus/lessons/` — recomputes the frozen measurement proxies
(`SCORECARD.md:15-87`) and the four script pins, and turns them into one verdict.
Text mode's last line is
`PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q> coverage=<s>; pins=<n> match)`
or `PROXY: DRIFT (…)` (`scripts/proxy-check.mjs:73-77`); `--json` is a single
object, schema id `kumitate-proxy-v1`. Exit 0 match · 1 drift · 2 fail-closed ·
64 usage. Inputs are the lane's own repo only — unlike `scripts/cite-check.mjs`,
the origin tree is never read (`scripts/proxy-check.mjs:97-103`).

## The interface (frozen; quoted, not paraphrased)

```
usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1
```

Modes (one per run; argument parsing precedes modes, so an unknown flag or a flag
without a value is refused with 64 even when `--selftest` is present —
`scripts/proxy-check.mjs:79-82`, `parseArgs()` at
`scripts/proxy-check.mjs:1130`, `main()` at `scripts/proxy-check.mjs:1153`):
default = recompute A, C, C1, C1_total, C2, C2_total, the two derived scores and
the four pins under `--self`, then compare them with the `kumitate-proxy-v1`
stanza in `--scorecard` (default `<self>/SCORECARD.md`); `--selftest` = hermetic
fixture suite (tmp dirs only — it never reads this repo, the scorecard or the
environment); `-h|--help` = print USAGE, exit 0. `--self DIR` defaults to the
repo root containing the script (`DEFAULT_SELF` at
`scripts/proxy-check.mjs:119`), the same sibling convention
`scripts/surface-probe.mjs` and `scripts/round-gate.mjs` use. `--strict`
promotes the one advisory kind (`PIN_UNPINNED`) to a failure (`summarize()` at
`scripts/proxy-check.mjs:451`).

## The contract it executes — term → frozen command → what it guards

Each term is defined once, in `SCORECARD.md`, and never restated as a second
source here; the module's own patterns are
`scripts/proxy-check.mjs:140-147`:

| Term | Frozen command (source) | What it guards |
|---|---|---|
| `A` — runnable artifacts | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` (`SCORECARD.md:25-35`) | the operability numerator counts *files* — any `.git` tree pruned (`scripts/proxy-check.mjs:217-228`) — so "N runnable artifacts" cannot drift from the tree |
| `C` — executable checklist items | `grep -c '^\s*- \[' SKILL.md` (`SCORECARD.md:36-47`) | the checklist term counts GFM task lines that `node scripts/surface-probe.mjs --checklists` actually executes under `CHECKLIST_RE` (`scripts/surface-probe.mjs:162`, parse site `scripts/surface-probe.mjs:781-785`) — a prose bullet is not credited |
| `C1` — in-scope surface coverage | rows `^\| (S\|R)\d+ \|` in `SCORECARD.md` whose 4th `\|`-separated cell, trimmed, starts with `yes`; `C1_total` = **all** such rows (table `SCORECARD.md:89-111`; `scripts/proxy-check.mjs:241-266`) | a family counts as covered only when its row says `yes`; `partial` (S6) therefore counts as not covered, and the denominator is the table's own size. Escaped `\|` inside a cell is **not** a cell break (`splitRowCells()` at `scripts/proxy-check.mjs:241-253`): round 11 found by falsification that a naive `split('|')` let a `\|`-bearing row shift the 4th-cell test to a prose cell and silently stop counting that row — fixed, with two regression cases in the suite |
| `C2` — README-map freshness | rows in `corpus/README.md` matching `^\| \`(knowledge\|lessons)/` over `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` (`SCORECARD.md:70-87`; `scripts/proxy-check.mjs:230-240`) | every corpus note has a README row; a deleted note or a deleted row moves the term |
| pins | `sha256` of `scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs` (`scripts/proxy-check.mjs:129-134`) | the tools a document describes are byte-for-byte the tools on disk; a pin whose file is absent is reported `computed=absent (…)`, never skipped (`scripts/proxy-check.mjs:378-400`) |
| derived scores | `operability = floor(10 × (A+C)/(A+C+3))`, `coverage = floor(10 × C1/C1_total × C2/C2_total)` (`SCORECARD.md:20-87`; `scripts/proxy-check.mjs:268-274`) | the arithmetic in `## Axes` is the arithmetic of the recomputed terms, not a remembered number |

The registry is parsed out of the **same** `SCORECARD.md` the stanza lives in
(`scripts/proxy-check.mjs:277-302`), so a registry edit and a stanza edit cannot
silently disagree: the next run raises `REGISTRY_MISSING` if the table is gone,
`C1_DRIFT` / `C1_TOTAL_DRIFT` if the counted rows change.

## The stanza grammar (the machine-readable claim block)

Exactly one HTML comment block in `<self>/SCORECARD.md`, first line
`<!-- kumitate-proxy-v1`, body lines `key=value`, closed by a line containing
`-->` (`scripts/proxy-check.mjs:52-65`, parser at
`scripts/proxy-check.mjs:303-357`). All ten keys are required exactly once; no
other key is accepted:

```
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
```

The values above are this lane's **round-11** block (`SCORECARD.md:117-140`), and
the pins are full hex rather than abbreviating `…` because the tool requires
`[0-9a-f]{64}` (`scripts/proxy-check.mjs:147`). Every value is a *claim*: the
tool re-derives each one from the tree and never trusts it, and it never rewrites
the block (`scripts/proxy-check.mjs:52-65`).

Fail-closed outcomes of the grammar itself (`scripts/proxy-check.mjs:84-96`,
`scripts/proxy-check.mjs:303-357`): no block → `STANZA_MISSING`; **more than one
block**, no `-->` terminator, a body line that is not `key=value`, a **required
key absent**, or a value outside `\d+` (counts) / `[0-9a-f]{64}` (pins) →
`STANZA_MALFORMED`; an unknown key → `STANZA_KEY_UNKNOWN`; a repeated key →
`STANZA_KEY_DUPLICATE`.

Consequence to keep in mind: the block must be re-pinned after ANY edit to the
four scripts, including an edit to `proxy-check.mjs` itself — `pin.proxy-check`
is the checker's own sha256, so an unrecorded edit shows up as `PIN_DRIFT` exit 1
rather than as a silently stale claim (the maintenance tax is the point).

## The axes cross-check

The derived operability and coverage integers **must equal** the integers in
`SCORECARD.md`'s `## Axes` rows `| operability | N |` and `| coverage | N |`
(`scripts/proxy-check.mjs:137`, `scripts/proxy-check.mjs:442-460`). A mismatch —
*including a missing row or a missing `## Axes` section* — is `AXES_DRIFT`
(error, exit 1), so the scorecard's prose and its arithmetic are tied together by
an executable check. The lookup is scoped to the `## Axes` section body on
purpose (`scripts/proxy-check.mjs:427-440`): an unscoped search would let a
move-log row (`| 11 | operability | … |`) shadow the current axis row. The move
log is **not** parsed — it is history, and the tool grades the present state only.

## Exit map and verdict line

| Exit | Meaning |
|---|---|
| 0 | match — `PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q> coverage=<s>; pins=<n> match)` |
| 1 | drift — `PROXY: DRIFT (<KIND term=… declared=… computed=… delta=…>…)`, one finding per mismatching term (kinds `A_DRIFT`, `C_DRIFT`, `C1_DRIFT`, `C1_TOTAL_DRIFT`, `C2_DRIFT`, `C2_TOTAL_DRIFT`), per pin (`PIN_DRIFT`) and per axis (`AXES_DRIFT`) |
| 2 | fail-closed — `PROXY: FAIL-CLOSED (<TOKEN>) <detail>` |
| 64 | usage (unknown flag, or a flag without a value) |

Same four-value shape as the three gates beside it (`cite-check.mjs`,
`surface-probe.mjs`, `round-gate.mjs`: 0/1/2/64), so the checklist grammar's
`exit <n>[|<m>…]` reads identically for all four. `--json` mirrors the same
verdict in one object (`{"contract":"kumitate-proxy-v1","mode":"check","ok":…,
"verdict":…,"exitCode":…,"terms":{…},"findings":[…]}`; a fail-closed body carries
`"verdict":"FAIL-CLOSED"` with the token as its single finding).

## Fail-closed arms (exit 2)

The principle is the one `corpus/knowledge/round-close-gate.md` records for the
round contract: when the claim surface cannot be read, "absent" must never be
reported as `MATCH`.

| Arm (printed token, in check order) | Trigger (`scripts/proxy-check.mjs:84-96`, `scripts/proxy-check.mjs:155-159`) |
|---|---|
| `SELF_NOT_A_DIR` | `--self DIR` (or the script's own root) is absent or not a directory |
| `SCORECARD_MISSING` | `<self>/SCORECARD.md`, or `--scorecard FILE`, absent — no claim block and no registry to compare against |
| `STANZA_MISSING` | no HTML comment block whose first line is `<!-- kumitate-proxy-v1` |
| `STANZA_MALFORMED` | more than one block, no `-->` terminator, a body line not `key=value`, a required key absent, or a value outside `\d+` / 64-hex |
| `STANZA_KEY_UNKNOWN` | a key outside the frozen ten |
| `STANZA_KEY_DUPLICATE` | a key declared twice |
| `REGISTRY_MISSING` | no `\| S<n> \|` / `\| R<n> \|` registry row in the scorecard |
| `SKILL_MISSING` | `<self>/SKILL.md` absent — term C has no input |
| `README_MISSING` | `<self>/corpus/README.md` absent — term C2 has no input |
| `CORPUS_DIRS_MISSING` | either corpus dir absent, **or** the corpus census is empty (no `*.md`) — the C2 denominator would otherwise be zero, and a proxy that divides by zero still prints a number |

Not in that frozen list: `INTERNAL_ERROR`, the crash net, so an unexpected throw
is a refused verdict rather than a stack trace
(`scripts/proxy-check.mjs:1167-1170`).

## What it deliberately does not check

- **No writes and no subprocess on the measurement path.** Under `--self` +
  scorecard it reads only: no writes, no network, no subprocess, no git, no lock
  (`scripts/proxy-check.mjs:97-101`). `--selftest` is the only writer *and* the
  only spawner — it runs the script as a child into a fresh `mkdtemp` it removes
  afterwards (`scripts/proxy-check.mjs:632`, `scripts/proxy-check.mjs:658`,
  `scripts/proxy-check.mjs:1083`).
- **No environment variable is consulted.** Unlike its siblings, whose defaults
  are env-overridable, `proxy-check.mjs` takes its tree and scorecard from the
  script's own location, so a polluted env cannot move a measurement — which is
  why `--selftest` is hermetic by construction
  (`scripts/proxy-check.mjs:97-101`).
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
- **No file-level residue diagnostic.** `SCORECARD.md:78-87` records a
  basename-level residue ratio explicitly *not* scored; the frozen contract
  covers `A`, `C`, `C1`, `C2` and the pins only.
- **No origin-tree read, no live-surface read, no round-record read.** Those are
  `cite-check.mjs`, `surface-probe.mjs` and `round-gate.mjs` respectively.
- **No fleet grade.** It grades one repo's own scorecard — the lane-local
  analogue of the boundary `corpus/knowledge/round-close-gate.md` records against
  the integrator's fleet-conformance step.

## How it composes with the other three gates

| Gate | Contract | Reads | Failure domain |
|---|---|---|---|
| `scripts/cite-check.mjs` | `kumitate-cite-check-v1` | every path/line/symbol/pin in `SKILL.md` + `corpus/**/*.md` vs the origin tree | prose rot against the origin tree |
| `scripts/surface-probe.mjs` | `kumitate-surface-probe-v1` | the live `ufo-sighting surface --json` + `fleet-dispatcher.mjs status` surfaces vs origin bytes; `--checklists` executes the checklist | live-surface drift |
| `scripts/round-gate.mjs` | `kumitate-round-gate-v1` | this repo's git record, `.ufo/reports/round-<N>/`, the main repo; `--tracked` = the filed-report tracking clause for every round older than the newest | the round contract |
| `scripts/proxy-check.mjs` | `kumitate-proxy-v1` | this repo's `SCORECARD.md` + `SKILL.md` + `corpus/README.md` + corpus dirs | the lane's own axis arithmetic |

Four instruments, four disjoint input sets — none shells another. The `SKILL.md`
checklist is the one surface they share: `surface-probe.mjs --checklists` runs
every item, so one command exercises all four gates.

## Reuse path (portability)

Lane-agnostic by construction: it reads only `--self`'s tree, takes no network,
consults no env var, and its only lane-specific constant is the default self-root
(the repo containing the script, `scripts/proxy-check.mjs:119`). A second lane
reuses it by (1) invoking it as
`node <kumitate>/scripts/proxy-check.mjs --self <this-lane-repo>` (or copying the
file into its own `scripts/`); (2) adding the `<!-- kumitate-proxy-v1` block to
its own `SCORECARD.md` with its own measured terms; (3) authoring the
operability/coverage definitions those terms come from — the tool derives
numbers, not the frozen proxies. Two keys are lane-local by nature: `C1_total`
(registry size) and `C2_total` (corpus note count) come from the target lane's
tree, so one script yields different integers per lane without a code change. A
lane with no `| S<n> |` registry table gets `REGISTRY_MISSING`, which is the
honest answer: the claim surface is not there yet.

## Inputs as measured 2026-09-28 (round 11)

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
  `9d35ae743102e517448e93558fd8479f0930b2c9b281e58d083a3ea639070a6e` (1173 L,
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