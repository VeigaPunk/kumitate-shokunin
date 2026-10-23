RESULT ReviewQualityDraft verdict=defects-found

# ReviewQualityDraft — repeat-run rule text

Scope: the QUALITY recommendation in `.ufo/waves/round-48/build/ScribeMistake.md:11-27`
 (draft Q36 + Q37; no standalone Q36 draft was found; repository-wide search found
 only references to the draft and assignment, not a separate Q36 document).
Item asks: is the proposed repeat-run/exec-count-equality receipt rule (a) correctly
derived from R47-1 and r47 Mistake 3, (b) one machine-checkable sentence, (c) shown
able to fail. All citations below were re-opened and verified this session.

## Verdict

(a) **Partially correct derivation — one substantive gap.** (b) **No** — the composite
rule is not stated as one machine-checkable sentence, and no `Command` stanza exists.
(c) **Yes, but mis-cited** — the draft points at a receipt containing no held verdict;
direct committed evidence exists and should be cited instead.

## Finding D1 (substantive) — the repeat-run half is dropped from the normative rule

The routed fixes being mechanized:

- r47 Mistake 3 (`corpus/lessons/round-47.md:129-134`): class "an outside observer
  whose verdict depends on catching every exec record, **scored once**"; fix "require
  that the counter **reproduce its base reading N times** (exec counts equal to base)
  and treat any count below base as could-not-evaluate".
- R47-1 (`round-47-verifier-spotcheck.md:183-185`): "commit repeated A2 runs … as
  receipts. Adopt Mistake 3's **repeat-run** and exec-count-equality rule before the
  next freeze."

Q36's Field (`ScribeMistake.md:17`) imposes only *per-run* conditions: parse
completeness, resumed/unfinished pairing, per-site count equality "in every scored
run". "Every scored run" is a universal quantifier satisfied by a single run — nothing
in Field or Fails-when requires N ≥ 2 runs or agreement across them. The only
cardinality language sits in the non-normative Who-checks, and even there it reads
"replays the frozen counter on repeated **base** runs" — base-run replication, not
verdict-run replication. A counter scored **once**, fully parsed, counts equal to
base, emitting `held` → satisfies Q36 as drafted. That is exactly Mistake 3's
"scored once" defect class recurring.

(The F48 counter itself implements the missing clause — `plan.md:54-57` predicate
requires 3 runs AND, exec count equal to base; `caproute48-probe.mjs:35-36` header
cites "Mistake 3 / R47-5". The QUALITY draft is weaker than the instrument it
motivates.)

Repair: add run-cardinality and agreement to Field/Fails-when. The receipt-commitment
half of R47-1's fix is correctly carried by draft Q37 (`:24` "committed receipt path",
`:25` cancelled-seat exclusion) — that criterion verifies as written; the gap is only
in Q36.

## Finding D2 (citation defect) — "shown able to fail" cites a receipt with no held verdict

Draft `:18` Fails-when: "a held verdict is emitted with an unparsed/unpaired record or
with any site count below base." The cited evidence `rc-at802-parser.txt:3-16`
contains **no held verdict at all** — it is a parser differential (A2 `{"capped":106,
105,103}` vs F48 `106/106`), i.e. it demonstrates the defect exists, not that a held
verdict was emitted under it. The rule's exact fail shape is committed elsewhere and
should be cited:

- `.ufo/waves/round-47/close/c1-a2.txt:5-6` — `SITE AT802 … label=ROUTED_HELD n=104
  base_n=106` inside `held=5/5 rule=A2` exit 0. The canonical instance: a held verdict
  on a below-base count.
- `.ufo/waves/round-48/build/a2-rerun-1.txt:1-2` (`ROUTED_HELD n=52 base_n=53`,
  `n=39 base_n=42`), `a2-rerun-2.txt:4` (`n=43 base_n=46`), `a2-rerun-3.txt:5`
  (`n=105 base_n=106`) — four more held-with-below-base sites, at the base rev.

Note for the scribe: the draft's Scope (`:32`) records the a2-rerun files as empty at
inspection time; they are populated now (1293/1269/1267 bytes, mtime Oct 23 08:56).
Honest at write time, but the evidence basis is stale — these receipts are the
strongest available support for both the mistake class and the fail demonstration.

## Finding D3 (minor) — draft Q36 not stated as one machine-checkable sentence

The headline (`:15`) is one sentence with mechanically decidable terms, but (a) it
omits the repeat-run clause per D1, and (b) unlike every sibling it cites
(Q33–Q35 carry executable `Command` tripwires, QUALITY.md:660-665,680-685,708-713),
Q36 names no command — "machine-checkable" is asserted, not demonstrated. The draft's
novelty claim itself verifies: no earlier criterion covers this (Q3 = re-run *counts*,
Q24 = receipt digests, Q29 = control ordering, Q30 = seed non-recurrence; none touches
trace completeness or exec-count equality), and the Q36/Q37 split is justified —
trace completeness and report-evidence provenance are distinct failure modes.

## Finding D4 (wording) — Fails-when narrower than Field

Field `:17` requires count *equality* ("must equal its base count"); Fails-when `:18`
names only "below base". An above-base count violates Field but is unlisted in
Fails-when (F48 treats both directions as `exec_count_ne_base`). Also ":17" hedges
"a miss/cannot-evaluate" between Mistake 3's "could-not-evaluate" and F48's
`ROUTED_MISS` — defensible, but the sharp invariant is the clause already present:
"never evidence of ROUTED_HELD". Keep that, drop the hedge or name both labels.

## Approved wording (repair of Q36; Q37 remains a separate close-provenance criterion)

> **Q36 — a counter's success verdict is scoreable only when at least N ≥ 2 committed
> receipts for the same frozen counter command and revision each record exit 0 and the
> same success summary line byte-for-byte, every trace record parses with all
> unfinished/resumed records paired, and every site's exec count equals its base
> count in every run; fewer receipts, a failed or disagreeing run, an incomplete
> trace, or any unequal count cannot support a success verdict.**
>
> - **Who checks.** (as drafted)
> - **Field.** The sentence above; N is fixed in the plan before data, and each receipt
>   records the exact command, revision, exit, final summary line, parse status and
>   per-site/base counts.
> - **Fails when.** A scored success lacks N receipts; any receipt has nonzero exit or
>   a different final summary; a trace record is malformed or unmatched; or any
>   per-site count differs from base (including an above-base count).
> - **Shown able to fail.** `.ufo/waves/round-47/close/c1-a2.txt:5-6` (held=5/5 with
>   AT802 `ROUTED_HELD n=104 base_n=106`); `.ufo/waves/round-48/build/a2-rerun-*.txt`
>   (four more held-with-below-base sites at base); the parser-loss mechanism at
>   `probe/receipts/rc-at802-parser.txt:3-16`.
> - **Limit.** (as drafted — strace silently omitting a traced event is unshown;
>   `plan.md:25` verified)
Q37 (`:22-27`) verifies as drafted: derivation from R47-1/R47-2 is correct
(`spotcheck:183-192`, `SCORECARD.md:2082-2084` vs `a2-ctl-retparse2.txt:6-7` held=3/5,
`a2-controls.txt:17-24` calib held=1/5 — all confirmed), stated checkably, and shown
able to fail on the cited spotcheck evidence.

## Residual risk / verification gaps

- The recommended wording is review output, not an adopted criterion; appending to
  `corpus/QUALITY.md` is ScribeLesson/L1's call.
- No command backs Q36 yet — the round-48 C2 instrument (`scripts/counter-rerun.mjs`,
  plan :107-109) mechanizes the run-agreement half; the parse-completeness half rides
  the F48 counter itself. A future Q36 tripwire could wrap counter-rerun.
- Verified by reading only; no counter, strace, or test was executed this session.
- No tool installed. Touched surface: this report only
  (`.ufo/waves/round-48/r48/ReviewQualityDraft.md`).
