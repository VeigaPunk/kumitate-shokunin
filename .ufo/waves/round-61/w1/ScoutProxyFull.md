# ScoutProxyFull — round 61 w1 (milestone: terms census)

Artifact: `.ufo/waves/round-61/build/ScoutProxyFull/terms-before.txt` (full stdout+stderr of all four scripts, each followed by its exit code, plus an appendix with `proxy-check.mjs --json` for the full term values).

Captured 2026-10-25T09:41:02Z at lane git HEAD `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`, node v24.21.0. The working tree was clean apart from this wave's untracked `.ufo/waves/round-61/` outputs.

## Exit codes and verdicts (quoted)

| Script | Exit | Verdict line |
|---|---|---|
| `proxy-check.mjs` | 1 | `PROXY: DRIFT (A_DRIFT term=A declared=105 computed=108 delta=+3; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)` |
| `readme-map.mjs` | 1 | `README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md` |
| `kimi-census.mjs` | 1 | `KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/)` |
| `sources-check.mjs` | 0 | `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 status=queued:13,mined:101,rejected:19 entries_with_source=18 legacy=38)` |

## Observed facts

- **Proxy has three drift findings** (SCORECARD stanza at line 287):
  - A is declared as 105 but computes to 108 (+3).
  - C2_total is declared as 145 but computes to 146 (+1). C2 itself is 145, so the computed ratio is 145/146.
  - The `## Axes` coverage row says 10, but coverage derives to 9.
  - All other terms match: C=30, C1=19/19, operability=9, S=88/88, R=92/92, coverage_script=10, coverage_runtime=10, C1k=5/5, K=52/52, coverage_kimi=10, and all 6 script pins.
- **The proxy's `src-rev=31c465f15669` is the pinned origin tree**, not this lane's HEAD. `.ufo/pins/origin.json` pins `ufo-fsd-alpha@31c465f15669f744848bd9f5d56191c5085670f7`, with the clone at `/fast/scratch/hyaku/kumitate-pin/src`. HEAD matched the pin, so there was no fail-closed result.
- **readme-map:** 146 files against 145 rows. `lessons/round-60-verifier-spotcheck.md` is uncovered by a README row and also unpinned (`note unpinned:`). The script reports `bad=2`; both visible notes name that same file.
- **kimi-census:** `search-index/` is absent under `/home/vgpnk/.kimi-code`; I confirmed this with `ls`, which returned no such file. That is the only error. Family K3 prints `members=9 checked=9 frozen=10`, where frozen is greater than members. Totals: `members=52 checked=52 errors=1 info=4 chain=10`.
- **sources-check:** two `USED_BY_ASYMMETRY` warnings. S028 and S124 both have `used-by` lists that omit `corpus/knowledge/failure-recovery-replay.md`. There is also an info finding: `LEGACY_NO_HEADER count=38`.

## Inference

- `[INFERENCE]` The coverage AXES_DRIFT (10 to 9) is most likely downstream of C2_total going from 145 to 146: C2 is no longer full, so derived coverage drops one point. Updating the declared C2_total alone would not restore 10; that needs C2=146 (one more covered row) or a re-declared axis row.
- `[INFERENCE]` The readme-map drift (146 files, 145 rows) and the C2_total +1 are probably the same new file, `lessons/round-60-verifier-spotcheck.md`. Adding its README row is likely to clear both readme-map and C2/coverage. I did not verify this by running the scripts again after a fix.

## Unresolved

- The source of A +3 was not traced; that needs the claims-gate walk of the pinned src.
- The meaning of K3 `frozen=10 > members=9` was not traced. It is not gated by the script.
- The second `bad` entry in readme-map is not separately named in the output.

## Notes

- No tools were installed or updated.
- At the start I ran a read-only `jj log -r @`; jj may auto-snapshot the working copy as part of that. No other jj commands were run.
