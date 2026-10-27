VERDICT: The inherited readme-map repair is already landed and minimal at `39f61816` (`CLEAN 163/163/163`), and the forward repair round 68 still owes is derived and measured to the byte — 2 rows + 2 pins in the same commit as its two corpus files gives `README_MAP: CLEAN files=165 rows=165 covered=165`; one gate contract defect (symlink branch) is proven and patched as text only.

## Evidence

```
$ git archive d23892ad | tar -x -C $S/base2 && node $S/base2/scripts/readme-map.mjs
README_MAP: note uncovered:lessons/round-67-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-66-verifier-spotcheck.md
README_MAP: note unpinned:lessons/round-67-verifier-spotcheck.md
README_MAP: DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md
EXIT=1                                                        # build/K68ExecReadmeFix/base-drift.txt

$ git rev-parse HEAD → 39f61816d4ee7a8d401df42c1818c91a9c537bce  ("… readme-map inherited repair")
$ git show 39f61816 --format= -- corpus/README.md .ufo/pins/readme-map.json
 corpus/README.md           | 2 ++      # rows for round-66 / round-67 spotchecks, after line 196
 .ufo/pins/readme-map.json  | 4 +++-    # 2 members appended after "lessons/round-66.md"
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=163 rows=163 covered=163
EXIT=0                                                        # build/K68ExecReadmeFix/lane-head.txt

# forward state: HEAD + the two round-68 corpus files, no rows/pins (placeholders in a scratch copy)
README_MAP: DRIFT files=165 rows=163 covered=163 bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md
EXIT=1                                                        # build/K68ExecReadmeFix/sim-before.txt

# after apply.mjs (rows §3.1/§3.2, pins §3.3)
INSERT row after line 193: knowledge/mcp-deprecation-registry.md
INSERT row after line 199: lessons/round-68.md      # last lessons row, already shifted by the first insert
INSERT pins after member line 166: knowledge/mcp-deprecation-registry.md, lessons/round-68.md
README_MAP: CLEAN files=165 rows=165 covered=165
EXIT=0                                                        # build/K68ExecReadmeFix/sim-after.txt

# entry only, no round-68 lesson
README_MAP: CLEAN files=164 rows=164 covered=164               # build/K68ExecReadmeFix/entry-only.txt

# awk pipe-column validation of the two predicted rows (well-formed row = 4 pipes)
line=194 pipes=4 cell1=| `knowledge/mcp-deprecation-registry.md` | Th
line=200 pipes=4 cell1=| `lessons/round-68.md` | Round-68: `routed-le
# pins: version 2 count 165 unique 165 tail [...,"round-67-verifier-spotcheck.md",
#        "knowledge/mcp-deprecation-registry.md","lessons/round-68.md"]   # row-parse-check.txt
```

Symlink branch, measured (`symlink-defect.txt`):

```
$ ls -l fx1/corpus/lessons/link.md → link.md -> ../knowledge/a.md   (target exists)
$ node scripts/readme-map.mjs --registry fx1/reg.json --readme fx1/corpus/README.md --corpus …/knowledge --corpus …/lessons
README_MAP: DRIFT files=3 rows=3 covered=3 bad=1 first=stale-covered:lessons/link.md
EXIT=1
$ node diag/readme-map-diag.mjs …   # scratch copy of the script, the symlink catch logs
DIAG caught ReferenceError: full is not defined
```

## Findings

**K68ExecReadmeFix-1 — medium, operability: the round-68 map repair the plan does not name.**
The plan folds the R56-V3 repair into "this round's integration change", but it is already in the freeze
commit; what is *not* budgeted is that the two corpus files round 68 must land (`corpus/knowledge/
mcp-deprecation-registry.md`, C2 M1; `corpus/lessons/round-68.md`) open a fresh 4-item DRIFT, and
`scripts/deprec68-probe.mjs:343` scores `README_MAP: CLEAN` as its M9 term — an unrowsed entry fails C2 for a
reason unrelated to C2. Row+pin must ride the *same commit* as each file; a row without its file is
`orphan-row` + `stale-covered` (measured: `DRIFT files=164 rows=165 covered=165 bad=2`). Exact rows, anchors
and pins: `build/K68ExecReadmeFix/repair.md` §3; mechanical form `apply.mjs` (idempotent, inserts only for
files present on disk; second run prints `SKIP row (present)` ×2 / `SKIP pins (all present)`).
Repro: `git archive HEAD | tar -x -C $S/sim; printf '#x\n' > $S/sim/corpus/knowledge/mcp-deprecation-registry.md;
printf '#x\n' > $S/sim/corpus/lessons/round-68.md; node $S/sim/scripts/readme-map.mjs` → `bad=4`; then
`node .ufo/waves/round-68/build/K68ExecReadmeFix/apply.mjs $S/sim; node $S/sim/scripts/readme-map.mjs` → `CLEAN 165/165/165`.

**K68ExecReadmeFix-2 — low/medium, gate contract fidelity: `scripts/readme-map.mjs:224` reads an undefined
`full`.** The `ReferenceError` is swallowed by the next `catch`, so a `covered` member that is a symlink to an
*existing* file is reported `stale-covered` where lines 30–33 of the same file promise `covered-not-file`;
selftest case 16 (dangling link) can no longer discriminate the two classes. Exit stays 1, so no false CLEAN.
Patch text (unapplied, `scripts/` is L1-owned): `build/K68ExecReadmeFix/fix-readme-map-symlink.patch`
(`statSync(full)` → `statSync(join(dirFor[ns], leaf))`, plus a proposed case 17 `symlink-not-file`).

**K68ExecReadmeFix-3 — low, landed data fidelity: the round-66 spotcheck row over-claims conformance.**
`corpus/README.md:197` says "step-1 conformance all pass", while `corpus/lessons/round-66-verifier-spotcheck.md:20`
records `DEFECT (live wave seats, see routed D1)`, and the row omits the file's own
`Verdict: **claim not verified**` (`…:44`). Receivers (held=3/6, held=0/8, D1–D3, tip) are correct; the gate is
unaffected. Repro: `awk 'NR==20' corpus/lessons/round-66-verifier-spotcheck.md` vs
`awk 'NR==197' corpus/README.md`. The round-67 row (`README.md:198`) checks faithful (five routed items
`…:70–74`, tip `f29eb699…`, verdict `…:76`).

**K68ExecReadmeFix-4 — informational, two conventions a next seat will otherwise break.** (a) The pins array is
append-ordered, *not* byte-sorted (11 adjacent inversions); inserting "at the sorted position" means appending
after the last member — a re-sort is an unreviewable diff and a needless risk. (b) `corpus/routed-ledger.md`
(C1's data) is invisible to this gate: adding it leaves `CLEAN 165/165/165`, and `scripts/proxy-check.mjs:443`
counts the same two dirs only — no row/pin work for it. Repro: `printf '#x\n' > $S/sim/corpus/routed-ledger.md;
node $S/sim/scripts/readme-map.mjs` → unchanged `CLEAN`.

## Artifacts

- `.ufo/waves/round-68/build/K68ExecReadmeFix/repair.md` — the repair: base DRIFT, both rows verbatim, insertion
  anchors (README: after `| \`knowledge/omp-installed-release-mcp-runtime.md\` |`, after the last
  `| \`lessons/` row), three pin fragments + exact tail transform, predicted counts, validation, reproduction.
- `…/build/K68ExecReadmeFix/apply.mjs` — applies repair.md to a lane root (file-existence gated, idempotent).
- Receipts: `base-drift.txt`, `lane-head.txt`, `sim-before.txt`, `sim-after.txt`, `entry-only.txt`,
  `row-parse-check.txt`, `symlink-defect.txt`, `landed-repair.diff`, `fix-readme-map-symlink.patch`.

## Limits

- The two round-68 rows are forward-looking (the entry/lesson do not exist yet): their prose counts (61 items /
  12 sections, S207–S213, `18.13.1`) came from the plan and must be re-read against the landed bytes; the gate
  does not score prose.
- Predicted `166/166/166` (a round-68 verifier spotcheck landing next round) is arithmetic, not measured.
- The full gate set was not swept: I executed only `readme-map` (plus its selftest `PASS (16/16)`) — not
  `proxy-check`, `source-capture`, `sources-check` or the round counters — so cross-gate interaction with
  `corpus/routed-ledger.md` is read from `proxy-check.mjs:443`, not measured.
- Placeholder corpus files in the sim carry no front-matter, so no other gate's reaction to the real entry was
  exercised.
