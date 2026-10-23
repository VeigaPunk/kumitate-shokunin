RESULT ExecR43ShippedReceipt rev=b01ded32 verdict=ERROR frozen=38/41 exit=2

# R43-3 — frozen round-43 gate-mutants counter over the SHIPPED tip b01ded32

One counter run, as instructed. The receipt is an ERROR receipt, not a CLEAN one: the frozen
counter read `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 … unstable=2 timeout=1)`
with exit 2 at the shipped tip. The three non-kills are all in `wave-census`, whose source bytes
are byte-identical between the round-43 measured commit and the shipped tip, and each of the three
mutants is killed deterministically when run on its own under the counter's own environment.
The failure is host contention, not a defect in the shipped bytes. That is an inference from a
separate bounded diagnostic; the counted receipt is the ERROR run quoted below.

## What was run

```
$ S=/fast/scratch/hyaku/kumitate-r44/seats/ExecR43ShippedReceipt
$ G=$(mktemp -d $S/counter.XXXXXX)            # -> $S/counter.IO91Gh
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show \
    0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82:scripts/gate-mutants.mjs > $G/gate-mutants.mjs
$ sha256sum $G/gate-mutants.mjs
e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a  $S/counter.IO91Gh/gate-mutants.mjs
```
The extracted counter's sha256 reads `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`,
the value the item requires.

```
$ mkdir -m 0700 $S/gm-tmp
$ cat /proc/loadavg                 # before
4.26 3.93 6.33 6/2811 4154205
$ KUMITATE_GATE_MUTANTS_TMP=$S/gm-tmp systemd-run --user --scope --quiet \
    -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node $G/gate-mutants.mjs \
    --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin \
    --rev b01ded326d17f9e445b4b8cd6ce2358ffb07385f
$ echo exit=$?
exit=2
$ cat /proc/loadavg                 # after
8.74 5.57 6.71 5/4522 58028
```
Wall time 81.79 s. stderr was empty (0 bytes).

## Why the ERROR is contention, not the shipped bytes

The three non-kills are `wave-census:survivor/M12-known-roles-arm`, `wave-census:survivor/M13-attack-arm`
(both `unstable`, i.e. the K43(d) second run disagreed on the FAIL case names) and
`wave-census:survivor/V194-check-ok-true` (the counter's 60 s cap fired).

1. `wave-census.mjs` is byte-identical at the measured commit and the shipped tip, so the shipped
   change cannot explain them:
```
$ git show 84cb1d5d...:scripts/wave-census.mjs | sha256sum   -> 76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4
$ git show b01ded32...:scripts/wave-census.mjs | sha256sum   -> 76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4
$ git diff --stat 84cb1d5d... b01ded32... -- scripts/
 scripts/cite-check.mjs | 5 ++++-      # only cite-check changed (the witness primary-only switch)
```
   All 18 `cite-check` mutants were killed in the counted run, including the two guard extras.

2. Each of the three non-kill mutants is killed on its own under the counter's own environment
   (cleared env, `HOME`/`TMPDIR` into a private temp root, `prlimit --nproc`, 128 MB heap). Two
   consecutive runs each gave the same FAIL case names, which is what K43(d) requires. The three
   mutant copies were made by applying the manifest's own literal replacements to
   `wave-census.mjs` at `b01ded32`; their sha256 digests let anyone rebuild them:
```
m13.mjs  426c4b6779c7ddec4a8dfa7f864f77d4abd380ae217d48aa44662cd85aec046e   ('|| ATTACK.has(ex.role)' -> '')
m12.mjs  f330889c9c1939510189e06533bef7b784d67821d9ba64a7531bb84701ef2927   ('|| KNOWN_ROLES.has(ex.role)' -> '')
v194.mjs 40a59be73ccfa5bc33c837aaee20dda3f8787ee12960a60dabe86f45b302f1f3   ('ok = r.ok;' -> 'ok = true;')
base wave-census.mjs at b01ded32 = 76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4
```
```
m13 run1 : 30/32 pass  FAIL WC24 WC25     m13 run2 : 30/32 pass  FAIL WC24 WC25
m12 run1 : 30/32 pass  FAIL WC24 WC25     m12 run2 : 30/32 pass  FAIL WC24 WC25
v194 run1: 31/32 pass  FAIL WC24          v194 run2: 31/32 pass  FAIL WC24
```
   Four concurrent copies of the same mutant also agreed with each other. Under K43 all three are
   `killed`, not `unstable` and not `timeout`.

3. The counted run's own unstable rows disagree with the isolated runs on the failure count
   (`cases=15/32 fail_lines=17` for M13 against `30/32` and 2 FAIL lines in isolation), which is
   the signature of the suite's inner `spawnSync` calls failing under contention, not of a
   deterministic behaviour difference.

[INFERENCE] The shipped tip would read `GATE_MUTANTS: CLEAN … frozen=41/41` if the same counter
were run at low host load (or with `--jobs 1`). I did not run the counter a second time — the item
allows one run — so this is not measured. The L1 owns any decision to re-measure.

## Comparison with the round-43 receipts

- The round-43 measured receipt (`.ufo/waves/round-43/final/c1-measured-84cb1d5d.txt`) read
  `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 … rev=84cb1d5d…)`, exit 0, at load
  `12.77 29.84 34.43`.
- The round-43 L1 trial receipt (`.ufo/waves/round-43/final/trial1-working-copy-unstable.txt`) read
  `ERROR … frozen=38/41 … unstable=3`, exit 2, at load `47.75 47.75 47.75`.
- My run over the shipped tip reads `ERROR … frozen=38/41 … unstable=2 timeout=1`, exit 2. The
  frozen-kill count 38/41 and the ERROR class are the same shape as the trial receipt, not as the
  measured receipt. The round-43 lesson already records this "Best-of-N" behaviour.

## Answer to the routed defect

R43-3 asked for a frozen-counter receipt over the shipped bytes. This is that receipt: the frozen
counter (sha256 `e24749e4…`) run once over `b01ded32` read **ERROR, exit 2, frozen=38/41**. It does
not establish a CLEAN reading for the shipped tip, and the gap between the measured commit and the
shipped tip is therefore still open on the evidence. The counter's own verdict for the shipped bytes
is ERROR; the isolation diagnostic above explains why but does not change that verdict.

## Cleanup and host state

```
$ pgrep -af 'kumitate-r44/seats/ExecR43ShippedReceipt'
NO_LEFTOVER_PROCESSES
$ ls -d $S/gm-tmp
ls: cannot access '.../ExecR43ShippedReceipt/gm-tmp': No such file or directory
```
The temp parent was empty after the run and removed. Diagnostic scratch trees
(`probe/cenv`, `probe/ce`) were removed. No file outside this report was written in the lane repo;
`git status --porcelain` in the lane shows only the pre-existing untracked round-44 files plus this
report's directory. No tool was installed or updated. No pacman transaction was run.

## Counter stdout (complete, 49 lines)

```
GATE_MUTANTS_HEADER rev=b01ded326d17f9e445b4b8cd6ce2358ffb07385f cite-check=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 wave-census=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f
CONTROL cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75
CONTROL wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
MUTANT cite-check:resolved-kind-gate killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:warn-total killed cases=72/75 control=75 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=same
MUTANT cite-check:strict-warn-arm killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:strict-conjunct killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:resolved>0 killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:render-env-empty killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:citeCheck-map killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:render-env-zero killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit2-empty killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit0/1-map killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:exit2-zerores killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:parse-64 killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-group-verdict killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=PASS group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:suite-any-fail killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=PASS group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:suite-exit-json killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:suite-exit-text killed cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT cite-check:guard-outer-ne-1 killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT cite-check:guard-outer-eq-undefined killed cases=73/75 control=75 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:repair/dotdot-guard-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:repair/string-agent-check-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:repair/read-error-rethrown killed cases=22/32 control=32 fail_lines=10 exit=1 verdict=FAIL group_clean=true fail_lines=10 overflow=false confirm=same
MUTANT wave-census:survivor/M10-unknown-wave-zero killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M03-empty-count killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M02-wave-grammar-hyphen killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M13-attack-arm unstable cases=15/32 control=32 fail_lines=17 exit=1 verdict=FAIL group_clean=true fail_lines=17 overflow=false confirm=differs
MUTANT wave-census:survivor/M12-known-roles-arm unstable cases=19/32 control=32 fail_lines=13 exit=1 verdict=FAIL group_clean=true fail_lines=13 overflow=false confirm=differs
MUTANT wave-census:survivor/V382-pass-count killed cases=32/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V385-verdict-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V387-exit-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:findings/F-M02 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M03 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M07 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M08 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M11 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M19 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M20 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:survivor/M04-empty-round killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M21 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M22 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:findings/F-M23 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:exits/M22-name-half-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
MUTANT wave-census:exits/M19-selftest-exit-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
MUTANT wave-census:survivor/V194-check-ok-true timeout cases=not-run/not-run control=32 fail_lines=0 timeout=60000ms group_clean=true
CONTROL_AFTER cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=75/75 floor=75
CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 drift=0 targets=2 rev=b01ded326d17f9e445b4b8cd6ce2358ffb07385f manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=2 timeout=1 overflow=0 control-fail=0
```
