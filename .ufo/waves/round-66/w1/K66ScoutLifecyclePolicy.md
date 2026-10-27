VERDICT: S208 (the MCP feature-lifecycle policy page) opened live 2026-10-27, captured byte-exact (HTTP 200, 8794 bytes, sha256 3f337191…49e74ee), row drafted in the 11-cell schema, 7 quotes all pass the frozen norm() — and the staged shokuknow registry entry survives the live page with no contradiction, four flags (one anchor-name drift, two omitted provisions, one internal miscount).

## Evidence

Fetch (2026-10-27): `curl -fsSL -w 'HTTP_STATUS:%{http_code}' -o …/build/K66ScoutLifecyclePolicy/feature-lifecycle.md https://modelcontextprotocol.io/community/feature-lifecycle.md` → `HTTP_STATUS:200`; `wc -c` → `8794`; `sha256sum` → `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee`.

Live re-fetch (probe UA, M5-style): `curl -fsSL --max-time 90 -A 'Mozilla/5.0 (kumitate-deprec66)'` → 8794 bytes, same sha256, `cmp` vs capture → BYTE-IDENTICAL.

norm() check (norm copied verbatim from frozen `.ufo/waves/round-66/probe/deprec66-probe.mjs:52-60`; check = `norm(capture).includes(norm(quote))`), `node normcheck.mjs` (kept as `build/K66ScoutLifecyclePolicy/normcheck.mjs.copy`):

```
Q1 L10-12 | words=23 | norm-in-capture=true
Q2 L68-70 | words=19 | norm-in-capture=true
Q3 L70-72 | words=23 | norm-in-capture=true
Q4 L72-73 | words=20 | norm-in-capture=true
Q5 L123-124 | words=25 | norm-in-capture=true
Q6 L131 | words=14 | norm-in-capture=true
Q7 L32 | words=9 | norm-in-capture=true
```

Line spans verified against raw capture with `sed -n '32p;68,73p;124,125p;131p'` and `sed -n '122,131p'`.
Lane registry state: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 145 rows; highest is S206; no S207/S208 rows exist (the page was an unopened lead, corpus/SOURCES.md:266).

## Findings

1. **K66ScoutLifecyclePolicy-1 (info, milestone).** S208 opened and captured. Row drafted in the 11-cell `## Registry` schema: `| S208 | Feature Lifecycle and Deprecation Policy — https://modelcontextprotocol.io/community/feature-lifecycle.md | docs | A | … | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |` — 11 cells, no `|` in any cell, tier A scoped to "the policy whose rules the registry's per-feature Earliest-removal cells instantiate", anchor § Feature States / § Deprecating a Feature item 4 / § Removing a Feature / § Roles with byte hash, used-by the C2 entry: satisfies M2's row shape and M3's hash+size binding as drafted. Full row: `build/K66ScoutLifecyclePolicy/row.md`. (Prepared id S208; keyed by URL for L1 re-assignment.)
2. **K66ScoutLifecyclePolicy-2 (info).** Policy-window ↔ registry-cell relation: the page is the algorithm, each registry cell its evaluation — window ≥ 12 months specified per deprecation SEP (Q2, L68–70); clock starts at release of the revision first marking the feature Deprecated, not the SEP Final date (Q3, L70–72); earliest removal = first Current revision released on or after the window (Q4, L72–73); removal is a Core Maintainer decision at release preparation (Q5, L123–124; Roles L152), and features may stay Deprecated longer (Q6, L131). Hence "First revision released on or after 2027-07-28" = 12 months from the 2026-07-28 revision, and "Three months after SEP-2596 reaches Final" is a permitted per-deprecation dated window (twelve is a floor), with the transport's own 2025-03-26 clock already >12 months old by then. Full paragraph: `row.md` §"How the policy window relates…".
3. **K66ScoutLifecyclePolicy-3 (low, reference-drift).** The staged shokuknow entry (`/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md`, source line 2) cites "§ Specifying a deprecation"; the live page has no such section — the clause is item 4 under "## Deprecating a Feature" (capture L61–73), and the window re-measure sentence is under "## Feature States" (L35–39). Substance and staged quote ("twelve, that the feature must remain Deprecated before it is eligible for") are verbatim-present (L69–70); only the anchor name drifted. Repro: `grep -n '^## ' build/K66ScoutLifecyclePolicy/feature-lifecycle.md`.
4. **K66ScoutLifecyclePolicy-4 (low, omission).** Staged claim "Twelve is a floor … the policy only sets the minimum" omits § Expedited Removal (L136–143): Core Maintainers may shorten the floor below twelve months for an active security risk, with ≥ 90 days between becoming Deprecated and earliest removal. Not a contradiction; any generalising sentence in the C2 entry should carry the exception.
5. **K66ScoutLifecyclePolicy-5 (low, omission).** Staged "the clock starts at the revision that deprecated the feature" holds for first deprecations only; § Feature States (L35–39) adds restoration to Active by a superseding SEP and a window re-measured afresh on re-deprecation.
6. **K66ScoutLifecyclePolicy-6 (low, unadjudicated miscount).** Staged "right for three of the four SEP-2577 features" vs its own table's three SEP-2577 rows (Roots, Sampling, Logging; DCR is PR #2858, includeContext is SEP-2596). The policy page does not enumerate registry rows, so this cannot be adjudicated from the S208 capture — flagged for the S207 (registry page) seat; staged sentence should be re-checked before assimilation.
7. **K66ScoutLifecyclePolicy-7 (positive confirmation).** No staged sentence is contradicted by the live page: the load-bearing claims (12-month floor, clock start, eligibility ≠ removal, Core Maintainer decides at release preparation) all re-find verbatim in the capture. Context for C2 authors: § Removed (L33) and § Tier 1 SDK Obligations (L104–119) — OMP is a client/agent, not a Tier 1 SDK; those obligations are context, not binding duties.

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutLifecyclePolicy/feature-lifecycle.md` — exact capture (8794 B, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee)
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutLifecyclePolicy/row.md` — row draft, 7 located quotes, norm() results, window↔cells paragraph, staged-entry flags
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutLifecyclePolicy/normcheck.mjs.copy` — the checker script
- This report. No lane files outside `.ufo/waves/round-66/` were touched; scratch `/fast/scratch/hyaku/kumitate-r66/K66ScoutLifecyclePolicy/` deleted on exit. No tools installed.

## Limits

Did not fetch or verify the registry page itself (sibling seat's S207 scope); staged entry's SEP-2596 "Final, dated 2026-04-17" claim rests on the SEP index, which this page does not state (page says only "adopted via SEP-2596", L16–17). Quote word counts are whitespace-token counts as the counter computes them. Live checks ran twice (initial fetch + probe-UA re-fetch), both 2026-10-27; no other dates sampled.
