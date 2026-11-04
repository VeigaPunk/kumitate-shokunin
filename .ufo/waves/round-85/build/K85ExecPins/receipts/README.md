# K85ExecPins receipts — command, exit, measured revision

Every measurement was taken in an isolated `git archive` extraction (no shared-tree execution).
Pin source for the proxy runs: `/fast/scratch/hyaku/kumitate-pin/src` @ `31c465f15669f744848bd9f5d56191c5085670f7`
(`.ufo/pins/origin.json`). Node v24.21.0. Scratch `/fast/scratch/hyaku/kumitate-r85/K85ExecPins/`
was deleted after these copies; these files are the durable transcript.

| file | command | revision measured | exit |
|---|---|---|---|
| `proxy-frozen-strict.txt` | `node scripts/proxy-check.mjs --strict` | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | 1 |
| `proxy-frozen-strict.json` | `node scripts/proxy-check.mjs --strict --json` | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | 1 |
| `proxy-repair-strict.txt` | `node scripts/proxy-check.mjs --strict` | `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8` | 0 |
| `readme-map-frozen.txt` | `node scripts/readme-map.mjs` | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | 1 |
| `counter-pins-frozen.txt` | `node scripts/counter-pins.mjs` | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | 0 |
| `counts-frozen.txt` | the §0 count/hash commands (each line shown with its command) | `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | 0 (all) |
| `a-delta.txt` | `git diff --name-status a5d3e7549501ae76dbd86a6f81c5e858f1f92446 9db0c6b5eb9111cfc5581006ba976ca2cd112792`, filtered to `\.(mjs\|js\|sh\|py)$` | base → freeze | 0 |

Verbatim verdict lines:

- `PROXY: DRIFT (A_DRIFT term=A declared=908 computed=913 delta=+5; src-rev=31c465f15669; source=snapshot)`
- `PROXY: MATCH (A=908 C=44 operability=9; C1=19/19 C2=214/214 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=55/55 coverage:kimi-layer=10; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)`
- `README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md`
- `COUNTER_PINS: CLEAN pins=45`
