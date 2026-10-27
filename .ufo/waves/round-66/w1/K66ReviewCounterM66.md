VERDICT: M66's base and do-nothing controls reproduce, but M6's table checks admit false positives and M8 depends on ambient tooling.

## Evidence
- `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 8d557f85312de4fcc82e09ff735d21436bc3746d` → `DEPREC66_UNMET held=0/8 checks=8 rev=8d557f85312de4fcc82e09ff735d21436bc3746d rule=M66 | M1 MISS entry-absent | M2 MISS no-entry | M3 MISS no-rows | M4 MISS bullets=0;no-2027-07-28-quote;no-three-months-quote | M5 MISS no-bullets | M6 MISS no-cited-row-for-the-2026-07-28-deprecated-page;no-Registry-snapshot-section;capture-table-rows=0<5 | M7 MISS no-Bearing-section,no-cited-row-for-sse.ts-at-v18.12.6 | M8 MISS census-exit=0 sources-check=true source-capture=true readme-map=false province-names-entry=false` (exit 1). Matches base receipt verdict/misses.
- `SCRATCH=/fast/scratch/hyaku/kumitate-r66/K66ReviewCounterM66 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/c2-donothing.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin` → `DEPREC66_UNMET held=0/8 ...` and `EXIT=1`; matches frozen do-nothing receipt held count and check outcomes (revision hash differs).
- Live fetch curl of `https://modelcontextprotocol.io/specification/2026-07-28/deprecated` succeeded, `wc -c` → `297396` bytes.
- `build/K66ScoutDeprecatedPage/deprecated.md:22-31` contains six Deprecated rows and the named columns/values.

## Findings
1. **MEDIUM — M6 does not enforce cell-to-row correspondence.** It tests `snapText.includes(depIn)` and `snapText.includes(removal)` globally, not against the same feature's snapshot row. Values for all features can be placed in a single row while other rows are wrong and still satisfy the values checks, provided row count matches. It also doesn't compare feature cells. Reproduce by inspecting M6 in `probe/deprec66-probe.mjs`.
2. **MEDIUM — M6 table parsing is structurally permissive.** Snapshot count includes every pipe-prefixed line in the section, skips only separator lines, then blindly treats the first as header. Capture parsing splits raw `|` without handling escaped pipes or confirming header columns. This can count malformed/extra pipe lines as data and weakens exact-table-row semantics. Source capture evidence: `build/K66ScoutDeprecatedPage/deprecated.md:22-31`.
3. **LOW — M8 is not strictly archive/environment hermetic.** Census executable defaults to an absolute external path; node helpers inherit ambient PATH and process environment. The archived commit alone does not determine those checks' execution.
4. **LOW — M7 only weakly binds the installed-release assertion.** It requires any S201–S206 text, roots/HTTP+SSE words, and any new cited `/v18.12.6/…sse.ts` row; it does not tie those text claims to the cited source content or establish installed runtime identity. The plan itself excludes proof of host runtime use.

## Artifacts
- `.ufo/waves/round-66/build/K66ReviewCounterM66/review.md`

## Limits
- Candidate archive with the completed entry was unavailable, so positive checks M1–M5/M7/M8 and M6 on candidate content were not exercised.
- Live fetch succeeded, but no full normalized row-by-row comparison to a candidate capture was possible at the absent base entry.
- No OMP binary/runtime checks performed.
