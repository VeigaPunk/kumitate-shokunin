VERDICT: The staged deprecation theme diverges from the lane's re-grounded entry on the clock (three staged readings — Created 2026-04-17, merge 2026-05-18, and a 12-month revision cure — all rejected vs the lane's Final 2026-06-03 → grace elapsed 2026-09-03), on one staged recheck path that 404s live today, and on three meta-corrections whose diagnosis is right but whose cure contradicts the SEP §Transition clause the lane anchors on; full per-file table in build/K68ConnectorStaged/divergence.md.

## Evidence

Lane side (the re-grounded entry is a build artifact, not yet in corpus):
- `corpus/knowledge/mcp-deprecation-registry.md` absent at freeze (`ls corpus/knowledge/ | grep deprec` → no match; plan :107-108 expects that).
- Lane draft `.ufo/waves/round-68/build/K68ScribeEntry/mcp-deprecation-registry.md` — scored `DEPREC68_HELD held=10/10` on a fixture (its `counter-receipts.md` R4/R5). Key lines: `## The live clock` :79-95 — Final 2026-06-03 via S213 (commit `183238ddac` "Mark SEPs as final", `Date: Wed, 3 Jun 2026`), grace elapsed **2026-09-03**; :93-95 "the pull merged as commit `219f8242` while the SEP still read `Draft`, and the `Final` flip is a *later* commit"; :35 S210 quote "three-month grace period from the date this SEP reaches Final" (the SEP §Transition clause the registry cell restates); :49-54 snapshot = the live 6-row table.
- Frozen plan C2 (:103-104): "the registry's HTTP+SSE clock resolves to **SEP-2596 Final 2026-06-03 (commit `183238ddac` …) + the registry's three-month grace → elapsed 2026-09-03** … the staged theme's 2026-04-17-Created and 2026-05-18-merge readings are disproven and must not enter".

Staged side (`/home/vgpnk/Projects/shokuknow/merge/kumitate/`, read-only):
- `mcp-feature-deprecation-registry.md:66-70`: "SEP-2596 reached Final on 2026-04-17; three months later is 2026-07-17; the 2026-07-28 revision shipped eleven days after that" — Created-based clock.
- `mcp-deprecation-registry-timing-2026-10-27.md:51-53`: "The SEP reached **Final** on **2026-05-18** … the earliest removal is **2026-08-18**" — merge-based correction.
- `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md:90-99` + `deprecation-clock-narrative-record-2026-10-27.md:66-71` + `deprecation-clock-corrections-2026-10-26.md:49-54`: third family — 12-month revision clock, earliest removal = 2026-07-28.
- `sep-2596-merge-timestamp-surfaces-2026-10-27.md:2-4` recheck: `curl -fsSL 'https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pull/2596' | grep -c '"merged_at"'` recorded `-> 1`; body :17 "HTTP 200 and 29,988 bytes". Its own S334 row (SOURCES.append.md) uses the **plural** `pulls/2596`.
- `sep-2596-merge-timestamp-surfaces-2026-10-26.md:32-33`: "a rate-limit refusal … a 106-byte body and an HTTP status that is not 200".

Live re-tests 2026-10-27 (my run, cwd = seat scratch):
```
curl -w 'http=%{http_code} bytes=%{size_download}' https://api.github.com/.../pull/2596   -> http=404 bytes=106
curl -w 'http=%{http_code} bytes=%{size_download}' https://api.github.com/.../pulls/2596  -> http=200 bytes=29988
curl ... specification/draft/deprecated.md          -> http=200 bytes=3804
curl ... specification/2026-07-28/deprecated.md     -> http=200 bytes=3839
curl ... pull/2596/commits                          -> http=200 bytes=396697
curl ... specification/2025-03-26/basic/transports.md -> http=200 bytes=14074
grep -c -F 'Three months after SEP-2596 reaches Final' on live draft registry -> 1
```
106 bytes = the 404 body — the "rate-limit refusal" the staged set narrated is the singular-path 404, not a queue.

Prior lane verdicts (round-66 wave, same theme): `K66ScoutStagedTheme/verdicts.md` — 13 theme files, 6 admit / 1 admit-with-fix / 6 reject-as-staged; `K66ScribeGate-2` first measured the `/pull/` 404; `K66ReviewStagedClaims-1/-2` disproved the 2026-08-18 correction and the 12-month cure.

## Findings

- **K68ConnectorStaged-1 (high; attacks the staged entry's worked example)** — Created-based clock vs lane's Final-based clock. `mcp-feature-deprecation-registry.md:66-70` computes eligibility 2026-07-17 from `Created 2026-04-17`; the lane computes grace-end 2026-09-03 from the Final event (S213). The staged "already eligible when the revision shipped" is disproven (grace ended 37 days *after* 2026-07-28). Repro: `grep -n '2026-04-17\|2026-07-17' …/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md` vs lane draft :84-88.
- **K68ConnectorStaged-2 (high; attacks the staged amendment's recheck)** — the `404 recheck path`. `sep-2596-merge-timestamp-surfaces-2026-10-27.md`'s recheck uses `pull/2596` (singular) → live 404 today; `pulls/2596` → 200, 29,988 bytes — the exact size the file records, so it fetched the plural path but cited the singular one. Its "rate limit was a queue" story rests on sibling `-10-26`'s 106-byte non-200 body, which is the 404 body. `curl -f` exits before grep, so the recorded `-> 1` cannot be produced by the cited command. Repro: the two curls in Evidence. Lane is unaffected — its Final record is S213's commit-`.patch`, no API dependency.
- **K68ConnectorStaged-3 (high; attacks the staged "cure")** — `sep-2596-final-date-…-10-26`, `deprecation-clock-corrections-…-10-26`, `deprecation-clock-narrative-record-…-10-27` all prescribe the 12-month revision clock for HTTP+SSE (earliest removal = 2026-07-28) and call the three-month cell "the policy's opposite … in the wrong document". The lane rejects the cure: the cell is the SEP §Transition clause restated (lane draft :35,:85-86; S210 quote). Narrative-record's conclusion that the CJK accounts carry "the wrong rule" is itself wrong — those carriers are right.
- **K68ConnectorStaged-4 (medium; staged internal contradiction)** — staged `deprecation-decision-roles-…-10-25.md:34-35` says unified.to's 2026-09-23 retirement is "before the registry's own three-month grace … would have expired"; under the lane's clock (grace end 2026-09-03) the retirement is 20 days **after** expiry. Same stale-clock defect class as -1.
- **K68ConnectorStaged-5 (medium; coverage)** — staged SOURCES row **S241** (`pulls/2596`) teaches "SEP-2596 reached Final on 2026-05-18" — the merge-as-Final error embedded in a registry row's teaches cell, even though its URL is correct. Rejecting the claim requires rejecting the cell, not the carrier.
- **K68ConnectorStaged-6 (low)** — staged `sep-2596-status-and-merge-dates-…-10-25.md:59` says grace-end 2026-09-03 is "five days after the revision"; it is 37 days. Direction right, magnitude wrong; lane doesn't inherit it.
- **K68ConnectorStaged-7 (info)** — the three `amendments/` files: `mcp-orchestration-contract.md` is entirely already-held lane content (its S195/S197/S206 are the lane's S125/S127/S136 pages under renumbers; MERGE-REPORT :96-101); the two durable-execution files are off-theme. None needs a lane verdict beyond "not absorbed".

## Artifacts

- `.ufo/waves/round-68/build/K68ConnectorStaged/divergence.md` — the deliverable: staged file | core claim | lane verdict (agree/supersede/reject) | located evidence, covering all 13 theme files, the three clock readings, the 404 recheck path, the three `amendments/` files, the deprecation-adjacent carriers, and the staged S-rows; ends in a Gate-ready admit/reject list.
- `.ufo/waves/round-68/w1/K68ConnectorStaged.md` — this report.

## Limits

- The lane-side verdicts are read off the K68ScribeEntry draft + frozen plan; the entry is not yet integrated into `corpus/` (L1-owned). If the L1 edits the draft, verdicts keyed to its line numbers shift.
- "Three staged amendments" is ambiguous: I covered both readings — the three `amendments/` files and the three theme-internal correction layers (r7 timing, r14 cure/meta, r15 amendment). The one AMENDMENT-titled theme file is the 404 carrier.
- Live fetches are point-in-time 2026-10-27; `/pulls/2596` is rate-limited (60/hr unauthenticated) but returned 200 on first hit; `/pull/2596` 404 was consistent across the run and matches K66ScribeGate's earlier observation.
- I did not re-verify every staged recheck URL (25+); I tested the six load-bearing ones — all 200 except `pull/2596`.
- CJK page content was not re-translated; verdicts rest on the round-66 seats' readings plus the staged quotes.
