# S208 candidate row — MCP Feature Lifecycle and Deprecation Policy

Prepared lane id: **S208** (ids re-assigned by L1 by document; key = URL).
Access date: 2026-10-27. Fetch: `curl -fsSL https://modelcontextprotocol.io/community/feature-lifecycle.md` → HTTP 200.

## Capture facts

- path: `.ufo/waves/round-66/build/K66ScoutLifecyclePolicy/feature-lifecycle.md` (exact bytes kept)
- bytes: 8794 — `wc -c`
- sha256: `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee`
- live re-fetch at 2026-10-27 (probe UA, `curl -fsSL --max-time 90`): same size, same sha256, `cmp` → BYTE-IDENTICAL

## Row draft (11 cells, no `|` in any cell)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S208 | Feature Lifecycle and Deprecation Policy — https://modelcontextprotocol.io/community/feature-lifecycle.md | docs | A | the MCP feature-lifecycle policy whose rules the deprecated registry's per-feature "Earliest removal" cells instantiate: the three states, the minimum window and its clock start, and who decides removal | § Feature States (the three-state table), § Deprecating a Feature item 4 (the minimum-deprecation-window clause) and the paragraph after the scheduling bullets, § Removing a Feature item 1 and the sentence after its list, § Roles rows "Decide a removal during release preparation" and "Approve expedited removal"; policy adopted via SEP-2596 per the page header; page read 2026-10-27, HTTP 200, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee | the deprecation clock: a deprecation SEP specifies a window of at least twelve months measured from the release of the revision that first marks the feature Deprecated (not the SEP's Final date); earliest removal is the first Current revision released on or after the window; removal is then a Core Maintainer decision at release preparation, and features may remain Deprecated longer | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |

## Located quotes (verbatim from the capture, each ≤ 25 words)

1. Q1, L10–12 (23 words): "It defines three feature states (Active, Deprecated, Removed), the criteria and procedure for moving between them, a minimum window between deprecation and removal"
2. Q2, L68–70 (19 words): "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal."
3. Q3, L70–72 (23 words): "The window is measured from the release of the specification revision in which the feature is first marked Deprecated, not from the date"
4. Q4, L72–73 (20 words): "The feature becomes eligible for removal in the first specification revision released as Current on or after the window elapses"
5. Q5, L123–124 (25 words): "Once a feature is set for removal, the removal is executed at the discretion of the Core Maintainers after the minimum deprecation window has elapsed."
6. Q6, L131 (14 words): "Features may remain Deprecated, without removal, for much longer than the minimum deprecation window."
7. Q7, L32 (9 words): "Existing implementations should migrate before the earliest removal date."

## norm() check against the frozen counter

`norm()` copied verbatim from `.ufo/waves/round-66/probe/deprec66-probe.mjs:52-60`; capture read as buffer;
check = `norm(capture).includes(norm(quote))` (same inclusion the M4/M5 checks use). Command:
`node /fast/scratch/hyaku/kumitate-r66/K66ScoutLifecyclePolicy/normcheck.mjs` (script kept beside this file as `normcheck.mjs.copy` in the build dir).

```
Q1 L10-12 | words=23 | norm-in-capture=true
Q2 L68-70 | words=19 | norm-in-capture=true
Q3 L70-72 | words=23 | norm-in-capture=true
Q4 L72-73 | words=20 | norm-in-capture=true
Q5 L123-124 | words=25 | norm-in-capture=true
Q6 L131 | words=14 | norm-in-capture=true
Q7 L32 | words=9 | norm-in-capture=true
```

All 7 quotes pass; M5's live re-find is additionally guaranteed because the 2026-10-27 live re-fetch is
byte-identical to the capture (same sha256 `3f337191…49e74ee`, `cmp` silent → BYTE-IDENTICAL).

## How the policy window relates to the registry's per-feature "Earliest removal" cells

The policy page is the algorithm; each registry cell is that algorithm evaluated for one feature. The page
fixes four rules the cells must satisfy: (a) every deprecation SEP specifies the window itself, as a number
of months **at least twelve** (Q2) — twelve is a floor a longer window may raise, not a uniform figure; (b)
the clock starts at the release of the specification revision in which the feature is *first* marked
Deprecated, not at the SEP's Final date (Q3) — and if a feature is restored and re-deprecated, the window
re-measures from the new deprecation revision (L35–39); (c) **earliest removal** is defined as the first
specification revision released as Current on or after the window elapses (Q4, L73) — eligibility, not
removal; (d) actual removal is "executed at the discretion of the Core Maintainers" after the window
(Q5, Roles L152 "Decide a removal during release preparation — Core Maintainers"), and a feature "may
remain Deprecated, without removal, for much longer than the minimum deprecation window" (Q6). So a
registry cell like "First revision released on or after 2027-07-28" is rule (a)+(b)+(c) applied to a feature
first marked Deprecated in the 2026-07-28 revision (12 months elapse 2027-07-28, first Current revision on
or after that date); the HTTP+SSE row's "Three months after SEP-2596 reaches Final" is the same algorithm
with a per-deprecation dated window, which rule (a) permits because the SEP specifies the window — and the
transport's own clock from its 2025-03-26 deprecation revision had already exceeded twelve months before
that date. One more rule the cells inherit: the twelve-month floor can be shortened only as **expedited
removal** for an active security risk, with Core Maintainer approval and a residual floor of ninety days
between becoming Deprecated and earliest removal (L136–143).

## Staged shokuknow entry vs the live page — contradictions and flags

Staged file: `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md`.

**No staged sentence is directly contradicted by the live page.** The entry's load-bearing claims are
verbatim-supported: the "at least twelve" clause (Q2), the clock-start rule (Q3), "eligibility is not
removal / Core Maintainer decision at release preparation" (Q5, Roles table). Four flags follow, in
descending severity; the first three are gaps or drift, not contradictions — the distinction is stated per
item.

1. **Anchor-name drift (reference-drift class).** The staged entry cites "§ Specifying a deprecation (the
   minimum-deprecation-window clause)". The live page has **no section named "Specifying a deprecation"**;
   the clause is item 4 of the numbered list under "## Deprecating a Feature" (L61–73), and the window
   re-measure sentence lives under "## Feature States" (L35–39). A staged entry re-grounded on this capture
   should cite § Deprecating a Feature item 4. The staged quote itself ("twelve, that the feature must
   remain Deprecated before it is eligible for") is found verbatim at L69–70 under norm().
2. **Omitted exception to the floor.** The staged claim "Twelve is a floor, not a figure … the policy only
   sets the minimum" is silent on § Expedited Removal (L136–143): the floor may be shortened below twelve,
   to no less than ninety days, for a feature presenting an active security risk, by Core Maintainer
   approval under the governance decision process. Any entry sentence generalising "the minimum is twelve
   months" should carry this exception.
3. **Omitted restoration path.** § Feature States (L35–39) allows a Deprecated feature to be restored to
   Active by a superseding SEP, and says the window is then "measured afresh from the revision in which the
   new deprecation takes effect". The staged entry's "the clock starts at the revision that deprecated the
   feature" is right for first deprecations only; the re-deprecation case re-sets the clock.
4. **Probable miscount inside the staged entry, not adjudicable from this page.** The staged entry says its
   flat-"12-months" summary is "right for three of the four SEP-2577 features"; its own registry table shows
   exactly three SEP-2577 rows (Roots, Sampling, Logging; DCR is PR #2858, `includeContext` is SEP-2596).
   "Four" matches neither the staged table nor anything on the policy page — the registry capture (sibling
   seat, S207) is needed to adjudicate, but the staged sentence should be re-checked before assimilation.

Also noted for the C2 entry authors (context, not defects): § Removed (L33) defines Removed as deleted from
`draft` and absent from the next Current revision but documented in the last Final revision it appeared in;
§ SDKs (L41–42) and § Tier 1 SDK Obligations (L104–119) state that spec removal does not oblige an SDK to
drop the feature, and Tier 1 SDKs must mark APIs deprecated and should emit runtime warnings — OMP, the
installed release under study, is a client/agent, not a Tier 1 SDK, so these obligations are context for its
MCP-client surface rather than binding duties.
