# kumitate — round 52 report (skeleton; slots marked for the L1 to fill at close)

Lane repo `kumitate-shokunin` (jj-colocated, git backend; branch `master`). Round-open /
base tip **`02c01258464cac3804faf177d0cfbf113cd59706`** (the revision both freeze receipts
name). Draft-time lane tip **`ac5674393f68fb6510be48ad3fb3b20ebf4e1cc4`** (`round-52: wave
validation + taskCall evidence (policy v2, 64 seats, one call)`; freeze `f539a71`, spec
`66766f7`). Measured close revision **`<R1>`** — fill from `close/FINAL-<R1>.txt`; name the
receipt commit `R2` and the idempotence commit `R3` (plan, close sequence 2–4).

Filed report path (the L1 files it; this seat does not):
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-52/kumitate.md`.
Plan `.ufo/waves/round-52/plan.md` (frozen before any data seat). Frozen counters
`.ufo/waves/round-52/probe/attest52-probe.mjs` (rule A52, version v1, 13 checks B1…B6) and
`probe/doctrine52-probe.mjs` (rule D52, version v1, 5 checks E1…E5), committed at freeze and
executed at base (Q43): `base/attest52-base.txt`, `base/doctrine52-base.txt`.

**Round shape:** ONE v2 wave of exactly 64 seats (operator steer 2026-10-24), policy v2,
**24/64 attack seats**, validated under `scripts/hyaku/ufo-wave-policy-v2.json` (band 64–128,
≥25% attack roles), dispatched as exactly ONE `task` call (`w1-taskcall.json` +
`w1-validate.json`: `counts.spawn=64 resume=0 total=64`; policy block `waveMinLanes=64
waveMaxLanes=128`).

> **Attack-seat-count conflict (recorded verbatim, not reconciled by this seat).** This
> seat's steer reads "24/64 attack seats"; `plan.md` §Wave and the `w1-spec.json` milestone
> read "25 attack seats = 39%". Under the addendum's declared attack-role list — reviewer,
> critic, mutation-tester, labrat (`scripts/hyaku/lane-addendum.md:52-53`) — the roster
> (`w1-spec.json`: reviewer 13, critic 6, mutation-tester 5, labrat 0) gives **24/64 =
> 37.5%**. The plan's 25 additionally counts the single `revenger` seat, which that list
> does not name. Both readings clear the ≥25% floor (16 seats); the canonical judge
> adjudicates which number the SCORECARD row and this report carry.

Minimum-content anchors for `scripts/round-gate.mjs --round 52`: this file carries the
`SHONEN` heading with one line per box, ≥2 headings, work performed + evidence pointers,
landed changes each tied to a `LOG.md` entry slot, a resolvable commit citation
(`ac5674393f68…` resolves at draft time and is an ancestor of the working tip), and the
string `round-52`.

## Work performed

This round declares two claims on distinct axes: **C1 — operability (capability deepening):
`receipt-attest` v2, verified by rule A52**, and **C2 — frontier coverage (learning,
sourced): `corpus/knowledge/fail-closed-clock-validation.md`, verified by rule D52**. Both
predicate sentences are reproduced byte-identically from `plan.md` in "Before → after
measurements" below; no third, exploratory claim is filed.

- **Claim freeze and before-states (Q43).** Everything frozen before any data seat: plan,
  both counters, w1 spec, base battery. Committed base readings (heads quoted here; the
  whole lines are in the committed receipts, and the close must quote the FINAL line whole):
  `ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | …`
  (`base/attest52-base.txt`; held = B2c, B3c, B4c, B4d, B6 — the round-52 receipts are
  absent by construction, `--stdin` is USAGE exit 64, the pin still names v1, the A52
  mutant receipt is absent, and the proxy reads DRIFT) and
  `DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5 rev=02c01258… rule=D52 | E1 MISS entry-absent`
  (`base/doctrine52-base.txt`). Round-open battery (`base/baseline-gates.txt`):
  `PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delta=+2; C2_TOTAL_DRIFT term=C2_total
  declared=117 computed=118 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9;
  src-rev=31c465f15669)`; `BINDGUARD50: GUARD_UNMET held=7/8 checks=8`;
  `ATTEST51: ATTEST_UNMET held=8/9 … A5 MISS pin match;proxy exit=1`;
  `DOCTRINE51: DOCTRINE_HELD held=5/5`; census `census-exit=0` with the four pre-existing
  W04 lines (S034/S068/S084/S095). Round-open `CHECKLIST: 21/23 pass` is quoted from the
  plan; no `surface-probe --checklists` transcript is committed under `base/` — finding F3
  below.
- **C1 build — contract `kumitate-receipt-attest-v2` at `scripts/receipt-attest.mjs`.**
  v1 semantics preserved (receipt form, inner digest, sidecar, verdicts, exit map; v1
  pinned bytes `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`, still
  the value of `pin.receipt-attest` at draft time, `SCORECARD.md:319`). Additions, each
  with its frozen check: `SHAPE` (field whitelist, exactly two lines + trailing newline,
  prelude regex, sidecar-name equality, half-pair removal, spawn-failure case) →
  B1/B3/B3c; `CLOCK` (finite + `toISOString()` round-trip) → B1c; `STDIN`
  (`run --out <base> --stdin -- <cmd…>`, nonce bytes on the child's stdin,
  `stdin_sha256`) → B2e; `LEDGER` (explicit damaged-prior skip note + selftest arm) → B4;
  `SELFTEST` (≥30 cases, one `case <name>: PASS|FAIL` line each, final
  `ATTEST_SELFTEST: PASS (n/n)`, v1's 27-case corpus retained, truncation forgers
  included) → B1. Receipt protocol: three runs of the COMMITTED v2 instrument, run-at span
  ≥300 s, each wrapping a live lane gate (`bind-oracle.mjs --selftest`,
  `sources-check.mjs`, `round-gate.mjs --selftest`), at
  `receipts/attest52-run-{1,2,3}.txt` + sidecars, plus the doctored control
  `receipts/attest52-run-2-replayed.txt` (prelude re-dated, sidecar untouched → TAMPERED,
  B3). **Outcome slots:** `<hash: instrument v2>`, `<receipt paths + shas>`,
  `<selftest transcript path>`.
- **C2 build — `corpus/knowledge/fail-closed-clock-validation.md`.** Before-state observed:
  the entry is absent at the draft-time tip (`ls` → no such file), no `S102`/`S103` rows
  exist (`grep -n 'S102\|S103' corpus/SOURCES.md` → empty; `grep -c '^| S' corpus/SOURCES.md`
  → 101 rows), matching D52's base reading `held=0/5 | E1 MISS entry-absent`. Content
  contract: provenance trio first (source / verified-at / recheck), ≥12 receipt-bound
  `- ` clauses (`receipt:<repo-path>@sha256:<64hex>`, path existing at rev with a matching
  blob hash), SOURCES rows S102 (RFC 3339, tier A) + S103 (companion, tier assigned
  honestly) status `mined` with `used-by` the entry. Checks: E1–E5. **Outcome slots:**
  `<hash: entry + rows>`, `<entry sha256>`, `<census after>`.
- **Routed inputs honored (R52-1…R52-11).** R52-1 → `CLOCK`; R52-2 → `LEDGER` wording +
  selftest arm; R52-3/R52-8 → `SHAPE`; R52-4 → bounded named repair of the round-50 probe
  (count-derived arm, versioned v2, receipt re-run; H5's R50 term moves 7/8 → 8/8 or stays
  7/8 named); R52-5 → B5c vacuous-HELD mutant + the probe's own checks-nonempty guard;
  R52-6 → selftest truncation arms; R52-7 → B2 span scored from the digest-bound
  `wall_start` body field, never the display prelude; R52-9/R52-10 (ledger `*.txt` scope,
  distinct-sha weakness) are **deferred to round 53**, named in the SCORECARD limits;
  A2e/M5 → `STDIN` + B2e; R52-11 → the close sequence below + new QUALITY criterion Q44.
- **Kill rules K1–K5 (declared before data).** K1 do-nothing = base bytes + SCORECARD-only
  edits: observed `held=5/13`, cannot reach 13/13 — the two committed base receipts ARE
  this control. K5 D52 do-nothing: observed `0/5`, entry absent. K2 (print-stub), K3
  (zero-spawn whole-tree forger), K4 (drop-one-check / hold-call-deleted A52 mutants,
  transcript `build/MutCounter52/counter-mutant.txt`, check B5c) are seat-executed
  controls whose transcripts land at `<slot: build/MutCounter52/, build/ExecForgerV2/>`;
  B5c requires the mutant to print `ATTEST52_UNMET held=0/0 exit 1`, never HELD.
- **Wave accounting.** 64 seats from `w1-spec.json` / `w1-assignments.json`: executor 19,
  reviewer 13, scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2,
  connector 1, revenger 1. Attack-class 24/64 = 37.5% under the addendum list (see the
  conflict note above); ≥25% satisfied. Draft-time progress snapshot only: 6 of 64 wave
  reports present (`w1/{ExecChecklistAudit,ExecProbeSanity,ScoutCensus,ScoutCompanion,ScoutRfc3339,SentScope}.md`)
  and 24 `build/<Seat>/` directories. **Final return accounting is a slot** (dead seats are
  named, never replaced): `<x>/64 reports on return; dead: <names>>`.
- **Post-wave L1 duties (single-wave shape).** The wave cannot attack bytes that do not
  exist yet, so the L1 re-runs against the INTEGRATED tree: the receipt-attest selftest,
  the counter-mutant replay, the three receipt runs, and both frozen counters at R1/R2/R3.
  One ordinary ≤8-seat residual call only if genuine items remain.
- **Tool installs/updates: none by this seat.** No pacman transaction (host-wide pause
  honored), no `uv`/`npx`/binary install; no gate bytes modified. Every command below is
  read-only.

## Landed changes

Every row is tied to the round-52 `LOG.md` entry (`<hash: LOG entry>`), which lands with
the integration commit; hashes are slots until the L1 commits. Draft-time anchors are the
bytes the change replaces.

| Commit | Change | Draft-time anchor (observed) |
|---|---|---|
| `<hash: instrument v2>` | `scripts/receipt-attest.mjs` → contract `kumitate-receipt-attest-v2` (SHAPE/CLOCK/STDIN/LEDGER/SELFTEST, v1 behavior preserved) | v1 bytes; `pin.receipt-attest=44919763…` (`SCORECARD.md:319`); SKILL.md registry row `:618` still documents `v1` and a command without `--stdin` |
| `<hash: pins>` | `pin.receipt-attest` re-derived to the v2 sha (gate-pin block); `pin.proxy-check` re-pinned only if proxy-check bytes move; pin count unchanged (claim-block six + gate-pin list, `scripts/proxy-check.mjs:461-471`) | 10 gate pins; claim block `pins=6` |
| `<hash: skill>` | `SKILL.md` gate-registry row + contract label → v2; checklist item 23 command/contract label | `SKILL.md:618`, `:671` ("twenty-three items"), `:709` (item 23, `v1`) |
| `<hash: scorecard>` | `SCORECARD.md`: stanza re-derivation (`A`, `C2_total`, `AXES coverage`), round-52 section, capability/limits row, R52-9/R52-10 deferred-to-53 note | `SCORECARD.md:293` (`C2_total=117`), `:305-319` (pins), `:330` operability row |
| `<hash: corpus>` | `corpus/README.md` map row for the unrowed note (repairs `C2_total` 117→118) **and** the new `knowledge/fail-closed-clock-validation.md` row | 117 map rows; `corpus/README.md:151` is the round-51 entry (`invocation-attestation`) |
| `<hash: entry>` | `corpus/knowledge/fail-closed-clock-validation.md` (new) + `corpus/SOURCES.md` S102/S103 + `corpus/lessons/round-52.md` + `corpus/QUALITY.md` Q44 + `LOG.md` round-52 entry | entry/rows/lesson/Q44 all absent at draft time (observed) |
| `<hash: receipts>` | `.ufo/waves/round-52/receipts/attest52-run-{1,2,3}.txt` + sidecars and `attest52-run-2-replayed.txt` | `receipts/` absent at draft time |
| `<hash: close>` | `close/FINAL-<R1>.txt` (A52 + D52 at R1), `close/IDEMPOTENCE-<R2>.txt` (re-run at R2 → R3), `close/FINAL-harm-census.txt` | `close/` absent at draft time |

## Before → after measurements

Commands, run from the lane root; B = base `02c01258…`, A = measured close revision
`<R1>`. Each verdict line is quoted whole; slotted cells stay `<slot>` until the L1 runs
them (no after value may be inferred).

```sh
node .ufo/waves/round-52/probe/attest52-probe.mjs  /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
node scripts/receipt-attest.mjs --selftest
node scripts/surface-probe.mjs --checklists
node scripts/proxy-check.mjs --strict
node .ufo/waves/round-50/probe/bindguard50-probe.mjs  /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
node .ufo/waves/round-51/probe/attest51-probe.mjs     /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
node .ufo/waves/round-51/probe/doctrine51-probe.mjs   /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
node scripts/cap-run.mjs --selftest && node scripts/bind-oracle.mjs --selftest
node scripts/counter-rerun.mjs --selftest && node scripts/round-gate.mjs --selftest
node scripts/sources-check.mjs
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
node scripts/round-gate.mjs --round 52
```

**C1 predicate sentence (frozen, byte-identical to `plan.md`):**

ATTEST52_HELD — node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v1" and exits 0.

**C2 predicate sentence (frozen, byte-identical to `plan.md`):**

DOCTRINE52_HELD — node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=<rev> rule=D52" and exits 0.

| Term | Before (observed at B) | After target | After measured at `<R1>` |
|---|---|---|---|
| ATTEST52 (C1, rule A52) | `ATTEST52_UNMET held=5/13 checks=13 rev=02c01258… rule=A52 version=v1`; held = B2c, B3c, B4c, B4d, B6 (`base/attest52-base.txt`, exit 1) | `ATTEST52_HELD held=13/13` exit 0 | `<slot: close/FINAL-<R1>.txt>` |
| DOCTRINE52 (C2, rule D52) | `DOCTRINE52_UNMET held=0/5 checks=5 … | E1 MISS entry-absent` (`base/doctrine52-base.txt`, exit 1) | `DOCTRINE52_HELD held=5/5` exit 0 | `<slot>` |
| receipt-attest selftest | v1 corpus 27 cases, no per-case lines (B1 `cases=0`, last `ATTEST_SELFTEST: PASS`) | ≥30 `case …: PASS`, final `ATTEST_SELFTEST: PASS (n/n)`, exit 0 | `<slot: n/n>` |
| CHECKLIST | `21/23 pass` (plan, round open; no committed transcript — F3) | `23/23 pass` (H1) | `<slot>` |
| PROXY | `DRIFT` A 71/73 (+2), `C2_total` 117/118 (+1), `AXES coverage` 10/9, `src-rev=31c465f1` (`base/baseline-gates.txt`) | `PROXY: MATCH pins=6 match` (H3) | `<slot>` |
| BINDGUARD50 (G50) | `held=7/8 checks=8` | `8/8` (H5; held only if the drift repairs) | `<slot>` |
| ATTEST51 (A51) | `held=8/9` (A5 MISS on the proxy drift) | retired, superseded-by-A52 note (H5) | `<slot>` |
| DOCTRINE51 (D51) | `held=5/5` | `5/5` unchanged (H5) | `<slot>` |
| R50 probe | `7/8` (R5 stale `Twelve`/`Thirteen` literal) | `8/8` after the R52-4 named repair, else `7/8` named with reason (H5) | `<slot>` |
| SOURCES_CHECK | `SOURCES_CHECK: CLEAN` at base (plan; D52 E4 re-runs it) | `CLEAN` exit 0 | `<slot>` |
| CENSUS | exit 0, 101 rows, `A:87,B:6,C:8`, four W04 (S034/S068/S084/S095); draft-time `grep -c '^| S'` → 101 | 103 rows, A +2 (S102/S103) | `<slot: close/FINAL-harm-census.txt>` |
| operability (axis) | 9 (`SCORECARD.md:330`; the claim block's `A=71 C=23` is the proxy's whole-tree walk, a different term from this row's A) | integer held; C1 is a deepening, no new executable class | `<slot>` |
| ROUND_GATE | `<slot: at B>` | `CLEAN` with the round-52 record trio | `<slot>` |

Measured commits: B `02c01258464cac3804faf177d0cfbf113cd59706`; A `<R1>` (receipt commit
`<R2>`, idempotence `<R3>`); source pin `31c465f15669f744848bd9f5d56191c5085670f7`
(read-only). No cell in the "After" column is observed at draft time.

Check-to-contract map for the A52 line (13 checks, `probe/attest52-probe.mjs`): B1
selftest contract · B1c CLOCK challenge · B2 three committed receipts VALID, nonces and
shas distinct, span ≥300 s from the digest-bound `wall_start` body fields · B2c printf
argv/stdout binding · B2e STDIN binding (`run --stdin -- /bin/cat`) · B3 committed
doctored control TAMPERED · B3c live prelude tamper · B4 ledger over the round-52
receipts + zero nonce hits in prior corpora · B4c twin REPLAY both directions · B4d
corrupt-digest REPLAY · B5 pin + `proxy-check --strict` MATCH · B5c vacuous-HELD mutant
transcript (`held=0/0` exit 1) · B6 three round-51 v1 receipts still VALID under v2.

## Sources & frontier

Census command (read-only):

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

- **Before** (round open; reconfirmed by `base/baseline-gates.txt`, `census-exit=0`, and at
  draft time by `grep -c '^| S' corpus/SOURCES.md` → 101 rows): exit 0, **101 rows**,
  `tiers=A:87,B:6,C:8`, four pre-existing `W04` duplicate-url warnings (S034, S068, S084,
  S095).
- **After** (at `<R1>`): `<slot>` — target 103 rows, `A` +2 (S102, S103), same four W04s;
  D52 E3 requires both rows `status=mined` with `used-by corpus/knowledge/fail-closed-clock-validation.md`.
- **Rows added by tier:** `<slot>` (target A +2, B 0, C 0). **Removed:** `<slot>` (target 0).
- **Rows touched old→new:** `<slot>` (none expected). **Frontier rows advanced:** `<slot>`
  (target: S102/S103 enter as `mined`, the second sourced entry of the durable-execution
  research line per `PROVINCE.md`).
- **Sourced claim:** C2 rests on **S102** (RFC 3339, tier A) and **S103** (companion opened
  by a scout, tier assigned honestly), both opened this round and cited in the entry's
  provenance trio (frozen arm E1).
- **Cross-domain evidence:** `<slot>` — provisional: both claims stay in-province (the
  receipt instrument is this lane's own; RFC 3339 is an external standard row, not a
  sibling lane's corpus). Final scope verdicts: `w1/RevScope.md`, `w1/ConnOverlap.md`.
- **Re-opens (non-author):** `<slot: w1/ScoutRfc3339.md, w1/ScoutCompanion.md, w1/ScoutTierAudit.md>`.

## Trend verdicts

Vocabulary is fixed (`improved` / `harmed` / `unchanged` / `unprovable-but-better`); **no
verdict is observed at draft time** — each is provisional and must be re-derived at `<R1>`.

- **expansion — provisional `<improved|unchanged>`.** C2 admits one frontier-band entry on
  ground the coverage map did not hold, resting on two rows opened this round (the
  `LEARNING.md` observable). Counterweight: C1 adds no new capability kind — `receipt-attest`
  was admitted in round 51 and v2 deepens it; the wave adds no registry family. Verdict
  flips to `unchanged` if the entry is not admitted or if no row reaches `status=mined`.
  Confirmation slot: D52 `5/5` + the `corpus/README.md` row.
- **quality — provisional `<improved|harmed>`.** Observable: a weaker instrument superseded
  by a stronger one (v1 27-case/zero-challenge suite → v2 ≥30 cases with truncation, CLOCK,
  SHAPE, STDIN and LEDGER arms) with no admitted entry failing its re-check. Counterweight
  (honest): five static A52 arms remain whole-tree-author satisfiable (the declared forgery
  boundary, r49 precedent); B2e narrows it but does not close it. Slot:
  `build/MutSelftest/`, `build/ExecSelftestExec/`, `build/CritC1/`.
- **discernment — provisional `<improved|unchanged>`.** Improves when a non-author
  disagreement changes the record (repair or named limit) **and** a grounded criterion
  lands (Q44 from the R52-11 citation defect). Counterweight: self-assessment; the outside
  spot-check of at least one admit and one reject is owed (PROTOCOL/LEARNING) and is not
  observed here. Slots: `w1/CritC1.md`, `w1/CritC2.md`, `w1/CritDoNothing.md`,
  `w1/RevengerV1V2.md`, `w1/MutCounter52/`.

## SHONEN

One line per box, `[~]` = asserted-by-author; a non-author verifier is the only writer of
`[x]`. All four boxes stay `[~]` in this draft (no verifier named yet).

- `[~]` **SHONEN.md:5 — SKILL.md contains real decision tables, error patterns, checklists,
  cited sources** — pointer: `SKILL.md:618` (receipt-attest gate-registry row, contract
  label + command, to be updated to v2), `:671` ("twenty-three items"), `:709` (item 23
  receipt-attest hermetic suite), `CHECKLIST: 23/23 pass` `<slot>` at `<R1>`. No named
  non-author verifier.
- `[~]` **SHONEN.md:6 — at least one end-to-end domain task executed and logged** — C1 ran
  end-to-end: `held=5/13` → `13/13` with three committed receipts and a doctored control;
  `LOG.md` round-52 entry `<slot>`. No named non-author verifier.
- `[~]` **SHONEN.md:7 — instructions executable by an agent without oral context** — the
  plan's counting commands are run verbatim (base receipts are their own transcript); both
  probes are committed and were executed at base; every verdict line carries
  `rev=` and its rule/version. No named non-author verifier.
- `[~]` **SHONEN.md:8 — no cross-domain bleed (PROVINCE.md still accurate)** — pointer:
  `PROVINCE.md` durable-execution research line; scope slots `w1/RevScope.md`,
  `w1/ConnOverlap.md`; the lane's write scope in the plan is lane-side only (`scripts/`,
  SKILL.md, `.ufo/pins/`, `corpus/`, SCORECARD, LOG, report). No named non-author verifier.

## Stale-lane / extras

- **Stale-lane line.** Respawn-per-round driver; this mission serves round 52 only. No
  other kumitate mission is open — `<slot: the driver's open-mission list is not read by
  this seat; `.ufo/state` and `watchdog.log` are outside its bounds>`. The mission was
  launched inside this window (plan mtime 18 min, `w1-taskcall.json` 6 min before this
  draft) — under two driver ticks. **Progressing:** three lane-authored commits in the
  window (`f539a71` freeze, `66766f7` spec, `ac56743` validation) and seat writes under
  `.ufo/waves/round-52/` (6 `w1/*.md`, 24 `build/<Seat>/` dirs at the 15-minute mark).
  Not a fleet-wide liveness verdict.
- **Tool installs/updates:** none (no pacman, `uv`, `npx` or `~/.local/bin` install; the
  host-wide pacman pause was honored). No gate bytes were modified by any read below.
- **Kill-rule evidence:** K1/K5 observed at base (above); K2/K3/K4 transcripts land at
  `build/MutCounter52/counter-mutant.txt` (B5c) and `build/ExecForgerV2/` — slots.
- **Harm battery (H1–H5) at `<R1>`:** H1 `23/23 pass`; H2 seven selftests (cap-run 12/12,
  bind-oracle 7/7, counter-rerun PASS, round-gate, receipt-attest ≥30 cases, sources-check
  CLEAN); H3 `PROXY: MATCH pins=6 match`; H4 census exit 0; H5 G50 8/8, R50 8/8-or-named,
  A51 retired note, D51 5/5. All `<slot>`.
- **Deferred (named, not hidden):** R52-9 (ledger `*.txt` scope) and R52-10 (distinct-sha
  weakness) → round 53, carried in the SCORECARD limits.
- **Findings from drafting this skeleton (recorded for the L1; the canonical judge
  adjudicates):**
  - **F1 — attack-seat count.** Steer 24/64 vs plan/spec 25/64; root cause is the
    `revenger` seat counted only by the plan (addendum attack list at
    `scripts/hyaku/lane-addendum.md:52-53` names reviewer/critic/mutation-tester/labrat).
    Both clear the floor. Pick one number for the SCORECARD row and use it everywhere.
  - **F2 — plan baseline understates PROXY, and the `A` term needs a close decision.**
    The plan's round-open quote lists `C2_TOTAL_DRIFT` and `AXES_DRIFT`; the committed
    `base/baseline-gates.txt` also carries `A_DRIFT term=A declared=71 computed=73
    delta=+2`. Cause, measured read-only: the tracked runnable set is 71 at `02c01258`
    and 73 at `ac56743` (`git ls-tree -r --name-only <rev> | grep -cE '\.(mjs|js|sh|py)$'`),
    and the only added runnable paths are the two frozen probes — the `A` walk
    (`scripts/proxy-check.mjs:682,935`, `.git`-only prune) counts them. It also counts
    untracked files, so the 24 draft-time `build/<Seat>/` scratch dirs already inflate a
    live reading; H3's `PROXY: MATCH pins=6` is reachable only after the L1 declares `A`
    against the final tree state (73 if the probes are admitted and no other runnable is
    committed; more if wave scratch lands — round-51 declared 71 the same way, Q26).
    A `C2`-only repair cannot reach `MATCH`.
  - **F3 — uncommitted CHECKLIST baseline.** The plan quotes `CHECKLIST: 21/23 pass` at
    round open, but `base/baseline-gates.txt` carries no `surface-probe --checklists`
    transcript (five blocks: proxy, bindguard50, attest51, doctrine51, census). Q26 class:
    H1 must measure it at `<R1>`; do not restate 21/23 as a committed observation.
  - **F4 — operability row prose drift (inherited).** `SCORECARD.md:330` prose says
    `C=19` while the claim block declares `C=23` and `grep -c '^- \[ \]' SKILL.md` → 23.
    The proxy compares the row's score, not its prose, so no counter fires; flagged for
    ScribeScorecard/L1, never edited by this seat.
  - **F5 — C2 artifacts absent at draft time** (entry, S102/S103, `corpus/lessons/round-52.md`,
    Q44): expected, since they land at integration; D52 base `0/5` confirms it.
- **Close-completion checklist (L1):**
  1. Fill `<R1>` from `close/FINAL-<R1>.txt`; name `R2` (receipt commit) and `R3`
     (idempotence re-run) and quote the committed FINAL line verbatim.
  2. Do not touch the two predicate sentences; re-verify byte-identity against `plan.md`
     (the draft carries them verbatim).
  3. Replace every `<slot>`/`<hash: …>` token; no after value may be asserted before it is
     measured at `<R1>`.
  4. Keep the Stale-lane and tool-install lines even when they read "none"; keep one
     `[~]` line per SHONEN box.
  5. Cite the measured close revision and a resolvable lane commit (a commit cannot name
     itself); file at the fleet path last; `round-gate --round 52` needs ≥1024 bytes, ≥2
     headings, the `SHONEN` heading, a `round-52` mention, the SCORECARD row, the LOG entry
     and a `round-52` commit.
- **Commands this seat ran (read-only):** `ls .ufo/waves/round-52{,/w1,/build,/base,/probe}`,
  `cat base/{attest52-base,doctrine52-base,baseline-gates}.txt`, `git log --oneline -3`,
  `git rev-parse HEAD`, `git status --porcelain`, `jj log -r '@|@-'`, reads of `plan.md`,
  `SHONEN.md`, `PROTOCOL.md:130-200`, `LEARNING.md:25-50`, `AXES.md`, `SCORECARD.md:282-333`,
  `scripts/proxy-check.mjs:461-471`, `scripts/hyaku/lane-addendum.md:48-58`,
  `w1-{assignments,spec,validate}.json`, and `grep -c` row/item counts. No write outside
  this seat's `build/ScribeReport/` path.
