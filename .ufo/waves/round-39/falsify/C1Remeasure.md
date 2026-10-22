# C1Remeasure — kumitate round 39 (repair-first recovery), coverage:script-layer

RESULT C1Remeasure rev=3908f322c4c473f1a8b45c8d1c14054205eb7647 verdict=confirmed open=58/62 candidate=59/62 losses=0

## Axes (godspeed)
measurement fidelity (both revs in own clone) · provenance (block sha equality) · wrapper semantics (rebind-only) · report completeness/timeliness.

## Setup
- Own clone: `git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r39/seats/KumitateR39.C1Remeasure/lane && git -C ... checkout -q --detach 3908f322c4c473f1a8b45c8d1c14054205eb7647`; HEAD verified `3908f322c4c473f1a8b45c8d1c14054205eb7647`; `git cat-file -t fac39171ac28c606e90da75fc2ba2ed3df52f4ea` = commit.
- Pinned src: `git -C /fast/scratch/hyaku/kumitate-r39/src rev-parse HEAD` = `31c465f15669f744848bd9f5d56191c5085670f7` (matches pin; default r36 path never used).
- No tools installed (python3 + git only); no pacman transactions.

## 1. CLOSURE_BLOCK sha256 == sha256 of last python block in the round-38 lesson
I extracted the block myself from committed blobs at both revisions (independent regex fence scan and the probe's rindex method agree byte-for-byte; each lesson blob has exactly one ```python fence):
- sha256 of last python block, measured rev 3908f322 and open rev fac39171 (identical bytes): `f4ecff36b198b1e4244fa69dceebb1c51fbeeb50a5f6bb2c1d0765e94783aaf5` (block ends with a trailing newline; without it the sha is `7acc76a53f2ea0e626733dae55d864260feb4220d5e1efeb0d8808478dc99802` — noted to preempt a byte-boundary dispute).
- Probe-printed `CLOSURE_BLOCK sha256=` at both runs: `f4ecff36b198b1e4244fa69dceebb1c51fbeeb50a5f6bb2c1d0765e94783aaf5`. Equal. CONFIRMED.

## 2. measure-c1.py rebinds only `src` and `delivered`
Source read: probe extracts the block from the committed lesson blob at --rev, applies exactly two `re.subn(..., count=1)` calls (`^src='[^']*'$` and `^delivered='[0-9a-f]{40}'$`), asserts `(n1, n2) == (1, 1)`, then `exec(compile(block, 'round-38-closure-block', 'exec'), {'__name__': 'closure'})` — exec globals carry only `__name__`, no other name is seeded, and no other text is mutated. Byte-level diff of block before/after rebinding shows exactly two changed lines and no line-count delta:
- `src='/fast/scratch/kumitate-r36/src'` -> `src='/fast/scratch/hyaku/kumitate-r39/src'`
- `delivered='89ff4a74d92d71575687f407311c82abfac53ff7'` -> `delivered='<rev under test>'`
CONFIRMED: rebinds only `src` and `delivered`; all other block logic is the round-38 closure's own code.

## 3. Measured runs (command: `python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-39/probe/measure-c1.py.txt --lane <my clone> --rev <rev> --src /fast/scratch/hyaku/kumitate-r39/src`; both rc=0)
Open rev fac39171ac28c606e90da75fc2ba2ed3df52f4ea:
- CLOSURE_BLOCK sha256=f4ecff36...aaf5
- native-trial-launch anchors 54, before_true 19, after_true 53, gains 34, losses 0, prior62 21, prior62_corrected 21
- remaining-scripts-census anchors 521, before_true 357, after_true 410, gains 53, losses 0, prior62 27, prior62_corrected 23
- route-probe-cluster anchors 165, before_true 46, after_true 96, gains 50, losses 0, prior62 6, prior62_corrected 6
- sighting-wall anchors 71, before_true 47, after_true 69, gains 22, losses 0, prior62 8, prior62_corrected 8
- production e18ff1af3392e3823227644c977c237737fe65c9 {unchecked 136, debt 208, true 467} mismatches []
- production fac39171ac28c606e90da75fc2ba2ed3df52f4ea {unchecked 13, debt 21, true 777} mismatches []
- baseline_true_changes []
- PRIOR62_CORRECTED 58/62 measured_rev=fac39171ac28c606e90da75fc2ba2ed3df52f4ea
- OLD_TOKEN_LOSSES 0

Measured production rev 3908f322c4c473f1a8b45c8d1c14054205eb7647:
- CLOSURE_BLOCK sha256=f4ecff36...aaf5 (same)
- native-trial-launch anchors 54, before_true 19, after_true 53, gains 34, losses 0, prior62 21, prior62_corrected 21
- remaining-scripts-census anchors 521, before_true 357, after_true 411, gains 54, losses 0, prior62 27, prior62_corrected 24
- route-probe-cluster anchors 165, before_true 46, after_true 96, gains 50, losses 0, prior62 6, prior62_corrected 6
- sighting-wall anchors 71, before_true 47, after_true 69, gains 22, losses 0, prior62 8, prior62_corrected 8
- production e18ff1af3392e3823227644c977c237737fe65c9 {unchecked 136, debt 208, true 467} mismatches []
- production 3908f322c4c473f1a8b45c8d1c14054205eb7647 {unchecked 13, debt 20, true 778} mismatches []
- baseline_true_changes []
- PRIOR62_CORRECTED 59/62 measured_rev=3908f322c4c473f1a8b45c8d1c14054205eb7647
- OLD_TOKEN_LOSSES 0

## Verdict vs declared claims
- C1 open claim 58/62, losses 0 at fac39171 — matches measured run exactly.
- C1 measured claim 59/62, losses 0 at 3908f322 — matches measured run exactly.
- The open->measured delta is exactly one anchor: remaining-scripts-census prior62_corrected 23->24, after_true 410->411, lane `true` 777->778 with `debt` 21->20; consistent with the single S8#475 re-cite (:560 -> :560-572) flipping one debt anchor to true. No other group moved.
- Frozen truth floor e18ff1af tallies identical across both runs, mismatches [] — no baseline drift.

## Residual risk / verification gaps
- The round-38 lesson blob is byte-identical at both revs, so hash equality is over the same text at both; a future lesson edit would need re-extraction.
- The exec'd block is round-38 closure code; correctness of its internal anchor truth logic is outside this seat's scope (this seat only verified identity, rebind surface, and reproduced tallies). The C2 open limits (unbound review:<seat> sources; debt-trade against a raw with no base-true anchor) belong to the C2 claim seats, not measured here.
- Raw run transcripts kept at /fast/scratch/hyaku/kumitate-r39/seats/KumitateR39.C1Remeasure/measure-{open,measured}.out and lesson-{open,measured}.md.

No tools were installed or upgraded (python3, git, node preexisting; pacman untouched).
