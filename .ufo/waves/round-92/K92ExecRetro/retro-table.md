# Retro table — kumitate rounds 80–91 w1, read with the frozen oracle

Source: `probe/oracle92.py` (FROZEN; sha256 in `sha256.txt`) run as
`python3 .ufo/waves/round-92/probe/oracle92.py --results .ufo/waves/round-<N>/w1-results.json`
for N=80..91 from the lane root. Output per round: `retro-r<N>.json` (verbatim oracle JSON).
No `w2-results.json` exists in any round 80..91 (`run-meta.txt`), so w1 is the whole record.

Reading notes: `captured` is the route the seat was dispatched with (first `model_change` for
`subagent:<seat>`, else the `default`/role-less one); `answered` is the distinct models whose turns
actually stopped on `stop`/`toolUse`/`length`, in first-seen order. `dead` = last turn's stopReason
is `error`; `answered` can still be non-empty for a dead seat (it answered, then died).

## Timing and transcript size

| round | oracle seconds | seats | located | sum of located transcript bytes | largest file |
|---|---|---|---|---|---|
| 80 | 0.417 | 13 | 13 | 10929805 | K80LabratC2 (1214333 B) |
| 81 | 0.396 | 14 | 14 | 11609070 | K81ScribeCorpus (1613449 B) |
| 82 | 0.381 | 14 | 14 | 10728260 | K82ScribeEntry2 (1199292 B) |
| 83 | 0.387 | 15 | 15 | 10772367 | K83ScoutAdmission (1041546 B) |
| 84 | 0.254 | 10 | 10 | 6669441 | K84Scout (796932 B) |
| 85 | 0.368 | 13 | 13 | 19116111 | K85Scribe (2966114 B) |
| 86 | 0.316 | 12 | 12 | 10004479 | K86Scribe (3412884 B) |
| 87 | 0.372 | 14 | 14 | 11279114 | K87Scout (1758572 B) |
| 88 | 0.305 | 12 | 12 | 6086300 | K88Sentinel (1049868 B) |
| 89 | 0.342 | 13 | 13 | 9509929 | K89Connector (1320151 B) |
| 90 | 0.314 | 12 | 12 | 7883546 | K90Mutation (1016195 B) |
| 91 | 0.327 | 12 | 12 | 12924771 | K91ScribeSources (3401511 B) |

Total: 154 seats over 12 waves, 154 located, 127513193 bytes of transcript scanned; largest single file
`86/K86Scribe` (3412884 B). Per-wave wall clock 0.25–0.42 s, one process per wave.

## Per-round summary

| round | seats | located | served | dead | aborted | silent | other | absent | fallback | captured route never answered |
|---|---|---|---|---|---|---|---|---|---|---|
| 80 | 13 | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 11 | 6 |
| 81 | 14 | 14 | 12 | 2 | 0 | 0 | 0 | 0 | 9 | 6 |
| 82 | 14 | 14 | 11 | 3 | 0 | 0 | 0 | 0 | 9 | 6 |
| 83 | 15 | 15 | 10 | 5 | 0 | 0 | 0 | 0 | 10 | 7 |
| 84 | 10 | 10 | 10 | 0 | 0 | 0 | 0 | 0 | 10 | 1 |
| 85 | 13 | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 10 | 10 |
| 86 | 12 | 12 | 7 | 5 | 0 | 0 | 0 | 0 | 4 | 0 |
| 87 | 14 | 14 | 7 | 7 | 0 | 0 | 0 | 0 | 3 | 0 |
| 88 | 12 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 89 | 13 | 13 | 9 | 4 | 0 | 0 | 0 | 0 | 5 | 3 |
| 90 | 12 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 6 | 3 |
| 91 | 12 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 4 | 1 |
| **80–91** | 154 | 154 | 128 | 26 | 0 | 0 | 0 | 0 | 81 | 43 |

## Per-round rows

### round 80 — 13 seats, 13 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K80ScoutFreeze` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ScoutOmit` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ExecC1` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 8 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K80ExecC2` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 7 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K80ExecRepairs` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 7 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ScribeKnowledge` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ScribeDocs` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ConnectSiblings` | connector | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80CriticClaims` | critic | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `opencode-go/deepseek-v4.1-flash` | **yes** | 9 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80ReviewFreeze` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 11 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K80ReviewSplit` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 6 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K80MutC1` | mutation-tester | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 11 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K80LabratC2` | revenger | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 2 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |

### round 81 — 14 seats, 12 served, 2 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K81ScoutReconC1` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81ScoutReconC2` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81ConnOverlap` | connector | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81ExecC1Fixtures` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `opencode-go/deepseek-v4.1-flash` | **yes** | 12 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81ExecC2Fixtures` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 14 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K81ExecMutate` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `opencode-go/deepseek-v4.1-flash` | **yes** | 7 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81MutC1` | mutation-tester | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 8 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K81ReviewC1` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 16 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K81ReviewC2` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 12 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81CriticClaims` | critic | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 14 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K81Sentinel` | sentinel | **dead** | `zai/glm-5.3-flashx` | — | no | 6 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K81ScribeCorpus` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81ScribeLesson` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K81RevWrongReady` | revenger | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |

### round 82 — 14 seats, 11 served, 3 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K82ScoutReconC1` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ScoutReconC2` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ExecMutate` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `opencode-go/deepseek-v4.1-flash` | **yes** | 18 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ExecCensusMutate` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 11 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ExecGates` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 20 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K82ScribeEntry1` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ScribeEntry2` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82Connector` | connector | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82ReviewC1` | reviewer | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 15 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K82ReviewC2` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 12 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K82CriticClaims` | critic | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 19 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K82MutCounters` | mutation-tester | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 12 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K82Sentinel` | sentinel | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 12 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K82Revenger` | revenger | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 3 | 0 | yes | `402 [code=insufficient_balance] Coding Plan quota is exhausted and wallet balance is insufficient. Please top up your wa` |

### round 83 — 15 seats, 10 served, 5 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K83ScoutAdmission` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ScoutCensus` | scout | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ExecHandoffV3` | executor | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 28 | 0 | no | `429 Usage limit reached for 5 hour. Your limit will reset at 2026-11-04 21:14:48 (type=1308)` |
| `K83ExecCensusClock` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 13 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ExecEvidence` | executor | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 11 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K83ScribeAdmission` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ScribeClock` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ScribeSources` | scribe | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83Connector` | connector | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83ReviewC1` | reviewer | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 25 | 0 | no | `429 Usage limit reached for 5 hour. Your limit will reset at 2026-11-04 21:14:48 (type=1308)` |
| `K83ReviewC2` | reviewer | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 19 | 0 | no | `429 Usage limit reached for 5 hour. Your limit will reset at 2026-11-04 21:14:48 (type=1308)` |
| `K83CriticClaims` | critic | **dead** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 7 | 0 | no | `Retry budget exhausted after 5 retries: 429 Rate limit reached for requests (type=1302)` |
| `K83MutCounters` | mutation-tester | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 8 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83Sentinel` | sentinel | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `kimi-code/kimi-for-coding` | **yes** | 2 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K83Revenger` | revenger | **served** | `devin/swe-2` | `opencode-go/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |

### round 84 — 10 seats, 10 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K84ExecGate` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84ExecFixtures` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84ExecHistory` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Scribe` | scribe | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Scout` | scout | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Connector` | connector | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Review` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Critic` | critic | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Mutation` | mutation-tester | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K84Sentinel` | sentinel | **served** | `zai/glm-5.3-flashx` | `openai-codex/gpt-6.1-sol` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |

### round 85 — 13 seats, 13 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K85ExecGate` | executor | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85ExecFixture` | executor | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85ExecHistory` | executor | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85ExecSelftest` | executor | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85ExecPins` | executor | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85Scribe` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K85Scout` | scout | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K85Connector` | connector | **served** | `google-antigravity/gemini-3.8-flash` | `google-antigravity/gemini-3.8-flash` | no | 0 | 0 | yes | — |
| `K85Review` | reviewer | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85Critic` | critic | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85Mutation` | mutation-tester | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85Sentinel` | sentinel | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K85Cheat` | reviewer | **served** | `devin/swe-2` | `commandcode/deepseek/deepseek-v4.1-flash` | **yes** | 1 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |

### round 86 — 12 seats, 7 served, 5 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K86ExecTool` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K86ExecDriver` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `anthropic/claude-haiku-5-5` | **yes** | 3 | 0 | yes | `Devin stream error permission_denied: This model is no longer available for your account. Please switch to a different m` |
| `K86ExecProxy` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K86ExecMap` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K86Scribe` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K86Scout` | scout | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K86Review` | reviewer | **dead** | `opencode-go/deepseek-v4.1-flash` | — | no | 1 | 0 | no | `402 Upstream request failed: Insufficient account funds (type=server_error)` |
| `K86Critic` | critic | **dead** | `opencode-go/deepseek-v4.1-flash` | — | no | 1 | 0 | no | `402 Upstream request failed: Insufficient account funds (type=server_error)` |
| `K86Mutation` | mutation-tester | **dead** | `opencode-go/deepseek-v4.1-flash` | — | no | 3 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K86Sentinel` | sentinel | **dead** | `opencode-go/deepseek-v4.1-flash` | — | no | 1 | 0 | no | `402 Upstream request failed: Insufficient account funds (type=server_error)` |
| `K86Connector` | connector | **served** | `google-antigravity/gemini-3.8-flash` | `google-antigravity/gemini-3.8-flash` | no | 0 | 0 | yes | — |
| `K86Revenger` | revenger | **dead** | `opencode-go/deepseek-v4.1-flash` | — | no | 1 | 0 | no | `402 Upstream request failed: Insufficient account funds (type=server_error)` |

### round 87 — 14 seats, 7 served, 7 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K87ExecBind` | executor | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 10 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K87ExecClose` | executor | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 5 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K87ExecSources` | executor | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 2 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K87ExecMap` | executor | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 9 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K87ScribeLesson` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 {"type":"error","error":{"type":"rate_limit_error","message":"The Token Plan usage limit has been reached. To avoid ` |
| `K87ScribeEntry` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 {"type":"error","error":{"type":"rate_limit_error","message":"Token Plan usage limit reached: Upgrade your Token Pla` |
| `K87Scout` | scout | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 {"type":"error","error":{"type":"rate_limit_error","message":"Token Plan usage limit reached: Upgrade your Token Pla` |
| `K87Connector` | connector | **served** | `google-antigravity/gemini-3.8-flash` | `google-antigravity/gemini-3.8-flash` | no | 0 | 0 | yes | — |
| `K87Review` | reviewer | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 12 | 0 | no | `402 [code=insufficient_balance] Coding Plan quota is exhausted and wallet balance is insufficient. Please top up your wa` |
| `K87Critic` | critic | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 11 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K87Mutation` | mutation-tester | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 8 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K87Sentinel` | sentinel | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 7 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K87Revenger` | revenger | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 12 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K87Review2` | reviewer | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 10 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |

### round 88 — 12 seats, 12 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K88ExecSelftest` | executor | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88ExecClose` | executor | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88ExecCarry` | executor | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88ScribeSources` | scribe | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88ScribeEntry` | scribe | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Scout` | scout | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Connector` | connector | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Review` | reviewer | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Review2` | reviewer | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Critic` | critic | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Mutation` | mutation-tester | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |
| `K88Sentinel` | sentinel | **served** | `anthropic/claude-opus-5-5` | `anthropic/claude-opus-5-5` | no | 0 | 0 | yes | — |

### round 89 — 13 seats, 9 served, 4 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K89ExecInst` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `devin/glm-5-3-flash-1m`, `anthropic/claude-haiku-5-5` | **yes** | 3 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89ExecDebt` | executor | **served** | `zai/glm-5.3-flashx` | `devin/glm-5-3-flash-1m`, `anthropic/claude-haiku-5-5` | **yes** | 4 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89ExecReceipts` | executor | **served** | `zai/glm-5.3-flashx` | `devin/swe-2-flash`, `anthropic/claude-haiku-5-5` | **yes** | 2 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89ExecClose` | executor | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `devin/glm-5-3-flash-1m`, `anthropic/claude-haiku-5-5` | **yes** | 7 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89ScribeSources` | scribe | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 5 | 0 | no | `402 [code=insufficient_balance] Coding Plan quota is exhausted and wallet balance is insufficient. Please top up your wa` |
| `K89ScribeLesson` | scribe | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 5 | 0 | no | `402 [code=insufficient_balance] Coding Plan quota is exhausted and wallet balance is insufficient. Please top up your wa` |
| `K89ScoutRecon` | scout | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 10 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89Review` | reviewer | **served** | `zai/glm-5.3-flashx` | `devin/glm-5-3-flash-1m`, `anthropic/claude-haiku-5-5` | **yes** | 3 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89Critic` | critic | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 7 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K89Mutation` | mutation-tester | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 11 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89Sentinel` | sentinel | **dead** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 12 | 0 | no | `401 Invalid 'Authorization' header or token. (type=authentication_error param=UNAUTHORIZED)` |
| `K89Labrat` | critic | **served** | `devin/deepseek-v4-1-flash` | `devin/deepseek-v4-1-flash` | no | 12 | 0 | yes | `Devin stream error resource_exhausted: Reached request rate limit. Please switch to a different model or contact support` |
| `K89Connector` | connector | **served** | `google-antigravity/gemini-3.8-flash` | `google-antigravity/gemini-3.8-flash` | no | 0 | 0 | yes | — |

### round 90 — 12 seats, 12 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K90ExecInst` | executor | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash` | no | 0 | 0 | yes | — |
| `K90ExecClose` | executor | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash` | no | 0 | 0 | yes | — |
| `K90ExecAudit` | executor | **served** | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K90ScribeSources` | scribe | **served** | `anthropic/claude-haiku-5-5` | `anthropic/claude-haiku-5-5` | no | 0 | 0 | yes | — |
| `K90ScribeLesson` | scribe | **served** | `anthropic/claude-haiku-5-5` | `anthropic/claude-haiku-5-5` | no | 0 | 0 | yes | — |
| `K90Scout` | scout | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K90Connector` | connector | **served** | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K90Sentinel` | sentinel | **served** | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K90Reviewer` | reviewer | **served** | `zai/glm-5.3-flashx` | `commandcode/z-ai/glm-5.3-flash` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K90CriticA` | critic | **served** | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K90CriticB` | critic | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash` | no | 0 | 0 | yes | — |
| `K90Mutation` | mutation-tester | **served** | `zai/glm-5.3-flash` | `anthropic/claude-haiku-5-5`, `zai/glm-5.3-flash` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |

### round 91 — 12 seats, 12 served, 0 dead

| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |
|---|---|---|---|---|---|---|---|---|---|
| `K91ExecInst` | executor | **served** | `commandcode/stealth/crouton-alpha` | `commandcode/stealth/crouton-alpha` | no | 0 | 0 | yes | — |
| `K91ExecCarry` | executor | **served** | `commandcode/stealth/crouton-alpha` | `commandcode/stealth/crouton-alpha` | no | 0 | 0 | yes | — |
| `K91ScribeSources` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 1 | 0 | yes | `ECONNRESET: The socket connection was closed unexpectedly. For more information, pass `verbose: true` in the second argu` |
| `K91ScribeLesson` | scribe | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K91Scout` | scout | **served** | `google-antigravity/claude-opus-5-5` | `minimax-code/MiniMax-M3.1-Flash` | **yes** | 1 | 0 | yes | `Cloud Code Assist API error (429): {` |
| `K91Connector` | connector | **served** | `google-antigravity/gemini-3.8-flash` | `google-antigravity/gemini-3.8-flash` | no | 4 | 0 | yes | `Request was aborted` |
| `K91Sentinel` | sentinel | **served** | `minimax-code/MiniMax-M3.1-Flash` | `minimax-code/MiniMax-M3.1-Flash` | no | 0 | 0 | yes | — |
| `K91Reviewer` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx`, `commandcode/z-ai/glm-5.3-flash` | **yes** | 5 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K91ReviewProc` | reviewer | **served** | `zai/glm-5.3-flashx` | `zai/glm-5.3-flashx` | no | 0 | 0 | yes | — |
| `K91CriticA` | critic | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K91CriticB` | critic | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash`, `anthropic/claude-haiku-5-5` | **yes** | 1 | 0 | yes | `429 Rate limit reached for requests (type=1302)` |
| `K91Mutation` | mutation-tester | **served** | `zai/glm-5.3-flash` | `zai/glm-5.3-flash` | no | 0 | 0 | yes | — |

