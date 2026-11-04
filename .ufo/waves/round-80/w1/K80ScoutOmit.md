# K80ScoutOmit — semantic-omission recon: the two patched instruments

Seat: read-only recon, round 80 w1. Nothing edited in the lane tree; every fixture lived under
`/fast/scratch/hyaku/kumitate-r80/K80ScoutOmit` and was deleted after this file was written.

## Receipts

| item | value |
|---|---|
| lane HEAD at read time | `509afb1d6ec5fc854c1398ae0060d6298ed621d1` |
| instruments named by the seat | `6d03402fddf44cc9797ec590f0f888e933db4677` |
| byte identity | `git show 6d03402:<f> \| sha256sum` equals the worktree sha256 for all five files below; `git diff --stat 6d03402 -- scripts/spotcheck-adopt.mjs scripts/proxy-check.mjs .ufo/waves/round-80/probe .ufo/pins/omp-shape.json` is empty — **the bytes probed are the freeze/scaffolding bytes** |
| `scripts/spotcheck-adopt.mjs` | `0d9c56dc6d4751e3ea9e0d0eb2ec24c27633637770aecb926f032e53d505bcec` |
| `scripts/proxy-check.mjs` | `59dfeb64efff9fb0fd4b17eb31af7f96f49f22e4ec00c0229c917e07bcb54f96` |
| `probe80-c1.mjs` | `9cbd0281d835f68107567891f5a3492b4a0620b6005704d4b0f86756d97c0139` |
| `probe80-c2.mjs` | `ad514cf410c6065601157f96933958e95e72193002f54fefe7af1061e690b470` |
| `.ufo/pins/omp-shape.json` | `84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435` (65 entries, first `RULES.md`) |
| oracle/census bytes | `scripts/readme-map.mjs` `b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e` and `scripts/omp-census.mjs` `c5986057a3fcd27761cbd77c7387267813089ed7c4affb6a4ad03f36d1164c98` — both identical at `6d03402` and in the worktree |
| node | v24.21.0 |

Method: full read of both instruments, both counters, `scripts/readme-map.mjs` (the oracle whose
stdout the C1 tool parses), `scripts/omp-census.mjs` (`validateShape`/`censusEntries`), and the
frozen plan §C1/§C2. Then fixture probes in scratch (one live clone not needed; the tools were
executed read-only against scratch lanes via `--lane` / `--self`). Probe outputs below are verbatim
stdout; `[OBSERVED]` = printed by a run, `[CODE]` = read from the source, `[DERIVED]` = arithmetic
on observed values through the cited code.

Ranking key: **H** = a green reading can hide a defect or contradict the claim sentence;
**M** = contradicts the plan's after-state or a disclosure sentence, or masks a defect while
failing closed; **L** = fail-closed / cosmetic / prose only.

---

## C1 — `scripts/spotcheck-adopt.mjs` v3 vs `probe80-c1.mjs` (13 arms)

### C1-H1 — `recover()` still folds the whole README map: a *completed* adoption on a red map is rolled back

- Symbol: `recover()` `spotcheck-adopt.mjs:139-141` — `const result = oracle(lane); if (!result.clean) { …restore both pre-images… outcome='rolled-back' }`.
- Untested by: counter arm 11 `rollback-clean` (a corrupt pre-image on a *clean* fixture, `probe80-c1.mjs:189-205`); selftest `crash-journal|row|pin` (all built by `fixture()` without an unrelated corpus file, `spotcheck-adopt.mjs:387-400`). No arm combines a red map with an interrupted adoption.
- Probe (red map + `SPOTCHECK_ADOPT_TEST_CRASH=pin`, i.e. SIGKILL after the last write):

```
before: exit 1
  SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md
  MAP: DRIFT first=uncovered:knowledge/late.md
crash:  code=-9  row-present=True  pin-present=True  journal entries=1
after:  exit 1
  RECOVERED corpus/lessons/round-75-verifier-spotcheck.md rolled-back
  SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md
  MAP: DRIFT first=uncovered:knowledge/late.md
  row-present=False  pin-present=False
```

- Impact: the crash happened **after both writes**, so the adoption was complete and valid under v3's own delta rule (target resolves, every other finding unchanged — `knowledge/late.md` is untouched by the write). The next invocation nonetheless rolls it back because `result.clean` is false for the unrelated drift. This is exactly the conflation §C1 says the round removes ("conflates an unrelated map drift with an uncovered spotcheck"), surviving in the recovery path. Fail-safe and idempotent (a re-run of `--adopt` succeeds), but a journaled, supported path silently undoes a legitimate adoption and reports the undo only as `RECOVERED … rolled-back`. `--adopt`'s claim is true on the happy path and false across a crash on a red map.
- Fix direction (not applied — leaf): recovery should apply the same delta test (manifest `key` resolves, `otherFindings` unchanged from the pre-images) instead of `result.clean`.

### C1-H2 — zero spotcheck files reads CLEAN, and counter arm 13 cannot tell that from the lane's 47

- Symbol: `spotcheck-adopt.mjs:195-200` — `paths` from `readdirSync(corpus/lessons)`; `uncovered.length === 0` prints `CLEAN spotchecks=${paths.length} uncovered=0` and exits 0. With `paths.length === 0` the reading is vacuously green.
- Untested by: every counter arm builds `spotcheck: true`; arm 13 (`probe80-c1.mjs:243-249`) asserts `/^SPOTCHECK_COVERAGE: CLEAN spotchecks=\d+ uncovered=0$/` — `\d+` accepts `0` — and does **not** assert `MAP: CLEAN`, although the plan's after-state requires `SPOTCHECK_COVERAGE: CLEAN spotchecks=47 uncovered=0` **+ `MAP: CLEAN`**. Exit 0 is driven by coverage only (`spotcheck-adopt.mjs:200`).
- Probe (valid map, no `round-*-verifier-spotcheck.md`):

```
exit 0
SPOTCHECK_COVERAGE: CLEAN spotchecks=0 uncovered=0
MAP: CLEAN
```

- Impact: deleting every spotcheck file leaves `--check` green and the counter 13/13, while the plan's `spotchecks=47` and `MAP: CLEAN` after-state are both false. Two independent gaps in arm 13: the count is unpinned and the map line is unasserted. A lane whose README map went red at close (unrelated uncovered knowledge file) also keeps 13/13.

### C1-M1 — `--predict` short-circuits before the oracle: PENDING exit 0 on a FAIL-CLOSED map

- Symbol: `spotcheck-adopt.mjs:187-190` — the absent-target branch returns `SPOTCHECK_PREDICT: PENDING` exit 0 before `const result = oracle(lane)` at `:192`.
- Untested by: the counter never invokes `--predict` (no arm); the selftest's three predict cases (`spotcheck-adopt.mjs:331-340`) all use a v2 registry that the oracle can evaluate. The plan's arm list has no `--predict` arm at all.
- Probe (registry `{"version":1,…}` → oracle FAIL-CLOSED; target `round-99` absent):

```
oracle-direct: README_MAP: FAIL-CLOSED reason=registry version 1 !== 2 (want the v2 lstat semantics)
predict-99:    exit 0  SPOTCHECK_PREDICT: PENDING corpus/lessons/round-99-verifier-spotcheck.md
```

- Impact: exit 0 from a tool whose map is unevaluable. `PENDING` is honest about the file but the exit code is a green reading. For a *present* target, `--predict` also returns `COVERED` exit 0 on a red map (only `format-unmapped`/`duplicate-row` refuse, `:193`) — `[CODE]`, untested either way; that one is defensible under the two-readings rule, but nothing pins it.

### C1-M2 — a README row lands outside the coverage table when the `## Coverage map` heading is absent, and the delta rule cannot see it

- Symbol: `insertRow()` `spotcheck-adopt.mjs:158-168` — `start = 0` when the heading is missing, so `table` is everything up to the first `## `, and `boundary = start + table.length` when that slice holds no corpus rows.
- Untested by: counter fixtures always write `## Coverage map` (`probe80-c1.mjs:70-77`); selftest `placement` (`:419-425`) tests only the correct-section path.
- Probe (README `# Corpus\n\n## Known gaps\n\n| `knowledge/base.md` | … |\n\n- none\n`):

```
adopt: exit 0  SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md wrote=both
       README_MAP: CLEAN files=2 rows=2 covered=2
readme-after: '# Corpus\n\n| `lessons/round-75-verifier-spotcheck.md` | … |\n## Known gaps\n\n| `knowledge/base.md` | … |\n\n- none\n'
check-after:  exit 0  SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0 / MAP: CLEAN
```

- Impact: the row is written into the document preamble, above the first `##` heading — not after the base row, not in any coverage table. `readme-map.mjs` parses rows anywhere, so the map stays CLEAN and `--adopt` reports success. Coverage arithmetic is unharmed; the README is structurally wrong and the delta rule cannot detect it (it only reads findings, never the row's section).

### C1-L1 — `otherFindings()` is a substring filter, not a subject filter

- Symbol: `spotcheck-adopt.mjs:40-42` — `result.findings.filter((f) => !f.includes(key))`.
- A finding about a *different* subject that embeds the key is dropped from the delta comparison. Reachable instance: a README row `` | `lessons/round-75-verifier-spotcheck.md ` | … | `` (trailing space inside the backticks) yields `orphan-row:lessons/round-75-verifier-spotcheck.md `, which `includes(key)` and is filtered on both sides, so a near-identical path's defect is invisible to `sameOther`. `[CODE]`.
- Mitigation: the success line prints `after.line` (the oracle DRIFT line), so the defect is disclosed on the same run. Rank L. A subject-prefix match (`f.startsWith('uncovered:'+key) || …`) would be the tight predicate.

### C1-L2 — `--check` and `--adopt` disagree on a symlinked spotcheck

- `--check` counts a spotcheck path that is a symlink as covered (`missing()` sees no `uncovered:`/`unpinned:`; readme-map emits `covered-not-file:` instead); `--adopt` refuses it (`lstatSync(full).isFile()` is false → `REFUSED_OUT_OF_SCOPE`, `spotcheck-adopt.mjs:175-180`). `[CODE]`, untested by either suite. Both fail closed-ish; the two readings disagree about the same path.

### C1-L3 — `REFUSED_PATH_ESCAPE` untested

- `canonicalParent()` (`:96-103`) is exercised by no counter arm and no selftest case (no fixture with a symlinked `corpus/` or `.ufo/pins/` parent). Fail-closed, so the omission cannot hide a defect; it does mean the escape guard has no regression arm.

### C1-L4 — plan/counter divergence on the selftest floor

- Plan §C1 arm 12: `SPOTCHECK_ADOPT_SELFTEST: PASS (n/n)` with **n ≥ 25**; frozen counter `probe80-c1.mjs:207` asserts **n ≥ 26**. Observed at the scaffolding bytes: `SPOTCHECK_ADOPT_SELFTEST: PASS (28/28)` / `VERDICT: PASS`, exit 0. Harmless today (28), but the counter is stricter than the frozen kill rule — a future case deletion to 25 would satisfy the plan and fail the counter.

### C1-L5 — no `corpus/lessons` directory is indistinguishable from a broken oracle

- `readdirSync(join(lane,'corpus/lessons'))` (`:195`) throws ENOENT → `main()` catch → `REFUSED_ORACLE` exit 2 (`:441-443`), the same token as a malformed registry. Fail-closed; diagnosis only.

---

## C2 — `scripts/proxy-check.mjs` O source vs `probe80-c2.mjs` (12 arms)

### C2-H1 — a truncated receipt is CLEAN: a missing required member is an `INFO`, never a finding

- Symbols: `omp-census.mjs:316-370` — `for (const r of BASE_MEMBERS) if (!present.has(r.name)) infos.push('INFO … absent')`; `findings` only gets `UNLISTED`/`KIND`/`MODE`/`NOTE_UNBOUND`/`EMPTY`. `validateShape` (`:168-186`) requires only `contract` + a non-empty sorted `entries` — no `BASE_MEMBERS` membership. `proxy-check.mjs:996-1000` derives `O_members=counts.entries`, `O_findings=findings.length`, `coverage_omp=layerCoverage(…, entries-findings, entries)`.
- Untested by: counter arm 7 (`stanza-off-by-one`: a declared count that disagrees), arm 8 (`finding-on-receipt`: a wrong mode). No arm removes a member from the receipt while keeping the stanza consistent.
- Probe (committed receipt minus `mcp.json`, 64 entries):

```
OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)
OMP_SHAPE_COMPARE: DRIFT entries=65 receipt=64 added=1 removed=0 changed=0 first=mcp.json transient=0
```

- Impact: `[DERIVED]` the proxy would read `O_members=64 O_findings=0 O_bound=35 coverage_omp=floor(10×1×64/64)=10` — a full 10 for a plane missing a required member, with no finding. Only the **non-scoring** `--compare` checklist item names it (arm 10 deliberately keeps compare non-scoring), and against a live root that also lost the file it would read `removed=1`. So a re-capture that silently drops members and re-pins yields a MATCH. This is the axis's own derivation surface: the O integer cannot distinguish "65 members, all clean" from "a receipt that lost a member", and arm 7 only catches the case where the stanza was *not* updated. A receipt-side `INFO absent` promoted to a finding (or a `validateShape` membership check) would close it.

### C2-M1 — counter arm 12 is not the plan's arm 12: the real live root is never read

- Plan §C2 arm 12: `live-clean` — "`--omp-live` against the real live root: MATCH `source=live`". Frozen counter `probe80-c2.mjs:255-263` (`live-opt-in-clean`) materialises `root65` from the receipt and asserts `MATCH source=live O_members=65` against that fixture. `[CODE]` (arm body read).
- Impact: the counter is hermetic — a virtue — but it does not measure the plan's after-state sentence ("`--omp-live` against the live root reads `O_members=65` too (`source=live`)"). If the operator root gains a 66th entry before the close commit, the counter stays 12/12 while that sentence is false. The **claim sentence** (`held=12/12`) is unaffected; the after-state is only measured manually and by the non-scoring `omp-census --compare`. Worth a named erratum-or-note in the round lesson rather than a counter edit (post-freeze).

### C2-M2 — `source: "snapshot"` is disclosed for runs that never read a snapshot

- Symbols: `proxy-check.mjs:1282` (fail-closed body) and `:1418` (check body) — `source: opts.ompShape ? 'snapshot' : 'live'`; `parseArgs:3371` sets `opts.ompShape` unconditionally whenever no source flag is given.
- Probe (empty-entries receipt and a missing `--self`, both `--json`):

```
exit 2  verdict=FAIL-CLOSED  source=snapshot  kind=OMP_SHAPE_INVALID
exit 2  verdict=FAIL-CLOSED  source=snapshot  kind=OMP_SHAPE_NOT_FOUND
```

- Impact: the JSON body claims a snapshot source on the very run whose snapshot could not be read, and the text fail-closed line (`PROXY: FAIL-CLOSED (TOKEN) detail`) carries no source tail at all — the plan says the disclosure lives "in the verdict tail and the JSON body". No scoring consequence (fail-closed terms are `{}`), but it is a false provenance claim in the round whose subject is provenance.

### C2-M3 — the default receipt is resolved before every other fail-closed arm

- Symbol: `runCheck()` `proxy-check.mjs:1307-1312` loads `opts.ompShape` **before** `statKind(opts.self)` (`:1313`), the scorecard read (`:1337`), and every other arm.
- Probe:

```
--self <missing dir>            exit 2  OMP_SHAPE_NOT_FOUND  cannot read <missing>/.ufo/pins/omp-shape.json
--self <existing dir, no pin>   exit 2  OMP_SHAPE_NOT_FOUND  cannot read <dir>/.ufo/pins/omp-shape.json
```

- Impact: `SELF_NOT_A_DIR` / `SCORECARD_MISSING` / `SKILL_MISSING` are unreachable in default mode on any tree without a receipt — a fresh `git archive` of a pre-r77 rev, or any other lane, now reports `OMP_SHAPE_NOT_FOUND` for every mistake. Untested by the counter (arm 5 uses an *existing* empty dir, which expects the same token for a different reason) and by the selftest, whose fail-closed arms inject `--omp-root F1.omp` via `runProxy` (`:1641-1643`), so `fc('self absent', …)` still sees `SELF_NOT_A_DIR`. Fail-closed, so no defect is hidden; the cost is diagnosis and the documented token contract.

### C2-L1 — source-flag exclusivity exit codes

- `--omp-live --omp-root DIR` → exit 64 (`--omp-live and --omp-shape/--omp-root are mutually exclusive`); `--omp-shape FILE --omp-root DIR` → exit 64. `[OBSERVED]`. The selftest covers `--omp-shape`+`--omp-root` and `--omp-live`+`--omp-shape` (`:2828-2831`, `:2862-2865`), never `--omp-live`+`--omp-root`; the counter covers none. Same throw path (`parseArgs:3368-3369`); harmless.

### C2-L2 — a receipt with a valid contract and empty `entries` fails closed

- `validateShape` rejects `!doc.entries.length` → `OMP_SHAPE_INVALID` exit 2, terms `{}`. `[OBSERVED]`. Arm 6's fixture omits the `entries` key entirely; the empty-array branch is untested but shares the predicate. Correct behavior (never a silent `O_members=0`); prose only.

### C2-L3 — `--tip-drift` under the new default is untouched

- `parseArgs` sets `opts.ompShape` in tip-drift mode too (`:3371` runs for every argv), but `runTipDrift`/`tipDriftResult` (`:482-530`) never read it and never call `failClosed`; the tip-drift JSON body has no `source` field. `[CODE]`. No behavior change, no read, no stat. The plan's "JSON body carries `source`" sentence is check-mode only. Harmless.

### C2-L4 — `--selftest` + default receipt

- `main()` returns `selfTest()` before any check-mode path (`:3390`), and the suite is hermetic (`mkdtemp`, `scrubGitLocalEnv`). The default `ompShape` path is computed and never read. `[CODE]`. Harmless.

### C2-L5 — `--scorecard` outside `--self`

- `compareGatePins(opts.self, …)` always verifies `pin.omp-shape` against `<self>/.ufo/pins/omp-shape.json`, never against the scorecard's directory, so a foreign scorecard cannot pin another tree's receipt (arm 4 exploits exactly this with a tampered copy). Untested: a foreign scorecard carrying a *correct* pin but a different `O_members` — arm 7 covers the drift itself. Harmless.

### C2-L6 — `--omp-live` with an absent root

- `census(opts.ompRoot, …)` throws → `OMP_ROOT_NOT_A_DIR` exit 2 (`:1374-1378`). The selftest covers `--omp-root` absent/file but not `--omp-live` falling back to a missing `~/.omp/agent`. Fail-closed; diagnosis only.

---

## What the counters do test (bounds the gaps above)

- C1: clean/uncovered readings, the split on map-only drift (`uncovered:` and `orphan-row:`), both-drift, oracle refusal, usage 64, adopt-on-red-map, duplicate refusal with byte-unchanged, idempotence with byte-unchanged, corrupt-pre-image rollback with byte-unchanged, selftest, live-lane `--check` (weakly, see C1-H2). The 13 arms do force the tool to print *different* coverage lines for the same command on different fixtures, so a constant printer cannot pass.
- C2: the same fixture read through two sources (65 vs 68), offline default, the gate pin vs the receipt sha, absent/invalid receipt, a declared-count mismatch, a mode finding, snapshot-vs-census agreement, compare non-scoring, both selftests, and `--omp-live` against a 65-member materialised root. A constant-JSON stub fails 2/5/6/7/8 as claimed.

## Remaining unknowns

- Whether the lane's live `--check` at the close commit reads `spotchecks=47` and `MAP: CLEAN` (C1-H2 shows the counter does not assert either) — closure/executor measurement, not this seat.
- Whether the live root still reads 65 at the close (C2-M1: the counter does not read it) — `omp-census --compare` is the only instrument, and it is non-scoring.
- C1-L2 (symlink spotcheck) and C1-L3 (`REFUSED_PATH_ESCAPE`) were read from source, not exercised; no fixture was built for them.
- No semantic LSP server was configured for this lane (`lsp` unavailable), so definition/reference tracing is text-grep plus full-file reads of the five instruments and their two children; every symbol cited above was read in full at the sha256s in the table.
