FIDELITY scripts/omp-global-config.mjs anchors=15 ok=6 moved=7 changed=2 gone=0

# C2 anchor fidelity — `scripts/omp-global-config.mjs` (964f443e -> 31c465f1)

Pinned: `31c465f1` = 677 L, sha256 `95c99142dbcd700210b0865ee26cf18eeb046ebf1af20a5703b7027d5d8011a4`.
Base `964f443e` = 627 L, sha256 `71668acae663eaf1b2692960cec436b80db4d68735ad00614549459ab4325ae3` (matches note).

**Anchor universe (15).** 14 `scripts/omp-global-config.mjs:N` citations, all in
`corpus/knowledge/route-resolution.md` (the only one of the three notes that line-anchors this
member), plus the member-section heading `route-resolution.md:8`. The other two notes cite by
path only: `remaining-scripts-census.md:44` (S1-S7 membership list) and
`route-probe-cluster.md:13,317,319,419,566`. Of those, `route-probe-cluster.md`'s `:40, :66`
belong to `probe-token-plan-models.mjs` (`writeVerdict` :40, `openTmpExclusive` :66), not this
member.

## Non-ok anchors

`note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement`

route-resolution.md:32 | scripts/omp-global-config.mjs:304 | globalOmpConfigPath resolves DEFAULT_CANDIDATES under HOME | moved | scripts/omp-global-config.mjs:327 | Config discovery resolved under HOME via globalOmpConfigPath at scripts/omp-global-config.mjs:327 (was :304 at 964f443e; re-anchored at 31c465f1).

route-resolution.md:41 | scripts/omp-global-config.mjs:345 | parseModelRoles (symbol-table row) | moved | scripts/omp-global-config.mjs:368 | Symbol-table row: parseModelRoles -> scripts/omp-global-config.mjs:368 (re-anchored at 31c465f1; :345 at 964f443e).

route-resolution.md:42 | scripts/omp-global-config.mjs:351 | parseAgentModelOverrides (symbol-table row) | moved | scripts/omp-global-config.mjs:374 | Symbol-table row: parseAgentModelOverrides -> scripts/omp-global-config.mjs:374 (re-anchored at 31c465f1; :351 at 964f443e).

route-resolution.md:43 | scripts/omp-global-config.mjs:367 | parseFallbackChains (symbol-table row) | moved | scripts/omp-global-config.mjs:390 | Symbol-table row: parseFallbackChains -> scripts/omp-global-config.mjs:390 (re-anchored at 31c465f1; :367 at 964f443e).

route-resolution.md:44 | scripts/omp-global-config.mjs:473 | resolveAliasFromMaps (symbol-table row) | moved | scripts/omp-global-config.mjs:496 | Symbol-table row: resolveAliasFromMaps -> scripts/omp-global-config.mjs:496 (re-anchored at 31c465f1; :473 at 964f443e).

route-resolution.md:45 | scripts/omp-global-config.mjs:503 | resolveSeatRouting (symbol-table row) | moved | scripts/omp-global-config.mjs:526 | Symbol-table row: resolveSeatRouting -> scripts/omp-global-config.mjs:526 (re-anchored at 31c465f1; :503 at 964f443e).

route-resolution.md:46 | scripts/omp-global-config.mjs:516 | resolveSeatFromMaps, claimed module-private | changed | scripts/omp-global-config.mjs:539 (now export function) | Symbol-table row: resolveSeatFromMaps is exported, not module-private -> scripts/omp-global-config.mjs:539 (re-anchored at 31c465f1).

route-resolution.md:47 | scripts/omp-global-config.mjs:546 | readGlobalSeatRouting | moved | scripts/omp-global-config.mjs:608 | Symbol-table row: readGlobalSeatRouting (reads delegated to readRoutingSnapshot) -> scripts/omp-global-config.mjs:608 (re-anchored at 31c465f1; was :546 at 964f443e).

route-resolution.md:51 | scripts/omp-global-config.mjs:503-514 | the exported seat entry is resolveSeatRouting | changed | scripts/omp-global-config.mjs:526-537 | The text-to-seat entry is resolveSeatRouting at scripts/omp-global-config.mjs:526-537; resolveSeatFromMaps is now exported too (re-anchored at 31c465f1).

## OK anchors (6)

| note line | anchor | what is at 31c465f1 |
|---|---|---|
| route-resolution.md:8 | member-section heading `## scripts/omp-global-config.mjs` | member present under `scripts/`; heading still valid |
| route-resolution.md:25 | `...mjs:25` | `const MAX_CONFIG_FILE_BYTES = 1_048_576;` — unchanged |
| route-resolution.md:28 | `...mjs:27-34` | `DEFAULT_CANDIDATES` at 27-34, same six paths, same order, `Object.freeze` |
| route-resolution.md:38 | `...mjs:27` | `export const DEFAULT_CANDIDATES` — exact |
| route-resolution.md:39 | `...mjs:36` | `export class OmpGlobalConfigError extends Error` — exact |
| route-resolution.md:40 | `...mjs:122` | `export function yamlBlock(...)` — exact (all +23/+62 shifts are below line 122) |

## Stale facts and behavior drift with no line anchor

- **Live size / sha (route-resolution.md:10-13)** is correct at its label 964f443e but stale for the
  re-census target. Proposed: "**Live size** at pinned `31c465f1`: **677 L**; sha256
  `95c99142dbcd700210b0865ee26cf18eeb046ebf1af20a5703b7027d5d8011a4` (was 627 L /
  `71668aca…` at `964f443e`)." Registry cell "735 L" (route-resolution.md:11-12) should be rewritten
  to 677, not 627, if it tracks live size.
- **Round-32 line-count history (route-resolution.md:113)** "735 → 627" remains a true historical
  statement about 964f443e; add "round 35: 627 → 677 at 31c465f1" rather than editing it.
- **Privacy claim (route-resolution.md:49-50)** "module-private (called from `resolveSeatRouting` and
  `readGlobalSeatRouting`)" is false at pinned: `resolveSeatFromMaps` is `export` at :539. Call sites
  inside the module are unchanged (:531, :623); no external importer exists yet (`git grep
  resolveSeatFromMaps 31c465f1` = those three hits only), so the privacy sentence is now merely
  inaccurate, not contradicted by a consumer.
- **Alias-enumeration contract changed (route-resolution.md:17-20):** the note says missing seat
  override fails typed `missing`. That still holds for the seat path (:540-542), but
  `readGlobalProviderAliasRoutes` (:651) now calls the NEW exported `readGlobalRoutingMaps` (:594),
  which tolerates an absent `task.agentModelOverrides` (:598-604, `missing` swallowed; malformed
  presence still throws). A modelRoles+fallbackChains-only host is now enumerable. Proposed addition:
  "`readGlobalRoutingMaps` (:594) serves alias enumeration: the seat table is optional there; seat
  resolution keeps the strict `missing` contract."
- **Reader surface split (route-resolution.md:19-20):** `readGlobalSeatRouting` keeps its exact
  contract but now obtains `{path,text,sha256}` from private `readRoutingSnapshot` (:569); snapshot
  passthrough and `O_NOFOLLOW`/fstat/size-pin behavior are unchanged (base :546-567 -> pinned
  :608-614 + :569-585). The symbol table should also list new exports `readGlobalRoutingMaps`
  (:594) and, visibility-wise, `resolveSeatFromMaps` (:539).
- **Dialect tightened (new guard, no note claim falsified):** `parseSimpleMap` now enforces one
  indentation level and fails `malformed` on a nested key ("has a nested key under …", :227-253),
  tracking `previousKey` (:236, :317). Previously a nested mapping silently flattened into sibling
  keys. The note's dialect/mechanism prose does not claim permissiveness, so nothing there needs
  correcting; a one-line mention is optional.
- **Unchanged despite the diff:** precedence, `@`-alias rejection at `resolveAliasFromMaps`
  (:496-509), orphan `fallbackChains` key fail (`malformed`, :626-634), and the single dependency
  `./ufo-credential-screen.mjs` (`containsSensitiveShape`, :23 at BOTH revisions — the member never
  imported `probe-redact.mjs`, so the cluster diagram is consistent).
- **Membership-only citations verified, no action:** `remaining-scripts-census.md:44` (member still
  in the S1-S7 list at 31c465f1); `route-probe-cluster.md:13-16,419-421,566` (S5 exclusion/reuse
  claims hold — note section exists and is intact); `route-probe-cluster.md:317,319` (probe
  kimi/models -> `readGlobalProviderAliasRoutes` edge unchanged: kimi :17, models :24 at both
  revisions; kimi additionally imports `OmpGlobalConfigError`, also true at base).

## Commands run (read-only, `/fast/scratch/kumitate-r35/src`)

1. `git diff 964f443e 31c465f1 -- scripts/omp-global-config.mjs` -> +70/-20; hunks at base 224
   (parseSimpleMap indent discipline), 292 (`previousKey = key`), 513 (`resolveSeatFromMaps`
   export), 543 (`readGlobalSeatRouting` split), 608 (`readGlobalProviderAliasRoutes` ->
   `readGlobalRoutingMaps`).
2. `git show <rev>:scripts/omp-global-config.mjs | wc -l` -> 964f443e=627, 31c465f1=677.
3. `git show <rev>:... | sha256sum` -> base `71668aca…25ae3`, pinned `95c9914…d8011a4`.
4. `git show 31c465f1:... | nl -ba | sed -n '1,80p;215,265p;285,345p;496,519p;520,677p'`
   -> every symbol line cited above; `grep -nE` symbol map at both revisions (304/345/351/367/473/
   503/516/546 at base vs 327/368/374/390/496/526/539/608 at pinned).
5. `grep -nE 'omp-global-config\.mjs:[0-9]'` over the three notes -> 14 hits, all
   route-resolution.md; `sed -n '1,107p' route-resolution.md | grep -nE '`:[0-9]'` -> none.
6. `git grep -n 'resolveSeatFromMaps|readGlobalRoutingMaps|readRoutingSnapshot' 31c465f1` and
   importer set diff base vs pinned -> module + `tests/omp-global-config.test.js:14,151` only;
   importer list identical at both revisions (9 scripts).

Tool installs/upgrades: none. Edits: none (read-only seat).
