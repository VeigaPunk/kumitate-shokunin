# K70ProbeSpaces interim notes (fold into report)

## Confirmed findings so far
- F1 transform-draft ordering defect: W="$S/w" emitted before S= assignment -> set -u "S: unbound variable".
  Evidence: bash -x trace line 32 on first generated copy; fixed in probe generator by emitting S before W.
- F2 spaced TMPDIR -> frozen counter self-poison proof misses (NODE_OPTIONS whitespace split):
  E1 (all plain): held=5/7, no L7 miss. E2 (spaced lane only): 6m39s, held=5/7, label OK.
  E3 (spaced TMPDIR): held=4/7 "L7 MISS self-poison:exit=1:". E4 (full combo): same 4/7.
  Mechanism: ledger69-probe.mjs:435-437 (and deprec69-probe.mjs:401-405) spawn SELF with
  NODE_OPTIONS=`--require ${preload}`, preload under mkdtemp(TMPDIR); node splits NODE_OPTIONS on spaces.
  Label/exit unchanged (LEDGER69_UNMET exit 1) -> predicate-safe, receipt-divergent.
- F3 naive inline substitution of spaced/apostrophe paths at generation time breaks the private
  copy at bash parse/exec (exit 2/127); env-var indirection is required.
- Stage A (strict stand-in, private copy): all 6 checks PASS in rerun-1 after fixture fix
  (probe must exist INSIDE --lane for that stand-in; r69 fixtures don't carry it).

## Tooling (no installs; pacman paused per directive)
- node v24.21.0, git 2.56.0, python 3.14.8 (frozen lineage only), bash (toolbox).
