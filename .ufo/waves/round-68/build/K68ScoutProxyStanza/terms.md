# K68ScoutProxyStanza — proxy terms at the round-68 freeze

Measured on the lane worktree at HEAD `39f61816d4ee7a8d401df42c1818c91a9c537bce`
(the round-68 freeze commit; plan base revision `d23892ad44b41e1af63b3edb949d265ca1dd812d`).
`node v24.21.0`. Origin src-rev resolved to `31c465f15669` (`.ufo/pins/origin.json`).

## proxy-check verdict (bare run, verbatim)

```
PROXY  error  A_DRIFT  A: declared=351 computed=548 delta=+197
PROXY  error  C2_DRIFT  C2: declared=156 computed=163 delta=+7
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=163 delta=+7
PROXY  error  K_MEMBERS_DRIFT  K_members: declared=49 computed=53 delta=+4
PROXY  error  K_SECTIONS_DRIFT  K_sections: declared=49 computed=53 delta=+4
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (A_DRIFT term=A declared=351 computed=548 delta=+197; C2_DRIFT term=C2 declared=156 computed=163 delta=+7; C2_TOTAL_DRIFT term=C2_total declared=156 computed=163 delta=+7; K_MEMBERS_DRIFT term=K_members declared=49 computed=53 delta=+4; K_SECTIONS_DRIFT term=K_sections declared=49 computed=53 delta=+4; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
(The verdict line above is the first run, verbatim. Re-runs ~2–3 min later printed the same
findings with computed A = 556 then 626 and delta=+205/+275 — the term is worktree-live and
climbs as wave seats write build files; see finding -2.)


## Terms for the close-time stanza refresh (declared → measured)

| term | stanza declares | measured at freeze | verdict |
|---|---|---|---|
| A | 351 | **548** tracked at HEAD (`.ufo/waves` artifacts included); worktree live-read 548→626 mid-wave | DRIFT |
| C | 33 | **33** | MATCH |
| C1 / C1_total | 19 / 19 | 19 / 19 | MATCH |
| C2 | 156 | **163** | DRIFT +7 |
| C2_total | 156 | **163** | DRIFT +7 |
| S_members / S_sections | 88 / 88 | 88 / 88 | MATCH |
| R_members / R_sections | 92 / 92 | 92 / 92 | MATCH |
| coverage_script / coverage_runtime | 10 / 10 | 10 / 10 | MATCH |
| C1k / C1k_total | 5 / 5 | 5 / 5 | MATCH |
| K_members | 49 | **53** | DRIFT +4 |
| K_sections | 49 | **53** | DRIFT +4 |
| coverage_kimi | 10 | 10 | MATCH |
| operability | 9 | 9 (f_O saturating; no AXES_DRIFT) | MATCH |
| coverage | 10 | 10 | MATCH |
| pins (v1 block) | 6 | 6 match | MATCH |

Refresh values: `A=<measured at close>`, `C2=163`, `C2_total=163`, `K_members=53`,
`K_sections=53`; every other term and all six pins already MATCH at the freeze.

## Independent counts (frozen derivations, run by hand)

- **A** — `walkFiles(self)` filtered by `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` (proxy-check.mjs:947,
  694-704; skips only `.git`). Equivalent:
  - `git ls-files | grep -cE '\.(mjs|js|sh|py)$'` → **548** (committed at HEAD: 517 under
    `.ufo/waves/` incl. 5 under `round-68/`, 31 under `scripts/` — 28 `*.mjs` + 3 `*.sh` +
    non-runnable `harm-cases.json`/`harm-matrix-gates.json` excluded).
  - `find . -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -not -path './.git/*' | wc -l`
    → 556, then 573, then 626 across ~3 min (live wave build artifacts; unstable).
- **C** — `grep -c '^\s*- \[' SKILL.md` → **33** (= declared).
- **C2** — `grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md` → **163**.
- **C2_total** — `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **163**
  (freeze commit added the 2 missing README rows; files were already 163).

## kimi-census verdict (bare run, verbatim)

```
KIMI_ROOT: /home/vgpnk/.kimi-code
FAMILY K1  members=4  checked=4  frozen=4
FAMILY K2  members=27  checked=27  frozen=27
FAMILY K3  members=10  checked=10  frozen=10
FAMILY K4  members=9  checked=9  frozen=9
FAMILY K5  members=3  checked=3  frozen=3
INFO  CHAIN  config.toml.*.bak  generations=10 (reported as info, never gated)
INFO  COUNT  agents/secondary/  children=18 (counted live, names not gated)
INFO  COUNT  skills/  children=7 (counted live, names not gated)
INFO  ROOT_ENUM  -  root children=37 declared=27 chain=10 strays=0 (root enumerated against K1–K5; drift-chain generations exempt)
TOTALS: members=53 checked=53 errors=0 info=4 chain=10
KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4)
exit=0
```

K layer measured state: members=53, all 53 checked, strays=0, errors=0. The stanza's
declared K_members=49 / K_sections=49 is stale by +4; measured `K_sections=53` means every
live member carries a `## ` heading in the kimi-*.md notes, so coverage_kimi stays 10.
