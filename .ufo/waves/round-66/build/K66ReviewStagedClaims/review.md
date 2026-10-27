# Review of staged shokuknow deprecation entries — K66ReviewStagedClaims (2026-10-27)

Scope: the four staged entries under `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`:
`sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md`, `sep-2596-status-and-merge-dates-2026-10-25.md`,
`deprecation-clock-corrections-2026-10-26.md`, `mcp-deprecation-registry-timing-2026-10-27.md`.
Every dated claim was checked live on 2026-10-27: GitHub API (PR 2596 + issue timeline), raw SEP file,
modelcontextprotocol.io live pages, haning.me. Raw fetches + sha256 in `captures/` next to this file.
Verdicts: **confirmed** (live primary agrees), **wrong** (live primary contradicts), **unverifiable** (no live authority reachable).

## A. SEP-2596 dates and timeline

| # | Claim (located text) | Source | Verdict | Live evidence |
|---|---|---|---|---|
| A1 | Proposal **created 2026-04-17** ("`**Created**: 2026-04-17`") | status entry (S305); final-date entry | **confirmed** | API `created_at: 2026-04-17T17:50:11Z`; raw SEP line 5; index line 27 |
| A2 | PR **merged 2026-05-18T18:09:21Z** | status entry (S304/S306) | **confirmed** | API `merged_at: 2026-05-18T18:09:21Z`; string occurs once in PR-page HTML (embedded payload); lane probe line 11 |
| A3 | **`final` label applied 2026-06-03T17:07:09Z**, description "SEP finalized." | status entry (S304); timing entry (S241) | **confirmed** | API timeline: `unlabeled accepted` + `labeled final` both at `2026-06-03T17:07:09Z`; API labels: `('final', 'SEP finalized.')`; probe lines 18/21 |
| A4 | Label applied "**sixteen days after the merge**" | final-date entry | **confirmed** | 2026-05-18 → 2026-06-03 = 16 days |
| A5 | Index header "`\| SEP \| Title \| Status \| Type \| Created \|`"; SEP-2596 row "`Final \| Process \| 2026-04-17`"; the date column is **Created** | status entry; final-date entry | **confirmed** | `seps/index.md` line 23 (header), line 27 (row) |
| A6 | SEP-2575 indexed **2025-06-18**; SEP-2577 indexed **2026-04-14** (Created-column correlation samples) | status entry | **confirmed** | index lines 28-29 |
| A7 | Round-5 corpus sentence "SEP-2596 is Final, dated 2026-04-17" exists | status entry; corrections entry | **confirmed** | `shokuknow/lanes/kumitate/round5/SEARCH-LOG.md:24` |
| A8 | "**Note that "Final" is used in two senses**…a *SEP* reaches Final when its status advances per the SEP guidelines" | status entry; final-date entry | **confirmed** | raw SEP lines 58-61; site page lines 82-85 |
| A9 | Guidelines: reference implementation **must be completed** before Final; conformance test for Standards Track; accepted = "**Approved, awaiting implementation + conformance**" | final-date entry | **confirmed** | guidelines lines 108, 116, 155, 227 |
| A10 | Haning note (2026-07-30) dates 合入 to **2026-06-03** ("政策由 SEP-2596…2026 年 6 月 3 日合入）确立") | status entry (S303) | **confirmed** | haning.html contains the quoted clause verbatim |
| A11 | Arithmetic: creation+3mo = 2026-07-17; label+3mo = 2026-09-03; merge+3mo = 2026-08-18 | status/timing entries | **confirmed** (as arithmetic) | calendar check; each entry's own input date verified above |
| A12 | "the grace would end **2026-09-03** — **five days *after* the revision**" | status entry line 59 | **wrong** | 2026-09-03 is **37 days** after the 2026-07-28 revision (≈5 weeks 2 days); no reading of "the revision" yields 5 days. The 2026-09-03 endpoint itself is right under the grandfathered clock; the comparison is not |
| A13 | Creation-based date made the transport "eligible **eleven days before** the 2026-07-28 revision" | status entry line 58 | arithmetic **confirmed** (11 days), premise **wrong** | premise (Final = creation date) is the error both other entries also refute |

## B. Policy / SEP / versioning rules

| # | Claim | Source | Verdict | Live evidence |
|---|---|---|---|---|
| B1 | Minimum window "**at least twelve months**", measured "from the release of the specification revision in which the feature is first marked Deprecated, **not from the date the SEP reaches Final**"; earliest removal = "first specification revision released as Current on or after the window elapses" | final-date entry; timing entry | **confirmed** | policy lines 68-75; SEP raw lines 106-111 |
| B2 | Versioning guide: deprecated features remain "**at least twelve months, or at least ninety days**" (expedited); current version **2026-07-28** | final-date entry; timing entry | **confirmed** | versioning.md lines 25, 34-35 |
| B3 | Policy's only shortening: **Expedited Removal**, Core Maintainer approval, ≥ **ninety days** | final-date entry | **confirmed** | policy lines 133-142 |
| B4 | Policy page contains **no grandfathering clause** (none for pre-policy deprecations) | final-date entry | **confirmed** | `grep -c -i grandfather policy.md` → 0 |
| B5 | Removal is discretionary: "features may remain Deprecated…**much longer**"; Roles row "**Decide a removal during release preparation — Core Maintainers**"; no removal SEP required | timing entry | **confirmed** | policy lines 126-131, 149 |
| B6 | SEP **Transition** section: grandfathering paragraph + **two-row table**; "**three-month grace period from the date this SEP reaches Final**"; re-anchoring explicitly rejected; removal still a Core-Maintainer decision | timing entry (S243) | **confirmed** | raw SEP lines 215-243 (table at 228-231: HTTP+SSE → "Three months after this SEP is Final"; includeContext → "Follows Sampling") |
| B7 | Registry preamble: "**derived view**…per-feature deprecation notices and changelog entries, which are the normative records" | final-date entry; timing entry | **confirmed** | deprecated-0728.md lines 18-20 |
| B8 | `## Removed` section **empty** ("No features have been removed under this policy yet") | timing entry | **confirmed** | deprecated-0728.md, Removed section |
| B9 | Draft and released registries each carry **exactly six** rows, cells as tabulated (Roots/Sampling/Logging = SEP-2577 `2026-07-28`; DCR = PR #2858 `2026-07-28`; includeContext = SEP-2596 `2025-11-25` "Follows Sampling"; HTTP+SSE = SEP-2596 `2025-03-26` "Three months after SEP-2596 reaches Final"; four rows "First revision released on or after 2027-07-28") | timing entry | **confirmed cell-for-cell** | deprecated-0728.md and deprecated-draft.md lines 24-31 identical |
| B10 | "Every row **except one** gives the earliest removal as 'First revision released on or after 2027-07-28'" | final-date entry line 63 | **wrong** | exactly **4 of 6** rows carry that text; the includeContext row reads "Follows Sampling (SEP-2577)" — **two** exceptions, not one |
| B11 | "The HTTP+SSE row **alone** reads 'Three months after SEP-2596 reaches Final'" | final-date entry | **confirmed** | `grep -c -F 'Three months after SEP-2596 reaches Final'` → 1 on both pages |
| B12 | "'Three months after SEP-2596 reaches Final' is **not the policy's rule**" | final-date entry | **true but incomplete/misleading** | true of the policy page (B4), but it **is** the SEP's own rule for the two grandfathered features (B6) — a page the entry itself cites as S317. The registry's cell is lawful under the SEP, not an anomaly contradicting the policy floor |
| B13 | Entries' own `recheck:` greps reproduce | all four | **confirmed** | re-ran live: policy 1, raw SEP `**Created**: 2026-04-17` 1, site SEP `a *SEP* reaches Final when its status` 1, draft `Three months after…` 1 |

## C. The two "corrections" — which staged arithmetic survives

| # | Claim | Source | Verdict | Live evidence |
|---|---|---|---|---|
| C1 | "**The SEP reached Final on 2026-05-18**" (= merge) and "**the earliest removal is 2026-08-18**" | timing entry line 51 | **wrong** | Final is a status event (A8, A9). The project's own status record is the label event **2026-06-03T17:07:09Z**, applied **after** the merge; the guidelines even order the status update *before* the merge ("the sponsor updates the status to `final` and the SEP's PR can be merged", guidelines line 108). No primary record puts Final on 2026-05-18. Under the SEP's grandfathered clock the grace ends **2026-09-03** (= 2026-06-03 + 3 months). The entry's "**67 days** after HTTP+SSE first became eligible" (line 70) inherits the wrong premise (from its own 2026-08-18 to 2026-10-24) |
| C2 | Haning page "**was not opened**, so the claim is not treated as verified either way" | timing entry line 56 | **stale** | The page exists and dates 合入 to 2026-06-03 (A10); the status entry (2026-10-25, S303) had already opened it two days earlier |
| C3 | Corrections entry quotes of the other staged files are accurate: registry bullets "SEP-2596 reached Final on 2026-04-17;" / "three months later is **2026-07-17**;" (lines 66-67); "has been eligible for removal since 2026-07-17" (removed-section line 52); "## The correction: 2026-08-18, not 2026-07-17" (timing line 47) | corrections entry | **confirmed** | all three located verbatim at the cited files |
| C4 | "both arithmetics compute a day where the policy computes a revision" | corrections entry | **partly wrong** | True for the four revision-anchored features; for the **two grandfathered** features the SEP itself computes from a date (three months from SEP Final, B6) |
| C5 | Replacement prescription for HTTP+SSE: "the window is at least **twelve months from the `2025-03-26` deprecation revision**, and the earliest removal is the first revision released as Current after it" | corrections entry line 51 | **wrong** | Contradicts the SEP's Transition clause: the two pre-policy features keep a **three-month-from-Final** clock and re-anchoring was explicitly rejected ("re-anchoring their clock to a future revision release would restart a window the ecosystem has already had", raw SEP lines 221-223) |
| C6 | Prose attributes the eligibility quote to "the staged **removal-state** entry" | corrections entry line 22 | **misattributed** | The quote is in `mcp-deprecation-removed-section-2026-10-26.md:52`; `mcp-deprecation-removal-state-2026-10-25.md` contains no 2026-07-17 date at all (the entry's own table row at line 51 names the right file — internal inconsistency) |
| C7 | The timing entry's 2026-08-18 correction "is withdrawn rather than amended… it treats the merge as the Final event" | corrections entry | **confirmed** (this negative finding is correct) | see C1 |

## Admission guidance for the lane (C2 entry)

**May admit (live-confirmed):** the three-date timeline (created 2026-04-17, merged 2026-05-18T18:09:21Z, `final` label 2026-06-03T17:07:09Z "SEP finalized."); index header/columns and rows for SEP-2596/2577/2575; the two-senses note; guidelines Final requirements; policy window rule, expedited removal, roles, "much longer"; versioning 12-months/90-days and current version 2026-07-28; both registries' six rows cell-for-cell; derived-view preamble; empty Removed section; Haning 合入 date; the SEP's Transition/grandfathering clause (attributed to the **SEP**, not the policy page).

**Must not admit without fix:** "reached Final on 2026-05-18" and "earliest removal 2026-08-18" (timing entry); the corrections entry's twelve-months-from-2025-03-26 replacement for HTTP+SSE; "every row except one"; "five days after the revision"; the removal-state misattribution.

**Correct derived values for the lane's entry:** Final (status event) = 2026-06-03T17:07:09Z; HTTP+SSE grace ends **2026-09-03**, removal a Core-Maintainer decision at a release preparation on/after that day (may be much later); includeContext follows Sampling; the four 2026-07-28-deprecated features: first revision released as Current on or after 2027-07-28.

## Captures (fetched 2026-10-27, sha256 in captures/SHA256SUMS.txt)

pr2596.json, timeline.json (api.github.com), sep2596-raw.md (raw.githubusercontent main), sep2596-site.md,
seps-index-site.md, policy.md (community/feature-lifecycle.md), guidelines.md (community/sep-guidelines.md),
versioning.md (docs/learn/versioning.md, followed 307), deprecated-0728.md, deprecated-draft.md,
haning.html. Total 1593734 bytes.
