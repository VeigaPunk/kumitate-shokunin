# ExecProbeSanity — round 52 freeze check

Axes checked: A52 frozen-counter pattern and D52 frozen-counter baseline.

Ran both frozen probes against `f539a71e236a4d66810851c1f2fb6e1abe61ec19`; combined stdout/stderr was retained verbatim in the build artifacts below.

- A52 exited 1 with the expected UNMET result, `held=5/13`; its B1–B6 PASS/MISS pattern matches `base/attest52-base.txt` (including B5 MISS). Exact output:

```text
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=f539a71e236a4d66810851c1f2fb6e1abe61ec19 rule=A52 version=v1 | B1 MISS exit=0 cases=0 last="ATTEST_SELFTEST: PASS" | B1c MISS exit=0 last="RECEIPT: VALID" | B2 MISS attest52-run-1.txt:absent;attest52-run-2.txt:absent;attest52-run-3.txt:absent | B2c PASS | B2e MISS run exit=64 last="receipt-attest: USAGE unexpected argument \"--stdin\" in run m | B3 MISS attest52-run-2-replayed.txt absent | B3c PASS | B4 MISS tool or receipts dir absent | B4c PASS | B4d PASS | B5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delt | B5c MISS mutantReceipt=absent-or-malformed selfGuard=present | B6 PASS
```

- D52 exited 1 with the expected UNMET result, `held=0/5`, matching the base receipt's E1 MISS pattern. Exact output:

```text
DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5 rev=f539a71e236a4d66810851c1f2fb6e1abe61ec19 rule=D52 | E1 MISS entry-absent
```

No crash (exit 2), hang, or check-pattern deviation was observed; no freeze defect found. The different B5 drift detail is still the same expected B5 MISS and does not change the frozen pattern. No tools were installed.

Artifacts:
- `.ufo/waves/round-52/build/ExecProbeSanity/attest52-f539a71e.txt`
- `.ufo/waves/round-52/build/ExecProbeSanity/doctrine52-f539a71e.txt`

Blockers/risks: none observed for this scoped runtime check.
