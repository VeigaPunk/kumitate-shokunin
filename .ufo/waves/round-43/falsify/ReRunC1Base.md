RESULT ReRunC1Base rev=2a7f37d2b0a413db8499b413783c27a0effdc989 verdict=reproduced frozen=34/41 exit=1

Seat: ReRunC1Base (wave 2 falsify, C1 do-nothing control re-run). Item: re-run the frozen
counter (extracted from plan commit 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82) on the round-open
rev 2a7f37d2b0a413db8499b413783c27a0effdc989 with --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin
and compare against .ufo/waves/round-43/open/c1-control-base.txt.

Evidence:
$ G=$(mktemp -d /fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Base/counter.XXXXXX)
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82:scripts/gate-mutants.mjs > $G/gate-mutants.mjs
$ sha256sum $G/gate-mutants.mjs
e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a  .../counter.I4wPpD/gate-mutants.mjs
  (identical to the sha recorded in c1-control-base.txt and in the plan's K43)
$ KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ReRunC1Base/gm-tmp \
  systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 \
  node $G/gate-mutants.mjs --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --rev 2a7f37d2b0a413db8499b413783c27a0effdc989 > rerun-base.out 2>&1; echo exit=$?
exit=1        (wall time 68.15 s; gm-tmp made 0700, owned by vgpnk)
  (wrapper timeout is 900 per this seat's contract; the control receipt used 1500 — headroom
   only, the run finished in 68 s and never approached either limit)
$ head -1 rerun-base.out
GATE_MUTANTS_HEADER rev=2a7f37d2b0a413db8499b413783c27a0effdc989 cite-check=1915e5b97cff8b6ee29ea72071ae093f9d5d9f1c7ea8a5007ab61f7117530c3e wave-census=a1762f3c12854be0ba38a8ca5e5a5b3233848d0955a4c4cad4746135822cc30e manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f
  (input hashes identical to the control receipt's header: same target bytes, same manifest)
$ tail -2 rerun-base.out
GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 rev=2a7f37d2b0a413db8499b413783c27a0effdc989 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0)
exit=1
$ grep -E '^MUTANT .* survived' rerun-base.out | awk '{print $2}' | sort
cite-check:suite-any-fail
cite-check:suite-exit-text
cite-check:suite-group-verdict
wave-census:exits/M19-selftest-exit-const
wave-census:survivor/V382-pass-count
wave-census:survivor/V385-verdict-const
wave-census:survivor/V387-exit-const
  (7 survivors; exactly the set recorded in the control receipt and named in the plan)
$ diff <(grep -E '^(MUTANT|CONTROL|CONTROL_AFTER|GATE_MUTANTS)' .ufo/waves/round-43/open/c1-control-base.txt | sort) \
       <(grep -E '^(MUTANT|CONTROL|CONTROL_AFTER|GATE_MUTANTS)' rerun-base.out | sort) && echo LINES-IDENTICAL
LINES-IDENTICAL
  (all 43 MUTANT detail lines, both CONTROL and both CONTROL_AFTER lines, and the verdict line
   match the receipt line-for-line — same cases counts, verdicts, exits, confirm=same on all 36
   kills, floors 75 and 31 unchanged, leftovers=0; only intra-run line order differs, which the
   sorted diff neutralizes)
$ pgrep -af 'seats/ReRunC1Base' || echo NO-LEFTOVER-PROCS
NO-LEFTOVER-PROCS
$ ls -A $S/gm-tmp | wc -l; rm -rf $S/counter.I4wPpD $S/gm-tmp
0  (temp dirs removed; rerun-base.out kept as seat evidence)

Comparison verdict: REPRODUCED. Verdict line, exit code (1), killed count (36), frozen count
(34/41), drift (0), targets (2), manifest, and the full survivor set all match the committed
do-nothing control exactly. No run-to-run flakiness observed under K43: every kill reproduced
with confirm=same and both control passes (pre and post) reproduced at 75/75 and 31/31.

No defect found in scope. The frozen counter is deterministic on the round-open bytes and the
committed control receipt is honest. Wave-1's C1 before/after result (SURVIVED at 2a7f37d2,
CLEAN at 84cb1d5d) keeps its before-side support from this independent re-run.
