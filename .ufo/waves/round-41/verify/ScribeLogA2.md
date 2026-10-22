RESULT ScribeLogA2 rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=drafted lines=14

Draft for the L1 to append to `LOG.md` after the existing round-41 entry (14 lines; `LOG.md` itself
untouched, nothing else in the lane written by this seat):

- 2026-10-22 — round 41, attempt 2 (commit `fae386aa` on lane `master`). Attempt 1 died in an
  omp process restart at 17:26Z; attempt 2 re-verified and committed its uncommitted leftovers
  path by path: three `scripts/wave-census.mjs` repairs (a `Report:` path holding a `..`
  segment is absent, never resolved outside the round; a task without a string name and
  agent fails closed; a read error exits 2, not 1), the S018 re-open in
  `corpus/SOURCES.md` (`queued` → `mined`, used-by `corpus/lessons/round-41.md`), wording in
  `SKILL.md`, `corpus/README.md` and `corpus/lessons/round-41.md`, and 8 falsify reports.
  Attempt 2 added one selftest case per repair (WC21–WC23; selftest 20 → 23/23), each failing
  when its repair is reverted (3/3 killed, `.ufo/waves/round-41/final/a2-census-repair-mutants.txt`);
  updated the `SCORECARD.md` `wave-census` row; moved the misrooted falsify report
  `ReviewCensusCode.md` byte-exact from the fleet root into the lane (sha256 `778a35ee…3983`,
  `cmp` equal, fleet copy deleted); and added two `## Mistakes` rows to the lesson (misroot,
  untested repair). Tip receipts: `cite-mutants-final-fae386aa.txt` `survived=0/16`,
  `wave-recount-final.txt` `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`.

Evidence (all read-only, lane at /home/vgpnk/Projects/shokunin/kumitate-shokunin):
$ git log -1 fae386aa → "round-41: attempt 2 - inherited attempt-1 leftovers committed … WC21-WC23
  pinning them (23/23, 3/3 revert mutants killed); misrooted ReviewCensusCode.md moved in; Mistakes rows"
$ git show --stat fae386aa → 16 files, 851+/12-; git diff --name-status 5320e0d fae386aa → 9 falsify
  adds (8 reports + moved ReviewCensusCode.md), final/a2-census-repair-mutants.txt added, M on
  SCORECARD.md SKILL.md corpus/README.md corpus/SOURCES.md corpus/lessons/round-41.md scripts/wave-census.mjs
$ git show fae386aa:scripts/wave-census.mjs | grep -n "check('WC2[123]" → WC21 :363, WC22 :369,
  WC23 :374; 23 `check('WC` cases total at the rev
$ cat .ufo/waves/round-41/final/a2-census-repair-mutants.txt → CONTROL exit=0 "23/23 pass VERDICT: PASS";
  MUTANT dotdot-guard-dropped killed, string-agent-check-dropped killed, read-error-rethrown killed
$ sha256sum .ufo/waves/round-41/falsify/ReviewCensusCode.md → 778a35eec329296893fc9ed5ac6be0c9dbe4
  0df3901132607bbfb93e1b2f3983; `ls /home/vgpnk/Projects/shokunin/.ufo/waves/round-41/` → no such directory
$ git show fae386aa -- corpus/SOURCES.md → S018 row: `queued` → `mined`, used-by `—` →
  `corpus/lessons/round-41.md`
$ tail -1 .ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt → CITE_MUTANTS survived=0/16
  nomatch=0 crash=0 control=PASS rev=fae386aa…; wave-recount-final.txt → RECOUNT_MISMATCHES=0
  CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0

Caveats: the inherited set per the commit message and the lesson's `untested repair` row is the 5
attempt-1 paths (`scripts/wave-census.mjs`, `corpus/SOURCES.md`, `SKILL.md`, `corpus/README.md`,
`corpus/lessons/round-41.md`); `SCORECARD.md` groups with attempt 2's own additions. The two tip
receipts are untracked in the lane working tree, not in `fae386aa`. No tools installed.
