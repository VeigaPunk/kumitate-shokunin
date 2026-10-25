# kumitate — round 52 report (hyaku run 5)

Lane repo `kumitate-shokunin` (jj-colocated, git backend; branch `master`). Base / round-open
tip `02c01258464cac3804faf177d0cfbf113cd59706`; freeze `f539a71e236a4d66810851c1f2fb6e1abe61ec19`;
freeze-repair addendum `8fbf0fc8c2f47322b9c21fa5908cbb629734f84f`. **Measured close revision
R1 = `ab5dde401b7c798a5cbbd1cb9198756c7b913290`** (R2 = receipts `042372174ac3940658e13733038638bd754469ea`,
R3 = idempotence+census `2023b5bdce5c34b29266702ab40edd865c76bfff`, R4 = report-only `17dd42e1e37d8f8abfde08417a20482e1ebfb8fa` = lane tip).
Round shape: **ONE v2 wave of exactly 64 seats** (orchestrator/operator steer 2026-10-24,
supersedes the planned 32+32 v1 shape), validated under `scripts/hyaku/ufo-wave-policy-v2.json`
(band 64–128; 24 attack-role seats by reviewer+critic+mutation-tester = 37.5%, 25 counting the
revenger = 39.1%; both clear the ≥25% floor), dispatched as exactly ONE task call; the §3
planner seat held by the L1 (bounded data-walk on seats RevPlan/RevCounterA). No residual
call: post-wave verification of integrated bytes was L1 integration per the plan.

This round declares **two claims — C1, operability (capability deepening): `receipt-attest`
v2** (contract `kumitate-receipt-attest-v2`), predicate `ATTEST52_HELD` (rule A52 v1, 13
checks); **C2, frontier coverage (learning, sourced): `fail-closed-clock-validation`** resting
on SOURCES rows S102/S103 opened this round, predicate `DOCTRINE52_HELD` (rule D52 v1, 5
checks). Operability is the lane's lowest live axis (9; successors at 10), satisfying the
lowest-axis obligation; C2 is the frontier-band move on the durable-execution line.

## Work performed

- **Claim freeze and before-states** (`base/`): plan + both counters committed at `f539a71e`
  AND executed at base per Q43: `ATTEST52_UNMET held=5/13` / `DOCTRINE52_UNMET` (E1
  entry-absent; addendum-re-run derived label) exit 1. Round-open battery: inherited
  `PROXY: DRIFT` (A 71→73 from the two probe files; C2_total 117→118 = the unrowed
  round-51 spotcheck lesson; coverage derived 9), `CHECKLIST 21/23` (items 692/694), G50 7/8,
  A51 8/9, D51 5/5 — one root cause, all repaired or named at close (`base/baseline-gates.txt`).
- **C1 build** — `scripts/receipt-attest.mjs` v2 (sha256 `3d10d554…7f01a`, 46-case selftest,
  built by seat ExecInstrumentV2, hardened across three seat-found iterations incl. the two
  MutSelftest/MutInstrument R52-6 truncation arms and the V14/V46 attested-prior arms). The
  routed package: R52-1 CLOCK (finite + byte-exact `toISOString` round-trip), R52-2 LEDGER
  wording, R52-3 SHAPE (whitelist, two-lines-strict, prelude profile, sidecar-name equality,
  half-pair removal, exit-127 arm), R52-6 truncation selftest arms, R52-8 prelude shape
  (TZ-independence measured by ScribeEntry: identical bytes flip VALID/TAMPERED across
  TZ=UTC/Tokyo/New York under v1), A2e/M5 `STDIN` (`--stdin`, nonce on the child's stdin,
  `stdin_sha256`). Verified independently: ExecSelftestExec fresh-dir 46/46 + sabotage FAIL;
  ExecSelftestV2 43-case cross-run no divergences; ExecBlackBox 20/20; RevengerV1V2 reproduced
  the exact r51-F1 forgery against v1 (VALID) and v2 (TAMPERED) and proved the round-trip
  conjunct the minimal fix; ExecCompat B6 (3 r51 receipts VALID under v2).
- **14 named freeze repairs** (plan `## Freeze repair addendum`), every one seat-found
  (B3c/B4c sidecar-name conformity, B2 planned-argv binding, B4 sweep filter incl. the
  attest-run corpora, B1 `(n/n)` regex, rev hardening + symlink guard, B1c NaN-class wording +
  TAMPERED verdict, B5c judged-bytes guard, B6 synthesized fourth receipt, B2 digest
  distinctness, probe-header predicate sentences, D52 E2 distinct-blob, D52 E3 spacing, D52
  derived early-exit label). Counters re-executed at base after each package; receipts
  refreshed. Q43 whole: the counter was also shown ABLE to pass before data — seat
  ExecProbeA52's scratch-tree witness read 13/13 + 5/5 against the repaired counter.
- **A2 receipts** — three genuinely spaced runs wrapping live gates (run-1 bind-oracle
  04:21Z, run-2 sources-check 04:28Z, run-3 round-gate 04:31Z; body-wall_start span ≥ 300 s,
  distinct nonces and digests), plus the M2-class doctored control (prelude-only rewrite,
  genuine-hash sidecar with re-pointed basename per the repaired SHAPE semantics → TAMPERED).
- **R52-4 bounded repair** — `.ufo/waves/round-50/probe/repairs50-probe-v2.mjs` (count-derived
  R5 arm): R50 reads 8/8 at R2; the original probe is retained untouched (7/8, history).
- **Close hygiene per R52-11/Q44** — FINAL receipts executed AT R1 and committed at R2;
  idempotence re-run at R2 committed at R3; report + SCORECARD cite R1 and name R2/R3/R4.
- **Inherited-state repairs** — README map row for the unrowed round-51 spotcheck lesson
  (C2 117/118 → 120/120), the missing `| 51 |` table row + LOG round-51 line (the round-close
  checklist item audits the previous round), SCORECARD stanza re-derivation (A=76 committed
  runnable incl. the two probes + R50v2 + two evidence copies; C2=120/120), pin re-derivation
  (`pin.receipt-attest=3d10d554…`), SKILL.md registry row + item 23 re-labelled to v2.
- **Misroot sweep** — no kumitate seat file at the fleet root; the fleet state-file changes
  are driver-owned; no copy/delete needed (recorded in `close/FINAL-harm-census.txt`).
- **Tool installs** — none by the L1; no seat reported an install (pacman paused host-wide).

## Landed changes

All commits via `scripts/hyaku/jj-lane.sh`, all pushed (`landed` lines verified):

| Commit | What it carries |
|---|---|
| `f539a71e` | round-52 freeze: plan (2 claims, v2-wave shape), counters A52/D52 v1, executed base receipts (Q43) |
| `66766f7b` / `ac567439` | v2 wave spec (64 seats, 37.5% attack) + validation/taskCall evidence |
| `8fbf0fc8` | freeze-repair addendum (14 named seat-found repairs), repaired counters, refreshed base receipts, B5c evidence |
| `ab5dde40` (R1) | C1/C2 integration: v2 instrument, 3 receipts + doctored control, entry + S102/S103 rows, 3 README rows, lesson + Gate, Q44, SCORECARD rows/stanza/section, LOG lines, SKILL deltas, R50v2 probe, wave evidence (63 seat reports + build transcripts) |
| `04237217` (R2) | `close/FINAL-attest52-R1.txt` + `close/FINAL-doctrine52-R1.txt` (both executed at R1) |
| `2023b5bd` (R3) | `close/IDEMPOTENCE-04237217.txt`, final harm census, registry, late report |
| `17dd42e1` (R4, tip) | late SonicWave report revision (report-only) |

## Before → after measurements

**C1 — operability, `ATTEST52_HELD` (rule A52 v1).** Command:
`node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
- **Before** at `02c01258…`: `ATTEST52: ATTEST52_UNMET held=5/13 checks=13 …` exit 1
  (`base/attest52-base.txt`; passing arms B2c B3c B4c B4d B6 re-assert r51 properties under
  v1 — the before-state is not 0/13 and is quoted exactly).
- **After** at R1 `ab5dde40…`: `ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=ab5dde401b7c798a5cbbd1cb9198756c7b913290 rule=A52 version=v1` exit 0, all thirteen PASS
  (`close/FINAL-attest52-R1.txt`); idempotence at R2 `04237217…`: `held=13/13` exit 0
  (`close/IDEMPOTENCE-04237217.txt`). Kill controls: K1 do-nothing = the base reading; K2/K3
  stub and zero-spawn forgers seat-run (`w1/ExecForgerV2.md`: stub held=1/13; no-child-execution
  forger held=7/13 — inside the declared tree-author boundary); K4 counter mutants
  (`w1/MutCounter52.md` + `build/MutCounter52/counter-mutant.txt`).

**C2 — frontier coverage, `DOCTRINE52_HELD` (rule D52 v1).** Command:
`node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
- **Before** at `02c01258…`: `DOCTRINE52: DOCTRINE52_UNMET held=0/1 checks=1 … | E1 MISS entry-absent` exit 1 (`base/doctrine52-base.txt`).
- **After** at R1: `DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=ab5dde40… rule=D52` exit 0
  (`close/FINAL-doctrine52-R1.txt`); idempotence 5/5 at R2. Sourced: S102 (RFC 3339, tier A,
  grammar/offset only) + S103 (MDN `Date.parse()`, tier B, environment claim only); 28 bound
  clauses / 27 distinct paths; prior art kake S032 named in the entry.

## Sources & frontier

Census command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`.
- **Before** (round open, `base/baseline-gates.txt`): exit 0, **101 rows**, tiers A:87/B:6/C:8,
  four pre-existing W04s (S034/S068/S084/S095).
- **After** (close): exit 0, **103 rows**, A:88/B:7/C:8, same four W04s.
- **Rows added by tier:** A +1 (S102 rfc-editor.org/rfc/rfc3339.txt, 35,064 B, sha256
  `9ab2b886…e700a`, §5.6 quote `date-time = full-date "T" full-time`), B +1 (S103 MDN
  Date.parse, 172,329 B, sha256 `9c120292…d140`, line-1765 quote on local-time interpretation).
- **Rows touched old→new:** none. **Frontier rows advanced:** S102/S103 enter `mined` with
  used-by `corpus/knowledge/fail-closed-clock-validation.md` (second sourced entry of the
  durable-execution line; the line's first was r51's invocation-attestation).
- **Sourced claim:** C2 rests on S102/S103 opened this round; the lesson `## Gate` records
  URL, access date and ≤25-word located quotes for both; tiers audited by ScoutTierAudit and
  CritC2 (S102 tier A scoped to grammar/offset — the JS round-trip policy is the lane's own,
  citing S103; that scope split is written into the row and the entry).
- Re-open of the new rows by a non-author seat/closure: pending at filing (declared in the
  entry's `verified-at` line) — the spot-check closure re-opens per its duty sheet.

## Trend verdicts

- **expansion — `improved`.** A capability deepens (receipt-attest v2: stdin-attested
  receipts, fail-closed clocks, 46-case suite) and the frontier band gains its second sourced
  entry (S102/S103 → fail-closed-clock-validation; census 101→103). Counterweights: no
  registry family moved; coverage successors stay at 10 (the C2 117→120 move repairs the
  inherited drift, restoring the declared state — recorded, not claimed as expansion).
- **quality — `improved`.** The routed R52-1/2/3/5/6/7/8 + A2e package is shipped, pinned,
  mutation-tested (MutInstrument 18/18 killed by an independent detector; MutSelftest's three
  truncation mutants + the two later arms all killed on the shipped bytes), and the r51
  capability stays green at the tip (B6: the three r51 receipts verify under v2, plus a
  synthesized fourth). The round's own freeze failures were repaired in the open — 14 named
  addendum items with seat citations, base receipts re-run each time — and mined as M1–M5
  with Q44 freezing the close-receipt discipline. Honest counterweights: five named limits
  carried (tree-author forgery boundary; B2e binds data not execution; self-referential proxy
  pin; drop-one counter mutants vs the frozen predicate string; D51's r51 binding broke on
  the v2 cutover — named in H5, re-anchor routed to r53); G50's round-open 7/8 and A51's 8/9
  were the inherited drift, both repaired/named.
- **discernment — `improved`.** Non-author disagreements changed the record within minutes:
  the B3c/B4c fixture-vs-contract collision (five independent seats), the B2 argv gap, the
  B4 sweep blindness, the B5c self-reference hole, the D52 hollow-clause class, the B1c
  NaN-vs-rollover misstatement, the attack-count arithmetic — all landed as named repairs or
  named limits with seat citations. The builder seat surfaced its own blocker to the L1
  instead of silently conforming the contract (ExecInstrumentV2 relay), and the wave's
  adversarial seats scoped exactly what the new arms do and do not prove.

## SHONEN

- `[~]` **SKILL.md contains real decision tables, error patterns, checklists, cited
  sources** — gate registry (receipt-attest row now contract-v2) at `SKILL.md:618`; executable
  checklist `CHECKLIST: 23/23 pass` at the close (`close/FINAL-harm-census.txt`). No named
  non-author verifier.
- `[~]` **At least one end-to-end domain task executed and logged in LOG.md** — C1 executed
  end-to-end (receipts wrap live gates; 13/13 at R1) and logged (`LOG.md` round-52 entry).
  No named non-author verifier.
- `[~]` **Instructions executable by an agent without oral context** — plan/counter/commands
  run verbatim by 60+ seats; the protocol.sh receipt recipe rehearsed by ExecReceiptPlan.
  No named non-author verifier.
- `[~]` **No cross-domain bleed (PROVINCE.md still accurate)** — `w1/RevScope.md` + the
  connector scan confirm both claims in-province; kake S032 cited as prior art, not absorbed.
  No named non-author verifier.

## Stale-lane / extras

- **Stale-lane line:** respawn-per-round driver; this mission serves round 52 only; no other
  kumitate mission is open.
- **Dead seats (named, never replaced):** `CritDoNothing` died twice on a provider
  cyber-policy flag (`code=cyber_policy`, 33 s and on the plain-wording resume; transcript at
  `history://kumitate-r52.CritDoNothing`) — its do-nothing control class was covered by the
  K1 base receipts and ExecForgerV2's controls; all other 63 seats returned (two delivered
  follow-up iterations mid-wave on the instrument; SonicWave revised its report post-close,
  landed at R4).
- **Open L0:** the R41-2 gate-pins authority question stays pending (`.ufo/l0-questions.md`,
  kumitate round 42); no new L0 appended — the R52-9/10 deferral, the D51 re-anchor and the
  B5d arm are lane-planned for round 53, not operator decisions.
- **D51 named limit:** reads 4/5 at R2 — the r51 entry binds the v1 instrument bytes at a
  path the v2 cutover replaced; the identical bytes are archived (hash-matching) and the
  re-anchor is routed to r53. Not prettified.
- **Routed to round 53:** R52-9 (ledger `*.txt` scope), R52-10 remainder (ledger evidence
  set), A3e captured-invocation question, B5d counter source-pin arm, the D51 binding
  re-anchor, freeze-time scratch-HELD witness (lesson M5), R43-1/R43-5.
