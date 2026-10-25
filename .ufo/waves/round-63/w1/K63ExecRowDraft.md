VERDICT: Both rows (S196 Bailian coordinator contract, S197 arXiv 2512.08296v3) are drafted, validated in a scratch mirror (`sources-census.sh validate` exit 0, same six W04 as the lane) and bound end-to-end against the frozen T63 counter on a git fixture (T1–T6 HELD); T7 is blocked only by the lane's pre-existing readme-map DRIFT, not by either row.

## Evidence

Lane baseline (unchanged registry, read-only):
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md
file	W04	S034 … (six W04 lines, S034 S068 S084 S095 S123 S126)
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
real_lane_exit=0
```

Mirror built at `.ufo/waves/round-63/build/K63ExecRowDraft/validate/` (corpus copy + the `used-by`
targets E11 resolves: `SKILL.md`, `scripts/`, two round-47/48 probes) and the block inserted at
`validate/corpus/SOURCES.md:148-149`:
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
    --file .ufo/waves/round-63/build/K63ExecRowDraft/validate/corpus/SOURCES.md
file	W04	S034 duplicate url stryker-mutator.io/… across scopes
file	W04	S068 … S084 … S095 … S123 … S126 …            (the same six, no new finding)
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ExecRowDraft/validate/corpus/SOURCES.md
mirror_validate_exit=0
$ cmp append-block.md <(grep '^| S19[67] ' validate/corpus/SOURCES.md); echo cmp_exit=$?
cmp_exit=0
$ awk -F'|' '{n=split($0,a,"|"); printf "%s NF=%d cells=%d\n",$2,n,n-2}' append-block.md; grep -c '\\|' append-block.md
 S196  NF=13 cells=11      S197  NF=13 cells=11      0   ← no literal or escaped pipe in either row
 S196 kind=docs tier=A status=mined opened=2026-10-25 recheck=on-release used-by=corpus/knowledge/multi-agent-coordinator-topologies.md
 S197 kind=paper tier=A status=mined opened=2026-10-25 recheck=180d used-by=corpus/knowledge/multi-agent-coordinator-topologies.md
```

Live sources, same day, byte-identical to the L1 capture (T5 arm is satisfiable today):
```
arxiv   http=200 bytes=663997  sha256 df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223
bailian http=200 bytes=3388    sha256 7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6
(capture and live hash equal for both; `grep -o 'arXiv:2512.08296v3 \[cs.AI\] 08 Apr 2026'` present in the HTML)
```

Quotes, checked with the frozen probe's own `norm()` (copy in `build/K63ExecRowDraft/check-quotes.mjs`),
against capture **and** live fetch, 15 candidates:
```
$ node check-quotes.mjs <capture-arxiv> live-arxiv.html <capture-bailian> live-bailian.md
S197 cap=true live=true tokens=14 architectures without centralized verification tend to propagate …
S196 cap=true live=true tokens=3 chars=43 通过 coordinator 编队，让一个协调者智能体编排多个成员智能体协同完成任务。
QUOTE_CHECK: PASS misses=0        exit=0
```

Frozen counter on a git fixture (mktemp dir, `git init -q`, toplevel verified equal, throwaway identity
only there; rev `30911cb126721dd37487411b534b9306c3f07546`), fixture = mirror + captures + S196/S197 pins +
a draft entry carrying 8 located bullets + a frontier line:
```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /tmp/kumitate-r63/K63ExecRowDraft/fixture.0Ufp 30911cb1…
TOPOLOGY63_UNMET held=6/7 checks=7 rev=30911cb126721dd37487411b534b9306c3f07546 rule=T63 | T7 MISS province-names-entry=true readme-map-clean=false
$ cd /tmp/kumitate-r63/K63ExecRowDraft/fixture.0Ufp && node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-62-verifier-spotcheck.md
README_MAP: DRIFT files=152 rows=151 covered=151 bad=2 first=uncovered:lessons/round-62-verifier-spotcheck.md
```
T7's readme-map arm is the plan's own maintenance repair (round-62 spot-check unmapped); it is inherited, not caused.

Falsifiers (each a committed copy of the fixture; the row is the only thing changed):
```
F1 S197 status mined→queued   TOPOLOGY63_UNMET held=4/7 … | T2 MISS S197:status=queued | T5 MISS live-fetch-skipped | T7 MISS …   exit=1
   census on F1: file ok … f1_census_exit=0            ← census alone does NOT catch it
F2 S196 used-by→another entry TOPOLOGY63_UNMET held=4/7 … | T2 MISS S196:used-by-lacks-entry | …                                      exit=1
   census on F2: file ok … f2_census_exit=0            ← census alone does NOT catch it
F3 a pipe inside S197 teaches  census: file E01 S197 fields=12  f3_census_exit=1
                               probe:  T2 MISS S197:NF=14 | T6 MISS census-exit=1                                                      exit=1
F4 bullet quote 87%→91%        probe:  T4 MISS S197:quote-not-in-capture(The framework identifies the b)                             exit=1
```

Version anchor is load-bearing (v1 fetched live, 483834 bytes):
```
v1=false v3=true  architectures without centralized verification tend to propagate errors …
v1=false v3=true  Across 260 configurations spanning six agentic benchmarks …
v1=false v3=true  The framework identifies the best-performing architecture for 87% of held-out configurations
```

## Findings

**K63ExecRowDraft-1 — HIGH — census exit 0 is not row validity; T2 is the only binding check.**
A row flipped to `queued` (F1) or re-pointed at another entry (F2) still reads `file ok` / exit 0 from
`sources-census.sh validate`. Anything that reports C2 progress as "census clean" overstates it.
Repro: `sources-census.sh validate --file /tmp/kumitate-r63/K63ExecRowDraft/f1/corpus/SOURCES.md; echo $?` → `0`.

**K63ExecRowDraft-2 — HIGH — a corpus-only scratch mirror cannot reach exit 0.**
Copying `corpus/` alone yields 15 `E11` findings from pre-existing rows whose `used-by` names
`scripts/*`, `SKILL.md`, `.ufo/waves/round-47|48/probe/*` (`baseline_exit=1`), because `--file` derives
the E11 root as the mirror root. A seat that mirrors only `corpus/` will read a red baseline and may
misattribute it to its own block. Repro: mirror without those targets, run the same validate command.
Fix used here: mirror the four `used-by` targets as well (`du -sh` 3.8M).

**K63ExecRowDraft-3 — MEDIUM — the version anchor is the difference between a quote that exists and one that does not.**
All three S197 quotes are absent from `arxiv.org/html/2512.08296v1` and present in `v3`. The staged
S202 row cited unversioned `arxiv.org/abs/2512.08296`; adopting S197 on the `…v3` HTML URL (as drafted)
is what makes T4/T5 survive a future v4. Repro: the v1/v3 comparison block above.

**K63ExecRowDraft-4 — MEDIUM — T3 pins must point at a committed copy of the round-63 captures.**
The captures now live under `.ufo/waves/round-63/build/K63Capture/` (build output). The pin values the
L1 must record are exactly: S196 `.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md`
3388 bytes `7ea43966…37e6`; S197 `…/arxiv-2512.08296v3.html` 663997 bytes `df31beb3…7223`; captured
2026-10-25. A pin to a path that is never committed reads `T3 MISS <id>:capture-absent`.
Repro: the fixture run above (T3 passes with those two entries added to `.ufo/pins/source-captures.json`).

**K63ExecRowDraft-5 — MEDIUM — the vendor page's most on-point sentence is unquotable in this schema.**
`type | 协作拓扑类型，当前仅支持 coordinator。` sits inside a Markdown table, and any `|` in a cell makes
`NF=14` → `E01` (F3) and `T2 MISS <id>:NF=14`. The S196 anchor therefore uses the page subtitle, and the
table's content is carried as paraphrase in `scope`/`teaches`. Repro: F3 above.

**K63ExecRowDraft-6 — LOW — the bold span in the Bailian definition sentence breaks naive quoting.**
`多智能体协作让一个 **coordinator（协调者）** 智能体编排一组成员智能体。` normalises to
`…让一个 coordinator（协调者） 智能体…` (the tag-strip leaves a space), so the natural-looking quote fails
T4 unless the space is written in. Rejected candidate, kept as evidence; the adopted subtitle quote avoids
the hazard. Repro: `node build/K63ExecRowDraft/check-quotes.mjs …` with that string as a candidate.

## Artifacts

- `.ufo/waves/round-63/build/K63ExecRowDraft/append-block.md` — the two rows, byte-identical to the validated mirror (`cmp` exit 0).
- `.ufo/waves/round-63/build/K63ExecRowDraft/rows-quotes-exact.md` — second copy: both rows verbatim + each anchor cell and quote cell verbatim, token/character counts.
- `.ufo/waves/round-63/build/K63ExecRowDraft/validate/` — the scratch mirror (corpus copy, stub entry, `SKILL.md`, `scripts/`, two probe files); `corpus/SOURCES.md:148-149` carries the block.
- `.ufo/waves/round-63/build/K63ExecRowDraft/check-quotes.mjs` — frozen-`norm()` quote checker (capture + live).
- `.ufo/waves/round-63/build/K63ExecRowDraft/entry-fixture-draft.md` — the fixture-only draft entry with 8 verified `## Located quotes` bullets (L1 owns the real entry prose).
- Scratch: `/tmp/kumitate-r63/K63ExecRowDraft/` (`live-*`, `fixture.0Ufp` @ `30911cb1`, `f1`–`f4`).

## Limits

- I did not edit the lane's `corpus/SOURCES.md`, `PROVINCE.md`, `corpus/README.md`, `.ufo/pins/` or the entry — all integration-owned; the fixture versions are drafts, not proposals for content.
- T7 was not made to pass: `readme-map` DRIFT (`lessons/round-62-verifier-spotcheck.md`) is the plan's maintenance repair; I only proved my row does not add to it (`bad=2` is that one file, uncovered+unpinned).
- The fixture's T5 ran live once (in the full run); the four falsifier runs used `--no-live` for speed, so their `T5 MISS live-fetch-skipped` line is expected, not a source failure.
- No `pacman`, no installs, no network beyond the two source URLs and the v1 comparison; no subagents or background jobs; the only git repository I created or committed in is the `/tmp` fixture.
