RESULT ScoutCensusFindings rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=open findings_open=12/12 gaps_open=5/5

# R41-6 triage: 12 attempt-1 census findings and 5 report-presence gaps

Measured revision `b237e3f09c9559e130c7367bd2efa981c4ea516f` (lane `master`; HEAD of my detached
clone). Instrument `scripts/wave-census.mjs` at that revision: 462 lines, sha256
`d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204`, own suite `26/26 pass`,
`VERDICT: PASS`, exit 0. Between `fae386aa` (round-41 attempt-2 tip) and `b237e3f` the file gains
the WC22 name-half widening, WC24-WC26 and the self-observation hook (56 insertions, 2 deletions);
no line of the 17 items below changed. `.ufo/waves/round-42/` at `b237e3f` holds only `plan.md`
and `open/receipts.txt`; the plan routes this set as R41-6 ("fix or name each"), so none is fixed
in tree. Method: each of the 12 findings re-run as its own fixture at `b237e3f`; each of the 5 gaps
re-run as the `MutCensusReports` mutant against a byte copy of the `b237e3f` file with its own
`--selftest` (killed = a test FAILs; a crash is not a kill). No `lsp` device exists in this seat's
toolset, so evidence is source reads plus executed fixtures. Lane files written: this report only.

## Table

`definition` = the falsify report that named it; `ledger` = the attempt-2 re-run; `lesson` = the
round-41 closure. All paths relative to the lane root.

| # | id | finding (one line) | evidence (file:line) | status at b237e3f |
|---|---|---|---|---|
| 1 | M2 | A v1 envelope with no `counts` or no `registry` passes CLEAN | `.ufo/waves/round-41/falsify/ReviewCensusCode.md:57`; `verify/ReviewCensusCodeLedger.md:11`; `corpus/lessons/round-41.md:258` | **open** — `if (d.counts &&` :122 and `d.registry &&` :125 are both optional; a v1 envelope without `taskCall` is also CLEAN (fixture 3). WC26 now *asserts* the bare-v1 exit 0, so the unchecked shape is pinned as intended, not fixed |
| 2 | M5 | Report paths outside `.ufo/waves` are silently counted absent | `falsify/ReviewCensusCode.md:69`; `verify/ReviewCensusCodeLedger.md:14`; `corpus/lessons/round-41.md:259` | **open** — `RE_REPORT` :57 still requires the `.ufo/waves/` prefix, so a present `.ufo/scopes/r9/Scope01.md` gives `reports=0/1`, CLEAN, no finding |
| 3 | M6 | An unscoped `--expect` stays silent when one requested round lacks the wave | `falsify/ReviewCensusCode.md:73`; `verify/ReviewCensusCodeLedger.md:15`; `corpus/lessons/round-41.md:259-260` | **open** — `hits` :155 only collects rounds that hold the wave; `--round 34 --round 35 --expect build:critic=1` is CLEAN exit 0 with round 35 unflagged. Round scoping is a mitigation; the per-round direction and the docstring contradiction (:33, "an `--expect` names a wave the round does not have") remain |
| 4 | D1 | "WHAT IT CANNOT SAY" overclaims and omits the largest limits | `falsify/ReviewCensusCode.md:81`; `verify/ReviewCensusCodeLedger.md:17`; `corpus/lessons/round-41.md:260-261` | **open** — docstring :19-24 was rewritten in attempt 2 but still omits spec-without-payload invisibility and the `..`-segment rule, and "a payload file proves validation" stands while M2 leaves every envelope shape unchecked |
| 5 | D3 | Docstring lists three exit-2 triggers; the code has more | `falsify/ReviewCensusCode.md:88`; `verify/ReviewCensusCodeLedger.md:18`; `corpus/lessons/round-41.md:260-261` | **open** — docstring :34-35 still names three (missing round dir, no dispatch file, does not parse) while the code also exits 2 on "carries no task list" :105 and "task without a string name and agent" :107, plus read errors |
| 6 | D4 | Docstring calls the envelope registry "the merged `ufo-swarm-registry-v1`" | `falsify/ReviewCensusCode.md:90`; `verify/ReviewCensusCodeLedger.md:19`; `corpus/lessons/round-41.md:260-261` | **open** — docstring :11 unchanged; the envelope carries only this wave's members |
| 7 | L1 | `-dispatch.json` match is case-sensitive; upper-case `.JSON` is dropped silently | `falsify/ReviewCensusCode.md:92`; `verify/ReviewCensusCodeLedger.md:20`; `corpus/lessons/round-41.md:261-262` | **open** — `/-dispatch\.json$/` :91; `build-dispatch.JSON` plus a valid falsify payload reads `waves=1`, exit 0 |
| 8 | L2 | Duplicate `--round` accepted and counted twice | `falsify/ReviewCensusCode.md:94`; `verify/ReviewCensusCodeLedger.md:21`; `corpus/lessons/round-41.md:262` | **open** — no dedupe at `o.rounds.push(Number(v))` :71; `--round 4 --round 4` gives `rounds=2 waves=2`, exit 0 |
| 9 | L3 | Duplicate seat names counted twice without a finding | `falsify/ReviewCensusCode.md:96`; `verify/ReviewCensusCodeLedger.md:22`; `corpus/lessons/round-41.md:262-263` | **open** — no uniqueness check on task names; two `Dup` seats read `seats=2 reports=2/2`, exit 0 |
| 10 | L5 | Attack-role matching is case-sensitive | `falsify/ReviewCensusCode.md:100`; `verify/ReviewCensusCodeLedger.md:24`; `corpus/lessons/round-41.md:263` | **open** — `ATTACK` :55 and `ATTACK.has(t.role)` :115; agent `Reviewer` reads `roles: Reviewer=1 attack=0`, exit 0 |
| 11 | L6 | Upper-case wave is read but `--expect` of it exits 64 without naming the case constraint | `falsify/ReviewCensusCode.md:102`; `verify/ReviewCensusCodeLedger.md:25`; `corpus/lessons/round-41.md:263-264` | **open** — the expect grammar :75 admits `[a-z0-9-]+` only; `Build:executor=1` exits 64, the message echoes the value but never names the lower-case rule |
| 12 | L7 | EACCES/EISDIR labelled "does not parse"; `--root` at a regular file says "missing" | `falsify/ReviewCensusCode.md:104`; `verify/ReviewCensusCodeLedger.md:26`; `corpus/lessons/round-41.md:264` | **open** — "does not parse" :99 also covers EACCES; "round dir … is missing" :90 also covers ENOTDIR; both fixtures reproduce |
| 13 | G1 = M03 | Greedy `Report:` capture: two paths on one line, only the first exists | `verify/MutCensusReports.md:7,26`; `corpus/lessons/round-41.md:251-255` | **open** — witness mutant (greedy `[^\n]*?`) survives the 26-case suite at 26/26 `VERDICT: PASS` exit 0, and turns `reports=1/1` into `reports=0/1` |
| 14 | G2 = M06 | Whole-string `..` test: an over-broad form would also reject `x..y.md` | `verify/MutCensusReports.md:10,27`; `corpus/lessons/round-41.md:251-255` | **open** — mutant (`r.includes('..')`) survives 26/26, and turns `reports=1/1` + `FINDING STRAY_REPORT` into `reports=0/1` CLEAN (a real drift hidden) |
| 15 | G3 = M10 | `lstat` vs `stat` unpinned: a symlinked report counts absent | `verify/MutCensusReports.md:14,28`; `corpus/lessons/round-41.md:251-255` | **open** — mutant (`statSync`) survives 26/26, and turns `reports=0/1` into `reports=1/1` |
| 16 | G4 = M16 | `resumeSends` must be an array is unpinned: an object crashes with exit 2 | `verify/MutCensusReports.md:20,29`; `corpus/lessons/round-41.md:251-255` | **open** — mutant (`v1 && d.resumeSends`) survives 26/26, and turns CLEAN exit 0 into exit 2 `read error: d.resumeSends.map is not a function` |
| 17 | G5 = M17 | Resumed seat name compared as a string is unpinned: numeric 42 drifts | `verify/MutCensusReports.md:21,30`; `corpus/lessons/round-41.md:251-255` | **open** — mutant (`r.name`) survives 26/26, and turns CLEAN exit 0 into `FINDING REGISTRY_MISMATCH not-in-registry=[42] not-in-tasks=[42]`, exit 1 |

No item is superseded: every one still reproduces at `b237e3f`, and no later lane commit replaces
the mechanism.

## Evidence (commands and outputs)

- `git -C …/lane rev-parse HEAD` → `b237e3f09c9559e130c7367bd2efa981c4ea516f`; `git log --oneline -3` → `b237e3f round-42: plan with frozen counters …`, `dfabe92 round-41 verifier spot-check …`, `fb7046c round-41: attempt 2 close …`.
- `sha256sum scripts/wave-census.mjs` → `d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204`; `wc -l` → `462`; `node scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 26/26 pass`, `VERDICT: PASS`, exit 0.
- `git diff --stat fae386aa b237e3f -- scripts/wave-census.mjs` → `1 file changed, 56 insertions(+), 2 deletions(-)`; hunks = WC22 name-half, `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL`, WC24, WC25, WC26.
- `git ls-tree -r --name-only b237e3f -- .ufo/waves/round-42` → `.ufo/waves/round-42/open/receipts.txt` and `.ufo/waves/round-42/plan.md` only.
- Fixture 1 M2a (v1, no counts), `node scripts/wave-census.mjs --root fx/m2-nocounts --round 1` → `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0.
- Fixture 2 M2b (v1, no registry) → `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0. Fixture 3 (v1, no `taskCall`) → same CLEAN, exit 0.
- Fixture M5 (trailer `.ufo/scopes/r9/Scope01.md`, file present) → `WAVE round=2 … reports=0/1`, `WAVE_CENSUS: CLEAN`, exit 0.
- Fixture M6 (`--round 34 --round 35 --expect build:critic=1`) → `WAVE_CENSUS: CLEAN (rounds=2 waves=2 findings=0)`, exit 0.
- Fixture L1 (`build-dispatch.JSON` + `falsify-dispatch.json`) → `WAVE round=3 wave=falsify …`, `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0.
- Fixture L2 (`--round 4 --round 4`) → `… wave=build … ~ ROUND round=4 … ~ … wave=build …`, `WAVE_CENSUS: CLEAN (rounds=2 waves=2 findings=0)`, exit 0.
- Fixture L3 (bare payload, two `Dup`) → `seats=2 attack=2 reports=2/2 roles: critic=2`, `WAVE_CENSUS: CLEAN`, exit 0.
- Fixture L5 (agent `Reviewer`) → `roles: Reviewer=1 …`, `attack=0`, `WAVE_CENSUS: CLEAN`, exit 0.
- Fixture L6a (`Build-dispatch.json`) → `WAVE round=7 wave=Build …`, exit 0. L6b (`--expect Build:executor=1`) → exit 64, `--expect takes [<round>/]<wave>:<role>=<n>, got Build:executor=1`.
- Fixture L7a (dispatch chmod 000) → exit 2, `does not parse: EACCES: permission denied, open …`. L7b (`--root` at a regular file) → exit 2, `round dir …/.ufo/waves/round-8 is missing`.
- Exit-2 classes beyond the docstring's three: bare `{"context":"c"}` → `carries no task list` exit 2; task `{"name":7,…}` → `has a task without a string name and agent` exit 2; `{not json` → `does not parse: …` exit 2.
- Docstring at `b237e3f`: `:11` "`registry` = the merged `ufo-swarm-registry-v1`"; `:19` "WHAT IT CANNOT SAY."; `:34-35` "Fail-closed (exit 2): the round dir is missing, holds no dispatch file, or a dispatch file does not parse."
- Mutant build (`node build-mutants.mjs lane/scripts/wave-census.mjs mut`) → all five `occurrences=1`; shas `b677ff6e215d`, `964df1debcf1`, `29982ae0ff64`, `f73f18b13316`, `3334c21256b1`.
- `timeout -k 5 60 node mut/<id>.mjs --selftest` for G1_M03, G2_M06, G3_M10, G4_M16, G5_M17 → every one `WAVE_CENSUS_SELFTEST: 26/26 pass`, `VERDICT: PASS`, exit 0 (all survived).
- Witness G1: pristine `reports=1/1` → mutant `reports=0/1`; G2: pristine `reports=1/1` + `STRAY_REPORT` exit 1 → mutant `reports=0/1` CLEAN exit 0; G3: pristine `0/1` → mutant `1/1`; G5: pristine CLEAN exit 0 → mutant `REGISTRY_MISMATCH` exit 1.
- Witness G4 (v1, `taskCall:null`, object `resumeSends`): pristine `WAVE_CENSUS: CLEAN`, exit 0 → mutant exit 2 `read error: d.resumeSends.map is not a function`.
- Process hygiene: each mutant run under `timeout -k 5 60` in its own process group; `pgrep -fa 'ScoutCensusFindings'` after the batch → 0.
- Tools installed or upgraded: none. Nothing written outside `/fast/scratch/hyaku/kumitate-r42/seats/ScoutCensusFindings/` and this report; no git or jj write in the lane or fleet repo.

## Residual

- The five gap mutants are coverage findings, per `MutCensusReports.md:36-37`; the smallest correction
  they name is one selftest case each, no instrument change. As measured, all five survive the
  current 26-case suite, so a round-42 fix needs those cases (and a control that the case fails
  without the code change it claims to pin).
- M2 is now pinned as *intended* behaviour by WC26 (`bareV1.status === 0`, `noResumeKey.status === 0`).
  Fixing it means changing the contract (v1 requires `counts`, `registry` and `taskCall`), not only
  the suite; this triage records it as open, not as a documentation gap.
- Sentinel findings from the same closure item (no `realpath` confinement, FIFO hang, no size caps,
  trailer anchoring) are a separate routed set and are not re-measured here.
