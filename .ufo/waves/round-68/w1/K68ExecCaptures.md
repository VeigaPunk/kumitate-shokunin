VERDICT: All seven prescribed C2 captures are materialised in the lane build tree with sha256+bytes+URL+timestamp in MANIFEST.tsv and 35/35 quote checks reproducing the pinned text, but three of the seven names/URLs cannot carry the quotes their seat briefs demand (S208 "Three months after"; S211 "2025-11-05"; S213 "Mark SEPs as final"), so the L1 must bind rows to the URLs that actually contain the quotes or M4/M5 MISS at counting time.

## Evidence

Fetch pass (single controlled run, all 200, seat K68ExecCaptures, 2026-10-27T14:57:39–41Z; hashes re-verified after the write):
```
deprecated-2026-07-28.md   200  3839   https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
feature-lifecycle.md       200  8794   https://modelcontextprotocol.io/community/feature-lifecycle.md
sse-v18.12.6.ts            200 15183   https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
sep2596.md                 200 25830   https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md
transports-2025-11-05.md   200 16321   https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md
sse-v18.13.1.ts            200 15183   https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts
pr2596-commits-api.json    200 90480   https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596/commits
```
`sha256sum` of those seven (verbatim, `build/captures/EVIDENCE.txt`):
```
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  deprecated-2026-07-28.md
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  feature-lifecycle.md
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  sse-v18.12.6.ts
cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468  sep2596.md
ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc  transports-2025-11-05.md
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  sse-v18.13.1.ts
088d1f8d614ed50c39f109745331738517f7aa80a119d9d061a62969a6b18ffc  pr2596-commits-api.json
```
Provenance by independent fetch (full matrix in `build/captures/PROVENANCE.tsv`): S207 c12c3cb7… = K68ScoutLiveRefetch/207.bin = K68ScribeRows S207 = K68ScribeEntry S207 (K68ScoutS207's file is that body behind one `<!-- fetched -->` line; `diff <(tail -n +2 …) captures/deprecated-2026-07-28.md` → empty). S208 3f33719… = LiveRefetch/208.bin = ScribeRows = ScribeEntry (K68ScoutS208 header records `body_sha256: 3f337191…`). S209/S212 0b69229… = LiveRefetch/209,212 = ScribeRows = ScribeEntry = round-66 `K66ScribeGate/captures/sse.ts` (K68ScoutS209's file is the same body behind a 6-line header: `tail -n +7 | sha256sum` → 0b69229a…). S211 ae9bb7b… = LiveRefetch/211.bin = ScribeRows S211b = ScribeEntry S211. S210 sep2596.md cc50162… = round-66 `K66ScribeGate/captures/sep2596.md`, and a second fetch of the same URL was byte-identical.

Quote verification (`node build/captures/verify-quotes.mjs`, full log `verify-quotes.txt`), using the frozen counter's own `norm`/`nwords`/`wb`:
```
VERIFY_QUOTES: PASS cases=35 failed=0
ok   S207 present words= 7 "First revision released on or after 2027-07-28"
ok   S207 present words= 6 "Three months after SEP-2596 reaches Final"
ok   S208 present words= 9 "The minimum deprecation window is counted from that release."
ok   S208 absent  words= 3 "Three months after"
ok   S209/S212 present  "export class LegacySseTransport implements MCPTransport {"  (+5 more scout quotes)
ok   S210 present words= 7 "Three months after this SEP is Final"   (sep2596.md:257)
ok   S210 absent  words= 1 "2026-06-03"
ok   S211 present words=10 "Clients and servers can maintain backwards compatibility with the deprecated"
ok   S211 absent  words= 5 "This replaces the [HTTP+SSE transport]"
ok   S213 absent  words= 4 "Mark SEPs as final"      (pr2596-commits-api.json)
ok   S213b present words= 4 "Mark SEPs as final"     (extra capture commit-183238ddac.json)
```
Entry-mode self-test (the harness also accepts `--entry <entry.md>` and parses `- S### — "quote"` bullets): a 9-bullet synthetic entry → `ENTRY_MODE: PASS bullets=9 failed=0`; a 2-bullet bad entry → `ENTRY_MODE: FAIL bullets=2 failed=2`, so the check is non-vacuous (`verify-quotes.txt`).

## Findings

**K68ExecCaptures-1 — high — the S208 brief's mandatory quote is not on S208's page.** `feature-lifecycle.md` contains "twelve" but no "Three months after" anywhere (`grep -c 'Three months after' build/captures/feature-lifecycle.md` → 0). A bullet `S208 — "Three months after…"` therefore fails M4 `quote-not-in-capture` and M5. The phrase lives on S207 (`deprecated.md:31`, "Three months after SEP-2596 reaches Final") and S210 (`sep2596.md:257`). Reproduce: `node build/captures/verify-quotes.mjs | grep 'S208 absent'`.

**K68ExecCaptures-2 — high — `transports-2025-11-05.md` cannot be a 2025-11-05 capture.** Both `…/2025-11-05/basic/transports` and `…/transports.md` answer 404 (`404 127278` / `404 831`), and the 2025-11-05 revision root 404s too; the live page is the 2025-11-25 revision (`200 16321`, `ae9bb7be…`), which does not even contain the string "2025-11-05". The file is filled with the 2025-11-25 bytes and MANIFEST records that URL, so the name is a misnomer the L1 should rename at pin time (`transports-2025-11-25.md`). The S211 brief's scope sentence is also off-anchor: the registry's HTTP+SSE row reads `Deprecated in: 2025-03-26` ("Earliest removal: Three months after SEP-2596 reaches Final", `deprecated.md:31`) — `2025-11-25` is the *includeContext* row's value (`:30`). Reproduce: the 404/200 lines in `EVIDENCE.txt`.

**K68ExecCaptures-3 — high — the GitHub PR page is not capturable evidence.** Three consecutive fetches of `https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596` seconds apart gave identical byte counts with three different digests (`fetch1 bytes=502463 sha=5aefbb52…`, `fetch2 … sha=f2fb553c…`, `fetch3 … sha=b27ed12f…`; earlier fetches 502434/502429/502427), and the page carries none of the SEP grace text (`three-months-quote=0 grace-quote=0`). Pinning the PR HTML as S210's capture therefore (a) is a hash that can never be re-derived and (b) cannot back a SEP-text bullet for M5. My `sep2596.md` (.io markdown render, 25830 B, re-fetch byte-identical) carries the quotes; `pr2596-api.json` (extra) carries the byte-stable `merged_at 2026-05-18T18:09:21Z`.

**K68ExecCaptures-4 — medium — the Final flip is outside PR #2596's commit list.** `pr2596-commits-api.json` holds 18 commits, last `de05e1ef 2026-05-18T17:31:18Z` ("Merge main into sep/spec-feature-lifecycle-and-deprecation"); neither "Mark SEPs as final" nor `2026-06-03` occurs in it. Commit `183238ddacd0118a22399cd4743a5b5eaa43dbdd` is a separate record: message "Mark SEPs as final", author=committer `2026-06-03T20:45:19Z`, parent `a20715022ca8`, 20 files incl. `docs/seps/2596-spec-feature-lifecycle-and-deprecation.mdx`. S213's Final-date bullet must be pinned to the commit endpoint (`commit-183238ddac.json`, 58610 B, `6f3f5979…`), not the PR commits API. Reproduce: `node build/captures/verify-quotes.mjs | grep '^ok   S213'`.

**K68ExecCaptures-5 — medium — the counter's matcher keeps blockquotes and inline links, so docs-page quotes can silently MISS.** `norm()` strips `**`/`__`/backticks and HTML tags but not `>` or `[text](url)`. The 2025-11-25 page's natural "This replaces the HTTP+SSE transport from protocol version 2024-11-05" sits inside a `> [!NOTE]` blockquote with an inline link and does not match; the same sentence with the link text only also fails (`S211 absent words=5`). Safe S211 quotes are plain prose: `:281` "Clients and servers can maintain backwards compatibility with the deprecated" and `:305` "the old HTTP+SSE transport, and should use that transport for all subsequent".

**K68ExecCaptures-6 — low — S212's capture is byte-identical to S209's.** `cmp sse-v18.12.6.ts sse-v18.13.1.ts` → `identical`; both sha `0b69229a…`. Two rows/two tags, one content: legitimate, but M8 must not treat S212 as an independent second observation of the transport's shape.

**K68ExecCaptures-7 — low — GitHub API JSON is not byte-stable across serializations.** The same PR-commits URL returned a pretty body (102170 B) on one fetch and a minified body (90480 B) on the next; `json.load(a) == json.load(b)` is True (same 18 commits/shas). K68ScoutS213's copy is a `{_fetched, body}` wrapper (99864 B) whose `body` parses equal to mine. Pins must hash the committed file, never re-derive a hash from a re-fetch.

## Artifacts

- `build/captures/{deprecated-2026-07-28.md, feature-lifecycle.md, sse-v18.12.6.ts, sep2596.md, transports-2025-11-05.md, sse-v18.13.1.ts, pr2596-commits-api.json}` — the seven, byte-exact, no headers added.
- `build/captures/MANIFEST.tsv` — name, sha256, bytes, source URL, fetched UTC (7 rows + comment header).
- `build/captures/EXTRA-MANIFEST.tsv` + extras `commit-183238ddac.json` (S213 Final record), `pr2596-api.json` (`merged_at`), `transports-2024-11-05.md` (the revision that defines HTTP+SSE).
- `build/captures/PROVENANCE.tsv` — per-capture cross-seat byte agreement and every divergence.
- `build/captures/EVIDENCE.txt` — 404 matrix, PR-page drift (3 fetches, 3 digests), capture hashes, `cmp` result.
- `build/captures/verify-quotes.mjs` + `verify-quotes.txt` — 35-case quote check (counter semantics) and `--entry <entry.md>` mode for re-checking the landed entry; `VERIFY_QUOTES: PASS cases=35 failed=0`.

## Limits

- Site builds and scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecCaptures/` deleted after copying receipts; no scratch path is cited.
- Did not run the frozen counters (L1 owns measurement); no M5 live replay by me beyond the fetches above.
- Scout captures for S210/S211/S212 were still empty at my final sweep (2026-10-27T15:00Z); if those seats land their own quote lists later, re-run `node build/captures/verify-quotes.mjs` (casemode) / `--entry` before pinning.
- `sep2596.md` is the `.io` markdown render, not the raw `docs/seps/….mdx` source (`ScribeEntry` copy, 26389 B, `6608969b…`); both carry the grace clause, formatting differs.
- S201–S206 (the OMP revision rows) are out of this seat's scope and unverified here.
