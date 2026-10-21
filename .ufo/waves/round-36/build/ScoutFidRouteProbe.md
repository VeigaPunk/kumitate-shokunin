FID-ROUTEPROBE anchors=80 elsewhere=26 absent=5 dead=1 noid=22

Axis: operability. Pin verified: `/fast/scratch/kumitate-r36/src` HEAD `31c465f15669f744848bd9f5d56191c5085670f7`.

## Scope and result

The FIDELITY v1 section walker is registry-backed (`scripts/claims-check.mjs:463`); current S7 registry names only `corpus/knowledge/route-probe-cluster.md` (`SCORECARD.md:131`). Its six member sections yielded anchors 26 + 8 + 14 + 11 + 9 + 12 = 80. Counts match `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt:12` and `fidelity-reference.txt:12`: nonok=31 (elsewhere+absent); dead/noid are diagnostics, not gated.

`corpus/knowledge/live-surface-probe.md` contributes **0 FIDELITY v1 anchors**: it has no `## ` heading whose first backticked token resolves to an origin file (its headings are at lines 23, 53, 96, 120, 146, 199, 209); the current S7 row does not select it. Its Round-35 notice says 18 citations were stale (`live-surface-probe.md:3-10`), but those prose citations are outside the frozen v1 member-section scope, not a repair list that this gate can consume. This is a scope gap if the intent is to gate those citations; do not silently fold them into this v1 count.

All source paths below use `src = /fast/scratch/kumitate-r36/src`, read-only at the pin. `elsewhere` rows identify the paired backtick selected by v1's right-first adjacency rule; where that differs from the note's apparent intent, the repair must rephrase/re-pair as well as update the line.

## Every nonok anchor — route-probe-cluster.md

| Note location | Current anchor / paired symbol | Repair evidence at pin |
|---|---|---|
| `corpus/knowledge/route-probe-cluster.md:100` | `scripts/probe-ufo-route-health.mjs:2-3` / `Authorization` — absent | The route-health header says “OMP as the credential authority” (`src/scripts/probe-ufo-route-health.mjs:2-7`); exact `Authorization` is not in this member. Exact search found it only in the separate `probe-token-plan-models.mjs:4` comment. No route-health rename/removal is evidenced: this is prose, not a source symbol. Rephrase to a verbatim own-file token or drop the assertion. |
| `...route-probe-cluster.md:103` | `:1080` / `persistState` — elsewhere | Re-anchor to definition `src/scripts/probe-ufo-route-health.mjs:1073`. |
| `...route-probe-cluster.md:107` | `:1164` / `main` — elsewhere | Re-anchor to `src/scripts/probe-ufo-route-health.mjs:1157`. |
| `...route-probe-cluster.md:107` | `:103` / `usage` — elsewhere | The v1 pair is `usage`, not the preceding `parseArgs`; `usage` is at `src/scripts/probe-ufo-route-health.mjs:101`, while `parseArgs` starts at `:107`. Rephrase/separate the neighbor and pair the intended symbol with `:107`, or cite `usage` at `:101`. |
| `...route-probe-cluster.md:108` | `:97` / `--help` — elsewhere | This anchor pairs with `--help`; its current code is `src/scripts/probe-ufo-route-health.mjs:108`. |
| `...route-probe-cluster.md:109` | `:678` / `spawnCollect("omp", [...])` — absent | This ellipsis expression is not a literal source symbol. The function is `spawnCollect` at `src/scripts/probe-ufo-route-health.mjs:669`; the multiline call begins at `:804`. No rename/removal: reword to the actual symbol/call and cite `:804` (or definition `:669`). |
| `...route-probe-cluster.md:110` | `:61` / `PROBE_CONCURRENCY = 8` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:65`. |
| `...route-probe-cluster.md:111` | `:784` / `mapPool` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:775`. |
| `...route-probe-cluster.md:112` | `:39` / `MAX_BUFFER` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:44`. |
| `...route-probe-cluster.md:112` | `:40` / `MAX_ROUTES` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:45`. |
| `...route-probe-cluster.md:113` | `:41` / `FAILURE_CLASSES` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:49`. |
| `...route-probe-cluster.md:113` | `:45` / `classifyFailure` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:497`. |
| `...route-probe-cluster.md:114` | `:200` / `ROUTE_TOKEN` — absent | This is an upstream removal, not a rename: commit `3ddd6b3` deletes `ROUTE_TOKEN` and `assertRouteToken`, imports `parseRoute as parseRouteGrammar`, and delegates parsing. At the pin the import is `src/scripts/probe-ufo-route-health.mjs:30-33`, call `:215-224`; use `parseRouteGrammar`/the shared grammar instead. |
| `...route-probe-cluster.md:115` | `:939` / `assertNoSecrets` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:932`. |
| `...route-probe-cluster.md:116` | `:904` / `session_truncated` — elsewhere | Current retag: `src/scripts/probe-ufo-route-health.mjs:897`. |
| `...route-probe-cluster.md:117` | `:1015` / `interpretPersistedHealth` — elsewhere | Right-first pairing selects the later symbol, whose definition is `src/scripts/probe-ufo-route-health.mjs:1030`. If intended to cite `interpretRouteHealth`, separate the following token and cite its definition at `:1008`. |
| `...route-probe-cluster.md:117` | `:1037` / `interpretPersistedHealth` — elsewhere | Current definition: `src/scripts/probe-ufo-route-health.mjs:1030`. |
| `...route-probe-cluster.md:119` | `:1185` / `!ok ? 2 : healthy ? 0 : 3` — absent | Not a renamed identifier; this is an abbreviated expression. Pinned code is `process.exit(!payload.ok ? 2 : payload.healthy ? 0 : 3)` at `src/scripts/probe-ufo-route-health.mjs:1178`; update the span and cite `:1178`. |
| `...route-probe-cluster.md:129` | `:23` / `runOmpCatalog` — elsewhere | Current definition: `src/scripts/probe-token-plan-shared.mjs:51`. |
| `...route-probe-cluster.md:148` | `:100` / `probeTarget` — elsewhere | Current definition: `src/scripts/probe-token-plan-kimi.mjs:39`. |
| `...route-probe-cluster.md:152` | `:123` / `available ? 0 : 2` — elsewhere | The adjacent right span selects the exit expression at `src/scripts/probe-token-plan-kimi.mjs:140`. If the intended claim is availability aggregation, re-pair to exact `targets.some` at `:123` and separate the following exit-expression token. |
| `...route-probe-cluster.md:160` | `:40` / `VERDICT_PATH` — elsewhere | Current definition: `src/scripts/probe-token-plan-models.mjs:35`. |
| `...route-probe-cluster.md:163` | `:66` / `O_EXCL` — elsewhere | Current flag use: `src/scripts/probe-token-plan-models.mjs:67`. |
| `...route-probe-cluster.md:169` | `:223` / `targets.every(...)` — absent | The ellipsis form is not source text; current exact code is `targets.every(({ route }) => chatResults[route]?.served === true)` at `src/scripts/probe-token-plan-models.mjs:223`. Replace the abbreviation with the exact source token/expression; no rename/removal is evidenced. |
| `...route-probe-cluster.md:178` | `:33` / `redact` — elsewhere | Right-first pairing selects `redact` at `src/scripts/probe-redact.mjs:67`. The cited line `:33` itself is `COMPILED_REDACT_PATTERNS`; rephrase/reorder so that symbol is the adjacent pair, or cite `redact` at `:67`. |
| `...route-probe-cluster.md:192` | `:35` / `MODE` — elsewhere | Current definition: `src/scripts/fake-omp.mjs:29`. |
| `...route-probe-cluster.md:193` | `:31` / `CATALOG` — elsewhere | Current definition: `src/scripts/fake-omp.mjs:47`. |
| `...route-probe-cluster.md:195` | `:60` / `SUCCESS_MODES` — elsewhere | Current definition: `src/scripts/fake-omp.mjs:58`. |
| `...route-probe-cluster.md:196` | `:95` / `emitRaw` — elsewhere | Current definition: `src/scripts/fake-omp.mjs:98`. |
| `...route-probe-cluster.md:196` | `:98` / `flushSession` — elsewhere | Current definition: `src/scripts/fake-omp.mjs:174`. |
| `...route-probe-cluster.md:197` | `:177` / `--session-dir` — elsewhere | Current use: `src/scripts/fake-omp.mjs:175`. |

## Ungated diagnostics

- `noid=22` (no eligible adjacent symbol; frozen contract says these are not repaired or ratcheted): `route-probe-cluster.md:101 :6-7; :102 :4-5; :104 :1117; :105 :63-65; :109 :813; :114 :506; :118 :1174; :129 scripts/probe-token-plan-shared.mjs:19-20 and :22; :142 scripts/probe-token-plan-kimi.mjs:2; :143 :3-4 and :57-58; :145 :28; :148 :89-90; :151 :119; :159 scripts/probe-token-plan-models.mjs:2-4; :166 :81; :168 :196; :169 :221; :177 scripts/probe-redact.mjs:8; :181 :75; :191 scripts/fake-omp.mjs:10`.
- `dead=1`: `route-probe-cluster.md:120 :1191` exceeds pinned route-health EOF `:1188`; fatal schema is now at `src/scripts/probe-ufo-route-health.mjs:1184`. Dead is diagnostic only; if refreshed, cite `:1184`.

## Evidence and limits

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- In-memory `probeSections({self, src})` on the lane returned S7 only with six sections and anchor counts `26, 8, 14, 11, 9, 12`; it returned no `live-surface-probe.md` section. The live-note headings at `:23,53,96,120,146,199,209` contain no path token.
- `git show --unified=3 3ddd6b3 -- scripts/probe-ufo-route-health.mjs scripts/omp-route-grammar.mjs` → removes the `ROUTE_TOKEN` regex and `assertRouteToken`; adds the shared parser import and delegation. Current pinned locations are cited above.
- Exact-token search across route-health and token-plan-models returned only `probe-token-plan-models.mjs:4` for `Authorization`; it returned no hits for the other abbreviated absent spans. Pinned source reads establish their actual replacement locations above. The `Authorization` source absence is not evidence of an upstream rename.
- No `lsp` device/server is mounted in the available tool inventory; findings use literal pinned source reads and the pinned diff, not semantic-reference claims. No source files were written; no tests/build/lint were run.
