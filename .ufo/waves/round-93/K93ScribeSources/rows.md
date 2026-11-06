# Round 93 — SOURCES rows (draft, seat K93ScribeSources)

Append target: the end of the `## Registry` table in `kumitate-shokunin/corpus/SOURCES.md`
(after the last row, S268). Two new rows: S269 (turn-recovery.ts, new URL) and S270 (own-work
census run in this seat). No row is added for a URL already registered as S266, S267 or S268
(see "used-by additions" below).

Landing precondition: both rows name `corpus/knowledge/seat-route-retry-fields.md` in `used-by`
and are `mined`, so they must be appended **together with** that knowledge entry, else
`validate` prints E11 (used-by path missing on disk). If the entry is not written this round,
append them as `queued` with `used-by` `—` instead; that variant validates clean (receipt
`validate-queued.txt`).

Opened/read: 2026-11-06. Upstream pin for both code rows:
`can1357/oh-my-pi` @ `79fa222e8390aed3494f4bc6746814e6c74c21cf`.

## Rows

```markdown
| S269 | oh-my-pi packages/coding-agent/src/session/turn-recovery.ts — https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/turn-recovery.ts | code | A | the writer side of a seat transcript's retry saga: a terminal empty error turn persisted as its own row, retryRecovery written back onto that row (status recovered or superseded, attempt, supersededBy provider and model), and the revert-to-primary model_change hop that reuses the fallback role with no flag | lines 938-953 (#persistTerminalEmptyErrorTurn), 1034-1070 (#recordPendingRetryError: status 1038 and 1055, attempt 1039, supersededBy 1043-1050, assignment 1061, rewriteEntries 1070), 2261 and 2550 (fallback hops pass the flag true), 2617 (revert hop omits it); capture .ufo/waves/round-93/open/turn-recovery.ts, sha256 1059a80e5dc47cf9c23789974aa1ddd78207795d9a0537c95c3f2e2211a4eddf; read 2026-11-06 | Each failed attempt is persisted as its own error row and a later retry writes retryRecovery onto it — status recovered carries supersededBy provider and model, status superseded does not — so error rows count attempts, not requests, and the revert hop is role fallback with no flag | mined | 2026-11-06 | on-release | corpus/knowledge/seat-route-retry-fields.md |
| S270 | omp seat-transcript routing-field census — own-work: python3 .ufo/waves/round-93/K93ScribeSources/census.py --list sample-paths.txt (seeded seed-93 draw of 1500 files from ~/.omp/agent/sessions/-Projects-shokunin/*/*.jsonl, population 23530, drawn 2026-11-06 and pinned as a path list) | own-work | A | which routing and retry fields this host's omp seat transcripts actually carry, by presence and shape only: error rows, retryRecovery status, supersededBy, upstreamProvider, model_change flags, session_init resolvedModel and retryFallback chain, attempt numbers | stdout .ufo/waves/round-93/K93ScribeSources/census.txt lines 12-38 (population sha256 a038e949dc93e607fa6dc257ba90c3421738e2df1ab2c3589868c9ca0a81bd1d, sample list sha256 f8b879baaed41954c8599912989611e62d668d5624039d51a30b781c1a95dd3c, receipt sha256 dd921b11510a085aefdbe4b92f68135ec2c3f738b0d6f122960be82a529b2f6f); 1500 files, 233651 rows, 0 unparsed; read 2026-11-06 | Of 1513 error turns 1415 carry a retryRecovery object (1375 recovered, 40 superseded, supersededBy only on the recovered ones) with attempt numbers up to 7; 113 of 55634 served turns carry upstreamProvider; 958 fallback-role model_change rows split into 941 flagged and 17 unflagged | mined | 2026-11-06 | 30d | corpus/knowledge/seat-route-retry-fields.md |
```

## used-by additions (existing rows, old -> new; the only cells that may change in place)

| id | old used-by | new used-by |
|---|---|---|
| S267 | corpus/knowledge/seat-route-from-session-transcripts.md | corpus/knowledge/seat-route-from-session-transcripts.md, corpus/knowledge/seat-route-retry-fields.md |
| S268 | corpus/knowledge/seat-route-from-session-transcripts.md | corpus/knowledge/seat-route-from-session-transcripts.md, corpus/knowledge/seat-route-retry-fields.md |

S266 (docs/session.md) is left unchanged: the retry-fields entry's new claims are code-side
(writer, entry fields, turn fields). If the entry also cites session.md for the ephemeral
`fallback` role, add `corpus/knowledge/seat-route-retry-fields.md` to S266 the same way.

## Scope gap to resolve at integration (not a row I may add)

`upstreamProvider` — the `upstream` field of the v2 record — is `packages/ai/src/types.ts:1326-1333`.
S268's frozen `scope` names "model versus upstreamModel", not `upstreamProvider`, and the
assignment forbids a duplicate-URL row for S268. So the retry-fields entry cannot cite S268 for
that field's meaning without stretching S268's scope. Options, in order of cost:
1. cite S270 for the field's *presence and shape* (it observes 113 served turns carry it, value
   `Stealth`) and keep the semantic claim out of the entry;
2. open a scoped row for types.ts `#L1326-L1333` at the same pin (a W04 same-URL warning, which
   this registry already carries seven of) — needs the round's scribe, not this seat.
Recorded, with the quote, in `gate-quotes.md` § Supplementary.

## Notes on the census row (S270)

- **The population is live.** Between two runs of this seat the file count moved 23515 -> 23530
  (other seats are writing transcripts now), so a seed alone does not reproduce a sample. The row
  therefore cites a *pinned* sample: `sample-paths.txt` (1500 relative paths, sha256
  `f8b879ba…`), and `census.py --list sample-paths.txt` reproduces every count byte-identically
  (`census-pinned.txt`). Files may still grow after the pin; the *set* is what is pinned.
- **One number differs from the plan's pre-data census** (plan.md § C1: 1486 error turns carry
  `retryRecovery`, `supersededBy` an object in 1431). My sample has 1415 and 1375 — and 1375
  recovered rows with 0 recovered-without-`supersededBy`, i.e. exact equality, which is what the
  writer's two branches predict. A 55-row gap between "carries retryRecovery" and "has
  supersededBy" in the plan's sample is not reproduced here; it would mean recovered rows written
  without `supersededBy` (older omp build or a different counting rule). Routed as an observation
  for the counter scribe — the frozen definitions, not this census, govern the record.

## Validation receipts

All runs: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch copy>`,
where the scratch copy is the lane's `corpus/SOURCES.md` with these two rows inserted after S268
(line 223) and the rest of the tree reached through symlinks into the lane (read-only).

- `validate-draft.txt` — rows as drafted, knowledge entry absent: **exit 1**, the seven
  pre-existing W04 warnings and exactly two E11 lines (S269, S270), no other code. E11 is the
  landing precondition above.
- `validate-landed.txt` — same copy plus a scratch stand-in `corpus/knowledge/seat-route-retry-fields.md`:
  **exit 0**, `ok`. The stand-in is a scratch file proving E11 is the only finding; it is not
  evidence that the knowledge entry exists.
- `validate-queued.txt` — the `queued` + `—` variant: **exit 0**, `ok`.
- `validate-base.txt` — the lane's own registry, untouched: **exit 0**, `ok` (so every finding in
  `validate-draft.txt` other than my two E11 lines is pre-existing).
- `census-checks.txt` — the CORPUS.md § Census manual checks over the drafted copy: 208 rows,
  malformed 0, no duplicate ids, no enum violations, 11 cells in each new row.
- `refetch.txt` — re-download of the three pinned files, sha256 equal to
  `.ufo/waves/round-93/open/sources-fetch.txt` and `cmp` identical to the `open/` captures.
