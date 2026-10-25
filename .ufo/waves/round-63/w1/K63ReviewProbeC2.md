VERDICT: The frozen C2 counter (rule T63 v1) is forgeable end-to-end — a lane whose only "sources" are pages it serves from `127.0.0.1` reads `TOPOLOGY63_HELD held=7/7` exit 0, because every anchor T1–T7 reads (registry row, capture pin, URL) is lane-authored and the one external check (T5 live fetch) is pointed at the forger's own server.

## Evidence

Base sanity (counter matches its frozen base receipt):
```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dfa6fca8f362e9c962f5b940025a2619380b759b
TOPOLOGY63_UNMET held=1/7 checks=7 rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
exit=1
```
Attack battery (`node /tmp/kumitate-r63/K63ReviewProbeC2/gen.mjs`, generator copied to build dir; fixture repos in `mktemp -d` + `git init`, fixture identity inside them only; the frozen probe executed in place, never modified; invocation convention `--entry corpus/knowledge/bounded-redelivery-budgets.md --opened 2026-10-24` — the same flags the frozen controls use, counter logic identical):
```
AS-EXPECTED x1-full-forgery exit=0 :: TOPOLOGY63_HELD held=7/7 checks=7 rev=294c2f5cb791e1012674620e7c69ae76931a9ef2 rule=T63
AS-EXPECTED x2-usedby-substring exit=0 :: TOPOLOGY63_HELD held=7/7 checks=7 rev=097beadc5954de749e9498296d0b15fb256807a2 rule=T63
AS-EXPECTED x3-one-word-bullets exit=0 :: TOPOLOGY63_HELD held=7/7 checks=7 rev=e0d6665a6ed411ff1dc3b5af23c8155c835bd7cd rule=T63
AS-EXPECTED x8-vacuous-t5 exit=1 :: TOPOLOGY63_UNMET held=3/7 checks=7 rev=46cf0846d68625b27fc19dc1b43d0acac177af66 rule=T63 | T1 MISS trio source=false verified-at=true recheck=true | T2 MISS cites-0-rows | T3 MISS no-rows | T4 MISS S196:not-a-source;…;S197:not-a-source
AS-EXPECTED x10-province-junk-line exit=0 :: TOPOLOGY63_HELD held=7/7 checks=7 rev=4f40b8fd582f30517026d3cfeab319f0b309f0b0 rule=T63
AS-EXPECTED x7a-dup-id-real-census exit=1 :: TOPOLOGY63_UNMET held=6/7 checks=7 rev=71fb1a0d70a21fb5e1dc7c42035bdcf9b9fae874 rule=T63 | T6 MISS census-exit=1
AS-EXPECTED x7b-dup-id-fake-census-env exit=0 :: TOPOLOGY63_HELD held=7/7 checks=7 rev=71fb1a0d70a21fb5e1dc7c42035bdcf9b9fae874 rule=T63
d1-comment-channel hit=false (expected false)
d2-escaped-pipe census-exit=1 probe-NF=14
```
x1 fixture contents: two forged Registry rows S196/S197 (URLs `http://127.0.0.1:<port>/S196.html`, `/S197.html`), two committed captures `.ufo/pins/captures/S196.html`/`S197.html` with lane-computed pins appended to `.ufo/pins/source-captures.json`, entry `source:` line rewritten to cite only S196/S197, six bullets, readme-map repair. A local node HTTP server serves the capture bytes live. Census stays clean (kind=docs, tier=A, mined, opened 2026-10-24, recheck 90d, used-by exists, unique URLs).
Version-pin check in the counter: `grep -n 'v3\|version\|arxiv\|arXiv' topology63-probe.mjs` → no code matches (only doc-comment line 27 mentions readme-map). Census splits cells with raw `gawk -F'|'` (sources-census.sh:625), no `\|` unescaping.

## Findings

1. **K63ReviewProbeC2-1 (critical) — T5 binds the URL to nothing; whole claim forgeable with one local server.** The row's URL cell is lane-written (probe:170 reads it from the lane's own Registry row), the capture pin is lane-computed (T3 only checks internal hash/size consistency, probe:99-107), so a forger adds row + capture + pin + self-hosted page and every arm passes. Repro: `node .ufo/waves/round-63/build/K63ReviewProbeC2/gen.mjs` → x1-full-forgery.txt: `TOPOLOGY63_HELD held=7/7 … exit=0`. Closing check: the counter must take each row's URL from a non-lane anchor recorded at freeze (plan/controls allowlist of domains, or the counter itself re-derives the URL from the frozen plan's row spec), not from the lane's registry cell.
2. **K63ReviewProbeC2-2 (high) — norm() counts invisible and non-contiguous text as "located quotes".** probe:57-65 strips tags to spaces: `display:none`/`hidden` span text survives (x1 bullet 3 passes), text stitched across table rows/cells joins (x1 bullet 2), and two sentences separated by a `<script>` block become adjacent (x1 bullet 5) — all pass T4+T5. HTML comments are the one closed channel (d1: comment content is stripped whole, hit=false). Closing check: strip `display:none|visibility:hidden` blocks and `hidden` attributes, and require the quote to match inside one block-level element (no cross-cell/row stitching).
3. **K63ReviewProbeC2-3 (high) — no minimum quote substance.** Six one-word bullets `- S196 — "the"` ×3, `- S197 — "the"` ×3 read HELD 7/7 (x3; probe:155 counts words only, no floor, no char floor). "Located quotes" carries zero evidentiary weight. Closing check: min 8 words and min ~40 chars per quote, and quotes pairwise distinct.
4. **K63ReviewProbeC2-4 (high) — T6 is runner-environment-sensitive and not measured at rev M.** probe:36 honors `SOURCES_CENSUS` env; the default is the fleet worktree script (outside the lane, unversioned). Same commit `71fb1a0d…` (census E03 duplicate id): real census → `UNMET held=6/7 | T6 MISS census-exit=1` exit 1; with `SOURCES_CENSUS=<always-exit-0 script>` → `TOPOLOGY63_HELD held=7/7` exit 0 (x7a/x7b). Closing check: run the census copy from `git archive M` (or pin its sha256 into the verdict line) and drop the env override.
5. **K63ReviewProbeC2-5 (medium) — "used-by names the entry" is substring matching.** probe:112 `usedBy.includes(ENTRY)`; a committed decoy sibling `corpus/knowledge/bounded-redelivery-budgets.md.license` in the used-by cell satisfies it while census E11 stays clean (decoy exists on disk) → HELD 7/7 (x2). Closing check: comma-delimited exact-path match (`(?:^|,\s*)ENTRY(?:,|$)`).
6. **K63ReviewProbeC2-6 (medium) — T7 "frontier line" regex accepts any line.** probe:193 `/frontier|band|ground|first entry/i` on any line containing the path; replacing PROVINCE's real frontier mention with `archived scratch note: band ground draft of <entry> (not a frontier row)` alone reads HELD 7/7 (x10). Closing check: require the line to sit inside a `## Frontier`/band heading section (heading-scoped scan).
7. **K63ReviewProbeC2-7 (medium) — T5 can pass vacuously and mislabels diagnostics.** probe:177-178 `if (!t) continue;` skips bullets whose row has no live text; with no `source:` lines (ids empty) every bullet is skipped, `bad` stays empty, and T5 is reported held while T1–T4 fail (x8: `UNMET held=3/7 … | T1 MISS … | T2 MISS cites-0-rows | T3 MISS no-rows | T4 MISS …` — T5 absent from the miss list). Closing check: T5 ok must require verified-live count == bullets.length.
8. **K63ReviewProbeC2-8 (medium) — the plan's "version-pinned to arXiv v3" (plan.md:70-73) is unverifiable by T1–T7.** No version logic exists in the counter (grep: zero code matches); a row may cite any arXiv version and the pin is never tested. Closing check: counter asserts the row's source cell or capture contains the pinned version token (e.g. `arXiv:<id>v3`), passed as a frozen flag.
9. **K63ReviewProbeC2-9 (low) — escaped-pipe rows: census and counter agree, both diverge from Markdown.** `gawk -F'|'` (sources-census.sh:625) and probe `split('|')` (probe:96) both count raw pipes: a CommonMark-legal `\|` cell yields census E01 exit 1 and probe NF=14 (d2-escaped-pipe.txt) — consistent fail-closed, no divergence, but honest rows with pipes in URLs/teaches are unjudgeable; document the no-pipe authoring constraint.
10. **K63ReviewProbeC2-10 (low) — T5 URL extraction truncates URLs containing `)`.** probe:170 `[^\s|)]+` cuts `https://en.wikipedia.org/wiki/Foo_(bar)` at the paren → curl 404 → honest `live-unreachable` MISS (fail-closed honest-lane trap). Closing check: balanced-paren URL regex or percent-encoding requirement.
11. **K63ReviewProbeC2-11 (low) — T1 scans only the entry's first 14 lines** (probe:76), so a `source:` line at line 15+ escapes T2/T3/T5 obligations entirely (bullets citing it would fail T4, but the row's obligations vanish). Closing check: scan the whole file for `^source:` lines.

Honest negatives verified: HTML-comment channel closed (d1); escaped-pipe parity census↔counter (d2); base rev reads exactly the frozen base receipt.

## Artifacts

- Report: `.ufo/waves/round-63/w1/K63ReviewProbeC2.md` (this file)
- Build: `.ufo/waves/round-63/build/K63ReviewProbeC2/` — `gen.mjs` (attack battery, rerunnable), `x1-full-forgery.txt`, `x2-usedby-substring.txt`, `x3-one-word-bullets.txt`, `x8-vacuous-t5.txt`, `x10-province-junk-line.txt`, `x7a-dup-id-real-census.txt`, `x7b-dup-id-fake-census-env.txt`, `d1-comment-channel.txt`, `d2-escaped-pipe.txt`, `pre-assertions.txt`, `summary.txt`
- Scratch: `/tmp/kumitate-r63/K63ReviewProbeC2/` (probe-frozen.mjs, maker-frozen.mjs copies)

## Limits

- Did not run the canonical default-entry command (`--entry multi-agent-coordinator-topologies.md --opened 2026-10-25`) against lane HEAD: w1 build is in flight and judging the lane's real entry is not this seat's job; all attacks used the frozen controls' fixture convention on the same frozen counter file.
- The battery's live fetches hit only my local server; I did not re-fetch the real S109–S111 pages (their liveness at freeze is attested by the frozen controls' summary, same day).
- norm() replica in gen.mjs is a verbatim copy of probe:57-65; asserted equivalent by construction, not by byte-diff of the running process.
- Did not attack the C1 inline counter, the census script's deeper rules, or readme-map.mjs internals (separate seats' scope).
- No tools installed or upgraded (node/curl/git already present); no pacman transactions run.
