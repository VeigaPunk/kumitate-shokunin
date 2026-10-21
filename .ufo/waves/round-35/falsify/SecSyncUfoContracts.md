ATTACK S8-member:scripts/sync-ufo-contracts.mjs verdict=partial defects=1

# Falsify — `## `scripts/sync-ufo-contracts.mjs`` (remaining-scripts-census.md:657-659)

Read at pin `31c465f15669f744848bd9f5d56191c5085670f7` (clone `/fast/scratch/kumitate-r35/src`);
base `964f443e`. No lane/upstream/note file edited. Wave-1 input: `.ufo/waves/round-35/build/FidSyncUfoContracts.md`.

## 1. Anchors — 14/14 hold (15 instances; `:2137` cited twice)

Read with `git show 31c465f1:scripts/sync-ufo-contracts.mjs | nl -ba | sed -n 'Lo,Hi p'`; all in the member's own file.

| anchor | cited symbol/behavior | observed at 31c465f1 | ok |
|---|---|---|---|
| `:22-26` | `CONTRACTS_USAGE` | `const CONTRACTS_USAGE =` + 4 usage lines | ✓ |
| `:32-37` | argv guard admits only `--check`/`--review` | `for (const arg of argv) { if (arg !== "--check" && arg !== "--review") {` | ✓ |
| `:32-36` | foreign arg → stderr, exit 64 | `process.stderr.write(…unexpected argument…)` :34; `process.exit(64)` :35 | ✓ |
| `:44-47` | `projectionRoot`/`projectionOnly` from `UFO_PROJECTION_ROOT` | exact | ✓ |
| `:2106` | raw message appended to `validationErrors` (projectionOnly branch) | `validationErrors: [...partial.validationErrors, message]` | ✓ |
| `:2132` | same, main branch | `validationErrors: [...partial.validationErrors, message]` | ✓ |
| `:2137` | `if (!report.ok) process.exitCode = 1` | exact | ✓ |
| `:415` | `PROJECT_MODEL_AUTHORITY_FIELDS` | `["modelRoutes","modelFallbacks","tokenPlan","kimiOAuth"]` | ✓ |
| `:422-437` | `assertNoProjectModelAuthority` | function spans :422-437, throws on authority fields/subfields | ✓ |
| `:16` | `readPolicy` import | `import { readPolicy } from "./prepare-ephemeral-l1.mjs";` | ✓ |
| `:19` | `writeFileAtomic` import | `import { sha256File, writeFileAtomic } from "./ufo-mission-result.mjs";` | ✓ |
| `:18` | `validateTickMachineConfig` import | `import { validateTickMachineConfig } from "./the-tick-config.mjs";` | ✓ |
| `:1225` | `fixtureLaneRoles` module-local | `const fixtureLaneRoles = new Set([`; `grep -c '^export'` = 0 | ✓ |
| `:2136` | report printed | `console.log(JSON.stringify(report, null, 2));` | ✓ |

Behavior claims: bare run syncs skill/agent mirrors + projections (usage :24; `skillTargets` :85, `agentTargets` :163, used);
`--check` never writes (`if (!checkOnly)` gates every `writeFileAtomic` — :635, :1501, :1511, :1834, :1849, :1865, :1876,
:1931, :1958 — and the stale `rmSync` :286); `--review` sets `advisory: reviewMode` (:2018) with `checkOnly` (:43); no
`--check-committed` (0 `committed` hits); no error-code taxonomy; `fixtureLaneRoles` not exported at either revision.

## 2. Population-table row — holds

`remaining-scripts-census.md:154` = `| `scripts/sync-ufo-contracts.mjs` | 2137 | tool |`;
`git show 31c465f1:scripts/sync-ufo-contracts.mjs | wc -l` → `2137` (base → `2273`); class `tool` right (shebang :1).
Population arithmetic: 60 rows; 22 suite + 30 tool + 3 shim + 4 asset + 1 doc = 60; Σ `wc -l` over the 60 = `33367` = note's "S8 members L: 33367 total".

## 3. Revision label — nothing dropped; the "kept" premise is false

Master section carried no per-section label: `git show master:corpus/knowledge/remaining-scripts-census.md | sed -n '672,674p'`
→ starts "`scripts/sync-ufo-contracts.mjs` is the mirror/contract …", ends "… after the full report JSON is printed.";
round-32 commit `4151491:…:672-674` is identical. So none existed to keep; round 35 adds `re-anchored at 31c465f1 (round 35)`.
Note-level label kept: "Round-32 re-census (2026-10-14), origin … `964f443e`" now "Historical measurement (round 32,
2026-10-14) … S8 paths at `964f443e`" (census:24-26), new pinned label at :33/:99.

## 4. Defect D1 — removed `KNOWN_ARGS` clause left no trace (`remaining-scripts-census.md:659`)

Master clause: "accepted set in `KNOWN_ARGS` (`scripts/sync-ufo-contracts.mjs:62`)". New text replaces it with
"Its inline argv guard admits only those two flags (`:32-37`)" but appends no removal trace, while the three sibling
absent symbols each got one. `KNOWN_ARGS` is absent tree-wide at pin and base:

```
$ git -C /fast/scratch/kumitate-r35/src grep -n 'KNOWN_ARGS' 31c465f1 -- .   # empty, rc=1
$ git -C /fast/scratch/kumitate-r35/src grep -n 'KNOWN_ARGS' 964f443e -- .   # empty, rc=1
```

(at 964f443e `:62` is `const sightingSurfaceDigestPattern = …`, so the master anchor was already false at its own stated
revision). Wave-1 proposed "no `KNOWN_ARGS`"; the integration omitted it. The note's practice is one trace per removed
named symbol (`ufo-drills.mjs` traces 3, `ufo-stale-watchdog.test.mjs` traces 9; 44 `(round 35: removed …)` instances).
**Minimal fix:** append at census:659: `(round 35: removed KNOWN_ARGS — absent at 31c465f1)`.

## 5. Same-class note (not counted) — `writeAtomicFile` has no trace

Master "composes … `writeAtomicFile` (`:19`)" (base `:19` is the `node:path` import; the real local `writeAtomicFile` was
`:1606`). At the pin it is gone tree-wide (`git grep -c 'writeAtomicFile' 31c465f1 -- .` → empty) and the text names the
successor `writeFileAtomic` (:19, 11 uses), so the current claim is correct; only the history trace is absent. Optional:
"local `writeAtomicFile` was removed; atomic writes import `writeFileAtomic`".

## 6. Adjacent false claim in the same round-35 edit (outside this section)

`remaining-scripts-census.md:189-191`: "The largest members by `wc -l` are `scripts/fleet-dispatcher.test.mjs` (2852 L),
`scripts/sync-ufo-contracts.mjs` (2137 L) and `scripts/ufo-state-retention.mjs` (1924 L)." False at the pin —
`scripts/fleet-ledger-rotate.test.mjs` is 2325 L, the true second largest, and is omitted (`ufo-state-retention.mjs` is
fourth). Measured over the 60 table rows with `git show 31c465f1:<member> | wc -l`:

```
  2852 scripts/fleet-dispatcher.test.mjs
  2325 scripts/fleet-ledger-rotate.test.mjs
  2137 scripts/sync-ufo-contracts.mjs
  1924 scripts/ufo-state-retention.mjs
  1911 scripts/ufo-swarm-wave.test.mjs
```

Master had the same ranking error at base (2325 > 2273); round 35 updated the numbers without fixing the ranking.
**Minimal fix:** "(2852 L), `scripts/fleet-ledger-rotate.test.mjs` (2325 L) and `scripts/sync-ufo-contracts.mjs` (2137 L)".

## 7. Fidelity nuance on the three traces that exist

`--check-committed`, `CONTRACT_ERROR_CODES`, `unclassified_contract_failure` are truly absent at 31c465f1, so the traces
are true as written; all three are also absent tree-wide at 964f443e (same method, 0 hits), i.e. the removed clauses were
false at the note's own stated revision, not casualties of the 63→60 move. Optional: "absent at 964f443e and 31c465f1".

## Tooling

None installed/upgraded; no package transaction, service or host-state change. Read-only `git show`/`git grep`/`sed`/`wc`
against `/fast/scratch/kumitate-r35/src`, plus `awk`/`fold` reads of the lane note. Scratch: `/fast/scratch/kumitate-r35/w/SecSyncUfoContracts/`.

## Remaining unknown

[INFERENCE] Whether the L1's trace rule covers "changed-form" clauses (`KNOWN_ARGS` → inline guard) as well as outright
absent symbols; if not, D1 is a convention nit. All anchors, the line count, and every behavior claim in the section are
byte-verified and none is false.
