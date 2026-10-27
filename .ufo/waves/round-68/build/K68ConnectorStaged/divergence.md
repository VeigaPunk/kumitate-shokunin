# Divergence: staged shokuknow deprecation theme vs the lane's round-68 re-grounded entry

Seat K68ConnectorStaged, 2026-10-27. Staged side: `/home/vgpnk/Projects/shokuknow/merge/kumitate/` (read-only).
Lane side: the round-68 re-grounded entry as drafted at
`.ufo/waves/round-68/build/K68ScribeEntry/mcp-deprecation-registry.md` ("lane draft", scored
`DEPREC68_HELD held=10/10` on a fixture, `build/K68ScribeEntry/counter-receipts.md` R4/R5) plus the
frozen claim text `.ufo/waves/round-68/plan.md` C2 (:96-147). The corpus file
`corpus/knowledge/mcp-deprecation-registry.md` does not yet exist at the freeze — the lane verdicts
below are what the drafted entry and frozen plan assert, so this table is the lesson-Gate
admit/reject record.

Theme boundary: the 13 files the round-66 wave (`K66ScoutStagedTheme`, verdicts.md) scoped as the
theme "MCP deprecation registry and its clocks", plus the `amendments/` directory files and the
deprecation-adjacent carriers, flagged by tier.

## The three clock readings (the theme's core divergence)

| staged file | staged clock claim | lane verdict | evidence |
|---|---|---|---|
| `mcp-feature-deprecation-registry.md` | Created-based: "SEP-2596 reached Final on 2026-04-17; three months later is 2026-07-17" → "already eligible for removal on the day the revision shipped" (:66-70) | **REJECT the worked example; ADMIT the rest.** Lane's clock is Final-based: S213 (commit `183238ddac` "Mark SEPs as final", `Date: Wed, 3 Jun 2026`) → Final 2026-06-03 → grace elapsed **2026-09-03**, "54 days before this entry was written" | staged :66-67; lane draft :84-87; plan :103 ("the staged theme's 2026-04-17-Created … readings are disproven and must not enter"); live `seps/index.md` column header is `Created` (K66ReviewStagedClaims evidence :15-17) |
| `mcp-deprecation-registry-timing-2026-10-27.md` | Merge-based: "The SEP reached **Final** on **2026-05-18** … the earliest removal is **2026-08-18**" (:51-53) | **REJECT the correction.** Lane: "the pull merged as commit `219f8242` while the SEP still read `Draft`, and the `Final` flip is a *later* commit, S213" — merge is the wrong event | staged :51-53; lane draft :93-95; plan :103 ("2026-05-18-merge readings … disproven") |
| `sep-2596-status-and-merge-dates-2026-10-25.md` | Three dates: Created 2026-04-17 / merged 2026-05-18T18:09:21Z / `final` label 2026-06-03T17:07:09Z; grace under label = 2026-09-03 | **AGREE — the lane's own reading.** Lane resolves the open question the staged file declined to decide: "It does not claim which date the project treats as operative" (staged :68-72). Minor defect stays unfixed in lane: staged :59 says 2026-09-03 is "five days after the revision" — it is 37 days | staged :28-31, :59, :68-72; lane draft :84-86, S213 row |

## The 404 recheck path (tested live 2026-10-27)

| staged file | staged claim | lane verdict | evidence |
|---|---|---|---|
| `sep-2596-merge-timestamp-surfaces-2026-10-27.md` | recheck line :4: `curl -fsSL 'https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pull/2596' | grep -c '"merged_at": "2026-05-18T18:09:21Z"' -> 1`; body :17: "The endpoint returns HTTP 200 and 29,988 bytes" | **REJECT the recorded path; the claim is true only at the plural path.** Live re-run today: `pull/2596` → **HTTP 404, 106 bytes**; `pulls/2596` → **HTTP 200, 29,988 bytes** — the exact byte count the file records, so the staged fetch hit `/pulls/` but the recheck cites `/pull/`. `curl -f` on 404 fails before grep, so the recheck cannot print 1. Its own S334 SOURCES row uses the correct plural URL — the defect is file-level. Lane never depends on it: the lane carries the merge/final record as S213's commit-`.patch` capture, a URL with no rate limit and no pull/pulls ambiguity | my live run (seat report Evidence): `http=404 bytes=106` vs `http=200 bytes=29988`; staged :2,:4,:17; SOURCES.append.md S334 row (plural); lane draft source: S213 (:9) |
| `sep-2596-merge-timestamp-surfaces-2026-10-26.md` | API unreachable: "a rate-limit refusal … a 106-byte body and an HTTP status that is not 200" (:32-33); cites lane round-13 capture as durable carrier; commits-tab surface renders "May 18, 2026" | **AGREE on the two-surfaces analysis; SUPERSEDE the diagnosis.** Today's live evidence shows the 106-byte non-200 body is the `pull/`-path 404, not a rate-limit queue — the "rate limit was a queue" amendment narrative (:15-20) therefore rests on a misread of the failure. Commits tab still renders (200, 396,697 bytes live) | staged :21-24,:32-33,:49-52; my live fetches (above); lane draft :93-95 keeps merge≠Final without the API row |

## The 13 theme files

| staged file | core claim | lane verdict (agree / supersede / reject) | evidence |
|---|---|---|---|
| `mcp-feature-deprecation-registry.md` (r5) | Registry is per-feature, 6 rows; two clocks (revision-anchored floor vs SEP-anchored cell); eligible ≠ removed; worked example on Created date | **SPLIT — reject the clock, admit the rest.** Lane's `## Registry snapshot` carries the same 6 rows verbatim (:48-54) and the same "decision, not a date" rule (:73-77); the "twelve months … measured from the release of the revision" floor is quoted at :65-68. Only its worked example is disproven | staged :26-39,:48-51,:66-75; lane draft :48-54,:61-77; plan :103 |
| `mcp-deprecation-removed-section-2026-10-26.md` (r6) | Draft and Current Removed sections identical & empty; "eligible for removal since 2026-07-17" (:52) | **REJECT the dated eligibility; AGREE the observation.** Lane: § Removed holds "No features have been removed under this policy yet" (:56,:88), and eligibility elapsed 2026-09-03 — under which "still nothing removed" remains true, on a different clock | staged :21-29,:52; lane draft :56-59,:87-88 |
| `mcp-deprecation-registry-timing-2026-10-27.md` (r7) | Two clock families; grandfathering explains the 3-month cell; "correction: 2026-08-18"; secondary account "not opened" (:56) | **SPLIT — reject the correction, agree the structure.** Lane agrees the cell is the SEP §Transition clause (draft :35,:85-86) and that removal is a decision (:73-77); rejects merge-as-Final (:93-95); the "not opened" Haning account was opened (staged r13 S303; K66ReviewStagedClaims-7) | staged :36-58; lane draft :35,:85-86,:93-95 |
| `mcp-deprecation-removal-state-2026-10-25.md` (r10) | Released registry's HTTP+SSE cell identical to draft; Removed states nothing removed; current revision still 2026-07-28; announcement's "year-long offramp" is the only stated duration | **AGREE.** Lane's snapshot repeats the cell verbatim; "no newer Current revision" is implicit in S207 read 2026-10-27; lane agrees the registry never resolves the cell to a date ("has no calendar date in S207 or S208", draft :71-72) | staged :14-44; lane draft :52,:71-72,:88 |
| `mcp-deprecation-record-and-clock-clause-2026-10-25.md` (r12) | Changelog "Deprecated"/"Removed" are standing headings; HTTP+SSE was **reclassified**, not newly deprecated; Chinese rendering carries the transition clause | **AGREE.** Lane: SEP-2596 "reclassifies them" under transition provisions, `Deprecated in` is retroactive for the two oldest rows (:57-59); the transition clause the Chinese rendering carries is the one the lane anchors on (S210) | staged :16-34,:36-47; lane draft :57-59,:85 |
| `sep-2596-status-and-merge-dates-2026-10-25.md` (r13) | (see clock table) Created/merge/`final`-label = three distinct events; refuses to pick the operative one | **AGREE / lane decides.** Lane draft :84-95 resolves on the `final` flip (S213 commit) — the same event the staged label timestamp marks | staged :28-31; lane draft :84-95 |
| `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md` (r14) | Right: Created-column misread; merge≠Final; policy page has no grandfathering clause. Wrong cure: 12-month revision clock for HTTP+SSE, earliest removal = first revision Current after 2026-03-26; "the clock sentence … must be replaced" (:98-99); "Every row except one" (:63) | **REJECT the cure; agree the diagnosis.** Lane keeps the three-month cell because it is SEP §Transition restated (:85-86; S210 quote :35). Factual slip stands: exactly **4 of 6** rows carry "First revision released on or after 2027-07-28" (lane snapshot :49-52; includeContext row reads "Follows Sampling") | staged :63-99; lane draft :35,:49-54,:85-86; live `deprecated.md` table (identical cells) |
| `sep-2596-merge-timestamp-surfaces-2026-10-26.md` (r14) | (see 404 table) commits tab + capture as carriers; merge ≠ final-label day | **AGREE, superseded carrier choice.** Lane carries the same distinction via S213's commit patch instead of the API/capture pair | staged :21-43; lane draft :9,:93-95 |
| `sep-2596-merge-timestamp-surfaces-2026-10-27.md` (r15) | (see 404 table) AMENDMENT: endpoint live again, "rate limit was a queue" | **REJECT the recorded path** (404 live today); claim survives only via the plural URL its own S334 row cites | staged :2,:4,:17-20; my live runs; SOURCES.append S334 |
| `deprecation-clock-corrections-2026-10-26.md` (r14) | Meta: two wrong arithmetics live in the staged set; integrator table (:49-54) routes six files to "12-month revision clock" replacement | **REJECT the prescription, agree the audit.** Lane confirms both staged arithmetics disproven (:89-95) but adopts neither — it resolves via S213 + the SEP transition cell. Its own attribution mislocates the "eligible since 2026-07-17" quote (it lives in `mcp-deprecation-removed-section-…:52`, not `mcp-deprecation-removal-state-…`) | staged :19-54; lane draft :85-95; K66ReviewStagedClaims-6 |
| `deprecation-clock-narrative-record-2026-10-27.md` (r15) | Draft=release verified; changelog states 12-month floor & no removal date; concludes the 3-month cell "is the policy's opposite, and it is in the wrong document" (:46-47); earliest removal = 2026-07-28 (:66-71); calls CJK accounts "the wrong rule" (:55-56) | **REJECT the conclusion & the answer; agree the checks.** Lane: the cell is "three-month grace period from the date this SEP reaches Final" — S210's transition clause, a governing record; CJK carriers are *right* on this point, not wrong | staged :21-28,:37-47,:51-71; lane draft :35,:85-86 |
| `deprecation-decision-roles-and-operator-retirements-2026-10-25.md` (r11) | Removal is a Core Maintainer decision at release prep w/ Lead-Maintainer veto; unified.to retired /sse 2026-09-23 "before the … grace … would have expired" (:34-35) | **AGREE with correction.** Lane agrees removal=decision (:73-77); the retirement-ordering claim is stale under the lane's clock — grace ended 2026-09-03, so 2026-09-23 is 20 days **after** expiry | staged :12-39; lane draft :73-77,:87 |
| `deprecation-notice-record-locations-2026-10-28.md` (r16) | The per-feature notice lives on the 2025-03-26 transports page; it carries a compatibility contract and **no removal date**; cell unsupported by either normative record | **AGREE.** Lane's S211 (2025-11-25 transports) carries the same Backwards-Compatibility contract quote (:36); the "derived view" reading is the lane's too (:124-125) | staged :17-43; lane draft :36,:124-125 |

## The three staged amendments (`amendments/` directory)

| staged file | core claim | lane verdict | evidence |
|---|---|---|---|
| `amendments/…/mcp-orchestration-contract.md` | 2026-07-28 contract: identity in `_meta`; `CreateTaskResult` held until durable; `failed` ≠ `isError:true`; initialize/`Mcp-Session-Id` removed (S195/S197/S206) | **NOT ABSORBED — every claim is already the lane's.** Its three pages are the lane entry's own three sources under staged renumbers (S195→lane S125, S197→S127, S206→S136; MERGE-REPORT.md:96-98,101 duplicate-table); the lane entry already asserts them (`corpus/knowledge/mcp-orchestration-contract.md`, r59). Lane live re-reading bounds it: the installed host negotiates 2025-11-25 (lane S201), not this contract — spec-true, host-unexercised | staged :28-77; lane entry header + `## What the pages say`; MERGE-REPORT :19,:96-101; lane SOURCES S201 |
| `amendments/…/durable-execution-failure-detection.md` | Temporal Start-To-Close forces retry; managed-agent session state; arxiv barrier-contract failures | **OFF-THEME** — durable-execution band, no deprecation claim; the r68 entry gives no verdict and none is needed | staged :24-96; plan C2 scope |
| `amendments/…/durable-execution-and-fanout-primitives-2026-10-24.md` | Sagas = compensating actions; Tail-at-Scale hedged request | **OFF-THEME** — same | staged :16-41 |

## Deprecation-adjacent staged files (different themes, same clock surface)

| staged file | core claim | lane verdict | evidence |
|---|---|---|---|
| `cjk-mcp-deprecation-accounts-2026-10-27.md` / `cjk-renderings-of-the-2026-07-28-revision-2026-10-25.md` | zh-TW/zh-CN renderings carry the 3-month SEP-Final grace | **AGREE** — they carry the clause the lane anchors on; the narrative-record's claim that they carry "the wrong rule" is itself rejected | staged files' recheck lines; lane draft :35,:85 |
| `japanese-chinese-mcp-migration-accounts.md`, `japanese-accounts-…-10-28.md`, `chinese-accounts-…-10-28.md`, `cjk-accounts-…-10-24.md`, `mcp-2026-07-28-maintainer-account.md` | press/vendor accounts read the window as twelve months | **AGREE for the four SEP-2577/DCR features; REJECT if applied to HTTP+SSE.** Lane: four rows floor at "First revision released on or after 2027-07-28" (:49-52); HTTP+SSE's grace already elapsed 2026-09-03 (:86-88) | lane draft :49-54,:86-88 |
| `mcp-2026-deprecation-practical-semantics-2026-10-24.md` | "deprecated" is advisory until the wire; spec-deprecated set ≠ SDK-deprecated set; ping removed | **AGREE** — lane's own "presence of source is not exercise" (:120-121) is the same discipline | lane draft :25-26,:120-121 |
| `mcp-transport-eligibility-and-client-fallback-2026-10-25.md` | transport page says "eligible for removal in a future revision" (no date); client falls back on bare 400/404/405 only | **AGREE** — lane's S211 carries the same no-date contract; the 404-fallback point is consistent with today's live 404 evidence (a bare 404 is indistinguishable from legacy) | staged :11-40; lane draft :36,:107-113 |
| `mcp-stateless-negotiation-and-window-conflict-2026-10-24.md` | two official window statements disagree (registry 3-month vs announcement year-long) | **SUPERSEDE** — the lane's grounding dissolves the conflict's teeth: the 3-month cell is the SEP §Transition clause (a governing record), not a competitor to be reconciled | staged :31-41; lane draft :85-86 |
| `omp-mcp-version-negotiation-decision.md` + `-amendment-2026-10-26.md`, `omp-mcp-migration-tracker-state-2026-10-27.md` | OMP pinned 2025-11-25 deliberately; 2026-07-28 migration planned/tracked/unlanded | **AGREE** — lane's installed release is 18.13.1 still shipping `sse.ts` unchanged and the client on 2025-11-25 (draft :99-116; lane S201) | lane draft :99-116 |
| `omp-host-harness-protocol-skew-2026-10-27.md` | skew is a shared 2025-era revision behind a wrapper | **SUPERSEDE** — the `omp.real` wrapper is removed at installed `omp/18.13.1` (plan :101-104, :21-22) | plan :21-22,:101 |
| `omp-session-sharing-and-mcp-lifecycle.md`, `omp-advisor-and-mcp-transports.md` | MCP lifecycle halves citing commit `0b5c27ab` | **SUPERSEDE** — lane S202 row: "the staged `omp-session-sharing-and-mcp-lifecycle` MCP half cites an older commit and must re-point here" (v18.12.6 tag) | lane `corpus/SOURCES.md` S202 |

## Staged SOURCES.append.md rows bearing the theme's claims

| staged row | claim embedded | lane verdict | evidence |
|---|---|---|---|
| S241 (`…/pulls/2596`) | "SEP-2596 reached Final on 2026-05-18" (the merge) | **REJECT the embedded claim** — merge≠Final per lane :93-95; the URL itself is the correct plural form | SOURCES.append.md S241 teaches cell |
| S233/S234, S239/S240, S242/S243/S244, S331/S332, S273, S285, S294 | registry/policy/draft/changelog/transport carriers | mostly **AGREE** as carriers; lane covers the same pages as S207/S208/S210/S211 | SOURCES.append.md; lane draft source: lines 1-9 |
| S303/S304/S305/S306, S320/S321, S334 | three-dates carriers | **AGREE** as carriers; lane picks S213's commit patch instead (no API dependency) | lane draft :9 |
| S335/S336/S337 | lanes' own staged files cited as rows | self-referential; superseded by this table | staged SOURCES.append.md |

## Net for the lesson `## Gate`

- **Admit (the re-grounded entry)**, refusal basis: `mcp-feature-deprecation-registry.md`'s
  Created-clock worked example and `sep-2596-merge-timestamp-surfaces-2026-10-27.md`'s 404 recheck
  path — both verified live today.
- **Reject-as-staged (clock claims):** `mcp-feature-deprecation-registry.md` (worked example only),
  `mcp-deprecation-removed-section-2026-10-26.md` (:52), `mcp-deprecation-registry-timing-2026-10-27.md`
  (correction), `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md` (cure),
  `deprecation-clock-corrections-2026-10-26.md` (prescription), `deprecation-clock-narrative-record-2026-10-27.md`
  (conclusion+answer), `sep-2596-merge-timestamp-surfaces-2026-10-27.md` (recorded URL), SOURCES row S241's "Final on 2026-05-18".
- **Agree:** the 6-row table, two-clocks framing, derived-view/notice/changelog readings, the
  Created-column misread diagnosis, merge≠Final, removal-is-a-decision, three-dates table.
