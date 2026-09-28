# Route resolution — `omp-global-config.mjs` over `~/.omp/agent/config.yml`

## Mechanism (source: `scripts/omp-global-config.mjs` header + `resolveSeatFromMaps`)

Precedence, per seat: `task.agentModelOverrides.<seat>` → if `@alias`,
`modelRoles.<alias>` → concrete `provider/model[:effort]` route.
`retry.fallbackChains` keyed by the ALIAS when present, else by the concrete
route selector, else `[]`. Chains are never wrapped or recursed; an
`@`-valued `modelRoles` entry is rejected (`resolveAliasFromMaps`,
`malformed`). Missing seat override or missing alias → typed `missing`
failure — fail closed, never a guessed route. `readGlobalSeatRouting`
parses once and resolves every seat from shared maps (O(seats), not
O(seats × text)). Reads are fd-bound: `O_NOFOLLOW` + fstat size pin +
post-read size check, ≤1 MiB.

Config discovery `DEFAULT_CANDIDATES` order: `.omp/agent/config.yml`,
`.omp/agent/config.yaml`, `.config/omp/config.yml`, `.config/omp/config.yaml`,
`.omp/config.yml`, `.omp/config.yaml` (resolved under HOME).

## Live global table (observed 2026-09-28, `~/.omp/agent/config.yml`)

`task.agentModelOverrides`: planner→`@m_lunamax`; reviewer, critic,
revenger, scout, executor, labrat, mutation-tester, simplifier, scribe,
distiller→`@m_zfl`; connector→`@m_flash`; sentinel→`@m_grok`.

`modelRoles` (relevant pins): `m_zfl`→`zai/glm-5.3-flash:max`,
`m_flash`→`charm-hyper/deepseek-v4.1-flash:max`,
`m_kcode`→`kimi-code/kimi-for-coding:high`,
`m_composer`→`cursor/composer-2.5`,
`m_lunamax`→`openai-codex/gpt-6-luna:max`,
`m_antigravity`→`google-antigravity/gemini-3.8-flash:high`,
`m_grok`→`xai-oauth/grok-4.5:low`,
`m_daybreak`→`openai-codex/gpt-daybreak-blue-latest:max`,
`m_qwen`→`alibaba-token-plan/qwen3.8-max:xhigh`.

`fallbackChains` exist per alias; `m_zfl` carries an 11-hop chain ending in
deepseek-v4.1-flash routes across charm-hyper/alibaba-token-plan/
opencode-go/devin. `m_qwen`, `m_daybreak`, `m_composer`, `m_swe` have `null`
chains (no fallback — exhaustion is a typed dead end, not a silent hop).

## Session fleet map vs live table — drift record

L1 session prompt (2026-09-28, round 1 + interjection): executor/scribe→
`m_kcode`, reviewer→`m_composer`, planner→`m_lunamax`, critic/distiller/
simplifier/revenger/labrat/mutation-tester→`m_zfl`, scout→`m_flash`
(corrected mid-round from `m_zfl`), connector→`m_antigravity`,
sentinel→`m_grok`.

| Seat | Live global | Session fleet map |
|---|---|---|
| reviewer | m_zfl | m_composer |
| connector | m_flash | m_antigravity |
| scout | m_zfl | **m_flash** (operator correction) |
| executor | m_zfl | m_kcode |
| scribe | m_zfl | m_kcode |

Both authorities recorded verbatim; session prompt is the order for L2
dispatch inside its session, the global table is the durable fleet default.
All aliases in the fleet map resolve in the live `modelRoles` — no phantom
aliases.

## Retry policy — two surfaces, don't conflate

Global config carries `usageAwareFallback: true`. A native trial's projected
`.omp/config.yml` must instead carry `modelFallback:true`,
`waitForUsageReset:false`, `usageAwareFallback:false`,
`fallbackRevertPolicy:never` — enforced by strict line grammar in
`run-omp-native-trial.mjs` (`requireBinding`, fail `missing`). Inside a
native round, fallback chains advance only on typed capacity failures.

Verify a seat live: `ufo route-plan --role <role>` prints the generated
primary + ordered fallback family (`crates/ufo-cli/src/main.rs`).

Sources: `scripts/omp-global-config.mjs` (header, `DEFAULT_CANDIDATES`,
`resolveAliasFromMaps`, `resolveSeatFromMaps`, `readGlobalSeatRouting`);
`~/.omp/agent/config.yml` read 2026-09-28; `scripts/run-omp-native-trial.mjs`
retry projection block (~L540-580); L1 session prompt.
