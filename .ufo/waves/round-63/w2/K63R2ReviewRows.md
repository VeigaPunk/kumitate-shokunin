VERDICT: S196/S197 and their capture pins survive every contract, census, gate and probe check I ran — including an independent live re-fetch that is byte-identical — but the adopted entry still carries the `§ agents 条目字段` locator that wave 1 cut-listed and the lesson claims was cut, and the round lesson's Gate records no ≤25-word quote for S197.

## Evidence

Measured revision: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` → `a9531c8e617338fd16cb69c61344ef8f17711117`; `git status --porcelain` shows only untracked w2 files, so every worktree file read equals the committed bytes.

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/...mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40... across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
$ node scripts/source-capture.mjs     → SOURCE_CAPTURE: CLEAN captures=29 exemptions=107   EXIT=0
$ node scripts/cite-sources.mjs       → CITE_SOURCES: CLEAN cited=190                      EXIT=0
$ node scripts/source-dupes.mjs       → SOURCE_DUPES: CLEAN groups=6 known=6               EXIT=0
$ node .ufo/waves/round-63/probe/topology63-probe.mjs <lane> a9531c8e617338fd16cb69c61344ef8f17711117
TOPOLOGY63_HELD held=7/7 checks=7 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=T63   EXIT=0
```

Row shape (corpus/SOURCES.md:148-149): `rows=136`; `awk NF!=13` → none; enum/tier-inflation scan → none; `grep -c '\\|'` → 0 (no escaped pipes). S196/S197 URLs appear in exactly one row each; S131 is `managed-agents-introduction` (different page), S018 is arXiv 2503.13657 (different paper); arXiv 2512.08296 appears only in S197 — lane row S116 is Temporal Visibility (`corpus/SOURCES.md:129`, REJECTED), a different document; the lesson's "S116 = arXiv 2512.08296" is the package register id, matched by document identity, not the lane row.

Pins (`.ufo/pins/source-captures.json:193-205`), recomputed from committed bytes:
```
$ git show a9531c8e...:.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md | sha256sum
7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6  -        (wc -c → 3388)
$ git show a9531c8e...:.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html | sha256sum
df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223  -        (wc -c → 663997)
```
Both equal the pins (`captured: "2026-10-25"`); each sha/path is bound exactly once; neither id is in `exemptions` (gate would FAIL-CLOSED otherwise).

Live re-fetch now (same day, UA `Mozilla/5.0 (kumitate-r63)`), closing the T5 gap wave 1 left open (K63ReviewQuotes and K63ExecCapturePins both listed "no live re-fetch" as a limit):
```
sha256sum live-bailian.md  → 7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6  (3388 B)
sha256sum live-arxiv.html  → df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223  (663997 B)
grep -c '260 experiments' live-arxiv.html → 2      (entry recheck claims 2)
grep -c coordinator live-bailian.md       → 11     (entry recheck claims 11)
```
Both row anchors' "(live re-fetch the same day, byte-identical)" is independently corroborated.

Anchor accuracy: S196's quote is the blockquote under the h1 (capture line 5); S197's "§ Abstract, pattern (3)" is exact — the abstract reads "…additional patterns: (1) …; (2) …; and (3) architectures without centralized verification tend to propagate errors more than those with centralized coordination. Relative performance change compared to single-agent baseline ranges from +80.8% … to −70.0% on sequential planning, demonstrating that architecture-task alignment determines collaborative success." Quote lengths: 13 words (S197), ~14 tokens (S196) — both ≤ 25.

Every clause of both `teaches` cells locates in the captures: S196 — "当前仅支持 `coordinator`", "1-20 个", "传空数组表示清空编队", "不配置 `multiagent` 或编队为空时，智能体按单智能体运行", "`self`（coordinator 自身，编队中最多一个）", "必填（最长 64 字符）", "（>=1，不传取最新）". S197 — "Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families" (verbatim), "+80.8% … −70.0%" (verbatim), "architecture-task alignment determines collaborative success" (verbatim). Entry spot-checks all hit: 0.631/0.349, 4,800×3, −58.7/+77.2/37.5, amp 1.0/4.4/5.1/7.8/17.2, 87%/20%/54% ("random choice (20%) or capability-only models (54%)"), +9.2/+0.2, +5.6/−1.2 ("Hybrid both slightly underperform at -1.2%"), −70.0/−50.3/−41.5/−39.1, D≈0.40, β=−0.236 p=0.004, β=−0.096 p=0.002, +1.7%/0.350, −19.2%/0.278, −2.1…−14.9 (LaTeX "− 2.1 \%" form), −35%, "up to nine", 20-instance×4, "tool-heavy workflows suffer from coordination tax" (verbatim), "Independent isolates the effect of parallelism (ensemble) without communication." (verbatim), "all agents share identical base architectures differing only in scale and role prompts", "we did not optimize prompts specifically for each model or model family" (§5 iv), superlinear (§5). PROVINCE.md:23 and corpus/README.md:187,286 name the entry and S196/S197.

## Findings

1. **K63R2ReviewRows-1 — MEDIUM — the locator wave 1 cut-listed survives in the adopted entry.** `corpus/knowledge/multi-agent-coordinator-topologies.md:1` (S196 `source:` line) still ends its section list with "§ agents 条目字段", but the pinned capture has no such heading: `grep -c '条目字段' .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md` → `0`; the real text is the inline lead-in `` `agents` 中每个条目的字段： `` (capture line 24). Wave 1 flagged exactly this (K63ScoutStagedDiff-6, MEDIUM; cut-list item C24: "no such section exists in the capture"), and `corpus/lessons/round-63.md:13` claims the "`§ agents 条目字段` locator were cut" — it was not: the staged entry's source line (`…/merge/kumitate/knowledge/corpus/knowledge/multi-agent-coordinator-topologies.md:1`) carried it and the adopted entry carries it still. Repro: `grep -n 'agents 条目字段' corpus/knowledge/multi-agent-coordinator-topologies.md` → line 1; `grep -c '条目字段' .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md` → 0. Fix for the L1: drop the locator or replace it with `§ 编队配置 → \`agents\` 中每个条目的字段`, and make lesson line 13 true.

2. **K63R2ReviewRows-2 — LOW — the round lesson's Gate records no ≤25-word quote for S197 (contract rule 1).** Rule 1: "The round lesson's `## Gate` records, for every new row, the URL, the access date, and a ≤25-word quote with its location grounding `teaches`." The ADMIT row's evidence cell (`corpus/lessons/round-63.md:19`, 944 chars) quotes S196 ("协作拓扑类型，当前仅支持 coordinator。") but for S197 records only URL + section + capture sha — no quote. The S197 anchor quote appears nowhere in the lesson: `grep -c 'architectures without centralized verification' corpus/lessons/round-63.md` → `0` (the recheck bullet's "We conducted 260 experiments…" quote is outside `## Gate` and grounds the count, not `teaches`). The evidence itself exists (row anchor + entry located quotes + probe T4/T5), so this is an audit-trail gap, not a fabrication. Fix: append the anchor quote with its § Abstract, pattern (3) location to the Gate cell.

3. **K63R2ReviewRows-3 — INFO — the Gate's S197 URL is a rendering the lane never captured.** The same Gate cell cites `https://arxiv.org/abs/2512.08296` while the row (`corpus/SOURCES.md:149`), the entry's `source:` line, and the pinned capture all use `https://arxiv.org/html/2512.08296v3`; the sha256 quoted beside it is the html-v3 capture's, so the Gate pairs a URL with bytes that URL does not serve. The staged entry had the same abs URL and the adopted entry fixed it — the Gate cell kept the stale form. Fix: point the Gate cell at the html v3 URL.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2ReviewRows.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ReviewRows/live-refetch-sha256.txt` — sha256/bytes of today's two live fetches
- Scratch (lane untouched otherwise): `/tmp/kumitate-r63/K63R2ReviewRows/` (`arxiv.txt` tag-stripped capture text, `live-bailian.md`, `live-arxiv.html`)

## Limits

- Did not run `inline63-probe.mjs` or audit C1 (not this seat's scope); did not audit the other 27 captures or the 107 exemptions beyond the gate's CLEAN verdict.
- Byte-identity is between two fetches of the same URL on 2026-10-25; I did not verify the Bailian `.md` is the vendor's canonical rendering rather than a proxy rewrite (same limit K63ExecCapturePins recorded).
- Wave-2 sibling reports unread (independence); no tool installs (used preinstalled git/node/python3/curl; pacman untouched).
