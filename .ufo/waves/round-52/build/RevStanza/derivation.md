# RevStanza — stanza derivation (round 52), independent check

Tree: `git archive f539a71e | tar -x -C /tmp/r52-revstanza.VY3NRQ`
(scratch copy; committed bytes only). Node v24.21.0.
Canonical run: `cd <tree> && node scripts/proxy-check.mjs --strict`
(the default `--self` is the extracted tree; the committed
`.ufo/pins/origin.json` resolves the origin to `/fast/scratch/hyaku/kumitate-pin/src`
@ `31c465f15669f744848bd9f5d56191c5085670f7`, asserted).

## Freeze tree f539a71e — measured (not declared)

declared (SCORECARD.md:287 block) A=71 C2=117/117 → measured:

```
PROXY  error  A_DRIFT  A: declared=71 computed=73 delta=+2
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=117 computed=118 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (...; src-rev=31c465f15669)
exit=1
```

terms: A=73 C=23 C1=19/19 C2=117 C2_total=118 S=88/88 R=92/92
C1k=5/5 K=53/53 coverage=9 coverage_script=10 coverage_runtime=10 coverage_kimi=10
pins=6/6, gate pins 10/10, src-rev=31c465f15669.

A composition: 16 `scripts/*.mjs` + 57 `.ufo` artifacts
(36 build, 17 probe, 3 quality, 1 r48). The two frozen round-52 probes are
already inside the 57 (they are why computed A is 73, not the r51-close 71).

## Independent recount (same formulas, separate implementation)

| term | command | value |
|---|---|---|
| A | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` | 73 |
| C | `grep -cE '^\s*- \[' SKILL.md` | 23 |
| C1 / C1_total | GFM row split honouring `\|`, cell 5 `.trim().startsWith('yes')` | 19/19 (S 8/8, R 11/11, K 5/5) |
| C2 | `grep -cE '^\| \`(knowledge\|lessons)/' corpus/README.md` | 117 |
| C2_total | `find corpus/knowledge corpus/lessons -name '*.md' -type f \| wc -l` | 118 |
| S_members | `ls $PIN/scripts/*.mjs \| wc -l` + `find $PIN/scripts -mindepth 2 -type f \| wc -l` | 70+18 = 88 |
| R_members | `ls $PIN/crates/ufo-core-runtime/src/*.rs` + `.../ufo-cli/src/*.rs` | 88+4 = 92 |
| S_sections/R_sections | `node scripts/claims-check.mjs --src $PIN` → `rows=19 yes=19 sections=184 adv=4`; proxy counts in-family distinct identities (180) and excludes the 4 `SECTION_FILE_NOT_MEMBER` advisories | 88 / 92 |

Unrowed note (independent diagnosis; matches `build/ExecStanzaDrift/README-row.md`):
**`corpus/lessons/round-51-verifier-spotcheck.md`** — the only note without a
`| \`knowledge/…\` |` / `| \`lessons/…\` |` row. 117 rows, 118 notes, no stale rows,
no duplicate rows.

## MATCH derivation matrix (each fixture = freeze tree + the named edit)

| # | fixture | edit(s) | verdict |
|---|---|---|---|
| A | freeze + drift README row only, stanza A=73 C2=118 C2_total=118 | no v2 (proves A-neutrality of the v2 cutover) | `PROXY: MATCH (A=73 C=23 operability=9; C1=19/19 C2=118/118 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` exit 0 |
| G | + delivered v2 installed at `scripts/receipt-attest.mjs` + `pin.receipt-attest` re-derived | same block as A | MATCH, same line, exit 0 |
| I | G + entry note + `lessons/round-52.md` + their two rows | stanza C2=120 C2_total=120 | `PROXY: MATCH (… C2=120/120 coverage=10 …)` exit 0 |
| D | freeze + drift row, A left at 71 | plan-literal | `A_DRIFT declared=71 computed=73` exit 1 |
| H | G but gate pin left at v1 hash | — | `GATE_PIN_DRIFT pin.receipt-attest declared=44919763… computed=9531e898…` exit 1 |
| J | G + the v2 also retained at `build/ExecInstrumentV2/receipt-attest.mjs` | A=73 declared | `A_DRIFT declared=73 computed=74` exit 1 |
| C/K | entry+lesson notes, no rows for them (only drift row) | C2=118 C2_total=120 | `AXES_DRIFT coverage row=10 derived=9` exit 1 |
| L | entry+lesson rows, drift row missing | C2=119 C2_total=120 | `AXES_DRIFT coverage row=10 derived=9` exit 1 |
| — | unpinned literal `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha` (pin removed) | — | same terms S=88/88 R=92/92; verdict loses `src-rev=` |
| — | explicit `--src /home/vgpnk/Projects/ufo-fsd-alpha` under the pin | — | `PROXY: FAIL-CLOSED (SRC_REV_MISMATCH)` exit 2 |

Delivered v2: `.ufo/waves/round-52/build/ExecInstrumentV2/receipt-attest.mjs`,
sha256 `9531e89827fdfb0a345b0ce613318163d5ae7a42d6d176426ce2cbdaa36ba74e`,
selftest `ATTEST_SELFTEST: PASS (42/42)`, contract header `kumitate-receipt-attest-v2`.

## Delta rules (per committed file, at the R1 archive)

- replace `scripts/receipt-attest.mjs` in place: **A ±0**
- commit the build copy as well: **A +1** (`J`)
- each committed `*.mjs|*.js|*.sh|*.py` anywhere outside `.git`: **A +1**
  (the live working tree already holds >1000 such files under
  `.ufo/waves/round-52/build/`, all untracked fixture trees)
- each committed `corpus/knowledge|lessons/*.md`: **C2_total +1**
- each added README map row: **C2 +1**
- `coverage = floor(10 × C1/C1_total × C2/C2_total)`; with C1 19/19 it is 10 iff
  C2 == C2_total, and 9 iff C2 == C2_total − 1 (119/120).
- `operability = floor(10 × (A+C)/(A+C+3))` = floor(10×96/99) = 9 at A=73,C=23
  (terminal: 73→74 does not move it).
