# K81ExecC2Fixtures — C2 age-surface fixture matrix (round-81 w1)

Seat: K81ExecC2Fixtures · 2026-11-04 · lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scope: fixture matrix for the age surface of `scripts/omp-census.mjs` (`--snapshot`, `--shape`, `--max-age`, `--compare`) plus the proxy no-harm check. Read-only over the lane; every fixture under `/fast/scratch/hyaku/kumitate-r81/K81ExecC2Fixtures/` (deleted before this report was submitted; the transcripts below are the retained evidence).

**Tree under test.** The live worktree at capture time: HEAD `d140f2883170cc1b0859ba5359bcdac3123a676e` ("round-81: scaffolding …", landed mid-seat) **plus uncommitted worktree modifications** — `scripts/omp-census.mjs`, `probe81-c2.mjs`, `plan.md`, `SCORECARD.md` are `M` in `git status --porcelain`. All numbers below are the worktree bytes, not a pinned revision; the L1 owns commits. No tool was installed or updated (node v24.21.0 preinstalled); no credentials or session material read.

Committed receipt (fixture source): `.ufo/pins/omp-shape.json` — `contract=kumitate-omp-shape-v2`, `captured_at=2026-11-04T09:45:44Z`, `entries=65`, sha256 `8b6aaa79e24fc56f39afdff6488aadeffe909f4e58f6de03f32901333263dae7` (matches `pin.omp-shape` in SCORECARD — probe arm 13's `pin=8b6aaa79e24f computed=8b6aaa79e24f`).

## 1. Fixtures built (build instant `NOW=2026-11-04T10:04:40Z`, all paths under `<S>=/fast/scratch/hyaku/kumitate-r81/K81ExecC2Fixtures`)

| fixture | construction |
|---|---|
| `root65/` | materialised from the committed receipt: `dir` → `mkdirSync`+`chmodSync(mode)`, `file` → `writeFileSync('')`+`chmodSync(mode)`; 65 entries, kinds `file,dir` only |
| `snap-fresh.json` | `--snapshot --root root65` (tool-written) |
| `back1/30/31/45/400.json` | v2, receipt entries verbatim, `captured_at = NOW − N·86400000 ms`, second precision |
| `future.json` | v2, `captured_at = NOW + 2 d` |
| `badcap-date.json` | v2, `captured_at="2026-11-04"` (date-only: fails `ISO_SECOND`) |
| `badcap-junk.json` | v2, `captured_at="2026-13-45T99:99:99Z"` (ISO-shaped, `Date.parse` → NaN) |
| `v1.json` | `{contract: kumitate-omp-shape-v1, entries}` only |
| `nocap.json` | v2 without `captured_at` |
| `unsorted.json` | v2, entries reversed |
| `dup.json` | v2, copy of entry[1] inserted adjacent at index 2 (otherwise sorted) |
| `rootdrift/` | `root65` + `zz-added` (file, 0644) for the compare-drift arm |

`--shape` runs bind against the lane's committed note via the default `--self` (`scripts/omp-census.mjs:136` resolves `DEFAULT_SELF` to the lane root); `--compare` without `--root` reads the live `$HOME/.omp/agent` (read-only). Ages are computed by the tool at run time (runs at 10:04:40–41Z).

## 2. Matrix

`<S>` = the scratch dir; command is always `node scripts/omp-census.mjs` from the lane root.

| receipt | command | exit | output line (verbatim) | expected behaviour (evidence) |
|---|---|---|---|---|
| `root65/` | `--snapshot <S>/snap-fresh.json --root <S>/root65` | 0 | `OMP_SNAPSHOT: WROTE entries=65 sha256=2422fe55c89d46dc4b0f63991e9d40502b3736b1e544c66aef85f5440bb336d0 path=…` | v2 doc, atomic write (arm 1 `snapshot-v2`; doc keys `captured_at,contract,entries`, entries byte-equal to committed receipt — verified `true`) |
| `snap-fresh` (age 0) | `--shape <S>/snap-fresh.json` | 0 | `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` | age disclosed (arm 2 `shape-age-disclosed`) |
| `back1` | `--shape <S>/back1.json` | 0 | `… captured=2026-11-03 age_days=1` | exact whole-day age (§C2 semantics) |
| `back30` | `--shape <S>/back30.json` | 0 | `… captured=2026-10-05 age_days=30` | exact age |
| `back31` | `--shape <S>/back31.json` | 0 | `… captured=2026-10-04 age_days=31` | exact age |
| `back45` | `--shape <S>/back45.json` | 0 | `… captured=2026-09-20 age_days=45` | age disclosed, no gate → CLEAN (arm 5 `shape-age-backdated`) |
| `back400` | `--shape <S>/back400.json` | 0 | `… captured=2025-09-30 age_days=400` | disclosure only; age never flips the verdict without `--max-age` |
| `future` | `--shape <S>/future.json` | 2 | `SHAPE_CLOCK captured_at=2026-11-06T10:04:40Z is in the future` | future instant refused (arm 8 `clock-future-refused`) |
| `badcap-date` | `--shape <S>/badcap-date.json` | 2 | `SHAPE_INVALID` | non-ISO `captured_at` rejected at validation (arm 9 family) |
| `badcap-junk` | `--shape <S>/badcap-junk.json` | 2 | `SHAPE_INVALID` | ISO-shaped but unparseable `captured_at` rejected (`!Number.isNaN(Date.parse(...))` leg, `omp-census.mjs:173-175`) |
| `v1` | `--shape <S>/v1.json` | 2 | `SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1` | v1 no longer grades the axis (arm 3 `shape-v1-refused`) |
| `nocap` | `--shape <S>/nocap.json` | 2 | `SHAPE_INVALID` | v2 without `captured_at` invalid (arm 9 `captured-at-required`) |
| `unsorted` | `--shape <S>/unsorted.json` | 2 | `SHAPE_INVALID` | strict-ascending invariant (`previous >= e.name` → invalid, `omp-census.mjs:188`) |
| `dup` | `--shape <S>/dup.json` | 2 | `SHAPE_INVALID` | adjacent duplicate caught by the same invariant — duplicates are unsorted |
| `snap-fresh` | `--shape … --max-age 0` | 0 | `… captured=2026-11-04 age_days=0` (no `SHAPE_STALE`) | boundary inclusive: stale iff `age > max_age`; 0>0 false |
| `back1` | `--shape … --max-age 0` | 1 | `SHAPE_STALE age_days=1 max_age=0` then `OMP_CENSUS: CLEAN (… age_days=1)` | gate fires, exit 1, census line still printed |
| `back30` | `--shape … --max-age 30` | 0 | `… age_days=30` (no `SHAPE_STALE`) | boundary inclusive: 30>30 false |
| `back31` | `--shape … --max-age 30` | 1 | `SHAPE_STALE age_days=31 max_age=30` + CLEAN line | stale one day past the window |
| `back45` | `--shape … --max-age 0` | 1 | `SHAPE_STALE age_days=45 max_age=0` + CLEAN line | gate at extreme window |
| `back45` | `--shape … --max-age 30` | 1 | `SHAPE_STALE age_days=45 max_age=30` + CLEAN line | arm 6 `max-age-stale` (exact line + exit 1) |
| `back45` | `--shape … --max-age 45` | 0 | `… age_days=45` (no `SHAPE_STALE`) | inclusive boundary |
| `back45` | `--shape … --max-age 60` | 0 | `… age_days=45` (no `SHAPE_STALE`) | arm 7 `max-age-pass` |
| `back400` | `--shape … --max-age 60` | 1 | `SHAPE_STALE age_days=400 max_age=60` + CLEAN line | stale under any realistic window |
| `back400` | `--shape … --max-age 399` | 1 | `SHAPE_STALE age_days=400 max_age=399` + CLEAN line | off-by-one above |
| `back45` | `--shape … --max-age -1` | 64 | stderr: `omp-census: --max-age must be a non-negative integer` + usage | negative window is a usage error |
| `back45` | `--shape … --max-age 2.5` | 64 | stderr: `--max-age must be a non-negative integer` + usage | non-integer window is a usage error |
| — | `--snapshot <S>/snap2.json --root <S>/root65 --max-age 30` | 64 | stderr: `omp-census: --max-age is only meaningful with --shape` + usage | arm 15 `usage-max-age` |
| `snap-fresh` | `--compare <S>/snap-fresh.json --root <S>/root65` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0` | content-free compare (arm 10 `compare-v2`) |
| `v1` | `--compare <S>/v1.json --root <S>/root65` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 …` | compare still reads legacy receipts (arm 4 `compare-v1-accepted`) |
| `back45` | `--compare <S>/back45.json --root <S>/root65` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC …` | compare is age-blind: no `captured=`/`age_days=` in the compare line at all |
| `dup` | `--compare <S>/dup.json --root <S>/root65` | 2 | `SHAPE_INVALID` | fail-closed before any comparison |
| `snap-fresh` | `--compare … --root <S>/rootdrift` | 1 | `OMP_SHAPE_COMPARE: DRIFT entries=66 receipt=65 added=1 removed=0 changed=0 first=zz-added transient=0` | added-member naming |
| `snap-fresh` | `--compare <S>/snap-fresh.json` (no `--root`) | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0` | default root = live `$HOME/.omp/agent`; the live root matched the receipt |

## 3. Selftest and frozen counter

`node scripts/omp-census.mjs --selftest` → **exit 0**, last line `VERDICT: PASS (98 cases)`, 99 `SELFTEST ok …` lines (the `snapshot-v2-fields` extra line is a named assertion, not a counted case). The v2/age cases present: `shape-clean`, `snapshot-v2-fields`, `shape-v1-version`, `compare-accepts-v1`, `shape-age-disclosed`, `shape-max-age-stale`, `shape-max-age-pass`, `cli-max-age`, `shape-clock-future`, `shape-v2-missing-captured`, `shape-invalid`, `shape-not-found`, `shape-negative`, `shape-content-key`, `shape-bad-kind`, `shape-wrong-contract`, `shape-bad-captured`, `shape-empty`, `shape-unsorted`, `shape-extra-key`.

`node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2` → **exit 0**, `C81_C2: HELD held=15/15` (all 15 arms PASS; full transcript below). This matches the claim's after-state (`C81_C2: HELD held=15/15`, exit 0) on the worktree under test.

### Probe transcript (verbatim)

```
C81_C2 arm snapshot-v2 PASS exit=0 contract=kumitate-omp-shape-v2 captured=2026-11-04T10:04:41Z entries=65/65
C81_C2 arm shape-age-disclosed PASS exit=0 out=OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)
C81_C2 arm shape-v1-refused PASS exit=2 out=SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1
C81_C2 arm compare-v1-accepted PASS exit=0 out=OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0
C81_C2 arm shape-age-backdated PASS exit=0 out=OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-09-20 age_days=45)
C81_C2 arm max-age-stale PASS exit=1 out=SHAPE_STALE age_days=45 max_age=30 | OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-09-20 age_days=45)
C81_C2 arm max-age-pass PASS exit=0 out=OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-09-20 age_days=45)
C81_C2 arm clock-future-refused PASS exit=2 out=SHAPE_CLOCK captured_at=2026-11-06T10:04:41Z is in the future
C81_C2 arm captured-at-required PASS exit=2 out=SHAPE_INVALID
C81_C2 arm compare-v2 PASS exit=0 out=OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0
C81_C2 arm stale-does-not-score PASS exit=0 verdict=MATCH coverage_omp=10 O_members=65
C81_C2 arm proxy-terms-unchanged PASS exit=0 injected=none O_members=65
C81_C2 arm receipt-pinned PASS pin=8b6aaa79e24f computed=8b6aaa79e24f contract=kumitate-omp-shape-v2
C81_C2 arm selftest PASS exit=0 out=VERDICT: PASS (98 cases)
C81_C2 arm usage-max-age PASS exit=64 out=omp-census: --max-age is only meaningful with --shape usage: …
C81_C2: HELD held=15/15 tool=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-census.mjs
```

### Arm corroboration and contradictions

Every one of my independent fixtures reproduces its probe arm's expectation (mapping in the matrix's evidence column: arms 1–10, 15 covered directly; arm 11/12 under §4; arm 13 via the independently computed receipt sha256; arm 14 via the selftest run). **No arm of `probe81-c2.mjs` is contradicted by this evidence.**

One plan-text delta to name (not an arm): the tool prints `VERDICT: PASS (98 cases)` while plan §C2 arm 14 still says `(97 cases)`. The +1 case is `cli-max-age`, a consequence of Amendment 1 items 4–5 (arm 14 now runs the CLI, so the `--max-age` gate is exercised end-to-end); Amendment 1 item 6 names the analogous C1 delta (30/30 → 31/31) but nothing names 97 → 98 for C2. The frozen arm itself is count-agnostic (`/VERDICT: PASS \(\d+ cases\)/`), so it passes either way — this only needs a plan erratum or an amendment line, per the round's append-only convention.

## 4. Proxy no-harm — the score does not move

Baseline (committed receipt via the round-80 default path) vs backdated receipt, both `--json --self <lane>`:

| run | exit | verdict | source | O_members | O_findings | O_bound | coverage_omp |
|---|---|---|---|---|---|---|---|
| `proxy-check.mjs --json --self <lane>` (default receipt, captured today) | 0 | `MATCH` | `snapshot` | 65 | 0 | 35 | **10** |
| `proxy-check.mjs --json --self <lane> --omp-shape <S>/back45.json` | 0 | `MATCH` | `snapshot` | 65 | 0 | 35 | **10** |

The two JSON bodies carry **identical `terms`** (A=889 C=41 operability=9; C1=19/19 C2=202/202 coverage=10; S=88/88 script=10; R=92/92 runtime=10; K=55/55 kimi=10; O=1/1 members=65 findings=0 bound=35 coverage:omp=10; pins=6/6) and identical `findings: []`; only `durationMs` differs. No `O_age`/`O_captured`/`O_stale` term exists in either (arm 12). Text mode of the backdated run:

```
PROXY: MATCH (A=889 C=41 operability=9; C1=19/19 C2=202/202 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=55/55 coverage:kimi-layer=10; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)
```

**Statement:** a 45-day-old receipt scores exactly what the today-dated receipt scores — `verdict=MATCH`, `coverage_omp=10`, exit 0. The age never enters the score surface; arm 11 (`stale-does-not-score`) and arm 12 (`proxy-terms-unchanged`) hold. (The scored `src` is the pinned clone `/fast/scratch/hyaku/kumitate-pin/src` at `31c465f15669…`, asserted by the origin pin; the lane checkout HEAD is `d140f28…` — unrelated to the O terms.)

## 5. Edge observations

1. **Boundary is inclusive**: stale iff `age_days > max_age` (`omp-census.mjs:479`). `age == max_age` passes (30/30 and 45/45 rows exit 0); the plan's arm 6/7 pair (45 vs 30/60) does not pin the boundary — my 30/31 and 0/1 rows do.
2. **A stale run prints both lines**: the `SHAPE_STALE …` finding line followed by the ordinary `OMP_CENSUS: CLEAN (…)` census line; exit 1 comes from the gate, not the census verdict. Callers keying on the single-line contract of exit 0/1 must read the first line, not the last.
3. **Compare is age-blind and content-blind**: no `captured=`/`age_days=` ever appears on an `OMP_SHAPE_COMPARE` line (45-day receipt → IN_SYNC), and it still accepts v1 — the report-only surface deliberately does not version-gate.
4. **Duplicates are rejected by the sort invariant**, not by a dedicated rule: an adjacent duplicate makes `previous >= e.name` true → `SHAPE_INVALID` exit 2. A duplicate split apart would also be unsorted, so every duplicate shape is unreachable in a valid v2 document.
5. **Malformed `captured_at` fails at document validation**, before the version check: a v2 doc with a bad `captured_at` prints bare `SHAPE_INVALID` (never `SHAPE_VERSION`), covering both the regex leg (date-only) and the `Date.parse` leg (impossible calendar fields).
6. `--max-age` is shape-only and non-negative-integer-gated: `-1` and `2.5` → exit 64 with usage; with `--snapshot` → exit 64 `--max-age is only meaningful with --shape`.

## 6. Cleanup and provenance

Scratch `/fast/scratch/hyaku/kumitate-r81/K81ExecC2Fixtures/` (driver `matrix.mjs`, 10 receipts, `root65/`, `rootdrift/`, 2 snapshots) deleted after the last capture; nothing of mine remains outside this report. No fleet-root tracked file, no `.ufo/state/`, no sibling path touched; no git/jj mutation anywhere (only `rev-parse`, `status --porcelain`, `log`, `show`); the live `$HOME/.omp/agent` was only ever read by the two no-`--root` compare/selftest-default paths. No new tools installed (node v24.21.0 preinstalled) — nothing to record under the operator tooling authorization.
