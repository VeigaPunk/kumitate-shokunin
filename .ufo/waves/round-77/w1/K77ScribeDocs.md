# K77ScribeDocs — scoped text deliverables

## Behavior

Axes: **coverage:omp + operability** (orchestration/tooling). Produced application-ready draft text only; no product code, frozen plan, source registry, lane documentation, index, judge, or fleet tracked file was edited. Nothing was committed, pushed, published or deployed. No peer dispatch or messaging occurred. No extra runtime or tool installation/update was invoked.

## Gates and evidence limits

No probe, gate, selftest, mutation control, build, formatter or linter was executed by this scribe. HELD lines in the draft are acceptance targets, not measured outcomes. All inherited numbers are explicitly attributed to the frozen plan or committed open receipts; close numbers remain `<TBD>` for L1. S227 provenance is registry/capture metadata read locally, not an independent fetch by this seat.

Exact shell command executed (exit 0):

```sh
S=/fast/scratch/hyaku/kumitate-r77/K77ScribeDocs; trap 'rm -rf -- "$S"' EXIT; mkdir -p "$S" /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-77/build/K77ScribeDocs/reference && git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane" && test "$(git -C "$S/lane" rev-parse --show-toplevel)" = "$S/lane" && git -C "$S/lane" checkout -q 4dc470a131e10900fdd456b6b68d7ba27151d9d2 && git -C "$S/lane" rev-parse HEAD && cp "$S/lane/SKILL.md" "$S/lane/SCORECARD.md" "$S/lane/corpus/lessons/round-76.md" "$S/lane/.ufo/waves/round-77/open/proxy-open.json" /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-77/build/K77ScribeDocs/reference/
```

Observed stdout/stderr:

```text
Cloning into '/fast/scratch/hyaku/kumitate-r77/K77ScribeDocs/lane'...
done.
4dc470a131e10900fdd456b6b68d7ba27151d9d2
```

The clone top-level assertion passed before checkout; EXIT cleanup was installed before creation and ran when the command exited. No independent cleanup recheck was performed. The retained reference directory contains selected source documents, not a whole-lane mirror.

Specialized reads inspected the frozen plan first, exact SKILL rows/checklist and SCORECARD paragraph shapes, the r76 lesson, Q22/Q23, inherited/open gate receipts, source S227, the proposal-6 text and frozen probe CLI/cleanup behavior. Initial proposal lookup at the fleet-root `considerthese/2026-10-26.md` returned not found; glob discovery located the lane-owned file, which was then read. No inference from that failed lookup is used.

## Touched surfaces and artifact paths

All paths below are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

- `.ufo/waves/round-77/build/K77ScribeDocs/skill-rows.md` — existing-format excerpts and complete original rows retained in reference; two replacement registry rows and two checklist additions with runnable frozen-probe commands, accepted exit `{0}` and exact expected HELD substrings. Also flags v2 recovery-write semantics and the existing proxy row/checklist-label updates.
- `.ufo/waves/round-77/build/K77ScribeDocs/scorecard-text.md` — axis sentence, capability deepening note, capture-time/single-writer limits and round-78 candidates.
- `.ufo/waves/round-77/build/K77ScribeDocs/round-77-lesson.md` — Gate, Mistakes, first proposal-6 Counters table, Spot-check pending.
- `.ufo/waves/round-77/build/K77ScribeDocs/report-skeleton.md` — contract-order fleet report skeleton; final numbers and judgments left for receipts.
- `.ufo/waves/round-77/build/K77ScribeDocs/reference/{SKILL.md,SCORECARD.md,round-76.md,proxy-open.json}` — unmodified selected snapshots from scaffolding revision.
- `.ufo/waves/round-77/w1/K77ScribeDocs.md` — this report.

## Proposed section headings

Registration draft: `# SKILL.md registration draft`; `## Existing shape (quoted from scaffolding 4dc470a1)`; `## Gate registry — replacement rows`; `## Verifiable checklist — two additions`.

Scorecard draft: `# SCORECARD.md text draft`; `## Existing paragraph shapes (quoted)`; `## Axes — replacement evidence sentence`; `## Capabilities — note immediately under the existing spotcheck-adopt row`; `## Limits (recorded, not hidden) — additions`; `## Planned — insert before historical pre-registrations`. These are application markers; target existing sections remain Axes, Capabilities, Limits and Planned.

Lesson: `# Round 77 — pinned OMP shape and crash-recoverable adoption`; `## Gate`; `## Mistakes`; `## Counters`; `## Spot-check`.

Fleet report: `# kumitate round 77`; `## Work performed`; `## Landed changes`; `## Before → after measurements`; `## Sources & frontier`; `## Trend verdicts`; `## SHONEN`; `## Per-axis verdicts`; `## Round shape`. The Unicode arrow matches the existing report-receipt heading contract rather than inventing an ASCII variant.

## Findings

1. **Recovery changes the read-only claim.** Frozen C2 requires recovery before check/predict as well as adopt; the inherited registry phrase `default mode is read-only` cannot remain unconditional. The replacement explicitly says recovery may write the two pre-images.
2. **Count source is not measurement.** Open/freeze receipts distinguish pre-repair drift from scaffolding CLEAN. Registry freeze already includes S227 (`rows=166 tiers=A:142,B:16,C:8` per open receipt). Do not reuse that as pre-S227 base or claim the scaffolding repair as a live v2 adoption.
3. **Checklist introduction is stale.** Existing prose says “Thirty-three items”, while the open receipt quotes `32/35 pass`. Do not blindly add two to the prose count; L1 should derive the final actual item count. No count was rerun here.
4. **Supplemental loader receipt has a fidelity limitation.** `open/r76-freeze-fix-6-disposition.txt` quotes real module absence via `git cat-file` exit 128, but its loader imports a differently named `spotcheck-adopt-absent.mjs`, shows ERR_MODULE_NOT_FOUND and records `exit=0`. Draft preserves that distinction; it does not silently repair or upgrade the receipt.
5. **Counters stay attributed.** Corrected reject size is frozen-plan evidence: 155 S-rows / 161 lines / 70 entries, not an independently remeasured scribe claim. All final readings stay unresolved in this intentional draft.
6. **Probe work directories require cleanup.** The frozen probe cleans a work root it creates itself, but does not remove a caller-supplied `--work` root. Checklist draft explicitly instructs L1 to remove its scratch roots after execution.

## Contract conflicts (verbatim for canonical judge)

- Required setup says: “one shared clone there (`git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane"` then `git -C "$S/lane" checkout -q 4dc470a131e10900fdd456b6b68d7ba27151d9d2`)”.
- Another hard rule says: “Seats never commit, push, or run any mutating git/jj command anywhere”.

This seat followed the specific required scratch clone/checkout sequence, with the specified top-level guard. No lane index/jj state mutation occurred. No judgment of the conflict is asserted here.

## Out of scope and L1 handoff

Applying drafts, reconciling executor implementation, filling final receipts, updating live pins, committing documentation, fleet report filing and non-author closure are outside this text-only seat. L1 should run the frozen C1/C2 predicates on the integrated measured revision, exercise registered checklist commands with scratch cleanup, run existing registration/report consistency checks and supply exact output/exit/revision receipts. This is a handoff of required integration checks, not a claim they passed.

## Self-evaluation

Accuracy 4/5: contract targets are separated from observations; runtime behavior still requires executor receipts. Completeness 4/5: all named draft artifacts and sections supplied; final numeric cells intentionally belong to L1. Clarity 4/5: application markers are distinguished from target headings, but historical evidence is dense. Actionability 4/5: replacement rows and concrete probe commands supplied; integration remains evidence-dependent. Conciseness 4/5: explicit provenance adds length to avoid overstating execution. Overall 4.0/5. Highest-impact improvement before filing: replace intentional placeholders with final measured receipts, then reconcile exact landed CLI/registry wording. Self-check: this is a completed draft assignment, not a completed round or admission decision.
