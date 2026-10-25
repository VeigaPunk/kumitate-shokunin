# kumitate — round 51 report (hyaku run 5)

Lane repo `kumitate-shokunin` (jj-colocated, git backend; branch `master`). Base and
round-open tip `c90b9de94009b938fa19a089bfaa97df20b54f86` (the integrator's round-50
spotcheck lesson `d788f74` landed between base and the freeze). Measured close revision
**`fef670794aa7a46d437bde58ab7f265d3471b587`**. Plan `.ufo/waves/round-51/plan.md` (with
the `## Freeze repair addendum`, ten named items); frozen counters
`.ufo/waves/round-51/probe/attest51-probe.mjs` (rule A51, v3r6, nine checks) and
`probe/doctrine51-probe.mjs` (rule D51, five checks). Round shape: **two v1 waves,
32 + 32 = 64 seats** (≤128), no residual call dispatched — wave 2's own distiller filed
33 uncovered/26 partial residual items but five wave-2 seats were still unreturned at
budget stop; the leftovers are named in `w2/SimplDedup.md` and carried into round 52's
candidates rather than padded. Wave 1: 29/32 reports on return; ExecForgerControl delivered late during wave 2 at 53
min and MutCounter at 59 min — **dead seat: ScribeEntry only** (no report, no artifact,
named, not replaced). Wave 2: 27/32 reports at close (unreturned:
MutShipped, MutCounters, MutReceiptBytes, MutSkillItem, RevStanza — recorded as dead at
budget stop, last status "running"; the wave-2 residual call was therefore not
dispatched — its item list is committed in `w2/SimplDedup.md` for round 52). One seat (CritA2Span/LowOtter) died twice on a
provider cyber-policy flag and completed on a plain-wording resume.

This round declares **two claims — C1, operability (capability acquisition): the
`receipt-attest` instrument**, predicate `ATTEST_HELD` (rule A51); **C2, frontier
coverage (learning, sourced): `corpus/knowledge/invocation-attestation.md`**, predicate
`DOCTRINE_HELD` (rule D51). Operability is the live axis at its terminal integer (9);
C2 is the frontier-band move with the stagnation context recorded in the SCORECARD.

## Work performed

- **Claim freeze and before-states** (`base/`): both counters committed at `06ecbf47`
  before any data seat ran; base readings `ATTEST_UNMET held=0/9` / `DOCTRINE_UNMET
  held=0/5` exit 1 at `c90b9de9` (re-measured after every repair; receipts committed).
  Round-open baseline battery: `PROXY: MATCH`, `CHECKLIST: 22/22 pass`
  (`base/baseline-gates.txt`).
- **C1 build** — `scripts/receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`,
  shipped bytes sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`,
  built by seat ExecInstrument, verified by three independent seats: selftest 27/27,
  black-box harness 27/28 with the one divergence a stale pre-addendum expectation,
  fresh-directory re-run + sabotage control). Integration per seat ExecPinsRecipe's
  rehearsed recipe: `GATE_PINS` row, `pin.receipt-attest`, forced `pin.proxy-check`
  re-pin (`495e5164…`), stanza re-derivation, SKILL.md gate-registry row + checklist
  item 23 + numeral sweep.
- **Six substantive freeze repairs + four text repairs**, every one seat-found, named in
  the addendum, and base-re-measured: A51 v1 unparseable (CritC1); D51 v1 column indexes
  (two independent seats); v2 kill rule fell to a print-stub (CritC1 + RevengerGap;
  RevCounterA's full-tree forger scored 5/5) → v3 challenge arms; A3c sidecar class bug
  (CritC1); no REPLAY assertion + stale plan arithmetic (RevPlan) → A4c; sidecar-only
  verify hole (DistWave1) → A3d. This round's own headline lesson (M1/M2, QUALITY Q43):
  a frozen counter that was never executed is not a predicate.
- **C2 build** — SOURCES rows S100/S101 opened by scout seats (fetched bytes, hashes,
  ≤25-word located quotes; `opened` 2026-10-23 local / fetch 2026-10-24T01:59Z), written
  by the scribe, and the knowledge entry with 13 sha256-bound clauses. Wave-2 non-author
  re-opens: both AGREE (byte-identical body hashes). Wave-2 also caught the integrated
  entry violating the trio-first rule and D2's same-line binding rule (D1/D2/D4 MISS at
  `7d88faa`); repaired and re-measured to 5/5.
- **A2 receipts** — three genuinely spaced runs (02:35:11Z / 02:39:06Z / 02:48:04Z, span
  772.9 s ≥ 300) wrapping live gate invocations, plus the doctored control committed with
  run-2's stale sidecar (the exact lesson-M2 shape: prelude re-dated, sidecar untouched →
  `RECEIPT: TAMPERED`).
- **Controls**: static-forger readings retained (v2 5/5; v3 5/7; v3r5 5/8; zero-spawn
  whole-tree forger 9/9 — the declared forgery boundary now has an end-to-end witness,
  `w1/ExecForgerControl.md`); do-nothing control at base (0/9) unreachable by a stub.
- **Round-50 closure routed defects R51-1..R51-4**: close-hygiene sweep run below;
  terms lines phrased declared-vs-computed with revs; L0 cited without line number;
  live-census limit re-recorded. The r50 spotcheck's claim re-checks were read and its
  verdicts stand at this base.
- **Misroot sweep** — `git -C /home/vgpnk/Projects/shokunin status --porcelain`: no
  kumitate seat file landed at the fleet root; no copy/delete needed.
- **Tool installs** — none by the L1; no seat reported an install (pacman paused
  host-wide; no uv/npx/binary channel used).

## Landed changes

All commits via `scripts/hyaku/jj-lane.sh`, all pushed (`landed` lines verified):

| Commit | What it carries |
|---|---|
| `06ecbf47` | round-51 freeze: plan, counters A51/D51 v1, w1 spec, baseline battery |
| `1fd8aceb` | freeze repair 1 — A51 comment termination (seat CritC1) |
| `3ed875d3` | freeze repair 2 — D51 column indexes (two independent seats) + base receipts |
| `9d08e6b8` | w1 dispatch evidence (spec v2, dispatch, taskCall, registry + agentIds) |
| `8c07e880` | freeze repair 3 — A51 v3 challenge arms A2c/A3c + ledger exemption addendum |
| `8fd3cde1` | freeze repair 4 — A3c sidecar copy (seat CritC1) |
| `4b8da21`  | freeze repair 5 — A4c REPLAY arm + plan arithmetic + header fix (seat RevPlan) |
| `cbca45cc` | freeze repair 6 — A3d digest-binding arm (seat DistWave1) |
| `779b16e` / `8f3c692b` | plan text repairs (RevPlan residue; MutInstrument F-1 + F3 wording) |
| `a476977d` | C1/C2 integration: instrument, GATE_PINS + pin family, stanza, SKILL.md, S100/S101 rows, entry, lesson, Q43, w1 evidence |
| `7d88faa7` | A2 receipts 1–2 + A3 control |
| `cd7f69d3` | receipt 3 scheduled + stale-sidecar control + wave-2 entry fixes (one inline plan edit, excepted in addendum item 10) |
| `9a345d5c` / `2d7ecba4` | wave-2 finding fixes (same-line bindings; addendum items 9–10) |
| `efdd7424` | wave-2 reports + close receipts committed |
| `57333ead` | close record: SCORECARD round-51 section + capability row, LOG, late evidence, R52 routes |
| `fef67079` | stanza A re-derived to 71 (committed-tree walk) — **measured close revision** |

## Before → after measurements

**C1 — operability, `ATTEST_HELD` (rule A51 v3r6).** Command:
`node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
- **Before** at `c90b9de9…`: `ATTEST_UNMET held=0/9` exit 1 (`base/attest-base-v3r6.txt`).
- **After** at `fef670794aa7a46d437bde58ab7f265d3471b587`: `ATTEST_HELD held=9/9 checks=9
  rev=fef67079… rule=A51 version=v3` exit 0 (all nine checks PASS; `close/FINAL-*.txt`).

**C2 — frontier coverage, `DOCTRINE_HELD` (rule D51).** Command:
`node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
- **Before** at `c90b9de9…`: `DOCTRINE_UNMET held=0/5` exit 1 (`base/doctrine-base.txt`).
- **After** at `fef67079…`: `DOCTRINE_HELD held=5/5` exit 0 (D1 trio, D2 13/13 bound
  clauses hash-verified, D3 rows mined+used-by, D4 `SOURCES_CHECK: CLEAN`, D5 census 0).

## Sources & frontier

Census command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
/home/vgpnk/Projects/shokunin kumitate`.
- **Before** (round open, rev `6927903`-era reading reconfirmed at base): exit 0, 99
  rows, `tiers=A:85,B:6,C:8 status=queued:12,mined:71,rejected:16`, four pre-existing
  W04 duplicate-url warnings (S034, S068, S084, S095).
- **After** (close): exit 0, **101 rows**, `A:87,B:6,C:8`, `mined:73,queued:12,
  rejected:16`, same four W04s (`close/FINAL-harm-census.txt`, `w2/ScoutCensus2.md`).
- **Rows added by tier:** A +2 (S100 man7 clock_gettime(2); S101 man7 getrandom(2)), B 0,
  C 0. **Removed** 0. **Status transitions** none beyond the two mined-at-insert.
- **Rows touched old→new:** S101 `teaches` cell corrected (omitted "By default,"
  restored — logged in the lesson `## Gate`).
- **Frontier rows advanced:** none promoted; S100/S101 enter as `mined` with used-by
  `corpus/knowledge/invocation-attestation.md` (frontier band per PROVINCE.md, first
  sourced entries of the durable-execution research line).
- **Re-opens (non-author):** S100 AGREE (`w2/ScoutReopenS100.md`; quote verified
  tag-stripped with the row's wider anchor), S101 AGREE (`w2/ScoutReopenS101.md`).
- Sourced claim: **C2 rests on S100/S101**, opened this round and cited in the entry's
  provenance trio (frozen arm D1).

## Trend verdicts

- **expansion — `improved`.** A new capability enters the repertoire (`receipt-attest`,
  demonstrated running: 9/9 at the measured close rev) and the frontier band gains its
  first sourced entries (S100/S101 → the entry). Counterweights: no registry family
  moved; the A-term inflation (43→71) is probe scratch by the frozen whole-tree walk,
  recorded and ruled out as claim evidence (Q26).
- **quality — `improved`.** The M2 detection gap is closed by a shipped, pinned,
  mutation-tested instrument with behavioral challenge arms (measured: stale-sidecar
  re-date → TAMPERED; ≥300 s re-date with recomputed sidecar → TAMPERED; ledger nonce
  reuse → REPLAY; corrupt digest → REPLAY); the checklist grew 22→23 with the new item
  proven genuinely executed (mutation controls); the round's own freeze discipline was
  audited and repaired in the open (ten addendum items). Counterweights (honest): five
  static arms remain whole-tree-author satisfiable (witnessed end-to-end); the R52-1..R52-3
  instrument under-coverage list is routed, not hidden; H5's R50 arm reads 7/8 at every
  round-51 rev (one stale literal check superseded by the legitimate registry growth —
  routed R52-4, no round-50 repair regressed).
- **discernment — `improved`.** Non-author disagreements changed the record: two
  independent D51 findings, the falsified kill rule, the A3c class bug, the REPLAY and
  digest holes, the entry trio/binding violations, the stale-sidecar fixture, the H5
  literal, the zero-spawn witness — all landed as repairs or named limits with seat
  citations. The round keeps its own failing intermediate readings (7/9 pre-close,
  D51 2/5 at the first integration) instead of overwriting them. Counterweight: the
  closure's independent spot-check is still owed (the driver's verification is pending
  at filing).

## SHONEN

- `[~]` **SKILL.md contains real decision tables, error patterns, checklists, cited
  sources** — `SKILL.md:12-33` dispatch-shape table, `:589-618` gate registry
  (thirteen gates, receipt-attest row), `:686-709` executable checklist `CHECKLIST:
  23/23 pass` at the close (`close/FINAL-harm-census.txt`). No named non-author verifier.
- `[~]` **At least one end-to-end domain task executed and logged in LOG.md** — C1
  executed end-to-end and logged (`LOG.md` round-51 entry): 0/9 → 9/9 with committed
  receipts. No named non-author verifier for the box.
- `[~]` **Instructions executable by an agent without oral context** — plan.md counting
  commands run verbatim by six seats; the instrument's selftest and frozen counters are
  self-describing. No named non-author verifier.
- `[~]` **No cross-domain bleed (PROVINCE.md still accurate)** — `w1/RevScope.md` and
  `w2/ConnOverlap2.md` confirm both claims in-province; the capability row uses "nonce
  ledger" with the connector's negative sentence (no sibling paths, no helper-receipt
  merge). No named non-author verifier.

## Stale-lane / extras

- **Stale-lane line:** respawn-per-round driver; this mission serves round 51 only; no
  other kumitate mission is open.
- **Open L0:** the R41-2 gate-pins authority question stays pending
  (`.ufo/l0-questions.md`, kumitate round 42 — no line number per R51-3). No new L0
  appended; the R52 routes are lane-planned, not operator decisions.
- **Late/dead seats:** wave 1: ExecForgerControl and MutCounter delivered late (53 min /
  59 min, after return-now nudges) and were integrated; **ScribeEntry returned at 1h4m** as a review pass (all gates green at the tip; two entry nits fixed in the final commit).
  Wave 2: 27/32 reports at close. Post-close returns: MutShipped (R52-6 selftest-coverage
  findings routed in the SCORECARD limits), MutCounters (14/14 drop-one mutants UNMET),
  RevStanza (A-term composition correction landed in the SCORECARD terms). Final accounting:
  **all 64 seats returned** (MutSkillItem last, 31m — item-23 executions verified; its
  live-tripwire finding cross-named with RevStanza; the ExecForgerControl `lanes/`
  nested-repo scratch stays as documented evidence, its A-term tripwire the named r52
  round-open cleanup). One provider-flag death and
  recovery: CritA2Span (completed on plain-wording resume; the two flagged attempts are
  the recorded error text).
- **Harm battery at close** (`close/FINAL-harm-census.txt`): H1 `CHECKLIST: 22/23 pass` at the live close run (`close/FINAL-harm-census.txt`) —
  the single red item is the proxy-recompute arm tripping on the five unreturned wave-2
  seats' transient runnable scratch in the working tree (computed A=81 vs declared 71);
  at the committed close rev the proxy arm reads `PROXY: MATCH` (A5's own conjunct, and
  the frozen counter measures committed bytes by design). The wave-2 red arms (entry
  header, item 12) were repaired pre-close; H2 selftests green per `w2/RevHarm.md` (12/12,
  7/7, PASS, 61/61) and re-confirmed at `efdd742`; H3 `PROXY: MATCH … pins=6` at the
  committed close rev (the live tree reads DRIFT only while five unreturned seats'
  transient scratch exists — the frozen counter measures committed bytes by design);
  H4 census exit 0; H5 G50 8/8, R50 7/8 (R5 stale literal, routed R52-4 — recorded
  above, not prettified).
- **Round-50 routed defects:** R51-1 close hygiene: every receipt in this round was
  committed through the helper before returning, `git status` swept at close, no sweep
  needed; R51-2 terms phrasing: this report's Terms lines declare computed-vs-declared
  with the revs that moved them; R51-3 L0 style honored; R51-4 live-census limit carried
  (D5 is live-by-contract; recorded in the SCORECARD limits).
- **Post-close addendum:** MutReceiptBytes returned after filing with A2's span-arm counterexample (true 230.042 s span displayed as 350.042 s via ±60 s prelude drift; the M2 class stays closed — routed R52-7, one-line fix named) plus R52-8..R52-10 (TZ-dependent prelude parsing, ledger extension scope, distinct-sha weakness); all recorded in the SCORECARD limits. Post-close returns now cover every wave-2 seat except MutSkillItem.
