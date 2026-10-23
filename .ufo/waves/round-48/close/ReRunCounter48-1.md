# ReRunCounter48-1 — C1 kill-rule re-run, run 1 of 2 — report

Seat: `kumitate-r48-close-ReRunCounterA` (instance `-2`). Date: 2026-10-23 (local -03).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, HEAD `ce9aee5daf71004a5890134f9526cc6fe424b206` — the C1 commit / lane tip. Verified read-only before the run (`git rev-parse --verify`, and `git cat-file -p HEAD:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum` byte-identical to the working-tree counter).

Command, exactly as assigned (foreground, `TMPDIR=/tmp`):

```sh
timeout -k 10 1800 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin ce9aee5daf71004a5890134f9526cc6fe424b206 --set r48
```

Counter sha256 at run time: `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` — the A48-amended frozen counter (output rule label `F48+A48`; provenance: plan.md attempt-2 addendum §A48 and `close/ReRunR47Set-receipt.txt:22-24`). Amended pre-data, before any candidate score; no post-score amendment.

## Result — held= line, verbatim

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
```

Site lines, verbatim:

```
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
```

**exit=0.** Not an exit-2 run: no classification required, and this run is a score, never a recorded non-score. All 8 RUN lines read `exit=0 … verdict_pass=true fail_lines=0` (round-gate 61/61 ×4, surface-probe 46/46 ×4); rev exec totals 2120 (round-gate) and 180 (surface-probe) in every rev run; `resumed=` varies (round-gate 57/57/76, surface-probe 0/0/3) — three genuinely distinct traces, each parsed fail-closed clean.

Receipt: `close/ReRunCounter48-1-receipt.txt` — sha256 `fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2`. Trailer, verbatim:

```
exit=0 start=2026-10-23T16:01:13-03:00 end=2026-10-23T16:03:30-03:00 load1_start=28.16 load1_end=45.92
```

## Provenance note — superseded run-1 receipt at this path

This item was dispatched twice (two seat instances, same item text, same receipt path). The first instance's run 1 (window 15:59:23–16:00:35 -03, exit 0, `held=4/4`, receipt sha256 `48088fe3fc09e219f9c9aaa48a9c013f69c84c8c0d853830bf4dcc39b8dffccf`) wrote this path at 16:00:35 and an earlier version of this report; this run's receipt overwrote that file at 16:03:30. The first instance parked its verbatim stdout+trailer at `close/ReRunCounterA-original-receipt-run1.txt` (sha256 of the parked close/ file: `92f692d85ca948852c7de53cb78825f000c6a23da4d545ac409547e2b13dd3c1`; byte-identical body in `/tmp/ReRunCounterA-original-receipt-run1.txt`, sha256 `272053f753cd935c27790d7143a83d1c53f82e5ed54513beb0cade698bf6bca0`). Its trailer, verbatim:

```
exit=0 start=2026-10-23T15:59:23.442168-03:00 end=2026-10-23T16:00:35.054492-03:00 load1_start=23.52 load1_end=27.18
```

That reading also scored `held=4/4` exit 0. This report now describes the receipt actually on disk at the assigned path.

## Integrity

- The counter writes only per-run scratch under `/fast/scratch/hyaku/kumitate-r48/probe-runs/` (random 4-hex suffix, `rmSync`ed on completion). This run's scratch dirs were removed; observed leftovers at 16:04 (`f00cf278a5ab-base0-473f4f64`, `0bd8be60d915-base0-*` at 15:42/16:04) belong to other concurrent probe runs.
- The lane worktree's only delta attributable to this run is the receipt file. `git status --porcelain` modifications to `LOG.md`, `SCORECARD.md`, `corpus/{QUALITY,README,SOURCES}.md` (mtimes 16:01:31–16:02:49) are concurrent L1/scribe activity in the shared working tree — the probe has no worktree-write path, and this seat wrote only `/tmp` and `close/`.
- No installs (none needed); no pacman; no delegation; foreground commands only; read-only git.
