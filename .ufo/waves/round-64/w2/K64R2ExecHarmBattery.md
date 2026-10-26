VERDICT: No lane gate moved clean→not-clean between base 6825a514 and the integrated tree 2ed8a5f8; the two expected movements are real (readme-map DRIFT→CLEAN, the round-scoped wave-census/plan-before-ready arms), and the only new defect class is self-inflicted weight — 249 wave-1 runnable scratch copies committed under `.ufo/waves/round-64/build/` that double `proxy-check`'s `A` term (257→514).

## Evidence

Trees: `git archive <rev> | tar -x -C build/K64R2ExecHarmBattery/{base,int}` (no `.git`); for gates needing history, `git clone --no-hardlinks <lane> /tmp/kumitate-r64/K64R2ExecHarmBattery/clone-{base,int}` checked out at each rev (verified: `git -C clone-base rev-parse HEAD` = `6825a51425e91908f019ed65aa2f4209acbd7087`, `clone-int` = `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`). Full matrix with every argv/verdict/exit: `build/K64R2ExecHarmBattery/gate-matrix.md`; verbatim transcripts `build/K64R2ExecHarmBattery/transcripts/**` (121 files, each with `### cmd=`, `### cwd=`, `### exit=`).

Headline verdict lines (base → int):
- `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1 → `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0 — the plan's expected repair.
- `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage … declared=10 computed=9)` exit 1 → `PROXY: DRIFT (A_DRIFT term=A declared=257 computed=514 delta=+257; C2_DRIFT declared=153 computed=156 delta=+3; C2_TOTAL_DRIFT delta=+3; GATE_PIN_DRIFT term=pin.plan-before-ready; PIN_UNPINNED term=scripts/report-receipt-diff.mjs)` exit 1.
- `TRUTH: DRIFT (138 findings: REVIEW_UNBOUND src-rev=31c465f15669)` exit 1 → byte-identical 138 at int (the four registered notes and the pin are unchanged; `--base 6825a514` in clone-int reads `TRUTH: CLEAN (anchors=811 true=778 debt=20 unchecked=13)` exit 0).
- `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4)` exit 0 both; `--strict` `DRIFT` exit 1 both with the same 4 `SECTION_FILE_NOT_MEMBER` (S2, R9×3).
- `SOURCES_CHECK: CLEAN (rows=136 … mined:104 entries_with_source=20)` → `CLEAN (rows=139 … mined:107 entries_with_source=21)` exit 0 both; `--strict` `DRIFT (USED_BY_ASYMMETRY)` exit 1 both, same two rows (S028, S124).
- `CITE_SOURCES: CLEAN cited=190` → `CLEAN cited=193` exit 0; `SOURCE_CAPTURE: CLEAN captures=29 exemptions=107` → `captures=32`; `SOURCE_DUPES: CLEAN groups=6 known=6` both; `COUNTER_PINS: CLEAN pins=21` → `pins=25`.
- `SURFACE_PROBE: DRIFT (errors=1 warnings=1)` exit 1 both; `--known .ufo/pins/surface-known.json` `CLEAN (checks=12 errors=0 warnings=1 known=1)` exit 0 both.
- `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; cache/; search-index/; updates/)` exit 1 both; `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=38 findings=10)` exit 1 both (host state, unchanged).
- `ROUND_GATE: DRIFT (round=63 lane=kumitate checks=10 errors=2 warnings=1)` exit 1 both (with `--main-repo /home/vgpnk/Projects/shokunin --reports-dir …/.ufo/reports`); default in an extracted tree is `FAIL-CLOSED (REPORTS_DIR_MISSING)` exit 2 both.
- `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` exit 0 at int (`w1 seats=41 attack=8 reports=41/41`); base is `fail-closed — round dir …/round-64 is missing` exit 2. `--round 63` CLEAN both.
- `PLAN_BEFORE_READY: PASS rev=2ed8a5f8… round=64 … map=SKIP reason=MAP_PRE_EPOCH_ROUND` exit 0 at int; base with `--repo <tree>` is `NA … reason=NO_PLAN_NO_MARKER` exit 2. `--rounds 60-64`: `pass=3 fail=1 na=1 … failed=62` exit 1 both.
- `INLINE_DISPATCH: CLEAN (seats=41 sessions=41 done=41 reports=41 dead=0)` exit 0 (int, w1). `DISPATCH_EVIDENCE: FAIL-CLOSED` exit 2 both (`WAVE_DIR_ABSENT` base, `PROGRESS_ABSENT` int).
- `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=2ed8a5f8… leftovers=0)` exit 0, **52 s wall** (under the 5-minute bound).
- 24 selftests at base / 25 at int: all `VERDICT: PASS`. Int adds `REPORT_RECEIPT_SELFTEST: PASS (52/52)`; `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` → `PASS (18/18)`.
- Fleet census `bash scripts/sources-census.sh validate --file <tree>/corpus/SOURCES.md`: `file ok …` exit 0 both, six W04 duplicate-URL warnings both.
- Frozen counters: `RECEIPT64_UNMET held=0/5` → `held=4/5 … P5 MISS report-not-given` (exit 1 both); `JJ64_UNMET held=0/8` → `JJ64_HELD held=8/8` exit 0. Both match the wave-2 facts.
- `bash scripts/jj-seat-demo.sh` in the int archive: 21 `JJ_SEAT:` keys + `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, exit 0 (absent at base).

## Findings

**K64R2ExecHarmBattery-1 — medium — the integrated tree doubles the proxy's `A` term with committed scratch copies.**
Attacks: `proxy-check` A term / the wave-1 landing `d92cf1f`. Runnable-file count (`\.(mjs|js|sh|py)$`, `proxy-check.mjs:505,945`) is 257 at base and **514** at int; `comm` of the two file lists says `added=257 removed=0`, of which **249** sit under `.ufo/waves/round-64/build/` (top: `K64ExecReceiptMutants` 108, `K64MutateProbes` 82, `K64ExecJjHonestFixture` 10, `K64ExecSelftestTranscripts` 5, `K64CriticC2Predicate` 5), 4 are the frozen round-64 probes/controls, 2 are `build-tools`, and only 2 are legitimate new claim subjects (`scripts/report-receipt-diff.mjs`, `scripts/jj-seat-demo.sh`). Refreshing `A` to 514 would bless the 249 scratch copies as permanent; deleting them leaves `A=265`.
Reproduce: `git archive 2ed8a5f8 | tar -x -C /tmp/x && find /tmp/x -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l` → 514; `cd /tmp/x && node scripts/proxy-check.mjs --strict | grep A_DRIFT`.
Transcripts: `transcripts/int/proxy-check-strict.txt`, `transcripts/base/proxy-check-strict.txt`.

**K64R2ExecHarmBattery-2 — medium — `plan-before-ready.sh` judges the LANE from any cwd (hardcoded `REPO_DEFAULT`).**
Attacks: the gate's calibration. `scripts/plan-before-ready.sh:60` is `REPO_DEFAULT=/home/vgpnk/Projects/shokunin/kumitate-shokunin`, so a seat that runs the gate inside an extracted archive or a clone gets a verdict about the lane's HEAD, not the tree: in `clone-base` (HEAD `6825a514`) `bash scripts/plan-before-ready.sh --round 64` printed `PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 …` exit 0. Any wave-2 falsifier reading that line would score the wrong revision. (The base-tree `--repo` arm is honest: `NA … NO_PLAN_NO_MARKER` exit 2.)
Reproduce: `git -C /tmp/kumitate-r64/K64R2ExecHarmBattery/clone-base rev-parse HEAD` → `6825a514…`; `cd /tmp/kumitate-r64/K64R2ExecHarmBattery/clone-base && bash scripts/plan-before-ready.sh --round 64` → `rev=2ed8a5f8…`.
Fix draft (tested in scratch: base clone then reads `NA rev=6825a514… round=64 reason=NO_PLAN_NO_MARKER` exit 2, and `--selftest` still `PASS (18/18)`): `build/K64R2ExecHarmBattery/patches/plan-before-ready-repo-default.patch` — `REPO_DEFAULT="${PLAN_BEFORE_READY_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)}"` (script-relative, env-overridable; from the lane it resolves to the same path as today).
Transcripts: `transcripts/clone-base/plan-before-ready-r64.txt`, `transcripts/clone-int/plan-before-ready-r64.txt`.

**K64R2ExecHarmBattery-3 — low — `scripts/jj-seat-demo.sh` (C2's demo) is pinned nowhere.**
Attacks: C2's byte-integrity. `proxy-check`'s `PIN_UNPINNED` only covers `scripts/*.mjs` (`proxy-check.mjs:204`), the `kumitate-proxy-v1` stanza has no `pin.jj-seat-demo`, and `.ufo/pins/counter-pins.json` pins the round-64 *probes* but not the demo. The demo can change with no gate noticing; J6 re-runs whatever bytes the archive holds.
Reproduce: `grep -rl jj-seat-demo SCORECARD.md .ufo/pins/` → no output; `sha256sum scripts/jj-seat-demo.sh` → `2d2edd43559c52912e674d89cf5d05c3988cbd1618bb98b82561691ca53182c3`; `node scripts/proxy-check.mjs --strict | grep PIN_UNPINNED` names only `report-receipt-diff.mjs`.
Fix (strengthening): add `pin.jj-seat-demo=2d2edd43…` to the stanza and either extend `PIN_UNPINNED` to `scripts/*.sh` or add the demo to `counter-pins.json`.

**K64R2ExecHarmBattery-4 — low — SKILL.md's registry row is stale against the integrated tree.**
`SKILL.md` (gate registry, plan-before-ready row) still says "`--selftest` (10 cases … `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)`)" while int prints `PASS (18/18)` (8 map-arm cases added). L1-owned file; no seat may patch it.
Reproduce: `cd <int tree> && bash scripts/plan-before-ready.sh --selftest | tail -1`; `grep -n "PASS (10/10)" SKILL.md`.
Transcripts: `transcripts/base/selftest-plan-before-ready.txt`, `transcripts/int/selftest-plan-before-ready.txt`.

**K64R2ExecHarmBattery-5 — low — cite-check drift grows by 47 errors from the round's two new documents.**
`CITE_CHECK: DRIFT … errors=1174` → `errors=1221` with the real fleet root (`--self <tree> --fleet /home/vgpnk/Projects/shokunin`; the default run adds 105 `FLEET_MISSING` artifacts because the extracted tree's parent is not the fleet: 1453→1501). Delta = +46 `UNRESOLVED` +1 `REV_UNKNOWN`; 37 land on the two new files. The gate was already DRIFT at base, so nothing flipped clean→dirty, but the new entry's own table cites a bare basename (`corpus/knowledge/jj-workspace-seat-containment.md:76` → `measurements-abandon-matrix.txt`) that the gate cannot resolve, though the full path is given at line 35 and the file is committed at `.ufo/waves/round-64/build/K64ExecJjDemoHarden/measurements-abandon-matrix.txt`. Not a false claim — an unresolvable citation.
Reproduce: `node scripts/cite-check.mjs --self <int> --fleet /home/vgpnk/Projects/shokunin | grep -c 'ERROR UNRESOLVED'` (890 vs 844 at base).

**K64R2ExecHarmBattery-6 — info — the landed w1 is invisible to `dispatch-evidence` by design.**
At int `DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent … /w1/launcher-progress.tsv` exit 2 (`PROGRESS_ABSENT`), because the wave was inline-dispatched; `inline-dispatch-evidence` fills the slot (`INLINE_DISPATCH: CLEAN (seats=41 sessions=41 done=41 reports=41 dead=0)` exit 0). Any checklist item that runs `dispatch-evidence --round 64 --wave w1` will read FAIL-CLOSED; that is the round-63 pairing, not a regression.
Reproduce: `node scripts/dispatch-evidence.mjs --root <int> --round 64 --wave w1`; `node scripts/inline-dispatch-evidence.mjs --root . --round 64 --wave w1 --rev 2ed8a5f8`.

## Artifacts

- `build/K64R2ExecHarmBattery/gate-matrix.md` — gate × (base verdict+exit, int verdict+exit, changed?).
- `build/K64R2ExecHarmBattery/transcripts/{base,int,clone-base,clone-int,probes}/` + `transcripts/gate-mutants-int.txt` — 121 verbatim transcripts (argv, cwd, clocks, exit).
- `build/K64R2ExecHarmBattery/patches/plan-before-ready-repo-default.patch` — fix draft for finding -2 (tested only in `/tmp` scratch).
- `.ufo/waves/round-64/w2/K64R2ExecHarmBattery.md` — this report.
- No tool installed or upgraded this seat (nothing needed; no pacman/uv/npx run).

## Limits

- `surface-probe.mjs --checklists` did not finish inside 240 s in the int archive (killed; it runs live origin verbs and the 26-item list). Its items were run individually instead; the aggregate runner is unmeasured.
- The extracted trees have no `.git`, so `round-gate`'s default and any history-reading arm were run in `/tmp` clones with explicit `--repo`/`--main-repo`; three gates (`plan-before-ready`, `round-gate`, `surface-probe`) have cwd/script-relative roots, and only `plan-before-ready` was found to escape to the lane.
- `receipt-evidence.mjs verify --receipts .ufo/waves/round-64/base` reads `UNMET reason=LEDGER detail=census-before.txt` exit 1: those files are plain receipts, not `receipt-attest` ledgers — my misuse, recorded so it is not read as a defect.
- Not attempted (other seats own them): the C1/C2 control corpora, the tool/entry/demo forgeries, real-data P3/P5 arms, the receipts' attestation, the C2 quote/live-fetch arms, and any judgment on whether the round's claims *hold* — this seat measured only that the gates did not degrade.
- `kimi-census`/`omp-census` read host state that this seat cannot attribute; their DRIFT is identical at both revisions and is not evidence about the tree.
