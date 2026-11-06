# K92ExecCarry — integration patches and routed debt (round 92, w1)

Seat: K92ExecCarry (leaf). Scope: land `scripts/seat-route.mjs` (`kumitate-seat-route-v1`) into every
lane registry that gates a new script, plus the r91 spot-check's routed corrections. All work in a
`git archive`/clone of `596f675366ac5822aac5ea1ffc56b1189b17f65c`; the lane was read-only apart from
this report, the seat dir and the receipt copies.

## Candidate identity

`READY` = `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` (`K92ExecTool/READY`).
`seat-route.patch` adds exactly those bytes: applying it to a fresh checkout yields
`sha256(scripts/seat-route.mjs)=3b8b6ce0…` (receipt `receipts/final-apply-gates.txt`).
Kill clause (d) surface: `grep -c 'round-92\|oracle92\|probe92'` over the candidate bytes = **0**.

## Patch set (apply order, unidiff `a/`…`b/` against `596f6753`)

| # | patch | touches | sha256 |
|---|---|---|---|
| 1 | `seat-route.patch` | `scripts/seat-route.mjs` (new, 100755) | `82641bb0…` |
| 2 | `skill.patch` | `SKILL.md` — gate row `seat-route`; checklist item 47; registry/checklist counts corrected (29→32 rows, 39→47 items; both prose counts were stale) | `ce53f4df…` |
| 3 | `scorecard.patch` | `SCORECARD.md` — `A=37`, `C=47`; `pin.proxy-check=<SHA256-AT-M>`; `pin.seat-route=<SHA256-AT-M>` | `59cd3fc2…` |
| 4 | `proxy-check.patch` | `scripts/proxy-check.mjs` — `GATE_PINS['pin.seat-route']='scripts/seat-route.mjs'` (without it `--strict` fails `PIN_UNPINNED`) | `c41865fa…` |
| 5 | `counter-pins.patch` | `.ufo/pins/counter-pins.json` — pins the five frozen round-92 instruments (real hashes: plan `6cc8c524…`, oracle `07e84a8f…`, counter `323c0449…`, index `64ae32bf…`, sampleA `636801f0…`) | `17784689…` |
| 6 | `readme-map.patch` | `corpus/README.md` + `.ufo/pins/readme-map.json` — r91 spot-check adoption delta (fallback for the `--adopt` command below; do not apply both) | `49d5118f…` |
| 7 | `r91-debt.patch` | `SCORECARD.md` — mutation-tally correction row + pre-registration correction paragraph; `LOG.md` — round-91 correction bullet | `1abb9b4f…` |
| 8 | `round-gate.patch` | `SCORECARD.md` — `\| 92 \|` move-log row + `## Planned` round-93 pointer; `LOG.md` — round-92 record template. **Contains `<AT-M: …>` placeholders; fill before filing.** | `d15faf8b…` |

`r91-debt.patch` must be applied before `round-gate.patch` (the second LOG hunk's context includes the
correction bullet). Everything else is independent.

After applying: fill the two digests —
`sha256sum scripts/seat-route.mjs scripts/proxy-check.mjs` → `pin.seat-route`, `pin.proxy-check`.

## Gate matrix (fresh clone at `596f6753`)

| gate | before | after (patches 1–8, digests filled) |
|---|---|---|
| `readme-map.mjs` | `DRIFT files=234 rows=233 covered=233 bad=2` (`uncovered:lessons/round-91-verifier-spotcheck.md`) | `CLEAN files=234 rows=234 covered=234` |
| `counter-pins.mjs` | `CLEAN pins=45` | `CLEAN pins=50` |
| `proxy-check.mjs --strict` | `DRIFT A_WAVE +13, C2_TOTAL +1, AXES_DRIFT coverage row=10 derived=9` | `DRIFT` only `A_wave`/`C2`/`C2_total` (M-dependent; see residue). No `A_DRIFT`, `C_DRIFT`, `AXES_DRIFT`, `GATE_PIN_DRIFT`, `PIN_UNPINNED` |
| `proxy-check` with freeze-time counts (`A_wave=1332, C2=C2_total=234`) | — | `PROXY: MATCH (A=37 C=47 operability=9; C2=234/234 coverage=10; …)` (`receipts/proxy-match-sim.txt`) |
| `spotcheck-adopt.mjs --check` | `SPOTCHECK_COVERAGE: DRIFT uncovered=1` / `MAP: DRIFT` | `SPOTCHECK_COVERAGE: CLEAN spotchecks=58 uncovered=0` / `MAP: CLEAN` |
| `round-gate.mjs --round 91` | `CLEAN checks=10` | `CLEAN checks=10` |
| `round-gate.mjs --round 92` | `DRIFT errors=3 warnings=1` (report, row, Planned, LOG) | `DRIFT errors=1 warnings=0` — only `REPORT_MISSING` (fleet-owned report) |
| `seat-route.mjs --selftest` | n/a (file absent) | `SEAT_ROUTE_SELFTEST: PASS held=30/30` |
| `surface-probe --checklists` | — | seat-route item passes (`SKILL.md:765 exit=0 substring=hit`) with the final candidate (`receipts/skill-checklists-final-candidate.txt`) and with the applied patch set (`receipts/skill-checklists-after.txt`); full list 41/47 at load1≈23, 40/47 at load1 26–37 (gate-mutants red under load only) |
| `cite-check.mjs` (no `--src`) | `2946 errors / 1085 warnings` | `2946 errors / 1085 warnings`, same baseline (`receipts/cite-check-summary.txt`); the first draft's `T.jsonl` token added one error and was replaced by `<transcript>.jsonl` |
| `claims-check.mjs` | — | `CLAIMS: MATCH` (19/19, warnings unchanged) |

Receipts: `receipts/before-gates.txt`, `receipts/final-apply-gates.txt`, `receipts/proxy-match-sim.txt`.

## Residue the L1 must finish at M (not script-induced)

1. Fill `<SHA256-AT-M>` (two pins) — `scorecard.patch` intentionally leaves them literal.
2. Re-declare `A_wave`, `C2`, `C2_total` in the `kumitate-proxy-v1` stanza at M (freeze read:
   `A_wave` 1319→1332, `C2` 233→234, `C2_total` 233→234). The round-92 corpus notes will move C2 again.
3. File `.ufo/reports/round-92/kumitate.md` (≥1024 B, ≥2 headings, names round 92, `SHONEN` heading);
   `round-gate --round 92` then has no finding. Replace the `<AT-M: …>` cells in the `| 92 |` row and the
   LOG record with measured values.
4. Round-92 corpus notes (planned `knowledge/…` + `lessons/round-92.md`) need their own README rows and
   `covered` pins; `readme-map.patch` deliberately does not pre-write rows for files that do not exist.
5. Full checklist runs in the applied tree: 41/47 pass at load1≈23 (`receipts/skill-checklists-after.txt`),
   and 40/47 in a second run at load1 26–37 (`receipts/skill-checklists-final-candidate.txt`); 0 skipped,
   seat-route item PASS in both. The extra red in the second run is the gate-mutants battery
   (`SKILL.md:736`, exit 2 after 114 s under load; it passed at load1 23). The stable reds are the six
   known/environmental items: round-close audit + filed-report tracking (need `--main-repo`; the fixture's
   parent is not the fleet repo), `proxy-check --strict` (item 2 above), OMP agent-root census
   (operator-owned `~/.omp/agent` findings), Kimi composite (host-bound), OMP shape live comparison
   (host-bound).

## Routed debt (r91 spot-check §5.1–§5.2)

- `K91Mutation/mutants.txt` rows: **6 killed** (m01, m03, m04, m05, m06, m09), **5 survivors**
  (m02, m07, m08, m10, m11) of 11; the round-91 `7 killed` line overcounted.
- `m08` (`catch` swallows `FailClosed`) is fail-open, **not** equivalent-on-suite: arm it or justify
  equivalence explicitly.
- Append-only corrections: `SCORECARD.md` r91 table row + `## Round 92 pre-registration` paragraph;
  `LOG.md` r91 section bullet (`r91-debt.patch`).
- Fleet-owned report (listed, **not edited**): `/home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md:22`
  reads “K91Mutation: 11 mutants, 7 killed, 5 survivors equivalent-on-suite (`K91Mutation/mutants.txt`)”;
  the correction is the paragraph above.
- §5.3 harm scope: no shipped `receipt-bind` bytes change this round, so no harm check is owed here.

## spotcheck-adopt (r91 spot-check adoption)

- Usage (no args): `SPOTCHECK_ADOPT: USAGE` exit 64 (`receipts/spotcheck-usage.txt`).
- Read-only check on the freeze tree: `SPOTCHECK_COVERAGE: DRIFT spotchecks=58 uncovered=1
  first=corpus/lessons/round-91-verifier-spotcheck.md` / `MAP: DRIFT first=uncovered:lessons/round-91-verifier-spotcheck.md`
  exit 1 (`receipts/spotcheck-check-before.txt`).
- Exact command for the L1:
  `node scripts/spotcheck-adopt.mjs --lane . --adopt corpus/lessons/round-91-verifier-spotcheck.md`
  → `SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-91-verifier-spotcheck.md wrote=both`
  (`receipts/spotcheck-adopt.txt`); after: `SPOTCHECK_COVERAGE: CLEAN spotchecks=58 uncovered=0`,
  `MAP: CLEAN`, `README_MAP: CLEAN files=234 rows=234 covered=234` (`receipts/spotcheck-check-after.txt`,
  `receipts/readme-map-after-adopt.txt`). Use this writer rather than `readme-map.patch`.

## round-gate 91

In the `596f6753` clone with `--main-repo /home/vgpnk/Projects/shokunin`:
`ROUND_GATE: CLEAN (round=91 lane=kumitate checks=10 errors=0 warnings=0)`
(`receipts/round-gate-91-archive-clone.txt`). Re-run at the landed revision unchanged.

## Risks

- Editing `proxy-check.mjs` forces `pin.proxy-check` re-pinning; the patch leaves the literal placeholder,
  so `--strict` cannot read `MATCH` until the L1 fills it (expected, not a defect).
- `round-gate.patch` contains `<AT-M>` cells by design; a careless commit would ship placeholders.
- `counter-pins.patch` binds the round-92 instruments at their freeze hashes; if the builder rewrites
  `probe92-c1.py`/`oracle92.py` after this report, the pin fails by design.
