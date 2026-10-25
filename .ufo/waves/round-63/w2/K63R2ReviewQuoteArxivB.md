VERDICT: Every S197 number in the decision table and Limits locates in the live v3 page with correct benchmark/architecture/direction/sign attribution (0 NOT-FOUND, 0 numeric CONTRADICTED), but the Limits bullet "no cost, latency or wall-clock comparison" is CONTRADICTED by the paper's own cost analyses (Fig. 3 §4.2, §4.4 Economic Efficiency, §5), and two citation-location defects (4,800-token match cited §4.1 instead of §4.4/§4.3; row-8 quote cited §3.2 instead of §3.1).

## Evidence

Live attack, not capture-trust. Fetch: `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 -o live.html` → exit 0, 663997 bytes, sha256 `df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223` — byte-identical to pin `.ufo/pins/source-captures.json:201-205` (S197 → build/K63Capture/arxiv-2512.08296v3.html, same sha256, 663997 bytes, captured 2026-10-25). Page identity: `grep -o 'arXiv:2512\.08296v[0-9][^<"]*' live.html` → 1 hit, `arXiv:2512.08296v3 [cs.AI] 08 Apr 2026`. Entry attacked at measured rev: `git show a9531c8e617338fd16cb69c61344ef8f17711117:corpus/knowledge/multi-agent-coordinator-topologies.md` vs worktree → identical (worktree also equals L1's current file).

Own matcher (wave-1 scribe's `normalize.py` NOT used): `/tmp/kumitate-r63/K63R2ReviewQuoteArxivB/match_arxiv.py` — HTMLParser walk; `<math alttext>` substituted for MathML bodies; U+2212/–/≈/β/σ folded; `\%`,`\le`,`\text{}` from alttext normalized; sections = `<section id>` + first `ltx_title` heading. Result: 73 sections, 143,001 normalized chars; output + both probe scripts in build dir.

S197 quote bullets 5–10 of `## Located quotes` (my half) — all FOUND in the live fetch, sections from matcher (word counts ≤ 25 ✓): Q5 "This suggests that sequential interdependence…" §4.2 (S4.SS2.SSS0.Px2), 12w; Q6 "tool-rich environments amplify the coordination tax…" §4.3 (S4.SS3.SSS0.Px2), 11w; Q7 "tasks where single-agent performance already exceeds 45%…" §1 Intro, 14w; Q8 "Centralized introduces hierarchical verification and bottleneck control." §3.1 (S3.SS1.SSS0.Px2), 7w; Q9 "All MAS and SAS configurations were matched… 4,800 tokens…" §4.4 (S4.SS4), 23w; Q10 "Our framework systematically compares… up to nine." §5, 18w. This strengthens T5's fresh-fetch arm, which wave-1 did not run (their report: "No live re-fetch of either URL").

Full number table — decision table + Limits + intro paragraph (location = section of live page; verdict FOUND unless noted):

| # | Entry number (where entry cites) | Live location | Verdict |
|---|---|---|---|
| 1 | mean −0.3% all six benchmarks/four MAS variants (§4.2) | §4.2 Px1 "overall mean MAS improvement is -0.3 %" | FOUND |
| 2 | 95% CI −58.7% to +77.2% (§4.2) | §4.2 Px1 "95% CI: [ -58.7 %, +77.2 %]" | FOUND |
| 3 | σ = 37.5% (§4.2) | §4.2 Px1 "SIGMA=37.5 %" | FOUND |
| 4 | ~45% baseline threshold (§4.2, §4.3) | §1 (quote verbatim), §4.2, §4.5, §5, §6 | FOUND |
| 5 | Finance strongest; Centralized +80.8%, 0.631 vs SAS 0.349 (§4.2) | §4.2 Px1 verbatim; caption (b) Fig. 2 (§4) | FOUND |
| 6 | Finance caption range +57% to +80.8% all variants (§4.2) | §4 Fig. 2 caption (b) "(from +57% to +80.8%)" | FOUND (housed §4 preamble) |
| 7 | BCP: Decentralized +9.2% vs Centralized +0.2% (§4.2) | §4.2 Px1 "+9.2% (0.347 vs. SAS 0.318)" / "flat at +0.2%" | FOUND |
| 8 | Workbench: Dec +5.6% best; Cent+Hybrid −1.2% (§4.2) | §4.2 Px1 "+5.6% (0.664 vs. SAS 0.629)" / "both … at -1.2%" | FOUND |
| 9 | Workbench caption range −11% to +6% (§4.2) | §4 Fig. 2 caption (d) "(from -11 to +6%)" | FOUND (caption has no % on −11) |
| 10 | Finance Dec +74.5% second (§4.2) | §4.2 Px1 "+74.5% (0.609)"; Hybrid +73.1% (0.604) | FOUND |
| 11 | PlanCraft Ind −70.0 / Cent −50.3 / Dec −41.5 / Hyb −39.1 (§4.2) | §4.2 Px1 verbatim (0.170/0.282 vs SAS 0.568/0.332/0.346) | FOUND |
| 12 | D ≈ 0.40 critical complexity (App. C.3) | A3.SS3 "critical complexity threshold at D~ 0.40" | FOUND |
| 13 | β = −0.236, p = 0.004 saturation (§4.2, §4.3) | §1 verbatim; §4.3 Table 4 "P_SA(1+n_a) −0.236 [−0.396,−0.076] 0.004" | FOUND |
| 14 | SWE-bench degrades every variant −2.1% to −14.9% (§4.2) | §4.2 Px1: Hyb −2.1 (0.511), Cent −3.1 (0.506), Dec −5.4 (0.494), Ind −14.9 (0.444) | FOUND |
| 15 | Terminal-Bench 2 tools; Ind +1.7% (0.350); Cent −19.2% (0.278) (§4.2) | §4.2 Px1 verbatim; "2 tools" also §4.1 Px1, caption (f), A4 | FOUND |
| 16 | negligible band ends T ≤ 4 (§4.3) | §4.3 Px2 "simple tasks ( T<= 4 ) exhibit negligible efficiency effects ( | P|<0.05 )" | FOUND |
| 17 | β = −0.096, p = 0.002 tool trade-off (§4.3) | §4.3 Px2 "BETA_E_c T=-0.096 (95% CI: [-0.154,-0.037], p=0.002)" | FOUND |
| 18 | Amplification SAS 1.0 / Cent 4.4 / Hyb 5.1 / Dec 7.8 / Ind 17.2 (§4.3) | §4.3 Px2 verbatim + Table 5 "Error Amp 1.0 17.2 7.8 4.4 5.1" | FOUND (mapping exact) |
| 19 | BCP largest named loss Ind −35% (§3.2, §4.2) | §4 Fig. 2 caption (a) "independent agents … (-35%)" | FOUND number; §3.2 cite wrong for the quote half → Finding 3 |
| 20 | 87% held-out selection vs 20% random, 54% capability-only (§4.3) | §4.3 Px6 "87% correct architecture selection … random choice (20%) or capability-only models (54%)" | FOUND |
| 21 | 20-instance subsets SWE/TB (§5) | §5 verbatim + §4.1 Px1, Data Availability, App E | FOUND |
| 22 | scaling "up to nine" (§5) | §5 "preliminary exploration of scaling number of agents up to nine" | FOUND (fitted n_a range is 1–4, §4.3 Px1) |
| 23 | identical base archs, scale + role prompts; prompts not tuned per family (§5) | §5 "identical base architectures differing only in scale and role prompts"; "…not … specifically for each model or model family" | FOUND |
| 24 | communication overhead superlinear (§5) | §5 "grows superlinearly with agent count" | FOUND |
| 25 | matched budgets, mean 4,800 tokens/trial, tool-call access (§4.1) | §4.4 verbatim + §4.3 Table 5 note "(mean =4,800 per trial)"; **absent from §4.1** | FOUND number; citation wrong → Finding 2 |
| 26 | "study reports no cost, latency or wall-clock comparison" (§4.1) | cost: Fig. 3 §4.2 Px3 (USD, SEM), §4.4 Px7 (67.7 vs 21.5/23.9/13.6 succ/1K; $0.008–$0.024 per 1% gain), §5 "our cost analysis (Section 4.4)"; wall-clock: §5 future-work mention only | **CONTRADICTED on cost** → Finding 1 |

Attribution traps checked and passed: 0.631 is Centralized (not Dec) vs SAS 0.349; +74.5% is Dec (2nd; Hybrid 3rd at +73.1%); Workbench −1.2% is both Cent and Hybrid; PlanCraft ordering Ind worst/Hybrid best; amplification Dec 7.8 vs Hybrid 5.1 not swapped; −35% is Independent; SWE endpoints −2.1 Hybrid / −14.9 Independent; TB Ind gain/Cent loss; −0.3% is an aggregate over MAS configs, not per-benchmark.

## Findings

1. **K63R2ReviewQuoteArxivB-1 (medium — CONTRADICTED).** Limits bullet "Fixed-budget deltas" claims "the study reports no cost, latency or wall-clock comparison (§4.1)". The study reports cost comparisons three times: §4.2 Px3 + Figure 3 "Cost-Performance Trade-offs Across Model Families and Architectures… 180 configurations with full cost tracking… mean agentic performance (%) versus normalized cost per experiment (USD), with… SEM" error bars; §4.4 Px7 "Economic Efficiency and Family-Specific Cost-Benefit Trade-offs" (SAS 67.7 successes/1K tokens vs Centralized 21.5, Decentralized 23.9, Hybrid 13.6; ~$0.008–$0.024 per 1% success gain by family); §5 "As shown in our cost analysis (Section 4.4), token consumption and latency grow substantially with agent count". Wall-clock is the only genuinely unreported axis (§5 mentions it in a future-work design sentence). A reader of the entry would wrongly conclude the paper contains no cost data. Reproduce: `python3 /tmp/kumitate-r63/K63R2ReviewQuoteArxivB/probe3.py` (prints §4.4 Px7 and §5 sentences); `grep -c 'Figure 3:' live.html` → 1.
2. **K63R2ReviewQuoteArxivB-2 (low — citation-location).** The same bullet's "(§4.1)" cannot re-locate the 4,800-token match: matcher finds "4,800" only in §4.4 (S4.SS4, the sentence Q9 quotes) and §4.3 Px6 (Table 5 note "All systems matched for total reasoning tokens (mean =4,800 per trial)"); §4.1 Px2 states only "we matched maximum total iterations between MAS and SAS systems". The entry's S197 `source:` line likewise lists §4.1 but never §4.4. Fix: cite §4.4 (or §4.3 Table 5 note) for the token-budget match; keep §4.1 only for iteration matching. Reproduce: `grep -n 'hits=\[\]' <build>/match-output.txt` probe D in probe2-output.txt.
3. **K63R2ReviewQuoteArxivB-3 (low — citation-location).** Decision-table row 8 cites "(§3.2, §4.2)" but its quote "Independent isolates the effect of parallelism (ensemble) without communication" lives in §3.1 System Definition (S3.SS1.SSS0.Px2, "Multi-Agent System (MAS)."), not §3.2; the entry's source line lists only §3.2. The −35% number is correct but housed in the §4 preamble (Fig. 2 caption (a)), not §4.2 prose. Reproduce: quote search section in match-output.txt (`Q6`-style block for `N-isolates-parallelism`).
4. **K63R2ReviewQuoteArxivB-4 (info).** Fig. 2 caption items (a)–(f) are housed in the §4 preamble (S4, before the §4.1 heading), so row citations like "caption range … (§4.2)" are loose but conventional (wave-1 did the same). Caption (d) writes "(from -11 to +6%)" — no % on −11; the entry's "−11%" normalizes the unit, value and direction correct. No action needed beyond awareness.
5. **K63R2ReviewQuoteArxivB-5 (info).** Q7 and the β/p pair: the verbatim 45%-sentence is §1; the quantitative housing is §4.3 Table 4 ("Baseline paradox" interaction −0.236, p = 0.004, CI [−0.396,−0.076]) with decision-boundary derivation in §4.3 Px6 (P*_SA ≈ 0.04/0.236 = 0.170 → raw ≈ 0.45). Entry's row-4 cite "(§4.2, §4.3)" is defensible; only the quote's §1 provenance is unstated. No defect in numbers.

## Artifacts
- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2ReviewQuoteArxivB.md` (this file)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ReviewQuoteArxivB/match_arxiv.py` (own matcher), `match-output.txt` (73 sections, all item matches), `probe2.py`/`probe3.py` (follow-ups; outputs in scratch)
- Scratch: `/tmp/kumitate-r63/K63R2ReviewQuoteArxivB/` (live.html 663997 B, probe2-output.txt, entry-committed.md)

## Limits
- Live fetch is a point-in-time GET (2026-10-25); byte-identity with the pinned capture means capture-trust and live-trust coincide today, but T5's fresh-fetch arm can drift independently of T3/T4 at any later recheck.
- Matcher normalizes markup/whitespace and math-alttext; it does not render images — numbers that exist only inside raster figures would be invisible (none of the entry's numbers are: all located in text/captions/tables).
- "Prompts were not tuned per model family (§5)" verified by context sentence, not by exhaustive search for tuning claims elsewhere; negative claims ("no wall-clock") checked by corpus-wide normalized search, which cannot rule out synonyms I did not enumerate.
- S196 half of the entry, the probes/counters, T1–T7 mechanics, and wave-1's C1 evidence are out of my seat scope; I did not run topology63-probe.mjs.
- No new tools installed (curl + python3 stdlib only); no pacman, no service restarts; lane untouched except my report and build dir.
