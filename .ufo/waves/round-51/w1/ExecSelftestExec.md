# ExecSelftestExec — A1 falsifier (kumitate r51, wave 1)

**Item.** A1 falsifier: once `build/ExecInstrument/receipt-attest.mjs` exists, run
`node <it> --selftest` in a fresh `mktemp -d` (script copied alone — no corpus, no
sidecars), save the verbatim transcript at `build/ExecSelftestExec/selftest-fresh.txt`, and
verify exit 0 / final line exactly `ATTEST_SELFTEST: PASS` / ≥10 case lines / the
flake-injection case and the sidecar case present; then sabotage one case expectation in a
scratch copy (swap VALID→REPLAY in the fixture) and confirm the selftest FAILS. If the
instrument does not exist when you run, write your own minimal compliant implementation, run
the same protocol on it, and say so. Report divergences from the plan's contract as findings.

**Axes named (godspeed):** (1) A1 truth-value — does the deliverable's selftest actually run
and pass from a cold, script-only directory; (2) A1 red-reading capability — can the suite
read red; (3) contract fidelity — where do the observed bytes diverge from `plan.md` §C1.

**Tools installed/updated:** none. Node `v24.21.0`. No pacman, no `uv`, no network fetch.

---

## 1. Subjects

`build/ExecInstrument/receipt-attest.mjs` **was absent for most of this run and landed at
23:27:31**, so this report covers both branches of my item:

| id | subject | sha256 | status |
|---|---|---|---|
| **A** | **shipped** `scripts/receipt-attest.mjs` == `build/ExecInstrument/receipt-attest.mjs` (identical bytes; verified with `sha256sum` on both) | `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` | 37 954 B, 808 lines — **primary subject** |
| B | `build/ExecSelftestExec/receipt-attest.mjs` (my fallback, written because A was absent) | `cdde1e8aaa731b381bda16627114755b0823918409f747ec16a70c7102c5ed04` | 18 263 B — built in `mktemp -d`, contract `kumitate-receipt-attest-v1`, `node:` deps only, never shells out to `sha256sum` (`plan.md`:194–198) |
| C | `build/ExecSelftestArms/scratch/receipt-attest.mjs` (a sibling seat's reference implementation) | `f39c6b51f137ac8cdd94eda439a82bb4cbab8c53a719cc1282f73ea179677ff4` | comparison subject only |

Absence of `build/ExecInstrument/` before 23:27 is independently corroborated by
`w1/RevInstrumentContract.md` §1, which took the same fallback branch.

---

## 2. Protocol on the deliverable (A): fresh `mktemp -d`, script copied alone

Run against the **shipped** file `scripts/receipt-attest.mjs` (byte-identical to
`build/ExecInstrument/receipt-attest.mjs`; both `sha256=44919763…`, confirmed by `sha256sum`
on both paths).

```text
$ D=$(mktemp -d /tmp/execselftestexec-final2.XXXXXX); cp receipt-attest.mjs "$D/"; cd "$D"
$ node receipt-attest.mjs --selftest
ATTEST_CASE 01 run-writes-receipt-and-sidecar: PASS
ATTEST_CASE 02 receipt-shape-is-prelude-plus-json-line: PASS
ATTEST_CASE 03 sidecar-is-gnu-text-mode-basename: PASS
ATTEST_CASE 04 sidecar-hash-is-computed-with-node-crypto: PASS
ATTEST_CASE 05 nonce-is-128-bit-hex-and-unique-per-run: PASS
ATTEST_CASE 06 verify-genuine-receipt-reads-valid: PASS
ATTEST_CASE 07 flake-injection-doctored-body-reads-replay: PASS
ATTEST_CASE 08 digest-field-corrupted-with-recomputed-sidecar-reads-replay: PASS
ATTEST_CASE 09 sidecar-mismatch-reads-tampered: PASS
ATTEST_CASE 10 missing-sidecar-reads-tampered: PASS
ATTEST_CASE 11 prelude-only-rewrite-reads-tampered: PASS
ATTEST_CASE 12 prelude-rewrite-with-forged-sidecar-reads-replay: PASS
ATTEST_CASE 13 ledger-detects-a-nonce-reused-by-a-different-record: PASS
ATTEST_CASE 14 ledger-exempt-a-byte-identical-duplicate: PASS
ATTEST_CASE 15 ledger-ignores-an-unattested-copy: PASS
ATTEST_CASE 16 usage-errors-exit-64: PASS
ATTEST_CASE 17 missing-receipt-reads-unreadable-exit-2: PASS
ATTEST_CASE 18 malformed-receipt-reads-unreadable-exit-2: PASS
ATTEST_CASE 19 clock-order-violation-reads-tampered: PASS
ATTEST_CASE 20 negative-monotonic-span-reads-tampered: PASS
ATTEST_CASE 21 prelude-outside-the-wall-window-reads-tampered: PASS
ATTEST_CASE 22 inner-digest-covers-every-semantic-field: PASS
ATTEST_CASE 23 canonical-json-is-sorted-and-stable: PASS
ATTEST_CASE 24 receipt-records-no-environment: PASS
ATTEST_CASE 25 run-records-the-command-exit-code: PASS
ATTEST_CASE 26 run-records-output-hashes-not-output: PASS
ATTEST_CASE 27 verify-resolves-the-sidecar-next-to-the-receipt: PASS
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
exit=0
=== post-run directory contents: receipt-attest.mjs
```

Transcript: `build/ExecSelftestExec/selftest-fresh.txt`
(`sha256=8cef0ab4…`, recomputed below in §9).

| item requirement | measured on A |
|---|---|
| exit 0 | **0**, reproduced 6× (5 back-to-back repeats + the canonical capture), stderr 0 B |
| final line exactly `ATTEST_SELFTEST: PASS` | yes — the last stdout line is exactly that string; `ATTEST_CASES: 27 passed, 0 failed` precedes it |
| ≥10 case lines | **27** lines matching `^ATTEST_CASE ` |
| flake-injection case present | `ATTEST_CASE 07 flake-injection-doctored-body-reads-replay` (also `08 digest-field-corrupted-with-recomputed-sidecar-reads-replay`) |
| sidecar case present | `ATTEST_CASE 03 sidecar-is-gnu-text-mode-basename`, `09 sidecar-mismatch-reads-tampered`, `10 missing-sidecar-reads-tampered`, `27 verify-resolves-the-sidecar-next-to-the-receipt` |
| hermetic (no lane/corpus reads, no cwd writes) | post-run `ls -A` = `receipt-attest.mjs` only; the case list contains no corpus/sidecar dependency |

**Measurement note (so nobody chases a phantom):** my very first capture of A printed
`EXIT=1` while the banner read PASS. That was a **stale shell variable in my own harness**
(`EC=${EC:-0}` kept the `1` left by an earlier probe invocation), not a flake: the same
script in a clean `${D}` reads `exit=0` six times out of six, and the canonical transcript
captures `NODE_EXIT=0` directly. No flake finding.

Fallback (B) and the sibling (C), same protocol, both `exit=0`, final line
`ATTEST_SELFTEST: PASS`; B lists 20 `CASE` lines, C lists 12 `ATTEST_CASE:` lines, both
including a flake-injection arm and sidecar arms. B's transcript:
`build/ExecSelftestExec/selftest-fresh-fallback.txt`.

---

## 3. Protocol on the deliverable (A): sabotage — swap VALID→REPLAY in one case expectation

Scratch copy `/tmp/selftestexec.w48rsW/ei-sab/`, one literal in the case body changed
(deliverable line 479, case `verify-genuine-receipt-reads-valid`):

```diff
-  if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
+  if (lastLine(r) !== 'RECEIPT: REPLAY') return `verdict line is ${JSON.stringify(lastLine(r))}`;   // SABOTAGE: was RECEIPT: VALID
```

```text
$ node receipt-attest.mjs --selftest
…
ATTEST_CASE 06 verify-genuine-receipt-reads-valid: FAIL (verdict line is "RECEIPT: VALID")
…
ATTEST_CASES: 26 passed, 1 failed
receipt-attest: SELFTEST FAIL verify-genuine-receipt-reads-valid: verdict line is "RECEIPT: VALID"
ATTEST_SELFTEST: FAIL
exit=1
```

**A's suite reads red.** Transcript: `build/ExecSelftestExec/selftest-sabotage-instrument.txt`.

The same protocol on B (`check('run-roundtrip-valid', 'RECEIPT: VALID'` → `'RECEIPT: REPLAY'`):
`CASE 01 … FAIL`, `SELFTEST CASES: 20 FAILED: 1`, `ATTEST_SELFTEST: FAIL`, exit 1 —
`build/ExecSelftestExec/selftest-sabotage-fallback.txt`. On C (`/RECEIPT: VALID/` →
`/RECEIPT: REPLAY/` in `healthy-run-valid`): `ATTEST_SELFTEST: FAIL (1/12)`, exit 1 —
`build/ExecSelftestExec/selftest-sabotage-sibling.txt`.

---

## 4. Supplementary red-reading evidence (semantic mutants of B, not expectation swaps)

An expectation swap proves the harness compares; it does not prove the checks are load
bearing. Two single-line mutants of B, run through `--selftest`:

```text
M1  inner-digest comparison removed
    → CASE 02 flake-injection-replay FAIL (observed RECEIPT: VALID) ; ATTEST_SELFTEST: FAIL ; exit 1
M2  sidecar-hash comparison removed
    → CASE 03 sidecar-mismatch-tampered FAIL (observed RECEIPT: REPLAY)
      CASE 04 prelude-rewrite-tampered  FAIL (observed RECEIPT: VALID) ; ATTEST_SELFTEST: FAIL ; exit 1
```

Transcript: `build/ExecSelftestExec/selftest-mutants-red.txt`. M2's second failure is the
important one: with the byte layer gone the lesson-M2 prelude forgery verifies as `VALID`,
i.e. the prelude-rewrite case is the arm that actually carries the M2 closure claim for B.
A's own suite carries the equivalent arms independently (cases 07/08/09/11).

---

## 5. Frozen-counter evidence (A51, 9 checks, probe `sha256=73ee53ec…`)

I did not stop at the item's checks: I built probe-shaped scratch lanes and ran the **frozen**
counter. Method: `git clone --no-hardlinks` of the lane (read-only; no git/jj mutation in the
lane), then stage `scripts/receipt-attest.mjs`, `.ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt`
(+ GNU sidecars), the doctored `attest-run-2-replayed.txt` (run-2's receipt with **only** the
`run-at:` prelude rewritten, run-2's genuine sidecar retained) and `pin.receipt-attest`;
commit in scratch; run the probe. Receipts were produced by the subject's own `run`, then
re-dated to a ≥300 s span with digest+sidecar recomputed so the A2 span arm is satisfiable
by construction (it remains author-scheduled, `plan.md`:154).

Probe identity: `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`
(lane tip `cbca45c`, "freeze repair 6 — A3d"; check set A1, A2, A2c, A3, A3c, A4, A4c, A3d,
A5 = 9). **The probe changed twice during my run** (5 → 7 checks at `8c07e88`, → 8 at
`4b8da21`, → 9 at `cbca45c`); every reading below was re-taken against the bytes named above.
If the probe moves again, these readings must be re-taken; the instrument-side verdicts have
been stable across all three arm sets.

```text
# A — the seat deliverable, in a bare scratch lane (no proxy-check.mjs)
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=947d89da rule=A51 version=v3 |
  A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS |
  A5 MISS pin match;proxy exit=1 Node.js v24.21.0
exit=1

# A — in a FULL lane clone + pin + gate-key registered in proxy-check GATE_PINS (integration-shaped)
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=2e0593b5 rule=A51 version=v3 |
  A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS |
  A5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT term=A declared=43 computed=46 …)
exit=1

# B — my fallback, bare scratch lane
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=22358fa4 … A1..A3d PASS |
  A5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT declared=43 computed=46 …)
exit=1

# C — sibling scratch, bare scratch lane
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=4d6ac6a4 … A1 A2 A2c A3 A3c PASS |
  A4 MISS attest-run-2.txt:ledger exit=1 RECEIPT: REPLAY;prior-files=0 | A4c PASS | A3d PASS |
  A5 MISS pin match;proxy exit=1 Node.js v24.21.0
exit=1
```

Transcripts: `probe-instrument.txt`, `probe-instrument-full.txt`, `probe-mine.txt`,
`probe-sibling-scratch.txt` (hashes in §9).

Reading: **A1 is satisfiable by a real, cold, script-only selftest** — A, B and C all clear
it, and every behavioural challenge arm added to kill verdict-printing stubs (A2c, A3c, A4c,
A3d) passes against A and B. A5 is the only miss for both, and §7 F2/F3 show A5 is not
reachable at the lane tip for reasons unrelated to the instrument.

---

## 6. Independent falsification of A's specific claims (not trusting its own PASS)

I reproduced A's arms by hand against live-generated receipts (`/tmp/selftestexec.w48rsW/ei-probe`):

```text
1. genuine receipt                        → RECEIPT: VALID      exit 0
2. prelude-only rewrite, sidecar untouched → RECEIPT: TAMPERED   exit 1   (the A3 / M2 control)
   receipt-attest: sidecar mismatch: sidecar d546e36f…, actual 0696a22f…
3. prelude rewrite OUT of the wall window + forged sidecar → RECEIPT: TAMPERED  exit 1
   receipt-attest: prelude 2026-10-23T23:59:00.000Z is outside the recorded wall window
   [2026-10-24T02:34:22.038Z, 2026-10-24T02:34:22.040Z]
4. prelude re-dated WITHIN the wall window + forged sidecar → RECEIPT: VALID     exit 0
```

(2) and (3) confirm A's M2 rejection for the right reason (byte layer; then a window check
that B does not have — see F6). (4) is the honest ceiling: a **keyless** digest means an
author who re-dates *inside* the recorded window and re-signs the sidecar is undetectable.
That is exactly the declared Q39 ceiling (`plan.md`:44–48, 152–155), now measured rather
than assumed; it is not a defect, but it bounds what "closes the M2 class" can mean.

---

## 7. Findings — divergences from the plan's contract

### F1 — MEDIUM — A's case 12 is misnamed: its REPLAY comes from the ledger, not from the prelude rewrite

`build/ExecInstrument/receipt-attest.mjs:549` (`prelude-rewrite-with-forged-sidecar-reads-replay`)
builds a *different* record (extra argv element, recomputed digest) that **reuses the original
receipt's nonce**, rewrites the prelude to `2020-01-01`, re-signs the sidecar, and then verifies
**with `--ledger`**. The `REPLAY` therefore comes from the ledger arm. My independent
reproduction of the name's literal scenario — prelude rewrite + forged sidecar, no nonce
reuse, no ledger — reads **`TAMPERED`** (the window check), not `REPLAY`. Behaviour is safe
(never `VALID`), but the case name and its comment ("the inner digest still holds, so only the
ledger can see it") will mislead a reader into believing a re-signed prelude rewrite alone
is classified `REPLAY`. **Minimal fix:** rename to
`forged-record-with-reused-nonce-reads-replay-under-ledger`, or split it into the two
behaviours it mixes.

### F2 — HIGH (for the L1, not an instrument defect) — A5 is unreachable at the tip; its arithmetic is short by two

`node scripts/proxy-check.mjs --strict` (UFO_SRC=`/home/vgpnk/Projects/ufo-fsd-alpha`)
**already DRIFTs before any instrument exists**, on pristine clones:

```text
c90b9de9 (base)       → PROXY: MATCH  A=43 C=22 … pins=6 match              exit 0
d788f74 (r50 spotchk) → DRIFT: C2_TOTAL_DRIFT 114→115; AXES_DRIFT coverage 10→9
06ecbf4 … 8fd3cde     → DRIFT: + A_DRIFT declared=43 computed=45
cbca45c / 779b16e5    → same three, and with the instrument staged:
                        A_DRIFT declared=43 computed=46; C2_TOTAL 114→115;
                        AXES coverage 10→9; PIN_UNPINNED scripts/receipt-attest.mjs
```

Cause of the A delta: `scripts/proxy-check.mjs:934` derives
`A = walkFiles(self).filter(RE_RUNNABLE).length`, `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/`
(`:494`), over the whole lane tree — so **both round-51 probe counters**
(`.ufo/waves/round-51/probe/attest{51,doctrine51}-probe.mjs`) add 1 each and the shipped
instrument adds 1. `plan.md:109` predicts "A 43 → **44**", short by the two probe files; the
reachable value is **46** (measured: 45 at tip, 46 with the instrument). `plan.md`:110–111
acknowledges the mechanism ("add to the frozen `A` count … recorded, not claimed") without
doing the arithmetic. **Minimal fix (L1, at the close commit):** declare `A=46`,
`C2_total=115`, correct the `## Axes` `coverage` row to its derived value, and re-pin
`pin.proxy-check` if `proxy-check.mjs` is edited. I edited no lane file.

### F3 — MEDIUM (for the L1) — the A5 pin arm needs a `GATE_PINS` registry entry or it fails closed

Keys in the `kumitate-gate-pins-v1` block must be declared in `scripts/proxy-check.mjs`
`GATE_PINS` (`:461–471`). Adding `pin.receipt-attest=<sha256>` without registering the key:

```text
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 320: pin.receipt-attest …    exit 2
```

(measured in scratch). With `{ 'pin.receipt-attest': 'scripts/receipt-attest.mjs' }` added
following the round-50 `pin.bind-oracle` precedent (`:468`), the pin substep passes and only
the F2 term drifts remain. Chained consequence: editing `proxy-check.mjs` changes its own
bytes, so `pin.proxy-check` must be re-pinned in the same edit (observed `PIN_DRIFT
pin.proxy-check`). Neither §C1 nor "Terms expected to move" names this dependency.

### F4 — MEDIUM — three verdict classes the contract leaves unmapped, and A/B disagree on two of them

`plan.md`:35–37 maps only: inner-digest mismatch → `REPLAY`; nonce reuse → `REPLAY`; sidecar
mismatch → `TAMPERED`; usage 64; unreadable 2. Measured behaviour on the unmapped classes:

| class | A (deliverable) | B (my fallback) |
|---|---|---|
| clock disorder (`wall_end < wall_start`) | `TAMPERED` exit 1 (case 19) | `REPLAY` exit 1 |
| negative monotonic span | `TAMPERED` exit 1 (case 20) | `REPLAY` exit 1 |
| prelude outside the recorded wall window | `TAMPERED` exit 1 (case 21) | not checked at all |
| malformed / unparseable receipt | `UNREADABLE` exit 2 (case 18) | `REPLAY` exit 1 |

All four are probe-neutral today (no frozen arm reaches them), but they are contract text the
next round will freeze. **Minimal fix:** name the classes in `plan.md` §C1 — I recommend A's
column: `TAMPERED` for records the verifier *cannot* reconcile (clocks, window, sidecar) and
`UNREADABLE` exit 2 for receipts it *cannot parse*; `REPLAY` stays reserved for the two
declared semantic forgeries plus ledger reuse. Note A's window check is strictly stronger
than B (it catches an out-of-window re-dating even when the sidecar is re-signed); B should
adopt it.

### F5 — LOW — missing sidecar: both implementations chose `TAMPERED` exit 1; the reviewer's exit-2 suggestion would endanger A3

`plan.md`:35–37 does not classify a *missing* sidecar. A (case 10) and B both fail closed to
`TAMPERED` exit 1. `w1/RevInstrumentContract.md` §F2 recommends exit 2 instead — but the A3
control is a prelude-rewritten receipt whose sidecar may legitimately be absent, and the probe
requires `TAMPERED` **exit 1** (`probe:185`). Exit 2 would make A3 unpassable in that
configuration. **Minimal fix:** state the class in the contract; `TAMPERED` exit 1 is the
probe-safe choice.

### F6 — LOW — `run`'s own exit code is unspecified by the contract

Neither `plan.md`:26–32 nor the item text says what `run` exits with. A returns 0 after
writing receipt+sidecar (verified: `run` → `RECEIPT: RECORDED`, exit 0, `run-records-the-command-exit-code`
records the child's status as data). B does the same. No action unless the L1 wants the
child's status propagated.

### F7 — LOW — the sibling scratch implementation (C) fails frozen A4; do not integrate it as-is

`build/ExecSelftestArms/scratch/receipt-attest.mjs:165–181` exempts a ledger entry only by
basename (`:167`) and flags any other `*.txt` with the same nonce (`:176`):

```js
const mine = basename(file);                                                                  // :167
if (basename(e) === mine) continue;
if (other.nonce && other.nonce === obj.nonce) { emit('RECEIPT: REPLAY'); process.exit(1); }   // :176
```

`attest-run-2-replayed.txt` sits in the same receipts directory as `attest-run-2.txt` and
carries its nonce, so `verify --ledger <receipts-dir> attest-run-2.txt` reads `REPLAY` →
**A4 MISS** (measured). `plan.md`:186–192 already settles this: flag only *same nonce +
different record digest*; exempt the target and byte-identical duplicates. A implements the
settled rule (`:366–371`: `state.nonce === record.nonce && state.digest !== record.digest`,
plus an "attested" filter) and clears A4 **and** A4c together. **Minimal fix if C is the
integration source:** add the `digest !==` conjunct.

### F8 — LOW — A's banner contract is correct; recording the constraint that makes it so

Probe A1 requires `r.status === 0` **and** `/ATTEST_SELFTEST: PASS/` on
`stderr+stdout.trim().split('\n').pop()` (`probe:93`, `:111`). A prints `ATTEST_CASES: 27
passed, 0 failed` and then the banner as the last line, and exits 1 with
`ATTEST_SELFTEST: FAIL` on any failure — exactly the shape the arm needs. Any future edit
that appends output after the banner silently breaks A1; no divergence today.

---

## 8. What I attacked, what I did not

- Attacked: A's A1 evidential value (cold-directory run ×6, exact banner, case count, both
  mandated arms, hermeticity), A's ability to read red (expectation swap), B's checks
  (two semantic mutants), and the full 9-check frozen predicate against three independent
  implementations in purpose-built scratch lanes; plus hand-reproduction of A's M2 and
  re-dating arms including the in-window/re-signed boundary.
- Did not: edit any lane file (`scripts/`, `corpus/`, `SCORECARD.md`, `SKILL.md`), run
  git/jj mutations in the lane, run the base-rev counters (ExecBaseCounter's item), or run
  any build/lint/test battery (parent's post-integration gate).
- **Untested / residual risk:** A5 was never observed passing end-to-end by this seat (§7
  F2/F3 block it at the tip independently of the instrument). A2's ≥300 s span is satisfied
  by construction in my scratch lanes, not by elapsed time (`plan.md`:154). A's instrument
  has not been through MutInstrument's literal-mutant battery or SentReceipt's secret-material
  review; I assert only `ATTEST_CASE 24 receipt-records-no-environment: PASS` plus my own
  `Object.keys` inspection of B's record.

## 9. Artifact manifest (all under `.ufo/waves/round-51/build/ExecSelftestExec/`)

| file | sha256 |
|---|---|
| `receipt-attest.mjs` (B, this seat's fallback implementation) | `cdde1e8aaa731b381bda16627114755b0823918409f747ec16a70c7102c5ed04` |
| `selftest-fresh.txt` (**item deliverable** — A shipped file, fresh mktemp dir) | `c814393e734867ae6397d87bf6889f43f63b1db672cc0e39945fdee4f575ac15` |
| `selftest-fresh-fallback.txt` (B, fresh mktemp dir) | `654c1aa81748abcc9455e24b9c6284de583fc84d128f26e52ea9cef5fee6bd92` |
| `selftest-sabotage-instrument.txt` (A, VALID→REPLAY) | `122aaf8931a34a8b9cfcefb5f327d51775943e1e4f538dd4272640d52b6edd7e` |
| `selftest-sabotage-fallback.txt` (B, VALID→REPLAY) | `b80a446a42c0da10e3e0267dbcfe5a15d6b948d7cb816504cbee3d5864fef03f` |
| `selftest-sabotage-sibling.txt` (C, VALID→REPLAY) | `7900061e1939f3622313447a24b4ce618589d9312b8c46c9fc614d0f4935692b` |
| `selftest-mutants-red.txt` (B: digest / sidecar mutants) | `4a4b34b989d232affc8e59e808122b9f3263bc725d98457795fac972a32f81ef` |
| `probe-instrument.txt` (frozen A51, 9 checks, A bare lane) | `2bdab956e28f1193c84ce110825da96a5be9c1c0d3271c73c3ddf182b34a92b9` |
| `probe-instrument-full.txt` (frozen A51, A in a full lane clone) | `23e2bc1e9d7fa6124f277c60760d52c123c0c36c78de9bea2d5e9194db2d8ac3` |
| `probe-mine.txt` (frozen A51, B) | `8d5dc79d2d150acb94f3e591ac36f2149ee690f095d763adb32ca22fa1a381f9` |
| `probe-sibling-scratch.txt` (frozen A51, C) | `50680f09344edecdb6eba1ff3560dcaf361f810c401960653e0affe869779129` |

The probe transcripts carry the probe sha256 and the scratch rev they were taken at in
their own headers; `selftest-fresh.txt` and `selftest-fresh-fallback.txt` carry the subject
sha256 and the `mktemp -d` directory they were produced in.
