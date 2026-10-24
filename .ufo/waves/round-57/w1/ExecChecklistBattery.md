# ExecChecklistBattery — round 57 (leaf; SKILL `## Verifiable checklist` item 27 + full `- [ ]` census)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`,
judged close R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9`, lane tip at run
`8c6f5b017d149b18134917378cdbed3b492d8e89` (round-57 bookkeeping/idempotence tip). Working tree at run:
`M .ufo/waves/round-57/w1/swarm-registry.json` + untracked wave-seat paths (101 status lines = 1 `M` + 100
`??` at the census snapshot; 114 lines by report time — the count grows while seats run); `SKILL.md` working tree
byte-identical to HEAD (`skill-head-vs-worktree.diff` is 0 bytes). No production/lane file was written,
nothing committed; all writes are under `.ufo/waves/round-57/build/ExecChecklistBattery/` plus this report.

Read first: `.ufo/waves/round-57/plan.md`, `.ufo/waves/round-57/probe/attest57-probe.mjs`,
`.ufo/waves/round-57/probe/doctrine57-probe.mjs`, `SKILL.md` §Verifiable checklist, `scripts/readme-map.mjs`.

## 1. Item 27 (corpus coverage-map bimap gate) — PASS

| run | cwd / tree | command | exit | verdict line |
|---|---|---|---|---|
| live lane | lane root, HEAD `8c6f5b0` | `node scripts/readme-map.mjs` | 0 | `README_MAP: CLEAN files=135 rows=135 covered=135` |
| judged R1 | `git archive f0dc6d11 \| tar -x` extraction | `node scripts/readme-map.mjs` | 0 | `README_MAP: CLEAN files=135 rows=135 covered=135` |
| selftest | lane root | `node scripts/readme-map.mjs --selftest` | 0 | `README_MAP_SELFTEST: PASS (14/14)` + `VERDICT: PASS` |

Basis corroboration (three independent legs, none of which trusts the gate's own CLEAN line alone):

- **Counts re-derived from the tree**: `corpus/knowledge/*.md` = 52, `corpus/lessons/*.md` = 83 (135);
  README rows whose first cell is one backticked `knowledge/…` or `lessons/…` path = 135;
  `.ufo/pins/readme-map.json` `version=1`, `covered=135`, unique=135.
- **Second implementation** (`build/ExecChecklistBattery/bimap-independent.mjs`, re-derives all six finding
  classes from the `kumitate-readme-map-v1` text; it does not import or exec the gate) prints
  `verdict=CLEAN bad=0` with `format-unmapped/duplicate-row/orphan-row/uncovered/stale-covered/unpinned`
  all empty at live, HEAD-extraction and R1-extraction — `bimap-live.json`, `bimap-head.json`,
  `bimap-R1.json`.
- **Pin binding**: `sha256(scripts/readme-map.mjs)` = `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`,
  equal to `SCORECARD.md:326 pin.readme-map=…` and the `.ufo/pins/counter-pins.json` round-57
  `readme-map` entry. Frozen counter `A57` at `8c6f5b0` is `ATTEST57_HELD held=10/10 checks=10`
  with B1..B10 all PASS (`attest57-at-8c6f5b0.txt`); the committed R1 receipt
  `close/FINAL-attest57-R1.txt` reads the same at `f0dc6d11`.

**Falsification of the item itself** (doctored copies under `scratch/`, gate only reads, no lane byte
touched — an item that cannot fire is a no-op, so this is the operability test of item 27):

| arm | doctored input | observed |
|---|---|---|
| M1 | `corpus/README.md` copy with the `lessons/round-57.md` row deleted | `README_MAP: DRIFT files=135 rows=134 covered=135 bad=1 first=uncovered:lessons/round-57.md`, exit 1 |
| M2 | `.ufo/pins/readme-map.json` copy with one `covered` entry dropped | `README_MAP: DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:knowledge/agent-isolation-substrates.md`, exit 1 |
| M3 | registry copy with `version=2` | `README_MAP: FAIL-CLOSED reason=registry version 2 !== 1`, exit 2 |

## 2. Full `- [ ]` census — items=27, items 24..27 bound

Static census of §Verifiable checklist (section heading line 676 → line 790; `census.mjs`,
`census-live.json` / `census-HEAD.json`, identical for the working tree and `git show HEAD:SKILL.md`):

- **items = 27** (`- [ ]` lines 694–720, `- [x]` = 0, so the section adds no skips of its own).
- Bindings (id → line → command), all four correct:

| item | SKILL.md line | command | expected gate |
|---|---|---|---|
| 24 | 717 | `node scripts/counter-pins.mjs` | `COUNTER_PINS: CLEAN` |
| 25 | 718 | `node scripts/source-capture.mjs` | `SOURCE_CAPTURE: CLEAN` |
| 26 | 719 | `node scripts/source-dupes.mjs` | `SOURCE_DUPES: CLEAN` |
| 27 | 720 | `node scripts/readme-map.mjs` | `README_MAP: CLEAN` |

This matches the frozen `A57` B7 conjunct (B7 counts `^ *- \[` across SKILL.md = 27 and asserts
`i24..i27` contain `counter-pins.mjs` / `source-capture.mjs` / `source-dupes.mjs` / `readme-map.mjs`),
and the round's declared counts: `SCORECARD.md` C=27 (base C=26), `proxy-check` computed **C=27**
(`PROXY: MATCH (A=90 C=27 …)`), `LOG.md:2197` "A=90, C=27, C2=135/135".

### 2a. Executable census, live lane — 26/27, sole failure item 8 (proxy `A_DRIFT`), items 24–27 PASS

`node scripts/surface-probe.mjs --checklists` (lane root) → `CHECKLIST_SKIPPED: 0`,
**`CHECKLIST: 26/27 pass`, `VERDICT: FAIL`**, exit 1 (`census-checklists.stdout.txt`).

- `SKILL.md:701` **FAIL** (item 8, `proxy-check --strict`) `exit=1 expected=0 substring=miss`:
  `PROXY error A_DRIFT A: declared=90 computed=1438 delta=+1348`.
- Items 24–27 all `PASS exit=0 substring=hit`: `counter-pins` (wall 0.021 s), `source-capture` (0.020 s),
  `source-dupes` (0.024 s), `readme-map` (0.020 s). Item 1 (cite-check) reads `exit=1 expected=0|1` — the
  checklist's own allowed exit set, hence PASS.
- No timeouts, no grammar errors, no fail-closed items in the live run.

**Cause of the one failure, measured, not inferred.** `proxy-check.mjs:939` derives
`A = walkFiles(self).filter(RE_RUNNABLE)`: a walk of the *whole worktree* minus `.git`, including
untracked files. Committed HEAD has 90 re-runnable files (20 outside `.ufo`, 70 under `.ufo` — 38
`build`, 28 `probe`, 3 `quality`, 1 `r48`). The live tree at capture had **5832**, and a simultaneous
`proxy-check --strict` printed exactly `A: declared=90 computed=5832 delta=+5742` — the term is the live
count, one-for-one. The 5.7 k surplus sits in untracked concurrent seat scratch under
`.ufo/waves/round-57/build/**` (top dirs: ExecMapEmptyCovered 1170, ExecMapUncovered 811,
ExecMapMissing 541, ExecMapFormat 450, ExecD57Close 274, ExecMapUnpinned 272, ExecA57Close 269,
ScribeScorecardAudit 268, ExecProxyCounts 267, MutMapOrphan 180; `a-inflation-top.txt`), and those paths
are **not** gitignored (`git check-ignore` exit 1). Same command on committed HEAD bytes in a bare
extraction prints `PROXY: MATCH (A=90 C=27 … pins=6 match; src-rev=31c465f15669)` exit 0. The live
failure is therefore wave-concurrency pressure, not a lane finding against C1.

### 2b. Executable census, committed bytes — 24/27, three environment-limited items, none of them the item under test

`git archive HEAD` extraction + `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 24/27 pass`
(`scratch/census-at-HEAD.stdout.txt`). Failures are environmental, each with its own message:

- items 6 (L699) and 7 (L700) `exit=2`: `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir
  …/scratch/.ufo/reports is absent`. `round-gate.mjs:154` sets
  `DEFAULT_MAIN_REPO = resolve(HERE,'..','..')`, i.e. the extraction's parent, not the fleet root.
- item 14 (L707) `exit=1`: `TRUTH … REVIEW_UNBOUND … no committed review record binds this anchor`;
  `anchor-truth.mjs` resolves review records through `git` in the lane repo, and a bare archive has no
  object store.

Items 24–27 still PASS there, so the item under test is revision-bound and worktree-independent.
The authoritative full run remains the lane's own: the committed close transcript
`.ufo/waves/round-57/close/harm-battery.txt` records `CHECKLIST: 27/27 pass` / `VERDICT: PASS` at the
close, when no wave scratch existed yet.

## 3. Findings

**F1 — SKILL.md prose census literal is stale at the judged rev (documentation; not wave-caused).**
`SKILL.md:678` still reads "**Twenty-six items (round 56;** item 26 is the SOURCES duplicate-URL ratchet;
item 25 is the opened-source byte-persistence gate; item 24 is the frozen-counter registry gate; item 23
remains the receipt-attest hermetic suite)." — it names no round-57 item and no `readme-map`/item 27,
while the list below carries 27 items and `SCORECARD`/`proxy-check` both compute C=27. This is the
R56-V2 class (stale exactly-N literal) recurring in the one place no counter watches: `A57` B7 counts
task lines and asserts the item 24..27 script names, but never reads the prose census, so
`ATTEST57_HELD held=10/10` is true alongside a self-description that says 26. Not edited here
(SKILL.md is read-only in this wave). Repair is one prose line — e.g. "Twenty-seven items (round 57;
item 27 is the corpus coverage-map bimap gate, item 26 the SOURCES duplicate-URL ratchet, …)" — and the
durable fix is a B7 conjunct on the prose token if the parent wants the class closed rather than repaired.

**F2 — checklist item 8 is not wave-concurrency-safe, and the wave's own evidence dirs break the wave's
harm battery.** Item 8 asserts `PROXY: MATCH`, but A is a whole-worktree walk; every seat that leaves
runnable scratch (in practice, extracted trees and generated suites — 5.7 k files here) flips
`A_DRIFT`. Consequences measured: a census run mid-wave cannot read 27/27 (26/27 observed); and at close,
H1 (`surface-probe --checklists`) and H3 (`proxy-check --strict`) will read the same drift for as long as
`.ufo/waves/round-57/build/**` exists, unless the L1 excludes/cleans those dirs for the measurement or A's
walk is narrowed (A has always counted `.ufo` content — 70 of the 90 committed files are probes and build
scripts — so that sensitivity is pre-existing, not introduced by round 57). Committed
bytes are clean (`A=90` MATCH), so this is a measurement-surface issue, not a coverage regression.
I removed my own 56 MB / 90-file extraction after capturing its transcripts to avoid adding to it.

**F3 — "census at a revision" is only faithful in a full lane.** In a bare `git archive` extraction, items
6, 7 and 14 cannot run (fleet-root `.ufo/reports` and a git object store are outside the commit). Record
this as a limit of any revision-bound census claim; it is why 2b is 24/27 and why the live run, not an
extraction, is the scoring run.

## 4. Risks, blockers, non-actions

- **Blockers: none.** Item 27 is CLEAN and fireable at live, R1 and HEAD; items=27 with 24..27 correctly
  bound; no gate under test failed.
- **Risk carried to close (F2)**: H1/H3 at close will read `A_DRIFT` while seat scratch exists. Decide
  before close (clean/ignore the wave build dirs for the measurement, or accept and record the delta).
- **Risk carried to the next capability move (F1)**: prose census literals are unguarded; the next
  checklist growth repeats the drift unless B7 gains a prose conjunct.
- Non-actions honoured: no seat dispatched, no production/SCORECARD/LOG/SKILL/corpus/SOURCES/pins edit,
  no commit/push/jj mutation, no `.ufo/state/*` or watchdog touch, no pacman/install, no judgement of
  C1/C2 beyond the item measured here.

## 5. Evidence index (all under `.ufo/waves/round-57/build/ExecChecklistBattery/`)

| file | content | sha256 (first 16) |
|---|---|---|
| `item27-readme-map.stdout.txt` | item 27 live verdict, exit 0 | `240d7e9636161652` |
| `item27-readme-map.stderr.txt` | empty | — |
| `readme-map-selftest.txt` | `README_MAP_SELFTEST: PASS (14/14)`, exit 0 | `555fde83422a3336` |
| `scratch/item27-at-R1.txt` | item 27 at `f0dc6d11` extraction, exit 0 | `240d7e9636161652` |
| `scratch/proxy-at-HEAD.stdout.txt` | `PROXY: MATCH (A=90 C=27 …)` at HEAD extraction | `715d9cc689075f71` |
| `scratch/census-at-HEAD.stdout.txt` | committed-bytes census `24/27`, items 6/7/14 env-limited | `7d540d3e8a4b46ea` |
| `census-checklists.stdout.txt` | live census `CHECKLIST: 26/27 pass`, item 8 `A_DRIFT` | `6cc0dcae8bad629a` |
| `census-checklists.stderr.txt` | empty | — |
| `census-live.json` / `census-HEAD.json` | static census: 27 items, line map, bindings | `35b2c0ac…` / `c0134f84…` |
| `SKILL-at-8c6f5b0.md` | `git show HEAD:SKILL.md` (census input) | `7e08d513035ec8ee` |
| `skill-head-vs-worktree.diff` | empty: SKILL.md worktree == HEAD | — |
| `bimap-live.json` / `bimap-head.json` / `bimap-R1.json` | independent bimap, `verdict=CLEAN bad=0` | `dd984758…` / `f35fce59…` / `dd984758…` |
| `proxy-live-strict.txt` | live `A_DRIFT declared=90 computed=5832` | `02ab79a0d76a71e7` |
| `a-inflation-top.txt` | untracked scratch dirs by runnable-file count | `addf620b1445449a` |
| `attest57-at-8c6f5b0.txt` | `ATTEST57_HELD held=10/10`, B1..B10 PASS | `2ed3d46b27cb58dc` |
| `census.mjs`, `bimap-independent.mjs` | the two read-only analyses used above | — |
| `scratch/README-dropped-row.md`, `scratch/registry-dropped.json`, `scratch/registry-v2.json` | M1–M3 doctored inputs (copies only) | — |

Reproduce: `node scripts/readme-map.mjs`; `node scripts/readme-map.mjs --selftest`;
`node scripts/surface-probe.mjs --checklists`; `node scripts/proxy-check.mjs --strict`;
`git archive <rev> | tar -x -C <scratch>` then the same three commands there;
`node .ufo/waves/round-57/build/ExecChecklistBattery/census.mjs SKILL.md` and
`node .ufo/waves/round-57/build/ExecChecklistBattery/bimap-independent.mjs <tree>`.
