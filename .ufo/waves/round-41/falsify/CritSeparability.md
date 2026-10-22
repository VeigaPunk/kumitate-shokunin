RESULT CritSeparability rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=merge separable=yes
Finding: C1 and C2 are causally separable, but they are not on distinct axes. C2's only measured axis movement is the operability proxy (A 8 to 9, C 15 to 17, f_O 23/26 to 26/29, integer held at 8), and operability is C1's axis. Under AXES.md line 32 ("two claims on one axis in one round count as one claim") and PROTOCOL.md line 509 ("each an axis-move on a distinct axis"), a closure merges them into one operability claim plus the `wave-census` capability row. Round 34 sets the precedent: its SCORECARD row reads "operability (f_O walk; integer held) + capability `sources-registry`".
Setup: own clone at /fast/scratch/hyaku/kumitate-r41/seats/CritSeparability/lane. The C1-only revision is 68db3419. I also made a scratch commit, 6fae29a3 ("C2 only"): it is 4e58bb0 with scripts/cite-check.mjs and its pin.cite-check line restored to a58b7f72, giving `git diff --stat 4e58bb0 6fae29a`: SCORECARD.md 1 line, scripts/cite-check.mjs -93.
Evidence 1, C1 counter. Command: `node --input-type=module - --lane lane --rev <r> < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`
  a58b7f72 (neither claim): `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS` (64/64 cases)
  68db341 (C1 only): `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS` (75/75 cases, 16 killed)
  6fae29a (C2 only): `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS` (C2 alone does not move C1's counter)
  4e58bb0 (both): `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS`
  scripts/cite-check.mjs has sha256 b6c57848… at both 68db341 and 4e58bb0 (`git diff --stat 68db341 4e58bb0 -- scripts/` touches only wave-census.mjs), so C2 never edited C1's file.
Evidence 2, C2 counter. Command: `bash <lane>/.ufo/waves/round-41/probe/wave-recount.sh.txt`, run from each worktree root
  68db341 (C1 only): `RECOUNT_MISMATCHES=7 CAPABILITY_ROWS=1 EXPECT_4_EXIT=1 EXPECT_3_EXIT=1`
  2759297: `RECOUNT_MISMATCHES=7 CAPABILITY_ROWS=1 EXPECT_4_EXIT=1 EXPECT_3_EXIT=1` (the lesson's "before")
  6fae29a (C2 without C1): `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`
  4e58bb0 (both): `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`
  scripts/wave-census.mjs imports only node:fs, node:child_process, node:os, node:path and node:url (`rg -n import`). It does not read or run cite-check.
Evidence 3, shared stanza. Command: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src`
  68db341: `PROXY: MATCH (A=8 C=15 operability=8; C1=19/19 C2=91/91 coverage=10; … pins=6 match)` exit 0
  6fae29a: `PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=92/92 coverage=10; … pins=6 match)` exit 0
  4e58bb0: `PROXY: MATCH (A=9 C=17 operability=8; … pins=6 match)` exit 0. Each claim keeps the proxy at MATCH without the other.
Evidence 4, checklist. Command: `node scripts/surface-probe.mjs --checklists` (in scratch worktrees)
  68db341: `CHECKLIST: 12/15 pass`. 6fae29a: `CHECKLIST: 14/17 pass`, and items 16 and 17 (wave census, wave-census suite) PASS exit 0 without C1.
  The same three items fail at both revisions for causes outside both claims. Two are round-gate items that exit 2 because the worktree has no reports directory (`REPORTS_DIR_MISSING: --reports-dir …/seats/CritSeparability/.ufo/reports is absent`). The third is the Kimi census, the host drift the lesson already records.
Evidence 5, the axis. Score formula: f_O=(A+C)/(A+C+3); score=floor(10×f_O) (python: 8,15→0.8846→8; 9,17→0.8966→8).
  C1 moves neither A nor C. Its operability evidence is its own mutant counter.
  C2 moves A (+1, scripts/wave-census.mjs) and C (+2, SKILL.md checklist items 16–17), both of which are operability terms.
  C2 moves no coverage sub-axis: S=88/88, R=92/92 and K=52/52 are unchanged at 4e58bb0. The coverage C2 term moved 91 to 92 only because of the `lessons/round-41.md` README row, which documents both claims and is not the instrument.
  Neither plan.md ("## C2 — capability `wave-census`") nor corpus/lessons/round-41.md ("**C2 capability `wave-census`.**") names an axis or a per-axis verdict for C2. AXES.md lines 40–41 require one: "it still lands a per-axis verdict, with the claim type recorded". 4e58bb0 has no round-41 claim table in SCORECARD.md (`grep -n 'round 41'` finds only the capability row).
  Precedent: rounds 34, 38 and 40 each paired operability with a different axis (34: coverage:kimi-layer; 38: coverage:script-layer; 40: coverage:kimi-layer). In round 41 both claims land on operability and no second axis moves.
Counterexample: write C2's per-axis verdict honestly and it reads "operability: f_O 23/26 → 26/29, integer held 8", the same axis as C1. By the distinct-axis rule the round then counts one claim, not two.
Impacted axes: operability (claim count and attribution only). The admission outcome is unchanged: both counters verify independently and the proxy reads MATCH at every revision.
Fixable defect, not a tradeoff: the claims are causally independent and no axis is harmed. Only the round report's claim count and the missing C2 axis verdict are wrong.
Smallest safe correction: in the round-41 claim table, record a single operability row in the round-34 shape. Its row name is "operability (C1 cite-check 15/16 → 0/16; f_O walk 23/26 → 26/29, integer held 8) + capability `wave-census`". Keep both counters as that row's before→after evidence. Do not report two distinct-axis claims. No code change.
Side note, outside separability: proxy-check at 4e58bb0 adds a third warning, `PIN_UNPINNED scripts/wave-census.mjs`, the same class as the existing anchor-truth and sources-check warnings.
Tools: none installed or updated. Scratch: /fast/scratch/hyaku/kumitate-r41/seats/CritSeparability/ (clone, worktrees, scratch commit 6fae29a; nothing pushed). I wrote no patch.
