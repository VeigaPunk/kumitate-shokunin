# K63ConnForgeryClasses — forgery matrix (C1 INLINE63 / C2 TOPOLOGY63)

VERDICT: The frozen round-63 counters fix the round-61 class defects (rev-pinned reads, 11-cell row
contract, honest-vs-adversarial controls), but the surviving no-arm-kills classes are the host-record
forgery (plan's stated limit), a synthetic attacker-controlled source defeating T5, provenance
laundering via cell rewrite, a hollow control-fit gate (I1/I3), circular tip receipts, mixed-state
measurement, and dead-seat tolerance — each with a concrete cheap forgery below.

## Evidence

Commands (all run from the lane root; no lane/host file was modified by me):

```
$ node kumitate-shokunin/scripts/inline-dispatch-evidence.mjs --selftest 2>&1 | tail -1
INLINE_DISPATCH_SELFTEST: PASS (25/25)
$ echo "EXIT=${PIPESTATUS[0]}"
EXIT=0
```

```
$ node scripts/inline-dispatch-evidence.mjs --root .ufo/waves/round-63/build/K63ConnForgeryClasses/demo-fixture/lane --round 7 --wave w1 --sessions-root .ufo/waves/round-63/build/K63ConnForgeryClasses/demo-fixture/sessions --dispatcher-log .ufo/waves/round-63/build/K63ConnForgeryClasses/demo-fixture/dispatcher.log
INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=3 reports=3 dead=0)
$ echo "EXIT=$?"
EXIT=0
```
The demo-fixture is fully hand-written (wave files + 3 session JSONL + 2-line dispatcher log), copied
verbatim from /tmp scratch into build/ — no harness ever ran it. Same gate, `--sessions-root` pointing
at a missing dir → fail-closed exit 2 (probe's I4 creates an empty dir, so it exercises the exit-1
`NOT_A_DISPATCH` path instead).

Frozen receipts quoted verbatim (`git show b38a2065:...`):
- `base/inline63-base.txt`: `INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8… | I1 MISS tool-absent | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I5 MISS row-absent | I6 MISS tip-receipt-absent` (exit 1).
- `base/topology63-base.txt`: `TOPOLOGY63_UNMET held=1/7 … | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS …` (exit 1).
- `controls/topology/c0-honest.txt`: `TOPOLOGY63_HELD held=7/7 checks=7 rev=afb5912d… rule=T63` (exit 0).
- `controls/topology/f1-forged-capture.txt`: `TOPOLOGY63_UNMET held=6/7 … | T5 MISS S110:quote-not-live(The broker redelivers a reject);S110:quote-not-live(A delivery limit of seventeen )` (exit 1) — recomputed pin passes T3; only T5 kills the naive forged capture.
- `controls/topology/f2-phantom-row.txt`: `T2 MISS S110:not-in-registry | T5 MISS S110:no-url | T6 MISS census-exit=1`.
- `controls/inline-receipts.txt`: honest `CLEAN` exit 0; 13 fault fixtures each exit 1 with their named finding (DONE_LOG_ABSENT, SESSION_AMBIGUOUS, NOT_A_DISPATCH, SESSION_ABSENT, PARENT_MISMATCH, REPORT_ABSENT, REPORT_TINY, REPORT_DUP, RESULTS_MISMATCH, SESSION_ID_DUP, SPAWN_LOG_MISMATCH, SPAWN_LOG_ABSENT, SESSION_FOREIGN).

Host-state facts (read-only):
- `/fast/scratch/hyaku-run7/dispatcher.log` exists, owner vgpnk, contains `2026-10-25T17:57:13 spawned kumitate 63 w1 40` (wave-1 in flight; no `done` line yet).
- Real seat transcripts live at `~/.omp/agent/sessions/-Projects-shokunin/<run>/<Seat>.jsonl` (e.g. `K63ConnForgeryClasses.jsonl`), owner vgpnk, session row `{"type":"session","version":3,"id":"…","parentSession":"/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/<run>.jsonl"}` — same UID as the lane, same shape as the fixture transcripts.
- Gate defaults: `DEFAULT_LOG=/fast/scratch/hyaku-run7/dispatcher.log`, `sessionsRoot=~/.omp/agent/sessions` (scripts/inline-dispatch-evidence.mjs:42,52).

## Findings

1. **K63ConnForgeryClasses-1 (High) — host-record forgery accepted by every I-arm.** The gate's only
   non-author inputs are the session store and dispatcher log; both live under the lane's own UID and
   match 5-line/2-line hand-written fixtures exactly (demo above → `CLEAN` exit 0). The plan names this
   as its stated limit; it is also the surviving mechanism for class C (hand-written wave files) to
   reach HELD. Repro: `node scripts/inline-dispatch-evidence.mjs --root <demo>/lane --round 7 --wave w1 --sessions-root <demo>/sessions --dispatcher-log <demo>/dispatcher.log` → `CLEAN` exit 0.
2. **K63ConnForgeryClasses-2 (High) — synthetic attacker-controlled source defeats T5, the only
   provenance oracle.** T2 requires merely an `https?://` URL; T3 pins a capture the claimant writes;
   T4/T5 compare quotes against that capture and a live fetch of the claimant-chosen URL. Hosting the
   quotes on a page the attacker controls (gist/paste/own site) passes all T1–T7 with no third-party
   source. Repro: open a row whose URL is a claimant-controlled page, capture it verbatim, pin it, write
   ≥6 short quotes from it; run the frozen counting command → `TOPOLOGY63_HELD held=7/7`.
3. **K63ConnForgeryClasses-3 (High) — provenance laundering via `opened` cell rewrite.** T2 checks
   cell equality, not provenance; census checks format, not semantics (f4 proves the arm only detects a
   *wrong* date). Rewriting an existing row's `opened` to `2026-10-25` and appending the entry to
   `used-by` passes T2 while T3/T4/T5 keep passing on the untouched capture and still-live quotes — the
   "two rows opened this round" claim is satisfiable with zero new mining/fetch. Repro: edit the row
   cell, re-run probe — `≥2 distinct rows` + `opened=2026-10-25` hold.
4. **K63ConnForgeryClasses-4 (Medium) — hollow control-fit gate passes I1/I3.** The 14 I3 fixtures and
   the 25-case selftest are public at freeze; an implementation can special-case exactly those shapes and
   still print `PASS (25/25)` and pass all 14 `expect` files while verifying nothing beyond the
   enumerated faults. Controls bound inputs, not the implementation. Repro: any implementation
   reproducing the fixture discriminants (no general transcript/log verification) yields `INLINE63_HELD held=6/6`.
5. **K63ConnForgeryClasses-5 (Medium) — mixed-state measurement: same M flips across wall-times.**
   I2/I4/I6 read live host sessions/log; T5 fetches live pages. Nothing snapshots that state, so a
   later re-measurement of the identical M can go HELD → UNMET (or vice versa) with no repo change.
   Repro: run the counting command before and after a session/log rotation or page change; only the
   second run can fail.
6. **K63ConnForgeryClasses-6 (Medium) — circular tip receipt.** I6 checks existence, `rev=<M>`, and
   substring-matches the probe's own CLEAN lines; the receipt is claimant-authored after seeing the gate
   output. It attests only that the probe printed what the receipt quotes. Repro: generate the tip file
   from an I2 run and commit it — I6 passes trivially.
7. **K63ConnForgeryClasses-7 (Low) — dead-seat tolerance.** The gate emits findings for dead seats only
   under `--report`; I2 never passes `--report`, and its regex only needs `CLEAN (seats=N` with
   N≥32. A wave whose transcripts show aborted exits still prints `CLEAN (seats=40 … dead=k)`.
   Repro: run the gate on a fixture with one `session_exit` kind `aborted` — verdict stays `CLEAN`.

## Artifacts

- Report: `.ufo/waves/round-63/w1/K63ConnForgeryClasses.md`
- Matrix (milestone deliverable): `.ufo/waves/round-63/build/K63ConnForgeryClasses/forgery-matrix.md`
- Demo fixture proving finding 1: `.ufo/waves/round-63/build/K63ConnForgeryClasses/demo-fixture/` (lane/, sessions/, dispatcher.log; gate reads CLEAN)

## Limits

- Did not run the frozen counting commands end-to-end: no wave results are committed yet (wave 1
  spawned 17:57, sessions mid-flight), and the C2 entry is not landed — a HELD/UNMET run would be
  meaningless for the claim itself. All arms were read from the frozen probe/gate sources plus the
  committed control receipts.
- Finding 3's `opened`-rewrite pass is derived from the probe's cell-equality logic and f4's inverse
  proof; not re-executed against a live fixture (cited as [INFERENCE] in the matrix).
- Did not test T5 against a claimant-controlled URL end-to-end (would require owning/creating such a
  page); the pass is structural from the probe source (T2/T3/T4/T5 have no domain or authority check).
- Did not write to the host session store or dispatcher log; writability is inferred from ownership
  (`ls -l` shows vgpnk) and the gate's read paths.
