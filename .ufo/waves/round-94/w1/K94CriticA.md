# K94CriticA — counter attack on frozen C1 (`probe94-c1.mjs`, freeze 73317eca)

**Verdict: the counter does not pin the rule.** 12 wrong-but-plausible gates were built from the BASE
bytes (`constructions/`, generator `make-forgeries.py`), each run under the frozen run form with full
stdout in `constructions/receipts/<name>.txt`. **7 reached `HELD`** while violating the frozen rule or
the predicate; 5 were separated.

## Counter findings (HELD while wrong)

| construction | violation | verdict |
|---|---|---|
| `w-len8` | declares only tokens length >= 8; the token floor is 7 (`[0-9a-f]{7,40}`) | HELD 1/7/77/2/1 |
| `w-minedonly` | status must be `mined`; rule is "not `rejected`" — 14 `queued` rows, S036 is `queued` with URL pin `140f2119…` | HELD 1/7/77/2/1 |
| `w-nosplit-q` | URL split on `/` `#` only; rule also splits `?` (`.../blob/<pin>?plain=1`) | HELD 1/7/77/2/1 |
| `w-col0` | registry row must start at column 0; rule allows `^ {0,3}` | HELD 1/7/77/2/1 |
| `w-linescan-rejected` | drops a row if `rejected` appears anywhere on it; rule reads the 8th cell (S112 is `mined` and says "REJECTED") | HELD 1/7/77/2/1 |
| `w-extra-declared` | correct rule + bogus `deadbeef` pushed into round-93 `declared`; (a) is membership (`includes`), not set equality | HELD 1/7/77/2/1 |
| `w-thin512` | correct rule + `REPORT_MIN_BYTES 1024→512` (unrelated check weakened 8×) | HELD 1/7/77/2/1 |

Latent vs live: `w-minedonly` separates on live registry data (S036, `receipts/registry-gaps.txt`);
`w-len8`, `w-nosplit-q`, `w-col0`, `w-linescan-rejected` are latent because the 77 filed reports and
the fixture never exercise the clause (0 indented rows, 0 `?`-adjacent pins, shortest fixture token 8,
no cited pin on a row that mentions "rejected"). Cheapest separations: fixture `url7=slice(0,7)`; a
`queued` row with a pin; a `/blob/<pin>?plain=1` row; an indented row; a `mined` row whose teaches says
"rejected". (a) fix: `setEq(decl(c.j), FIX_TOKENS)`.

**(c) blind spot.** `w-thin512` shows (c)'s vector equality only covers checks the 77 reports exercise:
reports are 122 B or >= 2256 B, so any `REPORT_MIN_BYTES` in (122, 2256] is invisible, and (e) cannot
see it because the selftest thin fixture is < 512 B. `w-unrelated-plan-warning` (forced
`SCORECARD_PLAN_MISSING` ok=true) was UNMET **only** at e=0/1 (selftest 56/61) — (c) stayed 77/77.
Fix (routes; predicate is frozen): one fixture asserting an unrelated check that is false at BASE
(1023-byte report; SCORECARD without `## Planned`) and requiring the candidate's (id, ok) there.

## Separations that worked

`w-hardcode` and `w-round93` UNMET d=1/2 (fixture declared is exactly {url8, full, commitfrag});
`w-mainrepo` UNMET a=0/1 (fleet root has no `corpus/`); `w-nonhttp` UNMET d=1/2 (64-hex `digest`);
`w-unrelated-plan-warning` UNMET e=0/1. `fails=none` on rows 8/9/11 is cosmetic — `fails` only records
(b)/(c) mismatches; the `C94_C1` line carries a/b/c/d/e.

## Impacted axes

Operability (C1 counter validity): (d) fixture under-covers five rule clauses; (a) is a lower bound;
(c) is regression-only over the filed corpus. Coverage sub-axes untouched. The frozen verdict is
unchanged by construction; every HELD row above is routed, not integrated.

## Evidence

Seat dir `.ufo/waves/round-94/K94CriticA/`: `constructions.md` (12 rows), `make-forgeries.py`
(base sha256 asserted `09d4d792…`), `constructions/*.mjs` (+ `cap-spawn.mjs`/`cap-run.mjs`),
`receipts/{w-*,generator.out,registry-gaps.txt}`. Scratch `/fast/scratch/hyaku/kumitate-r94/K94CriticA`
removed after the runs; no lane/probe/control/plan file was written.
