RESULT AtkRebreakTrade rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=refused accepted=0/5 variant=accepted
Scope. accepted=0/5 counts the sound form (`--open f69817ed`). In the checklist form (without `--open`) the candidate accepts all 5 named attacks.
Setup. Own clone /fast/scratch/hyaku/kumitate-r40/seats/AtkRebreakTrade/lane; driver replay.mjs and variant.mjs live in the same seat directory. Case edits are copied verbatim from CritC1Design/drive.mjs. Each case does an honest fresh re-pin with that revision's OWN gate (`node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-pin/src --write-pin --pin .ufo/pins/fresh.json --reviews <committed round-38 records> --notes <4 notes>`, renamed over the pin), commits in scratch, then runs:
  checklist: node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src
  sound:     node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --open f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src
Refusal rule: exit 1 AND a finding whose id is an attacked entry (note#ord). Logs: run-cand.txt, run-open.txt, run-variant-cand.txt, run-variant-open.txt, results-*.json. No tools installed or updated.
Control of the setup: CTRL (no edit) re-pins to the identical pin at both revisions (attacked=0) and reads `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 ...)` exit 0 in every form.

Candidate 1530a755 (case commit, checklist form, sound form with --open):
  ATK_REBREAK    1735c6971691  exit=0 CLEAN  | exit=1 DRIFT, at entry S8#180: BASE_TRUE_LOST `scripts/local-helper.mjs:135@scripts/local-helper.mjs#0 true at base, debt:false now (open floor)` and DEBT_NEW
  ATK_RELOCATE2  667a533de7f3  exit=0 CLEAN  | exit=1 DRIFT, at entry S8#179: BASE_TRUE_LOST (open floor) and DEBT_NEW `:135@...#0 debt:false now, no equal debt anchor at the open revision`
  ATK_TRADE      6de7f9d17fc7  exit=0 CLEAN  | exit=1 DRIFT (1 finding), at entry S8#90: DEBT_NEW `scripts/fleet-ledger-read.mjs:498@scripts/fleet-ledger-read.mjs#0 debt:false now, ...`
  ATK_SLOTS_ALL  bff0938f6909  exit=0 CLEAN (anchors=999 debt=208) | exit=1 DRIFT (192 findings), 188/188 appended entries carry DEBT_NEW, plus 4 per-note DEBT_GREW (S8 debt 4 -> 77 open floor)
  ATK_FRESH      8c16dda86962  exit=0 CLEAN (debt=25) | exit=1 DRIFT (6 findings), 5/5 appended entries S8#521-#525 carry DEBT_NEW
  Sound form: 5/5 refused, 0/5 accepted. Checklist form: 5/5 accepted (exit 0 CLEAN, plus one TRUTH_WARN line saying records are read at HEAD).
Control f69817ed (the open revision's own gate):
  All 5 cases: checklist form exit=0 `TRUTH: CLEAN`. All 5 attacks are accepted at open, as CritC1Design reported.
  Sound form: exit=64 `anchor-truth: unknown argument --open` (usage error, invalid run, not a refusal).

Variant VAR_REBREAK_REVIEWED (rebreak intent, dodges BASE_TRUE_LOST and DEBT_NEW): ACCEPTED at the candidate with --open.
  Target: S8#269 `:2106` in scripts/sync-ufo-contracts.mjs is true at open. Its paired symbol is `report.validationErrors`, and the committed round-38 record is {seat Prose03, token validationErrors}.
  Edit (one line in corpus/knowledge/remaining-scripts-census.md, pin unchanged by the honest re-pin; diff stat: 1 file, 1 insertion, 1 deletion):
    `report.validationErrors` (`:2106`, `:2132`)  ->  `report.errorCodes` (`:2106`) and to `report.validationErrors` (`:2132`)
  `git -C /fast/scratch/hyaku/kumitate-pin/src grep -n -w errorCodes 31c465f1 -- scripts/sync-ufo-contracts.mjs` exit=1: there is no such symbol. Line 2106 reads `validationErrors: [...partial.validationErrors, message],`. The same paragraph also says there is no error-code taxonomy.
  parseNote at case commit 59fd88a2a9f9: `parsed #269 :2106 paired=report.errorCodes`. The pin entry is still `token=validationErrors source=review:Prose03 expect=true`.
  Candidate, case commit 59fd88a2a9f9, sound command above: `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... open=f69817ed... src-rev=31c465f15669)` exit=0. The checklist form also reads exit=0 CLEAN. At f69817ed (case 1d934e8d0d43) the checklist form reads exit=0 CLEAN, so this hole predates the round.
  Why it passes: for a `review:` source, checkNote and overrideValid judge only the review token (it is on the line and still in the paragraph). TOKEN_FORGED compares the paired symbol only for `pair` sources, and the open floor compares identity, token and expect. Nothing compares the note's current paired symbol with the symbol that was reviewed. All 138 review-sourced entries are exposed (137 have token != paired). Re-pinning is not needed, because the attack is a prose-only edit.

Impacted axis: operability, meaning C1's "refuses named attacks" holds only with --open. Pre-existing: the review-token rebreak path.
Smallest safe correction (fixable defect, not a tradeoff):
  (1) For each review-sourced entry, the --open floor reads the note at the open revision and compares the current paired symbol (parseNote sym) with the open paired symbol at the same identity. If they differ, the entry reads REVIEW_STALE (or REVIEW_UNBOUND) unless the new paired symbol itself judges true. Add a fixture: an AT case where a reviewed anchor's paired symbol is changed to an absent symbol must read exit 1 with --open.
  (2) The checklist command must carry `--open <round-open rev>`. Without it, all 5 named attacks read exit 0 CLEAN at the candidate.
