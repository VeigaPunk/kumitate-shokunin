VERDICT: On the five round-boundary pairs of rounds 56-60 the tool is CLEAN everywhere except r57's NEW_RED readme-map (exit 1), and every one of my 200 direct gate comparisons agrees with it — but measuring inside the rounds shows a real gate harm at every close of rounds 57-60 that the boundary framing and the CARRIED_MOVED rule both hide.

## Evidence

Boundary pairs (task command, `--timeout 180`, one run each; raw under runs/):
| round | base | tip | gates | held | repaired | carried | moved | new | harm | harm_absent | new_red | exit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| r56 | 453f6e97 | 7178bfd3 | 15 | 11 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 0 |
| r57 | 7178bfd3 | c49f2a8d | 16 | 12 | 0 | 2 | 1 | 0 | 0 | 0 | 1 | 1 |
| r58 | c49f2a8d | 0f66ecd4 | 16 | 12 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| r59 | 0f66ecd4 | ffbfe3cc | 17 | 12 | 0 | 2 | 2 | 1 | 0 | 0 | 0 | 0 |
| r60 | ffbfe3cc | 33043377 | 17 | 13 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
(r56 base = 453f6e97, the non-round commit before r56's freeze e4a49432; each tip = the round's own verifier spot-check, the last commit before the next round's freeze.)

Verbatim summaries: `HARM_MATRIX: CLEAN gates=15 … harm=0 harm_absent=0 new_red=0 base=453f6e979ee0 tip=7178bfd3643c`;
`HARM_MATRIX: HARM gates=16 … harm=0 harm_absent=0 new_red=1 base=7178bfd3643c tip=c49f2a8dc1e6`; r58/r59/r60 read `CLEAN gates=16/17/17 …`.
Only flagged row in all five pairs (HARM=0, HARM_ABSENT=0, REPAIRED=0):
`HARM_ROW gate=readme-map base=ABSENT tip=NOT_CLEAN id=NEW_RED base_text="absent:scripts/readme-map.mjs" tip_text="README_MAP: DRIFT files=136 rows=135 covered=135 bad=2 first=uncovered:lessons/round-57-verifier-spotcheck.md [exit=1]"`.

Transitions by id (rows of runs/r56-*.txt … runs/r60-*.txt):
| gate | r56 | r57 | r58 | r59 | r60 |
|---|---|---|---|---|---|
| readme-map | ABSENT_BOTH | NEW_RED | CARRIED_MOVED | CARRIED_MOVED | CARRIED_MOVED |
| proxy-check | CARRIED_MOVED | CARRIED_MOVED | CARRIED_MOVED | CARRIED_MOVED | CARRIED_MOVED |
| kimi-census / omp-census | CARRIED ×5 (host state: same text both sides) |
| source-dupes | NEW_OK | HELD | HELD | HELD | HELD |
| cite-sources-selftest | ABSENT_BOTH | ABSENT_BOTH | ABSENT_BOTH | NEW_OK | HELD |
| claims-check, counter-pins, sources-check, source-capture, anchor-truth, surface-known, wave-census-r40, round-gate/sources-check/counter-pins/wave-census selftests | HELD ×5 |
| report-receipt-diff-selftest, plan-before-ready-selftest, harm-matrix-selftest | ABSENT_BOTH ×5 |

Independent verification: `git archive <rev> | tar -x` for the six boundary revisions, then every registry argv run in the extraction with `env -i PATH HOME LANG=C LC_ALL=C NO_COLOR=1` (runs/direct-archives.txt, 120 gate runs) and compared cell-by-cell with the tool's 200 row-sides: `comparisons=200 deltas=10`, all ten `anchor-truth` (`TRUTH: FAIL-CLOSED (BASE_UNREADABLE e18ff1af…:.ufo/pins/anchor-truth.json)` exit 2). Re-run inside a `git clone --no-hardlinks` at both revs it reads `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 …)` exit 0 = the tool's reading; the archive lacks `.git`, so that gate is unverifiable by the archive method.

Inside-round measurements (same tool; runs/intraround-readme-map.txt, runs/r59-commit-steps-proxy.txt) and direct archive runs of readme-map (runs/direct-readme-map-freezes.txt):
- r57 f0dc6d11 `README_MAP: CLEAN files=135 rows=135 covered=135` EXIT=0 → c49f2a8d DRIFT: `HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM` `HARM_MATRIX: HARM gates=1 … harm=1 … base=f0dc6d1160e6 tip=c49f2a8dc1e6` exit 1.
- r58 50548ae5 `README_MAP: DRIFT files=137 rows=138 covered=138 bad=2 first=orphan-row:lessons/round-58.md` EXIT=1 → 0f66ecd4 DRIFT `first=uncovered:lessons/round-58-verifier-spotcheck.md` = CARRIED_MOVED exit 0.
- r59 c5494332 `CLEAN files=141 rows=141 covered=141` EXIT=0 → ffbfe3cc DRIFT `HARM … harm=1` exit 1.
- r60 58b658de DRIFT `first=uncovered:lessons/round-59-verifier-spotcheck.md` → 33043377 DRIFT `first=uncovered:lessons/round-60-verifier-spotcheck.md` = CARRIED_MOVED exit 0.
- Every round tip 57-60 adds exactly one `corpus/lessons/round-NN-verifier-spotcheck.md` (`git show --stat 33043377`: `1 file changed, 210 insertions(+)`); the README row for round-57's lands only in the r58 freeze (`git log -S'round-57-verifier-spotcheck' -- corpus/README.md` → `50548ae`).

Detection control (mutant commit in a /tmp clone, runs/control-mutant-source-dupes.txt): forcing `scripts/source-dupes.mjs` red at the r60 tip gives `HARM_ROW gate=source-dupes … id=HARM`, `HARM_ROW gate=counter-pins base=CLEAN tip=NOT_CLEAN id=HARM … first=source-dupes:hash-mismatch`, `HARM_MATRIX: HARM gates=17 … harm=2 … base=330433777256 tip=3b7031818795` exit 1 — the CLEAN census is not vacuous.

Proposed strengthening, built and verified in scratch only (build/K65ExecHistoryA/fix-new-finding-and-note-lines.patch): `HARM_MATRIX_SELFTEST: PASS (26/26)` exit 0; full r58 pair diff vs the committed tool is exactly one line (readme-map `CARRIED_MOVED`→`HARM`); with it, boundary pairs r57/r58/r59/r60 all exit 1 (`patched2-nine-pairs.txt`).

## Findings

**K65ExecHistoryA-1 (high, method — the admission rule can pass a round that adds a new finding).** A gate already not-clean at base can gain a new named defect and the tool still reads `CARRIED_MOVED` (not counted; `harm=0`, exit 0). Measured: r58 tip adds `uncovered:lessons/round-58-verifier-spotcheck.md` (r58 pair exit 0), r60 tip likewise (exit 0), and r59's wave-evidence commit `6122868` adds `A_DRIFT term=A declared=96 computed=102 delta=+6` to proxy-check (r59 pair exit 0). Reproduce: `node scripts/harm-matrix.mjs --lane . --base 50548ae5 --tip 0f66ecd4 --only readme-map` → `EXIT=0`; `git archive 6122868 | tar -x -C /tmp/x && (cd /tmp/x && node scripts/proxy-check.mjs --strict)` → `PROXY  error  A_DRIFT  A: declared=96 computed=102 delta=+6` while `git archive 5469c0a5` gives no `A_DRIFT`. Fix proposal (patch, unintegrated): optional `items` regexes per gate + "a tip item absent at base is HARM"; verified on the r58/r59/r60 pairs and the 26-case selftest. Caveat measured: it over-fires where a gate orders its findings — r58-intra proxy-check flips to HARM on `AXES_DRIFT` (`coverage: ## Axes row=10 derived=9`) although that defect is older than the pair and simply unnamed by the base run, so the rule needs either item ranking or a per-gate "independent items" flag before integration.

**K65ExecHistoryA-2 (high, history).** The lane's admission rule was violated at the close of rounds 57, 58, 59 and 60: each round's verifier spot-check commit lands a lesson file with no `corpus/README.md` row and no `readme-map.json` pin, so readme-map is red at every tip (`files-rows = 1`, `bad=2` = `uncovered:`+`unpinned:` of the same file). Round 57 also *introduced* the gate already red (`NEW_RED`). The repair always lands in the next round's freeze (50548ae added round-57's row and simultaneously pinned a not-yet-committed `lessons/round-58.md`, which made the r58 freeze read `files=137 rows=138 … orphan-row:lessons/round-58.md`, `git cat-file -e 50548ae5:corpus/lessons/round-58.md` → `fatal: … not in '50548ae5'`). This is the `reference-drift` recurrence the round plan names, and it reproduces at the r64 tip too (`base/readme-map-before.txt`: `DRIFT files=157 rows=156 … uncovered:lessons/round-64-verifier-spotcheck.md`). Reproduce: `node scripts/harm-matrix.mjs --lane . --base c5494332 --tip ffbfe3cc --only readme-map` → `harm=1` exit 1.

**K65ExecHistoryA-3 (high, history — proxy-check moved inside rounds, invisibly).** Direct full-archive runs (runs/proxy-direct-freezes.txt): r57 freeze 2 findings (`K_MEMBERS`,`K_SECTIONS`), r58 freeze 6 (`A_DRIFT +3`, `C2_DRIFT +3`, `C2_TOTAL_DRIFT +2`, `K_MEMBERS`, `K_SECTIONS`, `GATE_PIN_DRIFT pin.readme-map`), r59 freeze back to 2, r60 freeze 5 (`A_DRIFT +8`, `C2_TOTAL +1`, `K_MEMBERS`, `K_SECTIONS`, `AXES_DRIFT`). So the r58 freeze commit itself moved proxy-check from 4 to 6 findings (including the pin of the readme-map gate it had just added) and only the r59 freeze repaired it; the tool reads that pair `CARRIED_MOVED` (`EXIT=0`). Reproduce: `node scripts/harm-matrix.mjs --lane . --base c49f2a8d --tip 50548ae5 --only proxy-check`.

**K65ExecHistoryA-4 (medium, tool defect — a trailing diagnostic line is read as the verdict).** `measure()` keeps the *last* line matching `verdict` over stdout+stderr, so any trailing `<PREFIX>: note …` flips the reading. Fixture (single revision measured against itself): gate prints `SELF: CLEAN rows=1` then `SELF: note …`, exits 0; direct run `EXIT=0` with summary `CLEAN`, tool reads `HARM_ROW gate=self base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED … [exit=0]` and still prints `HARM_MATRIX: CLEAN … carried=1`. This is live-shaped: readme-map emits `README_MAP: note unpinned:…` lines (safe today only because readme-map prints them *before* its summary, `scripts/readme-map.mjs:207-208`). Fix proposal (patch, verified on the fixture and on 9 pairs): optional per-gate `skip` regex; with `"skip": "^README_MAP: note "` the same fixture reads `HELD`, exit 0. Reproduce: build a two-line stub gate in a `mktemp -d` repo and run `node scripts/harm-matrix.mjs --lane "$D" --base "$REV" --tip "$REV" --gates "$D/gates.json"`.

**K65ExecHistoryA-5 (medium, coverage).** Five cheap gate-like checks are absent from the registry and were clean at all six boundary revisions (runs/nonregistry-selftests.txt): `dispatch-evidence --selftest` (VERDICT: PASS, <1 s; NEW at r60), `receipt-evidence --selftest` (PASS, 4 s; NEW at r58), `receipt-attest --selftest` (`ATTEST_SELFTEST: PASS (51/51)`, 6 s), `counter-rerun --selftest` (`COUNTER_RERUN_SELFTEST: PASS`, 3 s), `bind-oracle --selftest` (`VERDICT: PASS`, 1 s). Adding them widens coverage without relaxing anything; ready-to-merge rows in build/K65ExecHistoryA/proposed-registry-rows.json. No harm hides behind them in 56-60 (all passed at every measured rev), so this is coverage, not a census correction.

**K65ExecHistoryA-6 (low, tool).** `measure()` truncates row text to 200 chars, so proxy-check rows hide `AXES_DRIFT`/`K_SECTIONS` terminals (`tip_text="PROXY: DRIFT (A_DRIFT … K_SECT [exit=1]"`); classification is unaffected (truncation can only affect the CARRIED/CARRIED_MOVED label, never HARM/NEW_RED), but a reader cannot tell 2 drift terms from 5 from the row.

## Artifacts
- `.ufo/waves/round-65/build/K65ExecHistoryA/runs/` — r56..r60 pair outputs + `.err` (empty), `direct-archives.txt` (120 direct gate runs, 6 archives), `direct-readme-map-freezes.txt`, `proxy-direct-freezes.txt`, `intraround-readme-map.txt`, `r59-commit-steps-proxy.txt`, `control-mutant-source-dupes.txt`, `nonregistry-selftests.txt`, `selftest-verdict-lines.txt`, `patched-selftest.txt`, `patched2-selftest.txt`, `patched-full-r58.txt`, `patched-readme-map-pairs.txt`, `patched-proxy-items-pairs.txt`, `patched2-nine-pairs.txt`, `patched2-check-r58-intra.txt`.
- `build/K65ExecHistoryA/fix-new-finding-and-note-lines.patch` (unified diff vs `scripts/harm-matrix.mjs`, held-out copy only), `proposed-registry-rows.json`, `direct-driver.mjs`, `verify-gate.sh`.

## Limits
- Boundary pairs cannot see intra-round repair: r59's freeze repaired `C2_TOTAL_DRIFT`+`AXES_DRIFT` and its wave-evidence commit re-broke them; I sampled freeze→tip, the four freeze revs, the r59 commit steps and the r58→r59 seam — not every commit in 56-60 (r61-65 belong to K65ExecHistoryB).
- `anchor-truth` cannot be verified in an archive (needs `.git`); verified in a clone instead. Gates that read host state (kimi-census, omp-census) are not revision-attributable and their text is identical on both sides.
- Census is bounded by the registry: `cite-check`, `gate-mutants`, `cap-run`, `surface-probe --checklists`, `cite-sources` main, `receipt-evidence` main, `inline-dispatch-evidence` are outside it; harms there are invisible to all five pairs.
- `proxy-check`'s `A` term needs the whole tree (partial extraction reads `computed=22`, full tree `computed=102`); my per-commit proxy numbers come from full-tree sandboxes only.
- The strengthening patch is a draft for the L1: verified against the 26-case selftest and nine pairs, with the r58-intra over-fire documented above; it is not integrated and no frozen counter/control was touched.
- Tooling installed: none.
