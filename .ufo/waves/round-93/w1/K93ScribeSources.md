# K93ScribeSources — round 93 SOURCES rows

**Status: complete.** Two new rows drafted (S269 turn-recovery.ts, S270 own-work census), used-by
additions for S267/S268, gate quotes with verbatim located quotes, census receipt, validation
receipts.

## Artifacts (`.ufo/waves/round-93/K93ScribeSources/`)

| file | what | sha256 |
|---|---|---|
| `rows.md` | the two rows in append form + used-by old->new + scope gap + notes | `4584f6c9…` |
| `gate-quotes.md` | ≤25-word located quotes per new row, URL, access date 2026-11-06 | `74907e0c…` |
| `census.txt` | S270 receipt, 38 lines | `dd921b11…` |
| `sample-paths.txt` | the pinned 1500-path sample (1500 lines) | `f8b879ba…` |
| `census-pinned.txt` | re-run under `--list`, counts identical to `census.txt` | — |
| `census.py` | the census instrument (`--list` / `--emit-list`) | `6b9b084f…` |
| `census-checks.txt` | CORPUS.md § Census manual checks over the drafted copy | — |
| `refetch.txt` | re-fetch of the three pinned files, sha256 == `open/sources-fetch.txt` | — |
| `validate-draft.txt` / `validate-landed.txt` / `validate-queued.txt` / `validate-base.txt` | validator runs | — |

## Commands that matter

```
python3 census.py --emit-list sample-paths.txt        # seed 93, 1500 of 23530, 233651 rows, 0 unparsed
python3 census.py --list sample-paths.txt             # identical counts (pinned sample)
scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md
  draft (entry absent): exit 1 — 7 pre-existing W04 + exactly E11 S269, E11 S270
  landed (scratch stand-in entry): exit 0, ok
  queued variant (status queued, used-by —): exit 0, ok
  lane registry untouched: exit 0, ok
```

Key census values: `error_turns=1513`, `error_turns_with_retryRecovery_object=1415`,
`error_status_recovered=1375`, `error_status_superseded=40`, `recovered_without_supersededBy=0`,
`superseded_with_supersededBy=0`, `served_with_upstreamProvider=113` of `served_turns=55634`,
`flag_hops=941`, `revert_hops=17`, `role_fallback_rows=958`, `session_init_rows=2240`
(`resolvedModel` 2238, `retryFallback` 2237, chain list 2237), `attempt_ge2=268`, `attempt_max=7`.

## Findings

1. **S269 grounds D1/D4/D7**: the error row is persisted first (`turn-recovery.ts:938-953`) and the
   saga is written back onto it (`:1061`, `rewriteEntries` `:1070`), with `attempt` (`:1039`),
   `status` recovered/superseded (`:1038`/`:1055`) and `supersededBy` only on the recovered branch
   (`:1043-1050`). The revert hop is `:2617` — `appendModelChange(primarySelector,
   EPHEMERAL_MODEL_CHANGE_ROLE)` with the flag omitted, vs `:2261`/`:2550` passing `true`;
   `session-manager.ts:3687` shows the omitted argument defaults to `false`.
2. **Census corroborates D4 exactly**: 958 fallback-role `model_change` rows = 941 flagged + 17
   unflagged, so a reader counting only `resolvedModelIsFallback` misses the revert hops.
3. **Live population**: file count moved 23515 -> 23530 during this seat, so a seed alone does not
   reproduce a sample; the row cites a pinned path list (`sample-paths.txt`), and `--list`
   reproduces every count.
4. **Scope gap (routed, not fixed here)**: `upstreamProvider` (types.ts:1326-1333) is outside
   S268's frozen scope ("model versus upstreamModel"), and a duplicate-URL row is forbidden this
   round. Options recorded in `rows.md` § Scope gap; the retry-fields entry can cite S270 for
   presence/shape only.
5. **Plan-census delta (observation)**: plan.md reports 1486 error turns carrying `retryRecovery`
   and 1431 with a `supersededBy` object (a 55-row gap); my sample shows 1415 and 1375 with zero
   recovered-without-`supersededBy`. Not a kill event — the frozen definitions govern — but worth
   the counter scribe's eye.
6. **Landing precondition**: both rows are `mined` and name
   `corpus/knowledge/seat-route-retry-fields.md`, which does not exist yet; appending them without
   writing that entry yields E11. The `queued` + `—` variant validates clean if the entry is not
   written this round.

## Out of scope / not done

- No row added for `session-entries.ts` `SessionInitEntry` (277-300), `retry-fallback-chains.ts`
  (185-189) or `types.ts` `upstreamProvider`: duplicate-URL rows are forbidden this round and
  S267's scope does not cover `SessionInitEntry`. Quoted as supplementary anchors in
  `gate-quotes.md` § Supplementary.
- No knowledge entry written (`corpus/` is read-only for this seat).
- No candidate attack: this seat is a scribe seat; the candidate at
  `K93ExecTool/seat-route.mjs` was not inspected.
