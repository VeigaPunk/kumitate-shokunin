# ExecForgerControl — do-nothing / static-forger control for C1 (rule `A51`)

Seat: `ExecForgerControl` (item). Axes attacked: operability (C1 predicate `ATTEST_HELD`),
control discrimination. Lane was read-only; every lane file below is an artifact under
`.ufo/waves/round-51/build/ExecForgerControl/` plus this report. No counter, plan, script,
corpus entry or state file was edited; no git/jj mutation in the lane; no pacman.

## Version scope — read this first

The item text names `held=k/5` (the five-check A51). **The counter was repaired mid-wave**:
`plan.md` `## Freeze repair addendum` items 3, 7, 8 (commits `8c07e88`, `4b8da21`, `cbca45c`)
grew it to **9 checks** (A1, A2, A2c, A3, A3c, A4, A4c, A3d, A5) and the plan body now says
`ATTEST_HELD = held=9/9` (`plan.md:71-74`). Both readings are reported:

- **vs the current frozen counter** — sha256 `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`,
  version `v3`, 9 checks, worktree == HEAD blob at run time.
- **vs the historical v2 counter** (`1fd8aceb`, five checks) that the item's `held=k/5` wording names.

The mandated control (verdict-printing stub + three forged receipts with **identical nonces**)
reads **UNMET** under both. The escalation in §4 finds a **live bypass of the current counter**.

## (1) What was built

`build-control-variants.mjs` materializes five scratch lanes, each its own git repo with one
commit, mimicking the lane layout the counter reads (`git archive <rev>`, never the worktree):

```
scripts/receipt-attest.mjs            stub, zero verification logic (or filename-keyed)
scripts/proxy-check.mjs               forger-owned stand-in printing PROXY: MATCH (C1..C3)
SCORECARD.md                          pin.receipt-attest=<sha256(stub)> in a gate-pins block
.ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt + .sha256
.ufo/waves/round-51/receipts/attest-run-2-replayed.txt (+ sidecar holding run-2's hash)
.ufo/waves/round-50/ReRunB49-1.txt    prior-corpus mimic for A4's sweep arm
```

The do-nothing stub is exactly the item's shape and has **no** hashing, digest or ledger code:

```js
const a = process.argv.slice(2);
if (a[0] === '--selftest') { process.stdout.write('ATTEST_SELFTEST: PASS\n'); process.exit(0); }
if (a[0] === 'verify' || a[0] === 'run') { process.stdout.write('RECEIPT: VALID\n'); process.exit(0); }
process.exit(64);
```

## (2) Mandated control — exact reading: UNMET

### Current counter (v3, 9 checks)

Command (`<lane>` adapted only; the counter's `<rev>` is the scratch commit):

```
node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/forgerctl/C1-identical-nonce-distinct-bytes <rev>
```

```
ATTEST51: ATTEST_UNMET held=3/9 checks=9 rev=5e0a2f9f6f7033da5d1a2cdc31e88c74b3ca4e6d rule=A51 version=v3 | A1 PASS | A2 MISS nonce-not-distinct | A2c MISS run exit=0 last="RECEIPT: VALID" | A3 MISS exit=0 last="RECEIPT: VALID" | A3c MISS run exit=0 | A4 PASS | A4c MISS run exit=0 | A3d MISS run exit=0 | A5 PASS
exit=1
```

Byte-identical receipts (the literal lesson-M2 shape) read `held=3/9`, adding
`span=0s<300` and `sha-not-distinct`:

```
ATTEST51: ATTEST_UNMET held=3/9 checks=9 rev=30fa224be28b92e9dd05e773869c4c994e6698ef rule=A51 version=v3 | A1 PASS | A2 MISS nonce-not-distinct;span=0s<300 | A2c MISS ... 
exit=1
```

### Historical v2 counter (5 checks) — the `held=k/5` line

```
ATTEST51: ATTEST_UNMET held=3/5 checks=5 rev=5e0a2f9f6f7033da5d1a2cdc31e88c74b3ca4e6d rule=A51 | A1 PASS | A2 MISS nonce-not-distinct | A3 MISS exit=0 last="RECEIPT: VALID" | A4 PASS | A5 PASS
exit=1
```

Byte-identical variant: `ATTEST_UNMET held=3/5 ... A2 MISS nonce-not-distinct;span=0s<300 ...`.

**Control conclusion:** the mandated control reads UNMET, as required. It is not, however,
the check that catches it — see (3).

## (3) Attribution: what actually stops the mandated control

| Arm | Mandated control | Why |
|---|---|---|
| A1 | **PASS** | A1 is `exit 0` + `/ATTEST_SELFTEST: PASS/` on the last line. A print-stub clears it. |
| A2 | MISS `nonce-not-distinct` | **The only arm that fired.** The counter recomputes nonce distinctness itself from the receipt bytes, independent of the tool. |
| A4 | **PASS** | With three *identical* nonces and a print-stub, A4 passed. A4's ledger verdict is the tool's own claim; the counter does not independently detect the reuse. The prior-corpus sweep also passed (`prior-files=1`). |

So `plan.md`'s superseded claim that "a stub script printing verdict strings cannot clear A1 …
nor A3" is false at A1 for every variant tested (A1 PASS in all six lanes, including the pure
print-stub). This is consistent with `w1/CritC1.md` and `w1/RevCounterA.md` (F-A), and with
addendum item 3 which already records the falsification.

Once the forger stops reusing nonces (C2: distinct nonces, still a pure print-stub) **A2 also
clears**, and against v2 the remaining obstacle was A3 alone:

```
[historical v2] C2-distinct-nonce-static-stub:
ATTEST51: ATTEST_UNMET held=4/5 checks=5 ... | A1 PASS | A2 PASS | A3 MISS exit=0 last="RECEIPT: VALID" | A4 PASS | A5 PASS
exit=1
```

Keying the printed verdict on the filename (`… if (target.includes('replayed')) TAMPERED`) —
still zero hashing, zero digest, zero sidecar comparison, zero ledger — clears A3:

```
[historical v2] C3-filename-keyed-stub:
ATTEST51: ATTEST_HELD held=5/5 checks=5 rev=5eb93adb66988e032db2f25d74f8320a89fa811e rule=A51 | A1 PASS | A2 PASS | A3 PASS | A4 PASS | A5 PASS
exit=0
```

**That is a kill-rule hole in the v2 counter: `ATTEST_HELD held=5/5`, exit 0, for a lane whose
`receipt-attest.mjs` contains no verification logic.** Bypass mechanism, precisely: (i) A1/A3
read only the tool's printed verdict, (ii) A2's remaining invariants (distinct nonces, distinct
file hashes, ≥300 s span) are properties the forger writes into the receipt files themselves,
(iii) A4 delegates the ledger verdict to the same untrusted tool, (iv) A5's proxy arm executes
the *scored tree's own* `scripts/proxy-check.mjs`, which the forger supplies.

This is the same result independently reached by `w1/RevCounterA.md` (F-A, forger rev `9cb611b7`,
`held=5/5`) and is the finding addendum item 3 accepts. I reproduce it here from a committed
scratch lane built by an independent builder, which is the item's required control shape.

## (4) CRITICAL — the CURRENT counter (9 checks) still reads `ATTEST_HELD` for a forger that never executes a command

The current counter's new arms were added so that "no print-stub can satisfy them without
actually running commands and hashing their output" (`plan.md:181-186`). I built a forger that
keeps the receipt *format* faithful — canonical sorted-key JSON, inner digest over the body
minus `digest`, GNU sidecar over the exact bytes, nonce uniqueness, ledger nonce-vs-digest
comparison — but **never spawns a process**. Its stdout hash is synthesized from the last argv
element (`stdout_sha256 = sha256(argv[last])`), which is exactly the command's real output for
the counter's own challenge command.

Grep evidence that it executes nothing:

```
$ grep -n "spawn\|execSync\|exec(" .../scripts/receipt-attest.mjs
NO SPAWN: forger never executes any command
$ grep -n stdoutSha .../scripts/receipt-attest.mjs
51:  const stdoutSha = cmdArgs.length ? sha(Buffer.from(cmdArgs[cmdArgs.length - 1], 'utf8')) : sha(Buffer.from('', 'utf8'));
```

Result against the **current frozen counter**:

```
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=15a7cee5bf632ec39e3a3c70df1dad583ad1d199 rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
exit=0
```

Against the same counter the **honest implementation** (`.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs`,
run for real on three genuinely-spaced invocations) reads:

```
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=f5a222b6ce6f11d66985f0215af24d2787a59886 rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 MISS pin match;proxy exit=1 Node.js v24.21.0
exit=1
```

Its single MISS is A5's proxy arm, which cannot pass in a partial scratch tree because the real
`proxy-check.mjs` fail-closes on a tree without the whole scorecard/corpus — a scratch-harness
artifact, not an instrument defect. **The forged lane therefore scores strictly higher (9/9,
HELD) than the genuine implementation (8/9).**

### Bypass mechanism (isolated)

A2c's decisive predicate is
`outOk = j.stdout_sha256 === sha256(nonce)`, and the probe's challenge command is
`/usr/bin/printf %s <nonce>` — whose stdout **is** the last argv element. So

1. the probe-issued nonce is handed to the tool *inside argv*,
2. the command's true stdout is a pure function of that argv,
3. a forger that hashes its own argv tail produces the exact value the probe expects, without
   ever running the command.

Confirmation that the arm is satisfied by argv-derivability and not by execution — the same
forger hashing the **first** argv element instead:

```
ATTEST51: ATTEST_UNMET held=8/9 ... | A2c MISS argvOk=true outOk=false validOk=true sideOk=true | ...
exit=1
```

`validOk=true` and `sideOk=true` in both cases: the format is honest, only the derivation of
the hash differs. A2c therefore proves *hash shape*, not invocation. The three committed
receipts in the forged lane were likewise hand-authored by the builder, never produced by `run`,
and A2 accepted them.

### Minimal fix, validated end-to-end

Deliver the challenge input **out of band** (stdin), have the **probe** run the same command
itself and compare against its own captured stdout, and amend the contract so `run` forwards
its own stdin to the child. Candidate patch:
`build/ExecForgerControl/probe-A2c-stdin-fix.candidate.mjs` (A2c uses `/bin/cat`, nonce on
stdin, `outOk` compares the receipt hash to the probe's own `/bin/cat` output; `argvOk` checks
the command path). Measured with an honest tool carrying the one-line stdin-forwarding change
(`stdio: ['inherit','pipe','pipe']`):

```
[forger, never executes]  A2c MISS argvOk=true outOk=false validOk=true sideOk=true   -> UNMET
[honest + stdin]          ATTEST51: ATTEST_UNMET held=8/9 ... A2c PASS ... A5 MISS (scratch) -> A2c discriminates
```

The fix restores discrimination at A2c: honest passes, fabricating forger fails. It is a
candidate for L1 adjudication, not an applied edit — the counter is frozen and I did not touch it.

## (5) Residual findings for the L1

1. **CRITICAL (above).** `ATTEST_HELD 9/9` is reachable by a lane that never executes a command,
   because A2c's challenge output is derivable from argv. Until fixed, a HELD reading is not
   evidence that the `run` half of the contract exists.
2. **HIGH — A1 has no kill rule.** A1 is exit status plus a substring on the last line. All six
   lanes (including the pure print-stub) scored A1 PASS. `plan.md`'s superseded
   "cannot clear A1 … from real execution" sentence should not be restated.
3. **HIGH — A4 cannot detect nonce reuse by itself.** With three identical nonces and a
   print-stub, A4 PASSED (`prior-files=1`). Reuse is caught only by A2's own distinctness
   arithmetic. A4's ledger arm is the tool's self-report.
4. **HIGH — A5's proxy arm executes the scored tree's `scripts/proxy-check.mjs`.** In C1–C3 a
   two-line forger-owned stand-in printed `PROXY: MATCH` and A5 passed. C4 (real proxy-check in
   the same scratch tree) reads `A5 MISS`, confirming the arm's verdict comes from the tree under
   test. Same boundary as `w1/RevCounterA.md` F-E.
5. **MEDIUM — the pin regex is unscoped.** `/pin\.receipt-attest=([0-9a-f]{64})/` matches
   anywhere in `SCORECARD.md`, not only inside the `kumitate-gate-pins-v1` block. My scratch
   scorecards exploit this by placing the line in a minimal block.

## (6) Limits of this control

- A5 was exercised with a forger-owned `proxy-check.mjs` in C1–C3 by necessity: a partial
  scratch tree cannot make the real proxy-check pass. C4 shows the honest-proxy behaviour in the
  same tree, so the A5 readings are attributable and not silent.
- The honest baseline's A5 MISS and (earlier, pre-spacing) A2 `span=0s<300` MISS are harness
  artifacts, reported as such; the three committed honest receipts were ultimately produced by
  three **real** invocations of the honest tool with the author-scheduled ≥300 s spacing that
  `plan.md` limits (b) declares. The spacing was realized with a per-process clock-offset
  preload (`build/ExecForgerControl/fakeclock.cjs`); the receipts themselves are genuine `run`
  output, and this is exactly the author-scheduling that limit (b) already concedes.
- Not verified here: the real lane's integration, D51/`DOCTRINE_HELD`, and the close-commit harm
  battery. Nothing was installed or upgraded (node v24.21.0, git 2.56.0 used as found).

## (7) Reproducibility

Artifacts in `.ufo/waves/round-51/build/ExecForgerControl/`:

| File | sha256 |
|---|---|
| `build-control-variants.mjs` | `4d0f138aca17ace9cda9f90b88d557a308545b4be8baef3319e83aa08992db38` |
| `build-f1-argv-hashing-forger.mjs` | `07a5d1aaa0d7d5884d4b55cf051e1bd55e3597f2fca777cff12ae1803bf0ca96` |
| `build-honest-baseline.mjs` | `30180ba3df553cbfb4d56861c0cc5a5d3eaf304269c290a99db6f35fa18e94c8` |
| `probe-A2c-stdin-fix.candidate.mjs` | `f97945ab954263d23fddf4e6604154a591dd88b3564afcf7331b74b43e7000b8` |
| `fakeclock.cjs` | `f7eba75bf0892661a88e321aef7a05602ce9401c11e22bfc6f1390310041617c` |
| `transcript-v3r6.txt` | verbatim current-counter runs (7 lanes) |
| `transcript-v2-historical.txt` | verbatim v2-counter runs (4 lanes) |

Committed scratch lanes under `.../build/ExecForgerControl/lanes/`: `C1-identical-nonce-distinct-bytes`,
`C2-distinct-nonce-static-stub`, `C3-filename-keyed-stub`, `F1-argv-hashing-forger`,
`honest-baseline` (each a self-contained git repo; replay with the counter and its own HEAD rev).

Stub/forger identities: C1/C2 stub `7340632f…9baf4`; C3/C4 filename-keyed `d97bf63e…11452`;
F1 forger `e7b8d77e…05667`; honest tool `44919763…48e8d9`.
