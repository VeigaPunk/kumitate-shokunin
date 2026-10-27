# readme-map repair — exact mechanics (K68ExecReadmeFix, round 68 w1)

Gate: `scripts/readme-map.mjs` (contract `kumitate-readme-map-v2`). Registry `.ufo/pins/readme-map.json`
(`version: 2`, 163 members at HEAD). README map `corpus/README.md`.

## 1. Base reading (frozen base `d23892ad`), verbatim

```
$ git archive d23892ad | tar -x -C base2 && node base2/scripts/readme-map.mjs
README_MAP: note uncovered:lessons/round-67-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-66-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-67-verifier-spotcheck.md
README_MAP: DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md
EXIT=1
```

(`build/K68ExecReadmeFix/base-drift.txt`.) The four defects decompose exactly: 2 files without a row
(`round-66-…`, `round-67-…` spotchecks) + 2 files without a pin (same two). `files=163` already counts both
files, so no corpus file was missing — only its map row and its pin.

## 2. The inherited repair is already landed at HEAD `39f61816`

`git show 39f61816 --format= -- corpus/README.md .ufo/pins/readme-map.json`
(`build/K68ExecReadmeFix/landed-repair.diff`) adds exactly:

- `corpus/README.md` lines **197–198**: rows for `lessons/round-66-verifier-spotcheck.md` and
  `lessons/round-67-verifier-spotcheck.md`, appended after `| `lessons/round-66.md` |` (then line 196);
- `.ufo/pins/readme-map.json`: `"lessons/round-66-verifier-spotcheck.md"` and
  `"lessons/round-67-verifier-spotcheck.md"` after `"lessons/round-66.md"` (then the last member).

Measured result and sufficiency:

```
$ node scripts/readme-map.mjs          # lane worktree at HEAD
README_MAP: CLEAN files=163 rows=163 covered=163
EXIT=0
```

This is the whole inherited repair: 2 rows + 2 pins, no other README/pin edit. It cannot be reduced
(each of the 4 bad items is one file-side omission) and nothing else is needed for `163/163/163`.

## 3. Forward repair — the round-68 files (exact edits)

Round 68 lands two corpus files that the gate scores: `corpus/knowledge/mcp-deprecation-registry.md`
(C2 entry) and `corpus/lessons/round-68.md` (round lesson). `corpus/routed-ledger.md` (C1 data) is **not**
scored — `loadFiles()` scans `corpus/knowledge` + `corpus/lessons` only; measured, see §5.

Measured pre-repair state with both files present and no rows (`build/K68ExecReadmeFix/sim-before.txt`):

```
README_MAP: DRIFT files=165 rows=163 covered=163 bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md
EXIT=1
```

### 3.1 Row 1 — insert immediately after the last knowledge row

Anchor (line-number free, because numbers shift): the row whose first cell is
`| `knowledge/omp-installed-release-mcp-runtime.md` |` — currently **README line 193**, the last
`knowledge/` row. Insert as the new line 194:

```
| `knowledge/mcp-deprecation-registry.md` | The MCP deprecation registry, re-grounded on rows opened 2026-10-27 against the installed host release `omp/18.13.1`: SEP-2596 Final 2026-06-03 (S213) + the registry's three-month grace → elapsed 2026-09-03, the legacy HTTP+SSE transport source re-verified at `/v18.13.1/` (S209/S212), and the S207 Deprecated table mirrored row-for-row; frontier band "MCP protocol revisions as they bear on orchestration", rows S207–S213 | `corpus/knowledge/mcp-deprecation-registry.md`; `corpus/SOURCES.md` S207–S213; `.ufo/pins/source-captures.json` |
```

### 3.2 Row 2 — insert immediately after the last lessons row

Anchor: the last line starting `| `lessons/` (currently **line 198**,
`lessons/round-67-verifier-spotcheck.md`; the table ends there, followed by two blank lines and
`## Known gaps` at line 201). Insert as the new line 199:

```
| `lessons/round-68.md` | Round-68: `routed-ledger` v2 (contract `kumitate-routed-ledger-v2`, rule L68) with its data `corpus/routed-ledger.md` (61 items in 12 sections) and its registry home, plus the MCP deprecation registry re-grounded at `omp/18.13.1` (rule M68, rows S207–S213); mistake mined `unexercised-counter` with the QUALITY Q64 fix | `.ufo/waves/round-68/plan.md`; `.ufo/waves/round-68/probe/`; `.ufo/waves/round-68/base/` |
```

Both rows carry exactly 3 cells / 4 pipes, no `|` inside any cell, one physical line each. Re-check the
bytes quoted in them (61/12, S207–S213, `18.13.1`) against the landed files at insertion time; the map
gate does not verify prose.

### 3.3 Pins — three JSON fragments

Current tail of `covered` (`.ufo/pins/readme-map.json`, member lines 163–165):

```json
  "lessons/round-65-verifier-spotcheck.md",
  "lessons/round-66.md",
  "lessons/round-66-verifier-spotcheck.md",
  "lessons/round-67-verifier-spotcheck.md"
 ]
```

Fragment A (already landed at 39f61816, the inherited pair — for the record):

```json
  "lessons/round-66.md",
  "lessons/round-66-verifier-spotcheck.md",
  "lessons/round-67-verifier-spotcheck.md"
```

Fragment B + C (this round's two members) — exact transform of the last member line:

```json
-  "lessons/round-67-verifier-spotcheck.md"
+  "lessons/round-67-verifier-spotcheck.md",
+  "knowledge/mcp-deprecation-registry.md",
+  "lessons/round-68.md"
 ] }
```

Entry-only variant (if the lesson does not land this round): append only
`"knowledge/mcp-deprecation-registry.md"`.

Ordering note: **do not sort this array.** It is append-ordered and not byte-sorted (11 non-sorted
adjacent pairs, e.g. member 53–54 `temporal-worker-versioning-pinning.md` → `swarm-wave-lifecycle.md`);
the gate compares the set, so append is the convention and a re-sort is an unreviewable diff. Indentation
is 2 spaces for members, ` ]` closing, `{"version": 2, "covered": [...]}` — as in the file today.

## 4. Predicted counts (measured in scratch copies of HEAD)

| state | files | rows | covered | verdict | receipt |
|---|---|---|---|---|---|
| HEAD after the inherited repair | 163 | 163 | 163 | `CLEAN` exit 0 | `lane-head.txt` |
| round-68 files landed, no rows/pins | 165 | 163 | 163 | `DRIFT bad=4` exit 1 | `sim-before.txt` |
| entry only + row + pin | 164 | 164 | 164 | `CLEAN` exit 0 | `entry-only.txt` |
| entry + lesson + both rows + both pins | **165** | **165** | **165** | `CLEAN` exit 0 | `sim-after.txt` |
| + a round-68 verifier spotcheck lands (round 69's file) | 166 | 166 | 166 | `CLEAN` with +1 row/pin | arithmetic only, not measured |

`files == rows == covered` is the invariant: every `*.md` in the two dirs needs exactly one row and one pin.

## 5. Validation actually run

```
$ awk '/^\| `knowledge\/mcp-deprecation-registry.md`/ || /^\| `lessons\/round-68.md`/ {n=gsub(/\|/,"|"); ...}'
line=194 pipes=4 cell1=| `knowledge/mcp-deprecation-registry.md` | Th
line=200 pipes=4 cell1=| `lessons/round-68.md` | Round-68: `routed-le
$ node scripts/readme-map.mjs        # same copy
README_MAP: CLEAN files=165 rows=165 covered=165
EXIT=0
$ node -e pins sanity
version 2 count 165 unique 165 tail ["lessons/round-67-verifier-spotcheck.md","knowledge/mcp-deprecation-registry.md","lessons/round-68.md"]
```

(`row-parse-check.txt`.) Additional measured facts:

- **idempotent**: a second `apply.mjs` run prints `SKIP row (present)` ×2 / `SKIP pins (all present)` and the
  gate stays `CLEAN 165/165/165`.
- **row without file is DRIFT**: deleting `corpus/lessons/round-68.md` from the repaired copy gives
  `DRIFT files=164 rows=165 covered=165 bad=2 first=orphan-row:lessons/round-68.md` (+ `stale-covered`).
  So the row and the corpus file must land in the **same commit**; the pin must not precede the file.
- **`corpus/routed-ledger.md` is invisible to this gate**: adding it to the repaired copy leaves
  `CLEAN files=165 rows=165 covered=165` — no row, no pin, no count change (and `scripts/proxy-check.mjs:443`
  counts the same two dirs only). C1's data file needs no map work.

Mechanical form: `build/K68ExecReadmeFix/apply.mjs <lane-root>` applies §3.1–3.3 for whichever of the two
files exists on disk (rows anchored on text, pins appended to the last member, nothing written when the
file is absent).

## 6. Landed-row fidelity review (the two inherited rows, §2)

Checked against the lesson files themselves:

- **`lessons/round-66-verifier-spotcheck.md` row**: receivers correct — `LEDGER66_UNMET held=3/6`
  (file:31), `DEPREC66_UNMET held=0/8` (file:41), routes D1/D2/D3 (file:71–73), tip
  `8d557f85…`. Two prose defects: it says *"step-1 conformance all pass"* while the file's own table
  records one `DEFECT (live wave seats, see routed D1)` at file:20, and it omits the file's explicit
  `Verdict: **claim not verified**` (file:44).
- **`lessons/round-67-verifier-spotcheck.md` row**: faithful — honest stop, no claim,
  five routed defects numbering exactly the file's items 1–5 (file:70–74), tip `f29eb699…`,
  verdict `rejected-honest-stop` (file:76) left implicit.

Neither row breaks the gate; §3's rows are the shape to copy.

## 7. Tool defect found while deriving this (not fixed — `scripts/` is the L1's)

`scripts/readme-map.mjs:224` calls `statSync(full)` inside the symlink branch; `full` is undefined, the
`ReferenceError` is swallowed by the `catch` on line 226, so a `covered` member that is a **symlink to an
existing file** is reported `stale-covered` instead of the documented `covered-not-file` (contract,
lines 30–33). Measured (`symlink-defect.txt`):

```
$ ls -l fx1/corpus/lessons/link.md
lrwxrwxrwx … corpus/lessons/link.md -> ../knowledge/a.md
$ node scripts/readme-map.mjs --registry fx1/reg.json --readme fx1/corpus/README.md --corpus …/knowledge --corpus …/lessons
README_MAP: DRIFT files=3 rows=3 covered=3 bad=1 first=stale-covered:lessons/link.md
$ node diag/readme-map-diag.mjs …   # scratch copy, catch logs
DIAG caught ReferenceError: full is not defined
```

Severity: the verdict is still `DRIFT` exit 1 (no false CLEAN), but the finding id is wrong and selftest
case 16 (dangling link) can no longer distinguish the two symlink classes. Proposed minimal patch
(`fix-readme-map-symlink.patch`, + a case 17 `symlink-not-file`):

```diff
     if (lst.isSymbolicLink()) {
       try {
-        statSync(full);
+        statSync(join(dirFor[ns], leaf));
         bad.push(`covered-not-file:${c}`);
       } catch {
         bad.push(`stale-covered:${c}`);
       }
```

## 8. Reproduction

```sh
S=/fast/scratch/hyaku/kumitate-r68/K68ExecReadmeFix; mkdir -p "$S"
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
git archive d23892ad | tar -x -C "$S/base2" && TMPDIR=$S node "$S/base2/scripts/readme-map.mjs"   # DRIFT bad=4
git archive HEAD | tar -x -C "$S/sim" && printf '# x\n' > "$S/sim/corpus/knowledge/mcp-deprecation-registry.md" \
  && printf '# x\n' > "$S/sim/corpus/lessons/round-68.md" && TMPDIR=$S node "$S/sim/scripts/readme-map.mjs"  # DRIFT 165/163/163
TMPDIR=$S node .ufo/waves/round-68/build/K68ExecReadmeFix/apply.mjs "$S/sim" && TMPDIR=$S node "$S/sim/scripts/readme-map.mjs"  # CLEAN 165/165/165
```
