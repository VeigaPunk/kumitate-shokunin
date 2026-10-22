RESULT CritRedHeadroom rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=mixed accepted=188/196 recipe=/fast/scratch/hyaku/kumitate-r40/seats/CritRedHeadroom/headroom-attack.py
The R39-3 before-value is reproduced exactly at open: in the census note (S8), 73 new false anchors at a fresh path read CLEAN and the 74th is refused (DEBT_GREW). Every attack inside the headroom was accepted, every attack past it refused, with no out-of-order verdicts. The open gate does NOT already refuse this attack.
Scope: own clones lane/ and lane2/ under /fast/scratch/hyaku/kumitate-r40/seats/CritRedHeadroom/, detached at f69817ed; src /fast/scratch/hyaku/kumitate-pin/src at 31c465f1. No installs or updates. Lane: only this file written.
1. The gate and pins are unchanged since round 39: `git diff --stat 3908f322 f69817edf -- scripts/anchor-truth.mjs .ufo/pins/` prints nothing.
2. Headroom is base debt minus open debt, per note (base e18ff1af pin vs HEAD pin): census 77-4=73, route-probe-cluster 74-16=58, sighting-wall 22-0=22, native-trial-launch 35-0=35, total 188.
3. Control, unedited: `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src` gives `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 …)`, exit 0. Re-pinning with no edit (`headroom-attack.py lane <src> census=0`) gives `TRUTH: PINNED (… debt=20 …)`, and `git diff --stat` is empty, so `--write-pin` reproduces the committed pin byte for byte.
4. Recipe: `python3 headroom-attack.py <clone> <src> NOTE=N [...] [--kind false|dead|unchecked]`. It restores the notes and the pin from HEAD and appends N paragraphs like ``The headroom marker `NO_SUCH_SYMBOL_<NOTE>_<i>` is at `packages/contract-support/src/batteries.ts:1`.``. No note cites that file at base or open. It then runs `--write-pin` (exit 0, PINNED in all 196 runs) and the open gate with `--base e18ff1af…`. The base pin is read by `git show`, so no commit is needed. The committed-tree runs in step 7 give the same verdicts.
5. Linear sweep, N=1 to headroom+2 for each note (196 runs, full log in sweep.txt in the seat dir):
   - census: n=1..73 `gate_exit=0 verdict=CLEAN`, with n=73 at debt=77. n=74: `gate_exit=1 TRUTH  DEBT_GREW  corpus/knowledge/remaining-scripts-census.md#-  debt 77 -> 78`. n=75 is refused too.
   - route-probe-cluster: n=1..58 CLEAN (debt=74). n=59 DEBT_GREW (74 -> 75), exit 1.
   - sighting-wall: n=1..22 CLEAN (debt=22). n=23 DEBT_GREW (22 -> 23), exit 1.
   - native-trial-launch: n=1..35 CLEAN (debt=35). n=36 DEBT_GREW (35 -> 36), exit 1.
   - Accepted: 188 of 196 runs. Refused: the 8 runs past the headroom, all by DEBT_GREW alone. No CLEAN came after a DRIFT.
6. Variants (variants.txt):
   - all four notes at their headroom (73+58+22+35=188 new false anchors in one edit): `TRUTH: CLEAN (notes=4 anchors=999 true=778 debt=208 …)`, exit 0. Adding one more in census or in native gives exit 1, `DEBT_GREW … debt 77 -> 78` or `35 -> 36`. The round-39 note that headroom across all notes is 188 was marked INFERENCE; it is now observed.
   - `--kind dead` (anchors at a path missing from the source, pinned debt:dead): census=73 CLEAN, exit 0; census=74 DEBT_GREW, exit 1. Dead and false anchors share the same headroom.
   - `--kind unchecked` (anchors with no paired symbol): census=2000 gives `TRUTH: CLEAN (notes=4 anchors=2811 true=778 debt=20 unchecked=2013 …)`, exit 0. This attack has no limit. Unchecked anchors are counted neither as debt nor as true, so neither DEBT_GREW nor CHECKED_SHRANK sees them. This is a second way past the headroom fix: a repair that only caps debt still accepts this attack.
   - round 39's own script, `python3 .ufo/waves/round-39/final/limit-debt-trade.py.txt <lane2> <src>` at f69817ed (un-anchor debt entry #99, add one false anchor, hand-written pin): `TRUTH: CLEAN (… debt=20 …)`, exit 0. The one-for-one trade is still accepted.
7. Committed-tree replay in lane2 (gate run on a clean tree after a scratch commit):
   - census-73 at 8062119f: exit 0, CLEAN.
   - census-74 at ff5fa19d: exit 1, DRIFT DEBT_GREW.
   - all notes at 188 (f488079c): exit 0, CLEAN.
   - all notes at 189 (6cc8f10f): exit 1, DRIFT.
   - unchecked 2000 (01544c1f): exit 0, CLEAN.
8. Replay patches, all `git apply --check` clean against f69817ed, in /fast/scratch/hyaku/kumitate-r40/seats/CritRedHeadroom/patches/: census-73.patch, census-74.patch, census-73_route-58_wall-22_native-35.patch, census-74_route-58_wall-22_native-35.patch, census-2000_kind-unchecked.patch. Each patch carries the note edit and the re-pinned anchor-truth.json. On a repaired gate, apply the patch and run the checklist command. If the repair changes the pin schema, re-run headroom-attack.py instead.
Impacted axes: operability (C1 R39-3). The before-value "73 new false anchors at a fresh path read CLEAN" is confirmed, with 74 as the first refused.
Smallest safe correction for the judge to weigh: compare debt to the open pin's own count, or forbid any new non-true identity (raw@path#n) that is absent at base, rather than comparing to the frozen base count. Apply the same rule to new `unchecked` identities, or the 2000-anchor variant survives the fix.
