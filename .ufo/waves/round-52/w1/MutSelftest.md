# MutSelftest — R52-6 selftest-coverage proof (truncation mutants)

Seat: `MutSelftest` · round 52, wave 1 · leaf, no subagents.
Item: R52-6 — prove the v2 `--selftest` kills the 16-bit-prefix truncation mutant class, and that the
r51 16-bit-prefix forger receipt reads VALID only against a truncated compare.

## Result in one line

The **scratch v2** suite kills all three truncation mutants (3/3, each by exactly its matching arm).
The **delivered v2 at the snapshot probed first** (`aed7191c…`) killed only 1 of 3 (nonce and
inner-digest mutants survived at `PASS (41/41)`). **Re-probed against the owner's current bytes
`4d9d824a…` (44/44 cases): all three mutants are now KILLED**, each by its own R52-6 arm.
**Final bytes `16175dd2…` (45/45 cases): all three still KILLED** (44/45 each). A fourth,
bonus site — `attestationState`'s recorded-vs-recomputed digest compare, which the new case 45
targets — is **not** killed by that case as written (mutant survives 45/45); an injected correct
case kills it, and the mutant's observable defect is a false `REPLAY` on a legitimate receipt.

## Dependency / provenance

- Delivered v2 was **absent** when this seat started (`scripts/receipt-attest.mjs` was still pinned v1
  `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`; no v2 under `build/`).
  Per tasking ("delivered v2 **or your scratch v2**") I authored a scratch v2 from the pinned v1 bytes
  plus the frozen C1 v2 contract, then — when `ExecInstrumentV2/receipt-attest.mjs`
  (`aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29`) appeared — **copied** it into my
  build and repeated the identical mutation probe on it. Its file was never written.
- The delivered v2 is **moving while the wave runs**: the bytes probed first were
  `aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29` (copied to `delivered/`); the
  owner then advanced the file to `4d9d824a…` (re-probed, Measurement 2b) and then to the FINAL
  bytes `16175dd2b0bdb0aca3bc99b26785e2c9c07ace4850f0bdbef92bc3b8fc73282f` with a 45-case selftest
  (re-probed, Measurement 2c). Every delivered-v2 verdict is labelled with the hash it was measured on.
- Scratch v2 is a **probe vehicle**, not a delivery claim: it implements v1 semantics + the v2
  SHAPE/CLOCK/STDIN/LEDGER/SELFTEST additions needed to host the arms. Its contract fidelity is not
  asserted beyond what the arms exercise.
- No tools installed or upgraded (node present; no pacman, no uv/npx).

## Detector and mutants

Detector = the instrument's own `--selftest` (the R52-6 contract surface), scored exactly as frozen
probe B1 scores it: exit code, final `ATTEST_SELFTEST: …` line, and the count of
`^case <name>: PASS$` lines.

Three one-line mutants, each the **minimal** weakening of its site (no other change):

| # | mutant | site (source line) | patch |
|---|--------|--------------------|-------|
| 1 | nonce | `doVerify` ledger compare | `state.nonce === record.nonce` → `state.nonce.slice(0,4) === record.nonce.slice(0,4)` |
| 2 | sidecar | `doVerify` sidecar compare | `parsed.hash !== actual` → `parsed.hash.slice(0,4) !== actual.slice(0,4)` |
| 3 | inner digest | `doVerify` digest compare | `digest !== record.digest` → `digest.slice(0,4) !== record.digest.slice(0,4)` |

Builds (hashes, all under `build/MutSelftest/`):

```
v2/receipt-attest.mjs                 bd7f1eee2ec0655cd28f4d68151c9b2572301650776ffa089f13557ebe9f9c68
mutants/nonce/receipt-attest.mjs      c75e066d9effedb7b01dbb4a945caf86c1f5366361291217a5a61f05274b6e31
mutants/sidecar/receipt-attest.mjs    2abab5ca73011f52b056e63f335a9a51e3a488d28eccdd116b583d9a67ae852f
mutants/digest/receipt-attest.mjs     adb3b55a5b854f94b1e3c2a453f91c5fd547d20b42c054fab16dfb60116d1f90
delivered/receipt-attest.mjs          aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29  (pristine copy)
delivered/nonce.mjs                   d3cece1b93c860c9a5fc45c9b43c7e34035b9995650fbb2bf38afe957e74fd29
delivered/sidecar.mjs                 4840604796b6a88785e633b9c652b83bda362a117a11160ad5e78c5d9b4ad2fe
delivered/digest.mjs                  0b559130d2bd14c77758b678de7a8ab743f7f81376b6e3637ecc723c50f5e408
v1-mutants/*/receipt-attest.mjs        f833910…/8cc102b…/ebad147…  (same 3 truncations on shipped v1, baseline control)
```

## Measurement 1 — scratch v2 selftest vs the three mutants

| build | exit | `case …: PASS` lines | final line | verdict |
|-------|------|----------------------|-----------|---------|
| v2 pristine | 0 | 40 | `ATTEST_SELFTEST: PASS (40/40)` | **PASS (B1-shaped)** |
| v2 + nonce mutant | 1 | 39 | `ATTEST_SELFTEST: FAIL` | **KILLED** |
| v2 + sidecar mutant | 1 | 39 | `ATTEST_SELFTEST: FAIL` | **KILLED** |
| v2 + digest mutant | 1 | 39 | `ATTEST_SELFTEST: FAIL` | **KILLED** |

Exact killer output (each mutant fails exactly one case — minimality):

```
[nonce]   case ledger-nonce-16bit-prefix-not-reuse: FAIL (n02-a.txt: exit 1 "RECEIPT: REPLAY"; n02-b.txt: exit 1 "RECEIPT: REPLAY")
[sidecar] case sidecar-16bit-prefix-collision-reads-tampered: FAIL (exit 0 (want 1): )
[digest]  case inner-digest-16bit-prefix-collision-reads-replay: FAIL (exit 0 (want 1): )
```

Pristine B1-shape check (probe semantics, `^case\s+\S+:\s+PASS\s*$`): `exit=0 last="ATTEST_SELFTEST: PASS (40/40)" caseLines=40 B1=PASS`.

## Measurement 2 — delivered v2 selftest vs the same three mutants

| build | exit | final line | verdict |
|-------|------|-----------|---------|
| delivered pristine | 0 | `ATTEST_SELFTEST: PASS (41/41)` | PASS |
| delivered + nonce mutant | 0 | `ATTEST_SELFTEST: PASS (41/41)` | **SURVIVED** |
| delivered + sidecar mutant | 1 | `ATTEST_SELFTEST: FAIL` | **KILLED** |
| delivered + digest mutant | 0 | `ATTEST_SELFTEST: PASS (41/41)` | **SURVIVED** |

Why the nonce mutant survives — its only nonce-prefix case never touches the ledger compare
(`delivered/receipt-attest.mjs:693-702`):

```js
case_('r52-6-nonce-difference-after-16-bit-prefix-is-not-valid', (d) => {
  const rec = makeReceipt(d, 'nonce-trunc', NODE_ECHO('n'));
  ... body.nonce = `${body.nonce.slice(0,4)}${flip}${body.nonce.slice(5)}`;   // single body
  lines[1] = canonical(body);                                               // digest NOT recomputed
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: REPLAY');         // no --ledger
});
```

The flipped nonce invalidates the **inner digest**, so the case returns REPLAY via the digest path on
any build — it is an inner-digest case wearing a nonce name and gives the ledger compare zero coverage.
There is **no** inner-digest 16-bit-prefix arm at all in the delivered suite (only
`r52-6-{nonce,sidecar}-difference-after-16-bit-prefix-is-not-valid` exist).

## Measurement 2b — re-probe at the owner's current delivered bytes (`4d9d824a…`)

The owner added the two missing arms (`r52-6-ledger-nonce-16bit-prefix-not-reuse`,
`r52-6-inner-digest-16bit-prefix-collision-reads-replay`) and reports 44/44. Re-probed here on a copy
(`delivered/receipt-attest-4d9d824a.mjs`, sha256
`4d9d824a5d2be764a56cf0f49c2c2092556681266fc9b215103619b2db20ab77`; owner file untouched):

| build | exit | final line | verdict |
|-------|------|-----------|---------|
| `4d9d824a` pristine | 0 | `ATTEST_SELFTEST: PASS (44/44)` | PASS |
| + nonce mutant `6fa2f0cf…` | 1 | `ATTEST_SELFTEST: FAIL` | **KILLED** by `r52-6-ledger-nonce-16bit-prefix-not-reuse` |
| + sidecar mutant `4330e9b6…` | 1 | `ATTEST_SELFTEST: FAIL` | **KILLED** by `r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid` |
| + digest mutant `8281f6cc…` | 1 | `ATTEST_SELFTEST: FAIL` | **KILLED** by `r52-6-inner-digest-16bit-prefix-collision-reads-replay` |

Killer output (each mutant fails exactly one case — minimality holds on the fixed bytes too):

```
[nonce]   case r52-6-ledger-nonce-16bit-prefix-not-reuse: FAIL (n02-a.txt: exit 1 "RECEIPT: REPLAY"; n02-b.txt: exit 1 "RECEIPT: REPLAY")
[sidecar] case r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid: FAIL (exit 0 (want 1): )
[digest]  case r52-6-inner-digest-16bit-prefix-collision-reads-replay: FAIL (exit 0 (want 1): )
```

Artifact matrix on the fixed build is identical to the scratch-v2 rows: pristine rejects the r51-S02
forger (TAMPERED) and the digest-prefix forger (REPLAY) and accepts the N02 pair; each truncation
mutant still exhibits the corresponding weakness (S02 forger VALID only under the sidecar mutant,
digest-prefix forger VALID only under the digest mutant, N02 false-REPLAY only under the nonce
mutant) — i.e. the new arms are the cases that pin those behaviours.
(`transcripts/delivered2-artifact-matrix.txt`.)

## Measurement 2c — FINAL delivered bytes (`16175dd2…`, 45/45) and the fourth site

Final instrument bytes probed: `16175dd2b0bdb0aca3bc99b26785e2c9c07ace4850f0bdbef92bc3b8fc73282f`
(`delivered/receipt-attest-16175dd2.mjs`; owner's file untouched, hash unchanged across copy and
probe). These bytes were subsequently landed by integration at `scripts/receipt-attest.mjs` and are
`cmp`-identical to the probed copy, so this section measures the **shipped** instrument. Own selftest
run on the lane file: exit 0, `ATTEST_SELFTEST: PASS (45/45)`, 45 `^case …: PASS$` lines. The
four 16-bit arms present: `r52-6-ledger-nonce-16bit-prefix-not-reuse`,
`r52-6-ledger-digest-16bit-prefix-collision-reads-replay` (case 45),
`r52-6-inner-digest-16bit-prefix-collision-reads-replay`,
`r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid`.

**The three assigned mutants — all killed:**

| mutant (site) | exit | final line | killer case |
|---|---|---|---|
| nonce `e582ff7d…` | 1 | `ATTEST_SELFTEST: FAIL` | `r52-6-ledger-nonce-16bit-prefix-not-reuse` |
| sidecar `4aff35d9…` | 1 | `ATTEST_SELFTEST: FAIL` | `r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid` |
| inner digest `68e1e2d1…` | 1 | `ATTEST_SELFTEST: FAIL` | `r52-6-inner-digest-16bit-prefix-collision-reads-replay` |

**Bonus fourth site — `attestationState` digest compare (what case 45 claims to pin):**

| mutant (site) | exit | final line | verdict |
|---|---|---|---|
| ledger attestation digest `838f56dc…` | 0 | `ATTEST_SELFTEST: PASS (45/45)` | **SURVIVED** |

Why: case 45 (`delivered/receipt-attest-16175dd2.mjs:728-745`) grinds **record B's** digest to share
a 16-bit prefix with **record A's** digest, then requires both to read REPLAY through the *nonce*
arm. B's own recorded digest still equals its recomputed digest exactly, so the `attestationState`
compare is never stressed — the prefix collision is between two records, not between a record's
recorded and recomputed digest.

The mutant's real defect is observable and is the availability direction: a prior whose recorded
digest is wrong after 16 bits is trusted as attested, so a legitimate subject sharing its nonce reads
a false `REPLAY`:

```
prior.recorded-digest=0975000000… (correct=09759f6c1f…; shared prefix 0975; sidecar full-match=true)
pristine 16175dd2 : "ledger skipped prior.txt: not an attested receipt (inner digest mismatch)" → RECEIPT: VALID exit 0
mutant   ledgerdigest: "nonce 16b829d8… already bound to a different record in prior.txt"        → RECEIPT: REPLAY exit 1
```

Injected-case proof (r51 method): a correct case —
`ledger-prior-recorded-digest-16bit-collision-is-skipped-not-reuse`, asserting the skip note and
VALID — turns the candidate suite green and the mutant red:

```
16175dd2-injected (pristine + case):           ATTEST_SELFTEST: PASS (46/46)  exit 0
16175dd2-injected-ledgerdigest (+ case, mut):  case ledger-prior-recorded-digest-16bit-collision-is-skipped-not-reuse: FAIL (exit 1 (want 0): "RECEIPT: REPLAY")  → FAIL
```

Recommendation (coverage, not a contract change): add this case for `4d9d824a`/`16175dd2`; existing
case 45 should be renamed to what it actually pins (nonce reuse across records with colliding digests)
or rewritten against the `attestationState` compare.

Artifact matrix on the final build (`transcripts/final-artifact-matrix.txt`): pristine rejects the
r51-S02 forger (`TAMPERED`) and the digest-prefix forger (`REPLAY`), accepts the N02 pair and the
ld14 subject; the nonce mutant false-rejects N02; the sidecar mutant accepts S02; the inner-digest
mutant accepts the digest-prefix forger; the ledger-digest mutant false-rejects the ld14 subject.

## Measurement 3 — the r51 16-bit-prefix forger receipt (crafted per r51 `w2/MutShipped.md` §S02)

`artifacts/r51-s02-forger.txt`: genuine receipt body replaced by a fully attacker-controlled one
(argv `/bin/sh -c 'printf secret'`, recomputed stdout/stderr hashes, recomputed inner digest), ground
until `sha256(bytes)` shares **only the first 16 bits** with the genuine sidecar hash, which is kept
**UNCHANGED** (the r51 artifact shape). Crafted cost:

```
S02 artifact: target-prefix=b22f tries=34733 wall=183ms
S02 artifact: forged-receipt-sha256=b22f8245d2088c7a28e6c91c15163e6ed6dcb71e4dfee4b779a1bb6858f05300
S02 artifact: genuine-sidecar-hash =b22f75298324bc4190543774d75485995c105c1833152dfbe4f69e1786dc00dc (kept UNCHANGED)
```

Companion artifacts, same principle per site: `artifacts/digest-prefix-forger.txt` (digest field
`0165000…0` vs correct `0165ea30…`, sidecar recomputed in full) and `artifacts/n02/{a,b}.txt`
(distinct nonces `b1f91998…` / `b1f97b64…`, shared 16-bit prefix `b1f9`, both sidecars consistent).

Artifact-vs-build matrix (`arc` = does it read `RECEIPT: VALID`):

| build | r51-S02 forger | digest-prefix forger | N02 pair (a, b) |
|-------|---------------|----------------------|-----------------|
| scratch v2 pristine | TAMPERED exit 1 — non-VALID | REPLAY exit 1 — non-VALID | VALID, VALID |
| scratch v2 nonce mutant | TAMPERED — non-VALID | REPLAY — non-VALID | **REPLAY, REPLAY (false reject)** |
| scratch v2 sidecar mutant | **VALID exit 0** | REPLAY — non-VALID | VALID, VALID |
| scratch v2 digest mutant | TAMPERED — non-VALID | **VALID exit 0** | VALID, VALID |
| shipped v1 (control) | TAMPERED — non-VALID | REPLAY — non-VALID | VALID, VALID |
| delivered v2 pristine | TAMPERED — non-VALID | REPLAY — non-VALID | VALID, VALID |
| delivered nonce mutant | TAMPERED — non-VALID | REPLAY — non-VALID | **REPLAY, REPLAY (false reject)** |
| delivered sidecar mutant | **VALID exit 0** | REPLAY — non-VALID | VALID, VALID |
| delivered digest mutant | TAMPERED — non-VALID | **VALID exit 0** | VALID, VALID |

So the truncation class is **practically exploitable** wherever it is not killed: the r51 S02 forger
(34 733 tries, 183 ms) verifies VALID against the sidecar-truncated build; the digest-prefix forger
verifies VALID against the digest-truncated build. The nonce truncation has **no acceptance
direction** (truncating an equality only adds equalities): its defect is a false `REPLAY` on two
legitimate distinct-prefix nonces — availability, exactly the r51 N02 finding, and it is the direction
my `ledger-nonce-16bit-prefix-not-reuse` arm detects.

## Measurement 4 — baseline control: shipped v1 is blind to all three

Same three truncations applied to the pinned v1 bytes, scored by v1's own 27-case suite:

```
[v1-nonce]   exit=0 ATTEST_CASES: 27 passed, 0 failed  ATTEST_SELFTEST: PASS
[v1-sidecar] exit=0 ATTEST_CASES: 27 passed, 0 failed  ATTEST_SELFTEST: PASS
[v1-digest]  exit=0 ATTEST_CASES: 27 passed, 0 failed  ATTEST_SELFTEST: PASS
```

v1 cannot distinguish a full compare from a 16-bit-prefix compare at any of the three sites (r51 F-1
restated). The scratch v2 arms close that gap; the delivered v2 closes only the sidecar third.

## Verdicts

| question | answer |
|---|---|
| Does the scratch v2 suite kill the nonce / sidecar / digest truncation mutants? | **YES / YES / YES** (1 case each, 39/40) |
| Does the delivered v2 suite kill them — first probed snapshot `aed7191c…`? | **NO / YES / NO** (nonce and digest survived 41/41) |
| Does the delivered v2 suite kill them — current bytes `4d9d824a…`? | **YES / YES / YES** (1 case each, 43/44) |
| Does the delivered v2 suite kill them — FINAL bytes `16175dd2…` (45/45)? | **YES / YES / YES** (1 case each, 44/45) |
| Does the shipped suite kill a truncation of `attestationState`'s digest compare (case-45's claimed site)? | **NO** — mutant survives 45/45; an injected correct case kills it (46/46 pristine) |
| Does the r51 16-bit-prefix forger receipt read VALID against a truncated build? | **YES** — S02 forger VALID under every sidecar-truncated build (exit 0), digest-prefix forger VALID under every digest-truncated build |
| Does it read non-VALID under the true v2 (scratch, and delivered at both snapshots)? | **YES** — TAMPERED / REPLAY, exit 1 |

Coverage finding for the wave (not a contract change), raised against `aed7191c…` and **closed by the
owner at `4d9d824a…`**: the delivered v2 needed two more arms, whose exact bodies are proven here —
`inner-digest-16bit-prefix-collision-reads-replay` (digest field shares 4 hex with the recomputed
digest, sidecar recomputed in full) and `ledger-nonce-16bit-prefix-not-reuse` (two distinct nonces
sharing 4 hex, both must read VALID under `--ledger`). Both exist in `4d9d824a…` under the same names
and are the cases that kill the mutants. The earlier `r52-6-nonce-difference-after-16-bit-prefix-is-not-valid`
case, which exercised only the inner digest, was replaced by the ledger arm.

## Restoration evidence

- **The lane source changed by integration, not by me.** At seat start `scripts/receipt-attest.mjs` was
  pinned v1 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`; during the final probe
  the integrator landed the v2 and the lane now holds
  `16175dd2b0bdb0aca3bc99b26785e2c9c07ace4850f0bdbef92bc3b8fc73282f` — **byte-identical** (`cmp`) to
  `delivered/receipt-attest-16175dd2.mjs`, the copy every final mutant was made from. So the final
  mutants are mutants of the **shipped** bytes. The shipped bytes' own selftest was run read-only on the
  lane file: exit 0, `ATTEST_SELFTEST: PASS (45/45)`, 45 case lines
  (`transcripts/lane-shipped-selftest.txt`).
- `ExecInstrumentV2/receipt-attest.mjs` sha256 `16175dd2…` before and after the copy (identical;
  `transcripts/final-integrity.txt`).
- All mutations live only in copies under `build/MutSelftest/{mutants,delivered,v1-mutants}/`; no lane,
  fleet, jj/git, MANIFEST or config writes were made by this seat.
- Restored-bytes re-run: pristine v2 selftest after all mutant work → `ATTEST_CASES: 40 passed, 0 failed`,
  `ATTEST_SELFTEST: PASS (40/40)`, exit 0 (scratch); shipped lane → `PASS (45/45)`, exit 0.

## Transcripts (all under `build/MutSelftest/`)

```
transcripts/v2-pristine-selftest.txt
transcripts/mutant-{nonce,sidecar,digest}-selftest.txt
transcripts/v1mutant-{nonce,sidecar,digest}-selftest.txt
transcripts/delivered-pristine-selftest.txt
transcripts/delivered-mutant-{nonce,sidecar,digest}-selftest.txt
transcripts/delivered2-pristine-selftest.txt
transcripts/delivered2-mutant-{nonce,sidecar,digest}-selftest.txt
transcripts/delivered2-artifact-matrix.txt
transcripts/final-pristine-selftest.txt
transcripts/final-mutant-{nonce,sidecar,digest,ledgerdigest}-selftest.txt
transcripts/final-16175dd2-injected-selftest.txt
transcripts/final-16175dd2-injected-ledgerdigest-selftest.txt
transcripts/final-artifact-matrix.txt
transcripts/final-integrity.txt
transcripts/lane-shipped-selftest.txt
transcripts/craft-artifacts.txt
transcripts/artifact-matrix.txt
transcripts/delivered-artifact-matrix.txt
transcripts/restoration.txt
craft-artifacts.mjs   run-matrix.mjs   (reproducers)
```

## Limits

- The scratch v2 is a probe vehicle; only the arms and the three compares were exercised here.
- The delivered v2 may change after this probe; re-run `delivered/*`-style mutants against the final
  `scripts/receipt-attest.mjs` bytes at the measured close rev (L1 duty per the plan's wave section).
- One run per cell; the two grind-based artifacts are deterministic given their seeds, but the
  N02 prefix is random per craft (recorded in `craft-artifacts.txt`).
