FIDELITY scripts/probe-ufo-route-health.mjs anchors=68 ok=3 moved=57 changed=2 gone=6

Member: `scripts/probe-ufo-route-health.mjs`, diff 964f443e..31c465f1 = +25/−32 (1195→1188 L). Diff summary: (1) header/usage route shape becomes `provider/model[:effort]` — effort OPTIONAL; (2) new import of `scripts/omp-route-grammar.mjs` (`RouteGrammarError`, `parseRoute as parseRouteGrammar`) at pinned :30-33; (3) base `ROUTE_TOKEN` regex (:200), its comment (:194-199) and `assertRouteToken` (:211-215) DELETED; `parseRoute` (:217-234) now delegates to `parseRouteGrammar(value, { allowEffortless: true, label: "route" })` (pinned :215-225); (4) `--thinking route.effort` becomes conditional — omitted when `route.effort === null` (pinned :817-819); (5) everything below the rework shifts −4 (≥:30), −13+4=−9 net (≥:236), −7 (≥:827, incl. +2 from the `--thinking` hunk).

Anchor universe counted (anchors=68): 67 line-cites + 1 member-section heading, all in `route-probe-cluster.md` live sections (the round-12 ledger fence :492-546 is excluded — the note itself declares it fenced/historical, "never re-parsed as new citations"; the census note carries NO `:N` anchor for this member, only 2 membership mentions). ok=3: heading :85; `:2-3` (note:91); `:6-7` (note:92) — all three claims verified verbatim-identical at 31c465f1 :2-3/:6-7.

## Moved anchors (57 cites, grouped by anchor; target = 31c465f1)

| Cited | note:line sites (cluster) | Symbol/claim | Correct at 31c465f1 | Replacement wording (keep label, re-anchored at 31c465f1) |
|---|---|---|---|---|
| :63-65 | 27, 96, 167, 311, 314, 327 | redaction PARITY comment block | 67-71 | standalone parity copy of ./probe-redact.mjs at 964f443e:63-65, re-anchored at 31c465f1:67-71 |
| :1080 | 78, 94, 311, 314 | persistState (inlined fsync+rename) | 1073 | inlined persistState at 964f443e:1080, re-anchored at 31c465f1:1073 |
| :1117 | 78, 95, 311, 314 | pid-timestamp tmp file | 1110 | pid-timestamp tmp at 964f443e:1117, re-anchored at 31c465f1:1110 |
| :1164 | 98 | top-level main entry | 1157 | top-level main at 964f443e:1164, re-anchored at 31c465f1:1157 |
| :103 | 98 | parseArgs single argv walk | 107 | parseArgs at 964f443e:103, re-anchored at 31c465f1:107 |
| :97 | 99 | usage prints stderr, exit 2 | 101 | usage exits 2 at 964f443e:97, re-anchored at 31c465f1:101 |
| :678 | 100, 300, 342 | spawnCollect definition | 669 | spawnCollect at 964f443e:678, re-anchored at 31c465f1:669 |
| :813 | 100, 300 | spawnCollect("omp", ...) call site | 804 | spawnCollect("omp") call site at 964f443e:813, re-anchored at 31c465f1:804 |
| :61 | 101, 337 | PROBE_CONCURRENCY = 8 | 65 | PROBE_CONCURRENCY = 8 at 964f443e:61, re-anchored at 31c465f1:65 |
| :784 | 102, 337, 343 | order-preserving mapPool | 775 | mapPool at 964f443e:784, re-anchored at 31c465f1:775 |
| :39 | 103, 335 | DEFAULT_TIMEOUT_MS 240_000 | 43 | DEFAULT_TIMEOUT_MS at 964f443e:39, re-anchored at 31c465f1:43 |
| :40 | 103, 338 | MAX_BUFFER 8 MiB | 44 | MAX_BUFFER at 964f443e:40, re-anchored at 31c465f1:44 |
| :41 | 103, 336 | MAX_ROUTES 16 | 45 | MAX_ROUTES at 964f443e:41, re-anchored at 31c465f1:45 |
| :45 | 104 | FAILURE_CLASSES taxonomy | 49 | FAILURE_CLASSES at 964f443e:45, re-anchored at 31c465f1:49 |
| :506 | 105 | classifyFailure definition | 497 | classifyFailure at 964f443e:506, re-anchored at 31c465f1:497 |
| :939 | 106 | assertNoSecrets emit gate | 932 | assertNoSecrets at 964f443e:939, re-anchored at 31c465f1:932 |
| :904 | 107, 217 | session_truncated retag | 897 | session_truncated retag at 964f443e:904, re-anchored at 31c465f1:897 |
| :1015 | 108, 357 | interpretRouteHealth | 1008 | interpretRouteHealth at 964f443e:1015, re-anchored at 31c465f1:1008 |
| :1037 | 108 | interpretPersistedHealth | 1030 | interpretPersistedHealth at 964f443e:1037, re-anchored at 31c465f1:1030 |
| :1174 | 109 | healthy = served && failureClass null | 1167 | healthy rollup at 964f443e:1174, re-anchored at 31c465f1:1167 |
| :1185 | 110 | exit !ok?2:healthy?0:3 | 1178 | exit mapping at 964f443e:1185, re-anchored at 31c465f1:1178 |
| :1191 | 111 | fatal envelope schema literal | 1184 | ufo-route-health-error-v1 at 964f443e:1191, re-anchored at 31c465f1:1184 |
| :994 | 205, 235 | --state symlink walk | 983 | --state symlink walk at 964f443e:994, re-anchored at 31c465f1:983 |
| :47 | 205 | MAX_ROUTES 16 (r13 vintage) | 45 | MAX_ROUTES=16, round-13 :47 re-anchored at 31c465f1:45 |
| :45 | 206 | DEFAULT_TIMEOUT_MS 240_000 (r13 vintage) | 43 | DEFAULT_TIMEOUT_MS, round-13 :45 re-anchored at 31c465f1:43 |
| :96 | 207 | parseArgs single argv walk (r13 vintage) | 107 | parseArgs, round-13 :96 re-anchored at 31c465f1:107 |
| :87 | 207 | usage stderr exit 2 (r13 vintage) | 101 | usage exit 2, round-13 :87 re-anchored at 31c465f1:101 |
| :93 | 207 | usage process.exit(2) (r13 vintage) | 104 | usage exit(2), round-13 :93 re-anchored at 31c465f1:104 |
| :99 | 208 | --help exits 0 (r13 vintage) | 110 | --help exit 0, round-13 :99 re-anchored at 31c465f1:110 |
| :51-62 | 212 | FAILURE_CLASSES list block | 49-60 | FAILURE_CLASSES at 964f443e:51-62, re-anchored at 31c465f1:49-60 |
| :507 | 213 | classifyFailure (r13 vintage) | 497 | classifyFailure, round-13 :507 re-anchored at 31c465f1:497 |
| :1164 | 219 | interpretRouteHealth (r13 vintage) | 1008 | interpretRouteHealth, round-13 :1164 re-anchored at 31c465f1:1008 |
| :1186 | 220 | interpretPersistedHealth (r13 vintage) | 1030 | interpretPersistedHealth, round-13 :1186 re-anchored at 31c465f1:1030 |
| :1166 | 221 | invalid_validity_window (r13 vintage) | 1010 | invalid_validity_window, round-13 :1166 re-anchored at 31c465f1:1010 |
| :1169 | 222 | expired/stale reason (r13 vintage) | 1013 | expired reason, round-13 :1169 re-anchored at 31c465f1:1013 |
| :1175 | 222 | unknown_served (r13 vintage) | 1019 | unknown_served, round-13 :1175 re-anchored at 31c465f1:1019 |
| :1207 | 224 | malformed_records (r13 vintage) | 1051 | malformed_records, round-13 :1207 re-anchored at 31c465f1:1051 |
| :1217 | 226 | sweep-level status rollup (r13 vintage) | 1061 | status rollup, round-13 :1217 re-anchored at 31c465f1:1061 |
| :1224 | 227 | rollup reason triple (r13 vintage) | 1068 | rollup reasons, round-13 :1224 re-anchored at 31c465f1:1068 |
| :1266 | 239 | credential_shaped_state write arm | 1107-1109 | credential-shaped state refusal at 964f443e:1266, re-anchored at 31c465f1:1107-1109 |
| :943 | 240 | assertNoSecrets (r13 vintage) | 932 | assertNoSecrets, round-13 :943 re-anchored at 31c465f1:932 |
| :950 | 242 | refusing-to-emit message (r13 vintage) | 939 | emit-gate message, round-13 :950 re-anchored at 31c465f1:939 |
| :1355-1363 | 244 | fatal envelope catch block (r13 vintage) | 1174-1181 | fatal envelope, round-13 :1355-1363 re-anchored at 31c465f1:1174-1181 |
| :1358 | 245 | envelope schema literal (r13 vintage) | 1184 | schema literal, round-13 :1358 re-anchored at 31c465f1:1184 |
| :1363 | 247 | fatal exit 1 (r13 vintage) | 1181 | fatal exit 1, round-13 :1363 re-anchored at 31c465f1:1181 |

Note: the r13-vintage rows (marked) were already stale at 964f443e; their claims still hold at the pinned targets, so they are moved, not gone.

## Changed anchors (2) — line exists but described behavior changed

- route-probe-cluster.md:93 | `:4-5` | `--state persists …` header describes route shape | changed | 31c465f1:4 (and PROBE_USAGE :99) | Header now reads `provider/model[:effort]`: effort optional; keep 964f443e label, add "effort suffix optional, re-anchored at 31c465f1:4".
- route-probe-cluster.md:204 | `:203-208` | route charset comment: "every component must match letters/digits/./_/-" | changed | 31c465f1:198-204 | Comment replaced by shared omp-route-grammar authority; effort optional; re-anchored at 31c465f1:198-204.

## Gone anchors (6)

Diff-deleted (ROUTE_TOKEN family):
- route-probe-cluster.md:105 | `:200` | argv token class `ROUTE_TOKEN` | gone | — | Delete `ROUTE_TOKEN` (`:200`) claim: token validation moved to scripts/omp-route-grammar.mjs, re-anchored at 31c465f1:215-225.
- route-probe-cluster.md:201-202 | `:209` + `ROUTE_TOKEN` symbol | token-class validation of route string | gone | 31c465f1:215-225 | Replace with: route validated by parseRouteGrammar (allowEffortless), re-anchored at 31c465f1:215-225.

Already absent at 964f443e (round-13 vintage, pre-existing stale cites — NOT caused by this diff):
- route-probe-cluster.md:230 | `:1021` | STRANDED_OUTCOMES launch telemetry | gone | — | Strike launch-telemetry sentence: no STRANDED_OUTCOMES at 964f443e/31c465f1; re-anchored at 31c465f1: (none).
- route-probe-cluster.md:231 | `:1102` | stranded_record_outcome_invalid | gone | — | Strike: symbol absent at both pinned revisions; re-anchored at 31c465f1: (none).
- route-probe-cluster.md:233 | `:79` | RouteHealthError class | gone | — | Strike: RouteHealthError absent at both pinned revisions (plain Error/usage); re-anchored at 31c465f1: (none).
- route-probe-cluster.md:234 | `:74` | stable snake_case code comment | gone | — | Strike: comment absent at both pinned revisions; re-anchored at 31c465f1: (none).

## Changed claims without a `:N` anchor (flagged per assignment)

- cluster:61 + :87 + :358 — "1195 L"/"file is 1195 L": file is 1188 L at 31c465f1.
- cluster:61 + :88 + :198 — `provider/model:effort` phrasing: effort suffix now OPTIONAL (`provider/model[:effort]`); effortless routes are probed without `--thinking` (31c465f1:817-819); `--launch <launch.json>` appears in the argv-surface row (note:198) but exists in NEITHER pinned revision (0 grep hits both) — stale row.
- cluster:96-97 + :327-329 — "the origin suite can stage this one file alone": FALSE at 31c465f1 — tests/route-probes.test.js now stages route-health AND omp-route-grammar.mjs (:35-36, :66-67).
- cluster:311-314 import graph — still says "no atomic-write" (true) but omits the new `omp-route-grammar.mjs` import edge (31c465f1:30-33).
- Behavior change with no live anchor: probeRoute's omp argv now omits `--thinking` for effort-less hops (31c465f1:817-819); no note row describes it, so nothing to re-anchor — flag for the re-census writer.

## Census note (`remaining-scripts-census.md`) — no `:N` anchors for this member

- census:49 — member listed in the S1–S7 live list: still present at 31c465f1 → ok.
- census:182 — "The S7 cluster (live) — probe-ufo-route-health.mjs, … (6 live)": 6 probe-family files still present at 31c465f1 (ls-tree verified) → ok. Observation: scripts/ gained `scripts/omp-route-grammar.mjs` at 31c465f1 (new shared authority, imported by 8 scripts + 3 tests); S7 membership itself is unchanged.

## Commands run (all via the pinned read-only clone)

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/probe-ufo-route-health.mjs` → +25/−32, hunks as summarized above.
- `git -C /fast/scratch/kumitate-r35/src show {964f443e,31c465f1}:scripts/probe-ufo-route-health.mjs | cat -n` → full dumps (1195 / 1188 L); every moved target verified against the pinned dump, plus a mechanical grep pass of ~55 cited symbols pinning base/pinned line numbers (e.g. persistState 1080→1073, spawnCollect 678→669, interpretRouteHealth 1015→1008, PROBE_USAGE 94→99, ROUTE_TOKEN 200/209→ABSENT, STRANDED_OUTCOMES/MAX_LAUNCH_BYTES/RouteHealthError→ABSENT both).
- `git -C /fast/scratch/kumitate-r35/src ls-tree --name-only {964f443e,31c465f1} scripts/ | grep -E 'probe|fake-omp|atomic-write|omp-route-grammar'` → pinned adds `scripts/omp-route-grammar.mjs`; atomic-write absent both.
- `git show 31c465f1:scripts/omp-route-grammar.mjs` (207 L) → exports parseRoute(route,{allowEffortless,label}) returning `{requested, provider, model, effort: string|null, resolved}`; EFFORTS whitelist low..max; ROUTE_COMPONENT_PATTERN `^[A-Za-z0-9_.-]+$` (allows org-prefixed model ids, refuses `.`/`..`).
- `git grep -l omp-route-grammar 31c465f1 -- scripts/ tests/` → 8 scripts + 3 tests import it.
- `git show 31c465f1:tests/route-probes.test.js | grep -n copyFileSync` → stages omp-route-grammar.mjs beside route-health (:35-36, :66-67).
- Note-side: grep for `probe-ufo-route-health` in both notes; raw line reads to pin note:line numbers (cluster 27, 61, 78, 85-111, 167, 198-247, 300, 311-343, 357-358; census 49, 182).

[INFERENCE] mark: none needed — every status above was observed against the two pinned revisions; the only unobserved item is `--launch`'s history before 964f443e (out of scope; absent at both pinned revisions is the operative fact).
