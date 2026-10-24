# ExecMapUncovered — round 57, C1 `readme-map`, row-deletion mutation seat

Seat: `ExecMapUncovered` (leaf, mutation-tester role). Claim under attack: **C1 — operability,
`readme-map` coverage-map bimap gate** (`kumitate-readme-map-v1`). Lane: `kumitate-shokunin`,
jj-colocated. Scored revision: **`8c6f5b017d149b18134917378cdbed3b492d8e89`** (the lane's committed
tip at run time — not the plan's base `7178bfd…`; see §8).

**Verdict: CORROBORATED.** In a scratch copy of the committed tree, deleting one `corpus/README.md`
map row makes `node scripts/readme-map.mjs` print
`README_MAP: DRIFT … first=uncovered:<path>` and exit **1**, naming exactly the file whose row was
removed — for three different rows (a `lessons/` closure row, a `knowledge/` row, the last row in
the file). An independent, gate-free recomputation names the same file. The frozen counter
`attest57-probe.mjs` (rule A57) reads `ATTEST57_HELD held=10/10 checks=10` at the same revision.

Nothing in the production lane was modified; no commit, no git/jj mutation, no install.

## 1. Predicate and arm

Plan §Claims C1: `DRIFT` exit 1 with an `uncovered` file is the arm under test (`plan.md`,
"`DRIFT` exit 1 (`uncovered` file / `orphan-row` / `duplicate-row` / `stale-covered` /
`format-unmapped` row)"). The frozen counter's B3(a) arm is the same mutation
(`attest57-probe.mjs:194-202`, "// (a) uncovered: delete one row").

## 2. Setup and byte binding

Scratch trees were produced with `git archive HEAD | tar -x -C <dir>` — read-only on the lane,
committed bytes only (`00-setup.txt`). The gate derives its lane from its own file location
(`LANE = resolve(dirname(SELF), '..')`), so each scratch tree is scored against its own archived
registry and README.

| path | sha256 (committed blob = scratch blob) |
|---|---|
| `scripts/readme-map.mjs` | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` |
| `corpus/README.md` (pristine) | `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d` |
| `.ufo/pins/readme-map.json` | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` |

All seven scratch copies carry the identical gate digest (`12-digest-bindings.txt`); each mutated
README digest differs from the pristine one only by its own edit.

## 3. Control (unmutated)

```
$ cd scratch-clean && node scripts/readme-map.mjs
README_MAP: CLEAN files=135 rows=135 covered=135
EXIT=0
```

Selftest in the same tree: `README_MAP_SELFTEST: PASS (14/14)` / `VERDICT: PASS`, exit 0
(≥12 cases, as C1 requires).

## 4. Primary mutation — one row deleted

`scratch/` = committed tree with exactly the `lessons/round-56-verifier-spotcheck.md` row removed
(the R56-V3 file class). `01-row-deletion.diff` proves the mutation is exactly one deleted line and
zero added lines (`removed_lines=1 added_lines=0`; 267 → 266 lines).

```
$ diff -u <(git show HEAD:corpus/README.md) scratch/corpus/README.md
@@ -165,7 +165,6 @@
-| `lessons/round-56-verifier-spotcheck.md` | Round-56 non-author closure (…)
```

```
$ cd scratch && node scripts/readme-map.mjs
README_MAP: DRIFT files=135 rows=134 covered=135 bad=1 first=uncovered:lessons/round-56-verifier-spotcheck.md
EXIT=1
```

Exit **1** (DRIFT, not 2), `bad=1` (the deletion is the only defect), and the named path is the
deleted row's file, which still exists on disk.

## 5. Independent corroboration

`recompute.mjs` (this seat's own tool, in the build dir) re-derives files/rows/covered with `fs`
only and **never imports** `scripts/readme-map.mjs`:

```
$ node recompute.mjs scratch          # mutant
files=135 rows=134 covered=135
uncovered=lessons/round-56-verifier-spotcheck.md
orphans=- dupes=- stale=- uncoveredCovered=lessons/round-56-verifier-spotcheck.md unpinned=-
$ node recompute.mjs scratch-clean    # control
files=135 rows=135 covered=135
uncovered=- orphans=- dupes=- stale=- uncoveredCovered=- unpinned=-
```

Frozen counter at the same revision (`07-attest57-at-head.txt`):

```
$ node .ufo/waves/round-57/probe/attest57-probe.mjs <lane> 8c6f5b017d149b18134917378cdbed3b492d8e89
ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=8c6f5b017d149b18134917378cdbed3b492d8e89 rule=A57 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 PASS | B8 PASS | B9 PASS | B10 PASS
EXIT=0
```

B3 PASS is the arm that contains this exact mutation (its own `git archive` scratch extraction).

## 6. Discrimination matrix (all mutants run in this seat's scratch copies)

| tree | mutation | gate stdout (last line) | exit |
|---|---|---|---|
| `scratch-clean` | none | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 |
| `scratch` | row deleted (`lessons/round-56-verifier-spotcheck.md`) | `README_MAP: DRIFT … bad=1 first=uncovered:lessons/round-56-verifier-spotcheck.md` | 1 |
| `scratch-k` | a *different* row deleted (`knowledge/worker-heartbeat-liveness.md`) | `… bad=1 first=uncovered:knowledge/worker-heartbeat-liveness.md` | 1 |
| `scratch-last` | the last row in the file deleted (`lessons/round-57.md`) | `… bad=1 first=uncovered:lessons/round-57.md` | 1 |
| `scratch-stale` | row **and** file deleted | `… files=134 rows=134 covered=135 bad=1 first=stale-covered:lessons/round-57.md` | 1 |
| `scratch-format` | row present, first cell unquoted (`\| lessons/round-57.md \|`) | `README_MAP: note uncovered:lessons/round-57.md` then `… bad=2 first=format-unmapped:lessons/round-57.md` | 1 |
| `scratch-typo` | row path typoed to `knowledgex/…` | `… bad=1 first=uncovered:knowledge/worker-heartbeat-liveness.md` | 1 |
| `scratch-untracked` | a new `corpus/lessons/round-58.md` with no row | `README_MAP: note unpinned:lessons/round-58.md` then `… files=136 rows=135 … bad=2 first=uncovered:lessons/round-58.md` | 1 |
| `scratch-reorder` | two adjacent rows swapped (benign) | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 |

Readings:

- The named path is genuinely derived, not positional or hardcoded — three deletions at different
  positions and in both namespaces each name their own file.
- The label is specific: removing the row *and* the file yields `stale-covered`, not `uncovered`;
  the file-missing and row-missing diagnoses do not collapse.
- A look-alike row is not accepted as coverage: an unquoted first cell is `format-unmapped` **and**
  the file is still reported `uncovered`; a typoed prefix escapes the `format-unmapped` arm but the
  real file is still reported `uncovered` (the class fails closed on coverage even when the row
  text is unreported).
- A new unrowed corpus file — the exact R56-V3 class — is `uncovered` + `unpinned`, exit 1.
- No false positive on a benign edit: reordering rows keeps `CLEAN` exit 0.

## 7. Contrast with the count-only proxy term (the C1 rationale)

Same trees, `node scripts/proxy-check.mjs --strict`:

```
scratch-clean / scratch-reorder : PROXY: MATCH (… C2=135/135 …)                                  EXIT=0
scratch (row deleted)           : PROXY error C2_DRIFT   C2: declared=135 computed=134 delta=-1
                                  PROXY: DRIFT (C2_DRIFT …; AXES_DRIFT term=coverage declared=10 computed=9)   EXIT=1
scratch-k (row deleted)         : PROXY error C2_DRIFT   C2: declared=135 computed=134 delta=-1   EXIT=1
scratch-untracked (new file)    : PROXY error C2_TOTAL_DRIFT C2_total: declared=135 computed=136 delta=+1  EXIT=1
```

Observed: `proxy-check` reports the row deletion only as a **signed count delta** (`-1`), names no
file, and cannot discriminate a row deletion from a row reorder at all (reorder reads `MATCH`). The
new gate names the uncovered file. That is exactly the defect class C1 claims to make mechanical
(R56-V3: a file landing without its row, surfacing only as a count mismatch the next round repaired
by hand).

## 8. Limits

- Scored revision is the committed tip `8c6f5b0…`; the plan names base `7178bfd…` and a close
  revision R1. Any judged revision must be re-scored against its own bytes (the frozen probe
  re-extracts per rev; my transcripts are bound to `8c6f5b0…` only).
- The gate reads the **working tree** directory listing (`readdirSync`), while the frozen probe
  scores a `git archive` extraction. A lane-local untracked `corpus/*.md` therefore DRIFTs the lane
  gate while leaving the committed-tree probe CLEAN. Observed in `scratch-untracked`; stated as an
  asymmetry, not a defect.
- Not exercised here: the `FAIL-CLOSED` (exit 2) arms, `orphan-row`, `duplicate-row`, `unpinned`
  in isolation, and the `--registry/--readme/--corpus` CLI override paths. Other seats hold those
  arms; this seat reports only what it ran.
- The DRIFT summary line carries only `first=<bad[0]>`; the remaining defects are printed as
  `README_MAP: note <defect>` lines **before** it. A consumer that greps only the summary line sees
  `bad=<n>` but just one defect id. Observed in `scratch-format` / `scratch-untracked`; recorded as
  an operability note for the L1, not as a claimed defect.

## 9. Evidence inventory (all under `.ufo/waves/round-57/build/ExecMapUncovered/`)

| file | contents |
|---|---|
| `00-setup.txt` | lane HEAD + `git archive HEAD` into `scratch/`, exit 0 |
| `01-row-deletion.diff` | `diff -u` of committed README vs mutant: one line removed, none added |
| `02-gate-drift.txt` | primary mutant gate run: DRIFT `uncovered:lessons/round-56-verifier-spotcheck.md`, exit 1 |
| `03-waves-dir-listing.txt` | `round-57` wave dir listing (no stray writes left behind) |
| `04-proxy-control.txt` | `proxy-check --strict` on pristine tree: `MATCH`, exit 0 |
| `05-proxy-mutant.txt` | `proxy-check --strict` on primary mutant: `C2_DRIFT declared=135 computed=134`, exit 1 |
| `06-recompute.txt` | independent recompute, control vs mutant |
| `07-attest57-at-head.txt` | frozen A57 probe at `8c6f5b0…`: `ATTEST57_HELD 10/10`, exit 0 |
| `08-gate-mutants-ab.txt` | `scratch-k` and `scratch-last` gate runs (distinct uncovered names) |
| `09-gate-stale-and-reorder.txt` | `stale-covered` contrast + benign reorder `CLEAN` |
| `10-proxy-reorder-and-k.txt` | proxy `MATCH` on reorder, `C2_DRIFT` on knowledge-row deletion |
| `11-gate-format-control.txt` | unquoted-row `format-unmapped` + `uncovered` note |
| `12-digest-bindings.txt` | committed blob digests vs every scratch copy's gate/README |
| `13-lane-status.txt` | `git status --porcelain` (my dir excluded) + empty `git diff` for the three production paths |
| `14-stray-removal.txt` | record of one misdirected redirect outside my seat dir and its deletion |
| `15-gate-typo-row.txt` | typoed row path → `uncovered` on the real file |
| `16-gate-unrowed-file.txt` | new unrowed corpus file → `uncovered` + `unpinned`; proxy `C2_TOTAL_DRIFT` |
| `recompute.mjs` | this seat's independent (gate-free) bimap recomputation |
| `scratch*/` | the seven `git archive` trees used above (verbatim committed bytes + one edit each) |

## 10. Blockers, installs, side effects

- Blockers: none.
- Tooling installed/updated: none (node was already present; no package manager was invoked).
- Production lane untouched: `git diff --stat -- corpus/README.md scripts/readme-map.mjs
  .ufo/pins/readme-map.json` is empty (`13-lane-status.txt`). One stray file was created by a
  misdirected shell redirect at setup (`.ufo/waves/round-57/build/02-gate-drift.txt`, one level
  above my seat dir); it was read for the record and deleted (`14-stray-removal.txt`), and the
  wave `build/` listing no longer contains it.
- No model/provider/route configuration was read or changed; no git or jj mutation of any kind.
