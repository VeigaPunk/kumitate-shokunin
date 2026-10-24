# CritC2 — C2 substance, novelty, and source-tier attack

## Scope and axes

Read-only critic review of round 52 C2. Axes: **coverage/expansion** (genuinely uncovered ground), **depth/quality** (actionable clock-validation distinctions), **calibration/discernment** (honest tiers and evidentiary limits), and **operability** (what D52 actually establishes). This is an advisory critique, not a canonical judgment or admission.

**Recommendation:** C2 is *plausible new ground, not established merely by a new filename or D52 HELD*. The parser-boundary/TZ lesson is materially distinct from the existing invocation-attestation design. Repeating its ordering/window clauses, padding receipt-bound bullets, or listing an unused S103 would not establish expansion. Do not represent the frozen D52 predicate as a semantic-substance test.

## (a) New ground versus re-expression

**Counterexample to the broad novelty claim.** A new file that restates monotonic ordering, the wall-window tolerance, and the author-attested temporal ceiling adds no uncovered surface: `corpus/knowledge/invocation-attestation.md:28` already covers CLOCK_MONOTONIC, wall-window checks, measured re-dates, and the exact −60,000/+60,073 ms tolerance; `:37` explicitly retains Q39's ceiling. `corpus/QUALITY.md:754-772` already requires parseable UTC timestamps, distinct captured receipts, a frozen span, and honest disclosure that author-attested records are not cryptographic timestamps. The coverage map already indexes that entry at `corpus/README.md:151`. Filename absence at base is not semantic absence.

**Strongest local distinction that survives that attack.** Existing v1 code checks a lexical ISO shape (`scripts/receipt-attest.mjs:113,145-146`), then parses wall fields and checks only `endMs < startMs` (`:338-345`). Its later window guard tests finite **prelude** time, not finite wall-field times (`:379-391`). [INFERENCE, static control flow; not executed here] a regex-shaped invalid wall value that parses to NaN makes both ordering and window comparisons fail open. Separately, a finite normalized calendar rollover is not excluded by a mere successful parse. Neither round-trip identity nor missing-zone JavaScript parse semantics is taught in invocation-attestation/Q39. Those are a defensible, narrow new **parser acceptance boundary**, not a new temporal-proof mechanism.

**Smallest safe correction.** State the novelty delta explicitly: grammar is not calendar validity; parse success is not canonical byte identity; NaN must be rejected before comparisons; a missing offset on a JavaScript date-time string makes interpretation host-local. Cross-reference the old ordering/window/Q39 material as inherited context instead of counting it as new ground. Keep one authority for the unchanged attestation design. Map the new README row to these newly covered edge classes. Preserve Q39's ceiling verbatim in meaning. The canonical corpus contract says expansion is knowledge on uncovered map ground, not row counts (`CORPUS.md:123-125`); `LEARNING.md:33` uses the same standard.

## (b) S103: substantive companion or filler?

At inspection, the target `corpus/knowledge/fail-closed-clock-validation.md`, the ScribeEntry draft, and ScribeSources draft did not yet exist; `corpus/SOURCES.md:113-114` ended its registry with S100/S101. This is a dependency observation, **not a claim that later integration failed**. The frozen plan and actual opened companion bytes were reviewable.

ScoutCompanion selected [MDN Date.parse — Using Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#using_date.parse). Its saved HTML at `.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html:1760-1767` distinguishes date-only input (UTC) from date-and-time input without a zone (system-local time). This is independent of RFC 3339's requirement to state an offset: RFC grammar alone does not specify how JavaScript interprets a nonconforming string. I independently opened the primary [ECMAScript Date.parse specification, §21.4.3.2](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse), which expressly confirms that distinction.

**The load-bearing S103 clause must be:** “When the UTC offset is absent, JavaScript date-time forms are interpreted as local time, whereas date-only forms are interpreted as UTC; therefore a verifier must reject the zone-less date-time prelude before host-local parsing can influence its verdict.” Attach the R52-8 case-study/TZ observation to that consequence. A statement only saying “timestamps should have zones,” or a source ID appearing only in the header, leaves S103 filler.

For actual Node behavior, cite a captured host/runtime-specific observation, not MDN's browser table as a Node execution receipt. MDN itself warns that its nonstandard-date examples are implementation-specific (`:1786-1792`); its `2014-02-30` example demonstrates rollover variability (`:1870-1877`), not a universal parser guarantee.

**Smallest safe correction.** Use the selected S103 directly in the above distinct explanatory clause and in its source row's scoped `teaches`; retain the date-only/date-time distinction. Two sources can be substantive when they carry different obligations. Source count alone proves nothing. MDN is reasonably **tier B, docs, for secondary explanation of ECMAScript behavior**; do not inflate it to primary authority for Node runtime behavior. A primary ECMA citation can strengthen the explanation, but no source substitution or row creation was performed by this seat.

## (c) D52 has a hollow-clause route; ten is below its floor

**Static counterexample.** For any existing correctly hashed receipt binding R, twelve identical lines of the form `- The probe exists (R).` satisfy E2's structural requirements. Ten such lines alone do **not**: this round's floor is twelve, unlike Q38's older ten-clause example.

Evidence: `.ufo/waves/round-52/probe/doctrine52-probe.mjs:81-95` counts all lines beginning `- `, extracts only the first receipt token from each matching line, and checks path existence/blob hash. It neither deduplicates clauses or bindings nor checks whether receipt content entails the sentence. The twelve repetitions produce `clauses=12`, `bound=12`, `hash-miss=0` by inspection. After twelve valid bindings, additional unbound clauses are also ignored. Receipt paths are unrestricted, although Q38's field rule specifies frozen round-directory paths (`corpus/QUALITY.md:734-735`).

E1 merely recognizes the provenance tokens (`doctrine52-probe.mjs:74-78`); E3 checks mined/used-by row cells (`:98-109`). The source checker inspects headers, registered IDs, and used-by reciprocity, not body entailment (`scripts/sources-check.mjs:354-390`). E5 is a live census, not a reading of the candidate entry (`doctrine52-probe.mjs:117-122`). Thus, with the other checks held, meaningless repeated prose can satisfy the measured predicate. This is a static demonstration of E2's logic, **not an executed mutant or a claimed 5/5 run**. The existing base receipt only proves absence gives 0/5 (`base/doctrine52-base.txt:1`).

**Important boundary:** Q38 already explicitly says “the probe checks binding, not truth” and assigns truth to a non-author reread (`corpus/QUALITY.md:731-733,747-749`). The weakness is not a newly discovered promise that the frozen counter made; the invalid inference is treating this structural result as sufficient proof of substance. Unique hashes alone would not repair semantic entailment either.

**Smallest safe correction.** Keep the frozen counter unchanged in this review. Require a clause-to-evidence semantic reread that names the source-backed new lesson and verifies each factual claim against the cited immutable evidence. Remove padding; bind every factual clause, use frozen-round evidence paths, and do not cite a plan/probe declaration as proof that an experiment ran. If the integrator elects to strengthen D52, that must be a named, versioned freeze amendment with the required fresh base receipts—not a silent semantic redefinition. A report claiming “D52 forces substance” must be corrected even if D52 later reads HELD.

## (d) RFC 3339 tier A is defensible, but narrowly scoped

The canonical tier rule is scoped authority, not global prestige (`CORPUS.md:93-100`). [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) is the primary specification for its timestamp profile, so S102 tier A is defensible for **§5.6 grammar, §5.7 calendar restrictions, and §4 local-offset semantics**. It is not tier-A evidence for JavaScript Date.parse normalization, NaN handling, Node TZ behavior, or the lane's chosen exact-byte serialization.

**Counterexample to overbroad attribution.** RFC §5.6 allows numeric offsets, optional fractional seconds of one-or-more digits, and lowercase `t`/`z`; §5.7 permits specified leap-second `60` values. The lane's `YYYY-MM-DDTHH:mm:ss.sssZ` plus `Date.parse`/`toISOString` identity rule is a deliberately narrower acceptance profile. Examples such as RFC-valid `1985-04-12T23:20:50.52Z` and `1996-12-19T16:39:57-08:00` fail that exact lane shape. Local opened RFC evidence: `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt:399-431,455-498,511-534`.

**Smallest safe correction.** Describe the instrument as accepting a strict canonical UTC/millisecond subset informed by RFC 3339, not as a full RFC 3339 validator. Attribute finite checks and exact round trips to the local v2 policy and language/runtime evidence. Restrict S102's scope/teaches to what the RFC actually says. Do not widen acceptance to all RFC-valid forms merely to fit the source label: that would change the frozen C1 shape contract and could harm byte-canonical identity.

## Required changes / disposition for the canonical judge

1. Make parser-boundary/TZ-independence the explicit new coverage delta; mark ordering/window/temporal ceiling inherited.
2. Make S103 carry the precise absent-offset date-time-versus-date-only semantic clause and link the case-study evidence; use honest scoped tiers (RFC A; MDN B for this scope).
3. Label v2 a strict RFC-informed subset; never attribute its exact canonical bytes or runtime behavior to RFC 3339 itself.
4. Perform and record substantive clause-to-evidence review; do not claim D52's binding/count predicate establishes novelty or truth. Use immutable round evidence and finish real receipt bindings before claiming the final entry exists/admitted.

These are fixable content/evidence defects, not a reason to abandon clock-validation research. If only a renamed repetition or hollow bound bullets remain, coverage expansion is unsupported; trading that for improved C1 operability does not satisfy the distinct-axis claim. Final admission belongs to the canonical Rust judge, not this critic.

## Evidence discipline

Read-only source/probe inspection and primary-source reading only. No counter, test, build, formatter, judge, or other runtime was invoked; no lane content was edited. Only this assigned report was written. No tools installed or updated. Missing draft/final-entry/source-row dependencies were recorded rather than waited on. Peer messages were used only to identify the opened S103 and communicate bounded corrections; peer assertions were not substituted for source bytes.

Report: .ufo/waves/round-52/w1/CritC2.md

## Addendum — draft arrived after the initial review

The scribe subsequently supplied `.ufo/waves/round-52/build/ScribeEntry/fail-closed-clock-validation.md` (the inspected snapshot has 176 displayed content lines). I read that draft and `build/ScribeEntry/clock-sweep.txt`; I did not run them. This supersedes the earlier missing-draft dependency, not the observation that the final admitted path/source rows had not been available.

**Resolved in the actual draft:** lines 10-16 explicitly distinguish new parser/environment boundaries from round 51's existing material; lines 25-33 make S103 independently load-bearing and tier B; lines 35-46 label the format a strict RFC 3339 subset. Therefore the actual explanatory core is **not merely a re-expression**, and the selected S103 is **not filler as now used**. Those corrections preserve the frozen shape instead of trading away byte canonicality.

**Concrete remaining semantic defect, stronger than the hypothetical hollow-clause attack:** draft line 126 says “an identical record under a distinct nonce is a byte replay, flagged in both directions,” yet binds the r51 CritLedger report. The cited report actually establishes **same nonce plus different digest** (`.ufo/waves/round-51/w2/CritLedger.md:11,15-20,74-89`), and the implementation condition is exactly `state.nonce === record.nonce && state.digest !== record.digest` (`scripts/receipt-attest.mjs:371-375`). Altering the nonce also alters the semantic record and its digest; it cannot be called byte-identical. This is an existing, correctly hash-bound receipt contradicting its clause—the Q38 limitation manifested in real candidate prose. Impact: depth/quality and calibration, not a reason to alter ledger behavior. **Smallest correction:** remove this unrelated ledger bullet from the clock entry, or state the actual same-nonce/different-digest rule and duplicate exemption. Do not expand replay detection to make the sentence true.

**Remaining provenance overclaim:** draft line 135 binds the probe source to a sentence reporting measured Node v24/v26 parser results. The probe declares a challenge; its bytes are not a transcript of those runtime measurements. `clock-sweep.txt:2-19` identifies v26 and reports parse outputs, but its command lines use descriptive placeholders (`node -e '<...>'`) rather than the exact scripts, and it shows no cross-TZ `receipt-attest verify` invocation. Draft lines 81-94 also conflate the frozen month-13 arm with reproduction of the zone-less cross-TZ verifier result. **Smallest correction:** bind parser observations to a complete, immutable command/output transcript; distinguish parser measurements and static verifier inference from executed verifier verdicts. Reserve “both reproduced by the frozen probe” for behavior the frozen probe actually exercises. Finish the seven intentionally unbound integration lines before representing this as a final admitted entry; this critic did not change them.

**Additional observed corroboration of (c):** after the static review, RevCounterD supplied actual local evidence. I read `.ufo/waves/round-52/build/RevCounterD/evidence.txt:7-11`: its synthetic hollow entry with twelve identical bindings and a nonexistent S103 URL printed `DOCTRINE52_HELD held=5/5`, exit 0. Lines 29-32 additionally report HELD for twelve bindings to a **directory**: the hash covers `git show`'s tree-listing text, not blob bytes. This seat did not execute either experiment. The recorded receipts corroborate that D52 is structural, not semantic; directory acceptance also falls short of its stated blob-binding description. No silent counter amendment is proposed.

**Updated recommendation:** the draft now supplies a defensible new-coverage core, honest companion use, and defensible tier/profile framing. Correct the false ledger clause and measurement provenance, complete committed bindings, and obtain the required substantive reread before C2 acceptance. A well-bound false clause is a fixable quality defect; accepting it merely to secure a coverage result would be a no-harm trade for the canonical judge to reject.

Report: .ufo/waves/round-52/w1/CritC2.md

## Closing correction receipt — revised draft inspected

ScribeEntry supplied a further revision; I inspected only the affected prose and the replacement evidence. The prior addendum's ledger and provenance defects are **corrected in that revised draft**: `build/ScribeEntry/fail-closed-clock-validation.md:134` now states same-nonce/different-digest semantics; `:143` separates the probe's header from measured parser rows; `:81-102` distinguishes B1c from a direct cross-TZ v1 experiment.

The replacement `build/ScribeEntry/clock-sweep.txt:11-27,29-45` now names executable drivers and Node v24/v26 commands, records exits, and reports the actual v1 verifier returning VALID under UTC versus TAMPERED under Tokyo/New York for the zone-less prelude. Lines 3-5 identify the extracted v1 instrument and its full hash matching the plan pin. This is inspected peer-recorded evidence, not an execution or hash verification by this seat.

**Final advisory disposition of the four assigned attacks:** (a) the corrected core teaches new parser/environment edge classes, not just the old clock clauses; (b) S103 is load-bearing as used; (c) D52 still does not force substance, with a local executed hollow-entry counterexample recorded by RevCounterD; (d) scoped RFC tier A and MDN tier B are defensible, and the strict-subset label is correct. No remaining semantic blocker from these inspected corrections is asserted. Final committed source/receipt bindings, integrated-byte checking, the required substantive non-author reread, and admission remain the integration owner/canonical judge's responsibilities. This bounded critic review is closed; it does not certify an admitted entry or a D52 result at the final revision.

Report: .ufo/waves/round-52/w1/CritC2.md
