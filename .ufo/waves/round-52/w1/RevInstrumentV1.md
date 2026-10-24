# RevInstrumentV1 — round 52, wave 1 (review: routed defects → v2 build)

Seat: `kumitate-r52.RevInstrumentV1` (independent leaf; lane read-only; writes only under
`build/RevInstrumentV1/`). Artifacts: `map.md` (defect→fix map, quoted v1 lines, §9 resolution
note), `verification.md` (final-state verification), `verify-v2.mjs` (19 cases: 17 gate + 2
historical pre-repair shapes), transcripts `v1-baseline.txt`, `v2-ExecInstrumentV2-final.txt`,
`attest52-rerun-at-base.txt` (superseded: `v2-ExecInstrumentV2.txt`, `v2-remedied-preview.*`).

Inputs read in full: `plan.md` §C1 + counters, `scripts/receipt-attest.mjs` (v1, 808 lines,
`44919763…e8d9`), `SCORECARD.md` §Limits (h2-h6, i-k), `round-51/w2/RevInstrument.md` (F1-F8),
`probe/attest52-probe.mjs` (frozen `f6146a2c…` and live `67b16479…`), `base/attest52-base.txt`.
No `lsp` device is exposed in this seat's toolset — line-level reads plus execution against the
real bytes were the verification route (recorded per role rule). No tool installs; pacman
untouched. Lane `scripts/receipt-attest.mjs` never written (pin still `44919763…e8d9`).

## Bottom line

The final delivered v2 (`build/ExecInstrumentV2/receipt-attest.mjs`, sha256
`4d9d824a5d2be764a56cf0f49c2c2092556681266fc9b215103619b2db20ab77`, 789 lines, contract
`kumitate-receipt-attest-v2`) passes **every** contract item I can execute: 17/17 on the
current-contract gate, `ATTEST_SELFTEST: PASS (44/44)`, versus 7/17 for v1. The two frozen
checks that the earlier bytes lost (B3c, B4c — my previous HIGH findings) are closed by L1's
freeze repair of the counter, which I verified independently against both the strict instrument
and v1. One **HIGH process finding remains**: the repair is not yet recorded in the plan and
the frozen base receipt has not been re-committed, so the Q43 evidence set currently cites
probe bytes that no longer exist in the tree.

## HIGH — freeze repair is applied to bytes but not to the freeze record

Measured state: live `probe/attest52-probe.mjs` is `67b16479…822e`; the frozen copy
`build/CritFreeze/attest52-frozen.mjs` (and the minimal-lane copy) is `f6146a2c…1428`; the diff
is three hunks (B3c ×2, B4c ×1, +30/−13) and nothing else. `plan.md` has **no numbered
addendum** (only the pre-existing sentence at line 153), and `base/attest52-base.txt` is still
the pre-repair receipt. Under the plan's own rule ("Any freeze repair … re-runs both and commits
fresh base receipts under the same paths (addendum below, numbered)"), the counter is currently
frozen in name only.

I ran the repaired probe at the frozen base rev (read-only `git archive`) — output is
**byte-identical** to the committed receipt (`diff` empty):

```
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258… rule=A52 version=v1 | … B3c PASS … B4c PASS …
```

So the repair is reading-preserving: re-committing the receipt and naming the new probe hash in
a numbered addendum cannot disturb the frozen arithmetic, and doing nothing leaves the Q43 claim
("frozen AND executed") pointing at superseded bytes. D52 is untouched (all three copies
`e1aa4083…7169`), so the same receipt stays valid.

## Previously reported HIGHs — resolved, with independent confirmation

- **B3c** (earlier: `UNREADABLE exit 2` vs required `TAMPERED exit 1`, because the prelude shape
  test at instrument line 77 preempted the sidecar step): the repaired craft copies the receipt
  into an isolated dir **under its original basename** and rewrites only the prelude to
  `wall_start + 30 s` (in-window), so the sidecar hash mismatch is the only possible reject.
  Measured on `4d9d824a…`: `exit=1`, `RECEIPT: TAMPERED` (M12r).
- **B4c** (earlier: copy read `TAMPERED`, twin `VALID` under the strict name rule): the repaired
  craft re-points each copied sidecar's recorded **name field** to the copy's basename (hash
  unchanged), so both copies are attested and the ledger answers. Measured: twin alone `VALID`,
  `ledger(orig.txt) = REPLAY`, `ledger(twin) = REPLAY` (M11r).
- L1's ruling ("SHAPE stands unamended") is coherent with this: my alternative preview (drop the
  name rule) is **superseded** and retained only as the record of the rejected route.

Caveat for the close report: repaired B3c/B4c **also PASS on v1** (they were `PASS` at base), so
they are forgery-class regression checks, not evidence that the v2 hardening works. The
discriminating checks remain B1/B1c/B2/B2e/B3/B4/B4d.

## MEDIUM — R52-2 (F2) is documented, not repaired

The header states the skip, the note is printed, and a selftest case asserts the string — the
false-VALID class survives: a same-nonce twin beside a prior whose sidecar is damaged still
reads `VALID` (v1 behaviour, unchanged in v2). v1 already printed that note and already pinned
the skip (`ledger-ignores-an-unattested-copy`), so the contract's item 4 is wording plus one
string assertion. Flagged per assignment.

## MEDIUM — R52-3/F6 re-affirmed and contract-illegal to repair

Capture failure is recorded as `exit: 127` (selftest `v2-spawn-failure-is-recorded-as-127`,
measured: run exit 0, recorded 127) with only a hash of the synthesized message, so the receipt
remains indistinguishable from a command that genuinely exited 127. The SHAPE whitelist
(`ALLOWED_FIELDS`) rejects any `capture_error`/`spawn_status` field, so F6's own recommended fix
is now `UNREADABLE`. Needs a contract change before bytes.

## R52-6 — closed in the final bytes (was MEDIUM on the earlier build)

The earlier arm flipped a nonce without recomputing the digest, so `REPLAY` came from the digest
check and a `nonce.slice(0,4)` ledger mutant survived. Final bytes: that case is honestly
renamed `nonce-change-with-stale-digest-is-replay` (line 700), `r52-6-ledger-nonce-16bit-prefix-not-reuse`
(710) builds two internally consistent receipts whose nonces share a 2-byte prefix and requires
`VALID` under `--ledger` for both (a truncating comparator gives a false `REPLAY`), a
digest-prefix arm was added (728), and the sidecar arm (742) is correct. All PASS.

I did not take the "kills all three truncation mutants" claim on report: I built the three
mutants (16-bit prefix compares at the sidecar, inner-digest and ledger-nonce sites) and ran each
against its own suite. Each exits 1 with **exactly one** failing case — the arm written to catch
it (`r52-6-sidecar-…`, `r52-6-inner-digest-…`, `r52-6-ledger-nonce-…`, the last producing a false
`REPLAY` on both receipts). Transcripts `build/RevInstrumentV1/mutant-*.selftest.txt`. SCORECARD
(h3) is closed for all three compare classes.

## LOW / INFO

- Probe B1c's header rationale ("V8 rolls month 13 into January 2027") is still wrong on this
  host (`Date.parse('2026-13-01T00:00:00.000Z')` is `NaN`, Node 24.21.0). The arm discriminates
  anyway via the NaN path; only the stated reason is wrong. Unrepaired by the addendum.
- F4 is fixed in the final bytes beyond the contract (coreutils escaping + unescaping): pairs
  under `back\slash` and `new\nline` verify `VALID` and pass `sha256sum -c` (M14).
- F8.2 (unreadable sidecar reported as absent) and F8.3 (±60 s prelude slack) unchanged; neither
  is in the routed package, both are recorded Q39-class ceilings.
- **Close note — doctored-control sidecar.** B3 passes in all three variants, but only one
  demonstrates the claim it is cited for. With the prelude moved to `wall_start + 30 s`
  (in-window): a verbatim copy of run-2's sidecar reads `TAMPERED` via the **name** rule (prelude
  coverage never exercised — F3's defect in a new mechanism); a sidecar re-pointed to
  `attest52-run-2-replayed.txt` with run-2's original hash reads `TAMPERED` via the **sidecar hash**
  (the declared lesson-M2 class); no sidecar reads `TAMPERED` via the absent branch (r51's state).
  L1 should commit the second form, i.e. apply repair item 2's lesson to the fixture.
- **B5c dependency still open**: `build/MutCounter52/counter-mutant.txt` is absent and the probe
  reads it from `git archive <rev>` — it must be **committed** before the scored rev or B5c
  cannot pass (`base` shows `B5c MISS mutantReceipt=absent-or-malformed selfGuard=present`).
- Final instrument meets probe B1: `case <hyphenated-name>: PASS` ×44 (v1's `ATTEST_CASE nn …`
  form matched 0 lines) and `ATTEST_SELFTEST: PASS (44/44)`.

## Routed-defect verdicts on the final bytes

| Routed | Verdict |
|---|---|
| R52-1 CLOCK | FIXED (rolled month and Feb-30 → `TAMPERED` exit 1) |
| R52-2 LEDGER | DOC-ONLY (note printed; evidence filter unchanged) |
| R52-3 F4 escaped names | FIXED (escape + unescape; GNU agreement verified) |
| R52-3 F5 blank line | FIXED (`UNREADABLE` exit 2) |
| R52-3 F6 capture failure | NOT FIXED (contract re-affirms; whitelist forbids the repair) |
| R52-3 F7 half-pair | FIXED (receipt removed, exit 2) |
| R52-3 F8.1 whitelist | FIXED (unknown field → `UNREADABLE` exit 2) |
| R52-5 vacuous HELD | PROBE-SIDE, guard present; B5c awaits the committed transcript |
| R52-6 truncation arms | FIXED (nonce/digest/sidecar arms, lines 700/710/728/742) |
| R52-7 span arm | PROBE-SIDE (B2 reads body `wall_start`; instrument unchanged) |
| R52-8 zone-less prelude | FIXED (TZ-independent) — and B3c now coexists via the repaired craft |
| A2e STDIN | FIXED (32 nonce chars, probe-captured stdout, `VALID`, GNU sidecar OK) |

## Residual risk

- The freeze receipt/addendum gap is a close-discipline risk, not a capability risk: the base
  reading is provably unchanged, so the repair itself introduces no drift — but the record must
  be committed or Q43 is citing dead bytes.
- Behaviourally, R52-2's false-VALID class and F6's indistinguishable capture failure remain open
  in the capability regardless of counter arithmetic; ledger scope (`*.txt`) and distinct-sha
  weakness stay deferred to round 53 as planned.
- With the strict name rule retained, any future counter that copies a pair under a new name
  must re-point the sidecar name (addendum item 2's lesson) — worth freezing as a Q44-class note.

## Verification gaps

- No round-52 receipts, pin re-derivation (`4d9d824a…`), proxy stanza or README row exist yet, so
  B2/B4/B5 are unscoreable; the harness proves instrument behaviour, not those integrations.
- I did not run the full probe against a synthetic committed tree (it extracts `git archive
  <rev>`); I ran it at the real base rev (byte-identical receipt) and replicated B1's regex,
  B1c, repaired B3c/B4c, and the pre-repair shapes verbatim in `verify-v2.mjs`.
- The alternative-route preview (`v2-remedied-preview.mjs`) is stale (built on the 757-line
  bytes) and is kept only as the record of the rejected option.

Report: .ufo/waves/round-52/w1/RevInstrumentV1.md
