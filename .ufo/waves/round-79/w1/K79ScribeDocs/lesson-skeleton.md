author: kumitate L1
round: 79

# Round 79 — both K factors retained; report evidence paths become mechanically checkable

Integration skeleton for corpus/lessons/round-79.md. This text records source/control provenance and intended acceptance, not an assertion that final code or close runs landed. L1 supplies the actual measured commit <M> and resolving close receipts.

## Gate

| source | located quote | admission / use |
|---|---|---|
| S229 — GNU grep manual, §2.3 Exit Status, opened by L1 2026-11-04; https://www.gnu.org/software/grep/manual/grep.html | “Normally the exit status is 0 if a line is selected, 1 if no lines were selected, and 2 if an error occurred.” Capture `.ufo/waves/round-79/build/L1/captures/grep-manual.html:1208-1209` | Admit as a primary precedent for separating a negative result from an execution error. Grounds report-evidence-pointers; does not prescribe this lane's exact statuses. Capture inspected locally by the scribe; live HTTP outcome inherited from plan, not fetched again. |
| S230 — scikit-learn fbeta_score, opened by L1 2026-11-04; https://scikit-learn.org/stable/modules/generated/sklearn.metrics.fbeta_score.html | “The F-beta score is the weighted harmonic mean of precision and recall, reaching its optimal value at 1 and its worst value at 0.” Capture `.ufo/waves/round-79/build/L1/captures/sklearn-fbeta.html:1369-1370` | Admit for retaining two measured factors in aggregation. The K product is a lane design, not the documented F-beta formula. Grounds composite-score-compensability with S231. |
| S231 — own-work r78 harm counterexample, recorded at 94ab4065 | “the base score moves 10 → 9 on a documentation loss; the patched score stays 10 unless the census reports a finding” in `.ufo/waves/round-78/close/harm-counterexample.txt:19`; measured output at lines 14 and 17 | Admit as a located own-work counterexample, not independent external authority. Grounds the de-named-heading discrimination required by C1. |

Admit/reject pair: admit the located S229/S230 primary-source passages for the bounded contract/design precedents above; reject bulk admission of merge/kumitate without per-entry reopening and provenance, per the carried proportionality rule. The scribe did not remeasure that package; L1 must cite the actual reject observation or explicitly label it carried and unremeasured. Assimilation: none proposed by these drafts.

Spot-check slot: L1 records a named non-author, exact located source quote checked, observed agreement/disagreement, date and committed receipt. No spot-check is asserted by this skeleton.

## Mistakes

| class | evidence | captured-by | fix / shown able to fail |
|---|---|---|---|
| Misrooted counter default: r78 probes' DEFAULT_LANE is one segment short | r78 lesson lines 84–85 and r79 frozen plan routed repair 3; r79 probe79-c1 lines 26–28 explicitly document `.ufo` versus lane | The counter's own --lane arm: compare its implicit default with the explicit lane invocation; L1 supplies a persisted receipt over the historical r78 probe, including cwd/argv/exit | Four-level resolve from the probe directory, resolve(dirname(SELF), '..', '..', '..', '..'); leave r78 historical bytes unchanged. L1 must show the r78 default invocation failing against the explicit --lane arm and cite that receipt before calling the repair demonstrated. |

## Counters

| counter | before / provenance | close at <M> | evidence to bind |
|---|---|---|---|
| C1 frozen arms | 7/11, exit 1 (committed base control) | Acceptance: 11/11, exit 0; actual result supplied by L1 | `.ufo/waves/round-79/controls/c1-base.txt`; close/c1-*.txt |
| C2 frozen arms | 9/12, exit 1 (frozen predicate says sub-total exits 1; base receipt records tally but no separate trailing exit line) | Acceptance: 12/12, exit 0; actual result supplied by L1 | `.ufo/waves/round-79/controls/c2-base.txt`; close/c2-*.txt |
| K terms / discriminating heading | base de-named heading: 54/55, coverage 10 | Acceptance: clean 55/55, findings 0 → 10; heading loss → 9; finding alone → 9; both → 9 | C1 close receipt, proxy JSON, strict run |
| General dead pointers on r78 report | base POINTER_DEAD count 0 (other legacy findings present) | Acceptance: at least ten POINTER_DEAD lines, including close/proxy-json.txt | C2 close receipt and actual v4 r78 diagnostic |
| proxy / corpus map / checklist / census | round-open receipts; do not transpose r78 pre-final counts | L1 copies final verdicts, terms, counts and exits verbatim | `.ufo/waves/round-79/open/`; actual close gate receipt |

## Limits

- No final counter or gate was executed by this text-only seat; acceptance strings are requirements, never observed close outcomes.
- A resolving pointer proves existence, not honest interpretation. v4's extension/token grammar intentionally excludes nonmatching spans; it is not an arbitrary natural-language reference resolver.
- Revision mode cannot use an outside-lane report-directory file as evidence; membership is in the selected lane git tree. Report bytes themselves are the input report, not automatically historical bytes.
- The K census remains one authority; a census bug can affect the score. Composite multiplication and flooring can mask small additional losses after the first integer drop; both factors being present is separately checked.
- Source S230 documents a weighted harmonic mean, not this product; S231 is own-work. No source or count-only probe replaces semantic review or the canonical Rust judge.
- Final gate status, harms, survivors, dispatch settlement, routed-owner commitments and stale-lane judgment belong to actual L1 receipts, not this skeleton.
