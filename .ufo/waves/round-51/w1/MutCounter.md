# MutCounter — mutation probe of the two frozen round-51 counters (seat `kumitate-r51.VariableGamefowl`)

RESULT MutCounter verdict=survivors killed=8/19 base-detector survivors=11/19
lanes-at-risk A51 held=9/9 at cd7f69d (PASS) · D51 held=4/5 at cd7f69d (D2 MISS — live finding F1, since remediated: D51 held=5/5 at 633ab47)

## Scope and method

Mutated the two frozen counters only:
- A51 `.ufo/waves/round-51/probe/attest51-probe.mjs` — 9 arms (A1 A2 A2c A3 A3c A4 A4c A3d A5), `VERSION='v3'`
- D51 `.ufo/waves/round-51/probe/doctrine51-probe.mjs` — 5 arms (D1..D5)

Counter bytes mutated (snapshot of the lane file, copied read-only to `/tmp/mutcnt/snap/`):
```
73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c  attest51-probe.mjs
f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0  doctrine51-probe.mjs
```
These are the same hashes the lane carries now (re-verified after every run). **No lane file was
edited**; every mutant lives in `/tmp/mutcnt/mut/<id>/probe.mjs` and is a one-anchor textual patch
applied to the snapshot copy. Each mutant was run twice per condition and the readings were
byte-stable (20x re-run of pristine D51 gave `D2 MISS` 20/20).

Detector conditions (two revs of the lane repo, read via the counters' own `git archive` path):
- **R1 = base** `c90b9de94009b938fa19a089bfaa97df20b54f86` — round-open base, artifacts absent.
  Pristine: `ATTEST51: ATTEST_UNMET held=0/9 checks=9` exit 1 · `DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5` exit 1.
- **R2 = live tip** `cd7f69d31b0df6882e1472614476a7cee6baa25a` — round-51 integration commit (artifacts
  present). Pristine: `ATTEST51: ATTEST_HELD held=9/9 checks=9` exit 0 ·
  `DOCTRINE51: DOCTRINE_UNMET held=4/5 checks=5 | D2 MISS clauses=12 bound=2 hash-miss=0` exit 1.

Predictions were written **before** running: `/tmp/mutcnt/PREDICTIONS.md` (v2 file, cycle 1) and
`/tmp/mutcnt/PREDICTIONS-v3.md` (v3 file, cycle 2, written from source reading only).

## The item's invariant: at base, a mutant must read UNMET, never HELD

**The invariant is violated by the counter itself, not by my mutants.** Two one-token mutations of
the frozen counters turn a base run (where every arm is legitimately absent) into a **HELD** or a
**green exit**:

| id | mutation | base reading | base exit |
|----|----------|--------------|-----------|
| A-M6 | `const label = held === checks.length ? 'ATTEST_HELD' : 'ATTEST_UNMET'` → swap the two labels | `ATTEST51: ATTEST_HELD held=0/9 checks=9` | 1 |
| A-M8 | drop all nine `hold(...)` calls → `checks.length === 0` and `held === 0` | `ATTEST51: ATTEST_HELD held=0/0 checks=0` | 0 |
| A-M7 | `process.exit(held === checks.length ? 0 : 1)` → invert | `ATTEST_UNMET` (label correct) | **0** |
| D-M3 | early-exit `process.exit(1)` → `process.exit(0)` | `DOCTRINE_UNMET` (label correct) | **0** |

A-M8 is the sharpest: with every arm removed the aggregate `held === checks.length` compares `0 === 0`
and reports **HELD held=0/0 with exit 0** — a green verdict certifying zero checks. A-M6 does the same
with one token and keeps the exit code. These are coverage findings about the counters' aggregate
shape, not defects in the claim; the counters are frozen and I did not edit them. The minimal
robustness fix (for the L1 to weigh) is to make the aggregate require a fixed expected arm count,
e.g. `held === EXPECTED_ARMS && checks.length === EXPECTED_ARMS` with `EXPECTED_ARMS = 9` / `5`, so
that an empty or shrunken check set can never satisfy it.

## Predictions vs observations (all 19 mutants, both revs)

Base = R1 (must read UNMET); Live = R2 (the artifacts exist, so arms actually execute).
"kill" = the mutant changes the counter's verdict at that rev.

| id | counter | mutation | predicted base | observed base | observed live | verdict |
|----|---------|----------|----------------|----------------|----------------|---------|
| A-M1 | A51 | drop A2 arm | UNMET 0/8 | UNMET held=0/8 checks=8 exit 1 | **HELD 8/8 exit 0** | killed (denominator 9→8 hides A2) |
| A-M2 | A51 | drop A5 arm | UNMET 0/8 | UNMET held=0/8 checks=8 exit 1 | **HELD 8/8 exit 0** | killed (A5 deleted, still HELD) |
| A-M3 | A51 | A3 verdict `TAMPERED`→`VALID` | UNMET 0/9 (no delta at base) | UNMET held=0/9 exit 1 | **UNMET 8/9 exit 1** (A3 MISS) | killed at live, survived at base |
| A-M4 | A51 | A2 span threshold 300→0 | UNMET 0/9 (no delta at base) | UNMET held=0/9 exit 1 | **HELD 9/9 exit 0** | SURVIVED at live — threshold unpinned |
| A-M5 | A51 | A1 default `a1ok=false`→`true` | UNMET 1/9 | **UNMET held=1/9** exit 1 (A1 PASS on an absent tool) | HELD 9/9 exit 0 | killed at base (false PASS), survived at live |
| A-M6 | A51 | label swap HELD↔UNMET | **HELD** (breaks the invariant) | **ATTEST_HELD held=0/9** exit 1 | ATTEST_UNMET held=9/9 exit 0 | killed — INVARIANT BREAKER |
| A-M7 | A51 | aggregate exit inverted | UNMET label, exit 0 | UNMET held=0/9 **exit 0** | HELD 9/9 **exit 1** | killed — false green by exit status |
| A-M8 | A51 | drop all nine arms | **HELD 0/0** (breaks the invariant) | **ATTEST_HELD held=0/0** exit 0 | **ATTEST_HELD held=0/0** exit 0 | killed — INVARIANT BREAKER |
| A-M11 | A51 | A3d verdict `REPLAY`→`VALID` | UNMET 0/9 (no delta at base) | UNMET held=0/9 exit 1 | **UNMET 8/9 exit 1** (A3d MISS) | killed at live, survived at base |
| A-M12 | A51 | A2c stdout-hash binding forced true | UNMET 0/9 (no delta at base) | UNMET held=0/9 exit 1 | **HELD 9/9 exit 0** | SURVIVED at live — A2c stdout hash unpinned |
| A-M13 | A51 | drop the two FAILING arms A4+A5 | (n/a; added after the first cycle) | UNMET held=0/7 checks=7 exit 1 | **HELD 7/7 exit 0** | killed — false green by arm deletion |
| D-M1 | D51 | drop D4 arm | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | **UNMET 3/4** exit 1 | killed at live, survived at base |
| D-M2 | D51 | early-exit string `held=0/5`→`5/5` | UNMET, contradictory string | **UNMET held=5/5** exit 1 | UNMET 4/5 exit 1 | killed at base (contradictory line), survived at live |
| D-M3 | D51 | early-exit code 1→0 | UNMET label, exit 0 | UNMET held=0/5 **exit 0** | UNMET 4/5 exit 1 | killed — false green by exit status |
| D-M4 | D51 | D2 clause threshold 12→1 | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | **HELD 5/5 exit 0** | killed at live (D2 was the only failing arm) |
| D-M5 | D51 | D3 status `mined`→`!=rejected` | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | UNMET 4/5 exit 1 | survived at both (D3 passes either way) |
| D-M6 | D51 | D1 trio S101→S102 | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | **UNMET 3/5** exit 1 (D1 MISS) | killed at live, survived at base |
| D-M7 | D51 | D2 hash-miss counter no-op | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | UNMET 4/5 exit 1 | survived at both (no hash miss exists to catch) |
| D-M8 | D51 | D1 man7 URL pair dropped | UNMET 0/5 (no delta at base) | UNMET held=0/5 exit 1 | UNMET 4/5 exit 1 | survived at both (the URLs are present and correct) |

Totals: 19 attempted, 18 behaviour-changing at at least one rev, **8 killed by the base detector**
(A-M1, A-M2, A-M5, A-M6, A-M7, A-M8, D-M2, D-M3) and **11 survived the base detector** (A-M3, A-M4,
A-M11, A-M12, A-M13, D-M1, D-M4, D-M5, D-M6, D-M7, D-M8). At the live tip, 12 of 19 change the
verdict. The base control alone is a weak detector: because every arm short-circuits on "artifact
absent", **11 of 19 mutants are indistinguishable from pristine at base** — a base-only control
cannot tell a working counter from one with a deleted arm or a swapped verdict string.

The live tip is the stronger detector and is where the arm-level gaps show: A-M4, A-M12 and D-M5,
D-M7, D-M8 keep the counter's verdict identical to pristine. Those are the coverage answers — the
arms they touch are not pinned by any committed artifact.

## Live findings (not mutation artifacts)

**F1 — D51 read `held=4/5` (D2 MISS) at the round-51 integration tip `cd7f69d`; C2's predicate could
not hold as shipped. REMEDIATED in the lane after my measurement — the entry now carries 13 inline
bindings and D51 reads 5/5 (see "F1 remediation" below).** Pristine at `cd7f69d`:
```
DOCTRINE51: DOCTRINE_UNMET held=4/5 checks=5 rev=cd7f69d31b0df6882e1472614476a7cee6baa25a rule=D51 | D1 PASS | D2 MISS clauses=12 bound=2 hash-miss=0 | D3 PASS | D4 PASS | D5 PASS
```
D2 requires ≥12 clause lines **each carrying** a `receipt:<path>@sha256:<64hex>` binding whose path
exists at rev with a matching blob sha256 (D51 line 78 execs the regex against each `- ` line
individually). The committed entry `corpus/knowledge/invocation-attestation.md` at `cd7f69d` has 12
`- ` clause lines but only **2** carry an inline binding — the other ten place the binding on a
*continuation* line of the same clause, which the per-line regex never sees. Measured on the committed
bytes:
```
COMMITTED clauses: 12  inline-bound: 2
```
and the two that do match hash-verify correctly (`scripts/receipt-attest.mjs`,
`.ufo/waves/round-51/base/attest-base-v3r6.txt`). So D2 fails on **coverage of the binding
placement**, not on any hash. Severity: **high for C2** — `DOCTRINE_HELD` is unreachable at the tip
as committed. Minimal fix (L1/scribe seat, entry only — not the counter): move each binding onto the
same physical line as its `- ` clause prefix, so ≥12 clause lines each carry an inline
`receipt:<path>@sha256:<64hex>` with a path that exists at rev.

**F1 remediation — confirmed in the lane after my measurement.** At lane HEAD
`633ab47175e414a4c0780328d86090db79b309db` the committed entry carries every binding inline and D51
reads HELD:
```
$ git show HEAD:corpus/knowledge/invocation-attestation.md | python3 -c "...count inline bindings..."
clauses: 13 inline-bound: 13
$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs <lane> 633ab47
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=633ab47175e414a4c0780328d86090db79b309db rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
```
The A51/D51 counter bytes did **not** move for that fix (`73ee53ec…` / `f2d27071…`, re-verified), so
the fix was entry-side exactly as recommended — the counter was not touched. F1 is closed for C2 at
the current tip; the mutation table above is unchanged because it was measured against the frozen
`cd7f69d` bytes and the counter semantics did not change.

**Mutant executability check (cross-check against a sibling lane's finding).** A sibling seat
(`kotodama-r64.RevVerifyO2`) found a mutant in another lane that was syntactically invalid, so the
mutant could never pass as landed. I verified the equivalent property for my own set: all 19
mutants are parse-valid and executable — `node --check mut/<id>/probe.mjs` passes for **19/19**, and
every mutant produced a real reading line (never a crash, never an empty stdout) in both the base and
live cycles. A mutant that crashes or emits nothing is INVALID, not a kill; none of mine did.
Mutation inventory with before/after hashes: `/tmp/mutcnt/manifest.json`.

**F2 — the A4 ledger arm is unpassable with the shipped instrument + committed receipts.** At the
live tip A4 PASSES, but the same fixture pairing breaks it: the plan (addendum item 4) requires the
`--ledger` arm to flag a nonce only when another receipt binds the **same nonce to a different record
digest**, exempting byte-identical duplicates. The instrument under `.ufo/waves/round-51/build/`
that I exercised (`ExecSelftestArms/scratch/receipt-attest.mjs`, sha of file
`f39c6b51f137ac8cdd94eda439a82bb4cbab8c53a719cc1282f73ea179677ff4`) flags any nonce match. Measured
directly — a same-nonce, same-digest duplicate that the plan says is EXEMPT:
```
$ node fx/receipt-attest.mjs verify --ledger ledgertest ledgertest/o.txt
RECEIPT: REPLAY        (exit 1)     # plan: same nonce + same digest = exempt, must be VALID
```
Severity: **high if that instrument shape ships**. Under it, the committed
`attest-run-2-replayed.txt` (a prelude-rewrite of run-2, i.e. same nonce, same digest) is treated as
a replay of run-2, and A4's ledger arm over the receipts dir reads REPLAY for `attest-run-2.txt`. My
fixture saw exactly that: `A4 MISS attest-run-2.txt:ledger exit=1 RECEIPT: REPLAY`. The live tip
passes because the *shipped* `scripts/receipt-attest.mjs` already implements the digest-scoped rule
(the lane's own A4 arm passes at `cd7f69d`) — so the risk is that a re-freeze or a re-pin substitutes
the nonce-only build. The L1 should confirm which ledger rule the committed instrument implements
and keep the digest-scoped one; the frozen A51 probe cannot distinguish the two shapes on its own,
because its A4c challenge only exercises the *different-digest* twin.

**F3 — A5 depends on `proxy-check.mjs` knowing the `pin.receipt-attest` key, and the two land in
different commits.** `scripts/proxy-check.mjs` fail-closes on an unknown gate-pin key
(`GATE_PIN_KEY_UNKNOWN`, exit 2) — I hit this in my fixture, where the scorecard carried
`pin.receipt-attest` while the fixture's `proxy-check.mjs` predated the key:
```
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 313: pin.receipt-attest is not a kumitate-gate-pins-v1 key
```
The key was added to `GATE_PINS` in `a476977` (round-51 C1/C2 integration), which is *after* the
counter freeze (`cbca45c`). Any rev between those two commits has a scorecard pin that
`proxy-check.mjs` cannot verify, so A5 fail-closes to MISS rather than PASS. Severity: **medium** —
self-resolving once both land (they have at `cd7f69d`, where A5 PASSES), but the A5 arm is
fail-closed on a *key-registration* ordering, not only on the instrument's own hash. Worth noting in
the close record.

## Coverage answers (arms the counters do not pin)

1. **A2's 300 s span threshold (A-M4)** — relaxing it to 0 leaves the live verdict identical
   (HELD 9/9). The three committed receipts are ≥300 s apart, so no committed artifact exercises the
   boundary; the threshold is unpinned in the direction that matters (a too-close pair would still
   pass).
2. **A2c's stdout-hash binding (A-M12)** — forcing `outOk` true leaves the live verdict identical.
   The probe's A2c arm checks argv, stdout hash, VALID and the sidecar; the stdout-hash conjunct is
   redundant against the others for the committed flow, so it can be defeated without any reading
   changing.
3. **D3's `mined` status and D2's hash-miss counter (D-M5, D-M7)** — both survive at both revs:
   the shipped SOURCES rows are `mined` and every bound hash matches, so neither predicate is
   exercised negatively by any committed artifact.
4. **D1's man7 URL pair (D-M8)** — dropping it changes nothing; the URLs are present and correct, so
   the "wrong URL" class is unpinned.
5. **The aggregate itself (A-M6, A-M7, A-M8, A-M13, D-M3)** — five one-token mutations change the
   verdict or the exit status without touching any arm's logic. A-M13 (drop the two *failing* arms
   A4+A5) is the pure false green: `ATTEST_HELD held=7/7 exit 0` at a rev where two arms genuinely
   fail. Any consumer that trusts the label alone, or the exit code alone, is fooled by one token.

## Restoration / integrity evidence

- The lane's two counters were never written: their hashes after all runs are unchanged
  `73ee53ec…48d32` (A51) and `f2d27071…8a0` (D51), byte-identical to the snapshots I mutated from.
- Every mutant is a separate file under `/tmp/mutcnt/mut/<id>/probe.mjs`; the lane working tree shows
  no modification from this seat (`git status --porcelain .ufo/waves/round-51/probe/` is empty).
- All scratch work (clone, fixture, mutants, logs) is under `/tmp/mutcnt/`; the fixture repo is a
  scratch clone at `/tmp/mutcnt/laneB`, branch `mutfixture`, rev
  `9d4a622d20f48d1eb9f227818f9aebfcdf25ab1a` — never in the lane.
- Raw per-mutant outputs: `/tmp/mutcnt/out3/<id>.base.out`, `/tmp/mutcnt/out3/<id>.live.out`,
  exit codes in `/tmp/mutcnt/out3/base.exits` and `/tmp/mutcnt/out3/live.exits`;
  mutant inventory with before/after hashes in `/tmp/mutcnt/manifest.json`.

## Notes

- The A51 counter was re-frozen three times under me during this seat (5 arms → 8 arms → 9 arms:
  `8c07e88`, `4b8da21`, `cbca45c`; `VERSION` stayed `v3` while the arm count moved). Cycle 1 ran
  against the 5-arm file and cycle 2 against the 8-arm file; the table above is cycle 3, run against
  the final 9-arm bytes, and the earlier cycles are superseded. A-mutants are therefore reported
  against `73ee53ec…`; D51 was frozen once (`3ed875d`, column-index repair) and is stable at
  `f2d27071…`.
- The counter's own header claims "five checks" for A51 in `plan.md` while the code carries nine;
  the plan text was amended in `8f3c692` ("before-line arithmetic 0/8") and now trails the 9-arm
  code. Cosmetic, but the L1 should re-word the plan's A51 check count to 9 so the frozen prose
  matches the frozen code.
- Tools: none installed or upgraded. Node v24.21.0 as shipped; `git`, `tar`, `sha256sum` from the
  host.
