# Dossier — "MCP deprecation registry and its clocks": rejection as staged

Theme set (all under `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`,
read-only): `mcp-feature-deprecation-registry.md` (round-5 base entry, sources S233/S234),
`mcp-deprecation-removed-section-2026-10-26.md` (S239), `mcp-deprecation-registry-timing-2026-10-27.md`
(S240–S244), `mcp-deprecation-removal-state-2026-10-25.md` (S273/S274). MERGE-REPORT.md carries no
dedicated theme section — the theme appears only as rows in its knowledge-files table (merge rounds
5, 6, 7, 10: "two clocks, not one grace period" / "Removed section is still empty" / "removal is a
decision, not a date" / "the released revision's own answer"). The lane position this dossier supports:
**reject as staged; re-ground** (round-68 plan, `## Frontier step`: "the staged entry is rejected as
staged (its worked example rests on the SEP's Created date and a 404 recheck path; round-66 wave
evidence) and re-grounded by the lane's own entry").

## 1. The worked clock derivations, verbatim

### 1a. Base entry — derivation rests on the SEP's Created date

`mcp-feature-deprecation-registry.md:62-70` (the whole "correction" the entry exists to state):

> SEP-2596 is **Final**, dated **2026-04-17** (the SEP index: "Specification Feature Lifecycle and
> Deprecation Policy | Final | Process | 2026-04-17"). Applying the registry's own rule to the
> HTTP+SSE transport, whose earliest removal is "Three months after SEP-2596 reaches Final":
>
> - SEP-2596 reached Final on 2026-04-17;
> - three months later is **2026-07-17**;
> - the 2026-07-28 revision shipped **eleven days after that**.
>
> **The HTTP+SSE transport was already eligible for removal on the day the revision shipped.**

The index quote is real but its column is **Created**, not Final — the entry reads a creation date as
a status event. Every derived claim (eligibility 2026-07-17, "already eligible on the day the
revision shipped") rests on it.

### 1b. Timing amendment — derivation rests on the 2026-05-18 merge reading

`mcp-deprecation-registry-timing-2026-10-27.md:50-53`:

> The SEP
> reached **Final** on **2026-05-18**: its pull request carries a label named `final`, described by
> the project as `SEP finalized.`, and its `merged_at` is `2026-05-18T18:09:21Z`. The grace period
> therefore runs from 2026-05-18, and the earliest removal is **2026-08-18**.

and lines 55-57, dismissing the correct record without opening it:

> A secondary account that appeared in search results dated the merge to 2026-06-03. That page was
> **not opened**, so the claim is not treated as verified either way; what is verified is the
> project's own merge record, and the primary outranks it.

## 2. Lane evidence that disproves both readings (round-66 wave)

`.ufo/waves/round-66/build/K66ReviewStagedClaims/captures/timeline.json` — the project's own issue
timeline for PR 2596, fetched 2026-10-27 (sha256 in `captures/SHA256SUMS.txt`):

- Created: `"created_at": "2026-04-17T17:51:03Z"` (line 30; first timeline event,
  `head_ref_force_pushed`; review.md A1 confirms `created_at: 2026-04-17T17:50:11Z` on the PR).
- **Merged**: lines 2694-2698 — `"event": "merged"`,
  `"commit_id": "219f82421ce13f6b0d9f786e603cf9a659fd5216"`,
  `"created_at": "2026-05-18T18:09:21Z"`.
- **Final**: lines 3637-3644 — `"event": "labeled"`, `"created_at": "2026-06-03T17:07:09Z"`,
  `"label": { "name": "final", "color": "4e0bd0" }`; the `unlabeled accepted` event carries the same
  timestamp (line 3604). The merge is **not** the Final event; the `final` label lands 16 days after it.

`review.md` verdicts (same build dir):

- C1 — "**The SEP reached Final on 2026-05-18**" and "**the earliest removal is 2026-08-18**" →
  **wrong**: "The project's own status record is the label event **2026-06-03T17:07:09Z**, applied
  **after** the merge; the guidelines even order the status update *before* the merge … Under the
  SEP's grandfathered clock the grace ends **2026-09-03** (= 2026-06-03 + 3 months). The entry's
  '**67 days** after HTTP+SSE first became eligible' (line 70) inherits the wrong premise."
- A13 — the base entry's "eligible **eleven days before**" arithmetic is confirmed arithmetic on a
  **wrong** premise: "premise (Final = creation date) is the error both other entries also refute."
- C2 — "That page **was not opened**" → **stale**: the Haning page exists and dates 合入 to
  2026-06-03; the status entry (S303) had already opened it two days earlier.
- A12 — "five days *after* the revision" → **wrong**: 2026-09-03 is 37 days after 2026-07-28.
- Derived values for the lane's entry: "Final (status event) = 2026-06-03T17:07:09Z; HTTP+SSE grace
  ends **2026-09-03**, removal a Core-Maintainer decision at a release preparation on/after that day;
  includeContext follows Sampling; the four 2026-07-28-deprecated features: first revision released
  as Current on or after 2027-07-28."

Round-66 plan/LOG: `plan.md` §C2 stages the theme "MCP deprecation registry and its clocks" for
re-grounding ("one entry, re-grounded on rows opened in round 66, never copied"); LOG.md:2318 records
the round's honest stop — `DEPREC66_UNMET held=0/8`, captures landed but no entry integrated — so the
review evidence stands committed and the entry itself was never admitted. Round-68 plan names the
live clock: "SEP-2596 Final 2026-06-03 (commit `183238ddac`, 'Mark SEPs as final') + the registry's
three-month grace → elapsed 2026-09-03 … the staged theme's 2026-04-17-Created and 2026-05-18-merge
readings are disproven and must not enter."

## 3. What survives re-grounding vs what must be rebuilt

**Survives** (live-confirmed by review.md, quotable into the lane entry): the six-row Deprecated
table cell-for-cell (B9: Roots/Sampling/Logging = SEP-2577 `2026-07-28`, DCR = PR #2858 `2026-07-28`,
includeContext = SEP-2596 `2025-11-25` "Follows Sampling", HTTP+SSE = SEP-2596 `2025-03-26` "Three
months after SEP-2596 reaches Final"; draft and 2026-07-28 registries identical); the feature-lifecycle
window clause — ">= twelve months … measured from the release of the specification revision in which
the feature is first marked Deprecated, not from the date the SEP reaches Final" (B1); the SEP's own
Transition/grandfathering clause for the two pre-policy features (B6); eligibility ≠ removal — "a Core
Maintainer decision taken during release preparation … may happen later" and the empty `## Removed`
section "No features have been removed under this policy yet" (B5/B8); the derived-view preamble (B7);
versioning guide: twelve months / ninety-day expedited, current version 2026-07-28 (B2/B3).

**Must be rebuilt** (the clock — the entries' reason for existing): every eligibility date and every
"days since eligible" figure. Correct clock: SEP-2596 Final = 2026-06-03 (label event, evidence
pointer S213), grace elapsed 2026-09-03; HTTP+SSE has been eligible since 2026-09-03, still unremoved
because removal is a maintainer decision. Dead derived claims: 2026-07-17 eligibility, "eleven days",
2026-08-18, "67 days", "five days after the revision", "already eligible on the day the revision
shipped", "was not opened".

## 4. Staged claims in conflict with the lane's live re-reading (one line each)

- `mcp-feature-deprecation-registry.md:66` — "SEP-2596 reached Final on 2026-04-17;" — **conflict**: reads
  the index's Created column as the Final event; timeline.json:3637-3644 puts `final` at 2026-06-03.
- `mcp-feature-deprecation-registry.md:67-70` — "three months later is **2026-07-17** … **already
  eligible for removal on the day the revision shipped**" — **conflict**: eligibility is 2026-09-03,
  37 days after the revision (review.md C1/A12).
- `mcp-deprecation-registry-timing-2026-10-27.md:51-53` — "reached **Final** on **2026-05-18** … the
  earliest removal is **2026-08-18**" — **conflict**: `merged_at` is the merge event (timeline:2694-2698),
  not the Final status event (timeline:3637-3644); review.md C1 → wrong.
- `mcp-deprecation-registry-timing-2026-10-27.md:55-57` — "A secondary account … dated the merge to
  2026-06-03. That page was **not opened**" — **conflict**: the page exists, was opened by its own
  round, and dates 合入 to 2026-06-03; the date it dismissed is the correct Final date (review.md A10/C2).
- `mcp-deprecation-registry-timing-2026-10-27.md:70` — "empty **67 days after HTTP+SSE first became
  eligible**" — **conflict**: inherits the 2026-08-18 premise; from the real eligibility 2026-09-03
  to its 2026-10-24 read the figure is ~51 days (review.md C1).
- `mcp-deprecation-removed-section-2026-10-26.md:26-28` and `:52` — "became *eligible* for removal on
  **2026-07-17**" / "has been eligible for removal since 2026-07-17" — **conflict**: repeats the
  base entry's dead date; eligibility is 2026-09-03.
- `mcp-deprecation-removal-state-2026-10-25.md:26-27` — "a three-month grace from the day the SEP
  reaches Final and removal still a Core Maintainer decision" — **consistent**: names the right
  anchor (Final) and right authority (maintainer decision); resolves no date, so no conflict —
  it is the staged file whose framing survives.
- `mcp-feature-deprecation-registry.md:4-5` (header) — recheck greps the
  `specification/2026-07-28/deprecated.md` page for `Three months after SEP-2596 reaches Final` — a
  fragile, page-pinned recheck (the round-68 plan's "404 recheck path" note: the string lives in one
  revision-scoped page that a future registry edit can silently break); the lane re-grounds the
  recheck on opened captures instead.

## Verdict for the Gate

Reject all four files **as staged**; the theme is real and most of its table/policy substance is
reusable verbatim, but its worked clock — the point every file builds on — rests on two disproven
readings (Created-as-Final, merge-as-Final). Admit only a lane-written entry re-grounded on
S207–S213 with the 2026-06-03 Final / 2026-09-03 elapsed clock, the staged files named as the
refusal basis. The `deprecation-clock-corrections-2026-10-26.md` sibling is itself disproven on the
same timeline (review.md C5/C6: its twelve-months-from-2025-03-26 replacement contradicts the SEP's
Transition clause, and it misattributes the 2026-07-17 quote to `mcp-deprecation-removal-state-…`
which contains no such date) — flag it for the Gate's reject list too.
