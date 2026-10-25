source: S126 — https://docs.temporal.io/encyclopedia/detecting-activity-failures — S131 — https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-introduction — S133 — https://arxiv.org/abs/2607.14166 — S134 — https://arxiv.org/abs/2609.29095 — S135 — https://developers.cyberagent.co.jp/blog/archives/63635/
verified-at: 2026-10-24
recheck: 90d
coverage-map: durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) (PROVINCE.md §Frontier band 4)
ground: PROVINCE.md §Frontier band 4 — what "durable" actually guarantees, and the measured places the guarantee breaks.

All five sources were opened for this entry on 2026-10-24 by the lane.

- receipt:`.ufo/waves/round-60/build/ScoutTemporalDetect/body.html`@sha256:c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50
- receipt:`.ufo/waves/round-60/build/ScoutAliyunManaged/body.md`@sha256:88ee409253bd4fc196f40512b71eb21fa423abc1164582bf1714688a24b599e7
- receipt:`.ufo/waves/round-60/build/ScoutArxivStopMeansStop/body.html`@sha256:7608aabc7542ba6b856f7ac1ff79206b5adbd3adbf8033036d7e3964f69d42ef
- receipt:`.ufo/waves/round-60/build/ScoutArxivExactlyOnce/body.html`@sha256:90637c52c11e8c8f1d0264037ca5f4a51d62875f650070c804fed0634b0ad1c3
- receipt:`.ufo/waves/round-60/build/ScoutCyberAgentDurable/body.html`@sha256:6f18124ee4a897656f9067f4dd7251392d505898ccca08c9278617099a0bd65c

Located quote, S126 (15 words): "The Temporal Server doesn't detect failures when a Worker
loses communication with the Server or crashes."

Located quote, S131 (Chinese, 22 words): "平台托管会话状态、沙箱环境和工具执行，智能体在独立沙箱中自主执行命令、读写文件、安装依赖并处理数据，事件历史在服务端持久化"

Located quote, S133 (11 words): "This contract holds on none of six widely used open-source
frameworks."

Located quote, S134 (title, 17 words): "Where Does Exactly-Once Live? Model, Harness, and
Tool-Contract Effects on Duplicate Side Effects in LLM Agents"

Located quote, S135 (Japanese, 20 words): "副作用を持つ処理や非決定的な処理は、replay で再実行されても結果が壊れないように、durable operation の境界内に置き"

## Scope

The word "durable" covers three different designs in the agent stack, and they fail in different
ways. This entry keeps them apart, then records the measured failure of the guarantee that
frameworks document but do not deliver. It draws on one vendor's runtime contract, one Chinese
cloud vendor's managed-agent runtime, two research papers, and one Japanese-language engineering
statement of the constraint model.

## A. Durable execution as a runtime discipline

A run is a sequence of *durable operations*; the runtime checkpoints the outcome of each and
replays the sequence on restart, substituting checkpointed results for completed operations
instead of re-executing them.

The Japanese-language statement of the boundary rule: side-effecting and non-deterministic work
must be confined inside a durable operation so that replay cannot corrupt it; and replay must
traverse the *same* operation sequence — the Japanese implementation verifies each step's
identity against the existing checkpoint and treats a mismatch as non-deterministic execution
and errors out rather than continuing. This is a community row and therefore tier B; it is used
for the engineering framing, not as authority for the mechanism.

## B. Durable execution as a runtime substrate

Temporal's own contract shows what the discipline demands of the substrate. The server *cannot*
detect a worker crash, so the **Start-To-Close Timeout is the thing that forces a retry** — not
health checking. And an unset Heartbeat Timeout and an explicit `0s` are indistinguishable once
the Activity is scheduled, so "no heartbeat" cannot be expressed as a distinct policy. The
heartbeat throttle interval is derived rather than chosen: `min(heartbeatTimeout × 0.8,
maxHeartbeatThrottleInterval)`, default 30 s with a 60 s ceiling.

**Overlap with a held row, stated.** The lane already holds this page as S117 under the
worker-liveness scope. The capture is byte-identical to S117's (same sha256), so the two rows
are one document under two scopes; the group is pinned in `.ufo/pins/source-dupes.json` rather
than left as an unpinned census warning. This entry adds only the *retry-forcing* half of the
page — the Start-To-Close Timeout — to what the lane already held about the heartbeat half.

## C. Durable execution as a managed, server-side session

A Chinese cloud vendor's managed-agent runtime takes the third shape: the platform holds the
session state and persists the event history server-side; each session runs in its own managed
cloud container sandbox; and the event model is a **session-level SSE stream**, not
response-level streaming. An interrupted long-running task can therefore be resumed. This is a
vendor's own product contract — it asserts the behaviour rather than measuring it.

## D. Where the guarantees break

Across six widely used open-source agent frameworks, the documented barrier contract — while a
run is paused, cancelled or timed out, no gated side effect executes — holds on none of them. The
recurring failure is a **sibling leak**: an approval gate suspends its own branch while a
sibling's effect executes during the pause, which defeats rejection outright. The same probes
confirm replay double-execution, cancellation orphans and timeout zombies.

The hazard is reachable in practice rather than theoretical: frontier models emit the
leak-triggering plan shape at rates up to 14%, and live models driving unmodified frameworks
leaked **215 of 1,200 runs**. The proposed repair is an *environment-external* gate through which
every side effect must be admitted, enforcing hold-until-decided, reject-cancels,
dedup-on-replay and fence-on-cancel under a stated complete-mediation contract.

## E. Where exactly-once has to live

The companion question — when an agent's tool call is duplicated, which layer owns the fix — is
posed by the paper whose title attributes duplicate side effects jointly to the model, the
harness *and* the tool contract, and which names its benchmark "Limbo".

**Scope limit, stated rather than hidden:** this round read the **title page only** of that
paper (arXiv abs page, HTTP 200, 44,818 bytes). No measured result from it is claimed here. The
campaign's own `S141` row for the same document claims the 25,930-episode measurement; the lane
does not adopt that row, because the campaign staged the same document under two ids and
adopting both would count one paper twice — the reject and its flip are recorded in
`corpus/lessons/round-60.md`.

## Consequence for an orchestrator

A documented "durable" flag is not a guarantee. The three places to look, in order, are: the
timeout that actually triggers the retry (S126), the point at which a side effect is *admitted*
rather than merely scheduled (S133), and whether the tool contract itself carries an idempotency
key (S134 — question open, title page only).
