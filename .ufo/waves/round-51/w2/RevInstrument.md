# RevInstrument — round 51, wave 2 (falsify)

Seat: `kumitate-r51.LikeTick` (independent leaf, read-only lane).
Scope: **`scripts/receipt-attest.mjs` shipped bytes at `7d88faa7`**, line by line, against
`plan.md` §C1 + `## Freeze repair addendum` items 3, 4, 5.

- Artifact attacked: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs`
  at rev `7d88faa733c5621da1cac174515e4a7d7d8896ea`, extracted with
  `git show 7d88faa7:scripts/receipt-attest.mjs` (808 lines).
- Bytes: `sha256 = 44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  (equals the context pin and the working-tree file; SCORECARD pin equality itself is A5's
  arm, verified only instrument-side here).
- Method: black-box mutation of live-generated receipts under `/tmp/r51rev.*` only (no lane
  writes except this report), plus line-level reading of the shipped source. No `.mjs` file
  was created under the lane tree. No tool installs were needed.

**Axes named (godspeed):** (A1) false-VALID surface of `verify`; (A2) fidelity of the
declared check order / exit map / GNU sidecar; (A3) evidence fidelity of the committed A3
fixture; (A4) self-consistency and portability of `run` ↔ `verify`.

**Bottom line up front:** no frozen arm is newly falsified on the evidence I ran — A1
(selftest 27/27), A2c shape, A3 verdict, A3c class, A3d class, A4/A4c, and the exit map all
read exactly as declared (see "Verified-held", below). But **F1 is a real false-VALID in the
shipped verifier** (a receipt whose wall clocks are `ISO_RE`-shaped but not parseable reads
`RECEIPT: VALID` exit 0, and the same NaN disables the prelude-window check), and **F2 is a
deviation from the frozen ledger wording** (an unattested prior receipt is silently skipped).
Neither is exercised by any frozen check, so `ATTEST_HELD` can read 9/9 while both holds are
true: the predicate under-covers the §C1 sentences it is supposed to police.

---

## F1 — HIGH — unparseable-but-regex-shaped wall clocks disable BOTH clock checks and the prelude-window check; `verify` prints `RECEIPT: VALID` exit 0

**Attacked:** §C1 "`verify` … recomputes … the clock ordering (wall_end ≥ wall_start, mono ≥ 0)"
and the instrument's own defence-in-depth prelude window (comment lines 379-383).

**Where:** `scripts/receipt-attest.mjs`
- `113` `ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/` (shape only, no calendar/clock validation)
- `145-146` `shapeError` accepts any string matching `ISO_RE`
- `339-345` `const startMs = Date.parse(...); const endMs = Date.parse(...); if (endMs < startMs)` —
  **NaN < NaN is false**, so an impossible record passes check 3
- `384-391` `lowMs = Math.min(startMs, endMs) - PRELUDE_SLACK_MS` → NaN; `preludeMs < NaN`
  and `preludeMs > NaN` are both false, so check 5 also passes regardless of the prelude.
  `Number.isFinite` guards only `preludeMs`, never the window.

**Evidence (live, shipped bytes).** Mutation driver `/tmp/r51rev-driver.mjs`: generate a real
receipt with `run`, set both wall fields to `ISO_RE`-shaped impossible instants, recompute the
inner digest and the sidecar (the A3d/A4c attacker capability), then `verify`:

```
T1 NaN-inverted clocks, digest+sidecar repaired: Date.parse(start)= NaN end<start textually: true
T1 verify exit=0 last="RECEIPT: VALID"
T1b verify (end NaN) exit=0 last="RECEIPT: VALID"
T10 prelude=2020 + impossible-ISO clocks, digest+sidecar repaired -> 0 "RECEIPT: VALID"
```

Body used in T1/T10 (from the driver): `wall_start = "2020-13-45T99:99:99.999Z"`,
`wall_end = "2020-13-45T99:99:98.999Z"` (textually **before** start); T10 additionally sets
the prelude to `run-at: 2020-01-01T00:00:00.000Z`. Result: `RECEIPT: VALID`, exit 0.

`Date.parse` behaviour on this host (Node 24.21.0):

```
2020-02-30T00:00:00.000Z -> 2020-03-01T00:00:00.000Z
2020-01-01T24:00:00.000Z -> 2020-01-02T00:00:00.000Z
2020-13-01T00:00:00.000Z -> NaN
2020-00-01T00:00:00.000Z -> NaN
2020-01-01T00:60:00.000Z -> NaN
ISO_RE gate: [ true, true ]
```

ISO_RE therefore also admits non-existent calendar instants that silently roll over (Feb 30,
24:00); those still parse, so the order check fires when they invert (verified: a Feb-30
start with a Feb-28 end reads `TAMPERED`, exit 1) — the NaN class is the fatal one.

**Why it matters for the claim:** the §C1 sentence is a statement about the instrument's
behaviour, not about this round's three receipts. A forger with the same capability A3d/A4c
grant (rewrite body, recompute digest, recompute sidecar) obtains `RECEIPT: VALID` for a
record whose stated clocks are impossible and inverted, and can park the prelude anywhere.
The frozen arms never feed a non-parseable clock, so **no frozen check can detect this**: the
predicate is 9/9-capable while the contract's clock clause is false for a whole input class.

**Minimal repair (recommendation, not applied):** after `Date.parse`, require
`Number.isFinite(startMs) && Number.isFinite(endMs)`; on failure emit `RECEIPT: TAMPERED`
exit 1 (or add a calendar-validity shape rule → exit 2). In check 5, bail to TAMPERED if
`lowMs`/`highMs` are not finite. Optionally tighten `ISO_RE` to reject `month 13`, `day 30
of Feb`, `T24:`.

---

## F2 — MEDIUM — `--ledger` silently skips unattested neighbours, so a replay against a prior receipt whose sidecar is absent/damaged reads `VALID`

**Attacked:** §C1 ledger clause as repaired by addendum item 4: "it flags a nonce **only
when** another receipt in `<dir>` binds the SAME nonce to a DIFFERENT record digest — the
target itself and byte-identical duplicates (same digest) are exempt." The only exemptions the
frozen text authorizes are *self* and *same digest*.

**Where:** `scripts/receipt-attest.mjs`
- `249-269` `attestationState()` returns `attested:false` unless **the sidecar hash AND the
  inner digest** both check out
- `367-370` the ledger loop `continue`s (prints "ledger skipped … not an attested receipt")
  before the nonce comparison at `371`

**Evidence (live).** `/tmp/r51rev-driver.mjs` T2: take a genuine receipt `orig2.txt`, flip one
nibble of its sidecar (a damaged/partially-restored prior), then craft a twin with the **same
nonce** and a **different record digest** (canonical, sidecar recomputed):

```
T2 twin nonce===orig nonce: true digests differ: true
T2 twin alone exit=0 last="RECEIPT: VALID"
T2 twin --ledger exit=0 last="RECEIPT: VALID" out="receipt-attest: ledger skipped orig2.txt: not an attested receipt (sidecar hash mismatch)\nRECEIPT: VALID"
```

Under the frozen wording this must be `RECEIPT: REPLAY` exit 1 (a different receipt in the
directory binds the same nonce to a different digest); it is `VALID` exit 0.

**Why the filter is not needed for the frozen arms.** The committed A3 control carries
run-2's exact body — verified: `control vs run2: nonce_eq= True digest_eq= True body_eq= True
prelude_eq= False`. Addendum item 4's problem was the *literal* "nonce already present"
reading; under the clarified reading the control is exempt by **digest equality**, not by
attestation. So the extra attestation filter buys nothing for A4/A3 and costs a detection
class.

**Minimal repair (recommendation):** parse every `*.txt` in the ledger directory with
`splitReceipt`; flag when the neighbour's `record.nonce === record.nonce` and its stored
`record.digest` differs from the subject's, regardless of whether the neighbour's sidecar or
inner digest is intact (keep self/same-digest exemptions). A neighbour that cannot be parsed
at all may still be skipped, with the diagnostic kept.

---

## F3 — MEDIUM — the committed A3 fixture has no sidecar, so the arm tests the *missing-sidecar* class, not the declared "sidecar untouched" prelude-rewrite forgery

**Attacked:** integration output of wave 1 / the L1; plan §C1 A3 wording "run-2's receipt with
only the `run-at:` prelude rewritten, **sidecar untouched** — the exact lesson-M2 forgery",
and addendum item 6 (which repaired exactly this class for the probe's A3c).

**Evidence (rev `7d88faa7`).**

```
$ git ls-tree -r --name-only 7d88faa7 .ufo/waves/round-51/receipts/
  .ufo/waves/round-51/receipts/attest-run-1.txt
  .ufo/waves/round-51/receipts/attest-run-1.txt.sha256
  .ufo/waves/round-51/receipts/attest-run-2-replayed.txt      <-- no .sha256
  .ufo/waves/round-51/receipts/attest-run-2.txt
  .ufo/waves/round-51/receipts/attest-run-2.txt.sha256
  .ufo/waves/round-51/receipts/run-1.out
```

Shipped verifier on the committed control:

```
receipt-attest: sidecar .../attest-run-2-replayed.txt.sha256 is absent (ENOENT): the receipt bytes are not vouched for
RECEIPT: TAMPERED            (exit 1)
```

It exits on the **sidecar-absent** branch (source lines 316-324) and never compares the
prelude-covered hash. The declared construction, re-issuing the fixture in `/tmp` with
run-2's genuine sidecar copied next to it, yields the same verdict via the *correct* branch:

```
receipt-attest: sidecar mismatch: sidecar 7d0f3e07…  actual 93915509…
RECEIPT: TAMPERED            (exit 1)
```

**Consequence:** A3's verdict class is unchanged (so `ATTEST_HELD` arithmetic is unaffected),
and A3c covers the declared class live — but the committed *artifact* does not demonstrate
the sentence §C1 attributes to it, and a verifier that treats "sidecar absent" as TAMPERED
passes A3 without ever exercising prelude-byte coverage. Addendum item 6 fixed precisely this
defect for A3c; the fixture itself was never re-issued. Minimal repair: commit
`.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256` as a byte copy of
`attest-run-2.txt.sha256` (verified above to produce `TAMPERED` via sidecar mismatch).

---

## F4 — LOW — sidecar is not GNU `sha256sum` format when the receipt basename needs escaping; `run` and `verify` then disagree on a genuine pair

**Attacked:** §C1 "writes `<base>.txt` and `<base>.txt.sha256` (**GNU `sha256sum` format** over
the exact receipt bytes)".

**Where:** `153-154` `sidecarLine(hash, name) => `${hash}  ${name}\n`` writes the raw basename;
coreutils escapes `\` and newline and prefixes the line with `\`. `157-160` `parseSidecar`
cannot parse the escaped form either (no unescape, `\S+` cannot span a newline).

**Evidence (live).** `/tmp/r51rev-driver.mjs` T5:

```
T5 run exit= 0 sidecar bytes= "d97cbf25…  we\nird.txt\n"
T5 verify exit=1 last="RECEIPT: TAMPERED" out="… is not a GNU sha256sum line\nRECEIPT: TAMPERED"
T5 sha256sum -c (GNU) exit= 1 stderr= "sha256sum: we: No such file or directory"
```

So `run` exits 0 and emits a pair that GNU `sha256sum -c` rejects and that the instrument's
own `verify` calls `TAMPERED`. Low severity (pathological basename; the lane's receipts are
ordinary names), but it falsifies the "GNU format" clause and the run↔verify invariant.
**Minimal repair:** escape per coreutils (and unescape in `parseSidecar`), or reject basenames
containing `\` or newline in `run` with exit 64/2.

---

## F5 — LOW — `verify` accepts receipts `run` cannot produce (blank-line tolerance)

**Where:** `116-132`, specifically `117` `text.split('\n').filter((l) => l.length > 0)` — the
two-line check counts **non-empty** lines only.

**Evidence (T3):** insert one blank line between prelude and JSON, recompute the sidecar:

```
T3 bytes: "run-at: 2026-10-24T02:45:40.959Z\n\n{…}\n"
T3 verify exit=0 last="RECEIPT: VALID"
```

Three physical lines verify `VALID`, while the documented receipt form is "exactly two lines
(plus a trailing newline)" (source lines 14, 227). Not a detection bypass (the digest still
binds the body), but the canonical shape is not enforced. **Minimal repair:** split once and
require `[prelude, json, '']` exactly.

---

## F6 — LOW — capture failure is recorded as a fabricated exit `127` with an empty stdout hash, and `run` still exits 0

**Where:** `197-213`. `r.error` (ENOENT, ENOBUFS) → `exitCode = 127`, `stdout = empty`,
`stderr =` synthesized message; the receipt stores only the **hash** of that message, so the
record cannot be distinguished from a command that genuinely exited 127.

**Evidence (live).**

```
T12 run exit= 0 recorded exit= 127 stderr_sha==sha(msg)= true verify= 0 "RECEIPT: VALID"
T13 (>64 MB output) run exit= 0 recorded exit= 127 stdout_sha= e3b0c44298fc ms= 49
T13 verify= 0 "RECEIPT: VALID"
```

T13 ran `/usr/bin/head -c 70000000 /dev/zero`: the command executed and produced 70 MB, but
the receipt claims exit 127 and an empty stdout. The source comment says "record the failure
honestly"; the receipt does not carry the distinguishing fact (only a hash of it), so a
verifier sees a normal-looking 127 record. **Minimal repair:** add a `capture_error` field
(or numeric `exit` plus a `spawn_status` string), and consider making `run` exit non-zero when
the pair records a capture failure.

---

## F7 — LOW/INFO — a failed sidecar write leaves a half-pair on disk

**Where:** `231-237`: `writeFileSync(file)` and `writeFileSync(side)` in one `try` with no
cleanup; if the second write throws, the receipt is already committed and `run` exits 2.

**Evidence (live):** block `<base>.txt.sha256` with a directory:

```
blocked-sidecar exit=2  err=[receipt-attest: UNREADABLE cannot write receipt pair (EISDIR)]
-rw-r--r-- 1 vgpnk vgpnk 463 … t5/half.txt
receipt-attest: sidecar … is absent (EISDIR): the receipt bytes are not vouched for
RECEIPT: TAMPERED
```

**Minimal repair:** write both to temp names and rename, or unlink the receipt on sidecar
failure.

---

## F8 — INFO — `verify` does not enforce the semantic-field whitelist, and diagnostics mislabel an unreadable sidecar

1. **Extra fields are accepted.** `shapeError` (`136-148`) rejects missing/malformed known
   fields but never unknown ones. A receipt with an injected `"env":{"PATH":…,"…":"secret"}`
   field — canonical digest and sidecar recomputed — verifies as declared:

   ```
   RECEIPT: VALID
   exit=0
   ```

   The shipped `run` never writes env (byte-level sentinel check, below), so §C1's "No env is
   recorded" holds for the *producer*; but the *verifier* will bless a record that does carry
   env. If that property is meant to be machine-checked, add an allowlist of record keys.
2. `316-324` reports a sidecar that exists but is unreadable as "absent (EISDIR)" (T14:
   `TAMPERED` exit 1, correct class, wrong cause). Cosmetic.
3. `PRELUDE_SLACK_MS = 60_000` (`75`) accepts a re-dated prelude within ±60 s of the wall
   window when the sidecar is repaired (T4: `+30 s → VALID`; `+120 s → TAMPERED`). This is
   residual risk for the re-dating narrative, not a contract breach: §C1 claims the *sidecar*
   catches re-dating, which it does when untouched (A3/A3c).

---

## Verified-held (what the shipped bytes do get right — each with the run that shows it)

| # | Contract item | Evidence |
|---|---|---|
| V1 | `--selftest` (A1) | `node receipt-attest.mjs --selftest` from the extracted rev: `ATTEST_CASES: 27 passed, 0 failed`, `ATTEST_SELFTEST: PASS`, exit 0, 27 `ATTEST_CASE … PASS` lines (≥10 required). |
| V2 | run mode argv/exit/stdout capture (A2c shape) | `run --out out/a2c -- /usr/bin/printf %s <nonce>` → receipt `argv` exactly `["/usr/bin/printf","%s","<nonce>"]`, `exit 0`, `stdout_sha256 == sha256(nonce bytes)` (checked in-process), `stderr_sha256 == sha256("")`, `prelude == "run-at: " + wall_start`, keys sorted, `sha256sum -c a2c.txt.sha256` → `a2c.txt: OK` exit 0, `verify` → `RECEIPT: VALID`. |
| V3 | canonical digest (parse → drop → sort → stringify → sha256) | Independent Python re-implementation on the committed receipts: `attest-run-1.txt py_digest==stored: True`, `attest-run-2.txt py_digest==stored: True`; Unicode argv `["/usr/bin/printf","%s","héllo→𝄞"]` → `py_unicode_digest_eq= True`. Portable across implementations for the field set `run` emits. |
| V4 | check order (digest → sidecar → clocks → ledger → prelude) | Combined mutation (body doctored with **stale digest** + prelude re-dated + sidecar nibble-flipped) reads `inner digest mismatch … RECEIPT: REPLAY` exit 1 — digest wins. Sidecar-only tamper reads `TAMPERED` (T6/exact A3c). |
| V5 | ledger same-digest + self exemption (addendum 4) | Selftest cases `ledger-exempt-a-byte-identical-duplicate` and `ledger-ignores-an-unattested-copy` PASS; live `verify --ledger t2/solo t2/solo/uni.txt` → `RECEIPT: VALID` (subject exempt); ledger over the committed receipts dir returns `VALID` for runs 1-2. |
| V6 | A4c class | `/tmp/r51rev-driver.mjs` T7: original alone `VALID`, twin alone `VALID`, `verify --ledger` on **both** → `nonce … already bound to a different record in …` + `RECEIPT: REPLAY` exit 1. |
| V7 | sidecar resolved next to the receipt, never via cwd | T8: verify from a foreign cwd holding a stale sidecar → `sidecar mismatch … TAMPERED` exit 1 (no cwd fallback); selftest case 27 PASS. |
| V8 | no env recorded | `KUMITATE_SENTINEL=leaky-<nonce> run …` → `sentinel_in_receipt= false`; receipt keys exactly `argv,digest,exit,mono_span_ms,nonce,stderr_sha256,stdout_sha256,wall_end,wall_start`. |
| V9 | verdict last line | `verify … \| tail -1` → `RECEIPT: VALID`; ledger diagnostics print before the verdict (`… ledger skipped …\nRECEIPT: VALID`); unreadable paths print no verdict (exit 2). |
| V10 | exit map 0/1/1/64/2 | `noargs 64`, `bogus 64`, `verify-noargs 64`, `missing 2`, `verify <dir> 2`, `run --out /usr/nope/x` → `UNREADABLE cannot write receipt pair (EACCES)` exit 2; usage paths (`181`, `185-187`, `286`, `289`, `798`, `808`) → 64; REPLAY/TAMPERED exit 1; VALID 0. |
| V11 | run records command exit, signals, binary output | `printf '\377'` → `stdout_sha256 == sha256(0xFF)` true, `exit 0`; `/bin/sh -c 'kill -TERM $$'` → receipt `exit 143`, `run` exit 0, stdout tail `receipt-attest: command-exit 143`. |
| V12 | no `sha256sum` spawning (addendum 5) | Only `spawnSync` uses are the recorded child (`192`) and selftest recursion (`402`); `sha256sum` appears only in comments and diagnostic strings. All digests are `node:crypto` (`79`, `106-110`, `234`). |
| V13 | committed artifacts at rev | Run-1/run-2 `RECEIPT: VALID`; doctored control `RECEIPT: TAMPERED` exit 1; run-1 vs run-2 nonce/digest/argv/stdout all distinct; control carries run-2's exact nonce **and** digest (addendum-4 exemption is digest-equality, which is why the extra attestation filter in F2 is unnecessary). Sidecars are GNU text mode (`<64hex>  <basename>`) with hashes `7b87133a…` / `7d0f3e07…`. |

---

## Residual risk

1. **Predicate under-coverage (from F1/F2).** `ATTEST_HELD` can read 9/9 on a verifier that
   reports `VALID` for impossible clocks and can be neutralized by a damaged prior sidecar.
   Both are contract-text falsifications that no frozen arm samples. If the round's claim is
   read as "the instrument implements §C1", F1 must be repaired before the capability row is
   treated as complete; if it is read only as "the nine arms pass", the reading is honest but
   weaker than the §C1 prose.
2. **Author-attested clocks (declared limit (a)/(b)).** Preclude re-dating within ±60 s when
   the sidecar is repaired (F8.3), and A2's ≥300 s span is prelude-based — a forger with
   sidecar-repair capability can shift the prelude up to 60 s past the wall window and still
   verify `VALID`; the three round-51 receipts are only 235.7 s apart at `run-at` today
   (02:35:11.057 → 02:39:06.793), so receipt 3 must land ≥ 02:40:11.057 to satisfy A2.
3. **Ledger is directory-scoped and evidence-based.** Non-recursive, `*.txt`-only, and (per
   F2) attested-only. A caller who passes the wrong `--ledger` dir gets a `VALID` with only
   skip diagnostics; there is no "ledger empty" warning.
4. **No environment isolation.** The child inherits the caller's environment (documented line
   48-49); a receipt therefore cannot distinguish two runs that differ only by env. It is not
   recorded, as claimed, but it is also not prevented from influencing the recorded output.
5. **No fsync / atomic pair write** (F7): a crash between the two writes leaves a receipt whose
   `verify` is `TAMPERED`.

## Verification gaps

- Receipt 3 (`attest-run-3.txt`) is absent at `7d88faa7`; A2's span/distinctness arms will
  MISS until it is issued — expected per dispatch, not reported as a finding.
- The `/proc/nope` `mkdirSync` hang observed during testing is **host-specific** (an isolated
  `node -e 'mkdirSync("/proc/nope",{recursive:true})'` also hangs under `timeout 3`); the
  write-failure exit-2 path was therefore verified against `/usr` instead. Not attributed to
  the instrument.
- Not tested: non-UTF-8 argv bytes, Windows/`node:os.constants.signals` behaviour, symlinked
  ledger directories, `--ledger` recursion (top-level scan is the documented reading),
  Digest/FS race conditions.
- No frozen counter, plan, script, corpus, SCORECARD, SKILL file, or git/jj state was
  modified; the only lane write is this report. All mutation files live under
  `/tmp/r51rev.*` (`receipt-attest.mjs` copy + `r51rev-driver{,2}.mjs`).
- No tooling was installed or updated for this review.

## Recommendation (non-admission)

Repair F1 (finite-clock guard) and F2 (parse neighbours regardless of attestation) before the
instrument is cited as implementing §C1; re-issue the A3 fixture's sidecar (F3) so the control
exercises the class it names. F4-F7 are follow-ups that do not affect the predicate. The
frozen arms themselves read as declared on the evidence above; none of them samples F1 or F2.
