VERDICT: harm-matrix measures old revisions correctly on the four exit paths it declares (0/1/2/2-NO_GATES; 64 only on usage), but it silently counts gates that produced NO verdict as measured (`CLEAN gates=N` can hide a blind gate) and mints NEW_RED / exit 1 from a gate that could not run because its committed pin points at a deleted host clone.

## Evidence

Pairs (six lane commits, rounds 20–50, non-overlapping), all run once with
`node scripts/harm-matrix.mjs --lane <lane> --base <b> --tip <t> --timeout 120`; raw output in
`.ufo/waves/round-65/build/K65ExecHistoryC/runs/`.

| pair | base → tip (rounds) | wall | exit | summary |
|---|---|---|---|---|
| A | `f86b8ed0` → `364f1d59` (20→24) | 27.4 s | 0 | `HARM_MATRIX: CLEAN gates=5 held=1 repaired=0 carried=2 moved=2 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=f86b8ed0e03d tip=364f1d595415` |
| B | `0ecba269` → `89ff4a74` (32→38) | 25.1 s | 1 | `HARM_MATRIX: HARM gates=8 held=1 repaired=0 carried=0 moved=4 new=2 gone=0 harm=0 harm_absent=0 new_red=1 base=0ecba2692c45 tip=89ff4a74d92d` |
| C | `d81978cd` → `329fcb80` (44→50) | 44.0 s | 0 | `HARM_MATRIX: CLEAN gates=11 held=8 repaired=0 carried=3 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=d81978cdfefd tip=329fcb8018d2` |
| NO_GATES | `45b4ed3f` → `e0f5ca78` (1→4, no `scripts/`) | 1.0 s | 2 | `HARM_MATRIX: FAIL_CLOSED reason=NO_GATES detail="every gate absent at both revisions"` (20 ABSENT_BOTH rows, no summary line) |

Class census per pair (rows=20 registry gates; measure class base/tip, then transition id):

```
pair A: ABSENT 15/15 ABSENT_BOTH 15 HELD 1 CARRIED 2 CARRIED_MOVED 2 NEW_OK 0 NEW_RED 0 GONE 0 HARM 0 HARM_ABSENT 0
        FAIL_CLOSED 1/1  TIMEOUT 0/0  NOT_CLEAN 3/3  CLEAN 1/1
pair B: ABSENT 15/12 ABSENT_BOTH 12 HELD 1 CARRIED 0 CARRIED_MOVED 4 NEW_OK 2 NEW_RED 1 GONE 0 HARM 0 HARM_ABSENT 0
        FAIL_CLOSED 1/0  TIMEOUT 0/0  NOT_CLEAN 3/5  CLEAN 1/3
pair C: ABSENT 9/9   ABSENT_BOTH 9  HELD 8 CARRIED 3 CARRIED_MOVED 0 NEW_OK 0 NEW_RED 0 GONE 0 HARM 0 HARM_ABSENT 0
        FAIL_CLOSED 0/0  TIMEOUT 0/0  NOT_CLEAN 3/3  CLEAN 8/8
```

ABSENT means the gate's `needs` script is not in the archive (mtimes irrelevant); the 9 ABSENT_BOTH gates at
round 50 are the ones landed later (readme-map r57, source-capture r55, source-dupes r56, cite-sources r59,
counter-pins, report-receipt-diff r58, plan-before-ready r63, harm-matrix r65, ...). Old-revision behaviour:

- No TIMEOUT in any run (`grep -c TIMEOUT runs/*.txt` = 0 each) — the `--timeout 120` override has headroom.
- gate FAIL_CLOSED because an old script rejects a current argument: `surface-known` at r20/r24/r32 reads
  `no-verdict exit=64`; direct run in the r24 archive: `surface-probe: unknown argument: --known` +
  `usage: node scripts/surface-probe.mjs [options]` `EXIT=64` (r24's usage lists no `--known`; r38's does).
- gates reading NOT_CLEAN because their committed pin is a host path that no longer exists:
  `MISSING /fast/scratch/kumitate-r36/src` (`.ufo/pins/origin.json` at r38) and
  `MISSING /home/vgpnk/Projects/origin-work/ufo-fsd-alpha` (`DEFAULT_SRC` literal at `scripts/proxy-check.mjs:245`
  and `scripts/claims-check.mjs:71` at r20; the tree now lives at `~/Projects/ufo-fsd-alpha`, EXISTS).
- exit codes verified: 0 (pairs A, C, reversed pair), 1 (pair B), 2 (`REV_UNREADABLE` bogus rev;
  `REV_UNREADABLE` for a missing `--lane`; `NO_GATES` for `--only no-such-gate` and for the all-absent pair),
  1 with 64 on usage only. Exact transcripts in `build/K65ExecHistoryC/direct-runs.txt`.

## Findings

**K65ExecHistoryC-1 — medium — a gate with no verdict at either revision is counted as measured and invisible in the summary.**
`measure()` returns class `FAIL_CLOSED` for "no-verdict exit=N", `transition()` maps FAIL_CLOSED→FAIL_CLOSED to
`CARRIED`, and `render()` counts every non-ABSENT_BOTH row into `gates=` while the summary has no `unreadable=`
field. The matrix therefore prints `HARM_MATRIX: CLEAN` and exits 0 while a "measured" gate produced nothing.
Attacks the "no axis harmed" reading on any pair, and the H1/H2 vacuity family: a gate whose argv stops being
accepted is silent in both directions. Repro:
`node scripts/harm-matrix.mjs --lane . --base f86b8ed0 --tip 364f1d59 --only surface-known --timeout 120`
→ `HARM_ROW gate=surface-known base=FAIL_CLOSED tip=FAIL_CLOSED id=CARRIED ... "no-verdict exit=64"` then
`HARM_MATRIX: CLEAN gates=1 ... carried=1 ...`, exit 0. Same hole in a fixture independent of revision age
(`build/K65ExecHistoryC/direct-runs.txt` §5: two gates, one blind → `CLEAN gates=2`, exit 0).
Fix proposed, additive only: `build/K65ExecHistoryC/harm-matrix-unreadable-line.patch` emits
`HARM_MATRIX_UNREADABLE: count=N gates=<id:cls/cls,...>` (does not change any class or exit code, does not
collide with the `HARM_MATRIX: ` summary prefix); applied in a scratch copy (`patch -p1`, `node --check`), where the
masked repro prints `HARM_MATRIX_UNREADABLE: count=1 gates=surface-known:FAIL_CLOSED/FAIL_CLOSED` before the unchanged
`HARM_MATRIX: CLEAN gates=1 ...` line, exit 0. Who is right: the r24 script really does reject `--known`
(archive run above), so the row is inapplicable, not clean — the tool conflates the two.

**K65ExecHistoryC-2 — medium — NEW_RED (and the pair's exit 1) is minted from a gate that could not run.**
Pair B's only red is `anchor-truth`: base ABSENT (the script landed at r37), tip `TRUTH: FAIL-CLOSED (SRC_MISSING
/fast/scratch/kumitate-r36/src) [exit=2]` → `NEW_RED` → `harm=0 harm_absent=0 new_red=1`, exit 1. Direct run in
the r38 archive reproduces the tip line; the same revision with its own committed pin satisfied reads
`TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af… src-rev=31c465f15669)` `EXIT=0`
(sandbox clone `89ff4a74` + `origin.json` clone re-pointed at a `--no-hardlinks` origin clone at
`31c465f15669`), and the tip tree's own receipt `.ufo/waves/round-38/candidate-c938/truth.txt` also reads
`TRUTH: CLEAN … EXIT=0`. So on a historical pair the tool's exit code reports host state (a deleted
`/fast/scratch` clone) as revision harm; the declared limit covers "host-state gates read the same host at both
revisions", not an ABSENT→unreadable asymmetry that lands in the one class that forces exit 1. Repro:
`node scripts/harm-matrix.mjs --lane . --base 0ecba269 --tip 89ff4a74 --only anchor-truth --timeout 120` → exit 1.
Not proposed as a class change now: suppressing NEW_RED on a non-verdict would relax the check; the additive
patch above at least names the row.

**K65ExecHistoryC-3 — low — `moved=` (CARRIED_MOVED) is host-conditioned on pair A.**
`proxy-check`/`claims-check` at r20 read `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /home/vgpnk/Projects/origin-work/ufo-fsd-alpha is absent` /
`CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR …)` while at r24 the same gates read `PROXY: DRIFT (...)` / `CLAIMS: DRIFT (...)`
— because r20 hard-codes `origin-work` as `DEFAULT_SRC` and r24 searches both paths. Direct runs in both archives
reproduce each side (r24: `PIPE_EXIT=1` for both). Who is right: each script is right for its revision; the host
moved the tree. Effect: `moved=2` in pair A carries no revision signal, and the summary cannot say so.
Repro: `node scripts/harm-matrix.mjs --lane . --base f86b8ed0 --tip 364f1d59 --only proxy-check,claims-check --timeout 120`.

**K65ExecHistoryC-4 — low — a wrong `--lane` is reported as `REV_UNREADABLE detail="base=<rev>"`.**
`git -C <nonexistent> rev-parse` fails, so `runMatrix` returns REV_UNREADABLE before any clone is attempted; the
message blames the revision. Exit 2 is right, the diagnosis is not. Repro:
`node scripts/harm-matrix.mjs --lane /tmp/no-such-lane --base f86b8ed0 --tip 364f1d59 --only round-gate-selftest`
→ `HARM_MATRIX: FAIL_CLOSED reason=REV_UNREADABLE detail="base=f86b8ed0"` exit 2.

**K65ExecHistoryC-5 — low — no ancestry check and GONE-by-deletion exits 0.**
A reversed pair `--base 364f1d59 --tip f86b8ed0` reads `HARM_MATRIX: CLEAN gates=2 held=1 carried=1` exit 0, so a
mistyped pair direction is indistinguishable from a green pair on those revisions. Separately, a gate that is
NOT_CLEAN at base and absent at tip is `GONE`, which is not in `harm+harm_absent+new_red`: a red gate can be
silenced by deleting its script. Fixture repro (`build/K65ExecHistoryC/direct-runs.txt` §6):
`HARM_ROW gate=redgate base=NOT_CLEAN tip=ABSENT id=GONE`, `HARM_MATRIX: CLEAN gates=1 ... gone=1`, exit 0.
GONE is a declared class, so this is named as a limit rather than a defect; the reversed-pair case has no
declaration.

## Artifacts

- `.ufo/waves/round-65/build/K65ExecHistoryC/runs/pairA-r20-r24.txt` (full stdout, 20 rows)
- `.ufo/waves/round-65/build/K65ExecHistoryC/runs/pairB-r32-r38.txt`
- `.ufo/waves/round-65/build/K65ExecHistoryC/runs/pairC-r44-r50.txt`
- `.ufo/waves/round-65/build/K65ExecHistoryC/runs/nogates-r1-r4.txt`
- `.ufo/waves/round-65/build/K65ExecHistoryC/runs/masked-failclosed-r20-r24.txt`
- `.ufo/waves/round-65/build/K65ExecHistoryC/direct-runs.txt` (archive/clone direct runs, exit-code edges)
- `.ufo/waves/round-65/build/K65ExecHistoryC/harm-matrix-unreadable-line.patch` (additive fix for finding -1)
- scratch `/tmp/kumitate-r65/K65ExecHistoryC/` (archives, fixtures, origin clone — deleted after use)

## Limits

- Did not run `--selftest` (28 case files) or the H65 counter; not this seat's surface, and the wave forbids gates.
- Three pairs only; rounds 25–31, 39–43 and 46–49 unmeasured. No pair crossed a gate *deletion* at a red base on
  real revisions, so GONE is shown on a fixture, not on lane history.
- `--timeout 120` overrides the per-gate timeouts in `harm-matrix-gates.json` (60–300 s); a gate that legitimately
  needs more than 120 s at a modern revision would read TIMEOUT. None did here (largest pair 44 s wall), but the
  modern-revision `harm-matrix-selftest` gate (declared 300 s) was not exercised under the override.
- All NOT_CLEAN history readings are on this host only; `/fast/scratch/kumitate-r36/src` and
  `~/Projects/origin-work/ufo-fsd-alpha` are missing, so every src-dependent gate reads as described above and
  cannot be re-run as of the round's own time.
- Assumption-stated, not verified: `fs-scan` of the frozen `probe/harm65-probe.mjs` and the 16 controls was not
  done; findings are against the tool, not against the counter's checks.
