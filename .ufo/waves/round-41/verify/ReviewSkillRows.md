RESULT ReviewSkillRows rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=consistent contradicted=0
Item: check SKILL.md `## Gate registry` rows for cite-check and wave-census and the
`## Verifiable checklist` wave-census items against the scripts' real usage, exit map and
output. Every documented command was run in my own clone
(/fast/scratch/hyaku/kumitate-r41a2/seats/ReviewSkillRows/lane, detached at fae386aa).
No audited statement is contradicted by either script. Evidence below; node v24.21.0.

1. Item 16: `node scripts/wave-census.mjs --round 40` → exit 0, `WAVE_CENSUS: CLEAN
   (rounds=1 waves=2 findings=0)`; build=32 seats attack=14 reports=31/32, falsify=35 seats
   attack=31 reports=26/35; `ROUND round=40 waves=2 seats=67 attack=45 reports=57/67`.
2. Item 17: `node scripts/wave-census.mjs --selftest` → exit 0, `WAVE_CENSUS_SELFTEST: 23/23
   pass` + `VERDICT: PASS` (WC01–WC23). Matches the item and the row's self-test cell.
3. Row usage: `--round 40 --expect falsify:critic=12 --expect 40/build:scout=6
   --expect build:attack=14` → exit 0 CLEAN — `[<round>/]` prefix, plain role, and role
   `attack` = attack total (14 = critic 8 + mutation-tester 3 + reviewer 3) all as stated.
   `--expect falsify:critic=99` → exit 1 DRIFT, FINDING EXPECT_MISMATCH. `--json` →
   contract kumitate-wave-census-v1, verdict CLEAN, exit 0.
4. Verdict map (registry intro): no args → exit 64 + usage line; `--round 99` → exit 2,
   stderr `wave-census: fail-closed — round dir .../round-99 is missing`, no verdict line.
   0/1/2/64 all observed for wave-census; 0/1 observed for cite-check (5,6).
5. Item 1: bare `node scripts/cite-check.mjs` (default src /home/vgpnk/Projects/ufo-fsd-alpha
   exists) → exit 1, `CITE_CHECK: DRIFT (files=96 tokens=9355 errors=687 warnings=541)`;
   with `--src /fast/scratch/hyaku/kumitate-pin/src` (HEAD 31c465f1) → exit 1, errors=715.
   The item claims exit 0|1 + `CITE_CHECK:` — holds; DRIFT is a tree finding, not a row
   contradiction (the item never claims CLEAN). Row's `[--src DIR] [--strict]` accepted;
   `--strict` run → exit 1, same line shape.
6. Item 2: `node scripts/cite-check.mjs --selftest` → exit 0, `75/75 cases passed
   (hermetic)` + `VERDICT: PASS`.
7. Row cells verified in code/output: `WAVE_CENSUS_SELFTEST: n/m` printed; findings
   EXPECT_MISMATCH/EXPECT_UNKNOWN/COUNT_MISMATCH/REGISTRY_MISMATCH/STRAY_REPORT all exist
   (WC02/04/05/06/07); resumed seats counted apart as `resumed=` (WC13 seats=0 resumed=1,
   reports=1/1); a report = non-empty regular file (lstat isFile && size>0; WC14 dir named
   S.md not counted, WC18 empty file absent); reads committed .ufo/waves/round-<N>/*-dispatch.json
   and the Report:-named reports; "a payload proves validation, not dispatch" matches the
   script header verbatim.
8. Registry intro: "All nine are gates" — 9 rows present; "each can exit 1 on a real defect"
   — observed exit 1 on both audited scripts; "self-tests write only mkdtemp fixtures" —
   wave-census selftest mkdtemp+rmSync, cite-check fixtures under /tmp/kumitate-cite-selftest-*;
   "Seventeen items" — grep -c '^- \[ \]' SKILL.md = 17, items 16–17 are the two census bullets.
9. cite-check row's round-41 cell: the scout's 16 unpinned conditions
   (.ufo/waves/round-40/build/ScoutCiteVerdict.md, unpinned=16) map 1:1 onto current selftest
   cases (warn-total → warn-only default/strict pair; resolved>0 → clean fixture asserting
   VERDICT PASS; resolved-kind-gate → "resolved counts OK findings only"; citeCheck-map →
   FAIL→DRIFT case; render-env-empty/zero → two text-render cases; exit2-empty/zerores →
   exit-contract cases; parse-64 → unknown-argument case; suite cases inject one failing
   child, text and --json). The 13/3 split is statically consistent: only group-verdict (2471),
   any-fail (2474) and text-exit (2503) mutants leave the printed overall verdict PASS or the
   exit 0 while FAIL case lines and n/m below m stay visible; the other 13 flip an asserted
   VERDICT/exit. The measured `survived=0/16` is the probe's claim (.ufo/waves/round-41/probe/
   cite-verdict-mutants.mjs.txt, present at fae386aa); the rerun belongs to the C1 counter
   seat and I did not duplicate it.
10. Preamble "Item 1 (cite-check) still takes an explicit --src": no origin-pin lookup in
    cite-check.mjs; default is $UFO_SRC → ~/Projects/ufo-fsd-alpha →
    ~/Projects/origin-work/ufo-fsd-alpha (resolveSrcDefault, :116-120). Consistent.
Observations, not counted (no SKILL statement contradicted):
a. The script's own exit-64 usage string omits `[<round>/]` and `--root DIR`, which parseArgs
   accepts; SKILL's row is the accurate syntax — a cosmetic gap inside the script.
b. On a fail-closed environment fault cite-check still prints `CITE_CHECK: DRIFT
   (environment: empty-scan-set|zero-resolutions)` at exit 2 (selftest-pinned); the checklist
   preamble already classes exit 2 as a tool/environment fault, and wave-census exit 2 prints
   no verdict line at all, exactly as the preamble says.
c. Round-40 falsify census at fae386aa reads seats=35 reports=26/35 (attempt-1 context says
   34 seats / 27 reports); dispatch payload vs working-tree reports at this revision is the
   census seats' evidence, out of my scope.
Residual risk / gaps: the `survived=0/16` outcome and the 13/3 mutant split rest on static
case-inventory + code-path analysis plus the probe's recorded claim, not my rerun; item 16/17
cleanliness is revision-bound and verified at fae386aa only. No tools installed; the only lane
write is this report.
