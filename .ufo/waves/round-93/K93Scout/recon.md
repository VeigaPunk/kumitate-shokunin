# K93Scout — recon: source faithfulness of the round-93 v2 field definitions

Seat: K93Scout. Scope: does each v2 field definition in `.ufo/waves/round-93/plan.md` (§ "Frozen field
definitions (v2)") faithfully describe what omp actually persists, per upstream source at
`79fa222e8390aed3494f4bc6746814e6c74c21cf`?

Upstream fetched to scratch (`/fast/scratch/hyaku/kumitate-r93/K93Scout/src/oh-my-pi-79fa222e…`), tarball
sha256 `d2b38d3b3820e1e6f061032b0444fb7464569e691d7a571b89fc1fb4acf9222a`. The three lane captures in
`.ufo/waves/round-93/open/` are byte-identical to the fetched tree
(`types.ts` `22ea739a…`, `session-entries.ts` `4035dad3…`, `turn-recovery.ts` `1059a80e…`), so the lane
citations and my citations are the same bytes.

All host counts below are read-only counts over `~/.omp/agent/sessions` (no transcript content copied;
scripts and receipts in this seat dir).

---

## A. Field-by-field writer map (file:line, `79fa222e`)

### `error_attempts` (int) — count of turns with `stopReason` `error`
- The rename `errors` → `error_attempts` is **faithful**. Upstream persists one assistant error row per
  failed *attempt*, not per request:
  - `packages/coding-agent/src/session/turn-recovery.ts:985` `#recordPendingRetryError` → `:948`
    `#persistTerminalEmptyErrorTurn` → `:952` `appendSessionMessage(message)`: each failed attempt's
    message is appended as its own row.
  - `packages/coding-agent/src/session/turn-recovery.ts:3124` calls `#recordPendingRetryError` once per
    failed attempt.
- Host check: 29 243 error turns across 16 121 lane files with error turns; 4 046 files hold >1 error turn.
  `retryRecovery.attempt` reaches 11 (`receipt-attempt-rows.txt`, `receipt-lane-retryRecovery.txt`).
- **No divergence.** The v1 `errors` count was already the same number; only the *name* changed, so the
  rename is a labelling fix, not a semantic one. The plan's D1 wording ("one persisted error row per
  failed attempt, not per request") is correct.

### `recovered_attempts` (int) — error turns whose `retryRecovery.status` is exactly `recovered`
- Writer: `packages/coding-agent/src/session/turn-recovery.ts:1036-1052` (`status: "recovered"`) vs
  `:1053-1060` (`status: "superseded"`); assigned at `:1061` `entry.message.retryRecovery = retryRecovery`.
- Type: `packages/ai/src/types.ts:1263-1275` — `AssistantRetryRecovery` is a two-arm discriminated union on
  `status`: `"recovered"` | `"superseded"`. **No third status value exists.**
- Host check: lane-wide `retryRecovery_status` over 27 367 error turns = `recovered` 26 582 /
  `superseded` 785. `status` other than recovered/superseded: **0**.
- **No divergence.**

### `superseded_by` (list of str) — `retryRecovery.supersededBy.provider + "/" + .model`
- Writer: `packages/coding-agent/src/session/turn-recovery.ts:1043-1051` — `supersededBy` is only written on
  the **`recovered`** arm; the `superseded` arm (`:1053-1060`) carries **no** `supersededBy` key at all.
- Type: `packages/ai/src/types.ts:1271-1276` — `supersededBy?: { timestamp, responseId?, provider, model }`,
  optional, and only on the recovered arm.
- Host check: lane-wide `status × supersededBy` cross-tab is **perfectly separated** —
  `('recovered', sb_obj)` 26 582, `('superseded', sb_NoneType)` 785; zero `recovered` rows lacking
  `supersededBy` and zero `superseded` rows carrying one. `provider`/`model` are always non-empty strings
  on host (0 bad provider, 0 bad model over 26 582 rows).
- **DIVERGENCE D1 — in-definition (see § C).** The plan's field definition is *mechanically* correct but
  its *name and rationale* assert a mapping omp does not have. `superseded_by` collects the **successor**
  of a failed attempt (the `supersedingMessage` that replaced it), **not** the attempt that was itself
  superseded. Upstream's own term for "this attempt was replaced" is the *other* status value,
  `"superseded"`, which by construction never carries `supersededBy`. The plan's D7 sentence — "states who
  replaced the failed attempt" — is correct; but the D7 framing bundles `status recovered | superseded`
  with `supersededBy {provider, model}` as if the two were orthogonal, and the field name
  `superseded_by` reads as "the model that superseded me" (upstream's `superseded` sense) when it is
  actually "the model that superseded the failed attempt" (upstream's `supersededBy` sense).
  The *value* is right; the *name* is inverted relative to upstream vocabulary. This is a naming/
  documentation divergence, not a computation divergence: no record value is wrong.

### `upstream` (list of str) — served turns' `upstreamProvider`
- Writer: **exactly one** provider file — `packages/ai/src/providers/openai-completions.ts:1441-1444`,
  inside the chunk loop:
  ```
  if (!output.upstreamProvider) {
      const upstreamProvider = (chunk as ProviderAttributedChatCompletionChunk).provider;
      output.upstreamProvider = typeof upstreamProvider === "string" && upstreamProvider.length > 0 ? upstreamProvider : undefined;
  }
  ```
  i.e. the aggregator's per-chunk top-level `provider` field (OpenRouter / Vercel AI Gateway style).
  `openai-responses.ts` only ever *clears* it (`:1429`) or restores a dead value (`:1396`); it never sets
  a fresh one. No other provider file in `packages/ai/src/providers/` mentions `upstreamProvider`.
- Type: `packages/ai/src/types.ts:1326-1333` — `upstreamProvider?: string`, documented as "the provider an
  aggregator routed this request to… Undefined for direct providers that expose no such field".
- Host check: 3 400 turns carry the key, **all** with the single value `"Stealth"` (an aggregator id,
  not an omp provider id — grep for `"Stealth"` in upstream finds no provider named Stealth; the catalog has
  `stealth/…` *model* ids under other providers, e.g. `packages/catalog/src/provider-models/cline-pass.ts:222`
  `"stealth/ox-alpha"`). 3 of the 3 400 sit on a non-served stop (`error`), so the plan's "over served
  turns" scoping is **load-bearing** and correct (`receipt-lane-modelChange.txt`).
- Plan claim D6 cites "types.ts 1326–1333: the provider an aggregator routed to, e.g. `Stealth`" — the
  example value is the only value on host. Confirmed.
- **No divergence.** One caveat worth recording: `upstreamProvider` is set on the *output message*, so it
  can in principle ride on an error turn; the plan handles that by scoping to served turns.

### `resolved` / `chain` (str|null / list|null) — FIRST `session_init` row
- Writers of `session_init` (two sites):
  - `packages/coding-agent/src/task/executor.ts:5164` `session.sessionManager.appendSessionInit({…})` —
    the **spawn-time** row: carries `resolvedModel: progress.resolvedModel` (`:5172`) and
    `retryFallback: getRetryFallbackRole(subagentSettings, subagentRetryFallbackRole(id))` (`:5183`).
  - `packages/coding-agent/src/session/agent-session.ts:7274` `this.sessionManager.appendSessionInit(cached.init)`
    — a **later** row, appended when the base system prompt / work-pool yield items change
    (docstring `:7245-7250`: "appending a newer one when either changes"). `cached.init` is derived from
    `extractSessionInit(...)` at `:7255`, i.e. the **last** existing init, with `systemPrompt` /
    `workPoolYieldItems` replaced and `resolvedModel` / `retryFallback` carried through unchanged.
  - Third site: `packages/coding-agent/src/modes/controllers/tan-command-controller.ts:207` — a clone/fork
    `session_init` with **no** `resolvedModel` and **no** `retryFallback`.
- Upstream's own reader takes the **LAST** init, not the first:
  `packages/coding-agent/src/session/session-manager.ts:4798-4815` `extractSessionInit` loops all entries
  and keeps the last match (docstring `:4794-4797`: "Latest persisted `session_init` contract"); used by
  `agent-session.ts:7255`, `session-manager.ts:4556`, `task/persisted-revive.ts:263`, `task/restore.ts:78`.
- **DIVERGENCE D2 — in-definition.** The plan defines `resolved`/`chain` as the **FIRST** `session_init`
  row, while upstream's canonical reader (`extractSessionInit`) and upstream's own writer
  (`agent-session.ts:7274` "appending a newer one") treat the **latest** init as the live contract. The
  plan is *self-consistent* (it defines FIRST and the oracle implements FIRST), so this is not a
  counterexample to the shipped tool; but the definition is **not** the upstream reading, and the plan's
  D8 rationale ("the configured chain before any failure") is the reading that makes FIRST defensible
  (the spawn-time row is the pre-failure configuration).
- Host check — does FIRST vs LAST ever differ on host? **No.** Across the whole lane
  (26 875 files with init, 26 937 lane files total): `init_count_histogram = {1: 14156, 2: 10787, 3: 1573,
  4: 309, 5: 37, 6: 10, 7: 1, 8: 2}` — 12 719 files hold >1 init row — and
  `first_vs_last_signature_diff_files = 0`: **zero** files where the first row's
  (`resolvedModel`, `retryFallback.chain`) signature differs from the last's. Whole sessions root
  (28 032 files): same, 0 differing. A-set (61 real transcripts): 28 files hold >1 init row, **0** differ.
  Reason: the second writer carries `resolvedModel`/`retryFallback` through unchanged, so FIRST == LAST
  wherever the extra rows exist. The 37 anomalous init rows found lane-wide are all `retryFallback`
  absent with `resolvedModel` present, in files with exactly **one** init row — FIRST/LAST cannot differ
  there. (`receipt-A-set-inits.txt`, `receipt-lane-inits.txt`)
- Consequence: D2 is **latent**, not observable on the current corpus. It becomes observable only if a
  future omp writes an init row with a *different* `resolvedModel`/`retryFallback` than the spawn row —
  which the `agent-session.ts:7274` writer does not do today.

### `flag_hops` (int) — `model_change` rows with `resolvedModelIsFallback` JSON `true`
- Writer: `packages/coding-agent/src/session/session-manager.ts:3687-3697` `appendModelChange(model, role?,
  resolvedModelIsFallback = false)` — the flag is a **boolean with a `false` default**, always written when
  the caller omits it. `true` is passed only at `turn-recovery.ts:2261` (fallback chain hop) and `:2550`
  (fireworks fast→base degrade). Both use role `EPHEMERAL_MODEL_CHANGE_ROLE`.
- Type: `packages/coding-agent/src/session/session-entries.ts:155` `resolvedModelIsFallback?: boolean`.
- Host check: 72 682 lane `model_change` rows; `resolvedModelIsFallback` = `false` 54 183, `true` 18 499,
  **absent 0**; `true_but_not_fallback_role = 0` (every `true` row also carries role `fallback`).
- **No divergence.** Note the plan's "JSON `true` (not `1`)" is not vacuous in principle — the flag is
  typed boolean upstream, so `1` cannot occur on host; it is a type-strictness guard against non-omp rows.

### `revert_hops` (int) — `model_change` rows with `resolvedModelIsFallback` not `true` **and** role `fallback`
- Writer: `packages/coding-agent/src/session/session-entries.ts:37`
  `export const EPHEMERAL_MODEL_CHANGE_ROLE = "fallback"`. Three upstream sites write that role:
  - `turn-recovery.ts:2261` `appendModelChange(candidateSelector, EPHEMERAL_MODEL_CHANGE_ROLE, true)`
    → the **fallback hop** (flag `true`) → counted in `flag_hops`.
  - `turn-recovery.ts:2550` `appendModelChange(baseSelector, EPHEMERAL_MODEL_CHANGE_ROLE, true)`
    → fireworks fast→base degrade (flag `true`) → `flag_hops`.
  - `turn-recovery.ts:2617` `appendModelChange(primarySelector, EPHEMERAL_MODEL_CHANGE_ROLE)`
    → **revert-to-primary**: third argument omitted ⇒ `resolvedModelIsFallback` defaults to **`false`**
    ⇒ flag not `true`, role `fallback` ⇒ counted in `revert_hops`. This is the plan's D4, and it is
    correct: the revert-to-primary hop **reuses** the same role string without the flag.
- Host check: lane-wide, `role == "fallback"` rows split `true` 18 499 / not-true 361. Every one of the
  361 not-true rows is the revert-to-primary hop, verified structurally: walking each file's
  `model_change` rows and remembering the last non-`fallback` model, **361/361** not-true `fallback` rows
  carry exactly the model that was in effect *before* the preceding `fallback`-role hop
  (`revert_matches_pre_fallback_primary = 361`, `fb_not_true_differs_from_pre_primary = 0`).
  (`receipt-revert-pair.txt`)
- **No divergence.** `revert_hops` is a faithful proxy for the revert-to-primary hop.

### `chain` shape — `retryFallback.chain`
- Type: `packages/coding-agent/src/session/retry-fallback-chains.ts:185-190`
  `interface RetryFallbackRole { primary: string; chain: string[] }` — `chain` is a **string array**;
  `primary` is a separate field, so the plan reading `chain` as the *fallback* list (not including
  `primary`) is faithful. `executor.ts:5184` writes `retryFallback: getRetryFallbackRole(...)`, whose
  `chain` comes from `cfgRetryFallbackChains.get(settings)[role]` (`retry-fallback-chains.ts:193-198`).
- Host check: 26 854 lane init rows carry a `retryFallback` **dict**, all with a string `primary`;
  21 rows are not a dict. All 26 854 dicts have `chain` as a **list** and **every item is a string**
  (`chain_items_all_str: True` for 23 343/23 343 in the 1 500-file sample; `chain_len_*` histogram
  1..8, mode 3). `primary == resolvedModel` in 26 845 of 26 854 rows (9 differ).
- **No divergence.** The plan's "non-strings dropped" clause is a defensive type-guard against non-omp
  rows only; host never exercises it.

### `?` model rule (used by `answered`, `superseded_by`)
- Plan: `superseded_by` applies the `?` rule — "either missing, non-string or empty → `?`" — **per
  component**, i.e. `provider/model` collapses to the single string `?` if *either* part is bad.
- Upstream `supersededBy.provider` / `.model` are typed `string` (types.ts:1274-1275) and written from
  `completion.supersedingMessage.provider/.model` (turn-recovery.ts:1047-1048) — always non-empty on host
  (0 bad over 26 582 rows). So the `?` guard is again defensive-only.
- **No divergence** in the value; the guard's scope matches v1's `turnModel` (v1 `scripts/seat-route.mjs`
  at `cd7ee03d…`: `if (typeof provider !== 'string' || provider === '' || typeof model !== 'string' || model === '') return '?'`).

---

## B. Host census summary (counts only)

| measurement | value | receipt |
|---|---|---|
| lane transcripts scanned | 26 937 files (lane) / 28 032 files (root) | `receipt-census-1500.txt`, `receipt-lane-inits.txt` |
| random sample seed | 20261106, 1 500 files | same |
| `model_change` rows (lane) | 72 682 | `receipt-lane-modelChange.txt` |
| `resolvedModelIsFallback` on host | `true` 18 499 · `false` 54 183 · **absent 0** | same |
| role `fallback` rows | 18 860 (18 499 `true`, 361 not-true) | same + `receipt-revert-pair.txt` |
| revert rows matching the pre-fallback primary | **361 / 361** | `receipt-revert-pair.txt` |
| `retryRecovery` dicts on error turns (lane) | 27 367, all on `stopReason: error` | `receipt-lane-retryRecovery.txt` |
| `retryRecovery` on a **served** turn | **0** | same |
| `retryRecovery.status` values | `recovered` 26 582 / `superseded` 785 — **no other value** | same |
| `recovered` rows lacking `supersededBy` | **0** | same |
| `superseded` rows carrying `supersededBy` | **0** | same |
| bad `supersededBy.provider` / `.model` | 0 / 0 | `receipt-lane-retryRecovery.txt` |
| `upstreamProvider` turns (lane) | 3 400, single value `"Stealth"`; 3 on non-served stops | `receipt-lane-modelChange.txt` |
| files with >1 `session_init` (lane) | 12 719 of 26 875 | `receipt-lane-inits.txt` |
| files where FIRST init ≠ LAST init (lane / root / A-set) | **0 / 0 / 0** | `receipt-lane-inits.txt`, `receipt-A-set-inits.txt` |
| init rows whose `retryFallback` is not a dict | 21 (lane) | `receipt-primary-vs-resolved.txt` |
| init rows whose `retryFallback` is a dict with a string `primary` | 26 854 | same |
| init rows whose `chain` is a list of all-strings | 23 343 / 23 343 | `receipt-census-1500.txt` |

## C. Divergence list

### IN-DEFINITION (the definitions say something false about omp → kill (c) material)
1. **D1 — `superseded_by` name is inverted relative to upstream vocabulary.**
   The plan (D7) presents `supersededBy {provider, model}` as if it were available on both
   `status: recovered | superseded` arms. Upstream (`types.ts:1263-1284`) puts `supersededBy` **only** on the
   `recovered` arm; the `superseded` arm has no such key. Host confirms perfect separation.
   Consequence: `superseded_by` in a v2 record lists *the successor* of a failed attempt. The name
   suggests the opposite. **Every computed value is correct**; only the label misleads. This is a
   documentation/naming divergence, not a value divergence — it does not by itself satisfy kill (c),
   which requires "the shipped tool's record contradicting a field definition".

### OUT-OF-DEFINITION (routed, not kill material)
2. **D2 — FIRST vs LAST `session_init`.** The plan freezes FIRST; upstream's canonical reader
   (`extractSessionInit`, session-manager.ts:4798) and its own newer-init writer
   (agent-session.ts:7274) use LATEST. Both readings are defensible ("configured chain before any
   failure" ⇒ FIRST). Host: **0 of 26 875 lane files** (and 0 of 28 032 root files, 0 of 61 A-set files)
   differ between FIRST and LAST, because the newer init carries `resolvedModel`/`retryFallback` through
   unchanged. Latent, not currently observable.
3. **D3 — `chain` excludes `primary` by design.** `retryFallback` upstream is `{primary, chain}`
   (retry-fallback-chains.ts:185-190); the plan's `chain` field is the fallback list only and `resolved`
   is a separate string. The plan's ablation `ctl-chainprimary` (primary prepended → UNMET 22/221)
   confirms the intended reading; it matches upstream's own split of the two fields. Not a divergence —
   recorded because it is the one place the plan drops an upstream field (`retryFallback.primary`) and
   because `primary == resolvedModel` in 26 845/26 854 host rows, i.e. the two v2 fields together carry
   upstream's `primary` + `chain` pair.
4. **D4 — `upstreamProvider` is one-provider-wide.** Only `openai-completions.ts` sets it; direct
   providers never do (`types.ts:1330-1331` says so). Host shows a single value `"Stealth"`. A v2 record
   whose `upstream` is empty does **not** mean "no aggregator" — it means "this provider did not report
   one". Worth stating in the tool's doc comment; not a definition error.

## D. Version skew (host vs upstream)

- Host binary: `omp --version` ⇒ **`omp/18.15.0`** (path `/home/vgpnk/.local/bin/omp`).
- Upstream tip cited by the plan: `79fa222e…` ⇒ `packages/coding-agent/package.json` version
  **`18.17.0`**; the `v18.17.0` tag resolves to `75e7801e…` (the plan's SHA is `main`, one commit ahead
  of that tag).
- Skew is **immaterial for every v2 field**: the v2-relevant declarations are byte-identical between
  18.15.0 and 18.17.0 —
  `AssistantRetryRecovery` (types.ts:1239-1260 vs 1263-1284, same two arms, same `supersededBy` shape),
  `upstreamProvider?: string` (1309 vs 1333), `SessionInitEntry.resolvedModel`/`retryFallback`
  (session-entries.ts:285/293 vs 292/300; 18.17 adds only `mountedTools`),
  `EPHEMERAL_MODEL_CHANGE_ROLE = "fallback"` (session-entries.ts:37 in both),
  `RetryFallbackRole` (retry-fallback-chains.ts:185-190, identical),
  the `retryRecovery` writer block (turn-recovery.ts:1015-1070, `diff` ⇒ identical),
  and the three `appendModelChange` fallback sites (turn-recovery.ts:2261/2550/2617 in both).
- The 18.15.0↔18.17.0 diff in `turn-recovery.ts` is confined to billing-cap backoff
  (`isBillingCapUsageLimit`, lines 2953-2960 in 18.17) — it changes *when* a saga gives up, not *what*
  is written, and does not add a `retryRecovery` status or change `supersededBy`.
- **Conclusion:** the plan's source citations are valid for the host binary's semantics.

## E. Definition-to-source coverage gaps (not divergences)

- `error_attempts` counts rows; upstream's per-attempt identity lives in `retryRecovery.attempt`, which v2
  does not surface. A v2 record therefore cannot distinguish "1 request that failed 3 times" from
  "3 requests that failed once" *unless* `recovered_attempts` is consulted — and even then only
  approximately (host: 2 941 lane files hold >1 error row with a repeated `attempt` number, e.g. three
  distinct single-attempt sagas each numbered `attempt: 1`; `receipt-attempt-rows.txt`). Out of scope for
  the claim; recorded as a capability observation.
- `retryRecovery` is written **only** on error turns upstream (writer operates on the failed
  message's own entry, turn-recovery.ts:1015-1061). The plan's "Served turns' `retryRecovery` is ignored"
  clause for `superseded_by` is therefore vacuous on host (0 served turns carry it) but is exercised by
  fixture `F93Supersede` — correct defensive behaviour, and it matches the type (`retryRecovery` lives on
  `AssistantMessage`, types.ts:1324, so a served turn could in principle carry it).

## F. Kill-rule cross-check (read-only, no candidate attack)

- The candidate exists at `.ufo/waves/round-93/K93ExecTool/seat-route.mjs`, sha256
  `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` (= its `READY` file).
- Byte-grep for kill-(d) triggers in the candidate: `round-93` 0, `oracle93` 0, `probe93` 0, `fixtures` 0.
  Imports are `node:` builtins only.
- The candidate's field logic (`:288-289`, `:303-312`, `:358-368`) implements the plan's definitions
  literally: `=== true` for the flag; `else if (role === 'fallback')` for the revert; FIRST-init gate;
  `isPlainObject` + `Array.isArray` for chain; `turnModel(rr.supersededBy)` for the `?` rule.
- **One substantive difference from the shipped v1** that the plan's "Unchanged from v1" clause does not
  cover: the candidate computes `captured` as
  `subagentModel !== null && subagentModel !== undefined ? subagentModel : (hasDefault ? defaultModel : null)`,
  i.e. a `subagent:<seat>` row whose `model` is **not a string** falls back to the default row. Shipped v1
  (`cd7ee03d…`, `scripts/seat-route.mjs:299`) computes `hasSubagent ? subagentModel : (hasDefault ? defaultModel : null)`,
  i.e. it keeps `captured = null` in that case. The oracle's rule (`oracle93.py:69-75`, and `oracle92.py:57-65`)
  matches the **candidate**, not shipped v1: the oracle only falls back when no `subagent:` row matched at
  all — `captured = r.get("model") if isinstance(...) else None` then `if captured is None:` re-scans for the
  default row. So the oracle and shipped-v1 differ here, and the candidate follows the oracle.
  Host incidence: **0** lane files have a `subagent:<seat>` row with a non-string `model`
  (26 853 files carry a `subagent:` row; 0 with a non-string model), and the A-set comparison shows
  **0 captured differences** between shipped v1 and the candidate over the 61 real transcripts. The
  divergence is therefore unobservable on the corpus, and the candidate's choice is the one the frozen
  oracle and the frozen counter both score. Noting it for completeness; it is not a D1/D2-class
  definition divergence and it does not touch any v2 field.

## G. Confidence

- **High** on all writer-site citations: every file:line was read in the fetched tree and the three lane
  captures are byte-identical to it.
- **High** on host counts: receipts are reproducible scripts in this seat dir, deterministic seeds, counts
  only (no transcript content copied).
- **Medium** on D1's classification: the *values* are provably right; whether the inverted name is
  "kill (c) material" is a judgement the lane owner should make — kill (c) as written requires a shipped
  record contradicting a definition, and no such record exists (the candidate agrees with the oracle on
  all 221 scored records, `controls/table.txt` `ctl-positive`: HELD 221/221).
- **Medium** on D2's latency: FIRST≠LAST is unobservable on today's corpus, so whether it can be made
  observable by a future omp writer is a source-reading judgement, not a measurement.
