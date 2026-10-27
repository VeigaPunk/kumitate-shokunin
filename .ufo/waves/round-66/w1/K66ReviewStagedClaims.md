VERDICT: The four staged entries' underlying facts check out live almost everywhere (three SEP-2596 dates, six-row registries, policy/SEP rules), but two staged "corrections" are themselves wrong — 2026-05-18-as-Final / earliest-removal-2026-08-18, and twelve-months-from-2025-03-26 for HTTP+SSE — and four smaller defects (a wrong row count, a false day-gap, a misattributed quote, a stale "not opened") must not enter the lane's C2 entry.
## Evidence

All fetches 2026-10-27; raw bytes + sha256 in build/K66ReviewStagedClaims/captures/ (SHA256SUMS.txt). Full claim table: build/K66ReviewStagedClaims/review.md.

```
curl -sS https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596
  title: SEP-2596: Specification Feature Lifecycle and Deprecation Policy
  created_at: 2026-04-17T17:50:11Z | merged_at: 2026-05-18T18:09:21Z
  labels: [('SEP', ''), ('final', 'SEP finalized.')]
curl -sS .../issues/2596/timeline?per_page=100   (labeled events only)
  unlabeled accepted | 2026-06-03T17:07:09Z
  labeled final      | 2026-06-03T17:07:09Z        <- the project's recorded Final event
curl -sS https://modelcontextprotocol.io/seps/index.md
  23:| SEP | Title | Status | Type | Created |
  27:| [SEP-2596](...) | Specification Feature Lifecycle and Deprecation Policy | Final | Process | 2026-04-17 |
  28:SEP-2577 ... Final | Standards Track | 2026-04-17's neighbour 2026-04-14 | 29:SEP-2575 ... 2025-06-18
curl -sSL https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md   (rows 26-31, six rows)
  4 rows: "First revision released on or after 2027-07-28" (Roots, Sampling, Logging = SEP-2577 2026-07-28; DCR = PR #2858 2026-07-28)
  includeContext (SEP-2596, 2025-11-25): "Follows Sampling ([SEP-2577])"
  HTTP+SSE (SEP-2596, 2025-03-26): "Three months after SEP-2596 reaches Final"
  preamble: "This registry is a derived view ... the normative records." | "## Removed / No features have been removed under this policy yet."
draft/deprecated.md rows 24-31: identical six rows, identical cells.
raw SEP (main): 5:**Created**: 2026-04-17 | 58-61: "Note that "Final" is used in two senses ... a _SEP_ reaches Final when its status advances per the [SEP guidelines]"
  106-111: window "at least twelve", measured "from the release of the specification revision in which the feature is first marked Deprecated, not from the date the SEP reaches Final"; earliest removal = "first specification revision released as Current on or after the window elapses"
  215-243 Transition: "Two features were already described as deprecated ... before this policy existed"; "three-month grace period from the date this SEP reaches Final"; "re-anchoring their clock to a future revision release would restart a window the ecosystem has already had"; table: HTTP+SSE -> "Three months after this SEP is Final", includeContext -> "Follows Sampling"
policy (community/feature-lifecycle.md): 68-75 same window rule; 133-142 Expedited Removal (Core Maintainer approval, >= ninety days); 131 "much longer than the minimum deprecation window"; Roles: "Decide a removal during release preparation | Core Maintainers"; grep -c -i grandfather -> 0
guidelines (community/sep-guidelines.md): 108 "the sponsor updates the status to `final` and the SEP's PR can be merged"; 116 accepted = "Approved, awaiting implementation + conformance"; 155 "Must be completed before the SEP reaches "Final" status"; 227 conformance test required
versioning.md (307 followed): 25 "current protocol version is 2026-07-28"; 34-35 "at least twelve months, or at least ninety days under the policy's [expedited removal]"
haning.me note: contains "2026 年 6 月 3 日合入）确立" and "SEP-2596 定稿后三个月"
recheck greps re-run live: policy window 1; raw SEP Created 1; site SEP 'a *SEP* reaches Final when its status' 1; draft 'Three months after SEP-2596 reaches Final' 1
local staged quotes verified: mcp-feature-deprecation-registry.md:66-67 (bullets, 2026-04-17/2026-07-17); mcp-deprecation-removed-section-2026-10-26.md:52; mcp-deprecation-registry-timing-2026-10-27.md:47; lane round13 probe lines 11/18/21; round5/SEARCH-LOG.md:24
```

## Findings

1. **K66ReviewStagedClaims-1 (HIGH)** — `mcp-deprecation-registry-timing-2026-10-27.md:51` claims "The SEP reached **Final** on **2026-05-18**" (equating merge with Final) and derives "the earliest removal is **2026-08-18**". Wrong: Final is a status event (SEP file lines 58-61; guidelines line 108 orders the status update before the merge), and the project's own record is the `final` label applied **2026-06-03T17:07:09Z** — *after* the merge. No primary record puts Final on 2026-05-18. Under the SEP's grandfathered clock the grace ends **2026-09-03** (= 2026-06-03 + 3 months). The entry's "empty **67 days** after … became eligible" (line 70) inherits the wrong premise. Reproduce: `curl -sS 'https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/issues/2596/timeline?per_page=100' | grep -o '"label": {"name": "final"[^}]*}[^}]*"created_at": "[^"]*"'`. The lane's C2 entry must not inherit 2026-08-18.
2. **K66ReviewStagedClaims-2 (HIGH)** — `deprecation-clock-corrections-2026-10-26.md:51` prescribes replacing the registry-entry example with "the window is at least twelve months from the `2025-03-26` deprecation revision, and the earliest removal is the first revision released as Current after it" for HTTP+SSE. This contradicts the adopted SEP's own Transition/grandfathering clause (raw SEP lines 215-243): the two pre-policy features keep a **three-month-from-SEP-Final** clock precisely because re-anchoring was rejected; the registry's "Three months after SEP-2596 reaches Final" cell is lawful under the SEP, not an anomaly. Applying this prescription would weaken the entry. Reproduce: `curl -sS https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/seps/2596-spec-feature-lifecycle-and-deprecation.md | sed -n '215,243p'`.
3. **K66ReviewStagedClaims-3 (MEDIUM)** — `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md:63` "Every row except one gives the earliest removal as 'First revision released on or after 2027-07-28'". Wrong: exactly **4 of 6** rows carry that text; the includeContext row reads "Follows Sampling (SEP-2577)" — two exceptions. (The entry's narrower claim that the HTTP+SSE row alone reads "Three months after…" is confirmed, grep → 1 on both pages.) Reproduce: `curl -sS https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | grep -c 'First revision released on or after 2027-07-28'` → 4 of 6 rows.
4. **K66ReviewStagedClaims-4 (MEDIUM)** — same file, line 83: "The corpus cannot tell which from the policy page alone, because the page does not record which features were granted the exception". The SEP page the entry itself cites (S317) answers it: the Transition section names both grandfathered features and their three-month-from-Final clock. Its verdict "'Three months after SEP-2596 reaches Final' is not the policy's rule" is true of the policy page but incomplete without the SEP clause — the framing feeds finding 2's wrong prescription.
5. **K66ReviewStagedClaims-5 (LOW)** — `sep-2596-status-and-merge-dates-2026-10-25.md:59`: "the grace would end **2026-09-03** — five days *after* the revision". 2026-09-03 is **37 days** after the 2026-07-28 revision (≈ 5 weeks 2 days); no reading of "the revision" yields 5 days. The 2026-09-03 endpoint is itself correct under the grandfathered clock.
6. **K66ReviewStagedClaims-6 (LOW)** — `deprecation-clock-corrections-2026-10-26.md:22` attributes the quote "has been eligible for removal since 2026-07-17" to "the staged **removal-state** entry"; the quote lives in `mcp-deprecation-removed-section-2026-10-26.md:52`, and `mcp-deprecation-removal-state-2026-10-25.md` contains no 2026-07-17 date at all. The entry's own table (line 51) names the right file — internal inconsistency in a citation-audit entry.
7. **K66ReviewStagedClaims-7 (LOW)** — `mcp-deprecation-registry-timing-2026-10-27.md:56` still records the Haning page as "**not opened**, so the claim is not treated as verified either way". Stale: the page exists and does date 合入 to 2026-06-03 (fetched live; also opened by the 2026-10-25 status entry, S303). The lane may close that lead as verified.

## Artifacts

- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/w1/K66ReviewStagedClaims.md (this report)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ReviewStagedClaims/review.md (full claim-by-claim table, admission guidance)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ReviewStagedClaims/captures/ (11 live fetches, 2026-10-27, sha256 in SHA256SUMS.txt)

## Limits

- No browser render of the PR page: "merge timestamp sits in the embedded payload rather than rendered text" is consistent (exactly one occurrence of 2026-05-18T18:09:21Z in the HTML) but the rendered-vs-embedded distinction was not visually verified.
- The staged entries' lane-history claims were spot-checked by grep over shokuknow (round5/SEARCH-LOG.md:24, round13 probe), not by reading every round file.
- Verdicts are as of 2026-10-27 live state; the registry/policy pages can change (the entries' own `recheck:` intervals are 30d/180d).
- I did not audit the other staged entries listed in the corrections entry's table (e.g. `mcp-feature-deprecation-registry.md` beyond the quoted lines, `mcp-deprecation-removed-section-2026-10-26.md` beyond lines 26/52) — only the four in-scope files and the specific quotes they make about siblings.
