VERDICT: Q58 (plan-before-ready) and Q59 (host-record dispatch evidence) are drafted append-only in house style, both commands were executed against committed bytes and a fixture (Q58 fails round 62 and passes round 63; Q59's gate reads CLEAN 25/25 selftest, CLEAN on kengaku r35, DRIFT on tameshi r45), Q58's demonstration line is left as {{L1:command results}} because the executor seat's build dir does not exist yet, and four operability gaps are reported — the blocking one is that round 63's wave markers are untracked, so `--rev` mode reads `WAVE_ABSENT`.

## Evidence

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, HEAD `b38a2065ab8ac5b198f6569b9013d04411c3d40d`. All commands below ran from that lane root; nothing outside my build/report paths was written.

**1. House style + append point.** `grep -n '^- \*\*Q5[4-7] ' corpus/QUALITY.md` → `924:Q54  931:Q55  938:Q56  945:Q57`; `wc -l corpus/QUALITY.md` → `950`, whose last line is Q57's `Limit.` bullet. Q58/Q59 are free and append after line 950 with the same six-field shape.

**2. Q58 presence arm at round 62's tip `a2281a39`:**
```
$ git cat-file -e a2281a39:.ufo/waves/round-62/plan.md
fatal: path '.ufo/waves/round-62/plan.md' does not exist in 'a2281a39'
exit=128
$ ls .ufo/waves/round-62/plan/     # empty
```

**3. Q58 ordering command, round 62 (first ADD is a wave file → FAIL):**
```
$ git log --reverse --format='COMMIT %H' --name-status --diff-filter=A -- '.ufo/waves/round-62/plan.md' '.ufo/waves/round-62/w*' | head -8
COMMIT 6d8faede281e509a2201de504ffcb0f7781256fe

A	.ufo/waves/round-62/w1/AttackC1C2.md
A	.ufo/waves/round-62/w1/Audit19.md
A	.ufo/waves/round-62/w1/C2Bundle.md
```

**4. Q58 ordering command, round 63 (first ADD is the plan → PASS):**
```
$ git log --reverse --format='COMMIT %H' --name-status --diff-filter=A -- '.ufo/waves/round-63/plan.md' '.ufo/waves/round-63/w*' | head -8
COMMIT b38a2065ab8ac5b198f6569b9013d04411c3d40d

A	.ufo/waves/round-63/plan.md
```
Host clock agrees: `stat` → `plan.md 2026-10-25 17:47:12`, `w1.ready 17:53:08`, `w1.ready.dispatched 17:57:13`; `git show -s --format='%H %cI' b38a206` → `2026-10-25T17:47:33-03:00`.

**5. Q58 ordering arm shown able to fail** (scratch fixture `$D=/tmp/kumitate-r63/K63ScribeQuality/fix.AndH7F`, `git init -q`, `git -C "$D" rev-parse --show-toplevel` == `$D`):
```
COMMIT 11a183533db9cef015b03a97066d81a284d821dd wave first
A	.ufo/waves/round-9/w1/Seat.md
COMMIT 413e93d48ec7d6d64f8a1e0f7d8f6f0a25ce04d6 plan after
A	.ufo/waves/round-9/plan.md
```
First ADD is the wave file → the command fails exactly as Q58's `Fails when` says.

**6. Q59 gate selftest (verbatim tail):**
```
PASS dead-unnamed-in-report — INLINE_DISPATCH: DRIFT (seats=2 sessions=2 done=1 reports=2 dead=1) [DEAD_UNNAMED]
PASS dead-named-in-report — INLINE_DISPATCH: CLEAN (seats=2 sessions=2 done=1 reports=2 dead=1)
INLINE_DISPATCH_SELFTEST: PASS (25/25)
exit=0
```

**7. Two of the 14 committed controls, re-run with the probe's exact args:**
```
$ node scripts/inline-dispatch-evidence.mjs --root .ufo/waves/round-63/controls/inline/honest/lane --round 7 --wave w1 \
    --sessions-root .ufo/waves/round-63/controls/inline/honest/sessions --dispatcher-log .ufo/waves/round-63/controls/inline/honest/dispatcher.log
INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=3 reports=3 dead=0)
exit=0
$ node scripts/inline-dispatch-evidence.mjs --root .ufo/waves/round-63/controls/inline/forged-no-sessions/lane --round 7 --wave w1 \
    --sessions-root .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions --dispatcher-log .ufo/waves/round-63/controls/inline/forged-no-sessions/dispatcher.log
INLINE_DISPATCH: DRIFT (seats=3 sessions=0 done=0 reports=3 dead=0)
FINDING SESSION_ABSENT:K63AlphaOne
FINDING SESSION_ABSENT:K63BetaTwo
FINDING SESSION_ABSENT:K63GammaThree
FINDING NOT_A_DISPATCH
exit=1
```
`ls -d .ufo/waves/round-63/controls/inline/*/ | wc -l` → `14`; every `expect` names an exit code + finding id (`honest: 0 CLEAN`, `forged-no-sessions: 1 NOT_A_DISPATCH`, `session-id-dup: 1 SESSION_ID_DUP`, `reports-28-bytes: 1 REPORT_TINY`, `results-name-swap: 1 RESULTS_MISMATCH`, …).

**8. Real host records, two lines of the sweep re-run by me:**
```
$ node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kengaku-shokunin \
    --rev b662a5d6dd370491049e4206818373c61be44816 --round 35 --wave build
INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)
exit=0
$ node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/tameshi-shokunin --round 45 --wave w2
INLINE_DISPATCH: DRIFT (seats=36 sessions=35 done=35 reports=35 dead=0)
FINDING SESSION_FOREIGN:ScribeScorecard
exit=1
```
Both lines match `.ufo/waves/round-63/controls/inline-real-hosts.txt` byte-for-byte.

**9. Rev-mode at round 63's HEAD (the blocking gap):**
```
$ node scripts/inline-dispatch-evidence.mjs --root . --rev b38a2065ab8ac5b198f6569b9013d04411c3d40d --round 63 --wave w1
INLINE_DISPATCH: FAIL-CLOSED wave-absent ready=false dispatched=false wave=.ufo/waves/round-63/w1
FINDING WAVE_ABSENT
INLINE_DISPATCH: FAIL-CLOSED contract=kumitate-inline-dispatch-evidence-v1
exit=2
$ git cat-file -e b38a2065ab8ac5b198f6569b9013d04411c3d40d:.ufo/waves/round-63/w1.ready
fatal: path '.ufo/waves/round-63/w1.ready' exists on disk, but not in 'b38a2065ab8ac5b198f6569b9013d04411c3d40d'
exit=128
```

**10. Probe never passes `--report`:** `grep -c '\-\-report' .ufo/waves/round-63/probe/inline63-probe.mjs` → `0` (exit 1).

**11. Grounding anchors opened:** `considerthese/2026-10-25.md:64` = `3. **Audit seat deaths.** Parse each round's \`launcher-progress.tsv\` for non-zero exits and null sessions,`; `corpus/lessons/round-60-verifier-spotcheck.md:181` = `- **R60-V5 — the dispatch registry is not in the gate's schema.**`, `:186` = `- **R60-V6 — dead seats unreported.** 27/32 seats settled \`exit=-9 session=null\`,`.

**12. Draft shape:** `wc -l .ufo/waves/round-63/build/K63ScribeQuality/criteria.md` → `13` (two 6-line entries + one blank separator, ≤12 lines each); the only template token is `{{L1:command results}}` at `:5`.

## Findings

1. **K63ScribeQuality-1 — major (blocks C1's I2/I4 and Q59's command).** Round 63's wave markers are untracked at the measured revision: `git status --porcelain .ufo/waves/round-63/` lists `?? .ufo/waves/round-63/w1.ready`, `?? .ufo/waves/round-63/w1.ready.dispatched`, `?? .ufo/waves/round-63/w1-dispatch.json`, `?? .ufo/waves/round-63/w1-spec.json`, `?? .ufo/waves/round-63/w1/`. The gate's `--rev` mode requires both ready markers at that rev and fails closed (Evidence §9, exit 2 `WAVE_ABSENT`). L1 action before measuring: commit the two markers, the dispatch/spec/results JSON and `w1/`. Reproduce: Evidence §9.
2. **K63ScribeQuality-2 — minor (grounding gap, ratchet candidate).** No committed control exercises the `DEAD_UNNAMED` arm: all 14 cases are transcript/log/report faults, and the probe's I3 loop calls the gate without `--report` (`grep -c '\-\-report'` → 0), so the arm exists only in the selftest (Evidence §6). A `dead-unnamed` control plus a per-case report path would strengthen I3, but the probe is frozen — reported, not patched. Reproduce: `grep -c '\-\-report' .ufo/waves/round-63/probe/inline63-probe.mjs; for d in .ufo/waves/round-63/controls/inline/*/; do cat "$d/expect"; done`.
3. **K63ScribeQuality-3 — minor (Q59's report half is unbound by `--rev`).** `scripts/inline-dispatch-evidence.mjs:255` reads `readFileSync(reportFile)` from the filesystem, not `git show REV:path`, so a lane can point `--report` at any file containing the dead names. Q59's Command therefore names the fleet report path explicitly and Q59's Who-checks puts the committed-vs-named comparison on the non-author. Reproduce: `grep -n 'readFileSync(reportFile' scripts/inline-dispatch-evidence.mjs` → `255`.
4. **K63ScribeQuality-4 — minor (declared limit, Q58).** While `.ready` is untracked the ordering anchor degrades to the first committed wave file, so a plan committed after an untracked `.ready` but before any committed wave file passes. Stated in Q58's `Limit`; repaired by finding 1's commit, after which the marker itself is the anchor.

## Artifacts

- `.ufo/waves/round-63/build/K63ScribeQuality/criteria.md` — Q58 + Q59, append-only, house style, ready to land after `corpus/QUALITY.md:950`.
- `.ufo/waves/round-63/w1/K63ScribeQuality.md` — this report.
- `/tmp/kumitate-r63/K63ScribeQuality/fix.AndH7F` — scratch git fixture for Q58's ordering arm (outside the lane; nothing committed there but fixture commits).

## Limits

- I did not run `inline63-probe.mjs` or `topology63-probe.mjs`: the counting command is the L1's, not a scribe's, so no HELD/UNMET line is claimed here.
- I re-ran 2 of the 14 controls and 2 of the 18 lines of `controls/inline-real-hosts.txt`; the other 12 controls and 16 sweep lines are quoted from committed files, not executed by me.
- No wave in the real-host sweep has `dead>0`, so Q59's dead-name arm has no real-host demonstration — only the selftest cases (Evidence §6).
- Not checked: whether `plan.md`'s sentences match the counters' code (Q43/Q44/Q57's half, declared in Q58's `Limit`); whether the 14 controls' `expect` files each match their generator's intent beyond the two I ran; whether the fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-63/kumitate.md` will exist at close (it does not yet — `ls` shows no `kumitate.md`).
- No tool installed or upgraded (nothing needed). No lane/fleet file edited outside my build and report paths; no git index, jj, or `.ufo/state` mutation.
