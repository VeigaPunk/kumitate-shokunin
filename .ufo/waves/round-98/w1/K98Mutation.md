# K98Mutation — K2 probe of the round-98 candidate (claim C1)

Probe: K2 — the shipped `--selftest` must fail on the 13 violating control shapes (and BASE `\s`)
applied to the candidate's own row recogniser. 25 single-point mutants, each exactly one line of
`declaredPins()`/its subject (`runs/<m>/mutant.diff`), generated deterministically by `mutate.py`.

Target: candidate `K98ExecTool/round-gate.mjs` sha256 `70b3f6d5…c14946` (READY absent all wave;
current bytes `e7c1455e…7ed01f` differ **only** in the header doc comment — proved identical on the
four mutation targets, `candidate-comment-drift.diff`). Pristine baseline: 96/96 PASS, exit 0.

Results: **23/25 KILLED-by-selftest**, **2 KILLED-by-counter-only**, **0 SURVIVED**, **0 EQUIVALENT**.
- 13 control shapes + BASE `\s` (14 mutants): all 14 killed by the selftest — legitimately different
  arms, e.g. `m-insideonly` only by (xxix), `m-outsideonly` only by (xxviii), `m-base-ws`/`m-nbsp`/
  `m-zs`/`m-asciiws`/`m-leadonly`/`m-trailonly`/`m-spaceonly`/`m-anyindent`/`m-indent4`/`m-digits2`/
  `m-casefold`/`m-unicodedigit` by both. (Every failing run also fails the nested `hermeticity` arm —
  a cascade of the same mutant failure, not an independent kill.)
- Boundary: `{0,2}`→(xxi)(xxiii)(xxvi); `\d{4,}`/`inReg`-flip→17 arms; `\|`-dropped→(xxviii)(xxix);
  `^`-dropped→(xxviii)(xxix) via the TAB/4-space-indented rows; `fields[1]` untrimmed outside→
  (xxiii)(xxv)(xxvi)(xxvii)(xxix), malformed→(xv)-(xxiii)(xxv)(xxviii); `[ \t]?` (both sides)→killed.
- **Coverage finding (routed, not fixed):** lead `[ \t]+` and trail `[ \t]+` pass all 96 arms. No arm
  draws a zero-pad id cell (`|S123… |`, `| S123…|`, `|S123…|`); the `*`-vs-`+` distinction is pinned
  only by the other side's 2-char pads. Arm (xxviii) should add `r98Row('', 'S130', '', pin)` and
  (xxix) a zero-pad outside row; then one zero-pad outside row alone kills both survivors.
  Frozen counter proves them wrong: `UNMET a=0/1 b=0/1 c=0/1 d=81/81 e=1/1`, missing exactly the
  census-admitted `none` pad class (seeds `99f20d6b…`, `ee7e9ca7…`; `runs/m-pad-plus*/counter.*`).

Receipts (seat `.ufo/waves/round-98/K98Mutation/`): `mutants.md` (full 25-row table), `runs/<mutant>/`
(`mutant.diff`, `selftest.out`, `summary.txt`, `fails.txt`, `selftest.status`, survivor `counter.*`),
`baseline-selftest.out`, `base-to-candidate.diff`, `candidate-comment-drift.diff`,
`candidate-tested-70b3f6.mjs`, harness (`mutate.py`, `run-selftests.sh`, `run-counter.sh`).
Restoration: candidate read-only (lane `scripts/round-gate.mjs` still `edaa115f…`; candidate never
written by this seat); all mutants lived in scratch, removed before yield. No tool installs.
