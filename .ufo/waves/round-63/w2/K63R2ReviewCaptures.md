VERDICT: Both C2 captures are exactly what their rows and pins say — fresh live bytes (two user agents, three arXiv renderings) are byte-identical to the committed bytes and pins, the frozen counter reads `TOPOLOGY63_HELD held=7/7 … EXIT=0` at the measured revision, the 664 KB html was not skipped by the commit helper, and no located quote is affected by any drift (there is none).

## Evidence

All paths relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; fresh fetches in `/tmp/kumitate-r63/K63R2ReviewCaptures/`.

1. Commit completeness and pin equality (the two named commit-helper checks):

```
$ git -C . ls-tree -r a9531c8e617338fd16cb69c61344ef8f17711117 --name-only | grep K63Capture
.ufo/waves/round-63/build/K63Capture/README.txt
.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html          <- present, not skipped (663,997 B)
.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md
$ git show a9531c8e617338fd16cb69c61344ef8f17711117:.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html | sha256sum
df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223      == pin (source-captures.json:203)
$ git show a9531c8e617338fd16cb69c61344ef8f17711117:.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md | sha256sum
7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6      == pin (source-captures.json:196)
```
Worktree hashes equal the committed hashes byte-for-byte (`sha256sum` on both files, same digests); `git rev-parse master` → `a9531c8e617338fd16cb69c61344ef8f17711117` and `git status --porcelain` on the capture dir + pins file is empty. Pin hygiene: S196/S197 each appear exactly once in the pins at a9531c8 (lines 194, 201 — capture entries only, no exemption covering them); 29 capture entries total (27 + these 2).

2. Fresh live fetches, 2026-10-25 ~21:46 GMT (bytes / sha256):

```
arxiv  /html/2512.08296v3      UA 'Mozilla/5.0 (kumitate-r63)'    200 663,997   df31beb3…7223  == capture == pin
arxiv  /html/2512.08296v3      UA 'Mozilla/5.0 (Windows NT 10.0 … Chrome/126)' 200 663,997 df31beb3…7223 IDENTICAL
arxiv  /html/2512.08296        UA 'Mozilla/5.0 (kumitate-r63)'    200 663,997   df31beb3…7223  IDENTICAL (unversioned == v3 today)
arxiv  /abs/2512.08296v3       UA 'Mozilla/5.0 (kumitate-r63)'    200 45,977    8d08bd83…d0b4a0   (different rendering)
arxiv  /pdf/2512.08296v3       UA 'Mozilla/5.0 (kumitate-r63)'    200 3,441,951 028f3290…aff7fd   (different rendering)
bailian …/managed-agents-multiagent.md UA 'Mozilla/5.0 (kumitate-r63)' 200 3,388 7ea43966…37e6 == capture == pin
bailian …/managed-agents-multiagent.md UA 'curl/8.9.1'                  200 3,388 7ea43966…37e6 IDENTICAL
$ cmp a63.html .ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html   → IDENTICAL
$ cmp b63.md  .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md → IDENTICAL
```
`cmp`-level identity, not digest-only. No byte differs → **no located quote is affected by drift**.

3. HTML-capture stability: grep for `nonce|csrf|Set-Cookie|A/B|experiment_id|sessionId|Generated on|build-hash` over the committed capture → no matches; request-timestamp patterns (`YYYY-MM-DDThh:mm`, `YYYY-MM-DD hh:mm`) → no matches. Two UAs and the unversioned URL return identical bytes ~1 h after the w1 scout's independent fetch (same digest `df31beb3…`). Verdict: the capture is a static LaTeXML render keyed to v3, no detected request-time dynamic content, no A/B variation. Bailian headers today: `cache-control: no-cache`, `date: Sun, 25 Oct 2026 21:46:03 GMT`, `age: 2`, `x-deploy-version: 678`, **no `Last-Modified`, no `ETag`** — stable across UAs, but byte drift on a vendor redeploy is possible and unannounced (the pin sha256 is the only tripwire).

4. The frozen counter itself, at the measured integration revision (read-only run, network up):

```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a9531c8e617338fd16cb69c61344ef8f17711117 ; echo EXIT=$?
TOPOLOGY63_HELD held=7/7 checks=7 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=T63
EXIT=0
```
This exercises T3 (pin sha256/bytes vs committed captures), T4 (bullets vs capture) and T5 (live fetch) through frozen code. Freeze integrity of the counter: worktree `sha256sum topology63-probe.mjs` = `122fcf041a39fa42396f7e989110fb3ca5e00161b3a34436964425e68414f53b` and `inline63-probe.mjs` = `9133a29ba6b32542349aa89052dd7df8f2cc4ff570229668a4a84376350a57e6`; `git show b38a2065ab8ac5b198f6569b9013d04411c3d40d:<same>` hashes are identical — the counters were not mutated after freeze.

5. The entry's `recheck:` claims re-run live on today's fresh bytes (`corpus/knowledge/multi-agent-coordinator-topologies.md:4` at a9531c8):
```
$ grep -c '260 experiments' a63.html   → 2   (claimed 2)      $ grep -c coordinator b63.md → 11   (claimed 11)
$ grep -c 'Across 260 configurations spanning six agentic benchmarks' a63.html → 1    (raw bytes)
$ grep -c '当前仅支持 `coordinator`。' b63.md → 1
```
The committed row URLs are the ones the w1 falsifiers demanded: S197 → `https://arxiv.org/html/2512.08296v3` (corpus/SOURCES.md:149, versioned — immune to a future v4), S196 → the `.md` rendering (corpus/SOURCES.md:148, matching `llms.txt:661`'s canonical choice); the entry's `source:` lines (entry:1-2) name the same two URLs.

**30-second recheck command for a non-author** (expected: `df31beb3…7223` twice, then `7ea43966…37e6` twice):
```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && curl -sSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 | sha256sum && curl -sSL -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' | sha256sum && sha256sum .ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md
```

## Findings

1. **K63R2ReviewCaptures-1 — info (attack failed = confirmation).** Committed bytes == worktree bytes == pins == fresh live bytes for both captures, across two user agents and three arXiv renderings; the frozen counter reads `TOPOLOGY63_HELD held=7/7 … EXIT=0` at `a9531c8e617338fd16cb69c61344ef8f17711117`; the commit helper did not skip the 664 KB html (`ls-tree -r` lists it; `git show <rev>:<capture> | sha256sum` equals the pin). Repro: the 30-second command above, plus `node .ufo/waves/round-63/probe/topology63-probe.mjs <lane> a9531c8e617338fd16cb69c61344ef8f17711117`.
2. **K63R2ReviewCaptures-2 — info — html capture is stable, renderings are not interchangeable.** No nonce/csrf/cookie/timestamp/A-B markers exist in the capture; two UAs + unversioned URL are byte-identical. The abs page (45,977 B, `8d08bd83…`) and PDF (3,441,951 B, `028f3290…`) are different renderings carrying the quotes differently (w1 measured 1/24 and 0/24 bullet hits there); the committed S197 row URL is the versioned `/html/` rendering, so T5 binds the matching one. Residual (designed, not a defect): the unversioned `/html/2512.08296` currently serves v3 byte-identically but will drift if arXiv posts v4 — the row already pins `/v3`, so no action.
3. **K63R2ReviewCaptures-3 — low (residual risk, report-only per freeze rules).** The Bailian `.md` serves no `Last-Modified`/`ETag` with `cache-control: no-cache`; bytes are stable across UAs today, but a silent vendor redeploy (`x-deploy-version` already bumped 678 between w1's `age:644` snapshot and now without byte change) would change bytes unannounced. The only tripwire is the pin sha256 (T3/T5 go DRIFT), which is the intended fail-closed behaviour; a drift would not invalidate any already-located quote in the committed capture, only the live-match arm. Repro: `curl -sSL -D - -o /dev/null -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' | grep -iE 'last-modified|etag'` → no output.
4. **K63R2ReviewCaptures-4 — info — counter freeze verified.** Both round-63 probes' worktree bytes hash-identical to the freeze commit `b38a2065ab8ac5b198f6569b9013d04411c3d40d`; `master` == `a9531c8e617338fd16cb69c61344ef8f17711117`; worktree clean at the capture dir and `.ufo/pins/source-captures.json`. The HELD verdict above was produced by unmutated frozen code.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2ReviewCaptures.md` — this report.
- `/tmp/kumitate-r63/K63R2ReviewCaptures/` — fresh fetches: `a63.html`, `achrome.html`, `aunver.html`, `aabs.html`, `apdf.pdf`, `b63.md`, `bcurl.md`, `bh.txt`.
- No lane file outside the report was written; no tool installs or upgrades; no commits; frozen files read-only.

## Limits

- Single network vantage point (this host): byte-stability claims hold for this egress; a CDN A/B seen only from other regions is not excluded (no A/B markers found in the capture itself).
- Capture README's "captured … before wave 1" timing is not byte-checkable; the two w1 scouts' independent same-day fetches with the same digests corroborate it.
- Only C2's two rows (S196/S197) re-fetched live; the other 27 pinned captures were not re-fetched (not this seat's axis). The PDF/abs quote-hit numbers (0/24, 1/24) are cited from wave-1's `K63ScoutArxivOpen.md` measurements, not re-measured here (rendering mismatch, not drift).
- The T4 bullet-by-bullet re-verification is delegated to the frozen counter's T4/T5 arms (run above, 7/7); I did not independently re-parse all 15 located-quote bullets outside that code path.
