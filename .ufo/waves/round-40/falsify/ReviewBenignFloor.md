RESULT ReviewBenignFloor rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=harmed clean_open=9/9 clean_cand=5/9 harmed=H3r,H4r,H7,H12

# ReviewBenignFloor (round 40, falsify): no-harm floor on the nine honest recipes

Scope: the nine honest recipes that read CLEAN at open f69817edf687c8ce4f87ed7953a353399232f69e (H0, H3r, H4r, H7, H8, H9, H10r, H12, H13), run at candidate 1530a75521345e0f4516ed7146180e65f788e017. "Sound mode" means the candidate run with `--open f69817edf687c8ce4f87ed7953a353399232f69e`, the mode the candidate's lesson says is required. Operability only.

## Findings, by severity

1. HIGH (operability). In sound mode four honest recipes are refused: H3r, H4r, H7, H12. Each was CLEAN at open and CLEAN in checklist mode. Each is refused by the open floor alone (BASE_TRUE_LOST, "(open floor)"), and that is the only finding in its run. Each changes the citation range of an anchor that was true at the open revision. The candidate documents that coordinates of a true anchor are fixed (SKILL.md 626-627) and lists the refusal as an open limit (lesson 138-141). The floors compare identity as raw@path#occurrence (anchor-truth.mjs 487-499), so any range change reads "anchor gone". The nested-range rule exists only for review binding (356-368), so the floors and the review binder treat the same kind of change differently.
2. MEDIUM (documentation). SKILL.md 626-627 says narrowing a base-true anchor "needs a new base, chosen in a round that records why". That route does not clear the candidate's open floor, because the open floor reads the open pin whatever --base is (line 731). Shown by the runs: at base e18ff1af the base floor is clean for all four (one finding each, the open-floor one), and the refusal stands.
3. MEDIUM (claim scope). The declared benign set (`.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt` 449-517: B01-no-edit, B02-prose-no-anchor, B03-new-true-anchor, B04-insert-earlier-anchor, B05-review-paragraph-rewrap, BEN_PROSE, BEN_REPAIR, BEN_INSERT_NOSHIFT, BEN_REKEY, BEN_UNCHECKED) has no in-place re-cite of an anchor true at open. So benign_clean=10/10 does not speak to this class.
4. LOW (message). Open-floor findings say "true at base" although the reference is the open revision. The text is reused from compareBase (anchor-truth.mjs 497-498, called at 529); only the "(open floor)" suffix tells them apart.
5. LOW (control label). H12 is labelled "a pair range that was not true at base". Under --open it is true at open, so it is not a control in sound mode.
6. Mitigation, not counted (see verdict). An additive re-anchor passes in sound mode: keep the open-true citation unchanged and add the narrower or wider citation as a new true anchor at the end of the note. 4/4 CLEAN.

Not part of the nine, unchanged: H1, H2, H5, H11 (narrowing base-true anchors) and H3, H4, H6, H10 (edits that do not re-state the reviews) are refused at open and at candidate. These are the intended refusals or the existing review rule.

## Verdict basis

The item's rule: a refusal is an operability harm unless the candidate gives an honest path, which must be stated and run. The candidate gives no path that performs these edits. Its documented route (finding 2) does not clear the refusal, and its stated rule (finding 1) fixes coordinates within a round. The additive route (finding 6) passes because the gate accepts new true knowledge (self-test AT42, anchor-truth.mjs 1137-1145), but it does not perform the re-cite: the superseded citation stays, and the new one sits in a different sentence. The honest intent is recorded, not realised. I count H3r, H4r, H7 and H12 as harmed. If the L1 accepts additive re-anchoring as the honest path for a re-cite, flip the verdict to held: those four are then exonerated, and the only remaining open harm is the documented limit.

## Evidence (commands and output)

E1 open f69817e, runner copy with no --open (the gate at f69817e has no --open option):
`node $S/open-rev/run-recipes.mjs --lane $S/lane --rev f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src`
`HONEST_CLEAN 9/17 skipped=0 rev=f69817edf687c8ce4f87ed7953a353399232f69e`; a rerun diffed against the seat's run-open.tsv is IDENTICAL.
E2 candidate, sound mode (runner copy with --open REV added to the re-pin and check argv):
`node $S/cand-open/run-recipes.mjs --lane $S/lane --rev 1530a75521345e0f4516ed7146180e65f788e017 --src /fast/scratch/hyaku/kumitate-pin/src --open f69817edf687c8ce4f87ed7953a353399232f69e`
`HONEST_CLEAN 5/17 skipped=0 open=f69817edf687c8ce4f87ed7953a353399232f69e rev=1530a75521345e0f4516ed7146180e65f788e017`
H3r pin_exit=0 check_exit=1: `TRUTH  BASE_TRUE_LOST  corpus/knowledge/route-probe-cluster.md#118  scripts/probe-ufo-route-health.mjs:1167@scripts/probe-ufo-route-health.mjs#0 true at base, anchor gone (open floor)`
H4r pin_exit=0 check_exit=1: `TRUTH  BASE_TRUE_LOST  corpus/knowledge/remaining-scripts-census.md#237  scripts/project-devin-subagents.mjs:247@scripts/project-devin-subagents.mjs#0 true at base, anchor gone (open floor)`
H7 pin_exit=0 check_exit=1: `TRUTH  BASE_TRUE_LOST  corpus/knowledge/remaining-scripts-census.md#63  :2848-2852@scripts/fleet-dispatcher.test.mjs#0 true at base, anchor gone (open floor)`
H12 pin_exit=0 check_exit=1: `TRUTH  BASE_TRUE_LOST  corpus/knowledge/remaining-scripts-census.md#156  :128-175@scripts/lean-cargo/bin/cargo-shim.sh#0 true at base, anchor gone (open floor)`
Each of the four verdict lines reads `TRUTH: DRIFT (1 findings: BASE_TRUE_LOST base=e18ff1af... open=f69817ed... src-rev=31c465f15669)`.
Clean in sound mode (check_exit=0): H0-prose, H8-debt-repair, H9-add-end, H10r-add-mid-reviews, H13-rekey. A rerun gave the same exit codes.
E3 candidate, checklist mode (no --open, same runner copy):
`node $S/cand-noopen/run-recipes.mjs --lane $S/lane --rev 1530a75521345e0f4516ed7146180e65f788e017 --src /fast/scratch/hyaku/kumitate-pin/src`
`HONEST_CLEAN 9/17 skipped=0 rev=1530a75521345e0f4516ed7146180e65f788e017` (the same nine rows CLEAN; the pin step prints one TRUTH_WARN line).
E4 additive honest path, sound mode (honest/recipes.json: one appended sentence per refused edit; no existing citation changed):
`node $S/honest/run-recipes.mjs --lane $S/lane --rev 1530a75521345e0f4516ed7146180e65f788e017 --src /fast/scratch/hyaku/kumitate-pin/src --open f69817edf687c8ce4f87ed7953a353399232f69e`
HP-H3r-keep-add: "The sweep-integrity field reads `sessionRemoved` (`scripts/probe-ufo-route-health.mjs:1166-1167`)." (line 1166 holds sessionRemoved)
HP-H4r-keep-add: "The canonical card check is `existsSync` (`scripts/project-devin-subagents.mjs:246-247`)." (line 246 holds existsSync)
HP-H7-keep-add: "The verdict line lists `failing` checks (`scripts/fleet-dispatcher.test.mjs:2849-2852`)." (line 2849 holds failing)
HP-H12-keep-add: "The frozen digest is `lean_frozen_cache_digest` (`scripts/lean-cargo/bin/cargo-shim.sh:128-137`)." (line 128 defines it)
Each: `check_exit=0 TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af... open=f69817ed... src-rev=31c465f15669)`; `HONEST_CLEAN 4/4 skipped=0 open=f69817ed... rev=1530a755...`. An earlier honest batch ran without --open because I copied the wrong runner file; it is discarded and these are the re-run numbers.
E5 runner change (the only edit to my copy; `cmp` shows the open-rev copy is identical to the seat's run-recipes.mjs and recipes.json):
`+const open = opt('--open', null);` / `+      if (open) pa.push('--open', open);`
`-    const c = sh('node', ['scripts/anchor-truth.mjs', '--base', base, '--src', src], wt);`
`+    const c = sh('node', ['scripts/anchor-truth.mjs', '--base', base, '--src', src, ...(open ? ['--open', open] : [])], wt);`
E6 gate code at 1530a75 (scripts/anchor-truth.mjs): line 720 compareBase when --base is set; line 731 compareOpen, with the open pin read by `git show <open>:<pin path>` (726-728); line 529 compareOpen runs compareBase against the open pin and tags "(open floor)"; lines 487-499 identity is raw@path#occurrence; lines 356-368 nested-range rule applies only to review binding; lines 1137-1145 self-test AT42 "an honest new true anchor stays CLEAN against --open".
E7 candidate's own text: lesson 138-141 "Honest re-cites of anchors true at open are refused under `--open`."; SKILL.md 626-627 "Under the floor a base-true anchor's coordinates are fixed: narrowing or moving one needs a new base, chosen in a round that records why."; SKILL.md 650 "Open limits: honest narrowing or widening of a range true at REV is refused under `--open`".
E8 pin source: `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7.

## Residual risk and verification gaps

- Not run: an honest re-cite of a still-false debt anchor. The identity there is DEBT_NEW (anchor-truth.mjs 537-544), so an honest correction that stays false may also be refused. Outside the nine; untested.
- Not run: other honest classes (anchor moves across notes; additions before reviewed anchors without reviewsShift).
- The benign claim (10/10) must not be read as covering re-cites.
- Not run: selftest, cite-check, proxy-check, kimi-census (outside this item).
- One run per configuration, plus a rerun of the open run and the candidate sound run; the outputs matched.

## Environment and lane touches

- Clone at /fast/scratch/hyaku/kumitate-r40/seats/ReviewBenignFloor/lane, detached at 1530a75. Git 2.56.0, Node v24.21.0. No installs or upgrades (RULES.md read).
- Lane: read-only use, plus one `git status --short` run without --no-optional-locks at the start; that can refresh the lane index's stat cache (no content change). Later lane reads used --no-optional-locks, show, ls-tree or rev-parse. This report is the only file I wrote in the lane; falsify/ already held other seats' files, which I left alone.
- xd://report_issue: one entry (grep omits scripts/anchor-truth.mjs from directory search).
- No background jobs left running.
