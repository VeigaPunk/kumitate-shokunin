# ReRunCounter48-1 — C1 kill-rule re-run (part 1 of 2)

Command run exactly (foreground, TMPDIR=/tmp, wrapped in `timeout -k 10 1800`):

```
timeout -k 10 1800 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin ce9aee5daf71004a5890134f9526cc6fe424b206 --set r48
```

- Result: **exit 0**, duration 71.6 s, no stderr.
- Counter file sha256 (observed at run time): `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` (rule label in output: `F48+A48`, matching the A48 pre-data amendment).
- Commit `ce9aee5daf71004a5890134f9526cc6fe424b206` verified as lane tip by `git rev-parse --verify` (subject: "round-48: C1+C2 candidate … A48 pre-data counter amendment …").
- Receipt: `ReRunCounter48-1-receipt.txt` (stdout + trailer).

## held= line, verbatim

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
```

## Site lines (verbatim)

```
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
```

## Exit-2 classification

Not applicable — exit was 0, not 2.

## Receipt trailer

```
exit=0 start=2026-10-23T15:59:23.442168-03:00 end=2026-10-23T16:00:35.054492-03:00 load1_start=23.52 load1_end=27.18
```
