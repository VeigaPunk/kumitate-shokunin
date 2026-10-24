# ExecSourcesGate — consolidated evidence (round 57)

## Revision under test
- lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
- jj working-copy commit `2909579f` (change `nuxonxru`), parent `8c6f5b01`
  (`round-57: idempotence at bookkeeping tip c42afe1c`), plan R1 `f0dc6d11`.
- `jj diff --name-only -r @` → `.ufo/waves/round-57/w1/swarm-registry.json` (only).
  Every gate input (`scripts/`, `corpus/SOURCES.md`, `corpus/knowledge/`, `.ufo/pins/`)
  is therefore byte-identical to parent `8c6f5b01`.

## Required runs (bare argv, lane root cwd), stdout verbatim
| script | exit | CLEAN line |
|---|---|---|
| `node scripts/sources-check.mjs` | 0 | `SOURCES_CHECK: CLEAN (rows=120 tiers=A:99,B:13,C:8 status=queued:12,mined:88,rejected:20 entries_with_source=14 legacy=38)` (preceded by `SOURCES  info  LEGACY_NO_HEADER  count=38`) |
| `node scripts/source-capture.mjs` | 0 | `SOURCE_CAPTURE: CLEAN captures=13 exemptions=107` |
| `node scripts/source-dupes.mjs` | 0 | `SOURCE_DUPES: CLEAN groups=4 known=4` |
| `node scripts/counter-pins.mjs` | 0 | `COUNTER_PINS: CLEAN pins=14` |

All four stderr files are 0 bytes. Raw captures: `*.stdout.txt`, `*.stderr.txt`.

## Additional modes
- `sources-check --strict` → identical stdout, exit 0 (no warning-class findings exist to promote).
- `sources-check --json` → `{"verdict":"CLEAN","exitCode":0,"findings":[],"totals":{"errors":0,"warnings":0},...}`
  (`sources-check.json.txt`).

## Selftests at this revision (all exit 0)
- `SOURCES_SELFTEST: 46/46 pass` + `VERDICT: PASS`
- `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` + `VERDICT: PASS`
- `SOURCE_DUPES_SELFTEST: PASS (12/12)` + `VERDICT: PASS`
- `COUNTER_PINS_SELFTEST: PASS (11/11)` + `VERDICT: PASS`

## Independent recomputation
- counter pins: 14 entries, rounds 53(3)/54(2)/55(3)/56(3)/57(3); re-hashed every
  pinned path with `node:crypto` → 14/14 match, 0 absent (`counter-pins.independent.txt`).
- captures: 13 entries S108..S120; re-hashed each → 13/13 sha256 + byte length match
  (`source-capture.independent.txt`). One exemption entry, ids S1..S107 contiguous,
  0 ids >= S108, 107 ids (`source-capture.exemption-range.txt`).
- dupes: recomputed W04 groups from `corpus/SOURCES.md` (same normalized URL, differing
  `scope` cell) → exactly 4 live groups, each matching a pin by id-set and URL; 0 new,
  0 stale (`source-dupes.independent.txt`).
- row↔registry cross-binding: 44 rows declare `body sha256 <64hex>`; the 12 captured
  ones match the registry hash exactly; the other 32 are pre-rule rows with no committed
  bytes; `S108` is the one capture whose row declares no hash
  (`row-anchor-vs-registry.txt`).

## Non-vacuity (scratch replicas under this build dir only; lane untouched)
- `neg/replica2`: registry + all 14 pinned files copied → `COUNTER_PINS: CLEAN pins=14`;
  one byte flipped at offset 200 of the `attest57-probe` copy →
  `COUNTER_PINS: DRIFT pins=14 bad=1 first=attest57-probe:hash-mismatch` exit 1
  (other 13 remain OK).
- `neg/replica2`: captures + all 13 files copied → `SOURCE_CAPTURE: CLEAN captures=13
  exemptions=107`; one byte flipped at offset 1000 of the S119 capture →
  `SOURCE_CAPTURE: DRIFT captures=13 exemptions=107 bad=1 first=S119:hash-mismatch` exit 1.
- `neg/cap`: real registry + doc copy with the S117 row deleted →
  `SOURCE_CAPTURE: DRIFT captures=13 exemptions=107 bad=1 first=S117:orphan-capture` exit 1.
- `neg/dupes`: doc copy with S120 repointed onto S117's URL →
  `SOURCE_DUPES: DRIFT groups=5 known=4 bad=1 first=new-duplicate:docs.temporal.io/encyclopedia/detecting-activity-failures ids=S117,S120` exit 1.
- `neg/scan2`: scratch lane root (`corpus/knowledge`, `corpus/lessons`, `SOURCES.md`
  copied). Baseline is DRIFT exit 1 with exactly 16 `USED_BY_MISSING` findings — all
  six paths cited by `used-by` cells that were not copied into the scratch root
  (live tree: 0 findings). Mutant 1 (S119 row id → S117) adds
  `ID_DUPLICATE id=S117` + `ENTRY_SOURCE_UNKNOWN ... S119`. Mutant 2 (S117 tier → Z)
  adds `TIER_ENUM id=S117 tier=Z`.
- `neg/replica` (first layout attempt, registry placed under `.ufo/pins/`): the gate
  reported `absent` for all 14 pins / 13 captures — evidence it does not silently pass
  when bindings do not resolve (explicit `--registry` resolves paths against the
  registry's own directory per the contract).

## Round-57 rows observed
`S117` mined/A, `S118` mined/A, `S119` mined/A, `S120` rejected/B with `used-by = —`;
S117–S119 `used-by = corpus/knowledge/worker-heartbeat-liveness.md`, which cites all
three in its `source:` header (`s117-s120-fields.txt`).
