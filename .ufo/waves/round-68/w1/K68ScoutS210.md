VERDICT: SEP-2596 defines a feature deprecation/removal policy; its HTTP+SSE grandfathered removal clock is three months from Final, and the PR timeline records Final on 2026-06-03.

## Evidence

- Fetch command: `curl -sS -L -D "$S/headers.txt" -o "$S/pr2596.html" "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596"`; recorded first header line: `HTTP/2 200`; HTML body: 502428 bytes.
- SEP diff fetch: `curl -sS -L -H "Accept: application/vnd.github.v3.diff" -o "$S/pr2596.diff" "https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596"`; body: 57968 bytes. Public `.diff` URL returned `HTTP/2 302` with `location: https://patch-diff.githubusercontent.com/raw/modelcontextprotocol/modelcontextprotocol/pull/2596.diff`; its body was byte-identical (`cmp`: `IDENTICAL`).
- PR API fields observed: `title: SEP-2596: Specification Feature Lifecycle and Deprecation Policy`; `state: closed`; `created_at: 2026-04-17T17:50:11Z`; `merged_at: 2026-05-18T18:09:21Z`; `merge_commit_sha: 219f82421ce13f6b0d9f786e603cf9a659fd5216`; labels at fetch: `['SEP', 'final']`.
- Event API status sequence: `2026-04-17T17:52:13Z labeled draft`; `2026-04-22T17:05:06Z unlabeled draft / labeled in-review`; `2026-05-13T16:27:23Z unlabeled in-review / labeled accepted`; `2026-05-18T18:09:21Z merged, closed`; `2026-06-03T17:07:09Z unlabeled accepted / labeled final`.
- Live rendered SEP fetch: `curl -sS -L -D "$S/live-headers.txt" -o "$S/live-sep.html" "https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation"`; recorded status `HTTP/2 200`; page text says: `This SEP has reached Final status and is preserved as a historical record of the design as accepted.`
- Canonical added file extracted from PR diff: `seps/2596-spec-feature-lifecycle-and-deprecation.md`, 380 lines. It says ordinary window is at least twelve months, measured from release of the revision in which marked Deprecated, not SEP Final; earliest removal is first Current revision released on/after that window. Transition reclassifies two pre-existing informal deprecations. HTTP+SSE earliest removal: `Three months after this SEP is Final`; includeContext values follow SEP-2577/Sampling schedule.
- Quote matching checked against capture using the deprec68 probe's normalization and word-boundary behavior. PR-body quotes are live matches against PR HTML; SEP transition quotes are live matches against `.diff`/rendered SEP, not the assigned PR-page HTML. `quotes.txt` records the distinction.

## Findings

1. **K68ScoutS210-1 — coverage / source contract.** SEP-2596 distinguishes feature states Active, Deprecated, Removed; retires “soft-deprecated”; standard deprecation SEP specifies a minimum window >=12 months, counted from the Current revision release, not SEP Final. Repro: open `captures/sep2596.md`, section “SEP-2596 canonical text”, lines corresponding to `Feature states`, `Deprecating a feature` (capture canonical lines 72, 95–115). Quotes are in `quotes.txt`.
2. **K68ScoutS210-2 — date-mechanics distinction.** Only the two already-informal deprecations receive grandfathering. HTTP+SSE's earliest removal is three months after this SEP reaches Final, with removal still requiring a Core Maintainer release-preparation decision; includeContext follows Sampling/SEP-2577. Final label event is 2026-06-03, so the arithmetic date is 2026-09-03 (inference from captured event and three-month clause). Repro: inspect canonical Transition section around lines 216–244 and event list in capture.
3. **K68ScoutS210-3 — status history / live-fetch limitation.** PR labels progressed draft → in-review → accepted → final; merge/close happened 2026-05-18 before the final label event 2026-06-03. The assigned PR page does not contain the full SEP transition quote: M5 must use a row URL serving the SEP text (rendered docs or `.diff`) to validate it live. Repro: `grep -n "Three months after\|labeled final\|merged" captures/sep2596.md`; compare PR-page and `.diff` URLs noted in capture/quotes.
4. **K68ScoutS210-4 — tier.** Tier B is appropriate: GitHub PR is a community-class surface, not the canonical published specification; SOURCES-CONTRACT-v1 states `community` is never tier A. One-line rationale included in `row-S210.md`.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutS210/captures/sep2596.md` — fetched response header, 502428-byte PR HTML page bytes, API metadata/events, and verbatim canonical SEP text; fetch surfaces/URLs distinguished.
- `.ufo/waves/round-68/build/K68ScoutS210/captures/pr2596-page.headers.txt`
- `.ufo/waves/round-68/build/K68ScoutS210/captures/pr2596-diff.headers.txt`
- `.ufo/waves/round-68/build/K68ScoutS210/captures/pr2596.diff`
- `.ufo/waves/round-68/build/K68ScoutS210/captures/sep2596-canonical.md`
- `.ufo/waves/round-68/build/K68ScoutS210/quotes.txt`
- `.ufo/waves/round-68/build/K68ScoutS210/row-S210.md`

## Limits

- This seat did not edit lane sources, SOURCES.md, pins, or the eventual registry; L1 must select the row URL/capture binding consistently with the M5 live-quote constraint.
- The PR page HTML does not include the entire change diff. Full SEP wording was fetched from PR `.diff`; rendered docs page was separately checked live. No independent citation was made to the 2026-07-28 release artifacts or installed OMP behavior.
- No build/test/lint checks run; this is source scouting. Scratch files were removed before yield.
