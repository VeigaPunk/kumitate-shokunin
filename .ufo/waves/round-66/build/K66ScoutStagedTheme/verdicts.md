# Staged deprecation theme — verdicts (seat K66ScoutStagedTheme, kumitate r66 w1)

Theme: "MCP deprecation registry and its clocks" staged under `/home/vgpnk/Projects/shokuknow/merge/kumitate/`
(read-only). Scope check against `/home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md`:

- **In scope.** All 13 theme files sit in the frontier band "MCP protocol revisions as they bear on
  orchestration" (PROVINCE.md §Frontier line 21): the registry decides when features leave the spec,
  which governs when an MCP host/orchestrator (the installed OMP release ships `transports/sse.ts`
  and declares `roots`) must migrate. The operator-retirement file is deployment orchestration.
- **Not security.** Nothing here is MCP/OAuth security practice — that band routes to kasegi/kagi
  (PROVINCE.md line 28). The deprecation-registry material stays on this lane.
- The two CJK carrier files the theme quotes (`cjk-mcp-deprecation-accounts-2026-10-27`,
  `cjk-renderings-of-the-2026-07-28-revision-2026-10-25`, staged rows S335/S336) are staged under a
  different theme; noted only as carriers of the same wrong clock clause.

Live checks run 2026-10-27 against `https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md`
and `https://modelcontextprotocol.io/community/feature-lifecycle.md` (captures in `evidence/`,
sha256 above). Between the staged `verified-at: 2026-10-24` and today nothing on the two live pages
moved: 6-row table identical, Removed section still "No features have been removed under this policy
yet.", current revision still 2026-07-28, policy window clause identical.

## Verdict table

| # | staged file (round) | verdict | one-line reason | flip condition |
|---|---|---|---|---|
| 1 | `mcp-feature-deprecation-registry.md` (r5) | **reject as staged** | Its worked example "SEP-2596 reached Final on 2026-04-17; three months later is 2026-07-17; already eligible when the revision shipped" computes eligibility from the SEP's creation date — disproven by the theme's own r13/r14 and by the live SEP file (Created 2026-04-17, final label 2026-06-03). | Replace the two bullets with the label-date arithmetic (2026-06-03 → grace end 2026-09-03, after the revision shipped) and cite the SEP §Transition table as the cell's basis; the 6-row table, the two-clocks framing and the "eligible ≠ removed" rule are correct and are C2's load-bearing quotes — keep them. |
| 2 | `mcp-deprecation-removal-state-2026-10-25.md` (r10) | **admit-candidate** | Release-registry window identical to draft, Removed section's "no features removed" statement, and "current revision is still 2026-07-28" all re-verified live today. | None required. Optional: soften "the only statement anywhere that gives a duration is the release announcement's year-long offramp" — the SEP §Transition table also states a duration (three months). |
| 3 | `mcp-deprecation-removed-section-2026-10-26.md` (r6) | **reject as staged** | States the transport "has been eligible for removal since 2026-07-17" — the same creation-date error as #1. | Restate eligibility against the final-label date (grace end 2026-09-03) or strip the calendar date and say only "eligible since the 2026-07-28 revision shipped, under the SEP transition clause"; keep the empty-as-designed observation (verified live today). |
| 4 | `mcp-deprecation-registry-timing-2026-10-27.md` (r7) | **reject as staged** | Headline correction "2026-08-18, not 2026-07-17" re-anchors the grace to the PR merge date (2026-05-18), but merge ≠ Final; the corpus's own r13/r14 show the only completion-tracking marker is the `final` label (2026-06-03 → grace end 2026-09-03). | Withdraw the correction (keep the withdrawal on record); the two-clock-families table, the "removal is a Core Maintainer decision, not a date" analysis, and the S240–S244 sourcing are sound — keep them. |
| 5 | `mcp-deprecation-record-and-clock-clause-2026-10-25.md` (r12) | **admit-candidate** | Changelog "Deprecated"/"Removed" standing-heading observation and the Chinese transition-clause rendering verified against the live changelog; benign, adds the "reclassified, not newly deprecated" nuance. | None required. |
| 6 | `sep-2596-status-and-merge-dates-2026-10-25.md` (r13) | **admit-candidate** | The three-dates table (created 2026-04-17 / merged 2026-05-18T18:09:21Z / `final` label 2026-06-03T17:07:09Z) is the theme's keystone and is confirmed by the live SEP source file and API record. | Fix one arithmetic slip: 2026-09-03 is **37 days** after the 2026-07-28 revision, not "five days after". Direction (grace ends after the revision shipped) is right. |
| 7 | `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md` (r14) | **reject as staged** | Right diagnosis (creation date misread; policy page has no grandfathering clause — both verified live), wrong cure: it replaces the rule's shape ("twelve months from the 2025-03-26 revision, earliest removal = first revision Current after 2026-03-26 = 2026-07-28"), ignoring the SEP §Transition clause that the registry cell restates (live SEP lines 238–267: "a three-month grace period from the date this SEP reaches Final", table row "Three months after this SEP is Final"). | Keep the created-date exposure and the policy-page check; delete the 2026-07-28 replacement and the "clock sentence must be replaced" directive; cite the SEP §Transition as the cell's normative basis and 2026-06-03 as the operative Final date. |
| 8 | `sep-2596-merge-timestamp-surfaces-2026-10-26.md` (r14) | **admit-candidate** | Citation-fragility fix (commits tab renders the merge date; API record machine-readable); the round-13 capture is a legitimate durable carrier. | None required. |
| 9 | `sep-2596-merge-timestamp-surfaces-2026-10-27.md` (r15) | **admit-candidate** | Amendment: live API endpoint reachable again (200, 29,988 bytes; merged_at 2026-05-18T18:09:21Z; final label 2026-06-03) — two-carrier citation policy is sound hygiene. | None required. |
| 10 | `deprecation-clock-corrections-2026-10-26.md` (r14) | **reject as staged** | Meta-record of cure #7: its integrator table routes six staged files to the wrong replacement (12-month revision clock), which the SEP §Transition contradicts. | Rewrite the integrator table to route files to the SEP-based reading (three-month grace from 2026-06-03, grace end 2026-09-03) and to withdraw — not amend — the 2026-08-18 correction. |
| 11 | `deprecation-clock-narrative-record-2026-10-27.md` (r15) | **reject as staged** | Verification work is good (draft row word-for-word the released row; changelog states a twelve-month floor and names no removal date; per-feature notice found) but the conclusion "the corpus's three months lives in a derived table, while the record that governs it states twelve months … the number is the policy's opposite, and it is in the wrong document" is disproven by the live SEP §Transition — a governing record that names exactly "Three months after this SEP is Final"; and the derived answer "earliest removal = 2026-07-28 revision" is wrong under the SEP. | Keep the draft=release check, the changelog/notice checks and the revision-sequence note; reframe the three-month cell as the SEP §Transition restated (with the registry's own note: "SEP-2596 reclassifies them as Deprecated under its transition provisions"); drop "policy's opposite" and the 2026-07-28 answer. |
| 12 | `deprecation-decision-roles-and-operator-retirements-2026-10-25.md` (r11) | **admit-candidate, with fix** | Roles/veto analysis verified live (policy Roles table; "Lead Maintainers retain veto authority"); unified.to retirement spot-checked live ("Removed the SSE transport", September 23 2026, 410). But "The first of those dates is before the registry's own three-month grace from SEP-2596's Final would have expired" is stale under the theme's own best date: grace ended 2026-09-03, twenty days BEFORE the 2026-09-23 retirement. | Restate the comparison against grace end 2026-09-03 (retirement lands after expiry), or drop the comparison and keep the governance-vs-deployment distinction, which stands. |
| 13 | `deprecation-notice-record-locations-2026-10-28.md` (r16) | **admit-candidate** | Per-feature deprecation notice located on the 2025-03-26 revision's transports page (verified live: §Backwards Compatibility, compatibility contract, no removal date) — closes a real navigation gap; the index-route lesson is worth keeping. | None required. Filename date (2026-10-28) post-dates its `verified-at: 2026-10-24`; cosmetic only. |

**Tally: 6 admit-candidates (#2, #5, #6, #8, #9, #13) + 1 admit-with-fix (#12); 6 rejects-as-staged
(#1, #3, #4, #7, #10, #11).** Satisfies the plan's assimilation gate (≥1 admit, ≥1 reject). Rejects
come with flip conditions that strengthen the theme; none relaxes a claim.

## The six most load-bearing staged sentences vs the live pages

| # | sentence (file) | live check (2026-10-27) | verdict |
|---|---|---|---|
| S1 | "The registry is a table … Roots, Sampling, Logging, DCR → 'First revision released on or after 2027-07-28'; HTTP+SSE → 'Three months after SEP-2596 reaches Final'." (`mcp-feature-deprecation-registry.md`) | Live table rows identical (`evidence/deprecated-2026-07-28.md:26-31`); preamble "derived view … normative records" also identical. | **holds** |
| S2 | "SEP-2596 is Final, dated 2026-04-17; three months later is 2026-07-17; the HTTP+SSE transport was already eligible for removal on the day the revision shipped." (`mcp-feature-deprecation-registry.md`) | Live SEP file separates `**Created**: 2026-04-17` from `**Status**: Final` (`evidence/sep-2596.md:25`); the `final` label was applied 2026-06-03T17:07:09Z (S334, live-verified pattern); grace end on that date is 2026-09-03 — after the revision shipped. | **wrong** (creation-date misread; theme's own r13/r14 agree) |
| S3 | "The policy requires … at least twelve … measured from the release of the specification revision in which the feature is first marked Deprecated, not from the date the SEP reaches Final." (`mcp-feature-deprecation-registry.md`, `mcp-deprecation-registry-timing-2026-10-27.md`) | Live policy lines 68-74 verbatim: "the number of months, at least twelve … measured from the release of the specification revision in which the feature is first marked Deprecated, not from the date the SEP reaches Final." | **holds** |
| S4 | "The correction: 2026-08-18, not 2026-07-17 — the SEP reached Final on 2026-05-18 (merged_at)." (`mcp-deprecation-registry-timing-2026-10-27.md`) | Live SEP guidelines: a SEP reaches Final when the reference implementation (and conformance test) is complete — a completion event, not the merge; the completion marker in the upstream record is the `final` label at 2026-06-03T17:07:09Z (`evidence/sep-guidelines.md:108,153-155,225-227`). Grace end 2026-09-03, not 2026-08-18. | **wrong** (corrects a date inside a rule misidentified; the theme's r14 says this itself) |
| S5 | "The published policy page contains no such [grandfathering] clause … the corpus's arithmetic has to change from 'date plus three months' to 'revision plus twelve months, then the next revision released as Current'." (`sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md`) | First half verified: live policy page has no Transition/grandfathering section (only Expedited Removal). Second half contradicted: the live SEP §Transition (lines 238-267) is exactly the grandfathering clause — "a three-month grace period from the date this SEP reaches Final", table "HTTP+SSE transport → Three months after this SEP is Final" — and the live registry note links the reclassification to "its transition provisions". The cell is the SEP restated, not an anomaly. | **half wrong** (policy-page claim holds; the replacement cure is wrong) |
| S6 | "The corpus's three months lives in a derived table, while the record that governs it states twelve months and names no removal date … the first revision released as Current on or after [2026-03-26] is 2026-07-28." (`deprecation-clock-narrative-record-2026-10-27.md`) | Changelog/notice checks verified live (twelve-month floor; reclassification entry; §Backwards Compatibility notice with no removal date). But "the record that governs it" — the SEP — names exactly three months, so "the policy's opposite, in the wrong document" overreaches, and the 2026-07-28 "answer" is wrong under the SEP's transition table. | **wrong** (verification work stands; conclusion and derived answer do not) |

**Now-stale against the theme's own evidence (not the live pages):** `deprecation-decision-roles-and-operator-retirements-2026-10-25.md`'s "the first of those dates is before the registry's own three-month grace … would have expired" — true only under the discarded 2026-07-17/2026-08-18 dates; under the operative label date (grace end 2026-09-03) the 2026-09-23 retirement is **after** expiry. Minor arithmetic slip in `sep-2596-status-and-merge-dates-2026-10-25.md`: "five days after the revision" should be 37 days (2026-07-28 → 2026-09-03); direction correct.

## What the theme should hold after integration (synthesis for the L1)

1. The registry's HTTP+SSE cell is the SEP-2596 §Transition clause restated: a deliberate three-month
   grace from "the date this SEP reaches Final" for two features publicly deprecated before the
   policy existed — not a drafting error, not the policy's opposite.
2. "Reaches Final" is the completion event the SEP guidelines define (reference implementation +
   conformance test), marked upstream by the `final` label: **2026-06-03T17:07:09Z** → grace ended
   **2026-09-03**. Neither the creation date (2026-04-17 → 2026-07-17) nor the merge date
   (2026-05-18 → 2026-08-18) is that event; both staged corrections are wrong, as the theme's own
   r13/r14 establish.
3. The policy-page clock clause (12-month floor, revision-anchored) governs the four features
   deprecated in 2026-07-28 (earliest removal: first revision on/after 2027-07-28) — and does not
   govern the two grandfathered features, whose clock the SEP sets by date.
4. Nothing has been removed under the policy (verified live 2026-10-27); the current revision is
   still 2026-07-28; removal remains a Core Maintainer decision at release preparation, vetoable by
   the Lead Maintainers.
5. Two operators (unified.to 2026-09-23; Cloudflare workers-observability 0.5.5) retired the
   transport on their own deployments — deployment decisions, not specification removals; the
   first retirement now postdates the grace end.
