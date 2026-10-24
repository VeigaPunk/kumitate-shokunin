# ExecInstrument — round 51, wave 1: `scripts/receipt-attest.mjs`

Seat: `ExecInstrument` (executor). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
(jj-colocated, read-only for this seat — nothing in the lane checkout was modified).
Contract: `kumitate-receipt-attest-v1` (plan § C1 + `## Freeze repair addendum`, builds to
freeze `cbca45cc…`, A51 v3r6, 9 arms: A1, A2, A2c, A3, A3c, A3d, A4, A4c, A5).

## Deliverables (artifacts for L1 integration; never written into `scripts/` by this seat)

| Path | sha256 | Notes |
|---|---|---|
| `.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` | `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` | 808 lines, mode 755, no dependencies, node builtins only |
| `.ufo/waves/round-51/build/ExecInstrument/selftest.txt` | — | verbatim `--selftest` stdout: 27 cases, exit 0, final line `ATTEST_SELFTEST: PASS` |

Integration is a byte-identical copy to `scripts/receipt-attest.mjs`: the A5 pin must be
`sha256` of **that** file, so do not re-format or re-wrap it after copying.

## What was built

`receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`, fail-closed, no deps):

- `run --out <base> -- <cmd...>` executes the command with `spawnSync` (raw `Buffer` capture),
  records `argv`, `exit`, `stdout_sha256`, `stderr_sha256`, a 128-bit nonce
  (`crypto.randomBytes(16).toString('hex')`), `wall_start`/`wall_end` (ISO, `Date.now()`), and
  `mono_span_ms` (integer ms from `process.hrtime.bigint()`), then writes `<base>.txt` and the GNU
  text-mode sidecar `<base>.txt.sha256` (`<64 hex><two spaces><basename>\n`). No environment is
  recorded; the child inherits it because it must run, but nothing of it reaches the receipt.
- Receipt bytes are exactly two lines: `run-at: <wall_start ISO>` (display prelude) and one
  canonical-JSON line (recursively key-sorted, one line, no insignificant whitespace). The `digest`
  field is `sha256` over `JSON.stringify(sortKeys(bodyWithoutDigest))` — the exact formula the frozen
  A4c arm uses (verified byte-equal below).
- `verify [--ledger <dir>] <file>` recomputes, in this order: (1) the inner digest → `REPLAY`,
  (2) the sidecar hash over the exact file bytes → `TAMPERED` (absent sidecar is also `TAMPERED`,
  never `VALID`), (3) clock ordering (`wall_end >= wall_start`, `mono_span_ms >= 0`) → `TAMPERED`,
  (4) the ledger nonce test → `REPLAY`, (5) a display-prelude/wall-window consistency test →
  `TAMPERED`. Verdict literals are exact (`RECEIPT: VALID|REPLAY|TAMPERED`) and the verdict is the
  **last** line of output; diagnostics precede it. Exit map: `0` valid, `1` defect, `2` fail-closed
  (unreadable/malformed), `64` usage.
- The sidecar is located next to the **receipt** (`<file>.sha256`), never via the recorded name and
  never via the process cwd.
- `--ledger` counts only **attested** receipts as ledger evidence (sidecar matches bytes *and* inner
  digest recomputes), skips the subject file by resolved path, and flags a nonce **only** when
  another attested receipt binds the same nonce to a **different** record digest (freeze-repair
  addendum item 4). Byte-identical duplicates are exempt — required, because the A3 doctored control
  shares run-2's nonce in the receipts directory and is rejected by the sidecar layer, not the ledger.
- All digests are computed with `node:crypto`; the shipped tool never spawns `sha256sum` or any
  other digest binary. The only child processes are the caller's command and (inside `--selftest`)
  `process.execPath` for the tool itself.

## Retained evidence (commands actually run)

### 1. Hermetic selftest — 27 cases, exit 0

```
$ node receipt-attest.mjs --selftest
ATTEST_CASE 01 run-writes-receipt-and-sidecar: PASS
…
ATTEST_CASE 07 flake-injection-doctored-body-reads-replay: PASS       ← contract arm: flake → REPLAY
ATTEST_CASE 08 digest-field-corrupted-with-recomputed-sidecar-reads-replay: PASS  ← A3d shape
ATTEST_CASE 09 sidecar-mismatch-reads-tampered: PASS                 ← contract arm: sidecar → TAMPERED
ATTEST_CASE 10 missing-sidecar-reads-tampered: PASS
ATTEST_CASE 11 prelude-only-rewrite-reads-tampered: PASS             ← M2 forgery, sidecar untouched
ATTEST_CASE 12 prelude-rewrite-with-forged-sidecar-reads-replay: PASS
ATTEST_CASE 13 ledger-detects-a-nonce-reused-by-a-different-record: PASS
ATTEST_CASE 14 ledger-exempt-a-byte-identical-duplicate: PASS        ← addendum item 4
ATTEST_CASE 15 ledger-ignores-an-unattested-copy: PASS
…
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
$ echo $?
0
```

(Full verbatim transcript in `build/ExecInstrument/selftest.txt`.)

### 2. Canonicalization equals the frozen A4c/A3d formula, byte for byte

Probe formula vs. the stored digest of a live receipt:

```
$ node canoncheck.mjs
probe digest : 925ec92f91c05867fb6aadc1248187556e67ad67bf89274ed89d6b99e4f462ef
stored digest: 925ec92f91c05867fb6aadc1248187556e67ad67bf89274ed89d6b99e4f462ef
MATCH        = true
line == probeCanon with digest spliced = true
```

### 3. Challenge-arm rehearsals (probe code reproduced verbatim against the delivered script)

- **A2c** (`run --out <tmp> -- /usr/bin/printf %s <nonce>`):
  `{"argvOk":true,"outOk":true,"validOk":true,"sideOk":true}` — argv ends with the nonce, `stdout_sha256`
  is `sha256(nonce)`, receipt verifies `VALID`, `/usr/bin/sha256sum -c` prints
  `challenge-…txt: OK`.
- **A3c** (live receipt, prelude rewritten, genuine sidecar copied to the target):
  `1 RECEIPT: TAMPERED`.
- **A3d** (digest field set to `f`×64, sidecar recomputed): `1 RECEIPT: REPLAY`.
- **A3** (doctored control beside its original, stale sidecar): `1 RECEIPT: TAMPERED`.
- **A4** (ledger over a receipts dir that contains the doctored control), both control shapes —
  sidecar stale **and** sidecar recomputed: all three receipts `0 RECEIPT: VALID`.
- **A4c** (twin with appended argv, digest + sidecar recomputed): `twinValid=true`,
  `ledger(orig)=REPLAY`, `ledger(twin)=REPLAY`. `A4c PASS = true`.

### 4. Frozen counter in a scratch git repo — A1…A4c pass with the delivered artifact

Rehearsal (outside the lane, `/tmp/r51-rehearsal`, never the lane checkout): `git archive HEAD`
of the lane at freeze `cbca45cc`, the delivered script copied byte-identically to
`scripts/receipt-attest.mjs`, three receipts produced by three real `run` invocations 160 s apart
(span 320 s ≥ 300 s), the doctored control (`run-at:` rewritten, original sidecar kept), then
`git init` + commit and:

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/r51-rehearsal 194ff41cbe79ad7d49323dc23c0a7c4c74a36949
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=194ff41c… rule=A51 version=v3 | A1 PASS | A2 PASS |
  A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS |
  A5 MISS pin match;proxy exit=1 PROXY: DRIFT (PIN_DRIFT term=pin.proxy-check …; AXES_DRIFT …)
```

A1, A2 (span 320 s, distinct nonces and shas), A2c, A3, A3c, A3d, A4, A4c all hold with the
delivered bytes. A5 is **not an instrument property**: it is the close-commit stanza work the plan
already assigns to the close. The rehearsal pinned the exact prerequisites, in order:

1. `pin.receipt-attest=<sha256 of the delivered file>` **inside** the `<!-- kumitate-gate-pins-v1`
   block (a pin line placed anywhere else in SCORECARD.md is parsed inside the
   `kumitate-proxy-v1` stanza and fails closed with `STANZA_KEY_UNKNOWN`).
2. a `GATE_PINS` registry row in `scripts/proxy-check.mjs`
   (`'pin.receipt-attest': 'scripts/receipt-attest.mjs'`), else `GATE_PIN_KEY_UNKNOWN`;
3. re-pin `pin.proxy-check` for the edited `proxy-check.mjs` (`PIN_DRIFT` otherwise);
4. re-derive the stanza terms — in the rehearsal tree the computed values were
   `A=47 C=22 C1=19 C1_total=19 C2=114 C2_total=115` (declared `A=43 C2_total=114`), i.e. A moves
   by the instrument plus the frozen `RE_RUNNABLE` walk over `.ufo/waves/round-51/probe/`, and the
   `## Axes` coverage row must agree with the derived value (`AXES_DRIFT` otherwise).

With (1)–(3) applied and the terms re-derived, `--strict` reports only those term drift kinds — no
pin or grammar error attributable to the instrument.

### 5. Mutation battery — 15/15 killed by the shipped selftest

Single-literal/single-line mutants applied to a scratch copy; every one makes `--selftest` exit 1
(the killing case is named):

| # | Mutant | Killed by case |
|---|---|---|
| M01 | inner-digest check disabled | 07, 08, 22 |
| M02 | sidecar hash check disabled | 09 |
| M03 | digest binds nothing (`digest` not removed) | 06, 09, 10 |
| M04 | ledger ignores the digest difference | 14 |
| M05 | TAMPERED verdict emitted as REPLAY | 10 |
| M06 | nonce 8 bytes instead of 16 | 05, 06, 07 |
| M07 | wall clock order check disabled | 19 |
| M08 | negative monotonic span accepted | 20 |
| M09 | prelude/wall-window check disabled | 21 |
| M10 | missing sidecar reads VALID | 10 |
| M11 | sidecar records an absolute path | 03 |
| M12 | command exit code not recorded | 25 |
| M13 | environment recorded in the body | 24 |
| M14 | stdout hash computed over empty bytes | 26 |
| M15 | usage errors exit 1 instead of 64 | 16 |

(Case numbers are the delivered 27-case list; each row was re-run against the delivered file.)

### 6. Black-box harness (`build/ExecSelftestArms/run-cases.mjs`)

```
CASES: 27/28 /tmp/attest-scratch/receipt-attest.mjs
CASE C08 ledger-rejects-nonce-reuse-on-a-byte-identical-copy: FAIL exit=0 VALID
```

**C08 is unsatisfiable together with the frozen contract** — see Finding F1. Every other case
passes (C01–C07, C08b, C09–C27, including C25's exact digest formula, C16's per-field binding,
C17's missing-sidecar=TAMPERED, C23's last-line verdict).

## Findings

### F1 (severity: high — harness/contract conflict, L1 adjudication needed)

`ExecSelftestArms`' case **C08** expects a *byte-identical duplicate* (same nonce, same inner
digest) in the ledger directory to verify `RECEIPT: REPLAY`, and the seat reports "28/28 for any
implementation". That contradicts the frozen plan, `## Freeze repair addendum` item 4, and this
wave's build spec item (2), which say the ledger flags a nonce **only** when another receipt binds
it to a **different** record digest and that byte-identical duplicates are **exempt**.

The two cannot both hold, and the frozen counter is the scoring instrument. Proof, run against the
peer's own reference oracle (`build/ExecSelftestArms/scratch/receipt-attest.mjs`, which passes C08
by flagging any same-nonce file):

```
MINE        stale      {"A4-run1":"0 VALID","A4-run2":"0 VALID","A4-run3":"0 VALID","A3-control":"1 TAMPERED"}
MINE        recomputed {"A4-run1":"0 VALID","A4-run2":"0 VALID","A4-run3":"0 VALID","A3-control":"1 TAMPERED"}
PEER-ORACLE stale      {"A4-run1":"0 VALID","A4-run2":"1 REPLAY","A4-run3":"0 VALID","A3-control":"1 TAMPERED"}
PEER-ORACLE recomputed {"A4-run1":"0 VALID","A4-run2":"1 REPLAY","A4-run3":"0 VALID","A3-control":"0 VALID"}
```

i.e. an implementation that satisfies C08 **fails A4** (run-2 reads REPLAY because the A3 doctored
control shares its nonce in the same directory), and in the recomputed-sidecar shape it also **fails
A3**. The delivery therefore follows the frozen text (digest-difference rule) and reports 27/28.

Proposed minimal fix (harness owner's file, not edited by me): change C08's expectation to
`RECEIPT: VALID` for a byte-identical duplicate (the A2 distinct-sha/distinct-nonce arms are the
designated verbatim-duplication detector per addendum item 4), or re-point C08 at a
different-digest twin, which C08b/C27 already cover.

### F2 (severity: medium — integration constraint)

A2 needs the three committed receipts 300 s apart **from their `run-at:` preludes**. `run` stamps
real time, and my `verify` additionally requires the prelude to sit inside the record's own wall
window (±60 s) — so the receipts must be produced by three real `run` invocations spaced ≥300 s
apart; hand-editing only the prelude (even with a recomputed sidecar) is rejected as `TAMPERED` by
design. Suggested recipe (from the lane root):

```
node scripts/receipt-attest.mjs run --out .ufo/waves/round-51/receipts/attest-run-1 -- /usr/bin/printf %s r51-1
sleep 160
node scripts/receipt-attest.mjs run --out .ufo/waves/round-51/receipts/attest-run-2 -- /usr/bin/printf %s r51-2
sleep 160
node scripts/receipt-attest.mjs run --out .ufo/waves/round-51/receipts/attest-run-3 -- /usr/bin/printf %s r51-3
```

### F3 (severity: low — artifact shape)

The A3 doctored control must keep the **original** (stale) sidecar, or have none at all, or have its
prelude outside the wall window. All three shapes verify `TAMPERED exit 1` in this implementation
(the stale/absent sidecar via the sidecar layer, the recomputed-sidecar shape via the prelude/window
layer), and none of them can poison A4 because the control shares run-2's *digest* and is therefore
exempt under item 4.

### F4 (severity: informational — plaintext-in-argv)

`run-records-output-hashes-not-output` proves the captured stdout does not leak into the receipt;
note that `argv` is recorded verbatim by contract, so a caller who passes a secret as an argument
puts it in the receipt. The tool records no environment and no output bytes.

## Limits (kept, not claimed)

- Q39 ceiling verbatim: receipts remain author-attested invocation records, not cryptographic
  temporal proof. The instrument proves record integrity and nonce freshness across a ledger, not
  the wall-clock truth of when the bytes were made.
- The ledger is per-directory; cross-directory reuse is out of scope by contract.
- Ledger evidence is gated on attestation (a forgery is never treated as a prior invocation); a
  nonce reused only by an unattested file is not flagged by the ledger — that file is itself
  rejected by the sidecar/digest layers.
- 128-bit nonce birthday bound: collision probability stays negligible for any receipt volume this
  lane can produce (≪2⁻⁶⁴ at 10⁶ receipts).

## Blockers

None for delivery. F1 is a harness-side conflict requiring the L1/`ExecSelftestArms` adjudication.
In rehearsal the delivered instrument holds **A1, A2, A2c, A3, A3c, A3d, A4, A4c** (8 of 9 frozen
arms). **A5 is not reachable from the artifact alone** — it needs the close-commit integration
described in §4 (gate-pins block pin, `GATE_PINS` registry row, re-pin of `proxy-check.mjs`, and
the stanza/Axes re-derivation).
