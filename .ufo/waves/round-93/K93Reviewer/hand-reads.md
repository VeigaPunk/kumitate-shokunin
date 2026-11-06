# K93Reviewer hand reads — candidate-independent (round 93, C1 seat-route v2)

Method: own scan of `~/.omp/agent/sessions` (grep prefilter on supersededBy / upstreamProvider /
"role":"fallback" / "stopReason":"aborted", then full JSONL parse of candidates in scratch).
Expected records derived from plan.md `Frozen field definitions (v2)` text only — jq extracts the
ingredients in file order; assembly written from the plan wording (script: scratch handread.py,
NOT oracle93.py). Transcripts cited by path + sha256; no transcript bytes copied into the lane.

## H1 — SUP-1 supersededBy x3, served final
- path: `/home/vgpnk/.omp/agent/sessions/-OpenBot-Agents-agent-591d5b09-ca59-46d5-a0b5-4240c865f21b/2026-10-29T23-42-20-464Z_01a18a0b-0530-70fe-afd5-9a0f100b7e63.jsonl`
- sha256: `b140f5406b2b417bf0dd09440d8b73916d6244570a468f36336ec33025d1f6e8`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["anthropic/claude-opus-5-5"], "captured": "anthropic/claude-opus-5-5", "chain": null, "error_attempts": 3, "fallback": false, "final": "served", "flag_hops": 3, "last_error": "Couldn't connect to 127.0.0.1:1234 (connection refused). Check that the server is running and reachable.", "parse_errors": 0, "recovered_attempts": 3, "resolved": null, "revert_hops": 0, "seat": "2026-10-29T23-42-20-464Z_01a18a0b-0530-70fe-afd5-9a0f100b7e63", "superseded_by": ["anthropic/claude-opus-5-5"], "upstream": [], "yielded": false}
```

## H2 — SUP-2 supersededBy x4 + 4 fallback-flag hops
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-omarchy-usage-tray/2026-10-31T20-11-17-672Z_01a19396-8528-7613-9e2d-9b1f10936855/AmrDocs.jsonl`
- sha256: `36cdd7875be30093bb97bb64711a07e0ba20785bd045915b028e1249d10f1b74`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["anthropic/claude-opus-5-5", "openai-codex/gpt-6.1-sol"], "captured": "anthropic/claude-opus-5-5", "chain": ["google-antigravity/claude-opus-5-5"], "error_attempts": 4, "fallback": true, "final": "served", "flag_hops": 4, "last_error": "429 {\"type\":\"error\",\"error\":{\"type\":\"rate_limit_error\",\"message\":\"This request would exceed your account's rate limit. P", "parse_errors": 0, "recovered_attempts": 4, "resolved": "anthropic/claude-opus-5-5", "revert_hops": 0, "seat": "AmrDocs", "superseded_by": ["openai-codex/gpt-6.1-sol"], "upstream": [], "yielded": false}
```

## H3 — UP-1 upstreamProvider x37 served turns
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-11-03T17-37-19-922Z_01a1a27c-a432-71e1-944b-0900e4e7a66b/ExecBaseBattery.jsonl`
- sha256: `9db523fd0764860974a67c3505d57660467d9d09ea8f148b6491a79e0c071412`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["commandcode/stealth/crouton-alpha"], "captured": "commandcode/stealth/crouton-alpha", "chain": ["devin/swe-2-flash:high", "openai-codex/gpt-6.1-sol:medium", "devin/swe-2-flash:high"], "error_attempts": 0, "fallback": false, "final": "served", "flag_hops": 0, "last_error": null, "parse_errors": 0, "recovered_attempts": 0, "resolved": "commandcode/stealth/crouton-alpha", "revert_hops": 0, "seat": "ExecBaseBattery", "superseded_by": [], "upstream": ["Stealth"], "yielded": true}
```

## H4 — UP-2 upstreamProvider x16 served turns
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-11-03T17-37-19-922Z_01a1a27c-a432-71e1-944b-0900e4e7a66b/ExecBattery-8.jsonl`
- sha256: `80539e1570f868bdbb465a3211c50339a1047c90deccbcf8b6716f154f8a00d7`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["commandcode/stealth/crouton-alpha"], "captured": "commandcode/stealth/crouton-alpha", "chain": ["devin/swe-2-flash:high", "openai-codex/gpt-6.1-sol:medium", "devin/swe-2-flash:high"], "error_attempts": 0, "fallback": false, "final": "served", "flag_hops": 0, "last_error": null, "parse_errors": 0, "recovered_attempts": 0, "resolved": "commandcode/stealth/crouton-alpha", "revert_hops": 0, "seat": "ExecBattery-8", "superseded_by": [], "upstream": ["Stealth"], "yielded": true}
```

## H5 — FB-1 revert_hops=2 (unflagged fallback role)
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-27T03-03-17-731Z_01a17b4f-ebe3-74c7-b154-6de929023b00/M2Replay-2.jsonl`
- sha256: `145d4cf8f125ee17bb2ebc96c1498706d80215235494952fa9d9209c28c234d4`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["zai/glm-5.3-flash", "openai-codex/gpt-6-luna"], "captured": "zai/glm-5.3-flash", "chain": ["devin/glm-5-3-flash-1m", "devin/swe-2:max", "openai-codex/gpt-6-luna:low"], "error_attempts": 3, "fallback": true, "final": "served", "flag_hops": 3, "last_error": "429 Rate limit reached for requests", "parse_errors": 0, "recovered_attempts": 3, "resolved": "zai/glm-5.3-flash:max", "revert_hops": 2, "seat": "M2Replay-2", "superseded_by": ["openai-codex/gpt-6-luna"], "upstream": [], "yielded": true}
```

## H6 — FB-2 revert_hops=3 + supersededBy x4
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-11-03T17-37-19-922Z_01a1a27c-a432-71e1-944b-0900e4e7a66b/RevengerR92.jsonl`
- sha256: `1a3c94e46bfef8f8f25b269a5d51660e6dd6c8cf6988714c7a298b578a3e90bc`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["zai/glm-5.3-flash", "anthropic/claude-haiku-5-5"], "captured": "zai/glm-5.3-flash", "chain": ["anthropic/claude-haiku-5-5:high"], "error_attempts": 4, "fallback": true, "final": "served", "flag_hops": 4, "last_error": "429 Rate limit reached for requests (type=1302)", "parse_errors": 0, "recovered_attempts": 4, "resolved": "zai/glm-5.3-flash:max", "revert_hops": 3, "seat": "RevengerR92", "superseded_by": ["anthropic/claude-haiku-5-5"], "upstream": [], "yielded": true}
```

## H7 — DEAD-1 final=dead (6 error turns, 4 recovered)
- path: `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-835d-7667-b875-b75970c45a2a/L1Chousa48/L1Chousa48.Attack04.jsonl`
- sha256: `359be063c98d06270a62cf131ed40b299e1ba2c6a94c9f9ce48be511c3e99eda`
- expected v2 record (--file mode):
```json
{"aborted": 0, "answered": ["devin/swe-2", "inception/mercury-3"], "captured": "commandcode/deepseek/deepseek-v4.1-flash", "chain": ["charm-hyper/deepseek-v4.1-flash", "opencode-go/deepseek-v4.1-flash", "devin/deepseek-v4-1-flash", "devin/swe-2:max", "cursor/default", "inception/mercury-3:max", "openai-codex/gpt-6-luna:low"], "error_attempts": 6, "fallback": true, "final": "dead", "flag_hops": 3, "last_error": "Codex error event: Invalid prompt: your prompt was flagged as potentially violating our usage policy. Please try again w", "parse_errors": 0, "recovered_attempts": 4, "resolved": "commandcode/deepseek/deepseek-v4.1-flash:high", "revert_hops": 0, "seat": "L1Chousa48.Attack04", "superseded_by": ["devin/swe-2", "inception/mercury-3"], "upstream": [], "yielded": false}
```

## H8 — DEAD-2 final=aborted (0 served)
- path: `/home/vgpnk/.omp/agent/sessions/-Downloads/2026-10-30T02-19-19-374Z_01a18a9a-bdce-70a7-980b-fc9b8cc29fa6.jsonl`
- sha256: `8c767fedd7e75783443e297fc9fa19ac472854443536336a0c995b7bfcdb7aa8`
- expected v2 record (--file mode):
```json
{"aborted": 1, "answered": [], "captured": "anthropic/claude-opus-5-5", "chain": null, "error_attempts": 0, "fallback": false, "final": "aborted", "flag_hops": 0, "last_error": null, "parse_errors": 0, "recovered_attempts": 0, "resolved": null, "revert_hops": 0, "seat": "2026-10-30T02-19-19-374Z_01a18a9a-bdce-70a7-980b-fc9b8cc29fa6", "superseded_by": [], "upstream": [], "yielded": false}
```

## Plan-vs-oracle agreement (step 2)

`python3 .../probe/oracle93.py --file <T>` on all 8 real transcripts: **0 disagreements** with the
hand records (per-field diff of `hand-expected.jsonl` vs `oracle-actual.jsonl`, both copied here;
the 8 lines printed `OK`).

Synthetic edge suite (scratch `synth/`, 24 files) also agrees 0 diffs. Pinned semantics:

- `last_error` order pinned by oracle boundary probes: first line -> trim -> replace runs >=24 -> cut 120.
  A run crossing the cap is replaced first (s1c: 100 `#` + 24 `A` -> 100 `#` + `<redacted>`, NOT 20 raw
  `A`), and the cap can split the marker (s1d: 119 `#` + 24 `A` -> `#`x119 + `<`). Matches the plan text
  order ("runs -> <redacted>, first line, trimmed, cut 120") because split/trim commute with the run
  class; redact-before-cut is the binding reading a candidate must reproduce.
- `resolved` non-string (number 42) -> null while `chain` still read from the same first row.
- second `session_init` row ignored (first row wins).
- `superseded_by` `?` rule: empty/non-string provider or model -> `?`; duplicates collapse first-seen;
  served turns' `retryRecovery` ignored.
- `upstream`: served turns only; whitespace-only `" "` kept (non-empty string); distinct first-seen.
- `flag_hops`/`revert_hops`: `"1"`, `1`, absent flag are NOT JSON true -> role `fallback` counts as
  revert; a flagged fallback-role row counts ONLY as flag (elif semantics, s9/s10).
- `yielded`: toolCall name `yield` found on an aborted turn still counts (any assistant turn).
- `parse_errors`: blank/whitespace-only lines skipped; `notjson`, `[1,2]`, `5`, `null`, `"str"` each count.
- `captured`: first `model_change` with role `subagent:<stem>` wins its value even when the model is a
  non-string (captured null, and the default-role scan then still runs because captured is None —
  s21: non-string subagent row + default row -> captured `D/m`).
- `chain` keeps duplicate and empty-string items (order preserved); `[]` stays `[]`; missing
  chain/retryFallback -> null.
- `final` map: silent / served / dead / aborted / other; last assistant turn decides.
- `last_error` is null when the file has no error turn; non-string errorMessage -> "".
