# ExecSpacingHarness

Measured axes: oracle operability (held count) and receipt integrity (time spacing and byte distinction).

Command run twice from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, against revision `0526f898257f58158e9264905f4895f54163e8db`:

```sh
node .ufo/waves/round-49/probe/bindoracle49-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 0526f898257f58158e9264905f4895f54163e8db
```

First run: `2026-10-23T20:45:10Z`

```text
  K1 PASS present
  K2 PASS exit=0 7/7
  K3 PASS exit=0 BIND_ORACLE: HELD binds=3 observed=3 absent=1
  K4 PASS exit=1 BIND_ORACLE: MISSING missing=3 paths=R/bind0,R/bind1,R/bind2
  K5 PASS exit=1 BIND_ORACLE: EXTRA extra=1 paths=/etc
  K6 PASS exit=1 BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control
BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=0526f898257f58158e9264905f4895f54163e8db rule=B49 oracle_sha256=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

Second run: `2026-10-23T20:45:31Z`

```text
  K1 PASS present
  K2 PASS exit=0 7/7
  K3 PASS exit=0 BIND_ORACLE: HELD binds=3 observed=3 absent=1
  K4 PASS exit=1 BIND_ORACLE: MISSING missing=3 paths=R/bind0,R/bind1,R/bind2
  K5 PASS exit=1 BIND_ORACLE: EXTRA extra=1 paths=/etc
  K6 PASS exit=1 BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control
BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=0526f898257f58158e9264905f4895f54163e8db rule=B49 oracle_sha256=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

Both receipts read `ORACLE_HELD held=6/6`; timestamps are 21 seconds apart. The complete outputs, each prefixed by its `run-at=` line, are retained at:
- `.ufo/waves/round-50/r50/seats-ExecSpacingHarness/run1.txt`
- `.ufo/waves/round-50/r50/seats-ExecSpacingHarness/run2.txt`

Evidence command:

```sh
sha256sum .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run1.txt .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run2.txt
cmp -s .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run1.txt .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run2.txt
```

```text
7578c0695e51b01b4511eaee54ff036fdf6d4a3fe7ad516ffbf6678cfa42f83f  .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run1.txt
d989466b1bf03728796af0111a2dd47026e7476c91e4b5ef60af8a7eb127e680  .ufo/waves/round-50/r50/seats-ExecSpacingHarness/run2.txt
BYTE_DISTINCT=YES (cmp exit 1)
HELD_COUNTS=2
```

No tools installed. No build, lint, test, or formatter was run.