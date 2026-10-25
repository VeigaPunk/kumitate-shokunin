# Proposed replacement — `## If the task looks like X, prefer topology Y` section
# of corpus/knowledge/multi-agent-coordinator-topologies.md (seat K63R2ReviewEntryTable, wave 2).
# Basis: arXiv 2512.08296v3 capture (sha256 df31beb3…7223), norm-line refs in w2/K63R2ReviewEntryTable.md.
# Every number below is verbatim-present in the capture; class mappings are marked [INFERENCE].

Scale bound to insert directly above the table (one paragraph):

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
| Tool-heavy workflows (T > 4) | **the lowest-overhead topology that still decomposes the task — not automatically SAS** | Ec×T interaction (β = −0.096, p = 0.002 naive) penalises low-efficiency architectures as T grows ("tool-rich environments amplify the coordination tax"); on the study's own T=16 benchmark the winner was Decentralized (0.664 vs SAS 0.629) while Hybrid collapsed (O% = 515), and the paper's worked rule reads "Tool-heavy tasks (T=16, P_SA=0.63) favor decentralized multi-agent despite high overhead (263%)"; directional only — dataset-level predictor, not significant under cluster-robust SEs; the tool main effect is positive (log(1+T) +0.166, p < 0.001) |
| Long traces where one bad step must not reach the output | **Centralized** (if a MAS at all) — verification bottleneck | Factual error absorption: Centralized/Hybrid −22.7% average (95% CI [20.1%, 25.3%]), peak −31.4% on Finance; context omission −66.8% under Centralized; Independent has no error correction (+4.6%) — "errors made by individual agents propagate directly to the aggregated output"; note A_e^trace (SAS 1.0, Centralized 4.4, Hybrid 5.1, Decentralized 7.8, Independent 17.2) measures wasted coordination compute, not output contamination, and has no significant performance effect (p = 0.658); SAS (1.0) remains the zero-propagation option |
| You want to measure ensemble value in isolation | **Independent** — as an ablation, not a default | "Independent isolates the effect of parallelism (ensemble) without communication"; it is the study's worst architecture by mean success (0.370 vs SAS 0.466), carries the largest named loss (BrowseComp-Plus −35%) and no error correction (+4.6%) — adopt it only to run that measurement |

Replacement for the post-table paragraph:

> A row restates a measured per-benchmark winner. Transferring a row to a new task is this entry's
> construction [INFERENCE]: the study's 87% correct-architecture-selection figure is within-domain
> (held-out configurations of the same six benchmarks), and the paper itself reports that cross-domain
> prediction of absolute success remains limited (leave-one-dataset-out cross-validation; Table 9 validates
> only 11/15 finding-model pairs, with the BrowseComp-Plus ordering varying by model family).
