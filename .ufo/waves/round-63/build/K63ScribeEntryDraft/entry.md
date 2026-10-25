source: S196 — https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md — § 编队配置 (the `multiagent` field table and the `agents` entry-field table)
source: S197 — https://arxiv.org/html/2512.08296v3 — § 4.1 Setup, § 4.2 Main Results, § 4.3 Scaling principles, § 4.4 Coordination Efficiency, Error Dynamics, and Information Transfer, § 5 Limitations
verified-at: 2026-10-25 (S196 vendor `.md` rendering: HTTP 200, 3388 bytes, sha256 7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6, live re-fetch byte-identical; S197: arXiv:2512.08296v3 [cs.AI] 08 Apr 2026, HTTP 200, 663997 bytes, sha256 df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223, live re-fetch byte-identical)
recheck: 90d — `curl -fsSL https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md | grep -c coordinator` -> 11; `curl -fsSL https://arxiv.org/html/2512.08296v3 | grep -c '80.8'` -> 18 (both ran 2026-10-25)
coverage-map: frontier band "Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies)" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier band 4 already holds S018 (MAST: how multi-agent systems fail) and S131 (the same vendor's single-agent session substrate); neither states the roster a coordinator is configured with, nor prices a topology against one agent.

# Multi-agent coordinator topologies: the roster contract and the measured cost

Two documents, one decision. S196 is the wire contract a managed coordinator exposes: who may be in the roster, how members are versioned, and what happens when the roster is empty. S197 is the measurement: what five topologies bought over one agent across 260 controlled configurations, and which task property decided the sign.

## Scope

- **In scope.** The roster contract for a managed coordinator (S196) and the measured cost/benefit of coordination topologies against a single-agent baseline (S197), including the architecture-selection rule S197 fits.
- **Already covered, not repeated.** `S018` (MAST) owns the multi-agent failure taxonomy: S197 §4.4 says it follows that taxonomy ("Following the Multi-Agent System Failure Taxonomy (MAST) proposed by [ 15 ]") and adds frequencies per architecture, not new categories. `S131` owns the same vendor's single-agent runtime substrate (server-side session state, persisted event history); S196 is the layer above it. Durable-execution guarantees belong to band 4's earlier entries, not this one.
- **Out of scope.** Cross-vendor coordinator APIs (one vendor's contract is captured), currency costs beyond the per-trial figures S197 reports, and any claim that these percentages transfer to a different benchmark mix.

## The contract: a bounded, version-pinned roster (S196, § 编队配置)

- **One topology, configured as a field.** Orchestration is set on the Agent object through `multiagent`, whose `type` "当前仅支持 coordinator" (S196): the managed API exposes a coordinator only, so three of S197's four MAS architectures (Independent, Decentralized, Hybrid) are not expressible here.
- **The roster is bounded at 20.** `agents` is "编队条目列表，1-20 个"; an empty array clears the roster (S196). S197's fitted agent counts span n_a 1-4 (§4.3), so a real coordinator's ceiling is five times the largest measured team.
- **Self is a roster member, at most once.** An entry is `agent` (a reference by `id`, at most 64 characters) or `self` — "coordinator 自身，编队中最多一个" (S196). The coordinator is counted inside its own fan-out, not outside it.
- **Members are version-pinned, and the default floats.** `version` is optional and >=1; omitting it takes the latest (S196). A reproducible roster must pin explicitly — the unpinned branch is the non-reproducible one.
- **Single-agent is the default state, not an error path.** Not configuring `multiagent`, or an empty roster, runs the agent single-agent (S196). S197's SAS is therefore the vendor's zero-configuration baseline, which makes its deltas a deployment decision rather than a comparison of two products.

## The measured cost: task structure decides, not agent count (S197)

Design (§4.1): 260 configurations = six benchmarks × five architectures (SAS, Independent, Centralized, Decentralized, Hybrid) × three LLM families, with tools, prompts and compute held constant; Intelligence Index spans 42 to 71; SWE-bench Verified and Terminal-Bench use 20-instance subsets. Slope agreement across families is tight — "the maximum difference in architecture-specific scaling slopes between any two LLM families is Δ max = 0.023".

| Benchmark (§4.2) | MAS vs SAS per architecture | Reading |
| --- | --- | --- |
| Finance Agent | Centralized +80.8% (0.631 vs 0.349), Decentralized +74.5%, Hybrid +73.1% | decomposable reasoning: coordination wins |
| Workbench | Decentralized +5.6% (0.664 vs 0.629), Centralized and Hybrid -1.2% | marginal; 16 tools |
| BrowseComp-Plus | Decentralized +9.2%, Centralized +0.2%, Independent -35% | open world: gains stay small |
| SWE-bench Verified | Hybrid -2.1%, Centralized -3.1%, Decentralized -5.4%, Independent -14.9% | SAS baseline 0.522, above the 45% threshold |
| Terminal-Bench | Independent +1.7% (0.350 vs 0.344), Centralized -19.2% (0.278) | 2 tools: orchestration does not pay |
| PlanCraft | -70% to -39%, every variant degrades | sequential planning: coordination loses most |

Aggregate (§4.2): overall mean MAS improvement is -0.3% (95% CI -58.7% to +77.2%, σ = 37.5%); the range across all variants runs from -70.0% (PlanCraft Independent) to +80.8% (Finance Centralized).

Cost and failure price (§4.1, §4.3, §4.4):

- **Coordination overhead** relative to SAS: Independent 58%, Decentralized 263%, Centralized 285%, Hybrid 515% — 1.6-6.2x token budgets at matched performance.
- **Token efficiency** (successes per 1K tokens, §4.4): SAS 67.7; Centralized 21.5 (3.1x worse); Decentralized 23.9 (2.8x); Hybrid 13.6 (5.0x).
- **Trace-level error amplification** (§4.4): SAS 1.0, Centralized 4.4, Hybrid 5.1, Decentralized 7.8, Independent 17.2 (95% CI 14.3-20.1) — coordination turns one agent's mistake into 4-17x the wasted work.
- **Turn growth is super-linear** (§4.4): total turns fit T = 2.72(n+0.5)^1.724, R² = 0.974; Hybrid needs 6.2x SAS turns (44.3 vs 7.2). "beyond 3-4 agents, per-agent reasoning quality degrades sharply under fixed budgets".
- **Capability ceiling** (§4.3, §6): where single-agent accuracy already exceeds 45%, extra agents return negative (β = -0.236, p = 0.004) — the one effect that survives cluster-robust inference (p = 0.004) and Holm-Bonferroni correction (p_Holm = 0.018).
- **Tool-coordination trade-off** (§4.3): β_Ec×T = -0.096 (95% CI -0.154 to -0.037), p = 0.002; at 4 tools or fewer the efficiency effect is negligible (|ΔP| < 0.05).
- **Fit quality** (§4.3): cross-validated R² = 0.373 on the Intelligence Index, 0.413 on the task-grounded Agentic Capability Index; the fitted rule selects the best architecture correctly for 87% of held-out configurations, against 20% random and 54% capability-only.

## The decision rule that follows

1. **Ask what the task is before asking how many agents.** The sign of the delta is set by decomposability, tool count and the single-agent baseline: "demonstrating that architecture-task alignment, not number of agents, determines collaborative success" (S197). Agent count is downstream, not the lever.
2. **Cut at the capability ceiling first.** If the single-agent baseline is above 45%, ship SAS. That term is the most robust in S197 (survives both corrections) and alone explains SWE-bench's degradation.
3. **Then cut on tool count.** At 2 tools centralized orchestration is a net negative (Terminal-Bench -19.2%); at 16 tools overhead compounds (hybrid collapse on Workbench). **[INFERENCE]** S197 reports the T = 2 and T = 16 cases and a β_Ec×T interaction; using tool count as a pre-filter before topology choice is our reading, not a procedure the paper states.
4. **Choose centralized only where a verification bottleneck can pay.** Centralized holds trace-level amplification to 4.4x against 17.2x for independent, and wins Finance Agent by +80.8%. **[INFERENCE]** Reading that as "choose centralized where sub-tasks are independent and their outputs are checkable" is ours — S197 attributes the win to task decomposability, not to a verification requirement.
5. **Budget the overhead before the fan-out.** Centralized costs 285% overhead and 3.1x the tokens per unit success. **[INFERENCE]** A roster larger than the task's independent streams buys overhead without the gain: S196 caps the roster at 20, and S197 measures no benefit above 3-4 agents under a fixed budget.
6. **Pin the roster.** S196 lets an unpinned member float to the latest version; a topology whose members silently change is not the topology that was measured.

## Limits

- **S196 is a vendor page, dated by fetch only.** No version number, no last-modified date, no changelog: the capture is dated 2026-10-25 because that is when it was fetched, and the live re-fetch is byte-identical on that date. It is one vendor's contract, in Chinese; the 20-entry cap and the coordinator-only topology may change without notice. Quotes stay in the source language and are not translated here.
- **S197 is a preprint.** arXiv:2512.08296v3 [cs.AI] of 08 Apr 2026, not a peer-reviewed venue publication. Its own §5 limits the reach: canonical structures compared with only a preliminary exploration of scaling agent count up to nine; all agents share identical base architectures differing only in scale and role prompts; prompts were not tuned per model family; SWE-bench Verified and Terminal-Bench use 20-instance subsets; the regression clusters at G = 6, so several dataset-level predictors lose significance under cluster-robust standard errors and are reported as directional patterns.
- **Skew between the two rows.** S196's ceiling (20 members) is five times the largest fitted agent count (n_a 1-4) and more than twice the largest scaling probe (n_a = 9); nothing in either capture measures a 20-member coordinator.
- **UNKNOWN.** Whether the 20-entry cap is enforced at Agent creation or at session start; whether version pinning changes measured behaviour (S196 states the field, not an experiment); the cost per topology for models outside S197's nine.

## Located quotes

- S196 — "多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。不配置 multiagent 或编队为空时，智能体按单智能体运行。"
- S196 — "协作拓扑类型，当前仅支持 coordinator。"
- S196 — "编队条目列表，1-20 个。传空数组表示清空编队。"
- S196 — "条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。"
- S196 — "被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）；type=self 时不可传。"
- S197 — "Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families"
- S197 — "demonstrating that architecture-task alignment, not number of agents, determines collaborative success"
- S197 — "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents"
- S197 — "This super-linear scaling confirms the hard resource ceiling: beyond 3-4 agents, per-agent reasoning quality degrades sharply under fixed budgets."
- S197 — "Cross-validation on held-out configurations confirms this rule achieves 87% correct architecture selection"
