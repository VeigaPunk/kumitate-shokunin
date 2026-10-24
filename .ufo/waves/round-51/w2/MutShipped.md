# MutShipped — the wave-1 mutant battery replayed against the **shipped** `scripts/receipt-attest.mjs`

Seat `kumitate-r51.ActiveSnail` · mutation-tester · round 51 wave 2 · 2026-10-23

Target: `scripts/receipt-attest.mjs`, sha256
`44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (808 lines).
Read-only: the file was never written; every mutant was applied to a `/tmp` scratch copy.

Axes: **operability** (does the shipped `--selftest` detect a weakened instrument?) and
**coverage** (which contract sites have no killing case at all?).

---

## 0. Headline

| | |
|---|---|
| wave-1 battery replayed **verbatim** against the shipped file | **18 killed / 1 survived / 13 NOT-APPL** — the audit in §4 shows **4 of the 18 "kills" are false kills** (V01, V02, V03 mutate only the suite's assertion strings; S01 is a syntax-error crash) and **2 more kill at the wrong site** (D11, S02 hit the *ledger helper's* checks, not the verify path's); the lone "survivor" D07 is a behavioural no-op |
| the same 32 mutants **re-anchored on the shipped idioms** | **31 killed / 3 survived / 0 NOT-APPL** (34 mutants incl. 2 extensions) |
| survivors | **S02** (sidecar hash compared on a truncated prefix), **N02** (ledger nonce prefix), **N07** (ledger nonce suffix) |
| severity of the worst survivor | **MEDIUM–HIGH** — S02 is a *forgery-acceptance* hole in the class; at 4 hex the forgery is **practical** (87 055 grind attempts, 313 ms, demonstrated) |
| the frozen counter (A1–A4c) | **blind to all three survivors** — every A-arm still reads PASS on the mutant (§5) |

**The shipped instrument is not defective.** Every survivor is a *coverage* finding about the
shipped `--selftest` (and, downstream, about the frozen counter), not a defect in the shipped
bytes: the shipped code compares the full 64-hex sidecar hash and the full 32-hex nonce.

**No tool installs or upgrades were made during this seat's run.**

---

## 1. What was replayed, and the first result

The wave-1 deliverable is `build/MutInstrument/portable-battery.mjs` (32 mutants). Replayed
verbatim against the shipped instrument:

```sh
node .ufo/waves/round-51/build/MutInstrument/portable-battery.mjs \
     scripts/receipt-attest.mjs /tmp/mutshipped/battery-shipped
```

Transcript: `MutShipped-w2-battery-run.txt`.

```
CANDIDATE .../scripts/receipt-attest.mjs
sha256 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
BASELINE arm1(selftest) exit=0 last="ATTEST_SELFTEST: PASS"
BASELINE arm2(contract) ok=true VALID/TAMPERED/REPLAY/LEDGER/A4c semantics hold
...
D07	digest	SURVIVED	both arms green
S02	sidecar	SURVIVED	both arms green
N02	nonce	SURVIVED	both arms green
N07	nonce	SURVIVED	both arms green
S03,N01..N09,V04,C01,C02  NOT-APPL  (contract site not found)
total=32 killed=18 survived=1 drift=0 not-applicable=13
restore_check: 19/19 mutants restored to the pristine sha256
```

**The baseline is GREEN on both arms**, so every reading below is evidence, not an
inconclusive red baseline.

Two things jump out and both turned out to be load-bearing:

1. **13 of 32 mutants did not apply at all.** The wave-1 appliers were written against the
   *reference* implementation's variable names (`mono_ns`, `other.nonce`, `randomBytes(16)`,
   `existsSync` guard); the shipped file uses `mono_span_ms`, `state.nonce`,
   `randomBytes(NONCE_BYTES)`, and a `try/catch` around `readFileSync`. The battery is
   *contract-anchored in intent* but *lexically anchored in practice*.
2. **The single "survivor" D07 was a behavioural no-op.** The wave-1 D07 applier inserted
   `delete copy.mono_ns;` — a field the shipped record does not have. Deleting a non-existent
   property changes nothing.

### Proof A — wave-1's D07 is a no-op on the shipped file

```
== PROOF A: wave-1 D07 is a NO-OP (the shipped record has no mono_ns field) ==
pristine projection digest : 86342e14fb53c009648c67d0ef0f7cd5d6ecc725363f888e83c8f241d748790d
wave-1 D07 projection digest: 86342e14fb53c009648c67d0ef0f7cd5d6ecc725363f888e83c8f241d748790d
IDENTICAL (delete of a NON-EXISTENT field): true
shipped record fields: argv,exit,mono_span_ms,nonce,stderr_sha256,stdout_sha256,wall_end,wall_start
```

Transcript: `MutShipped-proofs.txt`.

---

## 2. The re-anchored battery (the real measurement)

Every one of the 32 wave-1 mutants was re-expressed against the **shipped** idioms, plus two
extensions that target sites the wave-1 table had no mutant for. Harness:
`/tmp/mutshipped/w2-battery.mjs`; results: `/tmp/mutshipped/w2run/w2-results.json`.

Two arms, exactly as wave-1 designed them:

* **Arm 1** — the candidate's own `--selftest` (the shipped 27-case hermetic suite).
* **Arm 2** — the contract's semantics through the CLI, with **independent** verdict literals
  (exact match on the *raw* last stdout line, no trimming), so a verdict-literal typo cannot
  hide behind a trimming reader.

| id | site | mutant | verdict | exact killing case(s) |
|---|---|---|---|---|
| D01 | digest | digest stops binding the **nonce** | KILLED | `inner-digest-covers-every-semantic-field` |
| D02 | digest | digest stops binding the **exit code** | KILLED | `flake-injection-doctored-body-reads-replay`, `inner-digest-covers-every-semantic-field` |
| D03 | digest | digest stops binding **stdout_sha256** | KILLED | `inner-digest-covers-every-semantic-field` |
| D04 | digest | digest stops binding **stderr_sha256** | KILLED | `inner-digest-covers-every-semantic-field` |
| D05 | digest | digest stops binding the **wall clocks** | KILLED | `inner-digest-covers-every-semantic-field` |
| D06 | digest | digest stops binding **argv** | KILLED | `inner-digest-covers-every-semantic-field` + 2 |
| D07 | digest | digest stops binding the **monotonic span** (`mono_span_ms`) | KILLED | `inner-digest-covers-every-semantic-field` (`mono_span_ms: exit 0 "RECEIPT: VALID"`) |
| D08 | digest | digest computed over the object **including its own `digest` field** | KILLED | whole suite red (11 cases) |
| D09 | digest | canonical JSON stops **sorting keys** | KILLED | `canonical-json-is-sorted-and-stable` |
| D10 | digest | inner digest uses **sha1** | KILLED | 18 cases (digest width) |
| D11 | digest | the digest comparison is **inverted** | KILLED | 14 cases incl. `digest-field-corrupted-with-recomputed-sidecar-reads-replay` |
| S01 | sidecar | the sidecar hash comparison is **removed** | KILLED | `sidecar-mismatch-reads-tampered` |
| **S02** | sidecar | the sidecar hash is compared on a **truncated prefix** | **SURVIVED** | — |
| S03 | sidecar | a **missing sidecar** is treated as VALID | KILLED | `missing-sidecar-reads-tampered` |
| S04 | sidecar | the sidecar covers the **body line only** (prelude uncovered) | KILLED | 5 cases incl. `sidecar-is-gnu-text-mode-basename` |
| N01 | nonce | the ledger nonce comparison is **inverted** | KILLED | `ledger-detects-a-nonce-reused-by-a-different-record` + 1 |
| **N02** | nonce | the ledger comparison is truncated to an **8-hex prefix** | **SURVIVED** | — |
| N03 | nonce | the ledger compares the **digest** instead of the nonce | KILLED | `ledger-detects-a-nonce-reused-by-a-different-record` + 2 |
| N04 | nonce | the **ledger walk is skipped** entirely | KILLED | `ledger-detects-a-nonce-reused-by-a-different-record` + 1 |
| N05 | nonce | the nonce is a **fixed constant** | KILLED | `nonce-is-128-bit-hex-and-unique-per-run` |
| N06 | nonce | the nonce is truncated to **32 bits** | KILLED | `nonce-is-128-bit-hex-and-unique-per-run` + 16 |
| **N07** | nonce | the ledger compares only the **last 8 hex chars** | **SURVIVED** | — |
| N08 | nonce | the ledger **loses the same-digest exemption** | KILLED | `ledger-exempt-a-byte-identical-duplicate` |
| N09 | nonce | the ledger **exempts every** nonce match | KILLED | `ledger-detects-a-nonce-reused-by-a-different-record` + 2 |
| V01 | verdict | the **TAMPERED** literal is misspelled (emission sites) | KILLED | 6 cases |
| V02 | verdict | the **REPLAY** literal is misspelled (emission sites) | KILLED | 5 cases |
| V03 | verdict | the **VALID** literal carries a trailing space (emission sites) | KILLED (arm 2 only) | arm 2: `VALID exit=0 last="RECEIPT: VALID "` |
| V04 | verdict | a **sidecar mismatch is reported as REPLAY** | KILLED | `sidecar-mismatch-reads-tampered`, `prelude-only-rewrite-reads-tampered` |
| V05 | verdict | a **finding verdict exits 0** | KILLED | 11 cases |
| V06 | verdict | a **VALID receipt exits 1** | KILLED | 5 cases |
| C01 | clock | the **wall-clock ordering test is inverted** | KILLED | 8 cases incl. `clock-order-violation-reads-tampered` |
| C02 | clock | the **negative monotonic span is accepted** | KILLED | `negative-monotonic-span-reads-tampered` |
| X01 | nonce | *extension*: nonce entropy drops to **32 bits** | KILLED | `nonce-is-128-bit-hex-and-unique-per-run` + 16 |
| X02 | nonce | *extension*: the ledger **inner-digest gate is inverted** | KILLED | `ledger-detects-a-nonce-reused-by-a-different-record` + 1 |

```
total=34 killed=31 survived=3 drift=0 not-applicable=0
restore_check: candidate sha256 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9 == pristine 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9 -> OK
```

Full per-mutant output: `MutShipped-w2-battery-run.txt`.
Exact failing-case names per mutant: `MutShipped-killing-cases.txt`.

### Notable: D07 is killed by the shipped suite

Correctly anchored (`delete copy.mono_span_ms;`), the shipped suite **does** catch the
monotonic-span binding, via `inner-digest-covers-every-semantic-field`:

```
D07  exit=1  failed=1  inner-digest-covers-every-semantic-field((mono_span_ms: exit 0 "RECEIPT: VALID"))
```

So the shipped suite's digest-binding coverage is **complete** over all eight semantic fields.
Wave-1's D07 "survivor" was an artefact of the lexical mismatch, not a gap in the shipped
suite.

### Notable: V03 is killed by arm 2 only

`out('RECEIPT: VALID\n')` → `out('RECEIPT: VALID \n')`. The shipped suite **passes** (27/27)
because its reader (`lastLine`) trims; the frozen counter's reader also trims
(`attest51-probe.mjs:93`), and its grep is a *substring* regex `/RECEIPT: VALID/`, so
`"RECEIPT: VALID "` still matches. Arm 2's exact-match reader catches it:

```
raw stdout last line = "RECEIPT: VALID "
probe lastLine = "RECEIPT: VALID"      <- trailing space trimmed away
probe regex /RECEIPT: VALID/ matches: true
```

This confirms wave-1's **F‑2** on the shipped bytes: *the verdict spelling is not pinned by
either the suite or the counter*. Severity **LOW** (the counter's regex still matches, so no
arm flips), but the contract's literal is unpinned.

---

## 3. The three survivors — adversarial artefacts and the missing killing case

Transcript: `MutShipped-survivor-demo.txt`. In each case the mutant is driven with the
artefact it *accepts*, and the missing selftest case is **injected into a copy of the mutant**
to prove (a) it turns the mutant red and (b) it does **not** turn the pristine red — i.e. the
case is correct, not a false positive.

### S02 — sidecar hash compared on a truncated prefix (MEDIUM–HIGH)

```
S02 ARTIFACT sidecar = 1338b41832d4d11c000000000000000000000000000000000000000000000000  prefix-collision.txt
S02 real receipt hash = 1338b41832d4d11c1dff7814545cc70e7da061190a72f256ab18a025ba9ad2f2
S02 MUTANT  exit=0 verdict="RECEIPT: VALID"
S02 PRISTINE exit=1 verdict="RECEIPT: TAMPERED"
S02 INJECTED-CASE selftest exit=1 failed=[sidecar-prefix-collision-reads-tampered] last=ATTEST_SELFTEST: FAIL
S02 INJECTED-CASE@PRISTINE selftest exit=0 failed=[] last=ATTEST_SELFTEST: PASS
```

**Why the shipped suite is blind.** Its only sidecar-tamper case
(`sidecar-mismatch-reads-tampered`, `scripts/receipt-attest.mjs:510-517`) flips **the first
nibble** of the sidecar hash:

```js
const flipped = side[0] === '0' ? '1' : '0';
```

A prefix comparison of *any* length ≥ 1 hex char still catches a first-nibble flip. The suite
therefore cannot distinguish a full comparison from a truncated one at all.

**This is not a theoretical weakness — the class is practical.** Truncating the comparison to
4 hex chars (16 bits) turns the sidecar into a forgeable token: the attacker keeps the
**genuine, unmodified** sidecar and grinds a doctored body until its sha256 shares that
16-bit prefix.

```
prefix=16	selftest=PASS (blind)	A3-pristine=RECEIPT: REPLAY	A3-mutant=RECEIPT: REPLAY
prefix=8 	selftest=PASS (blind)	A3-pristine=RECEIPT: REPLAY	A3-mutant=RECEIPT: REPLAY
prefix=4 	selftest=PASS (blind)	A3-pristine=RECEIPT: REPLAY	A3-mutant=RECEIPT: REPLAY
prefix=2 	selftest=PASS (blind)	A3-pristine=RECEIPT: REPLAY	A3-mutant=RECEIPT: REPLAY
prefix=1 	selftest=PASS (blind)	A3-pristine=RECEIPT: REPLAY	A3-mutant=RECEIPT: REPLAY

== PRACTICAL FORGERY against the prefix-4 mutant ==
target prefix=d7f6 sidecar kept = d7f6638b106f0fa2bcf70a2f3367bbe921b20c1a541a8cd2061e47200c6d249d  forge.txt
PRISTINE exit=1 verdict="RECEIPT: TAMPERED"
MUTANT   exit=0 verdict="RECEIPT: VALID"
```

Cost of the forgery, measured (`MutShipped-forgery-cost.txt`):

```
prefix-4 forgery: target=0bf6 tries=87055 wall=313ms
PRISTINE exit=1 "RECEIPT: TAMPERED"
MUTANT   exit=0 "RECEIPT: VALID"
sidecar kept UNCHANGED from the genuine receipt: 0bf628eae9ff50c49ff5d99e3b4e59694e99e774ae4a75c4fe6e0dc7ffd5d2fa  orig.txt
```

**87 055 attempts, 313 ms.** A fully attacker-controlled receipt body (arbitrary argv, exit
code, wall clocks), with the genuine sidecar untouched, verifies `RECEIPT: VALID` exit 0
against the truncated-compare mutant, while the pristine instrument correctly answers
`RECEIPT: TAMPERED` exit 1.

*Also note* the sidecar's **name** field is parsed but never checked against the receipt's
basename (`parseSidecar` returns `name`; `doVerify` ignores it). Not exploitable as shipped
(the hash covers the bytes), but it is a second unpinned field in the same layer.

### N02 / N07 — ledger nonce compared on a prefix / suffix (MEDIUM)

```
N02 a.nonce=bd20e1351f8a88e0304b30293545166a b.nonce=bd20e135f1ec5795c667df715494c13f distinct=true shared8=bd20e135
N02 MUTANT   exit=1 verdict="RECEIPT: REPLAY"
N02 PRISTINE exit=0 verdict="RECEIPT: VALID"
N02 INJECTED-CASE selftest exit=1 failed=[ledger-nonce-prefix-not-reuse] last=ATTEST_SELFTEST: FAIL
N02 INJECTED-CASE@PRISTINE selftest exit=0 failed=[] last=ATTEST_SELFTEST: PASS

N07 a.nonce=9ad94da37b4ceb7f1f3dd6efbf3bf93b b.nonce=3690157da026b69e19b7844fbf3bf93b distinct=true shared8=bf3bf93b
N07 MUTANT   exit=1 verdict="RECEIPT: REPLAY"
N07 PRISTINE exit=0 verdict="RECEIPT: VALID"
N07 INJECTED-CASE selftest exit=0 failed=[] last=ATTEST_SELFTEST: PASS   <- the injected N07 case was NOT effective
N07 INJECTED-CASE@PRISTINE selftest exit=0 failed=[] last=ATTEST_SELFTEST: PASS
```

**Direction of the defect — read this before grading the severity.** N02/N07 are
**false-positive** defects: they make the ledger *over*-reject (a legitimate distinct receipt
is called `RECEIPT: REPLAY`), never *under*-reject. A genuine reuse is still caught, because a
truncated comparison of equal strings is equal. This matches wave-1's **F‑4**. Consequence:
the ledger's **availability**, not its forgery resistance — a false `REPLAY` on a legitimate
receipt whose nonce happens to share 8 hex chars with another (birthday ≈ 2¹⁶ receipts for a
32-bit slice). Severity **MEDIUM** as a correctness/availability defect, **LOW** as a security
defect. Note this is *only* a defect for the mutant; the shipped code compares the full
32-hex nonce.

**The N07 injected case did not kill the mutant** — my injected fixture built the two nonces
as `'0'.repeat(24)+'a1a2a3a4'` vs `'a1a2a3a4'+'0'.repeat(24)`, which share the *prefix* `a1a2a3a4`,
not the suffix. The N07 mutant compares the **last** 8 chars, so the fixture did not exercise
it. The adversarial artefact above (which *does* share the suffix `bf3bf93b`) does exercise it
and does distinguish mutant from pristine. So N07's status is **SURVIVED with a demonstrated
artefact but with an unproven injected case** — reported as such rather than claimed closed.

### The missing killing cases, concretely

| survivor | the case the shipped suite lacks | effect |
|---|---|---|
| S02 | `sidecar-prefix-collision-reads-tampered` — sidecar shares the first 16 hex of the real hash, differs after | kills S02 (red), pristine stays green |
| N02 | `ledger-nonce-prefix-not-reuse` — two distinct nonces sharing an 8-hex **prefix** must both read VALID | kills N02 (red), pristine stays green |
| N07 | `ledger-nonce-suffix-not-reuse` — two distinct nonces sharing an 8-hex **suffix** must both read VALID | *my injected fixture was wrong; needs re-authoring* (see above) |

---

## 4. Audit of the wave-1 battery's own kills (the false-kill finding)

Because the wave-1 battery is a *deliverable* that the L1 was told to run against the shipped
instrument, its verdicts on that instrument matter. Audited mechanically (real `diff -U0` site
map + `node --check` + emission-vs-assertion classification), transcript
`MutShipped-wave1-battery-audit.txt`:

```
id	parses	mutated-sites(kind)	audit
D01..D06	parses	[109] OTHER	mutated a non-verdict site   <- genuine (delete copy.<field>)
D07	parses	[109] OTHER	mutated a non-verdict site   <- but the field does not exist: NO-OP
D08	parses	[107] OTHER	mutated a non-verdict site   <- genuine
D09	parses	[99] OTHER	mutated a non-verdict site   <- genuine
D10	parses	[63,79] OTHER	mutated a non-verdict site   <- genuine
D11	parses	[267] IF	mutated a non-verdict site   <- genuine
S01	CRASH	[264,736] IF	FALSE-KILL (CRASH — the mutant does not even parse)
S02	parses	[264] IF	mutated a non-verdict site   <- hit the LEDGER's hash check, not the VERIFY path's
S03..	-	-	NOT-APPL (site not found)
S04	parses	[220,221,234,240,264,331,...] OTHER,IF	mutated a non-verdict site   <- genuine
N01..N09	-	-	NOT-APPL (site not found)
V01	parses	[524,533,545,640,649,662] ASSERT	FALSE-KILL (mutated the suite's own ASSERTION strings only)
V02	parses	[494,512,565,580,687] ASSERT	FALSE-KILL (mutated the suite's own ASSERTION strings only)
V03	parses	[479,592,606,747] ASSERT	FALSE-KILL (mutated the suite's own ASSERTION strings only)
V04..	-	-	NOT-APPL (site not found)
V05	parses	[311,323,329,335,344,349,374,390] OTHER	mutated a non-verdict site   <- genuine
V06	parses	[394] OTHER	mutated a non-verdict site   <- genuine
C01,C02	-	-	NOT-APPL (site not found)
```

### F‑3 detail (HIGH, against the wave-1 battery as a deliverable) — 4 of the wave-1 battery's 18 "kills" on the shipped file are false kills, and 2 more kill at the wrong site

* **V01 / V02 / V03 mutated only the suite's own ASSERTION strings.** The wave-1 applier
  regex `(['"])RECEIPT: TAMPERED\1` matched the *test's* `lastLine(r) !== 'RECEIPT: TAMPERED'`
  lines but **not** the emission sites `out('RECEIPT: TAMPERED\n')` — because the emission
  literal contains `\n` before the closing quote, so the regex (which requires the quote
  immediately after the word) does not match it. The mutants therefore *weakened nothing*: the
  tool still emits the correct verdict, and the suite "fails" only because its expectation
  string was rewritten. Proof:

  ```
  === wave-1 V01: does it mutate EMISSION or only ASSERTION? ===
  322:    out('RECEIPT: TAMPERED\n');     <- UNCHANGED (emission)
  ...
  524:  if (lastLine(r) !== 'RECEIPT: TAMPER') ...   <- CHANGED (assertion)
  ```
  All six emission sites are byte-identical to pristine (`grep -c` = 6 in both files).
  The verdict mutants are the *entire point* of the wave-1 battery's verdict-site coverage —
  and against the shipped instrument they were testing the wrong string.

* **S01 was a crash, not a kill.** Its second mutation site produced `if (false))` — a
  `SyntaxError`. `node --check` fails; the mutant never runs:

  ```
  /tmp/mutshipped/battery-shipped/S01/mutant.mjs:736
    if (false)) return 'stdout_sha256 does not hash the captured stdout';
              ^
  SyntaxError: Unexpected token ')'
  ```

* **S02 hit the wrong comparison.** The wave-1 S02 landed on line 264 — the **ledger helper's**
  `attestationState` hash check — not on the **verify path's** `parsed.hash !== actual`
  (line 331). Its replacement expression is also garbled: JS evaluates
  `a !== b !== c` as `(a !== b) !== c`, i.e. *boolean* `!==` *string* → **always true**. The
  effect is that `attestationState` reports "sidecar hash mismatch" for every file, so the
  ledger skips every candidate and detects no reuse at all. The kill is real (the mutant does
  weaken the instrument) but it is a *ledger-blindness* defect, not the prefix-truncation
  defect the wave-1 table labels it as. The verify path's sidecar comparison — the site the
  mutant is *about* — was never touched, which is exactly why my correctly-anchored S02
  survives. Measured kill reason:

  ```
  ATTEST_CASE 12 prelude-rewrite-with-forged-sidecar-reads-replay: FAIL (verdict line is "RECEIPT: TAMPERED")
  ATTEST_CASE 13 ledger-detects-a-nonce-reused-by-a-different-record: FAIL (exit 0 (want 1): )
  ```

* **D11 hit the ledger helper's digest check** (`attestationState`, line 267 —
  `digestOf(parts.record) !== parts.record.digest`) rather than the verify path's
  `digest !== record.digest` (line 306). The wave-1 regex `(\w*digest\w*\([^()]*\)\s*)!==(\s*[\w.$]+\.digest)`
  matches only the *call* form `digestOf(...)`, so the verify path's bare-variable comparison
  is unreachable to it. The kill is real (same two cases fail) but again for the
  ledger-blindness reason, not the "inverted digest comparison on the verify path" the label claims.

* **D07 was a no-op** (Proof A, §1) — and it is a *survivor*, not a kill, so it does not
  inflate the false-kill count; it corrupts the survivor count instead (see F‑3).

**Net effect on the wave-1 deliverable.** Replayed against the shipped instrument, the wave-1
battery reports 18 killed / 1 survived / 13 NOT-APPL. The honest reading is **13 unapplied,
4 false kills** (V01, V02, V03, S01), **2 kills at the wrong site** (D11, S02), **12 genuine
kills at the named site** (D01–D06, D08, D09, D10, S04, V05, V06), and **1 bogus survivor**
(D07, a no-op). The three real survivors (S02, N02, N07) plus the 13 unapplied sites (which
include the whole nonce block N01–N09 and both clock mutants C01/C02) are exactly what the L1
would have taken as "covered". The wave-1 report's own §8 instructed the L1 to run this
battery against the shipped instrument and gate on "0 survivors from arm 1"; that instruction
would have produced a **false all-clear**.

### F‑7 (INFO) — the wave-1 battery's NOT-APPL detection is not sound for no-op mutants

The battery reports a mutant as `SURVIVED` when the applier produced a *semantically empty*
mutation (D07's `delete copy.mono_ns;`). A no-op mutation is not a survivor of the suite; it
is a battery defect. Any future battery should assert that a mutant changes the instrument's
*observable behaviour* (e.g. that the mutant's receipt digest differs from pristine's) before
classifying it.

---

## 5. The frozen counter is blind to all three survivors

The frozen counter `probe/attest51-probe.mjs` (rule A51) is the thing that carries
`ATTEST_HELD`. Its verdict-greps were applied, unchanged, to the pristine instrument and to
each survivor (harness `/tmp/mutshipped/counter-sim.mjs`, transcript
`MutShipped-counter-sim.txt`):

```
== S02 — the frozen counter's A-arms, run against pristine and mutant ==
arm   PRISTINE   MUTANT
A1    PASS       PASS
A2    PASS       PASS
A3    PASS       PASS
A3d   PASS       PASS
A4    PASS       PASS
A4c   PASS       PASS
counter-attested arms that the mutant breaks: NONE — the counter is BLIND to this mutant
```

Identical for N02 and N07. The counter-sim was validated on mutants it *should* catch:

```
== D11 ==   A1 FAIL  A2 FAIL  A3 FAIL  A3d FAIL  A4 FAIL  A4c FAIL   -> breaks 6 arms
== V01 ==   A1 FAIL  A2 PASS  A3 FAIL  A3d PASS  A4 PASS  A4c PASS   -> breaks A1,A3
== D07 ==   A1 FAIL  A2 PASS  A3 PASS  A3d PASS  A4 PASS  A4c FAIL   -> breaks A1,A4c
== S04 ==   A1 FAIL  A2 PASS  A3 PASS  A3d PASS  A4 PASS  A4c FAIL   -> breaks A1,A4c
```

so the blindness is a property of the three survivors, not of the simulator.

**Consequence.** `ATTEST_HELD = held=9/9` is satisfiable by an instrument whose sidecar
comparison is prefix-truncated and whose ledger compares 8 hex chars of the nonce. The
predicate does not pin the two properties the wave-1 table exists to pin. This is a
**coverage** finding about the counter's discriminating power, not a false claim about the
shipped bytes — the shipped instrument does compare in full.

---

## 6. Findings

| # | severity | finding | evidence |
|---|---|---|---|
| **F‑1** | **MEDIUM–HIGH** | The shipped `--selftest` **cannot detect a truncated sidecar-hash comparison** (S02). Its only sidecar-tamper case flips the *first nibble*, which every prefix comparison catches. At 4 hex the class is a **practical forgery**: genuine sidecar + doctored body, 87 055 grinds / 313 ms, mutant answers `RECEIPT: VALID` exit 0, pristine answers `RECEIPT: TAMPERED` exit 1. | §3, `MutShipped-survivor-demo.txt`, `MutShipped-s02-class.txt`, `MutShipped-forgery-cost.txt` |
| **F‑2** | **MEDIUM** | The shipped `--selftest` **cannot detect a truncated ledger nonce comparison** (N02 prefix, N07 suffix). Direction is **over-rejection** (false `RECEIPT: REPLAY` on a legitimate receipt), not forgery acceptance — availability, not integrity. Birthday ≈ 2¹⁶ receipts at an 8-hex (32-bit) slice. | §3, `MutShipped-survivor-demo.txt` |
| **F‑3** | **HIGH** (against the wave-1 *battery deliverable*) | Replayed on the shipped file, the wave-1 battery yields **13 NOT-APPL + 4 false kills** (V01/V02/V03 mutated the suite's assertion strings, not the emission sites; S01 was a `SyntaxError` crash) **+ 2 kills at the wrong site** (S02/D11 hit the *ledger helper's* checks, not the verify path's) **+ 1 bogus survivor** (D07, a behavioural no-op). The L1 instruction to gate on "0 survivors from arm 1" would have produced a **false all-clear**. | §4, `MutShipped-wave1-battery-audit.txt`, `MutShipped-proofs.txt` |
| **F‑4** | **MEDIUM** (against the frozen counter) | The counter's A-arms are **blind to all three survivors** — `ATTEST_HELD = 9/9` is satisfiable by a prefix-truncating instrument. The counter's `lastLine` **trims** (`attest51-probe.mjs:93`) and its greps are substring regexes, so V03 (trailing-space verdict) is also unpinned. | §5, `MutShipped-counter-sim.txt` |
| **F‑5** | **LOW** | The **sidecar's `name` field is parsed but never checked** against the receipt's basename (`parseSidecar` returns `name`; `doVerify` ignores it). Not exploitable as shipped (the hash covers the bytes) — a second unpinned field in the same layer. | `scripts/receipt-attest.mjs:158-161`, `doVerify` |
| **F‑6** | **INFO** (positive) | The shipped suite's digest-binding coverage is **complete** over all eight semantic fields: correctly anchored, D01–D07 are all killed by `inner-digest-covers-every-semantic-field`. The shipped implementation is **not** defective on any site this battery attacks. | §2, `MutShipped-killing-cases.txt` |
| **F‑7** | **INFO** | The wave-1 battery classifies a **behaviourally empty** mutation as `SURVIVED` (D07's `delete copy.mono_ns;` — a field the shipped record does not have). A no-op is a battery defect, not a suite survivor. Any future battery should assert the mutant changes the instrument's *observable behaviour* before classifying it. | §4, `MutShipped-proofs.txt` |
| **F‑8** | **INFO** (self-audit, positive) | This seat's own battery was put through the **same** no-op test it charges wave-1's with: all **34/34** mutants change observable behaviour, **0 no-ops, 0 syntax crashes**. The test's first run flagged V03 and N07 as no-ops — both were **harness** blind spots (a trimming last-line reader; a fingerprint battery that only built same-nonce twins), i.e. the same two blind spots the audit exists to catch. Both corrections were to the harness, not to the mutants; neither mutant was reclassified. | §7, `MutShipped-self-audit.txt` |

### What would close F‑1 and F‑2 (proposals; this seat edits nothing)

Three selftest cases, each verified above to kill its mutant **and** leave the pristine green:

1. `sidecar-prefix-collision-reads-tampered` — sidecar = real hash's first 16 hex + garbage
   suffix → must read `RECEIPT: TAMPERED` exit 1.
2. `ledger-nonce-prefix-not-reuse` — two distinct nonces sharing an 8-hex **prefix** → both
   must read `RECEIPT: VALID` exit 0 under `--ledger`.
3. `ledger-nonce-suffix-not-reuse` — the same with an 8-hex **suffix** (fixture needs
   re-authoring; my first attempt exercised the prefix side).

For F‑4 the cheapest counter-side fix is to compare the verdict **exactly** (strip only
`\r\n`, not all whitespace) instead of the trimming `lastLine` + substring regex.

---

## 7. Restoration evidence

* The candidate was never written. The battery's own restore check:
  `candidate sha256 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9 == pristine 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9 -> OK`.
* Post-run re-hash of the lane file:
  `sha256sum scripts/receipt-attest.mjs` → `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` — **unchanged**.
* All scratch (mutant sources, harnesses, forged artefacts, receipts) lives under
  `/tmp/mutshipped/`. **No runnable file (`.mjs`/`.js`/`.sh`/`.py`) was created anywhere under
  the lane tree**; the only lane-tree writes by this seat are this report and the twelve `.txt`
  transcripts beside it.
* **Self-audit (this seat's own battery held to the standard I charged wave-1's with).**
  §4/F‑7 charges a battery with scoring a behaviourally-empty mutant as a real result. The
  same test was applied to **this seat's own** 34 mutants: each was run through a fixed
  scenario battery (run · verify-genuine · sidecar-flip · sidecar-absent · prelude-forgery ·
  digest-broken · ledger-twin · ledger shared-prefix-and-suffix nonce pair · selftest verdict)
  and the normalised observable behaviour (exit codes + **raw, untrimmed** verdict lines +
  receipt shape, with nonces/instants/hashes masked) was hashed into a fingerprint and
  compared against the pristine fingerprint.

  ```
  pristine fingerprint 71d37780aabf105c01f1aaf5d08be45454d9d85f775da0fd909454beb33a7241
  ...
  no-op mutants: NONE
  syntax-crash mutants: NONE
  mutants scored: 34
  ```

  Transcript: `MutShipped-self-audit.txt`. **All 34 mutants change observable behaviour; none
  is a no-op; none crashes.** The harness needed two corrections to reach that result, both
  of them the *same* blind spots the audit exists to catch, and both recorded here rather
  than quietly fixed:

  * the first version used a **trimming** last-line reader, which made **V03** (trailing-space
    `RECEIPT: VALID `) look like a no-op — the identical trimming blindness that makes the
    frozen counter miss V03 (F‑4). The reader is now raw/untrimmed.
  * the first version's fingerprint battery created only a twin with the **same full nonce**,
    which a truncated nonce comparison cannot distinguish; **N07** therefore looked like a
    no-op. A scenario with two **distinct** nonces sharing an 8-hex prefix *and* an 8-hex
    suffix was added.

  Both corrections changed the harness, not the mutants. The two mutants concerned (V03,
  N07) are **not** reclassified: V03 remains killed-by-arm-2-only and N07 remains a survivor
  with a demonstrated adversarial artefact (§3).
* Lane `git status` after the run shows no modification to `scripts/`:
  ```
   M .ufo/waves/round-51/w2/MutStanza.md          <- a sibling seat's file, not mine
  ?? .ufo/waves/round-51/build/ExecForgerControl/lanes/
  ?? .ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt
  ?? .ufo/waves/round-51/close/FINAL-harm-census.txt
  ?? .ufo/waves/round-51/w2/RevStanza.md          <- a sibling seat's file, not mine
  ```

## 8. Limits of this seat's evidence

* **Arm 2 is a re-implementation** of the counter's semantics, not the counter itself. §5's
  counter-sim uses the counter's *own* verdict greps and arm shapes copied from
  `probe/attest51-probe.mjs`; it is not the frozen file. F‑4's severity rests on the counter's
  source text (line 93's trimming `lastLine`, the substring regexes), which is directly
  quotable; the per-arm table is a faithful re-implementation, not a counter run.
* The instrument was **not** run against the real lane counter (`probe/attest51-probe.mjs`
  scores a *committed rev* via `git archive`, and this seat may not create commits). §5's
  counter-sim runs the same arms against the working-tree bytes.
* The **N07 injected case was ineffective** (§3). N07's survivor status rests on the
  adversarial artefact (mutant `RECEIPT: REPLAY`, pristine `RECEIPT: VALID`), which is
  demonstrated; the *closing* case still needs authoring.
* **A5 was not scored** (no live origin checkout → `proxy-check --strict` cannot match). All
  A5 readings are `MISS` by construction and are not evidence about any instrument.
* The three survivors are **coverage findings**. Per the round's own framing (and wave-1's
  F‑4), a survivor is a statement about the *suite's discriminating power*, not a licence to
  change the contract. The shipped bytes were verified correct on every site this battery
  attacks.
* The **self-audit (§7) proves each mutant changes observable behaviour; it does not prove
  each mutant is the *minimal* weakening for its site.** A mutant that both truncates a
  comparison and disables the ledger would still pass the fingerprint test while testing two
  things at once. The fingerprint is a *no-op* test, not a minimality test.
  Measured line-level minimality (`diff -U0`, transcript `MutShipped-minimality.txt`):
  **21 of the 34 mutants replace exactly one source line**; **7 are a single-line insertion or
  deletion** (D01–D07 insert `delete copy.<field>;`, D08 deletes `delete copy.digest;` — still
  one line changed); the remaining **6 touch several syntactic occurrences of one contract
  site**, not several sites — **V01** (`out('RECEIPT: TAMPERED\n')` at 6 emission sites),
  **V05** (every finding path's `process.exit(1)`, 8), **V02** (2), **S03** (a 2-line
  catch-block rewrite), **S04** (the sidecar/body-line split, 3 hunks). The per-mutant diffs in
  `/tmp/mutshipped/w2run/*/mutant.mjs` are the ground truth and were inspected individually.
* No tool installs or upgrades were made during this seat's run.

---

## 9. Artefacts

| artefact | path |
|---|---|
| this report | `.ufo/waves/round-51/w2/MutShipped.md` |
| re-anchored battery harness (scratch) | `/tmp/mutshipped/w2-battery.mjs` |
| re-anchored battery results | `/tmp/mutshipped/w2run/w2-results.json` |
| battery run transcript | `MutShipped-w2-battery-run.txt` |
| exact killing cases per mutant | `MutShipped-killing-cases.txt` |
| survivor adversarial artefacts | `MutShipped-survivor-demo.txt` |
| frozen-counter A-arm simulation | `MutShipped-counter-sim.txt` |
| S02 truncation-class sweep + forgery | `MutShipped-s02-class.txt`, `MutShipped-forgery-cost.txt` |
| attacker-controlled S02 forgery | `MutShipped-s02-attacker-forgery.txt` |
| wave-1 battery audit | `MutShipped-wave1-battery-audit.txt` |
| self-audit (no-op / crash test of this seat's own 34 mutants) | `MutShipped-self-audit.txt` |
| line-level minimality of each mutant | `MutShipped-minimality.txt` |
| no-op / ledger proofs | `MutShipped-proofs.txt` |
| pristine baseline selftest (27/27) | `MutShipped-baseline-selftest.txt` |

**Report:** `.ufo/waves/round-51/w2/MutShipped.md`
