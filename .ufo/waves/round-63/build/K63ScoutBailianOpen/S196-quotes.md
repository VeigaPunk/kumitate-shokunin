# S196 — 阿里云百炼 多智能体协作（coordinator 拓扑）
# source: https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md
# capture: .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md
# sha256: 7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6 (3388 bytes)
# Each quote: verbatim, <=25 whitespace-words, occurs exactly once in the capture
# (norm() = the frozen counter's norm in .ufo/waves/round-63/probe/topology63-probe.mjs).

- S196 — "协作拓扑类型，当前仅支持 `coordinator`。"
- S196 — "编队条目列表，1-20 个。传空数组表示清空编队。"
- S196 — "条目类型：`agent`（引用另一个 Agent）或 `self`（coordinator 自身，编队中最多一个）。"
- S196 — "被引用的智能体 ID，`type=agent` 时必填（最长 64 字符）"
- S196 — "被引用的智能体版本号，`type=agent` 时可选（>=1，不传取最新）"
- S196 — "不配置 `multiagent` 或编队为空时，智能体按单智能体运行。"
- S196 — "表示清空编队，智能体回退为单智能体运行"
