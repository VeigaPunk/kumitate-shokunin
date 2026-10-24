# kumitate round 52 — plan (frozen 2026-10-24 before any data seat)

Lane: kumitate-shokunin. Base / round-open tip: `02c01258464cac3804faf177d0cfbf113cd59706`
(jj state: ahead=0 behind=0, clean tree). Round shape: **ONE v2 wave of exactly 64 seats**
(orchestrator steer 2026-10-24, operator directive, effective the next dispatch — supersedes
the two-wave 32+32 v1 shape), validated under `scripts/hyaku/ufo-wave-policy-v2.json`
(band 64–128, ≥25% attack roles; this wave carries 25 attack seats = 39%), dispatched as
exactly ONE task call. The §3 planner seat is held by the L1 (orchestrator ruling
2026-10-19: the validator rejects `planner` as a swarm role); the bounded planning
data-walk rides seats `RevPlan` + `RevCounterA`. Residual post-wave checks the single wave
cannot cover (final-bytes mutant battery, source re-opens of committed rows, close
receipts) are L1 integration duties named in the report, plus one ordinary ≤8-seat task
call ONLY if genuine items remain.

Round-open baseline (L1-measured at the base tip, transcripts committed under `base/`):
`PROXY: DRIFT (C2_TOTAL_DRIFT declared=117 computed=118 delta=+1; AXES_DRIFT coverage
declared=10 derived=9; src-rev=31c465f15669)` — INHERITED state: one corpus note lacks a
README map row (diagnosis is wave-1 seat ExecStanzaDrift's item); `CHECKLIST: 21/23 pass`;
`BINDGUARD50 held=7/8`; `ATTEST51 held=8/9` (A5 MISS on the same proxy drift);
`DOCTRINE51 held=5/5`. Not claim evidence (Q26 class); the close stanza repair must restore
PROXY: MATCH for arm B5/E... (B5's proxy conjunct) to pass at the measured close rev.

## Routed inputs (all eleven honored)

R52-1 instrument accepts ISO-shaped but unparseable/rolled wall clocks → C1 contract
`CLOCK` (round-trip validation). R52-2 `--ledger` damaged-prior skip unstated → contract
wording + selftest arm. R52-3 lows (sidecar name-escaping, blank-line tolerance, capture
failure, half-pair, field whitelist) → contract `SHAPE`. R52-4 H5 R50 stale literal
(`Twelve` vs `Thirteen`, reads 7/8) → bounded named repair of the round-50 probe
(count-derived arm, versioned v2, receipt re-run; if the seat finds harm risk it reports
and the arm stays routed). R52-5 vacuous-HELD (`held=0/0 exit 0` on hold-call-deleted
counter) → check B5c + the A52 probe's own checks-nonempty guard. R52-6 selftest cannot
distinguish truncated compares (16-bit-prefix forger read VALID in 313 ms) → v2 selftest
truncation arms. R52-7 span arm trusted the display prelude (230.042 s true displayed as
350.042 s) → check B2 scores the span from the digest-bound `wall_start` body field.
R52-8 zone-less prelude flips verdict with verifier TZ → contract `SHAPE` prelude
validation. R52-9 ledger `*.txt` scope / R52-10 distinct-sha weakness → DEFERRED to round
53 (named in SCORECARD limits; the v2 byte budget already carries eight fixes and ledger
recursion would change the B4 corpora semantics). A2e (M5, stdin-delivered nonce with
probe-captured stdout, seat-validated patch from r51 w1/ExecForgerControl) → contract
`STDIN` + check B2e. R52-11 (closure-routed): no frozen A51/D51 receipt committed at the
measured close rev fef67079 (committed FINAL read 8/9@57333ead) → the close sequence below
(R52-11 discipline) plus new QUALITY criterion Q44.

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (capability deepening): `receipt-attest` v2.** Before-state: the v1
instrument (`kumitate-receipt-attest-v1`, pinned sha256
`44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`) at base. After-state:
contract `kumitate-receipt-attest-v2` at `scripts/receipt-attest.mjs` with the routed
hardening package, verified by the frozen counter below. Predicate sentence (frozen —
byte-identical in probe header, SCORECARD row and report):
`ATTEST52_HELD — node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v1" and exits 0.`

**C2 — frontier coverage (learning, sourced): `fail-closed-clock-validation`.** Before-state:
no such entry at base. After-state: `corpus/knowledge/fail-closed-clock-validation.md`
admitted, resting on SOURCES rows opened this round (S102 = RFC 3339, tier A; S103 =
companion opened by a scout, tier assigned honestly). Predicate sentence (frozen):
`DOCTRINE52_HELD — node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=<rev> rule=D52" and exits 0.`

No exploratory claim. No axis harm admitted: coverage axes' registry/terms are touched only
by the README row repair (C2 drift fix) which restores the measured state to the declared
one — recorded under H3.

## C1 contract — `kumitate-receipt-attest-v2` (v1 semantics preserved; additions only)

Receipt form, digest, sidecar, verdicts, exit map: UNCHANGED from v1 (documented in the
v1 header and corpus/knowledge/invocation-attestation.md). v1 receipts stay valid (check B6
pins this). Additions:

1. `SHAPE` (R52-3/R52-8): the record field set is exactly the whitelist
   {argv, exit, mono_span_ms, nonce, stderr_sha256, stdout_sha256, wall_end, wall_start,
   digest, stdin_sha256?}; unknown fields → `receipt-attest: UNREADABLE` exit 2. The file
   is exactly two lines + trailing newline (no blank-line tolerance) → else UNREADABLE.
   The prelude value must match `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$` → else
   UNREADABLE. The sidecar's recorded name must equal the receipt's basename → else
   `RECEIPT: TAMPERED`. On writing a pair, a sidecar write failure removes the half-written
   receipt and exits 2 (no half-pair). A spawn failure is recorded as exit 127 in the
   receipt (v1 behavior) AND asserted by a selftest case (R52-3).
2. `CLOCK` (R52-1): a wall clock field is accepted only if Date.parse is finite AND
   `new Date(ms).toISOString()` round-trips to the field's exact bytes (rejects every
   rollover, e.g. month 13 → next January). Non-conforming → `RECEIPT: TAMPERED` exit 1
   (the record is internally inconsistent). Clock ordering and prelude-window checks
   otherwise unchanged (tolerance −60,000/+60,073 ms).
3. `STDIN` (A2e/M5): `run --out <base> --stdin -- <cmd...>` — the instrument generates the
   nonce, writes the 32 nonce bytes (UTF-8 hex chars) to the child's stdin and closes it;
   records semantic field `stdin_sha256` = sha256 of those bytes; everything else as `run`.
   The probe captures the child's real stdout itself and binds it.
4. `LEDGER` (R52-2): the contract states explicitly that `verify --ledger` skips prior
   receipts that are not attested (damaged sidecar/digest) with a printed note; a selftest
   case asserts the note appears.
5. `SELFTEST`: `--selftest` prints one `case <name>: PASS|FAIL` line per case and a final
   line `ATTEST_SELFTEST: PASS (n/n)` / `ATTEST_SELFTEST: FAIL`; ≥30 hermetic cases
   including: the R52-6 truncated-compare forgers (a nonce/sidecar differing only past a
   16-bit prefix must NOT read VALID — kills the truncation mutant class), CLOCK arms
   (rolled month/day, non-finite), SHAPE arms (unknown field, blank line, zone-less
   prelude, sidecar name mismatch, half-pair), STDIN arm, LEDGER skip-note arm, and every
   v1 case retained (v1 corpus: 27 cases).

## C2 contract — `corpus/knowledge/fail-closed-clock-validation.md`

Frontier band (PROVINCE.md: durable-execution research line, second sourced entry after
round 51's invocation-attestation). Content: why a receipt verifier must validate clocks
fail-closed — grammar shape (RFC 3339, S102), parse success, finite+round-trip, ordering,
window binding; the R52-1/R52-8 defects as the case study (what v1 got wrong, what v2
checks); the TZ-dependence of a zone-less prelude (S103). Shape per CORPUS.md contract +
round-51 precedent: provenance trio first (source/verified-at/recheck), ≥12 receipt-bound
`- ` clauses (each `receipt:<repo-path>@sha256:<64hex>`, path exists at rev with matching
blob hash), SOURCES rows S102/S103 mined + used-by.

## Frozen counters

`probe/attest52-probe.mjs` (rule A52, version v1, 13 checks over `git archive` bytes):
B1 selftest contract (exit 0, final PASS, ≥30 `case …: PASS` lines); B1c CLOCK challenge
(genuine receipt re-dated to a rolled clock with recomputed digest+sidecar must NOT read
VALID); B2 the three committed round-52 receipts VALID, nonces distinct, sha distinct,
span ≥300 s from the digest-bound wall_start BODY fields (never the display prelude —
R52-7); B2c printf challenge (argv+stdout binding, as A2c); B2e STDIN challenge
(`run --stdin -- /bin/cat`: receipt VALID, stdin_sha256 = sha256(nonce bytes),
stdout_sha256 = sha256 of the probe's own captured child stdout); B3 committed doctored
control (run-2 prelude rewrite, sidecar untouched) reads TAMPERED; B3c live prelude-tamper;
B4 ledger over the round-52 receipts + zero nonce hits across all prior receipt corpora;
B4c same-nonce/different-body twin REPLAY both directions; B4d corrupt-digest REPLAY;
B5 pin.receipt-attest == sha256(extracted v2 bytes) AND proxy-check --strict PROXY: MATCH;
B5c vacuous-HELD: the committed counter-mutant transcript
`build/MutCounter52/counter-mutant.txt` shows the hold-call-deleted A52 mutant printing
ATTEST52_UNMET held=0/0 exit 1 (guard present in probe source; R52-5);
B6 the three round-51 v1 receipts verify VALID under the v2 instrument (r51 capability
green at tip).

`probe/doctrine52-probe.mjs` (rule D52, 5 checks, mirroring D51): E1 entry exists, trio
within first five lines citing S102 (rfc-editor.org RFC 3339 URL) and S103; E2 ≥12
receipt-bound clauses with rev-existing sha256-matching paths; E3 SOURCES rows S102/S103
status mined + used-by the entry; E4 `node scripts/sources-check.mjs` → `SOURCES_CHECK:
CLEAN` exit 0; E5 live census exit 0.

Kill rules and controls (declared before data; each executed, receipts committed):
K1 do-nothing control = base bytes + SCORECARD-only edits: B1 misses (v1 selftest has 27
cases <30, no --stdin) → cannot reach 13/13 (the L1's freeze receipts at base ARE this
control). K2 print-stub: fails B1 (no real selftest) and B2c/B2e/B3c (no real receipts).
K3 zero-spawn forger (r51 ExecForgerControl class, full-tree author): the B2c argv-hash
shortcut is closed by B2e (stdin-bound + probe-captured stdout); a tree author who
implements the full contract remains inside the declared forgery boundary (r49 precedent,
witnessed end-to-end). K4 counter mutants: drop-one-check and hold-call-deleted A52 mutants
must never print HELD (seat MutCounter52; B5c receipt). K5 D52 do-nothing: entry absent at
base → 0/5 (freeze receipt).

## Freeze receipts (Q43 — frozen AND executed)

Committed with this plan at the freeze: `base/attest52-base.txt` (A52 at base
02c01258…), `base/doctrine52-base.txt` (D52 at base), both expected UNMET. Any freeze
repair after a seat finding re-runs both and commits fresh base receipts under the same
paths (addendum below, numbered).

## Receipt protocol (genuine, spaced, live-gate-wrapped)

Three runs of the COMMITTED v2 instrument (the single-wave shape means they run at
L1 integration, after the wave returns and the v2 bytes land; spacing is real wall
time across the integration window), run-at span ≥300 s between first and last,
each wrapping a live lane gate invocation (run-1: `node scripts/bind-oracle.mjs
--selftest`; run-2: `node scripts/sources-check.mjs`; run-3: `node scripts/round-gate.mjs
--selftest`), receipts at `.ufo/waves/round-52/receipts/attest52-run-{1,2,3}.txt` +
sidecars, committed through the helper (author-scheduled class, R50-4, honestly
labelled). Doctored control: run-2's receipt with only the `run-at:` prelude rewritten,
sidecar untouched, committed as `attest52-run-2-replayed.txt`.

## Harm battery (at the measured close rev, transcripts under close/)

H1 `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 23/23 pass` (item 23 =
receipt-attest selftest; command unchanged). H2 selftests: cap-run 12/12, bind-oracle 7/7,
counter-rerun PASS, round-gate selftest, receipt-attest ≥30 cases PASS, sources-check
CLEAN. H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH pins=6 match` (pin set
unchanged in count; pin.receipt-attest re-derived to the v2 bytes; stanza re-derived
A/C2 — including the +1 README map row that repairs the inherited 117→118 drift).
H4 census exit 0. H5 G50 8/8 (returns to 8/8 when the drift repairs — verified, else
named), R50 8/8 after the R52-4 named repair (else 7/8 named with reason), A51 retired
superseded-by-A52 note, D51 5/5 unchanged.

## Close sequence — R52-11 discipline

1. Integration commits land (v2 instrument; pins; SKILL.md registry row + contract label;
   SCORECARD stanza re-derivation + round-52 section + capability row update; README map
   row for the unrowed note; entry + SOURCES rows + lesson + Q44 + LOG).
2. R1 = that tip. Run A52 + D52 against R1 → commit both receipts as
   `close/FINAL-<R1>.txt`.
3. R2 = receipt commit. Re-run A52 + D52 against R2 (idempotence: receipt .txt files
   change no counter term) → commit transcript `close/IDEMPOTENCE-<R2>.txt` as R3.
4. Report + SCORECARD cite **measured close revision R1**, name R2/R3 as the
   receipt/idempotence commits, and quote the committed FINAL receipt line verbatim —
   the citation rev and the receipt rev are the same tree by construction, and the tip
   carries an idempotence re-run against its own bytes. (This is the Q43-class fix for
   R52-11; Q44 freezes the discipline for future rounds.)

## Frontier step

Census before (round open, committed under base/): exit 0, 101 rows, tiers A:87/B:6/C:8,
four pre-existing W04s (S034/S068/S084/S095). After at close, same command. Rows added:
S102 (+S103). Mistake mined into corpus/lessons/round-52.md ## Mistakes (candidate: the
r51 close citation — receipt rev ≠ cited rev — R52-11 itself, or a fresh wave finding).
Sourced claim: C2 rests on S102/S103 opened this round.

## Wave

ONE v2 wave of exactly 64 seats (orchestrator steer 2026-10-24 supersedes the earlier
32+32 v1 plan), build and attack items together, ≥25% attack roles (25 of 64), validated
under `scripts/hyaku/ufo-wave-policy-v2.json` and dispatched as exactly ONE task call
carrying the validator's taskCall unchanged. Attack items name their target explicitly.
Because a single wave cannot attack bytes that do not exist yet, post-wave verification of
the INTEGRATED bytes is an L1 duty, named in the report: L1 re-runs the selftest, the
counter-mutant replay, the three receipt runs, and both frozen counters at the close
revisions (R52-11 discipline), and one ordinary ≤8-seat residual task call is dispatched
only if genuine items remain. Dead seats are named, never replaced. Seat paths ABSOLUTE
under /home/vgpnk/Projects/shokunin/kumitate-shokunin; reports at
.ufo/waves/round-52/w1/<SeatName>.md are lane-relative for the validator but ABSOLUTE for
the seat (every `Report:` trailer path resolves under the lane root). Wave context
carries: tooling authorization (read ~/.omp/agent/RULES.md first; official channels;
record installs), pacman guard (PAUSED host-wide — uv/npx/binary only, or L0), lane
read-only except the seat's own build/ and w1/ paths, no fleet/sibling writes, no
MANIFEST, no ask tool, the two verbatim wave rules (time-box + independent leaf).

## Freeze repair addendum (2026-10-24, post-wave, per the plan's repair procedure)

Every repair is seat-found, named, and minimal; the claim predicates, the frozen predicate
sentences, the counting commands and the check sets are UNCHANGED (repairs fix fixtures and
hardening; they do not move the goalposts). Both counters were re-run at base after the
repairs and fresh receipts committed over base/ (A52 pattern unchanged at held=5/13;
D52's entry-absent label is now derived: held=0/1 checks=1, repair 14's whole point).

1. **B3c craft** (seats CritC1, RevCounterA, RevCompat, ExecInstrumentV2, RevInstrumentV1):
   the v1 craft renamed the receipt while copying the sidecar verbatim, so v2 SHAPE rejected
   on the name rule and the far-past prelude was rejected by the window check regardless of
   the sidecar — the M2 class went unexercised. Repaired: same-basename copy in an isolated
   dir + prelude moved INSIDE the wall window; the sidecar-hash arm is now the only
   possible reject.
2. **B4c craft** (same seats + RevInstrumentV1's ceiling proof ≤11/13): copied sidecars
   re-point their recorded NAME FIELD to the copied basename (hash fields unchanged), so
   the ledger arm is what answers REPLAY.
3. **B2 planned-argv binding** (seats RevReceipts F1, RevCounterA): each receipt must record
   EXACTLY the planned wrapped gate — run-1 `node scripts/bind-oracle.mjs --selftest`,
   run-2 `node scripts/sources-check.mjs`, run-3 `node scripts/round-gate.mjs --selftest`;
   wall_start must be CLOCK-shaped before the span is scored.
4. **B4 sweep filter** (seats RevReceipts F2, RevHistory F1): extended to the attest-run
   naming family — the v1 filter never scanned the actual round-51 receipt corpus
   (176 files swept, 0 from any receipts/ dir).
5. **B1 final-line regex** (seat RevReceipts F6): requires the `(n/n)` tally.
6. **rev hardening** (seat RevCounterA HIGH): full-hex object names only (exit 64), symlink
   rejection in the extraction (exit 2). Applied to BOTH counters.
7. **B1c wording + verdict** (seats ExecClockSweep, RevCounterANew, ScribeEntry,
   RevengerV1V2): month-13 is the NaN class on the measured runtime (not a rollover — the
   plan prose was wrong); the arm now requires the CLOCK verdict `RECEIPT: TAMPERED` exit 1
   (a crash is not a verdict). The NaN fixture is the R52-1 defect as reproduced against
   shipped v1; the finite-roller class with a co-moved prelude is the Q39 ceiling class,
   named as a limit (not a counter gap).
8. **B5c judged-bytes guard** (seat RevCounterANew HIGH): the self-guard regex now reads the
   probe source from the EXTRACTED tree (the judged bytes), not the running file; the
   transcript regex accepts both `exit 1` spellings.
9. **B6 synthesized fourth receipt** (seat RevCounterANew): a fresh v1-format receipt must
   also read VALID — compat is a format property, not three known files.
10. **B2 digest distinctness** (seat RevHistory F4, routed R52-10 re-opened probe-side):
    record digests — not file bytes — must be pairwise distinct.
11. **Probe-header predicate sentences** (seats CritFreeze, RevPlan, SonicFreeze): both
    headers now carry the frozen predicate sentences byte-identical with plan §Claims.
12. **D52 E2** (seats RevCounterD H1, RevEntry): bound paths must be DISTINCT and each must
    verify as a blob (`git cat-file -t`).
13. **D52 E3** (seat RevCounterD): row match accepts the contract's 0-3 leading spaces.
14. **D52 entry-absent label** (seats MutProbeD F2, RevPlan): derived through the common
    tail (no fabricated `held=0/5`).

Text corrections (no check semantics): plan attack-count reads 24 attack-role seats by
reviewer+critic+mutation-tester (37.5%), 25 counting the revenger (39.1%) — both clear the
policy floor; the round-open baseline carries A_DRIFT (A declared=71 computed=73 after the
two frozen probes) alongside the inherited C2_TOTAL_DRIFT; close step 1's inventory gains
`build/MutCounter52/counter-mutant.txt` (B5c reads it from `git archive` bytes — RevPlan
HIGH-6) and the receipts + doctored control (RevIntegration HIGH-1).

Named limits carried to the report (not repairs): B2e binds data, not execution — the
zero-spawn TREE-AUTHOR boundary stays declared (K3 scoped precisely; the stub class is
closed); B5's proxy conjunct runs the scored rev's own proxy-check (self-referential pin,
r51 class); drop-one counter mutants print HELD k/k at a green state and are killed by the
frozen predicate string's literal `held=13/13 checks=13` (r53 may add a source-pin arm);
D52 E5 is live-only (R51-4 class); H1's round-close audit item audits the previous round —
the missing round-51 table row + LOG line land as an inherited-state repair in the
integration commits; A counts committed runnable files only — seat scratch `.mjs` under
build/ is NOT committed (RevStanza S4; evidence commits as `.txt`/`.md` transcripts).
