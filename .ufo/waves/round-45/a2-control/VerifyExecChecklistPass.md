RESULT VerifyExecChecklistPass rev=a2e5b54c verdict=mixed confirmed=17 refuted=0 unverified=1 new=2
RE-DERIVED R44-4 owed check (inherited: .ufo/waves/round-45/build/R45ExecChecklistPass.md, measured at cfa99304, untrusted). All re-checks at tip a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f in scratch clone /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifyExecChecklistPass/lane. SKILL.md and scripts/omp-census.mjs, surface-probe.mjs, proxy-check.mjs, cite-check.mjs are byte-identical to attempt 1 (same sha256: SKILL.md 2ae01fad…, surface-probe 1361075d…, proxy-check da3de1fb…, cite-check 115bfde4…; omp-census fd4d1c4e… = item-mandated value), so the measured line references still hold at tip.
Every node run used the host-safety wrapper `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900`; no leftover processes (pgrep clean). No tool installed. Scratch only under my seat dir.

Findings (each re-verified independently; ul = unverified by lane constraint):
- [confirm] verdict=FAIL pass=17/19. Re-ran all 21 checklist items at tip: item exits 1..21 = 1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,skip,skip,0,0. With the pointed env (KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin KUMITATE_REPORTS_DIR=/home/vgpnk/Projects/shokunin/.ufo/reports), 17 items exit 0, items 1 and 8 exit 1, items 18-19 (gate-mutants pair, SKILL.md:695-696) excluded -> 17/19.
- [confirm] Receipt body is 21 lines, one per SKILL.md checklist item (lines 678-698), 695/696 are the gate-mutants pair (`exit=skipped-heavy`).
- [confirm] surface-probe --checklists: `CHECKLIST: 18/19 pass`, `VERDICT: FAIL`, exit 1; PASS at SKILL.md:678 (exit=1 allowed 0|1, substring hit), FAIL at SKILL.md:685 (proxy recompute, substring miss); the only grammar-allowed exit-1 item is 678, so 18/19 vs 17/19 differ by exactly that line. (Probe variant: items 18-19 marked checked; item 20's command pointed at a fixture root I built in scratch, since a bare run reads live ~/.omp/agent - see NEW2.)
- [confirm] proxy-check --strict: `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=99 computed=100 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)` exit 1. Note: the inherited report quotes `derived=9` in this verdict line; the tool's summary line prints `computed=9` (the per-check detail line prints `derived=9`) - see NEW1.
- [confirm] Missing README row: corpus/README.md carries 99 `| `knowledge|lessons/…`` rows; corpus/ holds 100 notes; the only missing row is `lessons/round-44-verifier-spotcheck.md` (enumerated every note: missing=1).
- [confirm] coverage = floor(10 * 19/19 * 99/100) = 9 (proxy-check.mjs:751); matches AXES_DRIFT derived=9.
- [confirm] The round-open receipt .ufo/waves/round-45/open/proxy-strict-3632602c.txt has byte-identical findings to my run (same two lines + exit=1).
- [confirm] cite-check (pristine clone): `CITE_CHECK: DRIFT (files=104 tokens=9784 errors=826 warnings=611)` exit 1; class split 826 = 429 UNRESOLVED + 246 LINE_OOR + 100 FLEET_MISSING + 31 PIN_MISMATCH + 20 REV_UNKNOWN (byKind totals, exact).
- [confirm] FLEET_MISSING=100 cause: `--fleet` defaults to the clone's parent (/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifyExecChecklistPass), no fleet tree there.
- [confirm] `--fleet /home/vgpnk/Projects/shokunin`: `CITE_CHECK: DRIFT (files=104 tokens=9791 errors=636 warnings=530)` exit 1, 0 FLEET_MISSING.
- [confirm] All 636 errors sit in lane docs: SKILL.md 11, corpus/** 625; largest concentrations queue-summary.md 76, reconcile-and-cycle.md 46, round-40-verifier-spotcheck.md 35, round-44-verifier-spotcheck.md 33 (parsed per-file from output).
- [confirm] Round-43 claim: .ufo/waves/round-43/build/ExecCiteBefore.md lists the same gate at exit 1 with errors=553 (dfabe92), 722 (c9a084bf), 731 (e5ffcbe7) - range 553…731 across its three clones confirmed.
- [confirm] Items 6-7 env behavior: without KUMITATE_* both exit 2 `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)`; with pointed env `ROUND_GATE: CLEAN (round=44 lane=kumitate checks=10 errors=0 warnings=1)` and `CLEAN (mode=tracked checked=27 errors=0 warnings=0)` exit 0.
- [confirm] Without KUMITATE_* the same tree yields 15/19 (items 6-7 additionally fail closed: 17-2).
- [confirm] All selftests exit 0 with VERDICT: PASS: cite-check 75/75, surface-probe 45/45, round-gate 60/60, proxy-check 121/121, sources-check 46/46, anchor-truth 44/44, wave-census 32/32, omp-census 29 cases.
- [ul] `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=38 findings=0)`: entries=38 confirmed by listing/stat of the real root (allowed); findings=0 not re-runnable under the lane rule (omp-census only with --root fixture or --selftest). I verified --root on my fixture (CLEAN, entries=20) and --selftest 29/29 instead.
- [confirm] sha256sums in the inherited evidence match the tip bytes exactly (listed above); omp-census.mjs sha = fd4d1c4e… as stated in the item.

NEW findings (mine, same surface):
- NEW1: The inherited report's quoted `PROXY: DRIFT` verdict line is not byte-exact: it prints `derived=9` where the tool's summary line prints `computed=9` (the detail line `coverage: ## Axes row=10 derived=9` does use derived). Numbers substantively unchanged; minor transcription drift.
- NEW2: Checklist item 20 (SKILL.md:697, OMP agent-root census) runs `node scripts/omp-census.mjs` bare, i.e. any `surface-probe --checklists` pass reads the live ~/.omp/agent shape; under this round's lane rule (omp-census only with --root fixture or --selftest) a compliant seat cannot reproduce the attempt-1 OMP_CENSUS line nor run the full checklist unmodified. Operability note for the L1: consider how item 20 participates in future checklist receipts (documented substitution or skip like 18-19).

Command evidence (observed):
```
$ git -C lane rev-parse HEAD
a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f
$ sha256sum scripts/omp-census.mjs SKILL.md scripts/surface-probe.mjs scripts/proxy-check.mjs scripts/cite-check.mjs
fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7  scripts/omp-census.mjs
2ae01fad5fe8e5fd138df5b912c4eba752400fe3c1ef8e59f20e7af85290543c  SKILL.md
1361075da7762ce870749331864646fc03114e86720dc6b933bd6efcccb678b5  scripts/surface-probe.mjs
da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826  scripts/proxy-check.mjs
115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8  scripts/cite-check.mjs
$ node scripts/cite-check.mjs   # wrapper; item 1
CITE_CHECK: DRIFT (files=104 tokens=9784 errors=826 warnings=611)   exit=1
$ node scripts/cite-check.mjs --fleet /home/vgpnk/Projects/shokunin
CITE_CHECK: DRIFT (files=104 tokens=9791 errors=636 warnings=530)   exit=1
$ node scripts/proxy-check.mjs --strict
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=99 computed=100 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=99 computed=100 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)   exit=1
$ node scripts/round-gate.mjs   # with KUMITATE_MAIN_REPO/KUMITATE_REPORTS_DIR
ROUND_GATE: CLEAN (round=44 lane=kumitate checks=10 errors=0 warnings=1)   exit=0
$ node scripts/round-gate.mjs --tracked
ROUND_GATE: CLEAN (mode=tracked checked=27 errors=0 warnings=0)   exit=0
$ node scripts/round-gate.mjs   # no env
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) ...   exit=2
$ node scripts/surface-probe.mjs --checklists   # probe variant, item 20 on fixture
CHECKLIST  PASS SKILL.md:678 exit=1 expected=0|1 substring=hit — Citation gate verdict
CHECKLIST  FAIL SKILL.md:685 exit=1 expected=0 substring=miss — Proxy recompute
CHECKLIST_SKIPPED: 2
CHECKLIST: 18/19 pass
VERDICT: FAIL   exit=1
$ ls -A /home/vgpnk/.omp/agent | wc -l
38
$ node scripts/omp-census.mjs --root <my fixture>   # 20 members, mode 600/644/755 per spec
OMP_CENSUS: CLEAN (root=.../pin-fixture entries=20 findings=0)   exit=0
$ node scripts/omp-census.mjs --selftest
VERDICT: PASS (29 cases)   exit=0
$ for f in $(find corpus/knowledge corpus/lessons -name '*.md'); do grep -qF "| \`${f#corpus/}\`" corpus/README.md || echo "MISSING ROW: ${f#corpus/}"; done
MISSING ROW: lessons/round-44-verifier-spotcheck.md
```

Residual risk: the omp-census real-root verdict (findings=0) is the only inherited statement not re-derivable under the lane rule (entries=38 part confirmed). Gate-mutants items 18-19 remain unmeasured (excluded by the L1 instruction; not part of this item). No tool installed; no lane/fleet writes; scratch cleaned (probe clone and outputs retained under my seat dir for re-read).
