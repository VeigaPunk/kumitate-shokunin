# K81ExecMutate — mutation battery over the round-81 instruments

**Seat:** K81ExecMutate (mutation-tester), round 81 / wave w1, Linux run-15 host.
**Measured:** 2026-11-04 10:00–10:05 UTC against `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
(worktree HEAD `d140f288`; plan base `77c7a8b3` + `2ac1f34d`, `d140f288`).
**Tooling:** none installed; node v24.21.0 was already present and sufficient.

## Instrument bytes scored

| file | sha256 | note |
|---|---|---|
| `scripts/ready-handoff.mjs` | `f8b4a92b58d351615b714bdf03052420aaa79854153c5e23b7c714178fbdf531` | equals `pin.ready-handoff` (`SCORECARD.md:352`) |
| `scripts/omp-census.mjs` | `ba7cbc8f7f507fcf932d06b53e11d0c0801921000d0ba3d35b27ab37b70c322f` | equals `pin.omp-census` (`SCORECARD.md:330`) |
| `scripts/proxy-check.mjs` | `9ce5664343de48205435b96ad724cbe676ba036102e2beff6978ed94e4c2ecba` | scored via the C2 no-harm arms |
| `scripts/claims-check.mjs` | `de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14` | imported by proxy-check in the C2 trees |
| `.ufo/waves/round-81/probe/probe81-c1.mjs` | `c837f011ac95c0d3301c31b5ee2b8d4b49481085825647ee8eb2cb5c14a7a2fb` | frozen C1 counter as on disk |
| `.ufo/waves/round-81/probe/probe81-c2.mjs` | `886991f25417b15fdd2e2299e35706c76cb9302a409ccd9e8969307356ef70ab` | frozen C2 counter as on disk |

Full list: `K81ExecMutate/sha256-instruments.txt`. Both instruments' bytes match the pins the
scorecard declares; the two probes and `omp-census.mjs` carry uncommitted post-freeze worktree
edits (`git status`: ` M .ufo/waves/round-81/probe/probe81-c1.mjs`, ` M …c2.mjs`,
` M scripts/omp-census.mjs`), so I scored the bytes on disk and pinned them above.

Observed suite sizes differ from the frozen plan text: C1's own suite reports **31** cases
(plan says 30/30) and C2's reports **98** (plan says 97). This is an erratum-class observation
for the round lesson, not a judgement of the claims.

## Method

- A **control tree** is a byte-identical copy of `scripts/` (`cp -a`). For C2 it also carries
  `corpus/knowledge/omp-agent-root.md`, because `omp-census` resolves its default binding note
  from *its own* tree root (`DEFAULT_SELF`, `omp-census.mjs:136`); without it a copied tree
  reads `NOTE_MISSING` on every `--shape` arm. That is a copy-setup property, not a defect.
- A **mutant** is the control tree plus exactly one hunk that disables one behavior. Full
  unified diffs: `K81ExecMutate/diffs-c1.txt`, `K81ExecMutate/diffs-c2.txt`.
- Scoring: the frozen counter with `--tool <tree>` (fixture work dirs under scratch). `held` is
  the number of arms passed. A mutant is **killed** iff it fails at least one arm that the
  contemporaneous control passes.
- Controls: C1 `held=16/16` (`c1-control.txt`, `c1-control-rerun.txt`); C2 `held=15/15`
  (`c2-control-rerun.txt`, `c2-control-final.txt`). C2's *first* control read 13/15
  (`c2-control.txt`) because the lane's proxy was mid-flight — see §Lane drift below.

## C1 — `ready-handoff` vs `probe81-c1` (16 arms; control 16/16)

| mutant | diff hunk | held | first failing arm | verdict |
|---|---|---|---|---|
| `c1-m01-band` | `ready-handoff.mjs:146` band comparison → `if (false)` | 13/16 | `band-below` | killed |
| `c1-m02-attack` | `:186` attack arithmetic (`attack*100 < pct*total`) → `if (false)` | 14/16 | `attack-share` | killed |
| `c1-m03-connector` | `:187` `connectors > 2` → `if (false)` | 14/16 | `connector-cap` | killed |
| `c1-m04-planner` | `:165` planner branch → `if (false)` | 14/16 | `planner-refused` | killed † |
| `c1-m05-godspeed` | `:172` `firstLine !== '/skill:godspeed'` → `if (false)` | 14/16 | `godspeed-required` | killed |
| `c1-m06-lane-root` | `:173` `task.task.includes(laneRoot)` test → `if (false)` | 14/16 | `task-lane-root` | killed |
| `c1-m07-dispatch-outside` | `:112` `!inside(waveDir, dispatchPath)` → `if (false)` | 14/16 | `dispatch-escape` | killed † |
| `c1-m08-ready-keys` | `:136` ready key-set comparison → `if (false)` | 14/16 | `ready-keys` | killed |
| `c1-m09-duplicate` | `:162` `names.has(task.name)` → `if (false)` | 15/16 | `selftest` (arm 16) | killed ‡ |
| `c1-m10-trailer` | `:182` report-trailer condition → `if (false)` | 15/16 | `selftest` (arm 16) | killed ‡ |
| `c1-m11-realpath` | `:119` `!inside(realpathSync(waveDir), realpathSync(dispatchPath))` → `if (false)` | 16/16 | — | **SURVIVED** |

Each row's arm-by-arm counter output is `K81ExecMutate/c1-<mutant>.txt` (17 lines: 16 arms +
summary). Mutation proof is the captured `sha=` suffix in each summary.

## C2 — `omp-census` vs `probe81-c2` (15 arms; control 15/15)

| mutant | diff hunk | held | first failing arm | verdict |
|---|---|---|---|---|
| `c2-m01-captured` | `omp-census.mjs:173-175` `current` drops exact-key + `captured_at` type/ISO checks | 13/15 | `captured-at-required` | killed |
| `c2-m02-v1` | `:469` version gate also admits `kumitate-omp-shape-v1` | 13/15 | `shape-v1-refused` | killed |
| `c2-m03-invert-age` | `:479` `age > maxAge` → `age < maxAge` | 12/15 | `max-age-stale` | killed |
| `c2-m04-clock` | `:474` future-instant refusal → `if (false)` | 13/15 | `clock-future-refused` | killed |
| `c2-m05-age-exit` | `:493` exit 0 now also requires `maxAge !== null \|\| age <= 30` | 13/15 | `shape-age-backdated` | killed |
| `c2-m06-max-age` | `:479-482` staleness gate → `if (false)` | 13/15 | `max-age-stale` | killed |

Each row's output is `K81ExecMutate/c2-<mutant>.txt`. Every C2 mutant also fails arm 14
(`selftest`): m01/m02 crash the suite (`TypeError` at the `doc.captured_at.slice` disclosure
after the mutation lets a `captured_at`-less document through), m03–m06 end
`VERDICT: FAIL (n of 98 cases failed)`. In all six mutant runs arms 11–12 still pass
(`verdict=MATCH coverage_omp=10`, `injected=none`): the age never leaked into the score
surface for these mutants.

## Survivor analysis

### `c1-m11-realpath` — SURVIVED — **real coverage gap** (not a double guard)

`held=16/16` (`c1-m11-realpath.txt`). The only guard against a dispatch that is *lexically*
inside the wave dir but resolves outside through an intermediate symlink is the realpath check
at `ready-handoff.mjs:119`. No C1 arm and no case in the 31-case suite constructs that shape:

- `:112` (`inside(waveDir, dispatchPath)`) is lexical: `waveDir/link/x.json` reads as inside.
- `:117` (`!lst.isFile()`) refuses a dispatch that is itself a symlink, but `lstat` follows an
  intermediate symlink *directory*; the final component is a regular file either way.
- `:119` is the only layer that catches it.

Exploit transcript (`c1-m11-realpath-symlink.txt`), fixture: `waveDir/link → <scratch>/outside`,
dispatch `waveDir/link/x.json` outside the wave dir:

```
control (guard intact): READY_HANDOFF: FAIL-CLOSED PATH_UNSAFE (...)   exit 2
mutant  (guard off):    READY_HANDOFF: DRIFT BAND,CONTEXT_LANE_ROOT,SCRATCH_ROOT,
                        GODSPEED,TASK_LANE_ROOT,ATTACK_SHARE (1 seats outside 8:16) exit 1
```

The mutant read and judged the outside payload; the control refused it. The instrument is
correct — the counter cannot detect removal of this defense. Round-82 candidate arm:
`dispatch-symlink-escape` (intermediate-symlink fixture as above; expected
`FAIL-CLOSED PATH_UNSAFE`, exit 2, which the unmutated tool already prints).

### Killed-but-weak notes (no other survivors)

- `c1-m09-duplicate`, `c1-m10-trailer`: only arm 16 (the tool's **own** suite) fails. No frozen
  policy arm exercises `SEAT_DUPLICATE` or `REPORT_TRAILER`; arm 16 executes the suite from the
  mutated file, so a mutant that also adjusted its suite would survive. These two behaviors are
  not independently reached by the counter.
- `c1-m04-planner`: with the branch disabled the seat is still refused — `planner` is outside
  `ROLES`, so `ROLE_UNKNOWN` fires. Only arm 7's token requirement kills the mutant; the branch
  is behaviorally redundant, token-critical.
- `c1-m07-dispatch-outside`: without the lexical guard an escaping handoff still fails closed
  (`DISPATCH_ABSENT`, exit 2, because the escape target does not exist); arm 13 kills on the
  guard's token, not on safety. The fail-closed property survives the mutation.
- `c2-m03-invert-age` is the only mutant failing two independent arms (6 and 7) plus the suite.

## Lane drift observed during the battery (not caused by mutants)

- 10:00:25Z lane C2 run: `held=13/15`; arms `stale-does-not-score` and `proxy-terms-unchanged`
  red with `exit=1 verdict=DRIFT coverage_omp=10`. `proxy-live.json` findings:
  `C2_TOTAL_DRIFT declared=201 computed=202` and `AXES_DRIFT coverage declared=10 computed=9`
  — the round's own `corpus/lessons/round-81.md` had landed before the stanza was re-measured.
  The first C2 control copy reproduced exactly those two red arms (`c2-control.txt`).
- 10:02:00Z: `SCORECARD.md` and `corpus/lessons/round-81.md` were updated; the stanza now reads
  `C2=202 C2_total=202` (`SCORECARD.md:298-299`), the proxy reads `MATCH`
  (`proxy-live-2.json`), and control + lane reruns read 15/15.
- **All six C2 mutant scores were taken 10:02:32–33Z**, after that update; arms 11–12 pass in
  each. Every C2 kill comes from arms 1–10, 13–15, or 14, so the verdicts do not rest on the
  drifted arms. `SCORECARD.md` was edited again at 10:04:11Z; the final control (10:04:26Z,
  `c2-control-final.txt`) still reads 15/15 and `proxy-live-3.json` still reads `MATCH`.

## Evidence index (this directory)

- `sha256-instruments.txt` — the six scored bytes.
- `c1-baseline.txt`, `c2-baseline.txt`, `c2-baseline-rerun.txt`, `c1-control.txt`,
  `c1-control-rerun.txt`, `c2-control.txt`, `c2-control-rerun.txt`, `c2-control-final.txt`.
- `c1-m01-band.txt` … `c1-m11-realpath.txt` — per-mutant counter output.
- `c2-m01-captured.txt` … `c2-m06-max-age.txt`.
- `diffs-c1.txt`, `diffs-c2.txt` — full unified diffs of every mutant.
- `c1-m11-realpath-symlink.txt` — survivor exploit transcript.
- `proxy-live.json`, `proxy-live-2.json`, `proxy-live-3.json` — lane proxy state at 10:00,
  10:03, 10:05 (`C2_TOTAL_DRIFT` then `MATCH`).

## Cleanup

All control/mutant trees, the symlink fixture and the probe work dirs lived under
`/fast/scratch/hyaku/kumitate-r81/K81ExecMutate/` and were deleted after this report was
written. The only lane writes are this report and the evidence directory above.
