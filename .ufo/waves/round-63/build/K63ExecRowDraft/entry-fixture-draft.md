source: S196 — https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md — § 多智能体协作 subtitle, § 编队配置
source: S197 — https://arxiv.org/html/2512.08296v3 — § Abstract, patterns (1)-(3); arXiv:2512.08296v3
verified-at: 2026-10-25
recheck: 90d — `curl -fsSL 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' | grep -c 'coordinator'` and `curl -fsSL 'https://arxiv.org/html/2512.08296v3' | grep -c 'centralized verification'`
coverage-map: frontier band "Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies)" (PROVINCE.md §Frontier)
ground: frontier item **4** — durable execution and multi-agent failure research; the topology decision beneath it.

# Multi-agent coordinator topologies: the roster contract and the measured cost

## Scope

One vendor's own coordinator-formation contract and one version-pinned measurement of what a
coordinator topology costs. The contract says how a roster is expressed; the measurement says
when centralized verification earns its overhead. This entry does not restate the MAST failure
taxonomy (S018) and does not benchmark this lane.

## The contract: a bounded roster on one agent

S196 is the vendor's own page for its managed-agent `multiagent` field: the topology type
`coordinator` is the only value the field accepts today, the roster holds 1-20 entries, at most
one entry is `self` (the coordinator itself), and an absent field or an empty array reverts the
agent to single-agent operation.

## The measured cost: alignment, not agent count

S197 compares five canonical architectures (single-agent plus Independent, Centralized,
Decentralized, Hybrid) over 260 configurations on six agentic benchmarks across three LLM
families. Its third pattern is the topology result: architectures without centralized
verification propagate errors more than those with centralized coordination.

## Located quotes

- S196 — "通过 coordinator 编队，让一个协调者智能体编排多个成员智能体协同完成任务。"
- S196 — "不配置 multiagent 或编队为空时，智能体按单智能体运行。"
- S196 — "编队条目列表，1-20 个。传空数组表示清空编队。"
- S196 — "条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。"
- S197 — "architectures without centralized verification tend to propagate errors more than those with centralized coordination"
- S197 — "Across 260 configurations spanning six agentic benchmarks, five canonical architectures"
- S197 — "The framework identifies the best-performing architecture for 87% of held-out configurations"
- S197 — "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures"
