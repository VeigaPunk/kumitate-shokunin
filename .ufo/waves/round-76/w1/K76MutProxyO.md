# K76MutProxyO — C1 derivation mutation battery

Axes: operability + coverage. Base examined: `cabc7aefd5f1562299f757e23207710c12e4ed58`; node v24.21.0. Frozen plan read first and left unchanged. No tools installed. No production files edited; only this seat's build artifacts/report were written.

## Deliverables

All relative paths below resolve under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/`:

- `.ufo/waves/round-76/build/K76MutProxyO/mutants.mjs`
- `.ufo/waves/round-76/build/K76MutProxyO/mutants-c1.json`
- `.ufo/waves/round-76/build/K76MutProxyO/shape-root.mjs` (required helper)
- `.ufo/waves/round-76/build/K76MutProxyO/standin/` (six-arm CLI fixture, synthetic scorecard/note, twelve-member root, and `scripts/constant-printer.mjs`, the M2 constant variant)
- `standin-proof.json`, `acceptance-proof.json`, `discipline-proof.json`, `source-restoration.json` in the same build directory.

The runner uses plain recursive copies excluding `.git`/`node_modules`. Each command runs on a fresh pristine copy, a separately refreshed mutated copy, and a separately refreshed restored copy. The same expected exit/token must pass pristine and restored, otherwise NOT-EVALUABLE. Raw outputs and SHA-256 before/mutated/restored values are emitted on stderr and captured in `standin-proof.json`. The source tree is never written.

`expectExit`/`expectToken` describe the pristine detector result. KILLED means the mutation changes that result, not that the detector happened to fail on baseline. Bad tree/list or find-count !=1 exits 2. A survivor or inconclusive baseline exits 1. When a detector never runs, exit/token are `-` rather than invented values.

## Actual stand-in results

Invocation:

```sh
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutProxyO
OMP_AGENT_ROOT="$B/standin/.fixtures/omp-root" OMP_FIXTURE_ROOT="$B/standin/.fixtures/omp-root" \
node "$B/mutants.mjs" --tree "$B/standin" --list "$B/mutants-c1.json" \
  --work /fast/scratch/hyaku/kumitate-r76/K76MutProxyO/work
```

```text
M1 KILLED exit=1 token=miss
M2 KILLED exit=1 token=miss
M3 KILLED exit=2 token=miss
M4 KILLED exit=0 token=miss
M5 KILLED exit=0 token=miss
M6 KILLED exit=1 token=miss
tally: selected=6 evaluated=6 killed=6 survived=0 not-evaluable=0 (baseline-inconclusive=0 spawn=0 find-fail=0)
exit=0
```

M2 changes the derivation to constant 10: it is killed by the dirty-root value check (expected 9), not by a live-root check expecting 10. The separately delivered constant-printer file contains that same M2 replacement. The stand-in models the six requested arms only: it does not model the parent's seventeen terms, pins, or full census note binding. Its twelve good members plus one bogus member score `floor(10*12/13)=9`; the real 64-member root plus one bogus member also scores 9. This proof is **not** evidence that the real C1 patch passes.

Other actual probes (`acceptance-proof.json`, `discipline-proof.json`):

- Bad tree: exit 2, `mutants: --tree .../absent is not a readable directory`.
- Duplicate M3 find: `M3 NOT-EVALUABLE(find=2) exit=- token=-`, exit 2.
- No-op M2 replacement: `M2 SURVIVED exit=1 token=hit`, runner exit 1.
- Deliberately wrong baseline expectation: `M2 NOT-EVALUABLE(baseline) exit=1 token=hit`, runner exit 1 — never counted as a kill.
- JSON parsed successfully; ids exactly M1, M2, M3, M4, M5, M6.

## L1 invocation on final bytes

```sh
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76MutProxyO
node "$B/mutants.mjs" --tree /ABSOLUTE/PATH/TO/MEASURED/CHECKOUT \
  --list "$B/mutants-c1.json" --work /fast/scratch/hyaku/kumitate-r76/L1-mutant-work
```

`--only M2` selects a single mutant. Do not inherit the stand-in's OMP_AGENT_ROOT/OMP_FIXTURE_ROOT when measuring the real host. M1/M2 default fixture source is `$HOME/.omp/agent`; M4 uses the tool's default root. The live root measured **20G**, so copying its contents is forbidden/unnecessary: `shape-root.mjs` recreates only depth-one names/kinds/modes with empty files, then adds one bogus member. It never reads member contents. Commands run exclusively inside disposable tree copies.

M5 changes only the scorecard fixture's coverage:omp Axes value to 9. The pristine detector must report AXES_DRIFT for `coverage:omp`; a missing AXIS_ROWS entry suppresses that finding. M6 appends an O2/no row: C1o/C1o_total must become 1/2 and coverage_omp must become 5.

## NOT-EVALUABLE until patch: exact find literals

All six have **0** literal occurrences in base `scripts/proxy-check.mjs` (measured and recorded in `acceptance-proof.json`):

| id | find |
|---|---|
| M1 | `(O_members - O_findings) / O_members` |
| M2 | `Math.floor(10 * (C1o / C1o_total) * ratio)` |
| M3 | `return failClosed(opts, 'OMP_ROOT_NOT_A_DIR',` |
| M4 | `return failClosed(opts, 'OMP_NOTE_MISSING',` |
| M5 | `  { axis: 'coverage:omp', term: 'coverage_omp' },` |
| M6 | `const yesRows = oRows.filter((cells) => cells[3].trim().startsWith('yes'));` |

These are **stand-in implementation spellings**, not exact code required by the frozen plan. The plan specifies behavior, not local variable names. The final implementation may need literal re-pointing, especially M1/M2/M6; absent/ambiguous literals fail closed rather than silently claiming a kill. Re-point only the syntax-bearing literal, preserve the frozen six mutant intents and detector expectations, and rerun pristine/mutated/restored phases. No real-patch mutant verdict is claimed here.

## Restoration evidence

Every six-arm run records matching before/restored hashes `c7b134c900e929ff10edfbfa57b4b9ce5f22ec201ffce2c3e26f114278e8b5a7`, distinct mutated hashes, and restored detector outputs matching baseline. Full actual outputs are in `standin-proof.json`.

Scratch-clone files equal the committed base bytes (`git show` byte comparison, all true):

- proxy-check: `92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e`
- omp-census: `c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed`
- SCORECARD: `529507eff83e9df8a55c00ffa9faaa2ce9e6a2b4ed85d8cf1518aafac6a591cf`

Only the explicit scratch checkout changed its own git working state as requested by setup. No commits/pushes/index writes were made in the lane. Scratch is removed before yield.

Self-evaluation: accuracy 4 (real patch not exercised, explicitly scoped); completeness 4 (all acceptance probes exercised, final literal alignment necessarily pending real bytes); clarity 4 (raw receipts separate from summary); actionability 4 (exact command/helper shipped; three likely spelling re-points named); conciseness 4 (full evidence retained externally). Overall 4.0. Main action: align final literals without changing six mutant intents, then rerun the supplied command.
