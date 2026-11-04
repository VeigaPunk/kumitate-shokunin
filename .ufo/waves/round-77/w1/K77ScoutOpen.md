# K77ScoutOpen — read-only insertion map + before-state re-measurement (round 77)

Measured revision: `4dc470a131e10900fdd456b6b68d7ba27151d9d2` (the scaffolding commit; lane `HEAD`
verified). All commands below ran in a `--shared` clone at
`/fast/scratch/hyaku/kumitate-r77/K77ScoutOpen/lane`, checked out at that commit
(`git rev-parse --show-toplevel` = the clone). The lane tree itself was never written.

Frozen inputs: `.ufo/waves/round-77/plan.md` (186 L) and `.ufo/waves/round-77/probe/probe77.mjs`
(446 L, sha256 `95316919bb5f54a6dd9b01b9b3be74b3c93b08b8add424b2e106e36b3b6ccb9b`, equal to the hash
the two control receipts record). Host: Linux 7.2.11-arch1-1 x86_64, node v24.21.0.

## 1. Verdict

- C1 insertion is fully determined by the frozen probe; two fail-closed/stream details are fixed by
  the probe rather than the plan (see A5, A6). The live OMP root still equals the frozen open shape
  (`SHAPE_EQUAL`, 64/64 entries), so checks 1–3 are satisfiable at this revision.
- C2 insertion is fully determined *except* the placement anchor (A3) and the recovery "clean" test
  (A4).
- **Blocker, C2 (A1): the frozen probe can never print `C77_C2: HELD held=11/11`.** Its registry
  entry is `c2.11-live-adoption-and-placement` (probe77.mjs:429) while the check is registered as
  `c2.11-placement-and-map` (probe77.mjs:387). `results.get('c2.11-live-adoption-and-placement')` is
  `undefined`, so the counter always prints `FAIL not run` for the eleventh slot (the base receipt
  already shows exactly this). The maximum reachable at M is `held=10/11` unless the frozen probe is
  edited, which the round rules forbid.
- Independent of C2's implementation, the proxy at `4dc470a` reads `DRIFT` with **three** findings,
  not the two the plan names: `A_DRIFT` (the scaffolding commit added `probe77.mjs`, a `.mjs` file, so
  A 847→848) plus `C2_DRIFT`/`C2_TOTAL_DRIFT`. No claim owns A (A2).

## 2. Insertion map

Line numbers are at `4dc470a`. "Call sites" lists every place that must change, not just the
insertion point.

### 2.1 C1 — `scripts/omp-census.mjs` (572 L)

| # | Symbol / region | Lines at 4dc470a | What changes | Affected call sites |
|---|---|---|---|---|
| 1 | Header contract | 1–36 | Add `kumitate-omp-shape-v1`, the `--snapshot FILE` / `--shape FILE` arms, their exact output lines and exit map; state that `--snapshot` never converts an unreadable root to CLEAN. | none (documentation) |
| 2 | `import` block | 41–43 (`node:fs`), 44 (`node:os`), 45 (`node:path`), 46 (`node:url`) | Add `renameSync` to the fs import; add `dirname` to the path import; add `import { createHash, randomUUID } from 'node:crypto';`. | new writer only |
| 3 | `readShape(root)` | 139–161 | Unchanged. Its output (`{name,kind,mode & 0o777}`, `readdirSync(...).sort()`) is already the receipt entry shape. | `census()` 199–200; new writer; new shape loader |
| 4 | New: `SHAPE_CONTRACT`, `readSnapshotDoc(file)` | insert after 161 (before "Rule matching", 163) | `SHAPE_CONTRACT='kumitate-omp-shape-v1'`; `readSnapshotDoc` returns `{ok:true, entries}` or `{ok:false, kind:'SHAPE_NOT_FOUND'|'SHAPE_INVALID', detail}`. Validation: JSON object; keys exactly `contract,entries`; contract match; non-empty `entries`; each entry keys exactly `kind,mode,name`; `kind ∈ {file,dir,symlink}`; integer `mode` in `[0,0o777]`. Sort entries by `name` after validation. Export it. | proxy-check `--omp-shape` branch |
| 5 | `census(root, noteText)` | 199–246 | Split: `export function censusEntries(entries, noteText)` holds the current body 201–246 minus `const entries = readShape(root)` (line 200); `export function census(root, noteText) { return censusEntries(readShape(root), noteText); }`. All rule/binding/`EMPTY` logic stays in `censusEntries`. | in-file `runCensus` 297; proxy-check import 322 + call 1430 |
| 6 | `USAGE` | 252 | `usage: node scripts/omp-census.mjs [--root DIR] [--self DIR] [--note FILE] | --snapshot FILE [--root DIR] | --shape FILE | --selftest [--work DIR]` | `main` 551, 556 |
| 7 | `parseArgs(argv)` | 254–281 | Add `snapshot: null, shape: null` to the option object (255); add `--snapshot`/`--snapshot=FILE` and `--shape`/`--shape=FILE` branches; both take a file path (no existence check). Reject both flags together (and any `--snapshot`/`--shape` with `--selftest`) as a usage error → 64 (see A6). | `main` 548 |
| 8 | New: `runSnapshot(file, root, io)` | insert after `runCensus` (after 307) | Build `{contract: SHAPE_CONTRACT, entries: readShape(root)}`; serialize deterministically (suggest `JSON.stringify(doc, null, 2) + '\n'`); write to `<file>.<pid>.<uuid>.tmp` in `dirname(file)` then `renameSync` (never a partial receipt), remove the temp on any throw; sha256 the exact bytes; print exactly one line `OMP_SNAPSHOT: WROTE entries=<n> sha256=<hex> path=<file>`; exit 0; unreadable root → stderr diagnostic + exit 2. | `main` |
| 9 | New: `runShape(file, io, note)` | insert after `runSnapshot` | Read the note first (`NOTE_MISSING` → exit 2, stderr, never CLEAN). `readSnapshotDoc`; on failure print the token **on stdout** (`SHAPE_NOT_FOUND`/`SHAPE_INVALID`; the probe reads stdout only — A5) and exit 2. On success `censusEntries(entries, noteText)`, print infos/findings, then exactly `OMP_CENSUS: CLEAN (source=snapshot entries=<n> findings=0 bound=<b>/<d>)` or `OMP_CENSUS: DRIFT (source=snapshot entries=<n> findings=<n>)`; exit 0/1. | `main` |
| 10 | `selftest(work, io)` | 341–544 (49 cases today) | Add ≥4 cases (recommend 8) to reach `VERDICT: PASS (≥53 cases)`: snapshot line + entry count + sha; snapshot round-trip (materialise → re-snapshot → byte-equal); shape CLEAN exact line; shape negative (`zz-stray.txt` → `UNLISTED`, exit 1); shape invalid (missing `entries`, bad kind); shape absent; `--snapshot`/`--shape` usage arms; content-key rejection. | probe c1.9 |
| 11 | `main(argv, io)` | 548–565 | Dispatch after help/error/selftest: `--shape` → `runShape(parsed.shape, io, parsed.note ?? join(parsed.self, ...))`; `--snapshot` → `runSnapshot(parsed.snapshot, parsed.root || join(homedir(), '.omp', 'agent'), io)`; else the current `runCensus`. | CLI |

### 2.2 C1 — `scripts/proxy-check.mjs` (3312 L)

| # | Symbol / region | Lines at 4dc470a | What changes | Affected call sites |
|---|---|---|---|---|
| 1 | Import from `./omp-census.mjs` | 322 | `import { BASE_MEMBERS, CHAIN_FAMILIES, census, censusEntries, readSnapshotDoc } from './omp-census.mjs';` (names executor-chosen; the receipt loader must return the fail-closed kind). | runCheck branch |
| 2 | `GATE_PINS` | 536–563 (last entry 562, `};` 563) | Add `'pin.omp-shape': '.ufo/pins/omp-shape.json',`. This is the only parser-side change: `parseGatePins` (1137–1181) validates against this map, `compareGatePins` (1226–1243) hashes `join(self, rel)`, `comparePinCoverage` (1245–1268) only widens its pinned set. `TERM_KEYS` (520–524) and `PINS` (526–534) do **not** change. | 1167, 1228, 1248 |
| 3 | `FAIL_CLOSED_KINDS` | 656–663 | Add `'OMP_SHAPE_NOT_FOUND', 'OMP_SHAPE_INVALID'`. This is load-bearing: the selftest asserts every listed arm fires (3211–3214), so both new arms need fixtures (arms 19 → 21). | selftest 3211 |
| 4 | `USAGE` | 665–728 | Add `[--omp-shape FILE]` to the synopsis and the options block; document mutual exclusion with `--omp-root` (usage 64), `source=snapshot` in the printed verdict, and that a malformed/absent receipt is exit 2. | `main` usage path |
| 5 | `parseArgs(argv)` | 3234–3281 | Add `ompShape: null` and `ompRootGiven: false`; parse `--omp-shape` (resolve the file path); set `ompRootGiven = true` in the `--omp-root` branch; after the loop `throw new Error('--omp-shape and --omp-root are mutually exclusive')` when both are set (the throw becomes exit 64 through `main` 3283–3290). | `main` |
| 6 | `runCheck` OMP block | 1423–1435 | Branch: with `opts.ompShape` → `readSnapshotDoc(opts.ompShape)`; on `!ok` `return failClosed(opts, loaded.kind, loaded.detail, {}, started)`; else `omp = censusEntries(loaded.entries, ompNoteText)`, `ompSource = 'snapshot'`. Without it, unchanged `census(opts.ompRoot, ompNoteText)`, `ompSource = 'root'`. | `deriveTerms` 1454–1456 (signature unchanged) |
| 7 | `--json` body | 1468–1493 | Add top-level `source: ompSource` (probe c1.5 reads `j.source === 'snapshot'`). Nothing else in the body changes; `terms` still spreads `deriveTerms` output, so the six O terms are untouched. | probe c1.5 |
| 8 | `renderVerdict` + its call | 1324–1339, call 1499 | Add a `source` parameter and append `; source=snapshot` to the tail **only** when it is `'snapshot'`; the default-mode verdict string must stay byte-identical (the selftest asserts exact verdict lines at 1810, 1820, 1826, 1927, 2209, 2531, 2701, 2742, 2896). | 1499 |
| 9 | `deriveTerms` | 1038–1075 | No change. The six O terms are assembled once at 1060–1064 from the `omp` result; both sources feed the same shape. | — |
| 10 | `parseGatePins` / `compareGatePins` | 1137–1181 / 1226–1243 | No code change (data-driven by #2). The pin line must live inside the `kumitate-gate-pins-v1` block; the v1 stanza rejects it (`STANZA_KEY_UNKNOWN`) and the gate-pin parser rejects it unless #2 lands. | SCORECARD edit |
| 11 | `selftest` | 1665–3230 (145 checks today) | Add ≥3 net new checks (probe c1.9 needs ≥148). Mandatory: fixtures for both new fail-closed arms (#3). **Trap:** the fixture runner `runProxy` at 1692 hardcodes `--omp-root F1.omp`; a shape fixture must use a runner without it or it hits the new mutual-exclusion 64. Build the "clean" receipt from the 26 `BASE_MEMBERS` the fixture root already creates; the fixture note (symlink at 1749) binds 35/35. | probe c1.9 |
| 12 | `failClosed` | 1341–1367 | No change; the new kinds flow through as tokens. It writes the token to stderr and, with `--json`, the JSON body to stdout — the probe accepts either (`stdout + stderr`). | — |

### 2.3 C1 — `.ufo/pins/omp-shape.json` (new) and `SCORECARD.md`

| # | Symbol / region | Lines at 4dc470a | What changes |
|---|---|---|---|
| 1 | New receipt file | — | Exactly the `--snapshot` writer output over the live root (64 entries at open; the live root still equals the frozen open TSV). Keys per entry exactly `name,kind,mode`; no content/digest/path/timestamp keys. |
| 2 | Stanza `pin.proxy-check` | 315 | Re-pin after the proxy-check edit: `pin.proxy-check=$(sha256sum scripts/proxy-check.mjs)`. |
| 3 | Gate-pin `pin.omp-census` | 324 | Re-pin after the omp-census edit: `pin.omp-census=$(sha256sum scripts/omp-census.mjs)`. |
| 4 | Gate-pin block terminator | 319–346 (block), `-->` at 346 | Insert `pin.omp-shape=<sha256 of .ufo/pins/omp-shape.json>` as a line inside the block (natural site: a new line after 345, before the `-->`). |
| 5 | Capability row `omp-census` | 1842 | Optional per the plan's edit set: record the offline `--snapshot`/`--shape` arms. No frozen check reads it. |
| 6 | v1 stanza `A`, `C2`, `C2_total` | 289, 293, 294 | **Not C1's claim.** At `4dc470a` these read 847 / 183 / 183 against computed 848 / 184 / 184. See A2. |

### 2.4 C2 — `scripts/spotcheck-adopt.mjs` (223 L)

| # | Symbol / region | Lines at 4dc470a | What changes | Affected call sites |
|---|---|---|---|---|
| 1 | Header | 2–10 | Contract `kumitate-spotcheck-adopt-v2`; describe the journal (`kumitate-adopt-journal-v1`), the recovery lines, and the `SPOTCHECK_ADOPT_TEST_CRASH=journal\|row\|pin` seam (selftest-only). `grep` for `kumitate-spotcheck-adopt-v2`, `adopt-journal`, `RECOVERED`, `SPOTCHECK_ADOPT_TEST_CRASH` must each be ≥1 (probe c2.1). | — |
| 2 | `import` block | 11–15 | Add `existsSync` to the fs import (12). | `recover()` |
| 3 | New constants | after 19 (`NAME`) | `CONTRACT='kumitate-spotcheck-adopt-v2'`, `JOURNAL_CONTRACT='kumitate-adopt-journal-v1'`, `JOURNAL_REL='.ufo/pins/adopt-journal'`. | journal helpers |
| 4 | `oracle(lane)` | 21–30 | Unchanged (recovery reuses it). | `recover`, `evaluate` |
| 5 | `missing(result, key)` | 31–33 | Unchanged. | `recover`, `evaluate` |
| 6 | New: `journalRoot`, `sha256Hex`, `createJournal`, `recover` | insert after 33 (or after `replaceAtomic`, 62) | `createJournal(lane, target, key, originals)` writes `<uuid>.tmp/` with `manifest.json`, `README.pre`, `readme-map.pre`, then renames to `<uuid>/` **before** the first destination write. `manifest = {contract:'kumitate-adopt-journal-v1', lane:<resolved lane>, target, key, pre:[{path:'corpus/README.md', file:'README.pre', sha256},{path:'.ufo/pins/readme-map.json', file:'readme-map.pre', sha256}]}`. `recover(lane)` is described in §3.3. | `main`, `evaluate` |
| 7 | `appendPin(raw, key)` | 34–55 | Unchanged; it already preserves every other byte (including the final newline) and refuses ambiguous `covered` spellings. | `evaluate` 108 |
| 8 | `replaceAtomic(path, bytes)` | 56–62 | Unchanged; reuse for recovery restores. | recovery, `evaluate` 109/114 |
| 9 | `evaluate(lane, arm, value)` | 63–117 | (a) Before the writes loop (109), create the journal; (b) replace the EOF append at 104–107 with a coverage-map-scoped row insert (see A3); (c) crash seam: SIGKILL self after the journal rename (`journal`), after the README rename (`row`), after the pin rename (`pin`); (d) success path (112) removes the journal; (e) catch (113–116) restores the originals, removes the journal, refuses. Write order stays README → pin (the probe's `row-only` / `complete` states encode that order). | probe c2.2–c2.4 |
| 10 | `selftest(lane)` | 119–202 (16 cases) | `run` (137–141) must accept an env object and expose `signal`; `fixture` (125–135) needs a coverage-map variant with `## Coverage map` + `## Known gaps`. Add ≥6 cases (16 → ≥22): crash-journal rollback, crash-row rollback, crash-pin complete, stale `.tmp`, foreign journal, no-journal-no-line, placement before `## Known gaps`, recovery idempotence. | probe c2.9 |
| 11 | `main(argv)` | 204–222 | After the usage check (214–216) and the `--selftest` return (217), run `recover(lane)`; a refusal returns 2 (print `REFUSED_JOURNAL_FOREIGN`); otherwise prepend its recovery lines to the arm's lines, then `evaluate`. Recovery must **not** run under `--selftest` and must not create the journal directory on read arms. | probe c2.2–c2.8 |

### 2.5 C2 — `SCORECARD.md` and lesson text

| # | Symbol / region | Lines at 4dc470a | What changes |
|---|---|---|---|
| 1 | Gate-pin `pin.spotcheck-adopt` | 345 | Re-pin after the edit: `pin.spotcheck-adopt=$(sha256sum scripts/spotcheck-adopt.mjs)`. |
| 2 | Capability row `spotcheck-adopt` | 1864 | v2: journal, `RECOVERED … rolled-back\|complete`, `REFUSED_JOURNAL_FOREIGN`, `RECOVERED - stale`, placement above `## Known gaps`; evidence pointer to the v2 selftest. |
| 3 | v1 stanza `C2`, `C2_total` | 293, 294 | C2's stated repair of the inherited drift: measure at M and declare the values actually derived. `pin.readme-map` (333) does **not** move (readme-map is unchanged). |
| 4 | Lesson text | `corpus/lessons/round-77*.md` (scribe) | v2 capability + the `adopt-appends-at-eof` fix. Note `SKILL.md:742` still names v1 and is outside C2's edit set (A7). |

## 3. Exact patch shape (copy-ready interfaces)

### 3.1 `omp-census.mjs` new arms

```
export const SHAPE_CONTRACT = 'kumitate-omp-shape-v1';

// { ok:true, entries } | { ok:false, kind:'SHAPE_INVALID'|'SHAPE_NOT_FOUND', detail }
export function readSnapshotDoc(file)
export function censusEntries(entries, noteText)          // body of today's census(), minus readShape
export function census(root, noteText)                    // readShape(root) -> censusEntries()

function runSnapshot(file, root, io)                      // staged write + rename
function runShape(file, io, note)                         // note first, then receipt
```

Output lines (byte-exact where the probe compares):
```
OMP_SNAPSHOT: WROTE entries=<n> sha256=<64hex> path=<file>
OMP_CENSUS: CLEAN (source=snapshot entries=<n> findings=0 bound=<b>/<d>)
OMP_CENSUS: DRIFT (source=snapshot entries=<n> findings=<n>)
```
`SHAPE_NOT_FOUND` / `SHAPE_INVALID` go to **stdout** (probe c1.8 reads `r.stdout`), exit 2.
`NOTE_MISSING` (shape arm) keeps the existing stderr convention, exit 2.
Exit map: snapshot 0/2/64; shape 0/1/2/64.

### 3.2 `proxy-check.mjs` `--omp-shape`

```
opts: { ompShape: resolve(path) | null, ompRootGiven: boolean }
usage: --omp-shape FILE   (mutually exclusive with --omp-root; both -> exit 64)

runCheck:
  if (opts.ompShape !== null) {
    const loaded = readSnapshotDoc(opts.ompShape);
    if (!loaded.ok) return failClosed(opts, loaded.kind, loaded.detail, {}, started); // 2
    omp = censusEntries(loaded.entries, ompNoteText); ompSource = 'snapshot';
  } else { ...census(opts.ompRoot, ompNoteText)... ompSource = 'root'; }

body: { ..., source: ompSource, ... }
verdict line: ... coverage:omp=<n>; pins=<n> match[; source=snapshot][; src-rev=<12hex>])
```
The six O terms and `deriveTerms` are unchanged; `COVERAGE_OMP_DRIFT` on the negative receipt
comes from the existing `compareTerms` (`key.toUpperCase() + '_DRIFT'`).

### 3.3 `spotcheck-adopt.mjs` v2 journal

```
const JOURNAL_REL = '.ufo/pins/adopt-journal';
manifest = {"contract":"kumitate-adopt-journal-v1","lane":"<abs lane>","target":"corpus/lessons/…",
            "key":"lessons/…","pre":[{"path":"corpus/README.md","file":"README.pre","sha256":"…"},
                                     {"path":".ufo/pins/readme-map.json","file":"readme-map.pre","sha256":"…"}]}

recover(lane):
  root = join(lane, JOURNAL_REL); if (!existsSync(root)) return {lines:[]};
  for each entry (sorted):
    *.tmp  -> rm -r; emit "RECOVERED - stale"
    <uuid>/ -> parse manifest; lane mismatch or unusable manifest -> {exit:2, lines:["REFUSED_JOURNAL_FOREIGN"]} (retain)
               clean-for-key -> rm -r journal; emit "RECOVERED <target> complete"      (bytes untouched)
               else          -> verify each pre sha256, replaceAtomic(dest, pre); rm -r journal;
                                emit "RECOVERED <target> rolled-back"
  return {lines}
```
Crash seam (child kills itself with SIGKILL; unset = no effect):
`SPOTCHECK_ADOPT_TEST_CRASH=journal` after `<uuid>.tmp` → `<uuid>/`; `=row` after the README rename;
`=pin` after the pin rename.

Row builder (replaces the EOF append at 106):
```
| `lessons/<file>` | Non-author round-<N> verifier spotcheck | Closure artifact; adopted by spotcheck-adopt |
```
inserted inside the coverage-map table (A3), never at EOF.

## 4. Before-state receipt block (all at `4dc470a`, clone path above)

```
$ node scripts/omp-census.mjs
OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)
exit 0

$ node scripts/omp-census.mjs --selftest | tail -1
VERDICT: PASS (49 cases)
exit 0

$ node scripts/proxy-check.mjs --json          # exit 1
verdict=DRIFT exit=1 errors=3 warnings=0
O: {"C1o":1,"C1o_total":1,"O_members":64,"O_findings":0,"O_bound":35,"coverage_omp":10}
A_DRIFT         A: declared=847 computed=848 delta=+1
C2_DRIFT        C2: declared=183 computed=184 delta=+1
C2_TOTAL_DRIFT  C2_total: declared=183 computed=184 delta=+1

$ node scripts/proxy-check.mjs | tail -1
PROXY: DRIFT (A_DRIFT term=A declared=847 computed=848 delta=+1; C2_DRIFT term=C2 declared=183 computed=184 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=183 computed=184 delta=+1; src-rev=31c465f15669)
exit 1

$ node scripts/proxy-check.mjs --selftest | tail -2
PROXY_SELFTEST: 145/145 pass
VERDICT: PASS
exit 0

$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_MAP: CLEAN spotchecks=43 uncovered=0
exit 0

$ node scripts/spotcheck-adopt.mjs --selftest | tail -2
SPOTCHECK_ADOPT_SELFTEST: PASS (16/16)
VERDICT: PASS
exit 0

$ node scripts/readme-map.mjs
README_MAP: CLEAN files=184 rows=184 covered=184
exit 0

$ sha256sum .ufo/pins/omp-shape.json
sha256sum: .ufo/pins/omp-shape.json: No such file or directory (os error 2)
exit 1

$ grep -c 'pin.omp-shape' SCORECARD.md
0
exit 1

$ node .ufo/waves/round-77/probe/probe77.mjs --set c1 --lane . --work /fast/scratch/hyaku/kumitate-r77/K77ScoutOpen/probe-work2/c1 | tail -1
C77_C1: UNMET held=0/10
exit 1

$ node .ufo/waves/round-77/probe/probe77.mjs --set c2 --lane . --work /fast/scratch/hyaku/kumitate-r77/K77ScoutOpen/probe-work2/c2 | tail -2
CHECK c2.11-live-adoption-and-placement: FAIL not run
C77_C2: UNMET held=2/11
exit 1
```

Supporting facts re-measured at the same revision:
```
$ sha256sum .ufo/waves/round-77/probe/probe77.mjs
95316919bb5f54a6dd9b01b9b3be74b3c93b08b8add424b2e106e36b3b6ccb9b   (== the two control receipts)

$ sha256sum scripts/omp-census.mjs scripts/proxy-check.mjs scripts/spotcheck-adopt.mjs scripts/readme-map.mjs
f5f7dd6e… scripts/omp-census.mjs      == SCORECARD:324 pin.omp-census
9a2f6e8d… scripts/proxy-check.mjs     == SCORECARD:315 pin.proxy-check
8b32c86e… scripts/spotcheck-adopt.mjs == SCORECARD:345 pin.spotcheck-adopt
b1c8bf97… scripts/readme-map.mjs      == SCORECARD:333 pin.readme-map

$ find ~/.omp/agent -mindepth 1 -maxdepth 1 -printf '%f\t%y\t%m\n' | sort  vs  sort open/omp-shape-open.tsv
SHAPE_EQUAL (64 entries, 64 lines; no symlink/'other' entries)   -> c1.1/c1.2 can both hold
```

`surface-probe.mjs --checklists` at this revision (full run, 94 s, after the scaffold's map repair):

```
$ KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin node scripts/surface-probe.mjs --checklists | tail -2
CHECKLIST: 34/35 pass
VERDICT: FAIL
exit 1        # only SKILL.md:722 (proxy --strict) is red; 720/721/741/742 PASS
```

`KUMITATE_MAIN_REPO` is required only because the clone lives at
`/fast/scratch/.../K77ScoutOpen/lane`: `round-gate.mjs:154` derives its default main repo as
`resolve(<repo>/scripts, '..', '..')`, which is the fleet root when run from the lane
(`/home/vgpnk/Projects/shokunin`) but the seat scratch dir when run from the clone. Without the
override the same suite reads 32/35 with `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)` on
`SKILL.md:720/721` — an artefact of the clone path, not lane state (a direct
`node scripts/round-gate.mjs` with the override reads `ROUND_GATE: CLEAN (round=76 lane=kumitate
checks=10 errors=0 warnings=0)`, exit 0).

Receipt files beside this report: `before-state.txt` (every command above, regenerated at the
measured revision), `proxy-open.json` (the full `--json` body), `probe-c1-base.txt`,
`probe-c2-base.txt`, `checklists-base.txt` (the 34/35 suite output).

## 5. Ambiguities and plan-vs-counter disagreements

1. **A1 (blocker, C2): probe registry name mismatch.** `probe77.mjs:429` lists
   `c2.11-live-adoption-and-placement`; the check function is registered at `probe77.mjs:387` as
   `c2.11-placement-and-map`. `results.get(...)` is undefined, so the counter can never exceed
   `held=10/11`. Readings: (i) typo in the frozen registry — the plan's `C77_C2: HELD held=11/11` is
   unsatisfiable without editing the frozen probe (forbidden); (ii) the check name is the typo and
   the registry intent was `c2.11-placement-and-map` — still an edit to frozen bytes. Either way,
   C2 is an honest stop at the counter unless the L1 rules otherwise. The base receipt already
   displays the symptom (`FAIL not run`) but reports 2/11, which hides it.
2. **A2 (unowned drift): `A_DRIFT`.** The plan attributes only `C2`/`C2_total` drift to C2. At
   `4dc470a` A computes 848 (SCORECARD declares 847) because the scaffolding commit added
   `probe77.mjs`, a runnable `.mjs`. Readings: (i) the close-side re-derivation updates the v1
   stanza `A=848` (SCORECARD is in both claims' edit sets, but `A` is not either claim's target);
   (ii) the round ends DRIFT on A and records it as a routed defect. The plan's C1 sentence "C1 does
   not require the proxy to read MATCH" covers C2/C2_total only, not A.
3. **A3 (C2 placement anchor).** The plan says "immediately after the last existing `| `lessons/` `
   row (inside the coverage-map table)". At base the `## Coverage map` section is lines 12–205; its
   last lessons row is line 203 (`lessons/round-69.md`). But the file's last lessons row anywhere is
   line 309 (`lessons/round-76-verifier-spotcheck.md`), inside `## Known gaps` (206–311). Readings:
   (i) **section-scoped** — last lessons row within `## Coverage map` (line 203), which satisfies the
   kill rule "row placed after `## Known gaps`"; (ii) **file-wide** — line 309, which places the row
   after `## Known gaps` and fails the kill rule. The probe fixture has no lessons row at all, so a
   fallback is required either way (recommended: after the last `| `knowledge|lessons/` row inside
   the section, else before `## Known gaps`).
4. **A4 (C2 recovery clean test).** "the oracle is consulted — CLEAN for the journaled key": (i) the
   whole `readme-map` run is CLEAN; (ii) the journaled key has no `uncovered:`/`unpinned:` finding.
   They differ when an unrelated map drift exists (global drift would roll back a completed adopt).
5. **A5 (C1 fail-closed stream).** `probe77.mjs:190–196` requires the `SHAPE_INVALID` /
   `SHAPE_NOT_FOUND` token in `r.stdout`, while the base census writes root errors to stderr. The
   shape arm must print the token on stdout; the plan does not name the stream.
6. **A6 (C1 unspecified flag combinations).** `--snapshot` + `--shape` together, and what the writer
   does with a `kind:'other'` (fifo/socket) entry: (i) usage 64 for the pair, exit 2 for an
   unwritable kind (keeps the receipt contract `file|dir|symlink`); (ii) last-flag-wins and write
   `other` (which makes the committed receipt invalid per the probe's `validSnapshot`). No live
   `other` entry exists at open.
7. **A7 (C2 contract rename vs frozen doc bounds).** The tool becomes v2, but `SKILL.md:742` still
   says `kumitate-spotcheck-adopt-v1` and C2's edit set excludes `SKILL.md`. Readings: (i) leave it
   stale and record it; (ii) widen C2's bounds (forbidden by the frozen plan).
8. **A8 (C2 check 11 count).** Plan text: `README_MAP: CLEAN files=184 rows=184 covered=184`; the
   probe regex is `files=(\d+) rows=\1 covered=\1`, i.e. any equal count. Readings: (i) the probe is
   the predicate; (ii) 184 is required, so no corpus file may land at M.
9. **A9 (C1 printed `source=snapshot`).** The plan requires it "in the printed line"; the probe only
   reads `j.source` from `--json`. Readings: (i) append `; source=snapshot` to the MATCH/DRIFT
   verdict tail (default output byte-identical); (ii) place it inside the `O=` segment. The probe
   does not discriminate.
10. **A10 (C2 unusable manifest).** A `<uuid>/` whose manifest is missing/malformed (neither the
    stale `.tmp` nor the foreign-lane case) has no defined verdict. Readings: (i)
    `REFUSED_JOURNAL_FOREIGN` for any manifest that cannot be attributed to this lane; (ii) a new
    `REFUSED_JOURNAL_CORRUPT`, exit 2, journal retained.
11. **A11 (C1 live-root coupling).** c1.1 requires the committed receipt to equal the **live** root
    at verify time; c1.2 requires it to equal the **frozen** open TSV. Both hold only while the live
    root still equals the open shape (verified now). Any live drift between landing and M makes
    them jointly unsatisfiable; no lane-side fix exists.

## 6. Scope guard

- C1's edit set: `scripts/omp-census.mjs`, `scripts/proxy-check.mjs`, `SCORECARD.md`,
  `.ufo/pins/omp-shape.json`. C2's: `scripts/spotcheck-adopt.mjs` (+ its selftest, same file),
  `SCORECARD.md`, the corpus/lesson text. Neither instruments the other.
- Additive only: `proxy-check` default-mode verdict semantics, `TERM_KEYS` (23), `PINS` (6) and the
  `kumitate-proxy-v1` stanza key set are unchanged; `parseGatePins` code is unchanged (only the
  `GATE_PINS` map grows); `readme-map.mjs` and its pin are untouched.
- Both executors edit the same gate-pin block: C1 touches lines 315, 324 and inserts after 345; C2
  touches 345 (`pin.spotcheck-adopt`). The integrator must apply both re-pins after the final bytes
  of each script are frozen.
