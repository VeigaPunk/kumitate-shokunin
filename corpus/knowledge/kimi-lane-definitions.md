# Kimi Code secondary-lane definitions — the 18 delegate agents

## Scope

`~/.kimi-code/agents/secondary/` holds **18 agent markdown files** (measured: `ls ~/.kimi-code/agents/secondary/ | wc -l` → `18`), the delegate
definitions the hub expands into secondary-model lanes. Every file is a
frontmatter-plus-body `.md` pinning one provider/model. This note names the
family schema, the pin convention, the full 18-lane matrix, and the two-sided
cross-reference to `~/.kimi-code/config.toml` (`[models.*]` blocks and the
`[secondary_model.models]` registry). Read-only substrate: nothing under
`~/.kimi-code` was mutated.

The assignment named "sec-fast-* and sec-mid-*"; the directory actually holds a
**third family, `sec-strong-*` (6 files)**, plus 7 `sec-fast-*` and 5 `sec-mid-*`
= 18 (OBSERVATION — `ls` listing). All three buckets are documented below; the
`sec-strong-*` prefix is a correction to the assignment wording, not an extra
surface.

Every one of the 18 lane files also has its own `## ` member section below,
headed by the lane file's full path — the per-member probe a non-author re-runs.

## Family schema

Every lane file is identical in shape: 5-line YAML frontmatter
(`---`, `name`, `description`, `whenToUse`, `---`) followed by a prose role
paragraph and a `Rules:` bullet list. The three fields are:

- `name` — the agent id, exactly the file's basename (e.g.
  `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:2` `name: sec-fast-zai-flash`).
- `description` — one sentence naming the bucket, the lane, the pinned model,
  and the role; always contains the pin convention (quoted below).
- `whenToUse` — the routing hint the dispatcher reads.

### Pin convention

Every one of the 18 `description:` lines contains the verbatim token string
**`ALWAYS spawn with model "`** followed by the quoted `<provider>/<model>` id —
the convention that ties the lane file to its `~/.kimi-code/config.toml` model entry. One
verbatim instance per bucket:

- FAST — `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:3`:
  `ALWAYS spawn with model "zai-coding-plan/glm-5.3-flash" (the pool default).`
- MIDDLE — `~/.kimi-code/agents/secondary/sec-mid-tp1-qwen-flash.md:3`:
  `ALWAYS spawn with model "alibaba-token-plan/qwen3.8-flash".`
- STRONG — `~/.kimi-code/agents/secondary/sec-strong-tp3-qwen-max.md:3`:
  `ALWAYS spawn with model "alibaba-token-plan-3/qwen3.8-max".`

(OBSERVATION: `grep -rn 'ALWAYS spawn with model' ~/.kimi-code/agents/secondary/`
matches all 18 files, once each.)

### Bucket bodies

- **FAST** — read-only posture. `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:10` `Full toolset
  available, but stay in the fast lane: prefer read-only inspection; only mutate
  files when the task explicitly requires it.` Claims exploration, read-only
  surveys, review, summaries (`~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:7`).
- **MIDDLE** — coder posture. `~/.kimi-code/agents/secondary/sec-mid-tp1-qwen-flash.md:10-13` `Match the
  surrounding code's conventions and idioms.` / `Keep the diff minimal…` /
  `Run the project's standard checks for what you changed when feasible.`
- **STRONG** — plan/hard-debug posture. `~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max.md:10-12`
  `Understand before changing: map the relevant code and constraints first.` /
  `enumerate options with trade-offs, then pick one decisively.` / `run the
  project's standard checks.`

### Effort-pinned mutants

Two lanes pin *thinking effort*, not just a model: `~/.kimi-code/agents/secondary/sec-fast-zai-flash-low.md:3`
(`…thinking effort pinned to LOW…` / `zai-coding-plan/glm-5.3-flash-low`) and
`~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max-xhigh.md:3` (`…pinned to XHIGH…` /
`alibaba-token-plan/qwen3.8-max-xhigh`). The pin is realized on the config side
by an `overrides` sub-table — `~/.kimi-code/config.toml:118` `default_effort = "xhigh"` (for
the xhigh id) and `~/.kimi-code/config.toml:652` `default_effort = "low"` (for the low id)
(OBSERVATION, both blocks read).

## Lane matrix

Alias: `$A = ~/.kimi-code/agents/secondary` (lane file), `cfg = ~/.kimi-code/config.toml`.
`cfg-model` is the `[models."<id>"]` header line; `cfg-reg` is the
`[secondary_model.models]` row line.

| Lane file (`$A/`) | Bucket | Pinned model | cfg-model | cfg-reg | Purpose (from `description`/`whenToUse`) |
|---|---|---|---|---|---|
| `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md` | FAST | `zai-coding-plan/glm-5.3-flash` | 631 | 1259 | pool default; explore/review/summary (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-zai-flash-low.md` | FAST | `zai-coding-plan/glm-5.3-flash-low` | 641 | 1260 | LOW effort; grep-and-report/mechanical (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-hyper-glm-flash.md` | FAST | `hyper/glm-5.3-flash` | 741 | 1261 | provider diversity off zai/token-plan (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-hyper-ds-flash.md` | FAST | `hyper/deepseek-v4.1-flash` | 778 | 1262 | non-GLM fast; token-plan saturated (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-tp1-ds-flash.md` | FAST | `alibaba-token-plan/deepseek-v4.1-flash` | 129 | 1263 | primary token-plan fast lane (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-tp2-ds-flash.md` | FAST | `alibaba-token-plan-2/deepseek-v4.1-flash` | 309 | 1264 | key-2 overflow (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-fast-tp3-ds-flash.md` | FAST | `alibaba-token-plan-3/deepseek-v4.1-flash` | 489 | 1265 | key-3 overflow (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-mid-tp1-qwen-flash.md` | MIDDLE | `alibaba-token-plan/qwen3.8-flash` | 186 | 1266 | default coder delegate (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-mid-tp2-qwen-flash.md` | MIDDLE | `alibaba-token-plan-2/qwen3.8-flash` | 366 | 1267 | key-2 coder (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-mid-tp3-qwen-flash.md` | MIDDLE | `alibaba-token-plan-3/qwen3.8-flash` | 546 | 1268 | key-3 coder (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-mid-zai-glm-5-turbo.md` | MIDDLE | `zai-coding-plan/glm-5-turbo` | 693 | 1269 | zai coder, 200k ctx (`:3,7`) |
| `~/.kimi-code/agents/secondary/sec-mid-hyper-qwen-flash.md` | MIDDLE | `hyper/qwen3.8-flash` | 849 | 1270 | hyper coder (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max.md` | STRONG | `alibaba-token-plan/qwen3.8-max` | 97 | 1271 | plan/hard subtasks (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max-xhigh.md` | STRONG | `alibaba-token-plan/qwen3.8-max-xhigh` | 107 | 1272 | XHIGH; single hardest subtask (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-tp2-qwen-max.md` | STRONG | `alibaba-token-plan-2/qwen3.8-max` | 290 | 1273 | key-2 hard subtasks (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-tp3-qwen-max.md` | STRONG | `alibaba-token-plan-3/qwen3.8-max` | 470 | 1274 | key-3 hard subtasks (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-zai-glm-53.md` | STRONG | `zai-coding-plan/glm-5.3` | 702 | 1275 | zai hard reasoning (`:3-4`) |
| `~/.kimi-code/agents/secondary/sec-strong-hyper-qwen-max.md` | STRONG | `hyper/qwen3.8-max` | 759 | 1276 | hyper strong reasoning (`:3-4`) |

Bucket counts: FAST 7, MIDDLE 5, STRONG 6 = 18 (OBSERVATION). Lane ids are
`sec-<bucket>-<lane>-<model>`; the `<lane>` token is `zai`, `hyper`, `tp1`,
`tp2`, `tp3` (OBSERVATION from the basenames).

## `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md`

FAST bucket; pinned model `zai-coding-plan/glm-5.3-flash`; cfg-model `~/.kimi-code/config.toml:631`, cfg-reg `~/.kimi-code/config.toml:1259`. Pool default — explore/review/summary (`~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-fast-zai-flash-low.md`

FAST bucket; pinned model `zai-coding-plan/glm-5.3-flash-low`; cfg-model `~/.kimi-code/config.toml:641`, cfg-reg `~/.kimi-code/config.toml:1260`. LOW effort — grep-and-report/mechanical (`~/.kimi-code/agents/secondary/sec-fast-zai-flash-low.md:3-4`); the effort pin is the `overrides.default_effort = "low"` sub-table (see `### Effort-pinned mutants`).

## `~/.kimi-code/agents/secondary/sec-fast-hyper-glm-flash.md`

FAST bucket; pinned model `hyper/glm-5.3-flash`; cfg-model `~/.kimi-code/config.toml:741`, cfg-reg `~/.kimi-code/config.toml:1261`. Provider diversity off zai/token-plan (`~/.kimi-code/agents/secondary/sec-fast-hyper-glm-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-fast-hyper-ds-flash.md`

FAST bucket; pinned model `hyper/deepseek-v4.1-flash`; cfg-model `~/.kimi-code/config.toml:778`, cfg-reg `~/.kimi-code/config.toml:1262`. Non-GLM fast lane; token-plan saturated (`~/.kimi-code/agents/secondary/sec-fast-hyper-ds-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-fast-tp1-ds-flash.md`

FAST bucket; pinned model `alibaba-token-plan/deepseek-v4.1-flash`; cfg-model `~/.kimi-code/config.toml:129`, cfg-reg `~/.kimi-code/config.toml:1263`. Primary token-plan fast lane (`~/.kimi-code/agents/secondary/sec-fast-tp1-ds-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-fast-tp2-ds-flash.md`

FAST bucket; pinned model `alibaba-token-plan-2/deepseek-v4.1-flash`; cfg-model `~/.kimi-code/config.toml:309`, cfg-reg `~/.kimi-code/config.toml:1264`. Key-2 overflow (`~/.kimi-code/agents/secondary/sec-fast-tp2-ds-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-fast-tp3-ds-flash.md`

FAST bucket; pinned model `alibaba-token-plan-3/deepseek-v4.1-flash`; cfg-model `~/.kimi-code/config.toml:489`, cfg-reg `~/.kimi-code/config.toml:1265`. Key-3 overflow (`~/.kimi-code/agents/secondary/sec-fast-tp3-ds-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-mid-tp1-qwen-flash.md`

MIDDLE bucket; pinned model `alibaba-token-plan/qwen3.8-flash`; cfg-model `~/.kimi-code/config.toml:186`, cfg-reg `~/.kimi-code/config.toml:1266`. Default coder delegate (`~/.kimi-code/agents/secondary/sec-mid-tp1-qwen-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-mid-tp2-qwen-flash.md`

MIDDLE bucket; pinned model `alibaba-token-plan-2/qwen3.8-flash`; cfg-model `~/.kimi-code/config.toml:366`, cfg-reg `~/.kimi-code/config.toml:1267`. Key-2 coder (`~/.kimi-code/agents/secondary/sec-mid-tp2-qwen-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-mid-tp3-qwen-flash.md`

MIDDLE bucket; pinned model `alibaba-token-plan-3/qwen3.8-flash`; cfg-model `~/.kimi-code/config.toml:546`, cfg-reg `~/.kimi-code/config.toml:1268`. Key-3 coder (`~/.kimi-code/agents/secondary/sec-mid-tp3-qwen-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-mid-zai-glm-5-turbo.md`

MIDDLE bucket; pinned model `zai-coding-plan/glm-5-turbo`; cfg-model `~/.kimi-code/config.toml:693`, cfg-reg `~/.kimi-code/config.toml:1269`. zai coder, 200k context (`~/.kimi-code/agents/secondary/sec-mid-zai-glm-5-turbo.md:3,7`).

## `~/.kimi-code/agents/secondary/sec-mid-hyper-qwen-flash.md`

MIDDLE bucket; pinned model `hyper/qwen3.8-flash`; cfg-model `~/.kimi-code/config.toml:849`, cfg-reg `~/.kimi-code/config.toml:1270`. Hyper coder (`~/.kimi-code/agents/secondary/sec-mid-hyper-qwen-flash.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max.md`

STRONG bucket; pinned model `alibaba-token-plan/qwen3.8-max`; cfg-model `~/.kimi-code/config.toml:97`, cfg-reg `~/.kimi-code/config.toml:1271`. Plan/hard subtasks (`~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max-xhigh.md`

STRONG bucket; pinned model `alibaba-token-plan/qwen3.8-max-xhigh`; cfg-model `~/.kimi-code/config.toml:107`, cfg-reg `~/.kimi-code/config.toml:1272`. XHIGH effort — the single hardest subtask (`~/.kimi-code/agents/secondary/sec-strong-tp1-qwen-max-xhigh.md:3-4`); the effort pin is the `overrides.default_effort = "xhigh"` sub-table (see `### Effort-pinned mutants`).

## `~/.kimi-code/agents/secondary/sec-strong-tp2-qwen-max.md`

STRONG bucket; pinned model `alibaba-token-plan-2/qwen3.8-max`; cfg-model `~/.kimi-code/config.toml:290`, cfg-reg `~/.kimi-code/config.toml:1273`. Key-2 hard subtasks (`~/.kimi-code/agents/secondary/sec-strong-tp2-qwen-max.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-strong-tp3-qwen-max.md`

STRONG bucket; pinned model `alibaba-token-plan-3/qwen3.8-max`; cfg-model `~/.kimi-code/config.toml:470`, cfg-reg `~/.kimi-code/config.toml:1274`. Key-3 hard subtasks (`~/.kimi-code/agents/secondary/sec-strong-tp3-qwen-max.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-strong-zai-glm-53.md`

STRONG bucket; pinned model `zai-coding-plan/glm-5.3`; cfg-model `~/.kimi-code/config.toml:702`, cfg-reg `~/.kimi-code/config.toml:1275`. zai hard reasoning (`~/.kimi-code/agents/secondary/sec-strong-zai-glm-53.md:3-4`).

## `~/.kimi-code/agents/secondary/sec-strong-hyper-qwen-max.md`

STRONG bucket; pinned model `hyper/qwen3.8-max`; cfg-model `~/.kimi-code/config.toml:759`, cfg-reg `~/.kimi-code/config.toml:1276`. Hyper strong reasoning (`~/.kimi-code/agents/secondary/sec-strong-hyper-qwen-max.md:3-4`).

## Cross-reference: lanes ↔ `~/.kimi-code/config.toml`

**Both sides agree.** The `[models.*]` id referenced by each lane's pin string
exists in config (18/18 present — matrix `cfg-model` column), and the same 18 ids
sit in the `[secondary_model.models]` registry table (`~/.kimi-code/config.toml:1258-1277`).
The registry is the dispatcher's lookup: each row is `"<provider>/<model>" =
"<bucket + role>"`, and the description mirrors the lane file's `description`
near-verbatim — e.g. `~/.kimi-code/config.toml:1263`
`"alibaba-token-plan/deepseek-v4.1-flash" = "FAST bucket, token-plan key 1. Cheap generalist for exploration, review, summaries."`

The mapping is a clean **1:1**: 18 lane files ↔ 18 registry rows ↔ 18 `[models.*]`
blocks (OBSERVATION; every row and block was opened). `[secondary_model]`
(`~/.kimi-code/config.toml:1255-1256`) adds a `default_model = "opencode-go/deepseek-v4.1-flash"`
— and `~/.kimi-code/config.toml:1277` carries a 19th registry row for that same id with an
**empty** description string and **no** corresponding lane file (OBSERVATION).
So the registry has 19 rows: 18 lane-backed + 1 default-only. INFERENCE: the
default secondary model is a registry entry with no dedicated agent persona, so
it is selectable but has no bucket-specific rules.

Spot-checks that lane prose matches config metadata (OBSERVATION, both sides read):

- `~/.kimi-code/agents/secondary/sec-mid-zai-glm-5-turbo.md:7` says "200k context"; `~/.kimi-code/config.toml:696`
  `max_context_size = 200000`.
- `~/.kimi-code/agents/secondary/sec-fast-zai-flash.md:7` says "vision+video capable"; `~/.kimi-code/config.toml:636`
  `capabilities = [ "image_in", "video_in", "always_thinking", "tool_use" ]`.
- FAST/MIDDLE token-plan lanes say "1M context"; `~/.kimi-code/config.toml:132`, `:189`,
  `:312`, `:369`, `:492`, `:549` all `max_context_size = 1000000`.
- Family prose says "1M context" for hyper lanes; the two hyper ids are
  `1048576` (`~/.kimi-code/config.toml:744` glm-5.3-flash, `:781` deepseek-v4.1-flash) —
  round-number shorthand, no conflict.
- The `-xhigh` / `-low` wrapper ids share the base model but differ in
  `display_name` and `overrides.default_effort` (`~/.kimi-code/config.toml:113` "Qwen3.8 Max
  (xhigh)"; `:647` "GLM-5.3-Flash (low)").

## Cross-domain routing (report, do not absorb)

- **Endpoints → kama.** `[providers.*]` base URLs drive every lane's transport:
  `~/.kimi-code/config.toml:15` token-plan `…maas.aliyuncs.com/compatible-mode/v1`, `:30` zai
  `https://api.z.ai/api/coding/paas/v4`, `:35` hyper
  `https://hyper.charm.land/v1`. Provider/endpoint mapping is kama's surface.
- **Credentials → kagi.** Each provider block carries an inline `api_key`
  (`~/.kimi-code/config.toml:17`, `:22`, `:27`, `:32`, `:37`) — i.e. token-plan keys 1/2/3 are
  three distinct secrets behind three distinct lane families. Not reproduced here;
  credential shape/rotation is kagi's surface.
- **Model quality → kengaku.** Which bucket/model actually performs better is
  not measured by this note (it documents *definitions*, not outcomes).

## Unknowns

- UNKNOWN — I did not read any harness code that *consumes*
  `[secondary_model.models]` or the `agents/secondary/*.md` files, so the exact
  load/resolution order (file vs registry precedence) is unverified. The 1:1
  agreement makes the question moot for the current 18, but a divergence path is
  unproven.
- UNKNOWN — whether all 18 lanes are reachable right now (quota/health) is not
  tested here; only the static definitions and their config-backed ids.
- No blockers: all 18 assigned files were readable; no absent/unreadable surface.
## Errata (round-19 audit A2, 2026-10-13, append-only)

- **`default_model` paragraph (L115-120): drift, not transcription.**
  The note recorded `opencode-go/deepseek-v4.1-flash` at
  `~/.kimi-code/config.toml:1256`
  per the 17:00:05 snapshot; the live file at 18:15:19 reads
  `hyper/deepseek-v4.1-flash` (A2 first read this as a note error because no
  `.bak` carries opencode-go as default — but the 17:00 state was never a
  `.bak`; the note's own snapshot evidence stands). The dependent inference
  "the default secondary has no persona" is **refuted**: the current
  default id IS lane-backed (`~/.kimi-code/agents/secondary/sec-fast-hyper-ds-flash.md`,
  `~/.kimi-code/config.toml:778`, registry `:1262`).

Round-40 source note (S012, re-opened 2026-10-22): the Kimi Code CLI docs, Agents and
Sub-Agents (https://moonshotai.github.io/kimi-code/en/customization/agents.html, § Agent
Locations), state the agent-file precedence: "more specific scopes take higher priority:
Explicit (--agent-file) > Project > Extra > User > Plugin > Built-in", and that each directory
is scanned recursively for `.md` files. This answers the `## Unknowns` load-order question
above at the documentation level only; the order was not measured on this host.
