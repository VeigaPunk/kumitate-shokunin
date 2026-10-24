# MutInstrument — literal-mutant battery for `scripts/receipt-attest.mjs`

Seat `kumitate-r51.ObligedNarwhal` · mutation-tester · round 51 wave 1 · 2026-10-23

Axes: **operability** (does the shipped `--selftest` actually detect a weakened instrument?)
and **coverage** (which contract sites have no killing case at all).

---

## 0. Target, and why it is a scratch copy

`build/ExecInstrument/receipt-attest.mjs` **did not exist** when this seat ran (checked
repeatedly between 22:59 and 23:24 UTC; the directory `build/ExecInstrument/` was still
absent at the last check). Per the item's own escape clause — "the deliverable at
build/ExecInstrument/receipt-attest.mjs, or your own scratch copy if absent" — this seat
built a contract-faithful reference implementation in scratch and ran the battery against
it.

The battery is therefore delivered **contract-anchored, not author-anchored**: every mutant
is specified by a regex/applier that recognises the *contract site*, so the same battery runs
unchanged against whatever ExecInstrument ships. It was validated against **two**
independently written implementations (§4, §5), which is what makes it transferable.

| artifact | path (delivered for L1) | sha256 |
|---|---|---|
| reference implementation | `build/MutInstrument/reference-receipt-attest.mjs` | `d3936c9537b1573bbfaa132f55b1f498a68999e3737ceb83cd22b0192a9507e6` |
| portable battery (32 mutants) | `build/MutInstrument/portable-battery.mjs` | see `build/MutInstrument/` |
| survivor gap demo | `build/MutInstrument/gap-demo.mjs` | " |
| frozen-counter harness | `build/MutInstrument/counter-probe.sh` | " |
| faked-clock preload (A2 ≥300 s) | `build/MutInstrument/fake-clock.mjs` | " |
| transcripts | `battery-own-impl.txt`, `counter-own.txt`, `counter-peer.txt`, `own-results.json`, `peer-results.json`, `peer-gap-demo.json` | " |

Implementation sha256 pins used throughout:

* reference (this seat): `d3936c9537b1573bbfaa132f55b1f498a68999e3737ceb83cd22b0192a9507e6`
* peer scratch (`build/ExecSelftestArms/scratch/receipt-attest.mjs`, written by another seat):
  `f39c6b51f137ac8cdd94eda439a82bb4cbab8c53a719cc1282f73ea179677ff4`

---

## 1. Detector design — two arms, because one is not enough

A mutant is scored by **two independent arms**. A mutant is only called a *survivor* if it
defeats **both**.

**Arm 1 — the candidate's own `--selftest`** (the shipped hermetic suite). This is the arm
the item names, and it measures the suite's discriminating power.

**Arm 2 — the contract's semantics, exercised through the CLI.** Re-implemented inline from
`plan.md` §C1 and `probe/attest51-probe.mjs`:

| sub-arm | artifact | required reading |
|---|---|---|
| VALID | a genuine receipt | `RECEIPT: VALID`, exit 0 |
| TAMPERED | genuine receipt, **only** the `run-at:` prelude rewritten, sidecar copied untouched (the lesson‑M2 forgery) | `RECEIPT: TAMPERED`, exit 1 |
| REPLAY | genuine receipt with the inner digest broken, sidecar regenerated (flake injection) | `RECEIPT: REPLAY`, exit 1 |
| LEDGER (A4) | three genuine receipts **plus the doctored control in the same directory**, each genuine receipt verified with `--ledger <dir>` | `RECEIPT: VALID`, exit 0 |
| A4c | same-nonce / **different-digest** twin, digest + sidecar recomputed | twin VALID alone; ledger over `{original, twin}` answers `REPLAY` for **both** |

Arm 2 exists because of a measured defect (§3, finding F‑2): a verdict-literal typo leaves a
selftest green when the selftest compares against the *same literal* the implementation
emits. Arm 2 greps the contract's literals independently and catches it.

**Verdict vocabulary**

* `KILLED` — at least one arm reads red for the mutant.
* `SURVIVED` — both arms stay green. This is a **coverage finding**, not a licence to change
  the contract.
* `DRIFT` — the mutant crashed the candidate (no clean verdict).
* `NOT-APPL` — the contract site is absent in that implementation. Never counted as killed
  or survived.

A **RED BASELINE makes arm readings inconclusive**, and is reported as such (it happened for
the peer implementation, §5).

---

## 2. Baseline (pristine, both arms green)

```
CANDIDATE /tmp/mut-instr/pristine/receipt-attest.mjs
sha256 d3936c9537b1573bbfaa132f55b1f498a68999e3737ceb83cd22b0192a9507e6
BASELINE arm1(selftest) exit=0 last="ATTEST_SELFTEST: PASS"
BASELINE arm2(contract) ok=true VALID/TAMPERED/REPLAY/LEDGER/A4c semantics hold
```

The pristine reference additionally clears **7 of 8 arms of the real frozen counter**
(A5 misses only because a scratch lane has no live origin checkout / `proxy-check`):

```
ATTEST51: ATTEST_UNMET held=7/8 checks=8 rule=A51 version=v3 |
  A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A5 MISS
```

Run with `build/MutInstrument/counter-probe.sh <candidate.mjs> <workdir>`.

---

## 3. Round 1 — the battery against the un-strengthened suite

Command:

```sh
node portable-battery.mjs pristine/receipt-attest.mjs mutants-run-v1
```

Result on the **first** version of this seat's reference implementation (22 selftest cases):
**22 killed / 5 survived / 0 drift**.

The 5 survivors were genuine gaps in that selftest, each closed by adding a case:

| survivor | what the suite missed | case added to close it |
|---|---|---|
| `M08-digest-sha1` | nothing asserted the digest is *sha256* (64 hex); sha1 is self-consistent on both sides | `digest-is-sha256-width` |
| `M11-sidecar-compare-first-16-hex` | every corrupted sidecar differed in the **first** 16 hex chars, so a prefix-only compare still looked correct | `sidecar-prefix-collision-tampered` (sidecar shares the first 16 hex, differs after) |
| `M14-nonce-prefix-8` | the two fixture nonces differed within the compared slice, so a truncated compare was never exercised | `nonce-prefix-not-reuse` + `nonce-suffix-not-reuse` |
| `M26-nonce-fixed` | nonces were only ever hand-written into fixtures; no case actually **ran** the tool twice | `runs-mint-distinct-128-bit-nonces` (two real `run` invocations) |
| `M27-nonce-64-bits` | same — nonce *width* was never checked on a real run | same case (asserts `/^[0-9a-f]{32}$/`) |

After adding those cases the same battery read **27 killed / 0 survived**. Every survivor in
this report is therefore accompanied by the case that kills it — a survivor without one is
reported as an open finding, not silently accepted.

---

## 4. Round 2 — the battery on the reference implementation (all mutants run)

Command:

```sh
node portable-battery.mjs build/MutInstrument/reference-receipt-attest.mjs FINAL-OWN
```

**Result: 32 mutants, 32 killed, 0 survived, 0 drift, 0 not-applicable; 32/32 restored.**

`SITES ARE: D = digest · S = sidecar · N = nonce · V = verdict · C = clock`

| id | site | mutant (single literal / single site) | verdict | killing case(s) |
|---|---|---|---|---|
| D01 | digest | the inner digest stops binding the **nonce** | KILLED | `digest-binds-nonce`, `no-env-in-receipt` |
| D02 | digest | the inner digest stops binding the **exit code** | KILLED | `digest-binds-exit`, `ledger-nonce-reuse-replay`, `cli-verify-replay` |
| D03 | digest | the inner digest stops binding **stdout_sha256** | KILLED | `digest-binds-stdout`, `no-env-in-receipt` |
| D04 | digest | the inner digest stops binding **stderr_sha256** | KILLED | `digest-binds-stderr`, `no-env-in-receipt` |
| D05 | digest | the inner digest stops binding the **wall clocks** | KILLED | `digest-binds-wall-start`, `flake-injection-replay` |
| D06 | digest | the inner digest stops binding **argv** | KILLED | `digest-binds-argv`, `twin-ledger-replay-both` |
| D07 | digest | the inner digest stops binding the **monotonic span** | KILLED | `digest-binds-mono` |
| D08 | digest | the digest is computed over the object **including its own `digest` field** | KILLED | whole suite red (`exit=1`; `roundtrip-valid` first) |
| D09 | digest | **canonical JSON stops sorting keys** | KILLED | `canonical-json-sorted` |
| D10 | digest | the inner digest uses **sha1** instead of sha256 | KILLED | `digest-is-sha256-width`, `sidecar-gnu-format` |
| D11 | digest | the digest comparison is **inverted** (`!==` → `==`) | KILLED | 21 cases (`roundtrip-valid` first) |
| S01 | sidecar | the sidecar hash comparison is **removed** | KILLED | `sidecar-mismatch-tampered`, `prelude-only-forgery-tampered`, `cli-verify-tampered` |
| S02 | sidecar | the sidecar hash is compared on a **truncated prefix** | KILLED | `sidecar-prefix-collision-tampered` + 9 more |
| S03 | sidecar | a **missing sidecar** is treated as VALID | KILLED | `sidecar-missing-tampered` |
| S04 | sidecar | the sidecar covers the **body line only** (prelude uncovered) | KILLED | `prelude-only-forgery-tampered`, `sidecar-gnu-format` |
| N01 | nonce | the ledger nonce comparison is **inverted** | KILLED | `ledger-distinct-valid`, `ledger-same-digest-exempt`, `nonce-*-not-reuse` |
| N02 | nonce | the ledger comparison is truncated to a **prefix** | KILLED | `ledger-nonce-reuse-replay`, `twin-ledger-replay-both` |
| N03 | nonce | the ledger compares the **digest** instead of the nonce | KILLED | whole suite red (`exit=1`) |
| N04 | nonce | the **ledger walk is skipped** entirely | KILLED | `ledger-nonce-reuse-replay`, `cli-ledger-replay`, `ledger-nonce-reuse-forgery-replay` |
| N05 | nonce | the nonce is a **fixed constant** | KILLED | `runs-mint-distinct-128-bit-nonces` |
| N06 | nonce | the nonce is **truncated to 64 bits** | KILLED | `runs-mint-distinct-128-bit-nonces` |
| N07 | nonce | the ledger compares only the **last 8 hex chars** | KILLED | `nonce-suffix-not-reuse`, `ledger-nonce-reuse-replay` |
| N08 | nonce | **the ledger loses the same-digest exemption** (the literal "reject a nonce already present" reading) | KILLED | `ledger-same-digest-exempt`; arm 2 LEDGER red on all three receipts |
| N09 | nonce | the ledger **exempts every** nonce match (digest distinction dropped) | KILLED | `ledger-nonce-reuse-replay`, `twin-ledger-replay-both`; arm 2 A4c red |
| V01 | verdict | the **TAMPERED** verdict literal is misspelled | KILLED | arm 2 only: `TAMPERED → "RECEIPT: TAMPER"` |
| V02 | verdict | the **REPLAY** verdict literal is misspelled | KILLED | arm 2 only: `REPLAY → "RECEIPT: REPL"` |
| V03 | verdict | the **VALID** literal carries a trailing space | KILLED | `cli-verify-valid` |
| V04 | verdict | a **sidecar mismatch is reported as REPLAY** | KILLED | `sidecar-mismatch-tampered`, `prelude-only-forgery-tampered`, `cli-verify-tampered` |
| V05 | verdict | a **finding verdict exits 0** | KILLED | 21 cases; arm 2 `TAMPERED`/`REPLAY` exit 0 |
| V06 | verdict | a **VALID receipt exits 1** | KILLED | `roundtrip-valid`, `cli-verify-valid`; arm 2 VALID/LEDGER red |
| C01 | clock | the **wall-clock ordering test is inverted** | KILLED | `clock-order-violation-replay`, `roundtrip-valid` |
| C02 | clock | the **negative monotonic span is accepted** | KILLED | `mono-negative-replay` |

Coverage of the four sites the item names: **digest 11 mutants, sidecar 4, nonce 9,
verdict 6**, plus clock 2 — 32 total, all single-literal/single-site.

---

## 5. Round 3 — the same battery against a second, independent implementation

The peer implementation at `build/ExecSelftestArms/scratch/receipt-attest.mjs`
(`f39c6b51…`, 12 selftest cases, written by a different seat from a different design) was run
through the identical battery.

**Baseline: arm 1 green, arm 2 RED.**

```
BASELINE arm1(selftest) exit=0 last="ATTEST_SELFTEST: PASS"
BASELINE arm2(contract) ok=false LEDGER attest-run-1 exit=1 last="RECEIPT: REPLAY"; …
BASELINE-RED: at least one arm is not green; readings for that arm are INCONCLUSIVE.
```

The peer **natively fails A4** — see finding F‑1. Arm‑2 readings for the peer are therefore
not evidence; the table below is **arm‑1 only** (the peer's own selftest).

**Result (arm 1 only): 20 killed / 10 survived / 0 drift / 2 not-applicable.**

| id | site | arm-1 verdict | killing case (peer's own suite) |
|---|---|---|---|
| D01 | digest | KILLED | `flake-injection-replay` |
| D02 | digest | **SURVIVED** | — |
| D03 | digest | **SURVIVED** | — |
| D04 | digest | **SURVIVED** | — |
| D05 | digest | **SURVIVED** | — |
| D06 | digest | **SURVIVED** | — |
| D07 | digest | **SURVIVED** | — |
| D08 | digest | KILLED | `healthy-run-valid`, `ledger-distinct-valid` |
| D09 | digest | KILLED | `canonical-json-sorted` |
| D10 | digest | KILLED | `sidecar-gnu-format` |
| D11 | digest | KILLED | `healthy-run-valid`, `flake-injection-replay` |
| S01 | sidecar | KILLED | `sidecar-mismatch-tampered`, `prelude-rewrite-tampered` |
| S02 | sidecar | KILLED | `healthy-run-valid`, `ledger-distinct-valid` |
| S03 | sidecar | **SURVIVED** | — |
| S04 | sidecar | KILLED | 10 of 12 cases |
| N01 | nonce | KILLED | `ledger-distinct-valid` |
| N02 | nonce | KILLED | `ledger-nonce-reuse-replay` |
| N03 | nonce | KILLED | whole suite (`exit=1`) |
| N04 | nonce | KILLED | `ledger-nonce-reuse-replay` |
| N05 | nonce | KILLED | `distinct-nonces` |
| N06 | nonce | **SURVIVED** | — |
| N07 | nonce | KILLED | `ledger-nonce-reuse-replay` |
| N08 | nonce | NOT-APPL | site absent — the implementation has **no exemption to lose** (this *is* F‑1) |
| N09 | nonce | NOT-APPL | site absent (same reason) |
| V01 | verdict | KILLED | `sidecar-mismatch-tampered`, `prelude-rewrite-tampered` |
| V02 | verdict | KILLED | `flake-injection-replay`, `ledger-nonce-reuse-replay` |
| V03 | verdict | **SURVIVED** | — |
| V04 | verdict | KILLED | `sidecar-mismatch-tampered`, `prelude-rewrite-tampered` |
| V05 | verdict | KILLED | 4 cases |
| V06 | verdict | KILLED | `healthy-run-valid`, `ledger-distinct-valid` |
| C01 | clock | KILLED | `healthy-run-valid`, `ledger-distinct-valid` |
| C02 | clock | **SURVIVED** | — |

### 5.1 The 10 survivors, demonstrated with real adversarial artifacts

Each survivor was driven with the artifact the mutant accepts
(`build/MutInstrument/gap-demo.mjs`; transcript `peer-gap-demo.json`). "verdict" below is the
**mutated script's** answer to a forged receipt:

| # | survivor | adversarial artifact | mutant answers | contract requires | class |
|---|---|---|---|---|---|
| 1 | D02 | `exit` rewritten `7 → 42`, digest re-derived, sidecar regenerated | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 2 | D03 | `stdout_sha256` rewritten to a fabricated hash | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 3 | D04 | `stderr_sha256` rewritten | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 4 | D05 | receipt **re-dated to 2020‑01‑01** (`wall_start`/`wall_end` rewritten) | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** — the lesson‑M2 forgery, moved inside the JSON body |
| 5 | D06 | `argv` rewritten to `["/bin/false"]` | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 6 | D07 | `mono_ns` rewritten to `999` | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 7 | S03 | **the sidecar file deleted** | `RECEIPT: VALID` exit 0 | `TAMPERED` exit 1 | **integrity hole** — the sidecar is the only layer covering the prelude |
| 8 | C02 | `mono_ns = -5` (time running backwards), digest + sidecar recomputed | `RECEIPT: VALID` exit 0 | `REPLAY` exit 1 | **integrity hole** |
| 9 | N06 | nonce field is **16 hex chars** (64 bits) | `RECEIPT: VALID` exit 0 | 32 hex (128 bits) | entropy weakness (birthday ≈ 2³² receipts) |
| 10 | V03 | VALID literal carries a trailing space | `"RECEIPT: VALID "` exit 0 | — | **benign**: the counter greps `/RECEIPT: VALID/`, a regex that still matches |

**Root cause of 1–8:** the peer's `--selftest` has exactly **one** digest-binding case
(`flake-injection-replay`, which doctors the *nonce* only) and **no** case that deletes the
sidecar or that recomputes a digest after doctoring a *different* field. One representative
per binding mechanism is not coverage: a suite that binds the nonce and nothing else leaves
`exit`, `argv`, both output hashes, both wall clocks and `mono_ns` unverified.

**Caveat on 1–8:** these are **selftest coverage holes**, not defects in the peer's
implementation as delivered — unmutated, it does bind every field (it projects `{...obj}`
minus `digest`). The finding is that its selftest **cannot tell** a correctly-binding
implementation from one that binds one field. That is precisely the property the round
claims when it says the suite is the machine-check.

---

## 6. Findings

### F‑1 (HIGH, against the currently available implementation) — the peer scratch implementation fails frozen arm A4

Running the **real frozen counter** against the peer implementation:

```sh
bash build/MutInstrument/counter-probe.sh \
  build/ExecSelftestArms/scratch/receipt-attest.mjs /tmp/cp-peer
```

```
ATTEST51: ATTEST_UNMET held=6/8 checks=8 rule=A51 version=v3 |
  A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 MISS
  attest-run-2.txt:ledger exit=1 RECEIPT: REPLAY | A4c PASS | A5 MISS
```

Mechanism, reproduced directly:

```
attest-run-2.txt          nonce = 9c27f0bd4a58d96ce7eef231c8a8f1e9
attest-run-2-replayed.txt nonce = 9c27f0bd4a58d96ce7eef231c8a8f1e9   ← the A3 doctored control

$ node scripts/receipt-attest.mjs verify --ledger <receipts-dir> <receipts-dir>/attest-run-2.txt
RECEIPT: REPLAY
exit=1
```

The A3 doctored control is a copy of run‑2 with the `run-at:` prelude rewritten, and it
**carries run‑2's exact nonce** while sitting in the **same directory** A4's ledger arm
scans. Under the plan's §C1 wording ("rejects a nonce already present") A4 is unsatisfiable.
The plan already records this resolution as finding **F1 of `RevInstrumentContract`**
(`plan.md:184–191`, "Clarified contract: the `--ledger` arm flags a nonce only when another
receipt file binds the SAME nonce to a DIFFERENT record digest; … byte-identical duplicates
(same digest) are exempt"), but **`plan.md` §C1 body text at line 34–37 still carries the old
literal wording** and does not mention the exemption.

*Proposed minimal fix (L1 adjudicates; this seat does not edit frozen files):* add one
sentence to §C1's `verify` bullet — "a nonce match is a REPLAY only when the other file's
`digest` differs; identical duplicates are exempt" — so an implementer reading only §C1
cannot build the unpassable version. The counters need no change; the implementation must
carry the exemption (`build/MutInstrument/reference-receipt-attest.mjs` lines 123–136
implement it and score `A4 PASS`).

### F‑2 (MEDIUM, battery design) — a verdict-literal typo is invisible to a selftest that compares against the same literal

Mutants V01 (`TAMPERED` → `TAMPER`) and V02 (`REPLAY` → `REPL`) **survived arm 1** on the
reference implementation and are still green on the un-strengthened suite, because those
suites assert `stdout === 'RECEIPT: REPLAY'` using the **same literal the implementation
emits**. Mutating the literal mutates the expectation too. Only arm 2 (which greps the
contract's literals independently) catches them.

*Consequence for the shipped instrument:* its `--selftest` alone cannot be the machine-check
for verdict spelling; the frozen counter's A2/A3/A4c greps are what actually pin the strings.
A selftest should compare against literals written **independently** of the emitted constants.

### F‑3 (INFO, process) — the "FROZEN" counter moved three times during this seat's run

| observed at | `attest51-probe.mjs` sha256 | check count | note |
|---|---|---|---|
| ~23:02 UTC | not recorded | **7** | v3 with A2c/A3c; no A4c yet |
| ~23:05 UTC | `1e5fb6632f9da5c8…` | **8** | A4c added (freeze repair 5, `4b8da21`) |
| ~23:16 UTC | `f3169a676ede4265…` | **8** | current; same arms, body/comment changes |

`plan.md` moved too (`a5c5b284…` at last read, with a five-item "freeze repairs" addendum).
The repairs are legitimate and documented, but a seat that measures a *rate* against a
moving counter measures the counter's revision, not the instrument. Recording the observed
hashes is the mitigation; wave‑2 seats should pin the counter hash in their transcripts.

### F‑4 (INFO, battery design) — prefix/suffix nonce truncation over-rejects, it does not under-reject

Worth stating explicitly because it is easy to get backwards: comparing only the first (or
last) 8 hex chars of a nonce flags *more* pairs as reuse, never fewer — a genuine reuse is
always caught. The defect class is **false positives** (a legitimate receipt rejected at
~2³² birthday bound), not forgery acceptance. The forgery-acceptance direction belongs to
mutants N03 (compare the digest instead of the nonce) and N08/N09 (the exemption), which is
why those were added.

---

## 7. Restoration evidence

Every mutant was applied to a scratch copy, never to a sibling's source. The harness restores
the exact pristine bytes and re-hashes after each mutant:

```
total=32 killed=32 survived=0 drift=0 not-applicable=0
restore_check: 32/32 mutants restored to the pristine sha256
```

For the peer implementation:

```
total=32 killed=30 survived=0 drift=0 not-applicable=2   (arm-2 aggregate; arm 1 = 20/10/2)
restore_check: 30/30 mutants restored to the pristine sha256
```

Restoration is a byte-equality check against the pristine sha256
(`d3936c95…` / `f39c6b51…`), not a `git` state check — the peer artifact under
`build/ExecSelftestArms/` is unchanged.

---

## 8. What the L1 should run against the shipped instrument

Once `build/ExecInstrument/receipt-attest.mjs` lands, two commands settle the coverage
question for C1:

```sh
# 1. the portable battery (contract-anchored; reports NOT-APPL for any site the
#    shipped implementation expresses differently, never a silent pass)
node .ufo/waves/round-51/build/MutInstrument/portable-battery.mjs \
     .ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs /tmp/battery-shipped

# 2. the frozen counter against the real lane
node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
```

Gate to carry into A/C accounting: **0 survivors from arm 1**, and **A4 PASS** (the
same-digest exemption present). If the shipped `--selftest` reproduces the peer's 10
survivors, the suite satisfies the plan's "≥10 cases" arithmetic while binding only one
semantic field — the count is met, the property is not.

## 9. Limits of this seat's evidence

* The reference implementation is **this seat's** reading of the v3/amended contract, not the
  shipped artifact. Its `--selftest` is a strengthened suite offered as a **reference for the
  cases to include**, not as a claim about the shipped file.
* A5 was never scored: a scratch lane has no live origin checkout, so
  `proxy-check.mjs --strict` cannot match. All A5 readings are `MISS` by construction and are
  not evidence about any instrument.
* Arm 2 is a re-implementation of the counter's semantics, not the counter itself. §6 F‑1 was
  confirmed against the **real** counter as well, so that finding stands on the counter's own
  output.
* No tool installs or upgrades were made during this seat's run.
