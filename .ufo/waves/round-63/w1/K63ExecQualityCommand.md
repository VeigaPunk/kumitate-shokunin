VERDICT: `plan-before-ready.sh` is built and able to fail — round 62 reads `FAIL reason=NO_PLAN` (exit 1) at both `dfa6fca8` and tip `b38a2065`, the wrong-order fixture reads `FAIL reason=PLAN_NOT_ANCESTOR` (exit 1), round 63 reads `NA reason=NO_MARKER` (exit 2) only because `w1.ready` is still untracked, and a PASS appears the moment that marker is committed; 3 PASS / 1 FAIL / 10 NA over rounds 50-63, 11 PASS / 7 FAIL / 11 NA over all 29 committed rounds.

## Evidence

Script: `.ufo/waves/round-63/build/K63ExecQualityCommand/plan-before-ready.sh` (343 lines, `bash -n` clean,
`shellcheck -S style` exit 0). Check: oldest commit adding `.ufo/waves/round-R/plan.md` must be
ancestor-or-equal of the oldest commit adding a top-level `.ufo/waves/round-R/*.ready` (fallback
`*-dispatch.json`), with `ct(plan) <= ct(marker)`. Exit 0 PASS / 1 FAIL / 2 NA (no plan **and** no marker,
or plan with no marker yet). Batch: 1 if any FAIL, else 2 if any NA, else 0.

Round 62 — the mined mistake, and the command that fails on it (`criterion-at-round-tips.txt`):

```
$ bash plan-before-ready.sh --round 62 --rev dfa6fca8f362e9c962f5b940025a2619380b759b
PLAN_BEFORE_READY: FAIL rev=dfa6fca8f362e9c962f5b940025a2619380b759b round=62 dir=.ufo/waves/round-62 reason=NO_PLAN plan=- marker=6d8faede281e509a2201de504ffcb0f7781256fe marker_kind=dispatch marker_ct=1792935222 marker_path=.ufo/waves/round-62/w2-dispatch.json
PLAN_BEFORE_READY_SUMMARY: pass=0 fail=1 na=0 rounds=62-62 rev=dfa6fca8f362e9c962f5b940025a2619380b759b exit=1 failed=62 na_rounds=
exit=1
$ bash plan-before-ready.sh --round 61 --rev dfa6fca8f362e9c962f5b940025a2619380b759b
PLAN_BEFORE_READY: PASS rev=dfa6fca8f362e9c962f5b940025a2619380b759b round=61 dir=.ufo/waves/round-61 plan=c2721f812cebd97ab67a1dd8cd8492a193f82d42 plan_ct=1792920790 marker=48877b4d0dc435e96ba5fd23759c8aec6b86f098 marker_kind=dispatch marker_ct=1792921121 marker_path=.ufo/waves/round-61/w1-dispatch.json
exit=0
```

Rounds 50-63 at tip `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (`table-r50-r63.txt`, full lines there):

| round | verdict | plan commit (first add) | marker commit | reason |
|---|---|---|---|---|
| 50 | PASS | 5b0de268e5a6bdd744fe47c6ee2ee58404693ac3 | 5b0de268e5a6bdd744fe47c6ee2ee58404693ac3 | same commit, `r50-dispatch.json` |
| 51 | PASS | 06ecbf4703fe9515ae51f36a903c58825c250ccc | 9d08e6b8fec6ea73b10be95a54f9fdb7354a18e1 | dispatch |
| 52 | NA | f539a71e236a4d66810851c1f2fb6e1abe61ec19 | — | NO_MARKER |
| 53 | NA | 68dbfb3fab8200679ed0465390b8d480b39e3e68 | — | NO_MARKER |
| 54 | NA | 8eb113fd2d9156371a0e9df654ce84aab823aa6a | — | NO_MARKER |
| 55 | NA | 68940c66f7482c4bb3bbb4f3a6ffea5aee53c1bc | — | NO_MARKER |
| 56 | NA | e4a49432b36f23646df31a68354d2c14a03fa9e3 | — | NO_MARKER |
| 57 | NA | f0dc6d1160e66af65355bd353665adac22bbf4a9 | — | NO_MARKER |
| 58 | NA | 50548ae5b4a47bb8d8cdc62212ec0648aa3776ee | — | NO_MARKER |
| 59 | NA | c54943320249b76a7fef97404a50f130336e511c | — | NO_MARKER |
| 60 | NA | 58b658dedc298611e4b95a9735dc101e13f9391b | — | NO_MARKER |
| 61 | PASS | c2721f812cebd97ab67a1dd8cd8492a193f82d42 | 48877b4d0dc435e96ba5fd23759c8aec6b86f098 | dispatch |
| 62 | **FAIL** | — | 6d8faede281e509a2201de504ffcb0f7781256fe | NO_PLAN |
| 63 | NA | b38a2065ab8ac5b198f6569b9013d04411c3d40d | — | NO_MARKER (`w1.ready` untracked) |

`PLAN_BEFORE_READY_SUMMARY: pass=3 fail=1 na=10 rounds=50-63 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d exit=1 failed=62 na_rounds=52,53,54,55,56,57,58,59,60,63`

Round 63 becomes PASS once `w1.ready` is committed — fixture A (`fix-ok.hjV0oc`) carries the lane's real
`plan.md` and `w1.ready` bytes at the real paths, plan at ct 1792961253 then marker at 1792961500:

```
PLAN_BEFORE_READY: PASS rev=50b465100cdbe0368a098ef34c341740c66a99e0 round=63 dir=.ufo/waves/round-63 plan=c674f56c3f859ec1d52d99dac9589bc2a199ed6b plan_ct=1792961253 marker=50b465100cdbe0368a098ef34c341740c66a99e0 marker_kind=ready marker_ct=1792961500 marker_path=.ufo/waves/round-63/w1.ready
```

Deliberately wrong fixture B (`fix-wrong.l2dx2m`, marker commit `59a40c846ddea31fd6c48e7782c68c4ec8a96ec7`
**first**, plan commit `34a9aee0daac54f578826b4b5ad60340dd2c9036` after) — must FAIL, and does:

```
PLAN_BEFORE_READY: FAIL rev=34a9aee0daac54f578826b4b5ad60340dd2c9036 round=63 dir=.ufo/waves/round-63 reason=PLAN_NOT_ANCESTOR plan=34a9aee0daac54f578826b4b5ad60340dd2c9036 plan_ct=1792961500 marker=59a40c846ddea31fd6c48e7782c68c4ec8a96ec7 marker_kind=ready marker_ct=1792961253 marker_path=.ufo/waves/round-63/w1.ready
exit=1
```

Self-test (10 fixtures, every exit code asserted, each built as `D=$(mktemp -d) && git -C "$D" init -q` with
`rev-parse --show-toplevel` verified before the first commit, commits only inside `$D`):
`PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` exit 0. Cases: honest order, wrong order, marker-without-plan,
plan-only, empty round, same-commit, dispatch fallback, nested-marker-ignored, clock-skew (`ct` arm alone),
`--all` enumeration. Standing sweep at tip: `pass=11 fail=7 na=11 rounds=all(29) exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60,63`.

Command text the QUALITY criterion will quote (draft: `QUALITY-Q58-draft.md`, Q58 is the next free id —
`corpus/QUALITY.md:945` holds Q57):

```
bash scripts/plan-before-ready.sh --round <N> --rev <tip>   # PASS line + exit 0
bash scripts/plan-before-ready.sh --selftest                # PLAN_BEFORE_READY_SELFTEST: PASS (10/10), exit 0
bash scripts/plan-before-ready.sh --all                     # standing sweep
```

## Findings

1. **K63ExecQualityCommand-1 — high — the obvious implementation of this criterion false-PASSes round 63
   today.** git pathspec `*` matches `/`, so `git log --diff-filter=A -- .ufo/waves/round-63/*.ready` finds
   `b38a2065…` through the **14 nested control-fixture markers** under
   `.ufo/waves/round-63/controls/inline/*/lane/.ufo/waves/round-7/w1.ready`, and a naive check then sees
   plan and "marker" in the same commit and prints PASS with no committed round marker at all. My script
   uses `:(glob)` on every pathspec (selftest case 8). Repro:
   `git log --diff-filter=A --format='%H %ct' -- '.ufo/waves/round-63/*.ready'` → `b38a2065…`;
   `git log --diff-filter=A --format='%H %ct' -- ':(glob).ufo/waves/round-63/*.ready'` → empty
   (`pathspec-hazard.txt`).
2. **K63ExecQualityCommand-2 — medium — round 63 is NA, not PASS, at HEAD.** `w1.ready` exists only in the
   working tree: `git status --porcelain -- .ufo/waves/round-63/w1.ready` → `?? .ufo/waves/round-63/w1.ready`;
   `git cat-file -e b38a2065:.ufo/waves/round-63/w1.ready` → `fatal: path … exists on disk, but not in
   'b38a2065'` (exit 128). The frozen plan's "round 63 passes" is therefore not yet true under the
   criterion it declares; it becomes true when the L1 commits the marker (fixture A above). Attacks: the
   plan's own parenthetical, if read as already-measured.
3. **K63ExecQualityCommand-3 — medium — the defect shape is not unique to round 62.** `--all` reads
   `NO_PLAN` FAIL for rounds 35, 36, 37, 38, 39, 40 as well (e.g. round 35 marker
   `4c9e40759d0946d8abac07d87ea0b6363fa8dbc3` `.ufo/waves/round-35/build-dispatch.json`, no `plan.md`). The
   first committed `plan.md` in the lane is round 41 (`34fccc170c73264faf5c27aaf7650d3419765ae0`), so a
   standing gate is red on arrival unless the criterion states its epoch (round 41+) or an exception list.
   Repro: `bash plan-before-ready.sh --all`.
4. **K63ExecQualityCommand-4 — medium — NA is a hole a do-nothing lane can live in.** Ten rounds read NA
   because no top-level `.ready` or `*-dispatch.json` was ever committed (49, 52-60, 63), although their
   `build/` and `close/` trees show waves ran. The criterion as specified cannot distinguish "wave not yet
   dispatched" from "wave ran, marker never committed", and NA is not a failure, so a lane that commits
   reports but no marker never trips the gate. Repro: `bash plan-before-ready.sh --rounds 52-60` → exit 2.
   Companion arm needed: a closed round must have a committed marker (`--all` plus "closed round with
   reports and no marker = FAIL").
5. **K63ExecQualityCommand-5 — low — same-commit PASS cannot tell a freeze from an after-the-fact write.**
   Round 50's `plan.md` and `r50-dispatch.json` land in one commit
   (`5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`, ct equal). Ancestor-or-equal is the specified rule, so this
   is a stated limit, not a bug; the mitigation is the round's `base/` freeze receipt plus C1's
   `inline-dispatch-evidence` gate, which binds seats to records the lane does not author. Repro:
   `bash plan-before-ready.sh --round 50`.
6. **K63ExecQualityCommand-6 — low — committer time is lane-controlled; ancestry is the only real arm.**
   The `ct` arm is decorative on its own (a lane can set `GIT_COMMITTER_DATE`), and a history rewrite that
   makes the plan an ancestor defeats both arms. Fixture `fix-delete` shows the add is still found after
   the marker is deleted at tip (`--full-history`), so deletion is not an escape; rewrite is. Repro:
   `bash plan-before-ready.sh --round 9 --repo <fix-delete fixture>` → PASS after `git rm` of the marker.

## Artifacts

Under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ExecQualityCommand/`:
`plan-before-ready.sh` (the command), `QUALITY-Q58-draft.md` (criterion text to paste, Q58),
`table-r50-r63.txt`, `all-rounds.txt`, `table-all-compact.txt`, `selftest.txt`, `fixtures.txt`,
`pathspec-hazard.txt`, `criterion-at-round-tips.txt`.
Fixtures (scratch, `/tmp/kumitate-r63/K63ExecQualityCommand/`): `fix-ok.hjV0oc`, `fix-wrong.l2dx2m`,
`fix-delete.rvlf0v`. Report: this file.

## Limits

- I did not commit anything in the lane, so the round-63 PASS is proven on a byte-identical fixture and by
  [INFERENCE] from ancestry: any commit adding `w1.ready` will be a child of `b38a2065`, so the plan is an
  ancestor by construction and ct 1792961253 <= the marker's. The lane's real PASS line does not exist yet.
- Marker kinds are only `.ready` and `*-dispatch.json` as specified; rounds 52-60 dispatched by other means
  and stay NA rather than being judged.
- `--all` covers the 29 `round-*` directories present at the rev; earlier waves outside `.ufo/waves` are
  not examined.
- Two defects in my first draft (alias parsing for `--round round-62`; a bad grep in the `--all` selftest
  case) were found by running the script and fixed; the final binary passes `shellcheck -S style` (exit 0)
  and 10/10 selftest cases. No tool was installed; no package manager was invoked.
- The criterion text is a draft only — I do not edit `corpus/QUALITY.md`, `scripts/`, or `SCORECARD.md`;
  the L1 must copy the script to `scripts/plan-before-ready.sh` and paste Q58.
