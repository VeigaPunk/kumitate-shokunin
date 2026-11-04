# K83ExecCensusClock — C2 instrument (compare-path clock guard), round 83

Seat: executor (leaf). Write scope: `scripts/omp-census.mjs` (needed no change) + this report.
Measured tree: the live lane worktree `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (2026-11-04, wave in flight).
Scratch: `/fast/scratch/hyaku/kumitate-r83/K83ExecCensusClock/` (passed via `--work`/`TMPDIR`; deleted before yield).
No installs/upgrades were needed (system `node` only); no git/jj command was run; `scripts/ready-handoff.mjs`,
the frozen counters and the frozen controls were not touched.

## 1. Exact commands and observed outputs

### 1.1 Frozen counter (16 arms)

```
TMPDIR=/fast/scratch/hyaku/kumitate-r83/K83ExecCensusClock \
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/probe/probe83-c2.mjs \
  --set c2 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --work /fast/scratch/hyaku/kumitate-r83/K83ExecCensusClock/probe
```

Observed (all 16 arms `ok`): `C83_C2: HELD held=16/16`, **exit 0**. New arms at M, with exact lines:

```
C83_C2 arm compare-future-unbounded ok exit=2 want="SHAPE_CLOCK" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:12:52Z age_days=-90
C83_C2 arm compare-future-bounded ok exit=2 want="SHAPE_CLOCK" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:12:52Z age_days=-90
C83_C2 arm compare-clock-names-instant ok exit=2 want="captured_at=2027-02-02T12:12:52Z" out=OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:12:52Z age_days=-90
C83_C2 arm compare-legacy-v1 ok exit=0 want="captured=absent age_days=absent" out=OMP_SHAPE_COMPARE: IN_SYNC entries=2 receipt=2 added=0 removed=0 changed=0 transient=0 receipt_captured=absent age_days=absent
C83_C2 arm compare-legacy-bounded ok exit=2 want="SHAPE_AGE_UNKNOWN" out=OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=30
C83_C2 arm clock-one-predicate ok shape=2 compare=2
```

All 10 carried arms also `ok` (IN_SYNC, age_days=0, 45, stale/pass under `--max-age`, drift + `first=lsp.json`,
transient=1, shape-clock-regression, SHAPE_NOT_FOUND).

### 1.2 Tool selftest

```
node scripts/omp-census.mjs --selftest --work /fast/scratch/hyaku/kumitate-r83/K83ExecCensusClock/selftest
```

Observed: **`VERDICT: PASS (108 cases)`**, exit 0, no `SELFTEST FAIL` lines. (The file carries 109
`SELFTEST ok` lines because the conditional sub-case `snapshot-v2-fields` prints `SELFTEST ok
snapshot-v2-fields` in its success branch without incrementing the case counter —
`omp-census.mjs:759-766`; it increments `ran` only when failing. Counted cases = 108.)

### 1.3 Pinned shape receipt, both paths (as documented)

```
node scripts/omp-census.mjs --shape /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/omp-shape.json
node scripts/omp-census.mjs --compare /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/omp-shape.json
```

Observed:

```
OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)   # exit 0
OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-04 age_days=0   # exit 0
```

(The receipt/root read 65 entries at M versus round-82's documented 64 — the live root gained one entry
since the round-82 close and the pin was refreshed; both lines are self-consistent and match the
round-83 documented shape `receipt_captured=2026-11-04 age_days=0`.)

### 1.4 The age never scores

```
node scripts/proxy-check.mjs --json
```

Observed: `terms.coverage_omp = 10` — the clock guard does not score. The overall verdict was
`DRIFT exitCode 1` with exactly one finding:

```
FINDING: {"severity":"error","kind":"A_DRIFT","term":"A","declared":894,"computed":895,"delta":"+1","detail":"A: declared=894 computed=895 delta=+1"}
```

`A` is the lane-wide member census; the +1 is in-flight wave state (sibling seats' artifacts in the
tree while the wave runs), not this instrument: every C2/O term matched its declared value
(`C2 210/210`, `O_members 65 O_findings 0 O_bound 35`, `coverage_omp 10`, `coverage_kimi 10`,
`coverage_script 10`, `coverage_runtime 10`).

## 2. Implementation audit (`scripts/omp-census.mjs`)

- **One clock predicate, both paths.** `clockRefusal(doc, ageDays)` is defined once at `:220-224`; its
  only call sites are `compareShape` `:270-274` and `runShape` `:511-514`. Both compute the age through
  the single `receiptAgeDays` (`:226-229`, call sites `:266` and `:510`). In `compareShape` the clock
  is judged **unconditionally, before** the `--max-age` branch (`:275-283`); the refusal line is
  `OMP_SHAPE_COMPARE: SHAPE_CLOCK <clock>` exit 2, and `--shape` prints `SHAPE_CLOCK <clock>` exit 2.
- **Future instant refused without `--max-age`.** `receiptAgeDays` floors `(now − captured)/86400000`;
  a future instant gives a negative floor, and `clockRefusal` returns
  `captured_at=<ISO> age_days=<negative>` for any `ageDays < 0` (`:221-223`) regardless of a bound.
- **Legacy v1 keeps `captured=absent age_days=absent`.** `compareShape` sets `captured = null` when
  `doc.captured_at` is not a string (`:264`) → `ageDays = null` → `clockRefusal` returns `null`
  (no invented instant) and the stamp prints `receipt_captured=absent age_days=absent`
  (`:267`); under `--max-age` a null age reads `SHAPE_AGE_UNKNOWN` (`:276-279`). The `--shape` path
  refuses v1 earlier with `SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1` (its
  pre-existing contract, unchanged this round).
- **The age never scores.** The clock/stale branches only choose the verdict line and exit code; drift
  computation and the census verdict are untouched, and `terms.coverage_omp` reads 10 (§1.4).

## 3. Edits

**None.** The implementation at the measured tree already satisfies every frozen arm and every suite
case; the write target `scripts/omp-census.mjs` needed no change, so I made none (a do-nothing touch is
also barred by kill rule K3). Kill rules respected: K1/K2 do not apply to my surface (base control
`controls/c2-base.txt` reads `UNMET held=13/16` at the round-82 tip; stub `controls/c2-stub.txt` reads
`UNMET held=3/16`, both under half, matching K1/K2).

## 4. Residual defect (disclosed, not edited)

**The plan's token sentence for an unparseable instant overstates what the tool prints.** plan.md
§C2 (`:63-64`) says "a future instant or an unparseable instant reads `SHAPE_CLOCK` exit 2 on both
paths". An unparseable `captured_at` never reaches `clockRefusal`: `readShapeDoc` → `validateShape`
rejects it first — `ISO_SECOND` shape + `!Number.isNaN(Date.parse(...))` (`omp-census.mjs:176-179`) —
so both paths exit 2 with token **`SHAPE_INVALID`**, not `SHAPE_CLOCK`. Measured, fixtures in scratch:

```
node scripts/omp-census.mjs --compare <unparseable.json> --root <fixture root>   → SHAPE_INVALID   exit 2
node scripts/omp-census.mjs --shape <unparseable.json> --note corpus/knowledge/omp-agent-root.md → SHAPE_INVALID   exit 2
node scripts/omp-census.mjs --compare <leapshape.json> --root <fixture root>     → SHAPE_INVALID   exit 2
```

(`captured_at:"not-a-date"` and the leap-second-shaped `"2023-06-30T23:59:60Z"` — the latter because
`Date.parse` returns `NaN` for `:60` under Node v24.21.0, measured directly.)

Consequences: the refusal *behaviour* the plan asks for (refused, exit 2, both paths, with or without
`--max-age`) holds for every malformed instant; only the promised token differs. The frozen counter has
no unparseable-instant arm (its `clock-one-predicate` arm compares exit codes only), so `held=16/16`
stands; the `Number.isNaN(ageDays)` branch of `clockRefusal` (`:221`) is unreachable from the CLI.
Fix is wording-level in a later round's plan (or a new counter arm), never by editing the frozen probe —
per the plan's counter-defect rule. The sibling connector seat independently recorded the same
observation (`w1/K83Connector.md` §3.2); my measurements above reproduce it with exact lines.

## 5. Could not verify / out of scope

- `terms.A` DRIFT (+1) is in-flight sibling state, not re-verified to a quiesced tree (wave was live
  while measuring); it does not touch any C2 term.
- The C1 counter defect reported by sibling seats (28 arms vs `ARMS = 27`, and its attack-share
  arithmetic) belongs to `probe83-c1.mjs`/`ready-handoff.mjs`; out of this seat's write scope, left for
  the L1/close seats.
- No labrat probe was spawned (not needed; the frozen counter plus targeted fixtures covered the
  surface, and the seat's single-probe allowance was not spent).

**Tally:** `C83_C2: HELD held=16/16` (exit 0) · `VERDICT: PASS (108 cases)` (exit 0) ·
`terms.coverage_omp = 10` · edits: 0 · residual defect: 1 (token-level, `SHAPE_INVALID` vs promised
`SHAPE_CLOCK` for unparseable instants; behaviour held).
