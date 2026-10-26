VERDICT: Counts, receipts, lane hashes, predicate/code pairs and the terminal-9 + nudge reasoning all check, but C1's H5
is measured at the round tip, so one C2 landing defect (a SOURCES row reusing the S060/S068 release URL) reddens C1 while
C2 still passes, and C2's O7 cannot pass unless two artifacts the plan never names (a README coverage row and a
`readme-map` `covered` pin) land. Repairs are patch text in `build/K65CriticPlan/`, never a rewrite of the freeze.

## Evidence

E1 counts (all verified by command): controls 16 dirs, ids 9 (`ABSENT_BOTH,CARRIED,CARRIED_MOVED,HARM,HARM_ABSENT,HELD,
NEW_OK,NEW_RED,REPAIRED`), exit-0 cases 9; registry `gates[]` = 20 (last three: plan-before-ready-selftest,
wave-census-selftest, harm-matrix-selftest); `base/omp-binary-probe-freeze.txt` = 15 keys (`real_version=18.12.6`,
`lit_2026_07_28=0`); SOURCES header is 11 columns and the counter's `c.length!==13` + field map (source=c2, tier=c4,
status=c8, opened=c9, used-by=c11) matches it; registry max id S200 -> "continue at S201" is right.
E2 receipts — every one the plan cites exists and reads what it says: `readme-map-before` DRIFT files=157 rows=156;
`proxy-before` C2_TOTAL_DRIFT + AXES_DRIFT EXIT=1; `report-receipt-diff-selftest-freeze` `PASS (125/125)`;
`plan-before-ready-selftest-freeze:41` `PASS (38/38)`; `harm65-base` held=0/5 EXIT=1; `omp65-base` held=0/8 EXIT=1;
`omp65-donothing` held=1/8 EXIT=0 (only O8); `omp-release-tag` `45c35e40…\trefs/tags/v18.12.6`; `census-before`
EXIT=0 with exactly 6 W04 lines; `harm-pairA/B-freeze` rows equal the plan's two pair claims.
E3 hashes: `git cat-file -t` -> commit for 47fe2383, a004902d, 6825a514, 2ca91a0c; `45c35e40…` -> `fatal: git cat-file:
could not get object info` (no local oh-my-pi clone).
E4 base unmoved commands: entry absent at 47fe2383 (`git cat-file -e` rc=128); `git show 47fe2383:PROVINCE.md | grep -c
omp-installed-release-mcp-runtime` -> 0; `git ls-tree 47fe2383 scripts/ | grep harm-matrix` -> empty.
E5 proxy at the freeze commit (archive of 2ca91a0c, /tmp copy, `node scripts/proxy-check.mjs --strict`):
`PROXY error A_DRIFT A: declared=351 computed=357 delta=+6` / `C2_DRIFT` / `C2_TOTAL_DRIFT` /
`PIN_UNPINNED scripts/harm-matrix.mjs`; base reads only C2_TOTAL_DRIFT + AXES_DRIFT (AXES_DRIFT is gone at freeze).
E6 O7's missing artifacts (entry written into a freeze-archive copy, nothing else changed):
`README_MAP: note unpinned:knowledge/omp-installed-release-mcp-runtime.md` /
`README_MAP: DRIFT files=158 rows=157 covered=157 bad=2 first=uncovered:knowledge/…` / `README_MAP_EXIT=1`.
E7 the C1<->C2 coupling (new 11-cell S201 row reusing S068's normalized URL inside `## Registry`, entry present):
`SOURCE_DUPES: note new-duplicate:github.com/can1357/oh-my-pi/tree/45c35e40… ids=S060,S068,S201` /
`SOURCE_DUPES: DRIFT groups=6 known=6 bad=2 first=known-mismatch:… (EXIT=1)`; the same registry passes
`sources-census.sh validate --file …` (CENSUS_EXIT=0, W04 warning only, O7's first arm green).
E8 controls manifest: `grep -rn 'MANIFEST.sha256' scripts/ .ufo/waves/round-65/probe/` -> nothing;
`grep -c MANIFEST scripts/harm-matrix-gates.json` -> 0. It would catch an edit (copy of controls/, case-03
`expect.rows=[]` -> `case-03-harm-verdict/spec.json: FAILED`, exit 1) but nothing invokes it.
E9 code anchors: `harm65-probe.mjs:93` controls<14, `:104` ids<8, `:105` exit0<2, `:183` gates>=14;
`omp65-probe.mjs:197` stated<12, `:205/:206` set equality, `:222` `named` regex `/frontier|band|ground|first entry|
advanced/i`; `harm-matrix.mjs:202` registry = `join(HERE,'harm-matrix-gates.json')` (the archive's).
E10 correct readings: `floor(10(A+C)/(A+C+3)) < 10` for finite A+C (operability terminal 9, SCORECARD says so);
SCORECARD §Saturation line 9, N=3, last capability row round 64 -> nudge not active, operability the lowest live axis;
sandbox clone `--no-hardlinks` with fixture commits under `-c user.name=…` after a toplevel check.

## Findings

K65CriticPlan-1 (HIGH) — C1 is not causally separable from C2. H5 is measured at M, which contains C2's landing;
`source-dupes` is CLEAN at base and in the registry, so any C2 row reusing S060/S068's release URL under a new scope
turns it DRIFT (E7) -> HARM row -> H5 MISS -> C1 fails, while every O1–O8 arm still passes (O7 runs neither source-dupes
nor source-capture). The natural URL for rows "at the tag" is exactly that pinned URL. Repro: E7. Repair: P3 + P7.

K65CriticPlan-2 (HIGH) — H2's oracle is the controls' own `expect`, and nothing checks the case bytes: the manifest is
pinned in `counter-pins.json` but unreferenced (E8), so tuning a `spec.json` `expect` leaves H2 green against a weaker
oracle — the masked verdict the ratchet exists to catch. Repro: E8. Repair: P1.

K65CriticPlan-3 (MEDIUM) — H2's floor is 14 while 16 controls exist (`:93`); deleting case-04 and case-05 (both expect
`g1 HARM`, exit 1, ids already covered by case-03) leaves 14 cases, 9 ids, 7 exit-0 cases -> H2 still passes, so "16 at
freeze" is not enforced. Repair: P1 makes deletions red.

K65CriticPlan-4 (HIGH, landing) — C2's O7 (`plan.md:84`) requires `README_MAP: CLEAN`, but C2's surface (`plan.md:60-69`)
never names the two artifacts that produce it: a `corpus/README.md` coverage row and a `.ufo/pins/readme-map.json`
`covered` append (readme-map v2 covers only `corpus/knowledge|lessons/*.md`). E6 = O7 MISS. Repro: E6. Repair: P2.

K65CriticPlan-5 (MEDIUM) — Ratchet vs pin (`plan.md:46`): adding a control needs a regenerated `MANIFEST.sha256`, whose
bytes are pinned in `counter-pins.json`; regenerating without re-pinning flips `counter-pins` CLEAN->DRIFT at M -> HARM ->
H5 fails, while a stale manifest leaves the new control unchecked. Repair: P1's ratchet rule (regenerate + re-pin).

K65CriticPlan-6 (MEDIUM) — The maintenance sentence (`plan.md:16`) names only `C2_TOTAL_DRIFT`, but the freeze commit
itself produces `A_DRIFT declared=351 computed=357 delta=+6`, `C2_DRIFT` and `PIN_UNPINNED` (E5); a refresh fixing only C2
leaves `--strict` red. "No score integer can move" (`plan.md:12`) is true only for the integer — the proxy's A term moved
+6. Repro: E5. Repair: P4.

K65CriticPlan-7 (MEDIUM) — O6's key set is not pinned: `scripts/omp-binary-probe.sh` is absent from `counter-pins.json`
(freeze sha 8774640580b56fcb454281d68465a687a779cebb0b8410cd418d5e4cb03117e3), and O6 enforces only `stated>=12` plus
equality with whatever that script prints now — so it can be shrunk to 12 easy keys and the entry adjusted. Repair: P5.

K65CriticPlan-8 (MEDIUM) — Contradictory installed version: `omp-task-contract.md:205` and S004 (opened 2026-10-19) say
`omp/18.12.3`; the probe measures 18.12.6, and O8 (`plan.md:86`) only requires the amendment to name the entry and
"Version skew", so the contradiction is not caught. Repro: `grep -n 18.12.3 corpus/knowledge/omp-task-contract.md` +
`grep real_version base/omp-binary-probe-freeze.txt`. Repair: P6.

K65CriticPlan-9 (LOW) — `45c35e40…` is not a lane object and no local clone holds it (E3); existence is attested only by
`base/omp-release-tag.txt` (ls-remote) and S068's URL. Label it external; the closure verifies with `git ls-remote`.

K65CriticPlan-10 (LOW) — O7's frontier arm (`:222`) accepts any line with the path plus `frontier|band|ground|first
entry|advanced`, and `PROVINCE.md:19` already contains "first entry" and "installed", so a non-frontier edit could pass.
The closure must read the line; add it to C2's stated limit.

K65CriticPlan-11 (LOW) — O6 (`plan.md:81`) says ">= 12 … set equal"; with a 15-key probe the equality makes 12 dead and
all 15 mandatory (`:205` fails on missing keys). Say "all live keys (15 at freeze)" or a 12-key entry reads as compliant.

K65CriticPlan-12 (LOW) — "the first entry that measures the installed release" (`plan.md:60`) is unmeasured priority:
S068 (2026-10-23) and `omp-agent-root.md`/`agent-isolation-substrates.md` already carry 18.12.6. Tie it to a command or
drop "first"; the observable novelty is the re-runnable probe.

K65CriticPlan-13 (LOW) — M is undefined (`plan.md:29`, `:72`); both counters echo the rev passed. Round 64 uses the same
convention, so the report's "measured commit" is the only pin. State "M = lane tip after the close commit".

K65CriticPlan-14 (LOW, calibration) — C1 is already at target at the freeze: `base/harm65-at-freeze.txt` = `HARM65_HELD
held=5/5 rev=2ca91a0c…`. Waves can only falsify/ratchet. Cite that receipt as H4's control receipt (the plan cites only
the 0/5 base) and say "held at freeze, re-verified at M".

K65CriticPlan-15 (LOW) — "measured at revision M over `git archive M`" (`plan.md:29`, `:72`) is imprecise: H3/H5 run the
archive's tool with `--lane <lane>` (sandbox clones of the lane history) and H3's direct runs archive old revisions.

K65CriticPlan-16 (LOW) — The "assimilation theme 'OMP MCP protocol version and the installed host'" (`plan.md:105`) is
not a package artifact: `MERGE-REPORT.json` keys are lane/accepted/refused/entries/existing_rows/renumbered/first_id
(accepted=155, refused=[], first_id=S195) and no theme is named; the four staged files it lists do exist.

## Artifacts
- `.ufo/waves/round-65/build/K65CriticPlan/proposed-repairs.md` — P1–P7: the `harm-controls-manifest` registry gate,
  C2's README row + covered pin, the source-dupes choice, the four-code proxy refresh, the probe pin, the version
  sentence, the H5/M disclosure.
- `/tmp/kumitate-r65/K65CriticPlan/{census.out,census2.out}` — scratch census runs for E7.

## Limits
- Did not re-run the heavy counters; their committed receipts were read and their code audited line by line (host load
  ~50). H5's full-registry run was not reproduced. O5 (live fetch) and O6 (host probe) were not exercised.
- E5–E7 ran on /tmp archive copies of 2ca91a0c, never the lane; no lane bytes, git index or jj state touched; the 392 MB
  archive copy was deleted. No tool installs were needed.
