VERDICT: Both base proxy DRIFTs are one root cause — `corpus/lessons/round-63-verifier-spotcheck.md` landed with no `corpus/README.md` map row, so `C2_total` (files) is 154 while `C2` (rows) is 153 and `coverage` derives 9 against a declared 10 — and `refresh-stanza.mjs` recomputes all 17 terms, 6 v1 pins and 20 gate pins, prints the exact stanza diff, and is proven (base archive) to turn DRIFT into MATCH plain and `--strict` after the plan's D1 map repair, idempotently; at the freeze tip one further pin is required for the new C1 script.

## Evidence

Base archive (`git archive 6825a514… | tar -x -C /tmp/kumitate-r64/K64ExecProxyRepair/proof`) — the frozen receipt reproduces exactly:
```
$ node scripts/proxy-check.mjs            # receipts/00-base-plain.txt
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=154 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
exit=1
$ node scripts/proxy-check.mjs --strict   # receipts/01-base-strict.txt  → identical, exit=1
```
The two counts behind the finding (derivation is `scripts/proxy-check.mjs:948-949`: `C2Total = notes.length` over `corpus/{knowledge,lessons}/**/*.md`; `C2 = countLines(readmeText, RE_README_ROW)`):
```
$ ls corpus/knowledge/*.md corpus/lessons/*.md | wc -l      → 154
$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md   exit=1
$ node -e 'console.log(Math.floor(10*19/19*153/154))'       → 9
```
Tool on the unrepaired base — it refuses to launder the map gap into the stanza (`receipts/02-refresh-before.txt`):
```
REFRESH: BLOCKED (… terms=17 pins=6 gate-pins=20 blockers=2)
REFRESH  BLOCK  MAP_INCOMPLETE  C2=153 README rows vs C2_total=154 corpus *.md — 1 note(s) carry no map row; proxy coverage derives 9 and the ## Axes row would have to be lowered to match (an axis harm); `node scripts/readme-map.mjs` exit=1 reads README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
REFRESH  BLOCK  CANDIDATE_DRIFT  candidate still reads PROXY: DRIFT (AXES_DRIFT term=coverage declared=10 computed=9; …)
PREDICT: DRIFT (exit 1) strict=DRIFT (exit 1)
exit=1
```
After the plan's D1 map repair (`map-repair.mjs` = README row + `covered` pin) and applying exactly the tool's diff:
```
$ node scripts/readme-map.mjs                     # receipts/04-readme-map.txt
README_MAP: CLEAN files=154 rows=154 covered=154   exit=0
$ node …/refresh-stanza.mjs --lane <archive>      # receipts/06-refresh.txt
REFRESH: OK (… terms=17 pins=6 gate-pins=20 blockers=0)
PREDICT: MATCH (exit 0) strict=MATCH (exit 0)      exit=0
$ cat receipts/08-stanza.diff                     # diff_bytes=171
--- a/SCORECARD.md
+++ b/SCORECARD.md
@@ -289,8 +289,8 @@
-C2=153
-C2_total=153
+C2=154
+C2_total=154
$ patch -p1 --dry-run -d <archive> -i receipts/08-stanza.diff   → exit=0
$ patch -p1         -d <archive> -i receipts/08-stanza.diff     → exit=0
$ node scripts/proxy-check.mjs            # receipts/11-tip-plain.txt
PROXY: MATCH (A=257 C=30 operability=9; C1=19/19 C2=154/154 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0
$ node scripts/proxy-check.mjs --strict   # receipts/12-tip-strict.txt → same line, exit=0
```
Idempotency (`receipts/13/14/15/16`): second run `REFRESH: OK … blockers=0`, `PREDICT: MATCH (exit 0) strict=MATCH (exit 0)`, `idempotent_diff_bytes=0 ok=true blockers=0`; a sha256 manifest of all 13610 files is byte-identical before and after the second run (`16-manifest-diff.txt` exit=0), so the tool writes nothing into the lane.
Freeze tip `dd1a3e6` (what the L1 will meet), `receipts/17-tip-refresh.txt`: `REFRESH: BLOCKED (… blockers=3)` = `PIN_UNPINNED scripts/report-receipt-diff.mjs`, `MAP_INCOMPLETE …`, `CANDIDATE_DRIFT … (AXES_DRIFT …; PIN_UNPINNED …)`. With D1 + the proposed `GATE_PINS` patch (`proxy-check-gate-pin.patch`): `REFRESH: OK (… gate-pins=21 blockers=0)`, `PREDICT: MATCH (exit 0) strict=MATCH (exit 0)`, diff 1251 bytes (`A 257→263`, `C2/C2_total 153→154`, `pin.proxy-check`, `+pin.report-receipt-diff`), applied → `PROXY: MATCH (A=263 …)` exit=0 plain and strict (`receipts/20..25`).
Arms: `--lane /nonexistent` → `REFRESH: FAIL-CLOSED (LANE_NOT_A_LANE)` exit=2; `--scorecard /dev/null` → `STANZA_MISSING` exit=2; `--bogus` → `USAGE` exit=64; cwd-default (no `--lane`) works; a scorecard with the gate block stripped gets it re-inserted and still predicts MATCH (`receipts/26..28`).

## Findings

**K64ExecProxyRepair-1 — high (maintenance, root cause of both DRIFTs).** `C2_total` counts corpus `*.md` files, `C2` counts `corpus/README.md` rows. Commit `6825a51` added `corpus/lessons/round-63-verifier-spotcheck.md` after the stanza was fixed at `bb184a9` (`A=257`), and no map row or `readme-map.json` `covered` entry landed — the tenth R56-V3 recurrence, which the spotcheck's own D1 names. Repro: `cd /tmp/kumitate-r64/K64ExecProxyRepair/proof && node scripts/proxy-check.mjs` (exit 1) and `node scripts/readme-map.mjs` (exit 1).

**K64ExecProxyRepair-2 — high (it makes the repair look like a score change).** `AXES_DRIFT` is not independent: `coverage = floor(10 × C1/C1_total × C2/C2_total) = floor(10 × 19/19 × 153/154) = 9` against the `## Axes` row 10 (`scripts/proxy-check.mjs:747-749,1183-1201`). Any "fix" that writes `| coverage | 9 |` launders an unmapped file into a lower axis (a harm); the map row restores 10 and the row never moves. Repro: `node -e 'console.log(Math.floor(10*19/19*153/154))'` → 9; `grep -n '| coverage |' SCORECARD.md`.

**K64ExecProxyRepair-3 — medium-high (frozen-check defect, reported not patched).** The freeze commit `dd1a3e6` landed `scripts/report-receipt-diff.mjs` (C1's subject) with no pin, so `--strict` reads `PIN_UNPINNED` → DRIFT even after the stanza refresh; the v1 23-key set is frozen, so the fix is a `GATE_PINS` entry in `scripts/proxy-check.mjs` plus the block line — proposed as `proxy-check-gate-pin.patch` (proven to apply and to produce `gate-pins=21`, `MATCH` strict). Repro: `cd /tmp/kumitate-r64/K64ExecProxyRepair/tip && node scripts/proxy-check.mjs --strict`.

**K64ExecProxyRepair-4 — medium (stale term nobody measured).** `A` moved 257→263 at the freeze commit: six runnable files (`scripts/jj-seat-demo.sh`, `scripts/report-receipt-diff.mjs`, four `.ufo/waves/round-64/probe/*`) and the stanza still says 257. The base receipt was taken at `6825a514`, before them. Repro: `git diff --name-only 6825a514 dd1a3e6 | grep -E '\.(mjs|js|sh|py)$'` → 6 paths; `refresh-stanza.mjs --lane <tip archive> --explain` → `EXPLAIN: A=263 of which 235 runnable file(s) under .ufo/`.

**K64ExecProxyRepair-5 — medium (gap in the frozen check).** `comparePinCoverage` scans only `scripts/*.mjs` (`scripts/proxy-check.mjs:1143-1152`), so a new `scripts/*.sh` is silently unpinnable unless someone adds a `GATE_PINS` key: `scripts/jj-seat-demo.sh` — C2's demo, re-run by J6 — can change with no pin noticing, while `--strict` stays silent. Repro: `cd /tmp/kumitate-r64/K64ExecProxyRepair/tip && node scripts/proxy-check.mjs --strict | grep -c jj-seat-demo` → `0`.

**K64ExecProxyRepair-6 — info (operational, decides the run order).** `A` counts every runnable file under the lane, `.ufo/` included, so the live working tree reads `A=2199` while the tip archive reads 263 — in-flight seat build artifacts. The refresh must be run on the *final revision*: commit everything else first, then refresh, then commit `SCORECARD.md` (itself not runnable, so `A` is stable across that last commit). Repro: `node scripts/proxy-check.mjs --json | grep '"A"'` in the lane now vs in the archive.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecProxyRepair/refresh-stanza.mjs` — the tool (`--lane`, `--scorecard`, `--explain`, `--json`; exit 0/1/2/64; never writes the lane, predicts by re-running proxy-check on a temp candidate).
- `.ufo/waves/round-64/build/K64ExecProxyRepair/map-repair.mjs` — fixture applier for D1 (README row + `covered` pin), idempotent.
- `.ufo/waves/round-64/build/K64ExecProxyRepair/prove.sh` + `receipts/00..28-*.txt` — the whole proof, re-runnable.
- `.ufo/waves/round-64/build/K64ExecProxyRepair/proxy-check-gate-pin.patch` — proposed `GATE_PINS` entry for `report-receipt-diff.mjs` (L1 integrates).
- Scratch: `/tmp/kumitate-r64/K64ExecProxyRepair/{proof,tip,nogate}`. No tool installed; no frozen file, `scripts/`, `SCORECARD.md`, `.ufo/pins/` or git/jj state touched (`git status --porcelain` outside `.ufo/waves/round-64/` is empty).

## Limits

- The proof's Part B needs the D1 map repair applied *before* the stanza diff; the diff alone provably leaves `AXES_DRIFT` (receipts 02, 05) — that is the honest outcome, not a gap in the tool.
- The tool re-derives pins from `scripts/proxy-check.mjs`'s own `PINS`/`GATE_PINS` literals; if that source is restructured, it fails closed (`*_UNPARSEABLE`, exit 2) rather than guessing.
- It does not repair anything: no map row, no `GATE_PINS` edit, no axis row change, no write to the lane.
- `A`/`C`/`C2` semantics are the frozen ones, including committed `.ufo/` build artifacts; whether the round commits its build dirs is the L1's decision and changes `A` by an order of magnitude (finding 6).
- Not checked: whether any *other* gate pin in the 20 needs refreshing at the final tip (the tool recomputes all of them at run time, but I only exercised the two changed ones), and the C1/C2 claims' own counters (other seats).
