# C2 E5 census-root attack

## Result

E5 is sensitive to the optional census root: the frozen probe run against the lane and fleet roots produces different E5 outcomes on the same lane checkout and revision. This directly defeats a claim that E5 itself verifies the planned census command when the probe is invoked without `--census-root`.

## Reproduction

Frozen probe source: `.ufo/waves/round-62/probe/doctrine61-probe.mjs`, unchanged copy of round-61 probe. At line 7 it reads `--census-root`; at line 24 it invokes `sources-census.sh validate --root ${censusRoot||lane} kumitate` and treats only exit 0 as E5 pass. Plan's planned counting command is the fleet-root command at round-62 parent prompt lines 64-66: `.../sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.

Executed against lane HEAD `be4a820`:

```text
$ node .../doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin be4a820
DOCTRINE61: DOCTRINE61_UNMET held=0/6 checks=6 rev=be4a820 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 MISS exit=2
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
exit=1

$ node .../doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin be4a820 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=be4a820 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
exit=1
```

The only changed argument is `--census-root /home/vgpnk/Projects/shokunin`; E5 flips from `exit=2` to `exit=0`. The no-option run defaults to lane root, while the frozen plan's counting command explicitly validates from fleet root. Committed prior control `.ufo/waves/round-61/controls/ctl-c2-critic-a6-default-census-root.txt` lines 7-25 records the same distinction and the underlying errors: lane root lacks `shokunin.conf` / recognized lane (exit 2); fleet root outputs `kumitate ok .../corpus/SOURCES.md` (exit 0). Thus this is a command-root mismatch, not a SOURCES row defect. The explicit fleet-root run correctly passes E5; E1-E4/E6 remain misses, so this does not make the overall doctrine predicate held.

## Evidence pointers

- Probe implementation: `.ufo/waves/round-62/probe/doctrine61-probe.mjs:7,24`.
- Planned command: `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-62.md:64-66`.
- Same frozen control receipt: `.ufo/waves/round-61/controls/ctl-c2-critic-a6-default-census-root.txt:7-25`.
