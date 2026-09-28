# Round-8 aggregator audit — box-3 non-author cold run

- verifier: aggregator-lane round-8 L2 `labrat` seat Box3Kumitate — **non-author**; author lane: kumitate
- dispatched by: `.ufo/reports/round-8/aggregator.md` (main repo `shokunin`)
- stamp: start 2026-09-28T23:31:05Z HEAD `c91fe967` dirty 10 → end 2026-09-28T23:33:16Z HEAD `c91fe967` dirty 10
- entry: `SKILL.md` only (no LOG/SHONEN/SCORECARD/PROVINCE/report read before the run)

## Commands executed
| # | SKILL.md cite | Command | Exit | Result vs claim |
|---|---|---|---|---|
| 1 | :519 | `node scripts/cite-check.mjs` | 1 | `CITE_CHECK: DRIFT (files=40 tokens=2586 errors=6 warnings=76)` — within claimed `0\|1 + CITE_CHECK:` envelope, so the item's claim shape holds, but errors=6 vs SKILL.md:533 embedded live claim "errors=2" |
| 2 | :520 | `node scripts/cite-check.mjs --selftest` | 0 | `19/19 cases passed (hermetic)` + `VERDICT: PASS` — exact match |
| 3 | :521 | `node scripts/surface-probe.mjs` | 0 | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` — matches |
| 4 | :522 | `node scripts/surface-probe.mjs --selftest` | 0 | `38/38 cases passed` + `VERDICT: PASS` — matches |
| 5 | :523 | `node scripts/round-gate.mjs --selftest` | 0 | `ROUND_GATE_SELFTEST: 57/57 pass` + `VERDICT: PASS` — matches |
| 6 | :524 | `node scripts/round-gate.mjs` | 0 | `ROUND_GATE: CLEAN (round=10 lane=kumitate checks=10 errors=0 warnings=0)` — matches |
| 7 | :525 | `node scripts/round-gate.mjs --tracked` | 0 | `ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)` — matches |
| 8 | :526 | `node scripts/proxy-check.mjs` | **1** | **`PROXY: DRIFT (A_DRIFT term=A declared=4 computed=5 delta=+1)`** — claim is exit 0 + `PROXY: MATCH`; falsified |
| 9 | :527 | `node scripts/proxy-check.mjs --selftest` | 0 | `PROXY_SELFTEST: 53/53 pass` + `VERDICT: PASS` — matches |
| 10 | :517 (implied) | `node scripts/round-gate.mjs --integrations` (probe) | 64 | `round-gate: unknown argument: --integrations` — flag absent at HEAD **and** in the working tree (`git show HEAD:… \| grep -c integrations` → 0); SKILL.md:552-553 advertises it as where live-tree assertions moved |

## Gated steps (cannot cold-execute)
| SKILL.md cite | Command | Why gated |
|---|---|---|
| — | (none) | The checklist (:516) is all read-only; nothing else in SKILL.md prescribes a runnable step. `--close` (:575-578 "clean tree, nothing unpushed") was deliberately not run: it is the round-close operator act, and running a lane's close audit with a foreign dirty tree (live lane's 10 dirty entries) would record a foreign state under this verifier's stamp. Non-executable sections (launch sequence :196, judge pipeline :325) are knowledge maps, not operator steps. |

## Break points (oral context would have been required)
| # | Cite | Break | Class |
|---|---|---|---|
| 1 | SKILL.md:526 vs observed | Checklist asserts `proxy-check.mjs` → exit 0 + `PROXY: MATCH`; cold run yields exit 1 `A_DRIFT (declared=4 computed=5)`. A cold operator cannot reconcile this without the author's explanation of when A was last pinned | claim-falsified |
| 2 | SKILL.md:533-534 vs observed | Embedded live claim "Live 2026-09-28: `CITE_CHECK: DRIFT`, `errors=2`, both inside `corpus/lessons/round-6-aggregator-audit.md`" — observed errors=6 across four files (`round-close-gate.md:271` PIN_MISMATCH, `round-10.md:17` PIN_MISMATCH, `round-11.md:97,:100` REV_UNKNOWN ×2, plus the 2 historical round-6 LINE_OOR). A cold operator cannot tell which of the six are expected | claim-falsified |
| 3 | SKILL.md:552-553 | `--integrations` advertised as the home of live-tree assertions; flag does not exist in `round-gate.mjs` at HEAD or working tree (exit 64) | missing-file (flag absent) |
| 4 | SKILL.md:52-53 | "Full map: `corpus/knowledge/sighting-wall.md` (26 files, 10.6k lines)" — sizes like these are unverifiable as written and the map is the only pointer for the wall internals; cold operator cannot re-derive "26 files" from any command in SKILL.md | unresolvable-cite |

## Box-3 verdict
**[ ]** — decided by: command table rows 1+8+10, i.e. `node scripts/proxy-check.mjs` (SKILL.md:526) returned exit 1 `PROXY: DRIFT (A_DRIFT …)` where the checklist promises exit 0 + `PROXY: MATCH`; `cite-check` live run (SKILL.md:519) contradicts the SKILL.md:533 embedded live-claim (errors=6 vs 2); and `--integrations` (SKILL.md:552-553) does not exist at HEAD. Three independent claim-level falsifications in the one file box 3 is graded on.

## Post-run comparison
`SHONEN.md` box-3 line: *none* — the file (8 lines, `kumitate-shokunin/SHONEN.md:5`) is the four-item promotion checklist with box 3 rendered as `- [ ] Instructions executable by an agent without oral context`, unchecked, no verdict/quote/decider. Divergence: **yes** — no recorded lane self-verdict exists to diverge from; this run is the first recorded non-author grading of box 3 for this lane.

## Incidental (boxes 1/2/4 — not graded here)
- Box 1 incidentals: SKILL.md has real decision tables (dispatch shapes :16-30) and checklists (:515-527).
- Box 2 incidentals: LOG.md exists; not opened pre-run, not graded here.
- Box 4 incidentals: SKILL.md:247-256 carries a correctly cross-domain-labeled defect ("reported, not owned" — membrane-seal), which is the right posture; no bleed observed in the graded surface.

## D-84 follow-up (gate_selftest re-executed)
- `node scripts/round-gate.mjs --selftest` → **`57/57 pass`**, `VERDICT: PASS`, exit 0.
- `node scripts/cite-check.mjs --selftest` → **`19/19 (hermetic)`** exit 0; `surface-probe --selftest` → 38/38 exit 0; `proxy-check --selftest` → 53/53 exit 0. All hermetic suites PASS.
- The ledger's "combined VERDICT: FAIL with 8/9 integration" composition does not reproduce at this HEAD: the integration failure now lives in the **live** `cite-check` run (errors=6, VERDICT: FAIL), not in any round-gate integration mode (no such mode exists at HEAD; probe → exit 64).
- Failing case still pointing at an aggregator-owned file? The two aggregator-attributed findings from D-84 are still present but are now **WARN**-class in a 3130-finding run: `round-6-aggregator-audit.md:26` `AMBIG` (`base.mjs` matches 2 files) and `:31` `SUFFIX_RESOLVED` (`charter-scribe/`). The `:23,:116` LINE_OOR entries (`native_contract.rs:10896` — the auditor's quotation of the repaired D-51 defect) are still errors and still aggregator-owned text at HEAD (file byte-identical to HEAD, sha256 `badd780c…`, no dirty diff); the four NEW errors are kumitate-owned (`round-close-gate.md:271`, `round-10.md:17` PIN_MISMATCH both caused by the live lane's uncommitted `round-gate.mjs` edit — HEAD blob sha256 `2c6c580b…` matches the pinned `2c6c580b` exactly; `round-11.md:97,:100` REV_UNKNOWN).

## Incidental notes (evidence only)
- `audit-env.sh` is untracked (`??`) — it counts toward computed A=5 (`find . -path ./.git -prune -o \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \)`) but is absent from the SCORECARD stanza's declared A=4.
- Node: v24.19.0 (≥20 gate satisfied, SKILL.md:547-548).
