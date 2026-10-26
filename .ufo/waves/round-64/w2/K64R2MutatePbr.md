VERDICT: The integrated `plan-before-ready.sh` selftest (18 cases, tree 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8) kills only 23 of 49 single-literal mutants on its own arms — 26 survive, all but one now killed by six validated selftest patches (19 new + 1 strengthened cases, pristine stays green at 37/37) — the one true equivalent is the non-root-default `--no-same-owner` flag.

## Evidence

- Baseline: `bash base/pristine.sh --selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)` exit 0 (0.42 s).
  Pristine copy sha256 `ef726eaef83e7068c28ec3e5e0dfc7732337ee7f4c72eaa6db054d1ed40324a0`, lane tree `2ed8a5f8…`, `git status --porcelain -- scripts/` → empty.
- Battery: 49 mutants (`/tmp/kumitate-r64/K64R2MutatePbr/mutants/`), each a validated single-literal, single-line diff of a scratch copy; `bash <mutant> --selftest` per mutant.
  Result: **23 KILLED / 26 SURVIVED** (full table: `work/battery-verdicts.tsv`). E7's kill is a crash, not behavior:
  `mutants/E7.sh: line 147: PBR_MAP_FROM: unbound variable` (rc 1).
- Survivors: A2 A4 A5 B3 C1 C3 E1 E2 E3 E4 E6 O5 O6 R10 R11 R5 R6 R7 S1 S2 S3 T1 T4 X3 X4 X5.
- Killer patches (diffs in `diffs/`): each applied to a pristine copy stays green — `PRISTINE+ALL: PASS (37/37)`,
  per-patch 22/24/21/21/19/20 PASS — and applied to each target mutant flips it to FAIL (27/27 killed; log
  `work/patch-validation.log`). Representative kills (verbatim BAD lines, abbreviated):
  - `E1+P1 map-round-zero want=1 got=2 … map=SKIP reason=MAP_PRE_EPOCH_ROUND`
  - `E3+P1 map-epoch-default-65 want=0 got=0 … rounds=65-65 exit=0 … map_red=` (raised default exposed by subprocess)
  - `X5+P2 map-timeout-fires want=1 got=2 … map=CLEAN files=2 rows=2 covered=2` (timeout mutated to 3 s lets a 2 s-hung counter pass)
  - `B3+P2 map-timeout-fires want=1 got=2 … map=CLEAN …` (`command -v timeout` lookup broken → wrapper never runs)
  - `C1+P3 map-clean-no-counts want=1 got=2 … map=CLEAN files=? rows=? covered=?` (bare CLEAN accepted)
  - `A2+P6 map-gate-readded want=1 got=0 … PASS …` (head instead of tail misses that the gate predated the plan)
  - `A4+P6 plan-readded-after-marker want=0 got=1 … reason=PLAN_NOT_ANCESTOR plan_ct=1000000300`
  - `S1+P5 map-red-summary-field want=1 got=1 … failed=9 na_rounds= map_red=` (rc same, field empty → text kill)
  - `T4+P2 map-archive-no-leak      pbr-map.* leftovers: 0 -> 1` (dropped `rm -rf "$t"` leaks scratch dirs)
- T1 equivalence evidence (uid 1000, GNU tar 1.35): a `--owner=0` archive extracted with and without
  `--no-same-owner` yields `stat -c %u` = `1000` both ways — the flag is tar's non-root default, so removal is
  behaviorally identical on this host; no selftest case can kill it.
- Restoration: lane script sha256 after the whole campaign = `ef726eae…` (identical to before); all mutants lived
  only in `/tmp/kumitate-r64/K64R2MutatePbr/`; build dir holds 1 counted-extension file (the work copy), within the ≤15 cap.

## Findings

1. **HIGH — selftest coverage of its own arms is 47% (23/49).** A 545-line gate whose fail-closed story is "a red map
   can never pass" leaves over half its single-literal mutant space alive. Repro: loop in
   `work/battery-verdicts.tsv` generation; `for m in mutants/*.sh; do bash $m --selftest; done`.
2. **HIGH — every UNRUNNABLE sub-branch is unexercised (R5, R6, R7, R10, R11 survive).** mktemp failure, archive
   failure, node rc 127, timeout rc 124, and the catch-all parse-failure branch: a counter that hangs, exits 127, or an
   unextractable archive is unobservable today. Killed by P2 (TMPDIR failure case, fake-`tar` case + no-leak assert,
   `exit 127` stub, noise stub, PATH timeout wrapper shortening 300→1).
3. **HIGH — the CLEAN parse is fail-open (C1, C3, C4 survive).** Dropping the trailing-space anchor accepts a bare
   `README_MAP: CLEAN` with no counts; dropping `^` accepts a mid-line CLEAN; `&&`→`||` short-circuits so exit-0-with-
   no-verdict reads CLEAN (`map=CLEAN files=? rows=? covered=?`). The core conjunct "exit 0 AND line-start CLEAN with
   counts" has no case. Killed by P3.
4. **MEDIUM — the epoch machinery is invisible to the in-process selftest (E1–E4, E6 survive; E7 crash-killed).**
   `run_selftest` hard-sets `MAP_FROM=0`, so the production default 65 and the `-lt` boundary are only reachable by
   spawning the script with `PBR_MAP_FROM` empty. Killed by P1: round-0 case, `MAP_FROM=1` boundary case, and two
   subprocess cases pinning round 64 = `MAP_PRE_EPOCH_ROUND` and round 65 = plain `MAP_PRE_EPOCH`.
5. **MEDIUM — `timeout 300` is dead config (X5, B3 survive).** No counter ever runs long enough to be killed; a mutant
   removing the timeout lookup behaves identically. Killed by P2's 2 s-hung stub + number-passing wrapper.
6. **MEDIUM — the ancestry arm's verdict string is unpinned (A3 survives on exit codes).** Swapping
   `--is-ancestor "$plan_sha" "$marker_sha"` flips every fixture's reason to `PLAN_CT_AFTER_MARKER` while the ct arm
   preserves the exit code — pre-existing Q58 cases cannot see it. Killed by strengthening case 2 to
   `check_has … 'reason=PLAN_NOT_ANCESTOR'` (P4). The Q58 ordering logic otherwise keeps its own kills: O1 (case 6),
   O2 (case 1), O3 (case 9), O4 (case 1) all die on exit codes.
7. **MEDIUM — summary `map_red=` is unpinned (S1, S2, S3 survive).** Repointing it at `NA_ROUNDS`, inverting the
   append, or renaming the field all keep the selftest green; an auditor grepping `map_red=` reads wrong data. Killed
   by P5's subprocess case asserting `map_red=9` on a red-map round.
8. **MEDIUM — `oldest_add`/`map_first_add` `tail -n 1` is equivalent on every linear fixture (A2, A4 survive).**
   Only re-add fixtures diverge: a gate dropped and re-added after the plan (the OLDEST add proves the gate predated
   the plan → MAP_ABSENT), and a plan dropped and re-added after the marker (the OLDEST add is the freeze). Killed by
   P6, which pins "oldest add = freeze" semantics.
9. **LOW — `%ct`→`%at` survives because every fixture sets author==committer dates (A5).** A counter ordered by author
   date would misjudge clock-skew rounds. Killed by P4's author-999999000/committer-1000000100 marker fixture.
10. **LOW — tie and first-path ordering unpinned (O5, O6 survive).** `-le`→`-lt` flips the `--earliest-marker` tie to
    dispatch; `head`→`tail` reports `w2.ready` when one commit adds two markers. Killed by P4's tie and two-readies
    fixtures.
11. **INFO — T1 (`--no-same-owner` removal) is a true equivalent for non-root runners** (evidence above). Patch
    proposal: none possible as a selftest case; guard by comment only. **INFO — E7 is a crash kill** (`set -u`), not a
    behavioral one.
12. **Brittleness classification (requested).** Of the 23 selftest kills: 16 flip an exit code (A1 B1 C2 C4 E5 E8 O1
    O2 O3 O4 R1 R2 R3 R4 R8 X1), 5 flip only pinned field text (B2 `map=NO_VERDICT`, C5 truncated counts field, R9
    empty `reason=`, X2 wrong `reason=`, T2 `reason=ARCHIVE` instead of `MAP_DRIFT`), 1 is the E7 crash. The 5 text
    kills assert declared contract vocabulary (`reason=MAP_*`, the `map=` field), so none die on incidental formatting;
    the same holds for patch-kills X3/X4/O5/O6/S1–S3/E2–E4, which pin contract fields on an otherwise-equal rc. No
    mutant in this battery dies of accidental output brittleness.

## Artifacts

- `build/K64R2MutatePbr/work/plan-before-ready.sh` — pristine copy (sha `ef726eae…`)
- `build/K64R2MutatePbr/work/battery-verdicts.tsv`, `work/battery-raw.tsv`, `work/patch-validation.log`
- `build/K64R2MutatePbr/diffs/K64R2MutatePbr-selftest-{P1-epoch-default,P2-unrunnable-families,P3-clean-grep,
  P4-ordering-ancestry,P5-summary-mapred,P6-oldest-add,ALL}.patch` — 7 unified diffs vs the pristine selftest
  (proposals for the L1; nothing applied to the lane)
- Scratch (not in lane): `/tmp/kumitate-r64/K64R2MutatePbr/` — `mutants/` (49), `logs/`, `val/`, `gen_mutants.py`,
  `build_patches.py`, `base/pristine.sh`

## Limits

- No tools installed or upgraded (operator 2026-10-19 authorization unused); no frozen file read-modified; no `jj`/git
  mutating commands; single-literal mutants only — multi-literal or structural mutants (e.g. deleting the whole
  `map_at_plan` call, covered only via E8/R8 disablements) were not enumerated.
- The map arm was attacked through the selftest's own `map_stub` contract, not against the real
  `scripts/readme-map.mjs`; real-counter behavior at plan commits is other seats' scope.
- Patches are validated against the pristine selftest and the 49 mutants only; their runtime grows ~1.5 s (slowclean
  case) and they assume GNU coreutils `timeout` at `/usr/bin/timeout`.
- T1 equivalence holds for non-root runners; a root CI runner could diverge (untestable in this seat).
