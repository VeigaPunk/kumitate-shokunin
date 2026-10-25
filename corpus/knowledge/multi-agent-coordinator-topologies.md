source: S196 — Alibaba Cloud Bailian Model Studio, 多智能体协作 (managed agents `multiagent` roster) — https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md — § 多智能体协作, § 编队配置, § agents 条目字段 (the `.md` rendering; the bare page is the HTML build)
source: S197 — Kim et al., Towards a Science of Scaling Agent Systems — https://arxiv.org/html/2512.08296v3 — § 3.2 Agentic Tasks and Benchmarks, § 4.1 Setup, § 4.2 Main Results, § 4.3 Scaling principles, § 5 Limitations, App. C.3 Critical Threshold (arXiv:2512.08296v3, 08 Apr 2026)
verified-at: 2026-10-25
recheck: 90d — `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 -o live.html && grep -c '260 experiments' live.html` -> 2; `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' -o live.md && grep -c coordinator live.md` -> 11 (both run 2026-10-25; 663997 and 3388 bytes, byte-identical to this round's captures)
coverage-map: frontier band "multi-agent coordinator topology" (PROVINCE.md §Frontier)

# Multi-agent coordinator topologies: pick the topology from the task, not the agent count

The decision table comes first because the study's headline is a negative: across all six benchmarks and four
multi-agent variants the mean effect is −0.3% (95% CI −58.7% to +77.2%, σ = 37.5%) — heterogeneity, not a win
(S197 §4.2). The vendor contract (S196) supplies the ceiling such a decision has to live under, not the decision.

## If the task looks like X, prefer topology Y

| If the task looks like | prefer | because (S197 section) |
| --- | --- | --- |
| Decomposes into independent parallel information streams, single-agent baseline under ~45% (multi-source research, multi-step quantitative reasoning) | **Centralized** — one orchestrator plus n members | Finance Agent is the strongest MAS result: Centralized +80.8% (0.631 vs SAS 0.349), and the caption range over all variants is +57% to +80.8% (§4.2) |
| Same decomposable shape, but you refuse a single orchestrator bottleneck and can pay peer chatter | **Decentralized** — peer-to-peer fusion, consensus | Named winner on BrowseComp-Plus (+9.2% vs Centralized +0.2%); best named result on Workbench (+5.6%, Centralized and Hybrid −1.2%, caption range −11% to +6%); second on Finance (+74.5% vs Centralized +80.8%) (§4.2) |
| Tight sequential constraint satisfaction, short execution pipelines (planning, crafting) | **Single agent (SAS)** | Every MAS variant loses on PlanCraft: Independent −70.0%, Centralized −50.3%, Decentralized −41.5%, Hybrid −39.1%; critical domain complexity D ≈ 0.40 (App. C.3) |
| The single-agent baseline already sits above ~45% accuracy | **Single agent (SAS)** | Capability-saturation ceiling (β = −0.236, p = 0.004): "tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents"; SWE-bench Verified degrades for every variant, −2.1% to −14.9% (§4.2, §4.3) |
| Few tools per agent (2), orchestration-heavy team | **Independent**, or plain SAS — avoid Centralized | Terminal-Bench: Independent +1.7% (0.350), Centralized −19.2% (0.278); the low tool count limits the benefit of orchestration-heavy architectures (§4.2) |
| Tool-heavy workflows — the paper's negligible-efficiency band ends at T ≤ 4 tools | **the simplest topology you can run** | Tool-coordination trade-off (β = −0.096, p = 0.002): "tool-heavy workflows suffer from coordination tax", and tool-rich environments amplify it (§4.3; reading the T > 4 side as penalised is the contrapositive of the stated T ≤ 4 band [INFERENCE]) |
| Long traces where one bad step must not reach the output | **Centralized** — lowest amplification of any MAS | Trace-level error amplification: SAS 1.0, Centralized 4.4, Hybrid 5.1, Decentralized 7.8, Independent 17.2 (§4.3) |
| You want an ensemble of independent attempts with no cross-validation | **Independent** — synthesis-only aggregator | "Independent isolates the effect of parallelism (ensemble) without communication"; it also carries the largest named loss on BrowseComp-Plus (−35%) (§3.2, §4.2) |

A row restates a measured per-benchmark winner; transferring it to a *new* task is the study's predictor (87%
correct architecture selection on held-out configurations, versus 20% random and 54% capability-only, §4.3), not a
per-row guarantee — that transfer is this entry's construction, not a sentence the paper writes [INFERENCE].

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
  and tool-call access. The percentages are fixed-budget percentages; the study reports no cost, latency or
  wall-clock comparison (§4.1).
- **S196 is a contract, not a measurement.** It gives field shape and the one supported topology; it states no
  fan-out performance, no cost, no failure behaviour, and no opinion on when a roster is worth having. Every
  "prefer" above comes from S197 alone.
- **Unspecified by both.** Whether a member agent may itself be a coordinator (recursion) and how nested rosters
  count against the 1–20 bound: neither source says [INFERENCE: unspecified].
- **Version scope.** arXiv 2512.08296v3 (08 Apr 2026) and the vendor page as served 2026-10-25; earlier paper
  versions and later vendor changes are out of scope. Benchmarks are named per S197 Table 1; the mapping of those
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
