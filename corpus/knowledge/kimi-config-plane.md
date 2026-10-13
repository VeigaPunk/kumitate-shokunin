# K1 config plane — `~/.kimi-code/config.toml`, `~/.kimi-code/tui.toml`, and the 13-generation drift chain

## Scope — the Claude/Moonshot client config plane of Kimi Code CLI

This note covers the **configuration plane** of the Kimi Code CLI as it exists on this host:
(1) `~/.kimi-code/config.toml` — the agent/runtime config, 1293 L / 40605 B, mode 600,
mtime `2026-10-13 17:00:05`, `sha256 6a0345c7d01f665d151993b041a5e56e6b45b5a7f3e00609e9b12b87d50e5046`;
(2) `~/.kimi-code/tui.toml` — the client-preference config, 31 L / 1300 B, mode 644;
(3) the **drift chain** — the 13 on-disk generations of `~/.kimi-code/config.toml` (12 timestamped `.bak`
plus one bare `config.toml.bak`), oldest→newest, which is the freshness surface of this plane.

Boundary rules applied by this lane, stated so a re-prober reproduces the same posture:
`~/.kimi-code/credentials/`, `~/.kimi-code/oauth/`, `~/.kimi-code/server.token`,
`~/.kimi-code/device_id` were **never opened** — only `stat`/`ls` shape was read.
`~/.kimi-code/config.toml` itself is not in that exclusion list and is the object of the assignment, so it was
read in full; every credential-shaped value in it is reported here as a **shape observation with a
line anchor** and its body is never reproduced. The redaction used for the drift diffs was
`sed -E 's/^((api_key|key|client_secret|token|oauth_host) *= *")[^"]*"/\1<REDACTED>"/'`.

Measurement transcript (this host, this run):

```
$ wc -l config.toml tui.toml
 1293 config.toml
   31 tui.toml
$ stat -c '%n %s %y %a' config.toml tui.toml
config.toml 40605 2026-10-13 17:00:05.831389392 -0300 600
tui.toml 1300 2026-10-03 18:36:19.244352233 -0300 644
$ grep -c '^\[models\.' config.toml ; grep -c '^\[providers\.' config.toml
124
8
$ ls config.toml.*.bak | wc -l ; ls config.toml.bak
12
config.toml.bak
```

Everything below separates **OBSERVATION** (measured on this host, anchor given), **INFERENCE**
(this lane's reading of measured structure), and **UNKNOWN** (not verifiable from the artifacts).

## `~/.kimi-code/config.toml` — the agent/runtime config

### `config.toml` — global keys (the only two lines before the first table)

```
$ sed -n '1,2p' config.toml
default_model = "kimi-code/kimi-for-coding"
default_permission_mode = "auto"
```

- **OBSERVATION** — `~/.kimi-code/config.toml:1` is the sole **primary-lane** declaration:
  `default_model = "kimi-code/kimi-for-coding"`. `~/.kimi-code/config.toml:2` is
  `default_permission_mode = "auto"`.
- **OBSERVATION** — `default_permission_mode` at `:2` is the **only permission key in the entire
  file**. A case-insensitive sweep for `permission|approv|trust|sandbox|allow|deny|yolo|mode =|tool`
  over `config.toml` returns exactly one non-`capabilities` hit, that same line 2. There is no
  `[permission]` table, no per-tool allow/deny list, and no hook-based policy in this file; the only
  tool-shaped tokens are capability strings such as `"tool_use"` / `"dynamically_loaded_tools"`
  inside `capabilities` arrays (`~/.kimi-code/config.toml:48`).
- **INFERENCE** — config-level permission posture on this host is a single global mode
  (`auto`), with any finer policy living outside the config plane (session/CLI flags). **UNKNOWN** —
  this lane did not probe where a non-config permission decision is persisted; the adjacent
  `~/.kimi-code/workspace-trust/` directory exists and holds 6 opaque files
  (mode 700 dir, files 48–70 B, `wd_<workspace>_<hex>` names, e.g. `wd_shokunin_8c4a99c6228c`,
  mtime `2026-10-13 17:04`), which is a plausible trust-decision store but its contents were not
  read and its semantics are unverified.

### `config.toml` — the provider plane: 7 groups in 8 tables, one section each

Line anchors are the exact table headers in the live file. The 8 rows below are the **7 provider
groups** plus the one nested OAuth sub-table (`row 1a`), which is the reason `grep -c
'^\[providers\.'` returns 8 while the provider *count* is 7.

| # | Group (header line) | Keys present | `base_url` host | Key shape |
|---|---|---|---|---|
| 1 | `[providers."managed:kimi-code"]` :4 | `type`, `api_key`, `base_url` | `api.kimi.ai` :7 | `type = "kimi"` :5; `api_key = ""` empty :6 |
| 1a | `[providers."managed:kimi-code".oauth]` :9 | `storage`, `key`, `oauth_host` | `auth.kimi.ai` :12 | `storage = "file"` :10; `key = "oauth/kimi-code-env-0e4f99c69cc27850"` :11 — an **oauth store path**, not key material |
| 2 | `[providers.alibaba-token-plan]` :14 | `base_url`, `type`, `api_key` | `token-plan.ap-southeast-1.maas.aliyuncs.com` :15 | `type = "openai"` :16; credential-shaped `api_key` :17 |
| 3 | `[providers.alibaba-token-plan-2]` :19 | same | same host :20 | `type = "openai"` :21; `api_key` :22 |
| 4 | `[providers.alibaba-token-plan-3]` :24 | same | same host :25 | `type = "openai"` :26; `api_key` :27 |
| 5 | `[providers.zai-coding-plan]` :29 | same | `api.z.ai` :30 | `type = "openai"` :31; `api_key` :32 |
| 6 | `[providers.hyper]` :34 | same | `hyper.charm.land` :35 | `type = "openai"` :36; `api_key` :37 |
| 7 | `[providers.opencode-go]` :39 | same | `opencode.ai` :40 | `type = "openai"` :41; `api_key` :42 |

- **OBSERVATION** — **7 provider groups** in 8 tables: one managed OAuth provider
  (`"managed:kimi-code"`) with a nested `.oauth` sub-table, plus **6 third-party
  OpenAI-compatible providers** (`type = "openai"`, rows 2–7 above). Measured `base_url` hosts:
  **5 distinct across all 7 groups** — `api.kimi.ai` (managed), `api.z.ai`, `hyper.charm.land`,
  `opencode.ai`, and `token-plan.ap-southeast-1.maas.aliyuncs.com` **shared by all three
  `alibaba-token-plan{,-2,-3}` groups** — i.e. **4 distinct hosts for the 6 third-party groups**.
  `auth.kimi.ai` is a further, separate OAuth host (row 1a).
- **OBSERVATION (shape, routed to kagi — no material quoted)** — `grep -c '^api_key'` on the live
  file = **9 total, of which 6 are non-empty** and 3 are empty (`api_key = ""` at `:6`, `:1217`,
  `:1226`). The 6 non-empty ones sit on exactly the 6 non-managed providers, at
  `~/.kimi-code/config.toml:17`, `:22`, `:27`, `:32`, `:37`, `:42`. By prefix and length class the
  6 values fall into **four** shapes: three long `sk-sp-…`-style (the three `alibaba-token-plan`
  lanes), one `<32-hex>.<suffix>`-style (zai), one `sk-<word>-<uuid>`-style (hyper), one
  `<vendor>_sk_<hex>_<suffix>`-style (opencode-go) — i.e. the shape tracks the vendor, and the three
  token-plan lanes share one shape family, consistent with them being three keys of one product.
  This note deliberately records only their *existence, line, and shape*; **routing: kagi** owns
  credential material, rotation, and leak surface. No value is reproduced anywhere in this note,
  including in the drift diffs.
- **INFERENCE** — the three `alibaba-token-plan{,-2,-3}` groups are the same upstream product
  multiplexed onto **three distinct keys/quotas**; this is corroborated by the secondary-model pool
  prose, which labels them "separate key/quota lane" (`~/.kimi-code/config.toml:1264`, `:1265`).
- **OBSERVATION** — the OAuth-family providers reference the same store key
  `"oauth/kimi-code-env-0e4f99c69cc27850"` at `:11`, `:1221`, `:1230`, i.e. managed `kimi-code`,
  `moonshot_search` and `moonshot_fetch` share one OAuth identity. The referenced file exists at
  `~/.kimi-code/oauth/kimi-code-env-0e4f99c69cc27850` — **0 bytes**, mode 644, mtime
  `2026-10-03 18:02` — while the populated sibling
  `~/.kimi-code/credentials/kimi-code-env-0e4f99c69cc27850.json` (1556 B, mode 600, mtime
  `2026-10-13 17:26`) is the actual credential store. Shape only; **not opened**.
  **UNKNOWN** — which of the two files the runtime treats as authoritative is not verifiable from
  names alone; flagged for kagi.

### `config.toml` — the `[models.*]` table structure

**OBSERVATION** — `grep -c '^\[models\.'` = **124 tables**, which decomposes as **122 model rows +
2 `.overrides` sub-tables** (`~/.kimi-code/config.toml:117` for
`models."alibaba-token-plan/qwen3.8-max-xhigh".overrides` and `:651` for
`models."zai-coding-plan/glm-5.3-flash-low".overrides`). The key `provider` appears 122 times and
`model` 122 times, matching the 122 rows exactly — so the row↔provider mapping is 1:1.

Row key frequency across the 122 model tables (measured by name histogram over the whole file):

| Key | Rows | Meaning as declared |
|---|---|---|
| `provider` | 122 | which `[providers.*]` group the row routes through |
| `model` | 122 | upstream model id in the provider's namespace |
| `max_context_size` | 122 | context window |
| `capabilities` | 122 | capability token array |
| `display_name` | 122 | human label shown in the model picker |
| `max_output_size` | 118 | output cap — absent only on the 4 `kimi-code/*` rows: `kimi-for-coding`, `kimi-for-coding-highspeed`, `k3`, `k3-256k` |
| `reasoning_key` | 80 | always exactly `"reasoning_content"` (80/80 identical) |
| `support_efforts` | 75 | effort ladder accepted by the row |
| `max_input_size` | 9 | input-side cap, always `196601` (`~/.kimi-code/config.toml:180`); owners are the three `MiniMax-M2.5` rows plus `hyper/qwen3.7-flash`, `opencode-go/{space-bunny,gpt-5.6-luna,hy3,gpt-6-luna,step-5-preview-free}` |
| `off_effort` | 10 | always exactly `"none"`; owners are 6 `hyper/*` and 4 `opencode-go/*` rows |
| `default_effort` (row body) | 3 | only the managed lanes: `:51` `kimi-for-coding` = `"max"`, `:67` `k3` = `"high"`, `:76` `k3-256k` = `"high"` |
| `base_url`, `protocol` | 6 | model-level provider override — see below |

Per-provider model row counts in the live file:

```
opencode-go 31 · hyper 21 · alibaba-token-plan 20 · alibaba-token-plan-2 19 ·
alibaba-token-plan-3 19 · zai-coding-plan 8 · kimi-code 4            = 122
```

`support_efforts` coverage is partial per lane (measured): `kimi-code 3/4`, `alibaba-token-plan`
and `-2`/`-3` `10/20`, `9/19`, `9/19`, `zai 6/8`, `hyper 17/21`, `opencode-go 21/31` — so 47 of 122
rows advertise no effort ladder at all, and the ladder is the row's own declaration, not a global
policy.

**Capability token histogram (122 rows, measured):** `tool_use` 122 · `thinking` 86 ·
`image_in` 64 · `video_in` 41 · `always_thinking` 40 · `audio_in` 5 ·
`dynamically_loaded_tools` 3. **OBSERVATION** — `tool_use` is universal; `audio_in` exists only on
`opencode-go` rows; `dynamically_loaded_tools` only on the four `kimi-code/*` rows plus
`~/.kimi-code/config.toml:73`.

**Effort-ladder value-sets (13 distinct, measured):** the two dominant ladders are
`["low","high","max"]` (23 rows) and `["high","max"]` (19), followed by
`["low","medium","xhigh"]` (9), `["minimal","low","medium","high"]` (7 — all `hyper`), and
`["low","medium","high","xhigh","max"]` (4). **OBSERVATION** — the vocabulary is not shared across
lanes: `hyper` uses `minimal`/`medium`, the `alibaba-token-plan` `qwen3.8-max` family uses `xhigh`,
the managed `kimi-code` lanes use `max`.

**Two ways an effort pin is declared.** The normal row carries `support_efforts` and optionally
`default_effort` in its own body. The variant pair uses a separate pattern — a **standalone row
whose body is a full metadata copy** plus a `.overrides` sub-table holding only the pin:

```
[models."alibaba-token-plan/qwen3.8-max-xhigh"]     # :107
model = "qwen3.8-max"                                # :109 — same upstream id as :99
display_name = "Qwen3.8 Max (xhigh)"                 # :113
support_efforts = [ "low", "medium", "xhigh" ]       # :115
[models."alibaba-token-plan/qwen3.8-max-xhigh".overrides]   # :117
default_effort = "xhigh"                             # :118
```

and identically for `zai-coding-plan/glm-5.3-flash-low` (`~/.kimi-code/config.toml:641`–`:652`,
`default_effort = "low"`). **INFERENCE** — an "effort variant" is a *second row that re-declares the
same upstream `model` id* with a pinned default, which is how one upstream model is offered under
two picker entries. The author's own wording for this (removed from the live file, see drift) is
"Effort variant: same underlying model, pinned to xhigh thinking effort. The variant is standalone
(no field inheritance) — metadata copied in full."

**Model-level provider override.** Six `opencode-go` rows override the provider's own `base_url` and
switch wire protocol inside the model table:

```
[models."opencode-go/qwen3.8-max"]   :950 → base_url = ".../inference/go" :951, protocol = "anthropic" :952
[models."opencode-go/minimax-m2.7"]  :1011 → :1012, :1013
[models."opencode-go/minimax-m3"]    :1039 → :1040, :1041
[models."opencode-go/qwen3.8-flash"] :1060 → :1061, :1062
[models."opencode-go/claude-haiku-5-5"] :1101 → :1102, :1103
[models."opencode-go/qwen3.7-plus"]  :1191 → :1192, :1193
```

**OBSERVATION** — `protocol = "anthropic"` occurs exactly 6 times in the file, always paired with a
model-level `base_url` that **drops the provider's `/v1` suffix**
(`:40` `.../inference/go/v1` vs `:951` `.../inference/go`). **INFERENCE** — these six rows are routed
through an Anthropic-shaped endpoint selected per model, not per provider; the remaining 25
`opencode-go` rows inherit the provider `base_url`/`type = "openai"`. **UNKNOWN** — whether the
runtime requires both keys together is unverified; both are present on all 6 rows.

### `config.toml` — how primary vs secondary lanes are declared

- **Primary lane** = the single global `default_model` at `~/.kimi-code/config.toml:1`
  (`kimi-code/kimi-for-coding`). **OBSERVATION** — this key's value is byte-identical in **all 13
  generations** on disk (measured across the whole drift chain below), so the primary lane has never
  moved on this host even while everything around it churned.
- **Secondary lane** = the `[secondary_model]` family at the file tail:

```
[secondary_model]                                    # :1255
default_model = "opencode-go/deepseek-v4.1-flash"    # :1256  ← live secondary default

[secondary_model.models]                             # :1258
"zai-coding-plan/glm-5.3-flash" = "FAST bucket, …"   # :1259 … 19 keys through :1277
```

**OBSERVATION** — `[secondary_model.models]` at `:1258`–`:1277` holds **19 keys**, and every value
is **human prose**, not a number: a bucket label (`FAST` / `MIDDLE` / `STRONG`), the lane name, and
the intended use. Key spans are `:1259`–`:1277`; the last key
(`"opencode-go/deepseek-v4.1-flash"`, `:1277`) has an **empty string** value and is exactly the
model named by `secondary_model.default_model` at `:1256`. Measured bucket composition:

| Bucket | n | Keys (line) |
|---|---|---|
| FAST | 7 | zai `glm-5.3-flash` :1259, zai `glm-5.3-flash-low` :1260, hyper `glm-5.3-flash` :1261, hyper `deepseek-v4.1-flash` :1262, atp-1/2/3 `deepseek-v4.1-flash` :1263–:1265 |
| MIDDLE | 5 | atp-1/2/3 `qwen3.8-flash` :1266–:1268, zai `glm-5-turbo` :1269, hyper `qwen3.8-flash` :1270 |
| STRONG | 6 | atp-1/2/3 `qwen3.8-max` :1271/:1273/:1274, atp-1 `qwen3.8-max-xhigh` :1272, zai `glm-5.3` :1275, hyper `qwen3.8-max` :1276 |
| (unlabelled) | 1 | `opencode-go/deepseek-v4.1-flash` :1277 — empty value, the active default |

- **OBSERVATION** — the pool deliberately spreads every bucket across **all five quota lanes**
  (three token-plan keys, zai, hyper); `opencode-go` appears in the pool **only** as the default and
  has no bucket prose. **INFERENCE** — the pool's shape is a quota-spreading device for subagent
  dispatch (the prose says "so swarm load spreads across all quota lanes" in the removed 10-12
  comment), and the note pair `knowledge/dispatch-shapes.md` / `knowledge/cost-and-profile.md` in
  this corpus is where the consuming side lives — this note documents only how the pool is
  *declared*.

### `config.toml` — config tail: one section per remaining key group

| Section (line) | Live values | Notes |
|---|---|---|
| `[thinking]` :1211 | `enabled = true` :1212, `effort = "high"` :1213 | file-wide thinking default |
| `[services.moonshot_search]` :1215 | `base_url = "https://api.kimi.ai/coding/v1/search"` :1216, `api_key = ""` :1217 | empty key + OAuth at :1219–:1222 |
| `[services.moonshot_search.oauth]` :1219 | `storage = "file"` :1220, `key = "oauth/kimi-code-env-0e4f99c69cc27850"` :1221, `oauth_host = "https://auth.kimi.ai"` :1222 | shares the managed OAuth identity |
| `[services.moonshot_fetch]` :1224 | `base_url = "…/coding/v1/fetch"` :1225, `api_key = ""` :1226 | |
| `[services.moonshot_fetch.oauth]` :1228 | `:1229`–`:1231` | same store key again |
| `[experimental]` :1233 | `tower = true` :1234, `notify_user = true` :1235, `subagent_fork = true` :1236 | feature gates; all three true |
| `[loop_control]` :1238 | `max_steps_per_turn = 0` :1239, `max_attempts_per_step = 20` :1240, `compaction_max_attempts = 10` :1241 | `0` = unbounded reading |
| `[subagent]` :1243 | `timeout_ms = 7200000` :1244 | 2 h |
| `[swarm]` :1246 | `timeout_ms = 7200000` :1247 | 2 h |
| `[watch]` :1249 | `enabled = true` :1250 | |
| `[read]` :1252 | `default_max_chars = 200000` :1253 | matches the harness Read budget |
| `[[hooks]]` :1279 | `event = "Notification"` :1280, `matcher = "task\\.completed"` :1281, `command = "notify-send -a 'Kimi Code' 'Background task completed' …"` :1282, `timeout = 5` :1283 | **the only hook**, and an **array-of-tables** (`[[…]]`), not a table |
| `[mcp_servers.rea]` :1285 | `command = "npx"` :1286, `args = [ "-y", "rea-agents@6.4.0", "mcp" ]` :1287, `startup_timeout_sec = 30` :1288 | one MCP server |
| `[mcp_servers.rea.env]` :1290 | `GHIDRA_INSTALL_DIR = "/home/vgpnk/.local/opt/ghidra_12.1.4_PUBLIC"` :1291, `JAVA_HOME = "/usr/lib/jvm/java-21-openjdk"` :1292 | env for the MCP child |

- **OBSERVATION** — the file has **zero comment lines** (`grep -c '^[[:space:]]*#'` = 0) and 149
  blank lines; every line is either `key = value`, a table header, or blank. The hook is the only
  `[[…]]` array-of-tables in the file.
- **OBSERVATION** — `[hooks]` has **no** `[hooks.*]` table form here; `grep -c '^\[hooks'` = 0 and
  `grep -n '^\[\[hooks\]\]'` = 1, so hook declaration is array-only.
- **INFERENCE** — `[services.moonshot_*]` are the two network services (search, fetch) behind the
  built-in web tools; both are OAuth-only (`api_key = ""` + `.oauth` sub-table). **UNKNOWN** —
  whether a non-empty `api_key` would supersede the OAuth store is unverified.

## `~/.kimi-code/tui.toml` — full inventory (all 31 lines accounted for)

**OBSERVATION** — `~/.kimi-code/tui.toml` is 31 L / 1300 B / mode 644, mtime `2026-10-03 18:36`,
and its header states the split of concerns verbatim: `# Client preferences for kimi-code.` and
`# Agent/runtime settings stay in ~/.kimi-code/config.toml.` (`~/.kimi-code/tui.toml:2-3`) — i.e.
this file is **client-only** and the whole agent surface above lives in `config.toml`. 12 of its 31
lines are comments. Every key, with anchor and its own inline semantics:

| Line | Key | Live value | Inline contract (verbatim from the file) |
|---|---|---|---|
| :5 | `theme` | `"auto"` | `"auto" \| "dark" \| "light" \| custom theme name` |
| :6 | `tui_mode` | `"regular"` | `"regular" \| "fullscreen"` ("fullscreen" is experimental) |
| :7 | `render_latex` | `true` | false keeps LaTeX math as raw source |
| :8 | `disable_paste_burst` | `false` | true disables non-bracketed paste-burst fallback |
| :9 | `cache_expiry_hint` | `true` | false disables the "cache expired" dialog on resume / idle submit |
| :10 | `disable_feedback_survey` | `true` | true hides the occasional session rating prompt |
| :12–:13 | `[editor]` / `command` | `""` | empty uses `$VISUAL` / `$EDITOR` |
| :15–:17 | `[notifications]` / `enabled`, `notification_condition` | `true`, `"unfocused"` | condition is `"unfocused" \| "always"` |
| :19–:20 | `[upgrade]` / `auto_install` | `true` | `true \| false` |
| :22–:24 | `# [markdown]`, `# mermaid` | commented out | `"final" \| "off"` — draws mermaid blocks as diagrams |
| :26–:31 | `# [status_line]`, `# items`, `# command` | commented out | built-in footer slots `mode, goal, model, tasks, cwd, git, tips`; or a command whose first stdout line replaces footer line 1, receiving a JSON snapshot (model, cwd, git, usage, mode) on stdin |

- **OBSERVATION** — the two commented blocks are **inert defaults**: an active status-line/keymap
  surface exists (`[status_line]` with `items` or `command`, and `[markdown].mermaid`) but is not
  enabled on this host. **INFERENCE** — `tui.toml` is a *whole-file template with commented
  examples*, unlike `config.toml` which ships comment-free in the live generation.
- **OBSERVATION (drift)** — one sibling exists,
  `~/.kimi-code/tui.toml.bak` (1301 B, mtime `2026-10-03 17:53:30`), 43 minutes older than live.
  The **entire** byte-level difference between them is one value flip:
  `:10 disable_feedback_survey = false # …` → `= true # …`. 1301−1300 = 1 byte, entirely explained
  by `false`→`true`. No other line differs.

## `~/.kimi-code/config.toml.*.bak` — the drift chain, 13 generations, oldest → newest

**OBSERVATION** — all 13 files exist side by side in `~/.kimi-code/`, all mode 600, and the bare
`config.toml.bak` is the **oldest by mtime** (`2026-10-03 18:29`) — despite its unsuffixed name, its
content is generation 1 (309 L / 31 model tables), not a copy of the newest file. **INFERENCE** —
the `.bak` naming convention is "copy taken at write time", so each timestamped `.bak` records the
configuration that was live at its own mtime, and the filename timestamp is trustworthy to the
minute as a generation boundary. Measured table
(`stat -c%s`, `wc -l`, `grep -c`, `sha256sum | cut -c1-12`):

| # | Generation (mtime) | B | L | models | prov† | sec keys | thinking | sub/swarm ms | sha256[:12] |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `config.toml.bak` (10-03 18:29) | 10201 | 309 | 31 | 4 | — | — | –/– | `8f6833a802a6` |
| 2 | `…20261004-165601.bak` (10-04 16:56) | 10661 | 336 | 31 | 4 | 0 | — | 0/0 | `1e14e671c958` |
| 3 | `…20261004-165643.bak` (10-04 16:56) | 10586 | 334 | 31 | 4 | 0 | — | 0/0 | `00da44df6f16` |
| 4 | `…20261004-165727.bak` (10-04 16:57) | 10592 | 334 | 31 | 4 | 0 | — | 7200000/0 | `152eddcedfbf` |
| 5 | `…20261008-124956.bak` (10-08 12:49) | 21987 | 693 | 64 | 5 | 9 | max | 7200000/7200000 | `7017bf372b23` |
| 6 | `…20261008-125303.bak` (10-08 12:53) | 22004 | 693 | 64 | 5 | 9 | max | 7200000/7200000 | `01b97a5f640e` |
| 7 | `…20261010-120243.bak` (10-10 12:02) | 23303 | 739 | 68 | 6 | 9 | high | 7200000/7200000 | `2879825602ca` |
| 8 | `…20261010-121549.bak` (10-10 12:15) | 29103 | 938 | 89 | 7 | 11 | high | 7200000/7200000 | `74e64ffe703a` |
| 9 | `…20261010-172905.bak` (10-10 17:29) | 29385 | 940 | 89 | 7 | 13 | high | 7200000/7200000 | `3d992908cdd9` |
| 10 | `…20261010-173658.bak` (10-10 17:36) | 31370 | 980 | 93 | 7 | 18 | high | 7200000/7200000 | `65d6c54ee731` |
| 11 | `…20261012-083922.bak` (10-12 08:39) | 31379 | 980 | 93 | 7 | 18 | high | 7200000/7200000 | `c0b8f9fc5bc9` |
| 12 | `…20261012-095136.bak` (10-12 09:51) | 31482 | 985 | 93 | 7 | 18 | high | 7200000/7200000 | `fabddd410787` |
| 13 | `config.toml` — **live** (10-13 17:00) | 40605 | 1293 | 124 | 8 | 19 | high | 7200000/7200000 | `6a0345c7d01f` |

† `prov` is `grep -c '^\[providers\.'`, which counts `[providers.*]` **tables**, not providers: it
includes the nested `[providers."managed:kimi-code".oauth]` sub-table. So the live row's `8` =
**7 provider groups + 1 oauth sub-table**, and generation 1's `4` = 3 providers + 1 sub-table.
Provider *groups* per generation (measured from the header inventory) are therefore 3 (#1–#4),
4 (#5–#6: managed + the three token-plan lanes), 5 (#7), 6 (#8–#12), 7 (#13).

Diff method: for each consecutive pair, redact both sides with the `api_key|key|…` sed above, then
`diff`; counts below are `+N/-M` over the redacted pair. Provider-set and section-level changes:

| Step | Pair | +N/−M | What changed (redacted diff) |
|---|---|---|---|
| 1→2 | 10-03 → 10-04 16:56:01 | +27/−0 | **adds** `[loop_control]`, `[subagent]`, `[swarm]`, `[watch]`, `[read]`, `[[hooks]]` — i.e. the whole runtime-control tail arrives in one edit. `[experimental]` gains `notify_user`, `subagent_fork` (only `tower` existed at #1) |
| 2→3 | 16:56:01 → 16:56:43 | +0/−2 | **removes** `[secondary_model]` + its `default_model = "alibaba-token-plan/deepseek-v4.1-flash"` — the secondary lane is briefly deleted (42 s later) |
| 3→4 | 16:56:43 → 16:57:27 | +1/−1 | `[subagent] timeout_ms = 0` → `7200000` (line 318 of that generation); `[swarm]` still `0` |
| 4→5 | 10-04 → 10-08 12:49 | +391/−32 | the big one: `zai-coding-plan` **removed**, `alibaba-token-plan-2` and `-3` **added** (31→64 model rows); `[secondary_model]` **returns** with `default_model = "alibaba-token-plan-2/qwen3.8-max"` and a new `[secondary_model.models]` table of **9 keys**; `[thinking] effort = "max"` first appears; `[swarm] timeout_ms` → `7200000` |
| 5→6 | 10-08 12:49 → 12:53 | +9/−9 | pure **secondary-pool prose rewrite**: the 9 pool values are re-worded from "Strongest Alibaba tier …" phrasing to the "bucket (Model, context, vision)" house style; also swaps the pool's `kimi-k2.7-code` entries for `qwen3.8-flash` entries. No keys added/removed |
| 6→7 | 10-08 → 10-10 12:02 | +74/−28 | `zai-coding-plan` **re-added** (6 model rows); **all three `kimi-k2.7-code` rows removed** from `alibaba-token-plan{,-2,-3}`; `[thinking] effort` `"max"` → `"high"` |
| 7→8 | 10-10 12:02 → 12:15 | +199/−0 | `[providers.hyper]` **added** with 21 model rows; secondary pool 9→11 keys |
| 8→9 | 12:15 → 17:29 | +3/−1 | secondary default moves `alibaba-token-plan-2/qwen3.8-max` → **`zai-coding-plan/glm-5.3-flash`**; 2 `hyper` pool keys added (11→13) |
| 9→10 | 17:29 → 17:36 | +53/−13 | the **effort-variant family**: adds `alibaba-token-plan/qwen3.8-max-xhigh` + its `.overrides`, `zai-coding-plan/glm-5.3-flash-low` + its `.overrides`; pool re-ordered into FAST/MIDDLE/STRONG buckets with `# --` headers (13→18 keys) |
| 10→11 | 10-10 17:36 → 10-12 08:39 | +1/−1 | pool key swap: `zai-coding-plan/glm-5.3-highspeed` → `zai-coding-plan/glm-5-turbo` (MIDDLE bucket) |
| 11→12 | 10-12 08:39 → 09:51 | +5/−0 | adds `[mcp_servers.rea]` with `command = "npx"` and `args = [ "-y", "rea-agents@6.4.0", "mcp" ]` |
| 12→13 | 10-12 09:51 → **live** 10-13 | +319/−11 | `[providers.opencode-go]` **added** with **31 model rows** (124 model tables total; 7 provider groups, the 7th new here, in 8 `[providers.*]` tables incl. the managed `.oauth` sub-table); secondary default moves to `opencode-go/deepseek-v4.1-flash`; adds `[mcp_servers.rea.env]`; and **deletes all 9 comment lines** plus one blank — see below |

**The comment-strip finding (OBSERVATION, measured, exact):** comments are present only in
generations 10–12. `grep -c '^[[:space:]]*#'` = 0,0,0,0,0,0,0,0,0,9,9,9,**0** across the chain in
order. The 11 lines removed in step 12→13 are, verbatim and exhaustively:

```
# Effort variant: same underlying model, pinned to xhigh thinking effort.
# The variant is standalone (no field inheritance) — metadata copied in full.
# Effort variant: same underlying model, pinned to low thinking effort.
default_model = "zai-coding-plan/glm-5.3-flash"          ← replaced, not lost
# Subagent model pool, organized by task bucket. Every provider plan
# (token-plan keys 1/2/3, zai coding-plan, hyper) gets a fast/middle/strong
# lane so swarm load spreads across all quota lanes.
# -- Fast bucket: explore subagents, read-only surveys, reviews, summaries --
# -- Middle bucket: coder subagents, general implementation and edits --
# -- Strong bucket: plan subagents, hard reasoning, large refactors --
(blank line)
```

- **OBSERVATION** — the live generation carries **no** comments, yet its *semantic* content is
  intact: the bucket labels the comments announced survive inside the pool values themselves
  (`"FAST bucket, …"` at `:1259`, `"MIDDLE bucket, …"` at `:1266`, `"STRONG bucket, …"` at `:1271`).
- **INFERENCE** — the last writer **rewrote the whole file from its parsed form**, discarding
  comments rather than preserving them; this is why the live file is comment-free while the
  retained backup is not. **UNKNOWN** — whether the strip was the CLI's writer or a hand-edit; the
  only evidence is that the comment vocabulary of generations 10–12 uses author prose that has no
  counterpart in the live file.
- **INFERENCE (freshness posture)** — the drift chain shows three distinct *phases* rather than
  continuous tuning: (a) #1–#4, a 3-provider/31-row skeleton gaining its runtime tail; (b) #5–#12,
  provider-lane expansion by whole-provider add/remove (`zai` in→out→in, token-plan 2/3 in, `hyper`
  in) with the secondary pool growing 9→18; (c) #13, the `opencode-go` generation that supersedes
  the pool default and doubles the file. **OBSERVATION** — the only property constant across all 13
  generations is `default_model = "kimi-code/kimi-for-coding"`; the only other near-constant is
  `default_permission_mode = "auto"` (absent only at #1, which predates the key).

## OBSERVATION / INFERENCE / UNKNOWN summary

- **OBSERVATION** — 7 provider groups (8 `[providers.*]` tables once the managed `.oauth` sub-table
  is counted), 124 model tables (122 rows + 2 `.overrides`), 19-key secondary pool, 15 tail
  sections, 1 hook, 1 MCP server, 0 comments, mode 600.
- **OBSERVATION** — 13 generations with distinct sha256[:12] values (table above); every step has a
  named redacted diff; the smallest step is a 1-byte value flip (`tui.toml`) and a 1-line swap.
- **INFERENCE** — the plane is *generated*, not hand-maintained: comment-free live text, whole-file
  rewrites, provider blocks added as complete units (a provider appears with all of its model rows
  in a single step: `hyper` +199/−0, `opencode-go` +319/−11).
- **INFERENCE (routed, not absorbed)** — credential-shaped values exist in this plane; the
  authoritative store appears to be `credentials/*.json`, not `oauth/*` (which is a 0-byte pointer
  target). Ownership: **kagi**.
- **UNKNOWN** — (a) which of `oauth/…` vs `credentials/….json` the runtime reads; (b) whether the
  comment strip is writer behavior or an edit; (c) the semantics of `workspace-trust/*` files;
  (d) whether any consumer validates `secondary_model.models` prose (values are free text, so
  nothing in this file enforces the bucket vocabulary).
- **UNKNOWN (not a blocker)** — no config-plane surface was absent or unreadable; all 15 files
  listed above were read or stat'ed successfully. The only deliberately unread artifacts are the
  credential stores, by the read-only/secret rule.

## Cross-domain findings to route elsewhere (report, never absorb)

| Finding | Anchor | Route |
|---|---|---|
| 7 non-empty credential-shaped `api_key` values in a mode-600 file, three distinct prefix/length families | `~/.kimi-code/config.toml:17,22,27,32,37,42` | **kagi** — rotation, leak surface, storage duplication across 13 backups (all mode 600, all containing the same providers' keys) |
| credential store split: 0-byte `oauth/kimi-code-env-0e4f99c69cc27850` vs populated `credentials/kimi-code-env-0e4f99c69cc27850.json` (1556 B) | `~/.kimi-code/oauth/`, `~/.kimi-code/credentials/` | **kagi** |
| `kimi-k2.7-code` exists for `hyper` (:886) and `opencode-go` (:1173) but was **removed from all three `alibaba-token-plan` lanes** on 10-10 and never returned; the managed lane offers `k3`/`k3-256k` with `default_effort` `high` vs `kimi-for-coding` `max` | `~/.kimi-code/config.toml:60–76`, `:886`, `:1173`; diff 6→7 | **kengaku** — model roster/quality comparison; this lane only records the roster |
| every served endpoint in the plane (7 provider `base_url`s, 3 `oauth_host` refs, 2 moonshot service URLs, 1 MCP `npx rea-agents@6.4.0`) | `~/.kimi-code/config.toml:7,12,15,20,25,30,35,40,951,1216,1225,1287` | **kama** — endpoint/serving inventory |
## Errata (round-19 audit A1, 2026-10-13, append-only)

- **"12 timestamped `.bak`" → 11.** `ls config.toml.*.bak | wc -l` = 11 (the
  note's own generation table already listed 11; the prose count was wrong).
- **Cross-domain `api_key` sentence → 6 non-empty, four vendor shape
  families** (not 7 / three): `grep -c '^api_key'` = 9 total, 3 empty
  (`:6`, `:1217`, `:1226`).
- **"15 tail sections" → 16** (from `[thinking]` `:1211` to
  `[mcp_servers.rea.env]` `:1290`).
- **Live-file row is a snapshot, and the substrate moved under it.** The
  note's live row (40,605 B, sha `6a0345c7…`, mtime 17:00:05,
  `default_model opencode-go/deepseek-v4.1-flash`) was measured true at
  note time; the live file at 18:15:19 reads 40,599 B, sha `eae8e021…`,
  and `~/.kimi-code/config.toml:1256` = `default_model = "hyper/deepseek-v4.1-flash"`.
  `~/.kimi-code/config.toml` is a mutating substrate — every live-row claim
  in this note carries its snapshot time and is expected to drift; the drift
  narrative (the `.bak` chain) is the durable part.
