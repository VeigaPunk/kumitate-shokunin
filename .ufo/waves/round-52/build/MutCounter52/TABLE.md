# MutCounter52 — A52 counter mutant table

Target: lane `kumitate-shokunin` at base rev `02c01258464cac3804faf177d0cfbf113cd59706` (the freeze base in plan.md).
Pristine probe: `.ufo/waves/round-52/probe/attest52-probe.mjs` sha256 `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428`.
Detection runs: 20 executions, 76.7 s total (3.6 s each); every mutant is a COPY under
`build/MutCounter52/mutants/`, each transformation asserted to apply exactly once.
`K4` column = plan kill-rule clause "drop-one-check and hold-call-deleted mutants must never print HELD".
`pred` column = the frozen C1 predicate sentence, literally
`ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v1` + exit 0.

| mutant | diff | exit | label | held | K4 never-HELD | frozen predicate | stdout==pristine | note |
|---|---|---|---|---|---|---|---|---|
| `pristine` | -0/+0 | 1 | ATTEST52_UNMET | 5/13 | ok (not HELD) | no-match | n/a |  |
| `a-drop-B1` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B1c` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B2` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B2c` | -1/+0 | 1 | ATTEST52_UNMET | 4/12 | ok (not HELD) | no-match | no | removed a PASS (held 5->4, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B2e` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B3` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B3c` | -1/+0 | 1 | ATTEST52_UNMET | 4/12 | ok (not HELD) | no-match | no | removed a PASS (held 5->4, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B4` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B4c` | -1/+0 | 1 | ATTEST52_UNMET | 4/12 | ok (not HELD) | no-match | no | removed a PASS (held 5->4, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B4d` | -1/+0 | 1 | ATTEST52_UNMET | 4/12 | ok (not HELD) | no-match | no | removed a PASS (held 5->4, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B5` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B5c` | -1/+0 | 1 | ATTEST52_UNMET | 5/12 | ok (not HELD) | no-match | no | removed a MISS (held unchanged, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `a-drop-B6` | -1/+0 | 1 | ATTEST52_UNMET | 4/12 | ok (not HELD) | no-match | no | removed a PASS (held 5->4, denominator 13->12); green-tree model => HELD 12/12 exit 0 (guard-witness.json) |
| `b-hold-deleted` | -1/+1 | 1 | ATTEST52_UNMET | 0/0 | ok (not HELD) | no-match | no | checks array stays empty => held=0/0 UNMET exit 1 (R52-5 class correctly killed by the guard) |
| `c-span-300-to-0` | -2/+2 | 1 | ATTEST52_UNMET | 5/13 | ok (not HELD) | no-match | yes | stdout BYTE-IDENTICAL to pristine: threshold not exercised at base; kill is vacuous (other misses) |
| `c-cases-30-to-1` | -1/+1 | 1 | ATTEST52_UNMET | 5/13 | ok (not HELD) | no-match | yes | stdout BYTE-IDENTICAL to pristine: threshold not exercised at base; kill is vacuous (other misses) |
| `c-prior-files-ignored` | -1/+1 | 1 | ATTEST52_UNMET | 5/13 | ok (not HELD) | no-match | yes | stdout BYTE-IDENTICAL to pristine: threshold not exercised at base; kill is vacuous (other misses) |
| `d-verdict-swap` | -3/+3 | 0 | ATTEST52_HELD | 5/13 | VIOLATED (HELD) | no-match | no | probe's own label lies (prints HELD at an UNMET tree); killed only by the frozen predicate string |
| `d2-always-held` | -3/+3 | 0 | ATTEST52_HELD | 5/13 | VIOLATED (HELD) | no-match | no | probe's own label lies (prints HELD at an UNMET tree); killed only by the frozen predicate string |

## Positive witness (frozen tail bytes, synthetic checks array)

`build/MutCounter52/guard-witness.mjs` embeds the four frozen decision lines
(`attest52-probe.mjs:470`, `:472`, `:474`) extracted verbatim; only `checks` is synthesized.

| synthetic checks | exit | label | held |
|---|---|---|---|
| n=13,allok=True | 0 | ATTEST52_HELD | 13/13 |
| n=12,allok=True | 0 | ATTEST52_HELD | 12/12 |
| n=13,allok=False | 1 | ATTEST52_UNMET | 0/13 |
| n=0,allok=True | 1 | ATTEST52_UNMET | 0/0 |

Convergent independent reproduction: seat `CritQ43` (`build/CritQ43/guard-counterexample.txt`).
