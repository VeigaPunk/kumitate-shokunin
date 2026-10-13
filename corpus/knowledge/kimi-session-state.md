# K3 — Kimi Code session & runtime state plane

## Scope — nine members, one plane

This note covers the **session & state plane** of Kimi Code CLI home
(`~/.kimi-code/`), one section per member — the nine of the K3 registry row:
(1) `~/.kimi-code/sessions/` the worktree-keyed session store,
(2) `~/.kimi-code/session_index.jsonl`, (3) `~/.kimi-code/workspace-trust/`,
(4) `~/.kimi-code/telemetry/`, (5) `~/.kimi-code/logs/kimi-code.log`, and the four
remainder stores (6) `~/.kimi-code/file-history/`, (7) `~/.kimi-code/user-history/`,
(8) `~/.kimi-code/cache/`, (9) `~/.kimi-code/search-index/`. Every claim below
carries a live anchor measured on this host
(2026-10-13, `kimi-code` 2.1.1 per `~/.kimi-code/telemetry/failed_b3487d768efe.jsonl:1`).

**Boundary (READ-ONLY substrate):** nothing under `~/.kimi-code` was written by this
lane. `~/.kimi-code/credentials/` (dir, mode 700, 70 B dsize), `~/.kimi-code/oauth/`
(60 B) and `~/.kimi-code/server.token` (43 B, mode 600) are **shape-only** — mode,
size and mtime only, never opened; no byte of them appears in this note.
`~/.kimi-code/config.toml` / `~/.kimi-code/tui.toml` are other lanes' surfaces and are cited here only where
they gate this plane's behaviour.

**Internals level here means:** one named section per member, each with its own
path anchors, plus the on-disk schema read from the records themselves. The
source-side constants were verified by scanning the shipped binary
(`~/.kimi-code/bin/kimi`, 190 778 560 B, ELF x86-64 with debug_info, not stripped —
`file` output), quoted with **byte offsets** because a 190 MB executable has no
meaningful line numbers; grep against it is treated as text (`grep -a`) and the
offset is the honest anchor.

## Measurement transcript

```
$ ls -A sessions | wc -l                 # 7 wd_* + .index-cache + .index-dirty
9
$ for d in sessions/wd_*; do ls -d $d/session_* | wc -l; done
26 4 3 1 1 1 1                           # = 37 session dirs total
$ ls -d sessions/wd_vgpnk_403b91ce3657/* | wc -l
26                                       # the assigned 26 items → 26 session dirs
$ wc -l session_index.jsonl
37
$ find sessions -type f | wc -l ; find sessions -type d | wc -l ; du -sh sessions
710 516 137M
$ find sessions -name kimi-code.log | wc -l      # one per session dir
37
$ wc -l logs/kimi-code.log
69
```

## `~/.kimi-code/sessions/` — the worktree-keyed session store

### 1. Worktree key naming — `wd_<slug>_<hash12>`, proven from both ends

OBSERVATION (source side). The binary's `workdir_slug` module (byte 125574022)
freezes the shape:

```
/* bin/kimi @125574022 */ MAX_WORKDIR_SLUG_LENGTH = 40; WORKDIR_KEY_PREFIX = "wd_";
HASH_LENGTH = 12; WIN_SHAPED = /^(?:[A-Za-z]:[\\/]|\\\\|\/\/)/;
```

OBSERVATION (data side). For all **9 / 9** entries of
`~/.kimi-code/workspaces.json:1` (single line, 1559 B, 0 newlines), the 12-hex
suffix equals `sha256(root)[:12]` and the slug equals `basename(root)`:

| `workspaces.json` key | `root` | `name` | sha256(root)[:12] |
|---|---|---|---|
| `wd_vgpnk_403b91ce3657` | `/home/vgpnk` | `vgpnk` | `403b91ce3657` ✓ |
| `wd_projects_48a771e908b1` | `/home/vgpnk/Projects` | `Projects` | `48a771e908b1` ✓ |
| `wd_shokunin_8c4a99c6228c` | `/home/vgpnk/Projects/shokunin` | `shokunin` | `8c4a99c6228c` ✓ |
| `wd_ompskills_b6327a98bd2f` | `/home/vgpnk/Projects/ompskills` | `ompskills` | `b6327a98bd2f` ✓ |
| `wd_prymeagnt_d75727ad1dd2` | `/home/vgpnk/Projects/prymeagnt` | `prymeagnt` | `d75727ad1dd2` ✓ |
| `wd_dbzmon_25f4897e97c0` | `/home/vgpnk/Projects/gamez/dbzmon` | `dbzmon` | `25f4897e97c0` ✓ |
| `wd_kimi-m4-test_9f2b5d6d6efa` | `/tmp/kimi-m4-test` | `kimi-m4-test` | `9f2b5d6d6efa` ✓ |
| `wd_tog_ca71a1751506` | `/tmp/tog-tower-integration/Projects/tog` | `tog` | `ca71a1751506` ✓ |
| `wd_default_5577ae501b6d` | `/home/vgpnk/.zcode/workspace/default` | `default` | `5577ae501b6d` ✓ |

INFERENCE. Because the slug is capped at 40 chars but all nine slugs are shorter
than that, the cap is not exercised on this host — a root whose basename exceeds 40
chars is UNKNOWN here (truncation vs hashing-of-slug was not measurable).

`workspaces.json:1` schema: `{"version":1,"workspaces":{<key>:{root,name,created_at,
last_opened_at}},"deleted_workspace_ids":[]}` — written under
`WORKSPACE_CATALOG_VERSION = 1` / `WORKSPACE_CATALOG_KEY = "workspaces.json"` with a
150 ms `WATCH_DEBOUNCE_MS` (bin/kimi byte 134080338).

### 2. Naming scheme vs directory contents — the catalog is a superset

OBSERVATION. `workspaces.json:1` has **9** workspaces, `sessions/` has **7** `wd_*`
dirs. Present in the catalog but absent on disk: `wd_kimi-m4-test_9f2b5d6d6efa` and
`wd_dbzmon_25f4897e97c0` — both never-opened-since-creation workspaces whose
`last_opened_at` equals their `created_at` for `kimi-m4-test`
(`2026-10-06T19:54:50.470Z` / `.500Z`) and near-equal for `dbzmon`
(`2026-10-13T06:15:49.947Z` / `06:16:01.625Z`). `dbzmon` nevertheless has a trust
record and a user-history file (below). INFERENCE: `sessions/<wd_*>` is created on
first *session*, not on workspace registration, so the catalog is the authority for
workspace identity and the directory tree only for history.

The two non-`wd_` entries under `sessions/` are internal, and their exclusion is
explicit in the binary: listing session ids filters
`entry !== ".index-dirty" && entry !== ".index-cache"` (byte 128014767).

### 3. What one session directory contains — `wd_vgpnk_403b91ce3657`, 26 items

OBSERVATION. All 26 items in the assigned directory are session directories named
`session_<uuid>`; the oldest is `session_a02ce39f-…` (Oct 3 18:01), the newest
`session_3eb03621-…` (Oct 11 10:41). Layout, read from
`…/session_a02ce39f-3f9a-4b45-ba82-d30e4b6927ab/`:

| Entry | Kind | Evidence |
|---|---|---|
| `state.json` | session metadata, 592 B | `state.json:1` |
| `agents/<name>/` | one dir per agent: `main`, `agent-0`…`agent-N` | 7 agents in `…/wd_shokunin_8c4a99c6228c/session_6cc6b9da-…/state.json:1` |
| `agents/<name>/wire.jsonl` | append-only event log | `…/session_fde3c8ab-…/agents/main/wire.jsonl:1` |
| `agents/<name>/tasks/<id>.json` | task record (`bash-*` / `agent-*`) | `…/session_fde3c8ab-…/agents/main/tasks/bash-xlgkpsbx.json:1` |
| `agents/<name>/tasks/<id>/output.log` | raw task stdout | same dir |
| `agents/<name>/file-history/<sha256>@vN` | file-content snapshot blob | `~/.kimi-code/file-history/` below |
| `logs/kimi-code.log` | per-session log | `…/session_6cc6b9da-…/logs/kimi-code.log:1` |
| `notify/state.json` | notification toggle, 16–17 B | `{"enabled":false}` (`…/session_a02ce39f-…`), `{"enabled":true}` (`…/session_6cc6b9da-…`) |

Census over the whole tree (`find sessions -type f`, 710 files): `wire.jsonl` **161**,
`tasks/*/output.log` **117**, `state.json` **74** (= 37 session + 37 notify — exactly
one of each per session), `logs/kimi-code.log` **37**, `tasks/*.json` **133** (83
`bash-*`, 50 `agent-*`), `*-tool_*.txt` tool-result spill **5**, `@vN` file-history
blobs **177**. `wire.jsonl` sizes: min 89 040 B, median 320 081 B, max 7 176 866 B,
sum 89 011 394 B.

`state.json:1` schema (OBSERVATION, both samples read):
`{id, version:2, cwd, createdAt, updatedAt, archived:false, agents:{<name>:{homedir,
type:"main"}}, custom:{}, lastPrompt, title, titleKind:"replaceable",
isCustomTitle:false}`. The binary's summary projection adds two fields not present
in either on-disk sample: `archivedAt` and `lastTurnReason` (byte 128013887, inside
`summaryMatchesChildOf(summary, parentId)` — so summaries also carry session
lineage).

### 4. `wire.jsonl` — the wire protocol, `protocol_version` 1.5

OBSERVATION. `…/agents/main/wire.jsonl:1` is
`{"type":"metadata","protocol_version":"1.5","created_at":1791061685360}` — the
file's own schema version. Line 2 binds the runtime:

```
…/agents/main/wire.jsonl:2
{"type":"runtime.set_binding","workspaceId":"wd_vgpnk_403b91ce3657",
 "runtimeId":"local","agentId":"main","time":1791061685362}
```

Across all 161 files (56 472 records) the type census is dominated by context
plumbing: `context.append_loop_event` 27 524, `agent.message.appended` 10 014,
`llm.request` 4 106, `usage.record` 4 010, `token_counting.measured` 4 005,
`context.append_message` 2 241, then turn lifecycle (`agent.turn.started` 364,
`turn.prompt` 349, `turn.ended` 338), `goal.update` 276, `file_history.tracked` 227,
`runtime.set_binding` / `profile.bind` / `metadata` 161 each, `subagent.spawned` 131,
`task.started` 108, `cron.cursor` 27, `swarm_mode.enter` 25, `tower_mode.enter` 12,
`full_compaction.begin` 3. Records are per-agent, not per-session: `agentId` appears
45 158 times, `time` 56 311, and every line is one JSON object.

Representative records, with line anchors, show what the plane persists:

```
…/agents/main/wire.jsonl:4   {"type":"permission.set_mode",…}
…/agents/main/wire.jsonl:9   {"type":"turn.prompt","agentId":"main","input":[{"type":"text","text":"User activated the skill \"write-goal\"…"}]}
…/agents/main/wire.jsonl:14  {"type":"context.append_loop_event",…}
…/agents/main/wire.jsonl:16  {"type":"llm.request","agentId":"main","kind":"loop","provider":"openai",
   "model":"kimi-for-coding","modelAlias":"kimi-code/kimi-for-coding","thinkingEffort":"max",
   "thinkingKeep":"all","maxTokens":1048576,"systemPromptHash":"a0bf7eea…","toolsHash":"5e56c220…",
   "messageCount":4,"turnStep":"0.1","time":1791061954956}
…/agents/main/wire.jsonl:17  {"type":"usage.record","agentId":"main","model":"kimi-code/kimi-for-coding",
   "usage":{"inputOther":22563,"output":2539,"inputCacheRead":768,"inputCacheCreation":0},
   "usageScope":"turn","time":1791061986825}
```

OBSERVATION. `llm.request` carries *hashes* of the system prompt and tool schema
(`systemPromptHash`, `toolsHash`) rather than their bodies, and `turn.prompt` carried
the full prompt text — so the wire log is a prompt-and-usage ledger, not a
credential store; no `Authorization`-shaped value appeared in any record inspected.
`usage.record` is the token-accounting unit (`usageScope:"turn"`), i.e. the same
`inputOther` / `output` / `inputCacheRead` / `inputCacheCreation` decomposition the
cost lanes consume.

### 5. `.index-cache/scan.json` and `.index-dirty/` — the reconciler's two side files

OBSERVATION. `sessions/.index-cache/scan.json` (20 746 B, Oct 13 17:04) is
`{"version":1,"sessions":{<sessionId>:{ws, meta:"state.json", mtimeMs, size,
summary:{id, workspaceId, cwd, createdAt, updatedAt, archived, custom,
lastTurnReason}}}}` with **36** entries — one fewer than the 37 session dirs.
Source constants (bin/kimi byte 128016713):
`META_SCOPE="session-meta"`, `META_KEY$1="state.json"`,
`SESSION_INDEX_SCAN_CACHE_DIR=".index-cache"`, `SCAN_CACHE_KEY="scan.json"`,
`SCAN_CACHE_VERSION=1`; the dirty journal is `SESSION_INDEX_DIRTY_DIR=".index-dirty"`
(byte 128010439), one marker file per session, named
`session_<uuid>.<epochms>`.

OBSERVATION (time-sensitive, both readings real): at 17:28 `sessions/.index-dirty/`
held **6** markers, all for `session_6cc6b9da-…` — the session that was live at the
time; on re-read minutes later the directory was **empty** and the entries consumed.
INFERENCE: `.index-dirty` is a transient write-ahead queue, not a store; a snapshot
of it is meaningless without its timestamp, and any lane reading `scan.json` should
expect it to lag the newest session by exactly the in-flight one. This is the
`generation=1` reconciliation visible in the global log
(`logs/kimi-code.log:50`, `:53`).

## `~/.kimi-code/session_index.jsonl` — 37 lines, exactly three fields

OBSERVATION. `~/.kimi-code/session_index.jsonl` (7588 B) = **37 lines**, and a
key-census over every line returns exactly `{sessionId, sessionDir, workDir}` —
nothing else (`:1`–`:3` read verbatim):

```
:1 {"sessionId":"session_a02ce39f-3f9a-4b45-ba82-d30e4b6927ab","sessionDir":"/home/vgpnk/.kimi-code/sessions/wd_vgpnk_403b91ce3657/session_a02ce39f-3f9a-4b45-ba82-d30e4b6927ab","workDir":"/home/vgpnk"}
:2 {"sessionId":"session_fde3c8ab-baae-48a2-be1e-163898516af1","sessionDir":"…/session_fde3c8ab-…","workDir":"/home/vgpnk"}
:3 {"sessionId":"session_337298b4-9bbc-4285-b82c-cc863fb77f11","sessionDir":"…","workDir":"/home/vgpnk"}
```

The write site is the authority for that shape (bin/kimi byte 129612877):

```
this.appendLogStore.append("", "session_index.jsonl", { sessionId, sessionDir, workDir })
```

**Cardinality check (the probe a non-author re-runs):** the index has one line per
session *directory* — 26 / 4 / 3 / 1 / 1 / 1 / 1 by worktree = 37, matching the 37
`session_*` dirs exactly. Partition of `:1-37` by `sessionDir` component 5:
`wd_vgpnk_403b91ce3657` 26, `wd_ompskills_b6327a98bd2f` 4,
`wd_projects_48a771e908b1` 3, `wd_tog_ca71a1751506` / `wd_default_5577ae501b6d` /
`wd_prymeagnt_d75727ad1dd2` / `wd_shokunin_8c4a99c6228c` 1 each. No timestamp field
exists in the index: `workDir` is the only adjacency to a workspace, and the
`wd_*` key is not stored — it is recoverable only from `sessionDir` or from
`workspaces.json`.

## `~/.kimi-code/workspace-trust/` — 6 files, not directories

OBSERVATION. `workspace-trust/` contains **6 plain files** (mode 600, 48–70 B each),
one per trusted worktree key, including `wd_dbzmon_25f4897e97c0` which has no
session directory. Schema is a two-field object — `root` + `trustedAt` epoch-ms:

```
workspace-trust/wd_vgpnk_403b91ce3657:1  {"root":"/home/vgpnk","trustedAt":1791060815062}
workspace-trust/wd_dbzmon_25f4897e97c0:1 {"root":"/home/vgpnk/Projects/gamez/dbzmon","trustedAt":1791872150995}
workspace-trust/wd_shokunin_8c4a99c6228c:1 {"root":"/home/vgpnk/Projects/shokunin","trustedAt":1791921880394}
workspace-trust/wd_projects_48a771e908b1:1 {"root":"/home/vgpnk/Projects","trustedAt":1791795616002}
workspace-trust/wd_prymeagnt_d75727ad1dd2:1 {"root":"/home/vgpnk/Projects/prymeagnt","trustedAt":1791747476634}
```

(The sixth is `wd_ompskills_b6327a98bd2f`, 67 B.) Source: `TRUST_SCOPE =
"workspace-trust"`, inside `…/src/workspace/workspaceTrust/…` with an
`init_trustRecord` esm (bin/kimi byte 127767879).

INFERENCE. Trust is keyed by the same `wd_` scheme, so trust and identity share one
key function; the record stores a timestamp but no fingerprint of the directory
contents, so trust survives a directory being replaced at the same path.
Note the asymmetry worth a follow-up: `dbzmon` is trusted with zero sessions,
`vgpnk` is both trusted and session-bearing, and `kimi-m4-test` / `tog` / `default`
have neither a trust file nor a session dir.

## `~/.kimi-code/telemetry/` — `failed_*.jsonl`, crash-only, one line total

OBSERVATION. `telemetry/` holds exactly **one** file: `failed_b3487d768efe.jsonl`,
551 B, mode 600, mtime 2026-10-10 13:01:53 -0300, `wc -l` = **1**. Field names come
from the single record (device/session identifiers redacted by shape):

```
telemetry/failed_b3487d768efe.jsonl:1
{"event_id":"<32-hex>","device_id":"<uuid>","session_id":"session_<uuid>",
 "event":"crash","timestamp":1791648113.887,
 "properties":{"error_type":"Error","where":"shutdown","source":"uncaughtException"},
 "context":{"app_name":"kimi-code-cli","version":"2.1.1","runtime":"node",
  "platform":"linux","arch":"x64","node_version":"24.15.0","os_version":"7.1.4-arch1-1",
  "ci":true,"locale":"en_US.UTF-8","terminal":"tmux","ui_mode":"print",
  "model":"kimi-code/kimi-for-coding"}}
```

Redaction pass: the only long token-shaped substrings in the file are
`device_id` (UUID) and `session_id` (`session_<uuid>`); `event_id` is 32 hex. No
bearer/secret-shaped value is present. The file's own name is built from the same
constants the binary freezes (byte 129679620): `TELEMETRY_SCOPE = "telemetry"`,
`FAILED_PREFIX = "failed_"`, `JSONL_SUFFIX = ".jsonl"` — and `USER_ID_PREFIX$1 =
"kfc_device_id_"`.

**BLOCKER (assignment says "2-3 sample lines" — only 1 exists).** This host has never
produced a second failed event, so the record *schema* below is verified from one
line, and field optionality / variant shapes are UNKNOWN. The event class observed
is `event:"crash"` with `properties.where:"shutdown"` and
`properties.source:"uncaughtException"` — a **shutdown-time uncaught exception**, i.e.
a crash while the process was already tearing down. The 8-hex filename suffix
`b3487d768efe` matched neither `md5(device_id)[:12]` (`e151d7850cf2`) nor the
workspace key of the session it names; UNKNOWN what it hashes.

## `~/.kimi-code/logs/kimi-code.log` — 69 lines, numbered rotation, never fired

OBSERVATION. Size **7882 B**, **69 lines**, mode 644, mtime 2026-10-13 17:04:40 -0300;
first line `logs/kimi-code.log:1` `2026-10-03T20:53:35.073Z INFO  minidb query-store
opening  dir=… shardCount=16`, last line `:69`
`2026-10-13T20:04:40.431Z INFO  minidb query-store opening  dir=… shardCount=16`.
Line format is `ISO8601-UTC LEVEL  event  key=value…`; all 69 lines are `INFO` —
no `WARN`/`ERROR` on this host. Event tally over the whole file:
`minidb query-store opening` 48, `session index reconciliation repaired drift` 8
(at `:16`, `:25`, `:27`, `:36`, `:39`, `:45`, `:50`, `:53`),
`oauth status: got token` 5 and `oauth status: enter` 5 (all
`provider=managed:kimi-code`, `hasToken=true` — presence flag only; first pair at
`:58`–`:59`), `session index generation published` 1, `global search: worker started`
1, `global search: index opened` 1. Last 20 lines' shape is uniform:
minidb/query-store opens interleaved with `session index reconciliation repaired
drift  generation=1 sessions=36 upserted=1 removed=0` (`:50`, `:53` — 8 h apart,
both on Oct 13) and the `oauth status` pair (`:58`–`:67`).

OBSERVATION (rotation mechanics, from the shipped writer). `RotatingFileWriter` in
`…/src/_base/log/fileLog.ts` (byte ~127943940) rotates **by size, with numbered
suffixes and no compression** — the trigger is
`if (this.currentBytes >= this.options.maxBytes) await this.rotate();`, and
`rotate()` shifts `path.{i} → path.{i+1}` for `i = files-2 … 1`, renames `path →
path.1`, then unlinks `path.{files}`; `statSize()` and a `dropped`-entry notice
(`… dropped N entries …`) are the two failure paths.

OBSERVATION. The rotation has **never fired on this host**: no `*.log.1`,
`*.log.2`, `*.log.gz` or `*.gz` exists anywhere under `~/.kimi-code` (`find . -name
'*.log.*' -o -name '*.gz'` → empty). INFERENCE: `options.maxBytes` and `options.files`
are injected at construction and no default constant for them was found in the
scanned region, so the threshold is UNKNOWN; the largest log on this host is a
per-session log at 226 999 B, still under any plausible cap.

OBSERVATION (log topology — three names, one of them not present here). The binary
freezes (byte 134042659) `SESSION_LOG_REL$1 = "logs/kimi-code.log"` (per session),
`GLOBAL_LOG_REL$1 = "logs/global/kimi-code.log"`, `WEB_LOG_REL =
"logs/kimi-web.jsonl"`, `DESKTOP_LOG_REL = "logs/kimi-desktop.log"`. On disk the
per-session copy exists 37 / 37 and the *global* log sits at
`~/.kimi-code/logs/kimi-code.log` — there is **no** `~/.kimi-code/logs/global/`
directory. INFERENCE: the running build writes the global stream at the legacy path
(or the constant is a newer, unreleased layout) — a version-drift smell, not a
failure, but worth one line in a follow-up.

Two streams are genuinely distinct: the global log carries index/reconciler/oauth/
search lifecycle, the per-session log carries per-turn model traffic
(`…/session_6cc6b9da-…/logs/kimi-code.log:1` = `llm config  turnStep=0.1
provider=openai model=kimi-for-coding modelAlias=kimi-code/kimi-for-coding
thinkingEffort=high systemPromptChars=14549 toolCount=31`, then `llm request
turnStep=0.1`). mtime is local (-0300), content is UTC — the 17:04 mtime and the
20:04Z final line are the same instant.

## `~/.kimi-code/file-history/` — two tiers: per-worktree indexes + content blobs

OBSERVATION, measured 2026-10-13. *Directory (20 K), two tiers.* Tier 1: five per-worktree
index files `file-history/wd_*` (94–174 B) of shape
`{"sessions":[{"id":"session_…","touchedAt":1791062511913},…]}` — `wd_vgpnk_403b91ce3657:1`
lists 17 sessions, `wd_ompskills_b6327a98bd2f` 2, `wd_shokunin_8c4a99c6228c` 1.
Tier 2: the content blobs, **177** of them, not in this directory but inside the
sessions as `sessions/<wd>/<session>/agents/<agent>/file-history/<sha256>@vN`
(binary constant `FILE_HISTORY_BLOB_PREFIX = "file-history"`, byte 127951659).
**Blob key verified two-sided:** `…/agents/main/wire.jsonl:72` records
`{"type":"file_history.tracked","agentId":"main","turnId":0,
"path":".config/jj/config.toml","entry":{"key":"file-history/860417ddd64768058a82458dafff79f69297732f3099d1b704b1743fe5232891@v1",
"version":1,"contentHash":"ae449060…","size":123}}`, and
`sha256(".config/jj/config.toml")` reproduces `860417ddd64768058a82458daf…`
exactly; the blob at that key holds the file's bytes verbatim (the `@v2` blob for
`.kimi-code/skills/godspeed/SKILL.md`, key `7fa50f1d…`, reads back as UTF-8 with
the `name: godspeed` front matter intact). So a blob key = sha256 of the **path
relative to the workspace root** and `@vN` = content version, with `contentHash`
the hash of the recorded content.

## `~/.kimi-code/user-history/` — six `.jsonl` input-line files, keyed by workspace

OBSERVATION, measured 2026-10-13. *Directory (36 K), six `.jsonl` files, 3–173 lines.* Name =
`md5(workspace_root) + ".jsonl"`; verified for 6 of 9 roots (e.g.
`/home/vgpnk` → `9a41b9f95b2be05d95d04c0b96cc6350.jsonl` 173 lines; `…/shokunin` →
`2f0010a6ea94c1305e889c40a50970cc.jsonl` 9 lines). Missing for `kimi-m4-test`,
`tog`, `default` — the same three workspaces with no sessions. Schema is one field:
`{"content":"…"}` per line (`:173` of the vgpnk file = `{"content":"/remote-control"}`;
`2f0010a6…:9` = `{"content":"resume"}`) — a raw input-line history that mixes prose
and slash commands, keyed by workspace rather than by session. Binary constant:
`KIMI_CODE_INPUT_HISTORY_DIR_NAME = "user-history"` (byte 136064803).

## `~/.kimi-code/cache/` — two subsystems: the minidb query-store + client-config fetch caches

OBSERVATION, measured 2026-10-13. *Directory (1.1 M + 8 K), two subsystems.* `cache/query-store/` is a
minidb instance: `cluster.meta.json:1-7` = `{"version":1,"shardCount":16,
"createdAt":"2026-10-03T20:53:35.074Z","valueCodec":"json","fsyncPolicy":"everysec"}`
plus `cluster.indexes.json` and `shard-00…` dirs each with `db.indexes.json` +
`db.wal` — the 16 shards the global log announces on every open. `cache/client-configs/`
holds two percent-encoded server-config caches
(`global%3A%2Fclient_configs%3Arecommended_effort.json`, 65 B, `config:{}`;
`…%3Aestimated_cache_duration.json`, 516 B, `{"version":1,"fetchedAt":…,"config":{"k3":
{"min_tokens_to_hint":200000,"cache_duration":1800},…}}`) — **this is where a
client-side cache-policy hint lands**, and it is a fetch cache, not a credential
store.

## `~/.kimi-code/search-index/` — five files; the WAL is the live content

OBSERVATION, measured 2026-10-13. *Directory (2.0 M), five files.* `db.wal` 2 074 715 B,
`db.textindexes.json` 88 B = `[{"name":"body","fields":["text"]},{"name":"tri",
"fields":["text"],"tokenizer":"ngram"}]` (two indexes: whole-body and trigram),
`db.text-body.postings` and `db.text-tri.postings` **0 B**, and `db.lock` 87 B =
`{"pid":270701,"ts":1791918187478,"token":"<pid>:<uuid>"}` (lock token shown by
shape). INFERENCE: the two empty postings files against a 2 MB WAL mean index
content is not yet checkpointed into postings files, so the WAL is the live
content; the lock names a pid and a fencing token, i.e. a single-writer lease.
The binary names this store from the server side: *"full-text search lives in the
kap-server search-index database"* (byte 134738601).

## Unknowns and blockers

| # | Item | Status |
|---|---|---|
| 1 | Telemetry record variants | **BLOCKER** — only 1 record on this host; schema read from one line, field optionality UNKNOWN |
| 2 | `failed_<8hex>` filename hash input | UNKNOWN — matched neither `md5(device_id)` nor the named session |
| 3 | Log rotation threshold | UNKNOWN — `RotatingFileWriter` takes `options.maxBytes`/`options.files` injected; no default found, never fired here (no `.1` file) |
| 4 | Global-log path drift | OBSERVED mismatch: constant says `logs/global/kimi-code.log`, disk has `logs/kimi-code.log`, no `logs/global/` dir |
| 5 | Slug truncation at 40 chars | UNKNOWN — no workspace root with >40-char basename exists on this host |
| 6 | `.index-cache/scan.json` freshness | OBSERVED lag of exactly 1 (36 vs 37); time-sensitive, see §5 |
| 7 | Session retention / archival / deletion | UNKNOWN — no prune/retention/olderThan constant found in the scanned region; `deleted_workspace_ids` is `[]` and `archived:false` throughout, so no deletion has occurred on this host |

## Registry row and cross-domain routing

**Member count for this note: 9** — `sessions/`, `session_index.jsonl`,
`workspace-trust/`, `telemetry/`, `logs/kimi-code.log`, and the four remainder
stores (`file-history/`, `user-history/`, `cache/`, `search-index/`). Every one has
its own named section above with its own path anchors, so the K3 row reads `yes` on
the strength of 9 sections.

**Re-run probe for a non-author:** `ls -d ~/.kimi-code/sessions/wd_*/session_* | wc -l`
must equal `wc -l ~/.kimi-code/session_index.jsonl` (both are 37 here), and
`ls -1 ~/.kimi-code/sessions | grep -c '^wd_'` must equal the number of
`workspaces.json` keys that own ≥1 session dir (7 of 9 here).

**Route elsewhere, do not absorb:**

- *credentials → kagi.* `logs/kimi-code.log` contains 5 × `oauth status: got token
  provider=managed:kimi-code hasToken=true` (`:59`, `:61`, `:63`, `:65`, `:67`);
  this is a
  boolean presence flag only, but it is the live signal of managed-OAuth state and
  belongs to the credential plane, not here. `server.token`/`oauth/`/`credentials/`
  were deliberately not read.
- *model quality → kengaku.* `wire.jsonl` `usage.record` records and the per-session
  `llm config` lines (`systemPromptChars=14549 toolCount=31`,
  `thinkingEffort=high|max`) are the raw material for model/effort comparisons; the
  session plane only stores them.
- *endpoints → kama.* `cache/client-configs/*estimated_cache_duration.json` exposes a
  server-supplied `config.k3.{min_tokens_to_hint,cache_duration}` shape, and
  `services.moonshot_search.base_url = "https://api.kimi.ai/coding/v1/search"` is
  referenced from `config.toml:1216` — both are endpoint/contract facts.
- *orchestration consumers (this province, other lanes).* The session plane carries
  the state that the orchestration surfaces read: `swarm_mode.enter/exit` (25/6),
  `tower_mode.enter/exit` (12/5), `cron.add/delete/cursor` (4/4/27), `goal.create/
  clear/update` (7/3/276), `permission.set_mode` (168),
  `turn.steer`/`prompt.steered` (54/57), `full_compaction.begin/complete` (3/3) — all
  counted from the 161 `wire.jsonl` files, and all keyed `agentId` + `time`, with no
  session-level rollup file anywhere.
## Errata (round-19 audit A3, 2026-10-13, append-only)

- **"slug = basename(root)" is REFUTED as stated — it omits
  case-folding.** `/home/vgpnk/Projects` keys to `wd_projects_…`, not
  `wd_Projects_…`; the binary shows the normalization
  (`…normalized.toLowerCase() : normalized`, strings-grade @~125573900).
  Correct rule: `slug = basename(root).toLowerCase()` (40-char floor).
- **The `wd_<slug>_<sha12>` derivation is upgraded from strings-only to
  measured-corroborated**: A3 recomputed 9/9 catalog keys independently from
  `workspaces.json` roots (`sha256(root)[:12]`) and all matched their dir
  names. The binary-constants claim itself remains strings-grade.

## Errata (round-21 verification, 2026-10-13, append-only)

- **`session_index.jsonl` "37 lines" → 38 (live drift).** The 38th line
  (`session_6369bb3e-…` in `wd_shokunin_8c4a99c6228c`, dir mtime 20:25)
  postdates the note's measurement; the three-field schema holds exactly
  (38/38 lines, `{sessionDir, sessionId, workDir}` only) and index ↔ disk
  agree (`comm -3` clean, 38 = 38). The knock-on cardinality text ("wd_shokunin 1",
  the ":202 — 37 lines" header) is snapshot-stale the same way.
- **`file-history/` tier-1 size range "(94–174 B)" was wrong at write time:**
  `wd_vgpnk_403b91ce3657` reads 1374 B with an Oct 10 mtime, predating the
  Oct 13 measurement. Range corrected to **94–1374 B** (6 index files,
  modes unchanged).
- **Observed drift, no action:** `logs/kimi-code.log` grew 69 → 70 lines
  (7882 → 8000 B, mtime 20:25); tier-2 blob count 177 → 215 same-day. Both
  are live-substrate growth on timestamped snapshot claims, the class this
  note's measurement-transcript header already declares.
