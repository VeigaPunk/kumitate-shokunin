source: S196 — Alibaba Cloud Bailian Model Studio, 多智能体协作 (managed agents `multiagent` roster) — https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md — § 多智能体协作, § 编队配置 (its `agents` per-entry field table, "`agents` 中每个条目的字段：") (the `.md` rendering; the bare page is the HTML build)
source: S197 — Kim et al., Towards a Science of Scaling Agent Systems — https://arxiv.org/html/2512.08296v3 — § 3.2 Agentic Tasks and Benchmarks, § 4.1 Setup, § 4.2 Main Results, § 4.3 Scaling principles, § 5 Limitations, App. C.3 Critical Threshold (arXiv:2512.08296v3, 08 Apr 2026)
verified-at: 2026-10-25 (arXiv:2512.08296v3, 08 Apr 2026; Bailian `.md` rendering as served 2026-10-25)
recheck: 90d — `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 -o live.html && grep -c '260 experiments' live.html` -> 2; `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' -o bailian-live.txt && grep -c coordinator bailian-live.txt` -> 11 (both run 2026-10-25; 663997 and 3388 bytes, byte-identical to this round's captures)
coverage-map: frontier band "multi-agent coordinator topology" (PROVINCE.md §Frontier)

# Multi-agent coordinator topologies: pick the topology from the task, not the agent count

The decision table comes first because the study's headline is a negative: across all six benchmarks and four
multi-agent variants the mean effect is −0.3% (95% CI −58.7% to +77.2%, σ = 37.5%) — heterogeneity, not a win
(S197 §4.2). The vendor contract (S196) supplies the ceiling such a decision has to live under, not the decision.

## If the task looks like X, prefer topology Y

> Studied scale: every MAS configuration runs 3 agents (3 sub-agents + 1 orchestrator; 3 debate agents);
> agent scaling is explored only "up to nine"; turns grow superlinearly (≈69 turns at n=6, ≈157 at n=10 vs
> SAS 7.2) and "beyond 3–4 agents, per-agent reasoning quality degrades sharply under fixed budgets" (§4.3).
> The vendor contract (S196) caps a roster at 20 entries including the coordinator. Do not apply the rows
> below to teams larger than that. All percentages are fixed-budget (matched ~4,800 reasoning tokens),
> SAS-referenced. The benchmark-shape mappings are this entry's wording [INFERENCE]; the study measured six
> benchmarks only.

| If the task looks like | prefer | because (S197 section) |
| --- | --- | --- |
| Structured low-entropy decomposition — factors analyzable independently (Finance-like earnings/market/risk analysis), SAS under ~45% | **Centralized or Decentralized** — all MAS beat SAS | Finance: every MAS variant +57% to +80.8% (Centralized +80.8% 0.631 vs SAS 0.349, Decentralized +74.5%, Hybrid +73.1%); the MAS-vs-MAS spread is a point estimate the study does not significance-separate; the paper's own worked rule: "Analysis tasks (T=5, P_SA=0.35) favor centralized multi-agent" (§4.3) |
| High-entropy parallel search or tool-heavy business workflows (BrowseComp-Plus-like multi-source web research; Workbench-like T=16 function-calling) | **Decentralized** | Named winner on both benchmarks of that shape: BrowseComp-Plus +9.2% (Centralized flat +0.2%, Independent −35%), Workbench +5.6% (Centralized/Hybrid −1.2%); §1: "decentralized coordination benefits tasks requiring parallel exploration of high-entropy search spaces"; the BrowseComp-Plus ordering is model-family-dependent (Table 9) and Workbench's margin sits inside the caption's −11% to +6% spread |
| Sequential constraint satisfaction — ordered steps where decomposition is artificial (PlanCraft-like planning/crafting) | **Single agent (SAS)** | Every MAS variant loses on PlanCraft: Independent −70.0%, Centralized −50.3%, Decentralized −41.5%, Hybrid −39.1% (vs SAS 0.568); "sequential interdependence, rather than complexity alone, determines coordination viability"; D ≈ 0.40 (App. C.3) is PlanCraft-correlated but non-discriminative — Finance (D=0.407) won +80.8% and SWE-bench (D=0.255) lost with every MAS, and the paper itself says "Domain complexity alone does not fully predict MAS effectiveness" |
| The single-agent baseline already sits above ~45% accuracy | **Single agent (SAS)** | Capability-saturation ceiling (β = −0.236, p = 0.004; survives cluster-robust SEs and Holm correction, pHolm = 0.018): "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents"; SWE-bench Verified degrades for every variant, −2.1% to −14.9%; validates across all held-out models (Table 9) |
| Few tools per agent (≈2) | **SAS**, or Independent if marginal gains suffice | Terminal-Bench (2 tools): Independent +1.7% (0.350) vs SAS 0.344, Centralized −19.2% (0.278); "the low tool count (2 tools) limits the benefit of orchestration-heavy architectures" (§4.2); Independent's +1.7% is caption-"marginal" and its relative results failed held-out-model validation on Gemini (Table 9) |
| Tool-heavy workflows (T > 4) | **the lowest-overhead topology that still decomposes the task — not automatically SAS** | Ec×T interaction (β = −0.096, p = 0.002 naive) penalises low-efficiency architectures as T grows ("tool-rich environments amplify the coordination tax"); on the study's own T=16 benchmark the winner was Decentralized (0.664 vs SAS 0.629) while Hybrid collapsed (O% = 515), and the paper's worked rule reads "Tool-heavy tasks (T=16, P_SA=0.63) favor decentralized multi-agent despite high overhead (263%)"; directional only — dataset-level predictor, not significant under cluster-robust SEs; the tool main effect is positive (log(1+T) coefficient 0.166, p < 0.001) |
| Long traces where one bad step must not reach the output | **Centralized** (if a MAS at all) — verification bottleneck | Factual error reduction: Centralized/Hybrid 22.7% on average (95% CI [20.1%, 25.3%]), peaking at 31.4% on Finance; context omission reduced by 66.8% under Centralized; Independent has no error correction (+4.6%) — "errors made by individual agents propagate directly to the aggregated output"; note A_e^trace (SAS 1.0, Centralized 4.4, Hybrid 5.1, Decentralized 7.8, Independent 17.2) measures wasted coordination compute, not output contamination, and has no significant performance effect (p = 0.658); SAS (1.0) remains the zero-propagation option |
| You want to measure ensemble value in isolation | **Independent** — as an ablation, not a default | "Independent isolates the effect of parallelism (ensemble) without communication"; it is the study's worst architecture by mean success (0.370 vs SAS 0.466), carries the largest named loss (BrowseComp-Plus −35%) and no error correction (+4.6%) — adopt it only to run that measurement |

> A row restates a measured per-benchmark winner. Transferring a row to a new task is this entry's
> construction [INFERENCE]: the study's 87% correct-architecture-selection figure is within-domain
> (held-out configurations of the same six benchmarks), and the paper itself reports that cross-domain
> prediction of absolute success remains limited (leave-one-dataset-out cross-validation; Table 9 validates
> only 11/15 finding-model pairs, with the BrowseComp-Plus ordering varying by model family).

## The roster ceiling a coordinator must live under (S196)

| field | limit stated | consequence |
| --- | --- | --- |
| `multiagent.type` | "协作拓扑类型，当前仅支持 coordinator。" | only a coordinator topology is expressible; the study's Decentralized and Hybrid rows have no vendor equivalent in this API [INFERENCE] |
| `multiagent.agents` | 1–20 entries; `[]` clears the roster | fan-out ceiling is 20 entries *including* the coordinator, so at most 19 members [INFERENCE] |
| entry `type: self` | at most one per roster | one coordinator; no co-orchestrators |
| entry `type: agent` → `id` | required, max 64 chars | member identity is an opaque string, not a capability or role descriptor |
| entry `type: agent` → `version` | optional, ≥ 1, omitted = latest | pinning is opt-in: an unpinned member floats to the newest version, so reproducibility is a choice, not the default |
| absent `multiagent`, or empty roster | agent runs single-agent | the platform default is SAS — the topology S197 finds best for sequential and saturated tasks (§4.2) |

## Limits

- **What the study measured.** Six benchmarks, two of which (SWE-bench Verified, Terminal-Bench) use 20-instance
  subsets; agent scaling is explored only "up to nine"; all agents share identical base architectures differing in
  scale and role prompts; prompts were not tuned per model family (§5). Communication overhead grows superlinearly
  with agent count, so nothing here extends to large collectives.
- **Fixed-budget deltas.** MAS and SAS were matched for total reasoning-token budget (mean 4,800 tokens per trial)
  and tool-call access. The percentages are fixed-budget percentages; the study reports no latency or
  wall-clock comparison, and its cost evidence (Figure 3: normalized USD cost per experiment against
  performance, 180 configurations with full cost tracking) is not budget-matched to the headline
  percentages (§4.1).
- **S196 is a contract, not a measurement.** It gives field shape and the one supported topology; it states no
  fan-out performance, no cost, no failure behaviour, and no opinion on when a roster is worth having. Every
  "prefer" above comes from S197 alone.
- **Unspecified by both.** Whether a member agent may itself be a coordinator (recursion) and how nested rosters
  count against the 1–20 bound: neither source says — UNKNOWN.
- **Version scope.** arXiv 2512.08296v3 (08 Apr 2026) and the vendor page as served 2026-10-25. v1/v2 (Dec 2025)
  read 180 experiments across four benchmarks — every headline number here is v3-only — and v3 itself still
  carries one stale "180 configurations" in its Figure 3 caption; do not cite it as the setup figure. Later
  paper versions and vendor changes are out of scope. Benchmarks are named per S197 Table 1; the mapping of those
  benchmark shapes onto "if the task looks like" is this entry's wording [INFERENCE].

## Located quotes

- S196 — "多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。"
- S196 — "协作拓扑类型，当前仅支持 coordinator。"
- S196 — "编队条目列表，1-20 个。传空数组表示清空编队。"
- S196 — "条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。"
- S196 — "被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）"
- S197 — "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures"
- S197 — "Finance Agent demonstrates the strongest multi-agent benefits, with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)"
- S197 — "PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)"
- S197 — "Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%)"
- S197 — "This suggests that sequential interdependence, rather than complexity alone, determines coordination viability."
- S197 — "tool-rich environments amplify the coordination tax, making simpler architectures more effective"
- S197 — "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents"
- S197 — "Centralized introduces hierarchical verification and bottleneck control."
- S197 — "All MAS and SAS configurations were matched for total reasoning-token budget (mean 4,800 tokens per trial) and tool-call access to isolate coordination effects."
- S197 — "Our framework systematically compares canonical coordination structures with preliminary exploration of scaling number of agents up to nine."
