# Round 93 — Gate quotes for the new SOURCES rows

Every new row carries a located quote (≤25 words) that grounds its `teaches`, plus the URL and
the access date. Access date for all rows here: **2026-11-06**. Pin:
`can1357/oh-my-pi` @ `79fa222e8390aed3494f4bc6746814e6c74c21cf`.

Re-fetch check (this seat, 2026-11-06): the three pinned files were re-downloaded from
`raw.githubusercontent.com/.../79fa222e8390aed3494f4bc6746814e6c74c21cf/...` and their sha256
equals `.ufo/waves/round-93/open/sources-fetch.txt` byte-for-byte (`cmp` identical to the lane
captures):

```
1059a80e5dc47cf9c23789974aa1ddd78207795d9a0537c95c3f2e2211a4eddf  turn-recovery.ts
4035dad36878c19d14aa4cdfd0e6de3c3ccbcb86cf3c280228e3c70b1128f29e  session-entries.ts
22ea739a7175ddd97b2f17a54fa9f876d17b972dc15e3a190848a5a358d5b95c  types.ts
```

## S269 — turn-recovery.ts

URL: https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/turn-recovery.ts
Capture: `.ufo/waves/round-93/open/turn-recovery.ts`, sha256 `1059a80e…`, 3529 lines.

**Primary quote** — `turn-recovery.ts:939-940` (16 words):

> Durably record a terminal empty error turn (`stopReason: "error"` with no substantive content) that `#persistSessionMessageIfMissing` skipped

Supporting quotes, same file:

- `:1061` — `entry.message.retryRecovery = retryRecovery;` (the saga is written **onto** the
  already-persisted error row, not into a new row).
- `:1039` — `attempt: pending.attempt,` and `:1056` the same in the superseded branch: the row
  carries the failed **attempt** number, which is why the count is attempts, not requests.
- `:1038` `status: "recovered",` and `:1043-1050` `supersededBy: {` … `provider: completion.supersedingMessage.provider,` / `model: completion.supersedingMessage.model,`.
- `:1055` `status: "superseded",` — that branch builds no `supersededBy` key (1053-1059), so
  `supersededBy` exists only on recovered rows.
- `:1070` `await this.#host.sessionManager.rewriteEntries();` — the row is rewritten in place.
- `:2261` and `:2550` pass `true` as the third argument (`appendModelChange(..., EPHEMERAL_MODEL_CHANGE_ROLE, true)`),
  while `:2617` `appendModelChange(primarySelector, EPHEMERAL_MODEL_CHANGE_ROLE);` omits it: the
  revert-to-primary hop is role `fallback` with no flag.

Corroboration (not a row — same pin, different file): `session-manager.ts:3687`
`appendModelChange(model: string, role?: string, resolvedModelIsFallback = false): string {`
(sha256 `d2b4a5d852a4f4617ecd7a12710139a4b49fabd05ce2cacf3c9b8e89286e515f`), so the omitted
third argument defaults to `false` and `resolvedModelIsFallback` is absent from the entry.

## S270 — own-work census

Source: `python3 .ufo/waves/round-93/K93ScribeSources/census.py --list sample-paths.txt`
(seed-93 draw of 1500 of 23530 transcripts, drawn 2026-11-06 and pinned as
`sample-paths.txt`, sha256 `f8b879ba…`). Receipt: `.ufo/waves/round-93/K93ScribeSources/census.txt`
(sha256 `dd921b11510a085aefdbe4b92f68135ec2c3f738b0d6f122960be82a529b2f6f`). Re-running with
`--list` reproduces every count below byte-identically (`census-pinned.txt`).

**Primary quote** — `census.txt:26-28` (3 words):

> flag_hops=941 revert_hops=17 role_fallback_rows=958

Supporting receipt lines (all `census.txt`):

- `:12-13` `error_turns=1513` / `error_turns_with_retryRecovery_object=1415` — 98 error turns
  carry no `retryRecovery`.
- `:14-16` `error_status_recovered=1375`, `error_status_superseded=40`, `error_status_other=0` —
  the status vocabulary is exactly those two strings in real data.
- `:17-21` `error_turns_with_supersededBy_object=1375`, provider and model strings 1375 each,
  `recovered_without_supersededBy=0`, `superseded_with_supersededBy=0` — `supersededBy` appears on
  exactly the recovered rows, always an object with both strings, matching the writer's two branches.
- `:23` `served_with_upstreamProvider=113` of `:22` `served_turns=55634`; `:38`
  `upstreamProvider_distinct=1 values=["Stealth"]`; `:24` `served_with_upstreamModel=0`.
- `:34-36` `attempt_ge2=268`, `attempt_max=7`, `attempt_hist={"1": 1147, "2": 145, "3": 67, "4": 35, "5": 19, "6": 1, "7": 1}`.
- `:29-33` `session_init_rows=2240`, `session_init_with_resolvedModel=2238`,
  `session_init_with_retryFallback_object=2237`, `..._chain_list=2237`, `..._chain_nonempty=2237`.
- `:1-3` seed, population, sample and the two sha256 digests; `:5-8` `files_unreadable=0`,
  `lines_bad_json=0` over 233651 rows.

## Supplementary — anchors the retry-fields entry needs but no row may carry today

- `session-entries.ts:292` `resolvedModel?: string;` and `:300` `retryFallback?: RetryFallbackRole;`
  (SessionInitEntry, 277-300). S267's frozen scope names `ModelChangeEntry` only, so this anchor
  is outside it; S270 observes the fields' presence in real transcripts but not their meaning.
- `retry-fallback-chains.ts:185-189` `export interface RetryFallbackRole {` … `chain: string[];`
  with `:188` "Fallback selectors walked after the primary; empty explicitly disables fallbacks."
  (sha256 `b5db529983630ee7e60621478868675dbbe93f149e3cf42eb1aee093a21774fc`; not in the frozen
  `open/` set, so it is a lead, not a row).
- `types.ts:1333` `upstreamProvider?: string;` with `:1327-1330` "Name of the upstream provider an
  aggregator routed this request to, as reported in the response … Distinct from `provider`, which
  is the configured gateway we called". Outside S268's scope (S268 names `upstreamModel`); see
  `rows.md` § Scope gap.
