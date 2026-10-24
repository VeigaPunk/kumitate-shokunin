# RevCounterANew — focused trace of the four NEW A52 arms (B1c, B2e, B5c, B6)

Seat: `RevCounterANew` (reviewer). Round 52, wave 1. Read-only on the lane.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Lane tip at review: `ac56743`
(`scripts/receipt-attest.mjs` still `CONTRACT='kumitate-receipt-attest-v1'`, 808 lines).
Frozen counter: `.ufo/waves/round-52/probe/attest52-probe.mjs` (474 lines, rule A52 v1,
sha256 `f6146a2c…c5171428`). Base receipt: `.ufo/waves/round-52/base/attest52-base.txt`
(`ATTEST52_UNMET held=5/13`, rev `02c01258…`).

Method: read the probe line-by-line (all 474 lines) and the v1 instrument's canonical/verify
paths; then executed three experiments, all artifacts in
`.ufo/waves/round-52/build/RevCounterANew/`:

- `filter-mutant.mjs` — frozen probe with one token added to `hold` (line 114): records only
  passing checks. Run against base rev → `filter-mutant.out`.
- `redate.mjs` — five crafts against the real v1 instrument (read-only invocation; outputs in
  the aux dir) → `v1fresh.txt`, `a-body-only-month13.txt`, `b-consistent-feb30-roll.txt`,
  `c-consistent-hour24-roll.txt`, `d-consistent-year0000.txt`, `e-consistent-leap60.txt`.
- Node Date.parse/round-trip matrix on the canonical runtime (`node v24.21.0`).

No installs (no pacman — host guard respected; nothing needed). No writes outside
`build/RevCounterANew/` and this file. Read-only git only.

---

## F1 [HIGH] B5c cannot see the vacuity class it names; a mutant probe prints HELD at the base rev

**Demonstrated.** One token on the frozen probe's `hold` (line 114,
`if (typeof id === 'string')` → `… && ok`) and the counter reports, at the same rev where the
frozen counter reports `UNMET held=5/13`:

```
ATTEST52: ATTEST52_HELD held=5/5 checks=5 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B2c PASS | B3c PASS | B4c PASS | B4d PASS | B6 PASS
exit=0
```

The eight failing checks vanish from `checks`; `held === checks.length && checks.length > 0`
is true; `/checks\.length\s*>\s*0/` and `/held\s*===\s*checks\.length/` both still match the
mutant source (verified programmatically: `selfGuard: true`). This is R52-5's vacuity class in
its cheapest form — "dropped failures", not "dropped hold calls".

**Why the self-reference cannot help.** `selfSrc = readFileSync(fileURLToPath(import.meta.url))`
(probe:440-443) reads the *running* file. The judged tree's copy
`.ufo/waves/round-52/probe/attest52-probe.mjs` is never read; B5 pins only the instrument
(probe:416-433), and no pin anywhere covers the probe's own bytes. Text presence is trivially
spoofable: the doc comment at probe:70 already contains the literal `checks.length > 0`, so a
mutant can delete both live guards (472 and 474) and still satisfy the first regex; adding the
same phrase in a comment satisfies the second. A self-referential text match asserts nothing
about behavior — it can only catch the author who deletes the text along with the guard.

**K4's drop-one clause is unsatisfiable by the frozen probe.** Nothing asserts
`checks.length === 13`; the denominator is free. Peer battery (`build/MutCounter52/mutants/
results.json`) shows drop-one at the base rev reading `held=5/12 checks=12`. At a *green* rev the
same expression yields `ATTEST52_HELD held=12/12 checks=12` exit 0 — K4 says such a mutant
"must never print HELD". The committed transcript regex (probe:438) hardcodes
`/held=0\/0/`, i.e. the only acceptable transcript shape is hold-deleted; a green-rev drop-one
transcript would make B5c **MISS**. (Also: the regex wants the literal `exit 1`; the natural
`exit=1` spelling does not match.)

**B5c's required artifact cannot reach the counter today.** `counter-mutant.txt` lives under
`.ufo/waves/round-52/build/MutCounter52/`, which is untracked (`git ls-files` lists nothing
there; `git archive HEAD -- .ufo/waves/round-52/build` produces an empty tar). The probe reads
it from the *extracted commit* (probe:432, `join(T, '.ufo', …)`). The plan's close sequence
(step 1) does not list committing it. Unless L1 commits
`.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt`, B5c MISSes at R1/R2 and C1 tops
out at 12/13. At this writing the seat's dir has `baseline.out`, `mutants/*.out`,
`mutants/results.json` — no `counter-mutant.txt`.

**Fixes (cheapest first):** (a) assert `checks.length === 13` in the label/exit (freeze
addendum + fresh base receipts required); (b) have B5c read the *tree's* probe copy and compare
its sha256 to the running source, and pin the probe sha in SCORECARD beside
`pin.receipt-attest`; (c) replace the transcript read with an executed mutant: copy the tree's
probe, apply the hold-deletion patch at probe time, run it, require `UNMET held=0/0` exit 1
(the probe already does exactly this kind of live craft for B1c/B2c/B3c/B4c/B4d); (d) commit
the transcript and use the literal `exit 1`.

## F2 [HIGH] B1c exercises the NaN branch, not the roll branch; a finite-only v2 passes while R52-1's rolled clocks survive

**Runtime facts (measured, `node v24.21.0`):**

| field | Date.parse | `toISOString()` round-trip |
|---|---|---|
| `2026-13-01T00:00:00.000Z` (the frozen fixture) | **NaN** | throws |
| `2026-02-30T00:00:00.000Z` | finite → 2026-03-02 | **no** (rolls) |
| `2026-10-24T24:00:00.000Z` | finite → next day | **no** (rolls) |
| `2026-10-24T01:04:60.000Z` (`:60`) | **NaN** | throws |
| `0000-01-01T00:00:00.000Z` | finite | **yes** (exact) |

The frozen fixture is the NaN class, not a roll. V8 never rolls month 13; it returns NaN. The
plan's own example for CLOCK ("rejects every rollover, e.g. month 13 → next January") is
therefore not this runtime's behavior, and the fixture followed the wrong example.

**Measured consequence.** Against the real v1 instrument:
- body-only month-13 with the genuine prelude → `exit=0 RECEIPT: VALID` (this *is* the frozen
  arm's fixture, and matches base `B1c MISS … "RECEIPT: VALID"`);
- **consistent** re-dating (prelude *and* body) to Feb-30 → `exit=0 RECEIPT: VALID`;
- **consistent** re-dating to `T24:00:00.000Z` → `exit=0 RECEIPT: VALID`;
- consistent re-dating to `:60` → `TAMPERED` (v1's prelude `!Number.isFinite` check at
  `scripts/receipt-attest.mjs:387` fires — the prelude was NaN).

The window check compares the prelude to the body clocks
(`scripts/receipt-attest.mjs:385-387`); when only the body is moved, a far clock is rejected by
the *window*, not by CLOCK, so the arm cannot attribute its rejection. But every *finite* V8 roll
is ≥1 day away (day overflow, hour 24), i.e. always outside the ±60 s window — so a finite roll
can only pass the window when the prelude is moved with it. That is precisely the receipt B1c
never builds. A v2 that implements `Number.isFinite(Date.parse(f))` only (no round-trip) passes
the frozen B1c (month-13 → NaN → reject) and still accepts Feb-30/T24:00 in a consistently
re-dated receipt — the exact half of R52-1 the contract's CLOCK clause exists to close.

**Craft soundness — positive result.** The surgery itself is canonical. The probe's digest
recompute (`sortKeys` recursion, destructure out `digest`, `JSON.stringify`, probe:155-163)
is byte-identical to v1's `canonical()` + `digestOf()` (`scripts/receipt-attest.mjs:96-109`);
the sidecar is rewritten as `sha(bytes)  basename` (name = basename of the crafted path); the
trailing newline is preserved. Base receipt's `B1c MISS exit=0 last="RECEIPT: VALID"` is the
proof: v1 accepted the crafted pair as digest- and sidecar-valid, so only the clock differed.
The defect is fixture *choice*, not fixture *craft*.

**Fix.** Craft prelude+body = `2026-02-30T00:00:00.000Z` and `2026-10-24T24:00:00.000Z` (digest
and sidecar recomputed), and require exit 1 + `RECEIPT: TAMPERED`. Both are legal under the v2
SHAPE regex, so this is a pure fixture addition.

## F3 [MEDIUM] B1c accepts a crash (or any nonzero exit) as PASS

`b1cok = v.status !== 0 && !/RECEIPT: VALID/.test(last)` (probe:172). A v2 that applies the
round-trip before the finite guard, e.g. `new Date(Date.parse(f)).toISOString() === f`, throws
`RangeError` on the NaN fixture. Measured: exit 1, last line `Node.js v24.21.0`, and the frozen
predicate evaluates **true**. So a verify that crashes instead of emitting a verdict scores the
arm green. The contract requires `RECEIPT: TAMPERED` exit 1. Fix: `v.status === 1 &&
/RECEIPT: TAMPERED/.test(last)` (B3c and B4d already pin verdict+exit; B1c is the outlier).

## F4 [MEDIUM] B2e binds data, not execution; what it proves is narrower than "the nonce is instrument-generated and unpredictable"

**Exactly what B2e proves** (probe:236-256): (i) the tool emits a receipt in the v2 shape;
(ii) its own `verify` accepts it; (iii) the recorded `stdout_sha256` equals sha256 of the
recorded nonce's bytes, **independently reproduced by running `/bin/cat`**; (iv) the recorded
`stdin_sha256` equals the same value; (v) the sidecar validates.

**What it does not prove:** that a child was spawned, that the nonce bytes were delivered on
stdin, that the nonce came from instrument entropy, or that it was unpredictable. The probe
cannot observe any of those.

**Circularity, stated plainly.** The nonce is read *from the receipt*; both hashes are
instrument-authored; the arm's core assertion is the identity `sha(n) == sha(n)`. A zero-spawn
forger writing `nonce=n`, `stdin_sha256=stdout_sha256=sha(n)`, `argv=[…,'--stdin','--','/bin/cat']`
passes B2e and B2c completely. The independent `cat` run upgrades the claim from
"self-consistent" to "the recorded stdout is the hash of the nonce bytes" — no more. Against an
*honest* but partially broken implementation the arm does bite: any extra byte on stdin (e.g. a
trailing newline) makes the recorded stdout hash diverge from the probe's independent echo →
MISS. That byte-precision is the arm's real value.

**Unpredictability is untested.** The only nonce-uniqueness test is B2 over three committed
`run` receipts; the `--stdin` path's nonce is exercised once, in B2e. A constant nonce on the
stdin path passes every arm. The probe also never asserts the 32-hex form
(`/^[0-9a-f]{32}$/`) on `j.nonce`. Cheap additions: two consecutive `run --stdin -- /bin/cat`
invocations must yield distinct nonces; assert the nonce regex.

## F5 [MEDIUM] B6 is a fixed-input capability check: a hash allow-list passes, and the negative compat direction is untested

B6 (probe:449-461) verifies exactly the three committed round-51 files by path and requires
`VALID` exit 0. Nothing synthesizes a v1-shaped receipt and nothing inspects the verdict reason.
A v2 whose `verify` begins `if (KNOWN.has(sha256(bytes))) { print VALID; exit 0 }` passes B6 —
and B5, since the pin is derived from the same bytes. B1 would not notice: it counts
`/^case\s+\S+:\s+PASS\s*$/` lines and the final `ATTEST_SELFTEST: PASS` textually (probe:130-139, `cases >= 30` at :136).
So **yes, a v2 that special-cases the three r51 receipts passes B6**, and it can do so while
implementing none of the compat path.

**Is it inside the boundary?** K3 admits "a tree author who implements the full contract". A
hash allow-list is not a full-contract implementation, so it sits *outside* the declared forgery
boundary — but no counter enforces that boundary for compat. B5c's transcript is authored
evidence, not execution evidence; B6 is a capability check on three frozen inputs.

**Also missing: the negative compat arm.** B6 only says "old genuine receipts still VALID". It
never says "old receipts that v1 wrongly accepted must now be rejected" — e.g. the consistent
Feb-30 re-dating from F2 must read `TAMPERED` under v2. Without that, v2 could be byte-for-byte
permissive on v1-format input and still score 13/13.

**Cheapest fix, symmetric to F2:** synthesize a fourth receipt from a genuine `run` (fresh
nonce, `stdin_sha256` absent, valid clocks, prelude consistent, digest+sidecar recomputed, v1
field set) → must read `VALID`; and the Feb-30 consistent re-dating in v1 format → must read
`TAMPERED`. The first kills the allow-list and cross-checks canonicalization in the positive
direction (B1c checks it negatively).

**Input compatibility verified (no conflict):** the three r51 receipts are 2 lines + trailing
newline, the prelude matches the strict regex, the field set is exactly the v1 eight
(`argv, digest, exit, mono_span_ms, nonce, stderr_sha256, stdout_sha256, wall_end, wall_start`,
no `stdin_sha256`), and the sidecar name equals the basename — so v2's SHAPE whitelist and
two-line rule do not make B6 impossible.

## F6 [LOW] CLOCK has no plausibility floor; year 0000 is accepted by design

`0000-01-01T00:00:00.000Z` parses finite and round-trips exactly, so the contract's predicate
accepts it. A consistently re-dated receipt dated year 0000 reads `VALID` under v1 (measured;
window agrees because both sides are 0000) and would read `VALID` under a contract-faithful v2.
RFC 3339's `date-fullyear = 4DIGIT` permits year 0000, so this is a semantic limit, not a
counter bug: CLOCK proves "canonical instant", not "plausible instant". The doctrine entry
(`fail-closed-clock-validation.md`) must not claim more; a plausibility floor would be a new
contract clause with its own check. Leap-second `:60` is rejected (NaN) — but via the finite
branch, and v1 already rejected it when the prelude was also `:60` (measured `TAMPERED`), so
the leap case was never v1's body-field hole.

## F7 [LOW] `rev=` is the caller's argument string, not a resolved commit

Probe:473 prints `rev` verbatim; `git archive` accepts any rev expression. A run with a branch
or tag prints `rev=main`, and nothing resolves `rev^{commit}` or compares it to the tree. The
close discipline quotes a full sha, so this is cosmetic today, but the counter should resolve
and print the commit sha. Verified safe: a bad rev makes the archive pipeline exit 2 (GNU tar
exits 2 on an empty archive) → the header's `exit 2` FAIL-CLOSED path, not a scored 0/13. That
safety is a GNU-tar behavior, not `pipefail`-guaranteed.

## Adjacent observations (not my arms; owning seats)

- B4's prior-corpus walk filters files by *basename* only (`/receipt|ReRun|L1-score/i`, probe
  around :321), so `.ufo/waves/round-51/receipts/attest-run-*.txt` — the r51 receipt corpus —
  are never scanned (peer `ScoutReceiptCorpora`, same round). None of F1-F7 depend on it.
- The PASS path prints no detail (probe:473), so a green run's transcript cannot show the
  span/nonce/prior-file evidence B2/B4 collected. Already flagged by the same peer.

## Residual risk

- The v2 instrument does not exist at the lane tip (`ac56743`, contract string still `v1`), so
  none of these arms' behavior against the actual v2 bytes is observable. Every "13/13" claim
  remains an L1-integration claim; this report judges counter soundness only.
- B1c's positive discrimination under v2 assumes v2 preserves v1's canonicalization (plan says
  "digest … UNCHANGED from v1"). If it does not, B1c turns into a digest-mismatch pass — which
  is exactly F3's failure mode (any rejection, including the wrong one, scores PASS).
- A determined tree author can defeat any of these checks (K3). The findings are about what the
  frozen counter can and cannot see.
- B2/B3/B4 also stand on artifacts not yet present: `.ufo/waves/round-52/receipts/` does not
  exist (the three spaced receipt runs are an L1 duty), and B5c stands on the uncommitted
  `counter-mutant.txt` (F1).

## Verification gaps I could not close

- No green-rev (13/13) transcript exists, so the drop-one-mutant consequence in F1 is a
  structural proof (`held === checks.length` with 12 passing entries), not a run.
- `counter-mutant.txt` is absent, so B5c is unexecutable end-to-end today (dependency named).
- My crafts used the ambient `node v24.21.0` and host GNU tar/coreutils; `/usr/bin/printf` and
  `/bin/cat` are present and were exercised.
