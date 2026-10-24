# ExecMapEmptyCovered — round 57 w1 (mutation-tester, C1 instrument)

Item: **ExecMapEmptyCovered** — in a scratch copy, set `covered=[]` while corpus files
remain; verify DRIFT `unpinned` (an empty pin set is never a vacuous CLEAN).
Scope: C1's instrument `scripts/readme-map.mjs` + `.ufo/pins/readme-map.json`.
C2 (`worker-heartbeat-liveness`) is out of scope for this seat.

**Verdict: corroborated, no counterexample found.** With `covered=[]` and the corpus
intact the gate prints `README_MAP: DRIFT files=135 rows=135 covered=0 bad=135
first=unpinned:knowledge/agent-isolation-substrates.md` and exits **1**. Every one of
the 135 drift entries is `unpinned`, and that set is exactly the live corpus set.
No arm in the matrix produced `CLEAN` with an empty pin set, and the code path makes
CLEAN unreachable there (see §3).

## 1. What was tested (identity pinning)

| item | value |
|---|---|
| lane | `/home/vgpnk/Projects/shokunin/kumitate-shokunin` |
| plan base | `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (gate + registry absent there; `git ls-tree` empty) |
| tested rev | `f0dc6d1160e66af65355bd353665adac22bbf4a9` (round-57 R1 integration tip; contains gate + registry) |
| gate sha256 | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` — equals live `scripts/readme-map.mjs` and SCORECARD `pin.readme-map` (line 326) |
| registry sha256 | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` — live == R1 extraction |
| live census | registry `version=1 covered=135`; corpus 52 `knowledge` + 83 `lessons` = 135 files; README map rows = 135 |
| isolation | `git -C lane archive f0dc6d11 | tar -x -C scratch/base`; every mutation applied only to copies under `arms/` |

Commands were run with `cwd=<arm copy>` so the gate's own `LANE` resolves inside the
copy; no command read or wrote lane production files. No pacman, no installs, no
git/jj mutation, no commit.

## 2. Arm matrix (all observed, full stdout/stderr + exit in `logs/`)

| arm | mutation | exit | last line |
|---|---|---|---|
| baseline | none (R1 extraction) | 0 | `README_MAP: CLEAN files=135 rows=135 covered=135` |
| **arm1** | **`covered=[]`, README + corpus intact** | **1** | **`README_MAP: DRIFT files=135 rows=135 covered=0 bad=135 first=unpinned:knowledge/agent-isolation-substrates.md`** |
| arm2 | `covered=[]` + README map rows stripped | 1 | `DRIFT files=135 rows=0 covered=0 bad=270 first=uncovered:knowledge/agent-isolation-substrates.md` |
| arm3 | `covered=[]` + rows stripped + corpus `*.md` deleted | 2 | `FAIL-CLOSED reason=no *.md under … (empty corpus)` |
| arm3b | full registry/README, corpus `*.md` deleted | 2 | `FAIL-CLOSED reason=no *.md under … (empty corpus)` |
| arm4 | registry `{"version":1}` (no `covered`) | 2 | `FAIL-CLOSED reason=registry covered not an array` |
| arm5 | `covered` minus exactly one live file (`knowledge/at-least-once-dedupe.md`) | 1 | `DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:knowledge/at-least-once-dedupe.md` |
| arm6 | `covered=[]` + README removed | 2 | `FAIL-CLOSED reason=README unreadable: ENOENT` |
| arm7 | `covered=[]` + `corpus/lessons` removed | 2 | `FAIL-CLOSED reason=corpus dir unreadable: …/corpus/lessons (ENOENT)` |
| arm8 | `version=2`, `covered=[]` | 2 | `FAIL-CLOSED reason=registry version 2 !== 1` |
| arm9 | `covered` reversed (order control) | 0 | `CLEAN files=135 rows=135 covered=135` |
| arm10 | `covered=[]` + all corpus `*.md` renamed `.txt` | 2 | `FAIL-CLOSED reason=no *.md under … (empty corpus)` |
| arm11 | `covered` with one duplicate entry | 2 | `FAIL-CLOSED reason=covered entry duplicated: "knowledge/agent-isolation-substrates.md"` |

`CLEAN` never appears in any mutated stdout (checked by substring on every arm; only
baseline and arm9 contain it). arm9 shows the DRIFT in arm1 is due to pin membership,
not to registry ordering or formatting: the same 135 entries in reverse order are CLEAN.

### arm1 exactness

- Summary: `files=135 rows=135 covered=0 bad=135`.
- 134 `README_MAP: note unpinned:…` lines plus the `first=unpinned:…` summary; class
  census over all note lines: `134 unpinned`, 0 `uncovered` / `orphan-row` /
  `duplicate-row` / `stale-covered` / `format-unmapped`.
- The 135 unpinned names (deduplicated) diff **equal** to the namespaced live corpus
  listing (`knowledge/*.md` + `lessons/*.md`), so no file is omitted and no extra path
  is invented.
- README has 135 map rows, so the drift is attributable solely to the empty pin set,
  not to missing rows.

## 3. Why CLEAN is unreachable (code-level, R1 bytes)

- `loadFiles` returns FAIL-CLOSED when `files.length === 0` (`scripts/readme-map.mjs:162-163`).
- `loadRegistry` accepts an empty array (it validates shape/malformity per entry, not
  cardinality), so `covered=[]` reaches `evaluate` as a *valid* registry.
- `evaluate` iterates live files and pushes `unpinned:<file>` for every file not in the
  `covered` set (`scripts/readme-map.mjs:195-197`); `DRIFT, exit 1` iff `bad.length > 0`
  (`:199`); `CLEAN` only when `bad` is empty (`:200`).
- Therefore, with ≥1 corpus file and `covered=∅`, `bad` contains at least one
  `unpinned` entry ⇒ DRIFT exit 1; with 0 corpus files the gate short-circuits to
  FAIL-CLOSED exit 2. There is no input shape with an empty pin set that yields exit 0.

Note on semantics (informational, not a defect): an empty `covered` is classified
**DRIFT (exit 1)**, not FAIL-CLOSED. That matches the frozen contract (only unreadable/
malformed registries, bad version, malformed/duplicate/out-of-namespace entries, bad
README/corpus paths and the empty corpus are exit 2); both outcomes are non-CLEAN, and
the judged counter separately requires `covered.length >= 1` (B2), so the vacuous case
cannot pass the round gate either.

## 4. Instrument cross-checks at the same rev

- `node scratch/base/scripts/readme-map.mjs --selftest` → `case empty-covered: PASS`,
  `README_MAP_SELFTEST: PASS (14/14)`, `VERDICT: PASS`, exit 0 (`logs/02-selftest.txt`).
  Case 8 asserts `exit===1 && stdout.includes('unpinned:')`.
- `node .ufo/waves/round-57/probe/attest57-probe.mjs <lane> f0dc6d11…` →
  `ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=f0dc6d11… rule=A57 version=v1`,
  `B1..B10 PASS`, exit 0 (`logs/03-attest57-r1.txt`). Its **B3 arm (e)** is exactly this
  mutation (`d.covered = []` with files present, expects `unpinned`) and passes; B2
  additionally rejects a registry with `covered.length < 1`.

So the property is guarded twice at judged rev (gate drift + counter assertion) and by
the hermetic selftest case.

## 5. Residual risks / coverage observations (advisory only — no production edit made)

1. **Cardinality not pinned by either automated arm.** Selftest case 8 and B3(e) assert
   only `exit 1 && includes('unpinned')`. A regression reporting a single `unpinned`
   entry out of 135 would still pass both. My arm1 supplies the scale evidence
   (`bad=135`, set equality) but that evidence is not part of any committed check.
   Hardening would be to assert `covered=0` and `bad=<files count>` in case 8 and in
   B3(e) — a strictness-only amendment.
2. **The empty-corpus guard (`files.length === 0` → FAIL-CLOSED) is not exercised by the
   selftest.** Selftest case 13 removes the *directory* (`corpus-dir-missing`), and probe
   B4's five arms are malformed JSON / version 2 / `covered:'x'` / out-of-namespace
   entry / README removed — none leaves both dirs present with zero `*.md`. Live, the
   guard fires correctly (arm3, arm3b, arm10, exit 2), so today's behavior is sound; the
   gap is regression coverage for the only line preventing the true zero-file corner
   from being evaluated as a bimap of empties.
3. **Empty pin set is DRIFT, not FAIL-CLOSED** (see §3). Exit codes remain non-zero, so
   no operability impact; recording it because a future consumer treating exit 2 as the
   only "instrument unhealthy" signal would see `covered=0` as a data defect. No such
   consumer exists (`grep` over `scripts/`, `SKILL.md`, `SCORECARD.md`: the only
   programmatic reference is `scripts/proxy-check.mjs:475`, which pins the script hash
   and does not run or parse the gate).

## 6. Files changed / artifacts

Lane production files, pins, registry, README, SCORECARD/LOG/SKILL and git/jj state:
**unchanged by this seat** (measured no-change). Pre-existing dirty entries observed
*before* any write and not mine: `M .ufo/waves/round-57/w1/swarm-registry.json`, untracked
sibling build dirs (`ExecMapClean/`, `ExecSourcesGate/`, `ReviewProxyPin/`,
`Scout*/`), `w1/swarm-registry.legacy-wave-v1.json`.

Evidence (all under `.ufo/waves/round-57/build/ExecMapEmptyCovered/`):
`logs/00-sha.txt`, `logs/01-baseline.out|.err`, `logs/02-selftest.txt`,
`logs/03-attest57-r1.txt`, `logs/arm1.txt` … `logs/arm11.txt`, `logs/10-matrix.txt`;
pristine extraction `scratch/base/`, mutated copies `arms/arm1..arm11`.
Report: `.ufo/waves/round-57/w1/ExecMapEmptyCovered.md`.

## 7. Blockers

None. No tool install was needed or performed.
