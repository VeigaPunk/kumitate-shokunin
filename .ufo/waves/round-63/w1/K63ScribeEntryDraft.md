VERDICT: Draft A is written and every one of its 10 located quotes is machine-proven against the fixed captures (exit 0), but the staged text it replaces carried one wrong complexity formula and one mis-anchored section that the v3 capture refutes, and the entry cannot pass T2/T3/T5/T7 until the L1 lands the two registry rows and the capture pins.

## Evidence

Fixed bytes, both re-fetched live today and byte-identical to the L1 captures:

```
$ curl -fsSL https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md | wc -c
3388
$ sha256sum live196.md .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md
7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6  (identical for both paths)
$ curl -fsSL -A 'Mozilla/5.0 (kumitate-topology63)' https://arxiv.org/html/2512.08296v3 | wc -c
663997
$ sha256sum live197.html .ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html
df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223  (identical for both paths)
$ grep -o 'arXiv:2512.08296v3[^<]*' arxiv-2512.08296v3.html | head -1
arXiv:2512.08296v3 [cs.AI] 08 Apr 2026
```

The `recheck:` command in the entry header, run 2026-10-25:

```
$ curl -fsSL https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md | grep -c coordinator
11
$ curl -fsSL https://arxiv.org/html/2512.08296v3 | grep -c '80.8'
18
```

Quote proof — `node .ufo/waves/round-63/build/K63ScribeEntryDraft/verify-quotes.mjs` (norm() copied verbatim from
`probe/topology63-probe.mjs:59-67`; exits 1 on any miss):

```
HIT  S196 words= 5 "多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。不配置 multiagent 或编队…"
HIT  S196 words= 2 "协作拓扑类型，当前仅支持 coordinator。"
HIT  S196 words= 2 "编队条目列表，1-20 个。传空数组表示清空编队。"
HIT  S196 words= 4 "条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。"
HIT  S196 words= 3 "被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）；type=self 时不可传。"
HIT  S197 words=22 "Across 260 configurations spanning six agentic benchmarks,…"
HIT  S197 words=11 "demonstrating that architecture-task alignment, not number…"
HIT  S197 words=14 "tasks where single-agent performance already exceeds 45% a…"
HIT  S197 words=19 "This super-linear scaling confirms the hard resource ceili…"
HIT  S197 words=12 "Cross-validation on held-out configurations confirms this …"
SOURCES: S196,S197
LINES: 78 (<=120)  BULLETS: 10 (>=8, both sources)
QUOTE_VERIFY: PASS
exit=0
```

Negative control (one character changed in the last quote: `87%` → `88%`): `MISS S197 … QUOTE_VERIFY: FAIL 1 -> S197:NOT-IN-CAPTURE(Cross-validation on held-out configurati)`, `mutant-exit=1`.

Frozen-counter arms T1 and T4, re-derived with the counter's own regexes against the draft:
`T1 source=true verified-at=true recheck=true ids=S196,S197` and
`T4 parsed bullets=10 ids=S196,S197 maxwords=22`.

Every `Repro:` command below runs from the lane root. `arxiv.norm.txt`, `arxiv.lines.txt` and `bailian.norm.txt`
are derived text committed under `.ufo/waves/round-63/build/K63ScribeEntryDraft/`: the first and third apply the
frozen counter's `norm()` verbatim (`probe/topology63-probe.mjs:59-67`) to the fixed captures; the second is the
same normalisation with block tags mapped to newlines, so a hit can be cited by line.

Number audit: every numeric token in the draft body outside the header was matched against the union of the two
normalised captures — `numbers checked: 96` / `unmatched: none`. Registry-row shape for the two proposed rows:
`S196 cells=11`, `S197 cells=11` (`awk -F'|' '/^\| S19[67] /{print $2, "cells="NF-2}' rows.md`).

## Findings

1. **K63ScribeEntryDraft-1 — HIGH — the staged text's hybrid complexity formula is refuted by v3.** The staged
   entry said overhead is `r·n` for centralized and `r·n + p·m` for hybrid. S197 §3.1 states centralized
   `O(rnk)` ("Sequential depth equals r while parallelization factor remains n") and hybrid `O((r+p)·n·k)` where
   `p` is the number of peer rounds — the hybrid term multiplies by `n`, and `m` (average peer requests) appears
   only in Table 2's legend, not in the asymptotic. The draft therefore states no formula and carries the measured
   overhead percentages instead.
   Repro: `grep -c -o 'O ⁡ ( ( r + p ) ⋅ n ⋅ k )' build/K63ScribeEntryDraft/arxiv.norm.txt` → `1`.
2. **K63ScribeEntryDraft-2 — MEDIUM — the staged anchor `§ Experiments & Results → § Setup (Benchmarks)` does not
   cover the per-benchmark deltas it introduces.** The +57%…-70% figures are the §4.2 Figure 2 caption and the
   §4.2 prose, not §4.1. The draft's S197 `source:` line names §4.1, §4.2, §4.3, §4.4 and §5 explicitly, and every
   table row is tagged `(§4.2)`.
   Repro: `grep -n 'Finance Agent demonstrates the strongest multi-agent benefits' build/K63ScribeEntryDraft/arxiv.lines.txt` → `340:` (§4.2).
3. **K63ScribeEntryDraft-3 — MEDIUM — the staged row cited `arxiv.org/abs/` while the capture is the `/html/`
   rendering.** Quotes are proven against the html rendering; an `abs` URL would make the frozen T5 live arm fetch
   a page that does not contain them. The draft's S197 header and the proposed S197 registry row both use
   `https://arxiv.org/html/2512.08296v3`.
   Repro: `grep -c 'We conducted 260 experiments' <(curl -fsSL https://arxiv.org/abs/2512.08296v3)` → `0`.
4. **K63ScribeEntryDraft-4 — MEDIUM — a caption range and a prose mean are two different numbers and the staged
   table conflated them.** The Figure 2 caption gives Workbench as "-11 to +6%" and SWE-bench as "-15% to -2%";
   §4.2 prose gives Workbench -1.2%/-1.2%/+5.6% and SWE-bench -2.1%/-3.1%/-5.4%/-14.9% per architecture. The draft
   prints the prose per-architecture figures in the table and keeps the aggregate (-0.3% mean, σ 37.5%) in prose,
   so neither number is presented as the other.
   Repro: `grep -c 'marginal effects (from -11 to +6%)' build/K63ScribeEntryDraft/arxiv.lines.txt` → `1`; `grep -c 'On Workbench, multi-agent systems show minimal gains' build/K63ScribeEntryDraft/arxiv.lines.txt` → `1`.
5. **K63ScribeEntryDraft-5 — LOW — the staged entry carried no cost side at all.** It asserted "coordination
   overhead is not a constant" with no measurement. v3 supplies the price directly (§4.3 overhead 58/263/285/515%,
   §4.4 token efficiency 67.7 vs 21.5/23.9/13.6 successes per 1K tokens). The draft carries those, each tagged to
   its section, because they are the numbers that make the decision rule actionable.
   Repro: `grep -c -o 'representing 1.6-6.2 × ' build/K63ScribeEntryDraft/arxiv.norm.txt` → `1`.
6. **K63ScribeEntryDraft-6 — INFO — S018 is not merely adjacent, S197 builds on it.** v3 §4.4 opens "Following the
   Multi-Agent System Failure Taxonomy (MAST) proposed by [ 15 ]" and then reports per-architecture frequencies of
   four categories (coordination failure only in MAS: 1.8%/3.2%/12.4% for centralized/decentralized/hybrid). The
   draft's Scope says S018 owns the taxonomy and S197 adds frequencies, so the two rows do not double-claim.
   Repro: `grep -c -o 'Following the Multi-Agent System Failure Taxonomy (MAST) proposed by \[ 15 \]' build/K63ScribeEntryDraft/arxiv.norm.txt` → `1`.
7. **K63ScribeEntryDraft-7 — INFO — the two rows' ranges do not overlap and the entry says so.** S196 caps a
   roster at 20; S197 fits `n_a` 1-4 (§4.3 log range) and probes at most `n_a = 9` (Figure 5; §5 "(i)"). No
   capture measures a 20-member coordinator, so the Limits section names the skew rather than bridging it.
   Repro: `grep -c -o 'scaling number of agents up to nine' build/K63ScribeEntryDraft/arxiv.norm.txt` → `1`.

## Artifacts

- `.ufo/waves/round-63/build/K63ScribeEntryDraft/entry.md` — draft A, 78 lines, header trio + coverage-map/ground,
  Scope / contract / measured cost / decision rule / Limits / Located quotes (10 bullets, both sources).
- `.ufo/waves/round-63/build/K63ScribeEntryDraft/verify-quotes.mjs` — quote prover, norm() copied verbatim from the
  frozen counter; exits 1 on a miss or an over-25-word bullet; also asserts the T1 header trio and the 120-line cap.
- `.ufo/waves/round-63/build/K63ScribeEntryDraft/rows.md` — PROPOSAL ONLY (not integrated): the two 11-cell
  `corpus/SOURCES.md` registry rows the frozen T2 needs, plus the author block they were read from.

## Limits

- **I did not run the frozen counter.** `topology63-probe.mjs` needs a committed revision with the registry rows,
  the `.ufo/pins/source-captures.json` bindings, the `PROVINCE.md` frontier line and the `README_MAP` clean line;
  none of those exist until the L1 lands them, so a run now would read the base and report `TOPOLOGY63_UNMET`.
  T1/T4 were re-derived with the counter's own regexes; T2/T3/T5/T6/T7 are unverified from this seat.
- **T5 depends on the registry row's URL, not the entry's.** The proposed S197 row uses `/html/2512.08296v3`; if
  the L1 lands an `/abs/` URL instead, T5 fails on every S197 bullet even though the quotes are true of the html
  rendering (finding 3).
- **I read the captures, not the surrounding literature.** No claim here is checked against another paper's
  reading of S197; the `[INFERENCE]` labels mark the three steps in the decision rule that S197 does not state.
- **Author list for S197 is transcribed from the capture's affiliation block**, not from an external index; the
  cell is a proposal for the L1 to confirm.
- **No tool was installed or upgraded** for this seat; nothing outside `.ufo/waves/round-63/build/K63ScribeEntryDraft/`,
  `.ufo/waves/round-63/w1/` and scratch under `/tmp/kumitate-r63/K63ScribeEntryDraft/` was written; the derived
  text files were copied into the build directory so no evidence pointer depends on scratch.
