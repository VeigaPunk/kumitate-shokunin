PREREG C3=matches

## Scope and axes
Judged `coverage:kimi-layer` within the round-35 build axes (`operability`, `coverage:script-layer`, `coverage:kimi-layer`). This is a read-only pre-registration compliance review; no production files were edited.

## Rule and pre-registration
SCORECARD.md:950-952 states: “a registry change (e.g. re-drawing a family boundary) must be pre-registered a round ahead of the round that measures it, as in rounds 12→13.” The same discipline is stated at SCORECARD.md:777: “a registry change is pre-registered a round ahead of the round that measures it”.

SCORECARD.md:440-449, under `## Planned`, pre-registers: “coverage:kimi-layer — registry change K1 3 → 4 (root `~/.kimi-code/mcp.json`)”; the member is “shape-only (presence + kind + mode floor, the `server.token` pattern; never content-read)”; `scripts/kimi-census.mjs` MEMBERS + FROZEN K1 4, `scripts/proxy-check.mjs` K rules, the `K_members` stanza change 50 → 51 and `## Axes` travel together; the existing section in `corpus/knowledge/kimi-mcp-plane.md` makes the target 51/51 ⇒ 10. Falsifiers: “census not CLEAN, any content open of the file under strace, K_sections ≠ 51.”

## Match judgment
C3 matches all named registration elements:
- **Member/family:** exact root `~/.kimi-code/mcp.json`, added to K1 (3 → 4).
- **Shape:** shape-only, presence/kind/mode-floor checked, never content-read.
- **Co-landing:** census MEMBERS + FROZEN K1 4, proxy K rules, stanza and `## Axes` together.
- **Target:** K_sections/K_members = 51/51; `floor(10 × 5/5 × 51/51) = 10`.
- **Falsifiers:** CLEAN census, no content-open under strace, and K_sections exactly 51. The build-context summary restates CLEAN and 51/51 but omits the strace arm; the full pre-registration remains binding, so do not drop that check.

Evidence for the baseline and target: `.ufo/waves/round-35/baseline/kimi.txt` reports `FAMILY K1 members=3 checked=3 frozen=3`, `TOTALS: members=50 checked=50 errors=1`, `UNLISTED mcp.json`, and `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`. The claim stanza currently has `K_members=50`, `K_sections=50`, `coverage_kimi=10` (SCORECARD.md:277-303). The existing heading is `corpus/knowledge/kimi-mcp-plane.md:21`, `## `~/.kimi-code/mcp.json``; the proxy heading matcher strips the `~/.kimi-code/` prefix, yielding the canonical identity `mcp.json` (scripts/proxy-check.mjs:662-681). The live file was shape-checked only: `stat -c '%a %F %s' ~/.kimi-code/mcp.json` → `644 regular file 249`.

## Findings and L1 deviations to avoid
**Low — pre-registration citation drift.** The item cites `SCORECARD.md:935-938` and “the round-13 ‘Not a move, queued’ bullet” (SCORECARD.md:442-443). At this file state, lines 935-938 are the “Which one the lane intends” prose; the rule is at 948-952, and the sole “Not a move, queued” bullet there references rounds 12→13. This does not change the substance or make C3 unregistered; avoid propagating the stale line range/label.

**Implementation traps for the L1:**
1. Update both stanza member terms: `K_members=51` **and** `K_sections=51`; leaving the latter at 50 triggers `K_SECTIONS_DRIFT` despite the unchanged score of 10. Keep `C1k/C1k_total=5/5` and `coverage_kimi=10`. Recompute both `pin.kimi-census` and `pin.proxy-check` because both scripts change.
2. Preserve the registered shape. In kimi-census, the mode-floor check is inside `if (m.secret && kind !== 'absent')` (scripts/kimi-census.mjs:307-315); `server.token` uses `kind:'file', secret:true, modeFloor:0o600` (line 128). Thus a non-secret entry would not enforce the registered floor, while `secret:true` without `modeFloor` would fail its shape check. The proxy's `kMembers` checks presence/kind only; it has no mode-floor logic (scripts/proxy-check.mjs:620-657; its server.token rule is at line 366). Mirror the existing split rather than claiming the proxy enforces a floor. The observed live mode 0644 satisfies a 0600 bit floor: `(0o644 & 0o600) === 0o600` (checked with Node); no host chmod is needed.
3. Update the census selftest as part of the tool change. `fixtureTree()` derives files from MEMBERS (scripts/kimi-census.mjs:434-458), while selftests hardcode 50 members, 28 member rows, K1=3 and frozen K1=3 (lines 512-540, 695-796). In particular, replace the test at lines 718-725 asserting that root `mcp.json` remains UNLISTED; it must no longer assert the pre-change behavior. Keep an UNLISTED test for a different stray if needed.
4. Update the K1 registry member cell in SCORECARD.md:137 to name mcp.json; retain the `yes` prefix in its fourth cell so C1k remains 5/5. Update the current `## Axes` description at SCORECARD.md:311 that says mcp.json stays outside K until this change. The score remains 10. Update the now-stale registry-status text in kimi-mcp-plane.md:16-18 (“not yet a K member” / “not the membership”).
5. Keep the file in K1, not K5. Do not read its content. Execute the registered strace falsifier on the measurement run; the census's implementation uses lstat/readdir for the live tree, but this review did not exercise strace.

The proxy selftest fixture currently contains 29 K members and omits mcp.json (scripts/proxy-check.mjs:1140-1170, 1310-1315). Its count remains 29 if that fixture intentionally leaves the new member absent; if it is made complete by adding mcp.json, update its hand-calculated expectations accordingly. [INFERENCE] A targeted proxy selftest for the newly added identity would improve coverage, but is not itself a preregistered acceptance condition.

## Verification gaps / residual risk
- No implementation diff exists in this review input, so post-change co-landing, pins, CLEAN/51/51, and the strace falsifier are not verified. [INFERENCE] Those remain acceptance checks for the L1, not grounds to change the `matches` preregistration verdict.
- No tools were installed or updated.

## Commands and observed output
- `grep -n 'pre-registered' SCORECARD.md` → hits at 86, 442, 777, 951 (among others); `grep -n 'pre-registered a round ahead' SCORECARD.md` → 442, 777, 951.
- `sed -n '435,470p' SCORECARD.md` → `## Planned`; item 1 contains the round-35 K1/mcp.json registration and all quoted criteria above.
- `cat .ufo/waves/round-35/baseline/kimi.txt` → `members=50 checked=50 errors=1`; `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`, `exit=1`.
- `awk '/<!-- kumitate-proxy-v1/,/-->/' SCORECARD.md` → `K_members=50`, `K_sections=50`, `coverage_kimi=10`.
- `grep -n '^## ' corpus/knowledge/kimi-*.md | grep -i mcp` → only `kimi-mcp-plane.md:21:## `~/.kimi-code/mcp.json``.
- `stat -c '%a %F %s' ~/.kimi-code/mcp.json` → `644 regular file 249` (shape only).
- `node -e "console.log((0o644 & 0o600) === 0o600, (0o644 & 0o600).toString(8))"` → `true 600`.
- `grep -n 'Not a move' SCORECARD.md` → only line 948; the rule phrase is at 951.
