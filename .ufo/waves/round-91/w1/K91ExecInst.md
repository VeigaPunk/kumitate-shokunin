# K91ExecInst — v5 candidate instrument (round 91, C1 receipt-bind)

Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/w1/K91ExecInst.md`

## Files produced (seat dir K91ExecInst/)
- `receipt-bind-v5.mjs` — candidate; sha256 `33ee29ebcbe8eaafe11a4b55493a42f8d4d7ce20af5f5df118ab7d68c063013d`
- `diff.txt` — `diff -u` v4 (base `0bff4bab…`) vs v5 (101 lines)
- `probe1.txt`, `probe2.txt` — frozen predicate runs
- `selftest.txt`, `check.txt`, `sha256.txt`, `evidence.txt`

## Change (vs v4 base)
Per plan positive control diff: external `fromDisk` branch now opens `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`,
`fstatSync` the fd, non-regular → `FAIL-CLOSED UNRESOLVED`, `size > MAX_INSTRUMENT_BYTES (16777216)` →
`FAIL-CLOSED UNRESOLVED`, `readFileSync(fd)`, close in `finally`. Receipt open gains `O_NONBLOCK`
(RD-4 hardening). Header: `kumitate-receipt-bind-v5` + v5 boundary paragraph (not-claimed RD-3/RD-4
races named). Selftest +7 arms (83/83): external /dev/zero, /dev/null, FIFO via `mkfifo`, directory,
over-cap sparse (FAIL), at-cap sparse (CLEAN), empty (CLEAN); all v4 arms retained.

## Evidence (retained verbatim)
```
selftest: RECEIPT_BIND_SELFTEST: PASS held=83/83
probe1:   C91_C1: HELD held=56/56  exit:0
probe2:   C91_C1: HELD held=56/56  exit:0
node --check: OK
sha256:   33ee29ebcbe8eaafe11a4b55493a42f8d4d7ce20af5f5df118ab7d68c063013d
```

## Risks / blockers
None. Scratch at `/fast/scratch/hyaku/kumitate-r91/K91ExecInst/` retained for lanes (not in lane;
remove before yield if required — left intact for audit).
