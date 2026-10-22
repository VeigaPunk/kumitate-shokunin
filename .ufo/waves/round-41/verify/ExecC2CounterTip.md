RESULT ExecC2CounterTip rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=confirmed mismatches=0 rows=7/7 caps=2 e4=1 e3=0

# ExecC2CounterTip — C2 counter re-run at the tip and at the before revision

Scope: re-run the committed C2 counter `bash .ufo/waves/round-41/probe/wave-recount.sh.txt`
from a detached clone root at `fae386aa9e0542710b7a893d84c8e92e86fc079b` and at `27592977`
(the before revision, where the instrument is absent), paste both outputs whole, then
independently confirm that each side of the recount listed 7 payload rows at the tip by
printing the two listings myself with the same jq expressions.

Verdict: CONFIRMED. The claimed tip values `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2
EXPECT_4_EXIT=1 EXPECT_3_EXIT=0` and the claimed before values `RECOUNT_MISMATCHES=7
CAPABILITY_ROWS=1 EXPECT_4_EXIT=1 EXPECT_3_EXIT=1` reproduce exactly. Both listings hold 7
rows at the tip (one row per committed payload), so the zero is a real match, not the
empty-on-empty zero the falsify report warned about.

Environment: node v24.21.0, jq-1.8.2 (`/home/vgpnk/.local/bin/jq`; `jaq 3.1.1` is the session
shell's built-in and does not shadow the binary in the probe's child shell), git 2.56.0. Nothing
installed or updated. Scratch clone `/fast/scratch/hyaku/kumitate-r41a2/seats/ExecC2CounterTip/lane`,
detached at `fae386aa`, clean `git status`.

Frozen counter: `git log --diff-filter=A` shows the probe added in `2759297` and the instrument
in `4e58bb0` — the counter was committed before its first counted run. The probe bytes are
sha256 `388bda9678f8b568e55ae157fbdedbf7a55dd68d56b54659e4fa0f11785d2112` at `27592977`,
`4e58bb0e`, `5320e0da` and `fae386aa` — identical at all four revisions.

## TIP — rev fae386aa9e0542710b7a893d84c8e92e86fc079b

Command: `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` (exit 0)

```
## jq recount
38 build seats=90 connector=1 critic=3 executor=3 reviewer=39 scout=41 scribe=2 sentinel=1
38 falsify seats=88 connector=1 critic=1 mutation-tester=3 reviewer=55 scout=27 sentinel=1
39 build seats=46 connector=1 critic=10 executor=3 mutation-tester=11 reviewer=7 scout=5 scribe=3 sentinel=6
39 falsify seats=37 connector=1 critic=10 executor=3 mutation-tester=4 reviewer=7 scout=5 scribe=1 sentinel=6
39 residual seats=8 critic=5 reviewer=3
40 build seats=32 connector=1 critic=8 executor=7 mutation-tester=3 reviewer=3 scout=6 scribe=4
40 falsify seats=35 connector=1 critic=12 mutation-tester=7 reviewer=12 scout=2 sentinel=1
## wave-census
38 build seats=90 connector=1 critic=3 executor=3 reviewer=39 scout=41 scribe=2 sentinel=1
38 falsify seats=88 connector=1 critic=1 mutation-tester=3 reviewer=55 scout=27 sentinel=1
39 build seats=46 connector=1 critic=10 executor=3 mutation-tester=11 reviewer=7 scout=5 scribe=3 sentinel=6
39 falsify seats=37 connector=1 critic=10 executor=3 mutation-tester=4 reviewer=7 scout=5 scribe=1 sentinel=6
39 residual seats=8 critic=5 reviewer=3
40 build seats=32 connector=1 critic=8 executor=7 mutation-tester=3 reviewer=3 scout=6 scribe=4
40 falsify seats=35 connector=1 critic=12 mutation-tester=7 reviewer=12 scout=2 sentinel=1
## diff
RECOUNT_MISMATCHES=0
CAPABILITY_ROWS=2
EXPECT_4_EXIT=1
EXPECT_3_EXIT=0
```

Matches the committed receipt `final/wave-recount-measured-4e58bb0e.txt` byte for byte (that
receipt's `# rev` line is the only difference). Matches the untracked lane receipt
`final/wave-recount-final.txt` byte for byte modulo its two `#` header/footer comment lines.

## BEFORE — rev 27592977e9ff331e02ff2ed8da9bd39f3995efa6

Command: `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` (exit 0). Stderr printed three
node `MODULE_NOT_FOUND` traces, one per census invocation; stdout:

```
## jq recount
38 build seats=90 connector=1 critic=3 executor=3 reviewer=39 scout=41 scribe=2 sentinel=1
38 falsify seats=88 connector=1 critic=1 mutation-tester=3 reviewer=55 scout=27 sentinel=1
39 build seats=46 connector=1 critic=10 executor=3 mutation-tester=11 reviewer=7 scout=5 scribe=3 sentinel=6
39 falsify seats=37 connector=1 critic=10 executor=3 mutation-tester=4 reviewer=7 scout=5 scribe=1 sentinel=6
39 residual seats=8 critic=5 reviewer=3
40 build seats=32 connector=1 critic=8 executor=7 mutation-tester=3 reviewer=3 scout=6 scribe=4
40 falsify seats=35 connector=1 critic=12 mutation-tester=7 reviewer=12 scout=2 sentinel=1
## wave-census
## diff
1,7d0
< 38 build seats=90 connector=1 critic=3 executor=3 reviewer=39 scout=41 scribe=2 sentinel=1
< 38 falsify seats=88 connector=1 critic=1 mutation-tester=3 reviewer=55 scout=27 sentinel=1
< 39 build seats=46 connector=1 critic=10 executor=3 mutation-tester=11 reviewer=7 scout=5 scribe=3 sentinel=6
< 39 falsify seats=37 connector=1 critic=10 executor=3 mutation-tester=4 reviewer=7 scout=5 scribe=1 sentinel=6
< 39 residual seats=8 critic=5 reviewer=3
< 40 build seats=32 connector=1 critic=8 executor=7 mutation-tester=3 reviewer=3 scout=6 scribe=4
< 40 falsify seats=35 connector=1 critic=12 mutation-tester=7 reviewer=12 scout=2 sentinel=1
RECOUNT_MISMATCHES=7
CAPABILITY_ROWS=1
EXPECT_4_EXIT=1
EXPECT_3_EXIT=1
```

Stderr first line: `Error: Cannot find module '…/lane/scripts/wave-census.mjs'`. The committed
receipt `final/wave-recount-before-27592977.txt` records the same stdout with node errors
trimmed to their first line; the payloads, the diff block and the four counters all agree.

## The 7-rows check (independent recount, same jq expressions)

Side A (jq recount), side B (wave-census `--json`), printed separately in the same clone at the
tip with the probe's own jq programs — both hold 7 lines and diff to 0 differing lines:

- Side A: `.ufo/waves/round-{38,39,40}/*-dispatch.json` → `(.taskCall // .) | .tasks` →
  `seats=\(length)` + `group_by(.agent)` → `ROWS_A=7`.
- Side B: `node scripts/wave-census.mjs --round 38 --round 39 --round 40 --json` →
  `.rounds[].waves[]` → `ROWS_B=7`; `diff` of the two files is empty (`DIFF_LINES=0`).

The glob finds exactly 7 payload files (`find` confirms none exist outside those three round
dirs): 38 build/falsify, 39 build/falsify/residual, 40 build/falsify — 7 rows map 1:1 to 7 files.
Seat total 336 = 90+88+46+37+8+32+35, matching the falsify report's seat census. The
`39 residual` row is a bare `{context,tasks}` payload (no `taskCall`); both sides read it
(`seats=8 critic=5 reviewer=3`) because the probe uses `.taskCall // .` and the census handles
the bare shape.

## Can the counter see a difference? (scratch mutants, probe bytes unchanged)

Run on scratch copies under `/fast/scratch/hyaku/kumitate-r41a2/seats/ExecC2CounterTip/`:

- Mutant A (side A skips round 39 entirely): `RECOUNT_MISMATCHES=3`.
- Mutant B (side A drops one payload, `round-39/build-dispatch.json`): `RECOUNT_MISMATCHES=1`.
- Mutant D (side A prints `reviewer=38` for `38 build`): `RECOUNT_MISMATCHES=2`.
- Mutant F (side A prints `39 build seats=45`): `RECOUNT_MISMATCHES=2`.
- Mutant G (instrument `seats: tasks.length + 1` in a scratch tree): `RECOUNT_MISMATCHES=14`,
  every row `<`/`>`; the instrument's own `--selftest` also flips to `16/23 VERDICT: FAIL`.
- Equivalent mutant E (side A applies `group_by(.agent | ascii_downcase)`): `0` — survives
  because every agent name is already lowercase; an equivalent mutant, not a real survivor.

## Two real weaknesses (both already recorded as open limits; confirmed live at the tip)

- F1 — the counter prints `RECOUNT_MISMATCHES=0` on two empty listings and exits 0. A stand-in
  `jq` that exits 127 → `ROWS_A=0 ROWS_B=0`, `RECOUNT_MISMATCHES=0`, `PROBE_EXIT=0` (node also
  logs an `EPIPE` on stderr). A scratch tree with no round dirs → `CAPABILITY_ROWS=0`,
  `EXPECT_4_EXIT=2`, `EXPECT_3_EXIT=2`, `PROBE_EXIT=0`. The probe's last command is `rm -f`, so
  its exit code always reads 0 and carries no signal — a caller must read the printed counters.
  The counter does not check that each side has 7 rows. At the tip the 7 is real (verified
  above); the weakness is the instrument's, not the measurement's. Recorded in the lesson's
  open limits.
- The `--expect` pair is a able-to-fail demo on R40-6, not a counter assertion on rounds 38–40:
  `--round 40 --expect build:mutation-tester=4` prints `FINDING EXPECT_MISMATCH … payload=3`
  and exits 1; `=3` prints `WAVE_CENSUS: CLEAN` and exits 0. Verified.

## Receipt pointers (observations, no claim changes)

- SCORECARD row 41 capability cell at the committed tip says `selftest 12/12`. Measured: `12/12`
  at `4e58bb0e`, `20/20` at `5320e0da`, `23/23` at `fae386aa` (WC21–WC23 added in the tip
  commit). The L1's uncommitted working-tree edit corrects the cell to `selftest 12/12 at
  4e58bb0e (23/23 at fae386aa; the three values are byte-identical at 4e58bb0e, 5320e0da and
  fae386aa)` — verified: the probe output is sha256 `affba5d7…` at all three revisions.
- The committed lesson cites `wave-recount-final.txt`; that file is untracked in the lane
  working tree, not committed at the tip (`git cat-file -e` fails). The untracked receipt's
  row-count note covers only the jq recount side (`# rows per listing (jq recount): 7`); my
  independent check covers both sides (7/7).

## Risks and blockers

- None blocking. Both runs reproduce the stated values; the counter is deterministic and frozen.
- Lane tip moved while I measured: after `fae386aa` the L1 committed `57269a55e5868ecd99fd2f2b72944b7145343024`
  ("attempt 2 verify wave (38 seats) … WC24–WC26 … 26/26; C1 and C2 tip receipts at fae386aa").
  Verified at `57269a55` in this clone: `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1
  EXPECT_3_EXIT=0`, `WAVE_CENSUS_SELFTEST: 26/26`, and the probe bytes are the same sha256
  `388bda96…` — the counter is still frozen and the 7-row result is unchanged. The receipt the
  committed lesson named (`wave-recount-final.txt`) is now committed at the new tip.
- The lane working tree earlier held uncommitted L1 edits (`SCORECARD.md`, `LOG.md`,
  `corpus/lessons/round-41.md`, `evidence-seat-gate.txt`, untracked `final/*` and `verify-*`);
  none changed the committed tip I measured at `fae386aa`.

Files changed: none in the lane (this report only). No patch is produced. Scratch artifacts:
`/fast/scratch/hyaku/kumitate-r41a2/seats/ExecC2CounterTip/` (clone `lane/`, `probe-<rev>.txt`,
`mutant-*.sh.txt`). No git index, refs, commits or pushes were made.
