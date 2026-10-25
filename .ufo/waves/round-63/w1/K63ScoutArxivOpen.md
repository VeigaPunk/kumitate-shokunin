VERDICT: The L1's capture is byte-identical to a live fetch of the version-pinned v3 HTML (sha256 df31beb3…, 663,997 B), the page prints "arXiv:2512.08296v3 [cs.AI] 08 Apr 2026", the sentence "Across 260 configurations spanning six agentic benchmarks" is verbatim in v3 only (v1/v2 read 180/four — round 61 wave 1's "spliced quote" call was a version mismatch, now settled with bytes), and 24 quote bullets were located, each proved to occur in the capture and in a fresh live fetch.

## Evidence

Fetches, 2026-10-25, `curl -sSL`, cwd `/tmp/kumitate-r63/K63ScoutArxivOpen` (status bytes sha256 url):

```
200 663997 df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223 https://arxiv.org/html/2512.08296v3
200 45977 8d08bd8309df5de7b8285e928bc5c22d3b3bca37301dc44b432fbf599ad0b4a0 https://arxiv.org/abs/2512.08296v3
200 46408 4d69789daa8b973ee55c2e06a59ca2d3e44998ed759108971708b138b0a6070c https://arxiv.org/abs/2512.08296v1
200 46507 52629588f4ab2454c86d19345ba4be080a00dd910aedcbeeae7b5b29bece6c4c https://arxiv.org/abs/2512.08296v2
200 483834 f15c8f2dfdeec6c4076de3f37adacb050e158f356abbd18966127f94d7b0eff7 https://arxiv.org/html/2512.08296v1
200 537755 2861f7a90ca2524f9b659d0536ded7d66e5221849c96d03a2565c9affe2ee2fe https://arxiv.org/html/2512.08296v2
```

Capture vs live, byte comparison (not digest only) and the T5 probe's exact invocation:

```
$ cmp …/round-63/build/K63Capture/arxiv-2512.08296v3.html html_2512.08296v3
CMP: IDENTICAL BYTES
$ sha256sum …/K63Capture/arxiv-2512.08296v3.html html_2512.08296v3 fresh_live.html
df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223   (all three identical)
$ curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-topology63)' https://arxiv.org/html/2512.08296v3
200 → 663997 bytes, sha256 df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223
```

Version string and date printed in the page, and the abs submission history (identical on all three abs versions):

```
$ grep -oE 'arXiv:2512\.08296v[0-9] \[[^]]*\] [0-9]{2} [A-Z][a-z]{2} [0-9]{4}' html_2512.08296v3 | sort | uniq -c
      1 arXiv:2512.08296v3 [cs.AI] 08 Apr 2026
[v1] Tue, 9 Dec 2025 06:52:21 UTC (1,731 KB) [v2] Wed, 17 Dec 2025 02:41:22 UTC (1,773 KB) [v3] Wed, 8 Apr 2026 21:31:49 UTC (2,523 KB)
dateline: [Submitted on 9 Dec 2025 ( v1 ), last revised 8 Apr 2026 (this version, v3)] Title: Towards a Science of Scaling Agent Systems
```

The v1/v2-vs-v3 question settled with bytes. Normaliser is byte-identical to the frozen `norm()` in `topology63-probe.mjs` (only my `export ` keyword differs); counts are over the normalised capture:

```
v1 | 260 configurations: 0 | 180 configurations: 5 | six agentic benchmarks: 0 | four diverse benchmarks: 3 | 260 experiments: 0 | N = 260: 0
v2 | 260 configurations: 0 | 180 configurations: 5 | six agentic benchmarks: 0 | four diverse benchmarks: 2 | 260 experiments: 0 | N = 260: 0
v3 | 260 configurations: 7 | 180 configurations: 1 | six agentic benchmarks: 7 | four diverse benchmarks: 0 | 260 experiments: 2 | N = 260: 8

   count=0  Across 260 configurations spanning six agentic benchmarks                            (v1)
   count=0  Across 260 configurations spanning six agentic benchmarks                            (v2)
   count=1  Across 260 configurations spanning six agentic benchmarks                            (v3)
   count=1  We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures   (v3)
   count=1  We conducted 180 experiments across four representative benchmarks                                          (v1 and v2)
```

Raw-bytes count of the same sentence in the un-normalised HTML: `v1:0  v2:0  v3:1`. So the sentence is not spliced inside any single version; it is a cross-version mismatch (v3's abstract and §4.1 both say 260/six; v1/v2's §4.1 says 180/four). Round 61 wave 2 reached the same disposition (`.ufo/waves/round-61/w2/Audit14.md`); the lane's committed lesson `corpus/lessons/round-61.md:14` carries the correction.

Quote occurrence counts and section attribution (normalised capture; `capOcc` = count in the L1's capture, `liveOcc` = count in the fresh T5 fetch). All ≤ 25 words, all `capOcc ≥ 1`, all `liveOcc ≥ 1`:

```
$ node verify.mjs s197-paste.json          # 24 quotes; each line = words capOccurrences section
OK words=22 capOccurrences=1  Abstract
OK words=13 capOccurrences=1  4.1 Setup > Benchmarks.
OK words=17 capOccurrences=1  1 Introduction
OK words=19 capOccurrences=1  4.1 Setup > Agent Architectures and Complexity.
OK words=18 capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=17 capOccurrences=1  4.2 Main Results > MAS exhibits domain-dependence with architectural variation.
OK words=12 capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=8  capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=13 capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=4  capOccurrences=1  4.2 Main Results > Architecture-LLM Family Interactions …
OK words=13 capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=11 capOccurrences=1  4.2 Main Results > MAS exhibits domain-dependence …
OK words=13 capOccurrences=1  4 Experiments & Results                     (Figure 2 caption)
OK words=11 capOccurrences=1  4.2 Main Results > MAS exhibits domain-dependence …
OK words=19 capOccurrences=1  1 Introduction                              (tool-heavy overhead)
OK words=14 capOccurrences=1  1 Introduction                              (capability ceiling β=-0.236, p=0.004)
OK words=14 capOccurrences=1  1 Introduction                              (45% threshold prose)
OK words=14 capOccurrences=1  1 Introduction                              (tool trade-off β=-0.096, p=0.002)
OK words=17 capOccurrences=1  4.1 Setup > LLMs and Intelligence Scaling.  (Δmax = 0.023)
OK words=21 capOccurrences=1  4.1 Setup > Metrics and Validation.         (overhead formula)
OK words=20 capOccurrences=1  4.1 Setup > Metrics and Validation.         (efficiency formula)
OK words=13 capOccurrences=1  Appendix F SWE-bench Verified and Terminal-Bench Results
OK words=16 capOccurrences=1  Appendix F …                               (Table 16 SWE-bench row)
OK words=16 capOccurrences=1  Appendix F …                               (Table 16 Terminal-Bench row)
ALL_OK=true

$ node t4-emul.mjs html_2512.08296v3 T5https___arxiv.org_html_2512.08296v3 s197-paste.json
BULLETS=24 ALL_OK=true   EXIT=0      # every bullet parses under the counter's /^- (S\d+) [—-] "(.+)"$/, ≤25 words, matches capture + live
$ node report-check.mjs fresh_live.html   # extracts the bullets from THIS report and re-runs the rules
REPORT_BULLETS=24 ids=S197 BAD=0
REPORT_CHECK: PASS   EXIT=0
```

Frozen counter at HEAD (the entry does not exist yet; not mine to write):

```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin HEAD
TOPOLOGY63_UNMET held=1/7 checks=7 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
EXIT=1
```

## Findings

1. **K63ScoutArxivOpen-1 — severity: info (confirmation).** The L1's capture equals the live v3 HTML byte-for-byte: `cmp` → identical, sha256 `df31beb3…`, 663,997 B, and the T5 arm's own `curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-topology63)'` returns the same bytes. Reproduce: `sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html`.
2. **K63ScoutArxivOpen-2 — severity: medium (prior round's finding was wrong; no frozen file affected).** Round 61 wave 1 called "Across 260 configurations spanning six agentic benchmarks" a **spliced quote**. It is not: verbatim exactly once in v3, zero times in v1/v2, and v3's §4.1 sentence "We conducted 260 experiments across six benchmarks…" is likewise verbatim in v3 (raw count 1) and absent from v1/v2 (raw count 0, where the parallel sentence reads 180/four). The defect was a cross-version comparison (v1 §4.1 vs the unversioned abstract that serves v3). Reproduce: `grep -c 'Across 260 configurations spanning six agentic benchmarks' /tmp/kumitate-r63/K63ScoutArxivOpen/html_2512.08296v{1,2,3}` → 0, 0, 1.
3. **K63ScoutArxivOpen-3 — severity: medium (version pinning is load-bearing for T5).** The URL in the SOURCES row decides T5's live fetch, and only the **HTML** URL carries the body quotes. Against the abs page only 1 of my 24 bullets is found; against the PDF, 0 of 24 (the counter's `norm()` cannot read a PDF). Measured: `node t4-emul.mjs html_2512.08296v3 T5https___arxiv.org_abs_2512.08296v3 s197-paste.json` → `BULLETS=24 ALL_OK=false` with 21 BAD (every body quote); against `https://arxiv.org/html/2512.08296v3` → `ALL_OK=true`; `https://arxiv.org/html/2512.08296` (unversioned) also serves v3 byte-identically and passes. **Action for the L1: the S197 row's `source` cell must carry `https://arxiv.org/html/2512.08296v3` (or the unversioned `/html/2512.08296`), not `/abs/` and not `/pdf/`.** Reproduce: `grep -c 'We conducted 260 experiments across six benchmarks' /tmp/kumitate-r63/K63ScoutArxivOpen/abs_unversioned.html` → 0.
4. **K63ScoutArxivOpen-4 — severity: low (counter observation, no patch).** The frozen `norm()` keeps LaTeXML's `alttext`/annotation duplicates (`β = − 0.236 \beta{=}{-}0.236 , p = 0.004 p{=}0.004`) and keeps `−` (U+2212) distinct from ASCII `-`. A quote rewritten with an ASCII hyphen, or with the LaTeXML duplicate dropped, will NOT match the capture. Every bullet below is byte-exact against capture and live; the L1 must copy them verbatim.
5. **K63ScoutArxivOpen-5 — severity: info (the page's own wording).** The five architectures are worded twice, differently: §1 "We evaluate five canonical architectures: Single Agent System (SAS) and four Multi-Agent variants (Independent, Centralized, Decentralized, Hybrid)" and §4.1 "We tested five coordination topologies: Single-Agent System (SAS) and four Multi-Agent System (MAS) variants: Independent, Centralized, Decentralized, and Hybrid". The coordination-overhead formula exists (§4.1 Metrics and Validation): `O=(T_MAS−T_SAS)/T_SAS×100%`, with the companion efficiency metric `E_c=S/(T/T_SAS)`. Both quoted verbatim below.
6. **K63ScoutArxivOpen-6 — severity: info (NOT FOUND: none).** Every requested fact is present in v3: 260-config/six-benchmark/five-architecture setup, Finance Agent +57%→+80.8%, PlanCraft −70%→−39%, the tool-heavy overhead finding, the 45% threshold with β=−0.236/p=0.004, Δmax=0.023, the Workbench range (−11 to +6%), BrowseComp-Plus, and the Appendix F SWE-bench Verified / Terminal-Bench numbers. One caveat recorded for the entry text: v3 still carries a stale "180 configurations" in the Figure 3 caption ("… and Workbench (180 configurations with full cost tracking; …)") — the paper's own internal inconsistency, not a capture defect; do not cite it as the setup figure.

## Artifacts

- `.ufo/waves/round-63/build/K63ScoutArxivOpen/s197-paste.json` — the 24 verified bullets with section labels.
- `.ufo/waves/round-63/build/K63ScoutArxivOpen/verify.mjs` — normaliser (byte-identical to the frozen `norm()`) + occurrence counts + heading-tree section attribution.
- `.ufo/waves/round-63/build/K63ScoutArxivOpen/t4-emul.mjs` — emulation of the counter's T4/T5 arms (bullet regex, ≤25-word cap, capture match, live match).
- `.ufo/waves/round-63/build/K63ScoutArxivOpen/report-check.mjs` — extracts this report's bullets and re-runs the counter's rules against capture + live.
- `.ufo/waves/round-63/build/K63ScoutArxivOpen/norm.mjs`, `excerpt.mjs`, `quotes.json`…`quotes8.json` — helper and candidate-batch scripts.
- `.ufo/waves/round-63/build/K63ScoutArxivOpen/html_2512.08296v1`, `html_2512.08296v2` — independently fetched v1/v2 HTML for the version comparison.
- Scratch: `/tmp/kumitate-r63/K63ScoutArxivOpen/` (all fetches, normalised dumps, receipts). This report: `.ufo/waves/round-63/w1/K63ScoutArxivOpen.md`.

## Limits

- Not checked: the PDF rendering of v3 (fetched, 3,441,951 B; the counter's `norm()` cannot match a PDF — recorded 0/24 rather than a false pass).
- Not checked: any version after v3 (abs history ends at v3, 2026-04-08). The unversioned `/html/` URL could drift if arXiv publishes v4, which is why the row should pin `/v3`.
- Not checked: the second cited row of C2 (the vendor's managed-agent coordinator contract, `K63Capture/bailian-managed-agents-multiagent.md`) — peer seat `K63ScoutBailianOpen` owns it; my bullets are S197-only.
- I wrote no lane source file (`corpus/knowledge/multi-agent-coordinator-topologies.md`, `corpus/SOURCES.md`, `.ufo/pins/source-captures.json`, `PROVINCE.md`) and no frozen file: those are the L1's integration surfaces, outside a seat's write scope. My T4/T5 run is an emulation of the counter's arms (same regexes, same `norm()` body byte-for-byte), not the counter itself, because the counter measures a committed revision that does not yet contain the entry; the counter at HEAD was run and is quoted verbatim above.
- No tools were installed or upgraded this round; `/home/vgpnk/.omp/agent/RULES.md` was not needed (curl, node and git already present).

## Ready-to-paste list (id S197)

- S197 — "Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families"
- S197 — "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures"
- S197 — "We evaluate five canonical architectures: Single Agent System (SAS) and four Multi-Agent variants (Independent, Centralized, Decentralized, Hybrid)"
- S197 — "We tested five coordination topologies: Single-Agent System (SAS) and four Multi-Agent System (MAS) variants: Independent, Centralized, Decentralized, and Hybrid"
- S197 — "Finance Agent demonstrates the strongest multi-agent benefits, with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)"
- S197 — "Centralized reaches +80.8% (mean 0.631 vs. SAS 0.349), Decentralized achieves +74.5% (0.609), and Hybrid reaches +73.1% (0.604)"
- S197 — "PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)"
- S197 — "Workbench shows marginal effects (from -11 to +6%)"
- S197 — "BrowseComp-Plus shows polarized results, with independent agents catastrophically underperforming relative to SAS (-35%)"
- S197 — "BrowseComp-Plus from MAS-Decentralized (+9.2%)"
- S197 — "SWE-bench Verified shows slight degradation across all MAS architectures (from -15% to -2%)"
- S197 — "all MAS architectures show slight degradation relative to SAS (mean 0.522)"
- S197 — "Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%)"
- S197 — "On Terminal-Bench (SAS mean 0.344, below the threshold), results are mixed"
- S197 — "tool-heavy tasks (e.g., 16-tool business workflows) suffer from multi-agent coordination overhead, with efficiency penalties compounding as environmental complexity increases"
- S197 — "capability ceiling ( β = − 0.236 \beta{=}{-}0.236 , p = 0.004 p{=}0.004 )"
- S197 — "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents"
- S197 — "tool-coordination trade-off ( β = − 0.096 \beta{=}{-}0.096 , p = 0.002 p{=}0.002 )"
- S197 — "the maximum difference in architecture-specific scaling slopes between any two LLM families is Δ max = 0.023"
- S197 — "O = ( T MAS − T SAS ) / T SAS × 100 % O=(T_{\text{MAS}}-T_{\text{SAS}})/T_{\text{SAS}}\times 100\% : captures computational cost"
- S197 — "Coordination efficiency E c = S / ( T / T SAS ) E_{c}=S/(T/T_{\text{SAS}}) (success normalized by relative turn count)"
- S197 — "Table 16: SWE-bench Verified and Terminal-Bench resolution rates with 95% bootstrap confidence intervals"
- S197 — "gemini-2.5-pro 70 [50, 90] 55 [35, 75] 45 [25, 65] 60 [40, 80] 50 [30, 70]"
- S197 — "gemini-2.5-pro 45 [25, 65] 10 [0, 25] 30 [10, 50] 25 [10, 45] 30 [10, 50]"
