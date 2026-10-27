VERDICT: M66 has several concrete false-pass paths, especially M6's weak table-cell comparison and M8's ambient executable/environment assumptions.

## Evidence
- `node .../deprec66-probe.mjs ... 8d557f85312de4fcc82e09ff735d21436bc3746d` emitted `DEPREC66_UNMET held=0/8 ...` and exit 1; matches `base/deprec66-base.txt` verdict line (entry absent, same M1–M8 misses).
- `SCRATCH=/fast/scratch/hyaku/kumitate-r66/K66ReviewCounterM66 bash .../c2-donothing.sh ...` emitted `DEPREC66_UNMET held=0/8 ...` and `EXIT=1`; matches `base/deprec66-donothing.txt` on held count and all checks; generated revision differs because clone commit identity/hash differs.
- Live fetch: `curl -fsSL --max-time 90 -A 'Mozilla/5.0 (kumitate-deprec66)' https://modelcontextprotocol.io/specification/2026-07-28/deprecated -o .../live-deprecated.html; wc -c .../live-deprecated.html` → `297396 .../live-deprecated.html` (fetch successful).
- Capture `build/K66ScoutDeprecatedPage/deprecated.md:22-31` shows six data rows; row headers are Feature, Deprecation SEP, Deprecated in, Migration path, Earliest removal. Cited values include `2027-07-28` and `Three months after SEP-2596 reaches Final`.

## Findings
1. **MEDIUM — M6 cell correspondence is not verified.** It checks only that each `Deprecated in` and `Earliest removal` value appears somewhere in the entire snapshot string, not in the corresponding row/cell. A snapshot with all six removal/deprecation values copied into one row and unrelated/duplicated feature rows can pass if row count matches. It also doesn't verify feature values or bind values to the captured feature; therefore the declared “carries every row's ... cells” contract is weaker than specified. Reproduce conceptually from `deprec66-probe.mjs` M6: `snapText.includes(depIn)` and `.includes(removal)` rather than parsed row-wise tuple equality.
2. **MEDIUM — M6 table extraction silently accepts malformed table structure.** Captured rows are split naïvely on `|` and normalized per cell; snapshot rows are counted as every pipe-starting line, with first line blindly discarded as header. Escaped pipes, extra tables, missing header/separator, or a pipe-prefixed prose line can alter counts/cell parsing. It does not locate the Deprecated table's actual header/column names, only the first `## Deprecated` and rows before `## Removed`. Against the captured page the expected six rows are clear (`deprecated.md:22-31`), but parser boundaries are not robust to structure changes.
3. **LOW — M8 invokes helper scripts with uncontrolled host state.** `sources-census.sh` is an absolute default outside the archive, and three node scripts inherit `process.env` except TMPDIR; PATH, Node, and other env values are ambient. Thus M8 is not fully reproducible from archived revision and can be influenced by environment/tool version. The census helper itself is external to the archive. This is a limitation of the claimed archive-only predicate.
4. **LOW — M7 checks URL syntax, not installed-release identity.** The predicate only requires a cited new source URL ending `/v18.12.6/...sse.ts` and section text containing roots/HTTP+SSE plus any S201–S206 citation; it does not establish the fetched source is the installed OMP release or that cited rows correspond to both named features. Plan explicitly states host runtime use is out of scope, but the asserted installed-release bearing is only weakly bound.

## Artifacts
- `.ufo/waves/round-66/build/K66ReviewCounterM66/review.md`
- `/fast/scratch/hyaku/kumitate-r66/K66ReviewCounterM66/live-deprecated.html` (temporary; removed before yield)

## Limits
- Did not run the counter on a C2 candidate/archive containing the completed registry, so M1–M5 and positive M6/M7/M8 behavior were not exercised.
- Live page fetch succeeded, but did not perform a custom normalized row-by-row equality comparison because the frozen checker reads a candidate archive capture, which is absent at the frozen base; the staged scout capture records the six-row source table.
- Did not run OMP binaries or inspect installed host behavior.
