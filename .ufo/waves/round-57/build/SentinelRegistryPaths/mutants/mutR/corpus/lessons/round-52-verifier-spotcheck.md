# Round 52 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_kfc)
round: 52 (hyaku run 5, attempt 1; ONE v2 wave of exactly 64 seats)
report: /home/vgpnk/Projects/shokunin/.ufo/reports/round-52/kumitate.md (fleet commit 7aba75a3, lane identity `kumitate-shokunin`)
lane base → close HEAD: 02c01258464cac3804faf177d0cfbf113cd59706 → 17dd42e1e37d8f8abfde08417a20482e1ebfb8fa
measured claim revision (report + SCORECARD): R1 ab5dde401b7c798a5cbbd1cb9198756c7b913290 (R2 receipts 04237217, R3 idempotence+census 2023b5bd, R4 report-only 17dd42e1 = tip)

Watchdog digest (copied from the closure prompt):
`2026-10-24T00:27:42-03:00 launch kumitate round=52 pgid=2066817 driver=hyaku-inline attempt=1`;
`2026-10-24T01:44:36-03:00 complete kumitate round=52; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| Check | Method | Result |
|---|---|---|
| Report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-52/kumitate.md` (fleet) | PASS — `kumitate-shokunin 7aba75a3a806768c2e77e255a4647989680c32cb` "round-52: kumitate report". |
| SHONEN heading, one line per box | report `## SHONEN` | PASS — 4 boxes, each `[~]` with a resolvable pointer, no bare `[x]`. All four look fully checkable by a non-author (registry row SKILL.md:618 area + executable checklist `close/FINAL-harm-census.txt` H1 23/23; C1 end-to-end receipts + LOG.md round-52 entry; plan/commands executed by 60+ seats; w1/RevScope.md + ConnOverlap.md in-province) — noted for the operator; promotion is operator-owned. |
| Cited lane commits exist, ancestors of branch | `git merge-base --is-ancestor <hash> master` for 02c01258, f539a71e, 66766f7b, ac567439, 8fbf0fc8, ab5dde40, 04237217, 2023b5bd, 17dd42e1 | PASS — all nine are ancestors of `master` (jj-lane state: branch=master local=17dd42e1). |
| Lane repo clean and pushed | `jj-lane.sh state` + `git status --porcelain` | PASS — `ahead=0 behind=0`, local=remote=17dd42e1, empty porcelain (head=detached is expected post-helper). |
| Prompt carries the template contract | read `.ufo/prompts/kumitate-round-52.md` vs `templates/round-prompt.md` | PASS — §§1–5 verbatim from the template (mission/axes binding, 1–3 claims, frontier step, L2 floor + planner-seat ruling, report contract + marker rule, commit/push scope, L0) + §6 hyaku addendum; five child-lane items all present. Prompt committed by the lane (d0dd6558). |
| Marker vs report | content read | PASS — full report: work performed, landed-changes table (8 commits), before→after per claim with counting commands, Sources & frontier, trend verdicts, SHONEN, stale-lane + dead-seats + L0 lines. Not a marker. |
| Round shape | w1-spec.json, w1-validate.json, w1-registry.json | PASS — ONE v2 wave, `spawn=64 total=64`, `dispatch.calls=1` under policy v2 (band 64–128); registry roles executor 19 / reviewer 13 / scribe 8 / scout 7 / critic 6 / mutation-tester 5 / simplifier 2 / sentinel 2 / revenger 1 / connector 1 → attack (rev+crit+mut) = 24/64 = 37.5%, 25 with revenger = 39.1%; planner held by L1 per orchestrator ruling. Matches the report exactly. |

## 2. Claim re-checks

Both claims rest on lane-owned frozen counters (rule A52 v1, rule D52 v1) committed at the freeze and freeze-repaired by the named addendum. Per this closure's duty sheet I **re-measured** each before→after myself by executing the committed counters at pinned revisions (read-only over committed bytes; the counters extract the scored revision, they do not write the lane), and I **evidence-verified** every lane-owned gate surface from committed receipts without executing the lane's gates (selftest tallies, harm battery, checklist, proxy — per PROTOCOL §Gate standard Closure consequence).

### C1 — operability (capability deepening): `receipt-attest` v2, predicate `ATTEST52_HELD` (A52 v1, 13 checks). RE-MEASURED. Verdict: verified — operability improved.

- Before, my run: `node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 02c01258464cac3804faf177d0cfbf113cd59706` → `ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258…` exit 1; passing arms B2c B3c B4c B4d B6 exactly as the report states (before-state is not 0/13). Matches `base/attest52-base.txt`.
- After, my run at the lane tip: same command at `17dd42e1e37d8f8abfde08417a20482e1ebfb8fa` → `ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=17dd42e1… rule=A52 version=v1` exit 0, all thirteen PASS.
- Committed receipts agree: `close/FINAL-attest52-R1.txt` reads 13/13 at R1 ab5dde40; `close/IDEMPOTENCE-04237217.txt` reads 13/13 at R2 — the R52-11 close discipline (receipt executed at the measured close rev) is honored this round.
- Kill-rule class verified from committed evidence: K1 = base reading (do-nothing); K2/K3 forgers (`w1/ExecForgerV2.md`: stub 1/13, no-child-execution 7/13 — inside the declared tree-author boundary, named as limit (a)); K4 counter mutants (`build/MutCounter52/mutants/results.json`: 19 mutants — 13 drop-one all read UNMET, 2 verdict-swaps print HELD only with `held=5/13` which the frozen predicate sentence's literal `held=13/13 checks=13` kills; named limit (d)). Instrument mutants: `w1/MutInstrument.md` 18/18 killed by an independent detector. Black-box 20/20 (`w1/ExecBlackBox.md`), revenger reproduced the r51-F1 NaN forgery VALID under v1 / TAMPERED under v2 (`w1/RevengerV1V2.md`), B6: three r51 receipts VALID under v2 (`w1/ExecCompat.md`).
- Shipped bytes: `sha256sum scripts/receipt-attest.mjs` = `3d10d554e70a9d5dcb510287d3d030e04abe873f2573b922b961e9071ab7f01a`, byte-equal to the SCORECARD pin `pin.receipt-attest` and the report; selftest registry `grep -c 'case_('` = 46, matching the 46/46 committed tally (`w1/ExecInstrumentV2.md`, `w1/MutSelftest.md`, H2 census). Predicate sentence byte-identical in plan.md:53, probe header (`attest52-probe.mjs:88`) and report.
- Receipts: run wall_starts 04:21:36.873Z / 04:28:18.430Z / 04:28:31.770Z — span to run-3 ≈ 415 s ≥ 300; distinct nonces and digests; sidecar digests equal the entry's receipt-bound clauses (dccbee01…, e22e6571…, b487e85a…); doctored control (prelude-only rewrite, original sidecar) → `RECEIPT: TAMPERED` exit 1 (`w1/ExecReceiptPlan.md`).

### C2 — frontier coverage (learning, sourced): `fail-closed-clock-validation.md`, predicate `DOCTRINE52_HELD` (D52 v1, 5 checks). RE-MEASURED. Verdict: verified — coverage improved.

- Before, my run: `node .ufo/waves/round-52/probe/doctrine52-probe.mjs … 02c01258…` → `DOCTRINE52: DOCTRINE52_UNMET held=0/1 checks=1 … E1 MISS entry-absent` exit 1. Matches `base/doctrine52-base.txt`.
- After, my run at tip: same command at `17dd42e1…` → `DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=17dd42e1… rule=D52` exit 0, E1–E5 all PASS. Committed receipt `close/FINAL-doctrine52-R1.txt` reads 5/5 at R1; idempotence 5/5 at R2.
- Sourcing: entry provenance trio (`source:` cites S102+S103, `verified-at:`, `recheck: 180d`) ✓; ≥12 receipt-bound clauses each `receipt:<path>@sha256:<64hex>` (I verified the two source bodies and the three receipt sidecar digests above; the r52 probe binding `be2fe0ec…` matches the shipped probe bytes); kake S032 prior art named in the entry (`## Prior art`); tier scoping honest (S102 tier A scoped to grammar/offset only, the JS round-trip policy the lane's own citing S103 — recorded in the row, the lesson, and the entry's "withheld claims").
- Census, my run: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0, same four pre-existing W04s (S034/S068/S084/S095); rows = 103, tiers A:88/B:7/C:8 — matches the report's after-state (101→103, A 87→88, B 6→7) exactly.

### No exploratory claim

Both claims are counting claims; none was declared exploratory, so no `unprovable-but-better` non-author judgment was required.

## 3. Discernment spot-check (LEARNING.md — checked from outside)

The round's `## Gate` records two admits and **zero rejects** ("Rejected. None this round."), so no reject sample exists; the gate's two recorded *withheld claims* (S102 does not establish JS round-trip/finite-parse policy; S103 is secondary, not normative) serve as the non-admission sample and I checked them against the entry's text — both are correctly withheld. Both admits re-opened two ways: committed saved bytes + my own fresh fetch.

| Item | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| S102 (RFC 3339) | ADMIT tier A | saved bytes `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt` sha256 = row's `9ab2b886…e700a`, line 422 quote + lines 414–415/420 support; fresh `curl` 2026-10-24T04:5xZ → 35,064 B, sha256 identical, `diff` clean | AGREE | 5-word quote `date-time = full-date "T" full-time` is a verbatim located line; tier A correctly scoped to grammar/offset; hash stable across the round and my re-fetch |
| S103 (MDN Date.parse) | ADMIT tier B | saved bytes `.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html` sha256 = row's `9c120292…d140`, saved HTML line 1765 quote; fresh `curl` → 172,329 B, sha256 identical, same `Last-Modified: Sat, 24 Oct 2026 01:31:18 GMT` + etag | AGREE | 14-word quote is a verbatim located substring ("will be set to 2019-01-01 at 00:00:00 in the local timezone of the system"); tier B honest (secondary docs, environment claim only); unversioned page pinned by body hash |
| Withheld: S102 does not establish finite parse / toISOString round-trip / lane profile | WITHHELD | saved bytes §5.6 NOTE (lowercase t/z), `time-secfrac = "." 1*DIGIT`, §4.3 `-00:00` | AGREE | RFC 3339 permits all four degrees of freedom the lane profile refuses; withholding is correct curation, recorded in the row scope, the lesson, and the entry |
| Withheld: S103 not normative, scoped to environment claim only | WITHHELD | saved HTML line 1747 "Other formats are implementation-defined" | AGREE | tier B with single-proposition use (absent offset + time → local) is exactly calibrated |

## 4. Axis and trend verdicts

- Claims: C1 operability **improved** (re-measured 5/13 → 13/13, exit 1 → 0); C2 frontier coverage **improved** (re-measured 0/1 → 5/5; sources re-opened AGREE). No owned axis harmed: SCORECARD diff base→tip moves only A 71→76 (runnable count, incl. the v2 instrument + R50v2 probe + evidence copies) and C2 117→120 (the two new rows + the unrowed round-51-spotcheck repair + this entry/lesson); operability holds 9, coverage 10, all other axis rows unchanged; the pin re-derivation and registry rows are consistent with the shipped bytes I hashed.
- expansion **improved** — second sourced durable-execution entry admitted (S102/S103 mined; census 101→103); the C2 117→120 move is recorded as the inherited-drift repair, not claimed as new ground.
- quality **improved** — 14 named seat-found freeze repairs landed in the open with counters re-executed at base; 46-case suite + 18/18 instrument-mutant kill + 19 counter mutants bounded by the frozen predicate; five limits carried and named (tree-author forgery boundary; B2e binds data not execution; self-referential proxy pin; drop-one counter mutants vs the frozen predicate string; D51's r51 binding broke on the v2 cutover — archived v1 bytes hash-matching, re-anchor routed to r53).
- discernment **improved** — my outside re-open agrees with both admits; the zero-reject round is honestly recorded rather than padded; non-author disagreements (B3c/B4c collision, B2 argv gap, B4 sweep blindness, B5c hole, D52 hollow-clause class, B1c wording, attack arithmetic) all landed as named repairs or named limits with seat citations (lesson M1–M5).

## 5. Routed defects and notes for round 53

1. **R53 (SCORECARD prose inconsistency, status-neutral):** the SCORECARD round-52 section's H5 line says "D51 5/5 at R2", but the committed `close/FINAL-harm-census.txt` and the report's D51 named limit both read `DOCTRINE51 held=4/5 at R2` (D2 hash-miss on the v1 instrument bytes the v2 cutover replaced; archived v1 bytes `build/ScribeEntry/v1-receipt-attest.mjs` sha256 `44919763…` match the r51 binding; re-anchor already routed to r53). The stanza contradicts its own census — correct the prose line in the r53 round (append-only discipline: name it, don't rewrite).
2. **R53 (seat accounting, status-neutral):** the report says "all other 63 seats returned"; `w1/` holds 62 seat reports. `CritDoNothing` died twice (named, cyber-policy) — consistent; `ScribeReadme` delivered its payload (`build/ScribeReadme/README-rows.md`, rows landed in corpus/README.md) but wrote no w1/ report. Either count it as returned-without-report in the report's wording or file its report — minor accounting precision only.
3. Carried from the report (already lane-routed, re-flagged for the record): R52-9 (ledger `*.txt` scope), R52-10 remainder, A3e captured-invocation question, B5d counter source-pin arm, D51 re-anchor, freeze-time scratch-HELD witness (Q43/M5), R43-1/R43-5, R41-2 L0 pending.
4. SHONEN: all four boxes remain `[~]` lane-asserted; all four are checkable by a non-author on this round's evidence (§1 above) — named for the operator; promotion is operator-owned.
5. Tool installs: none by this closure (read-only verification; the counters run on the already-installed node v24.21.0). None reported by the lane (pacman paused host-wide).
