# MutReceiptBytes — round 51 wave 2, byte-level attack on the committed receipts

Seat `kumitate-r51.GrotesquePiranha` (mutation tester). Attacked the committed receipt bytes of
`.ufo/waves/round-51/receipts/` through the shipped `verify` of `scripts/receipt-attest.mjs`.

**Claim under attack:** `ATTEST_HELD` (A51) — specifically the frozen A2/A3/A3c/A4/A4c/A3d arms,
which assert the verdict classes `RECEIPT: VALID` / `RECEIPT: REPLAY` / `RECEIPT: TAMPERED` for
byte-level mutations of a receipt and its sidecar.

**Result summary:** every one of the 8 requested mutants is **rejected** by the shipped `verify`
with a non-`VALID` verdict class. No mutant reads `RECEIPT: VALID` except (a) a same-digest
verbatim copy, which the assignment explicitly excludes, and (b) a **prelude-only rewrite with a
recomputed sidecar**, which is a same-digest, byte-distinct copy — that one *does* read `VALID`,
and it is a real (if bounded) hole. Three further findings are new relative to the wave-1/wave-2
sibling reports and are constructed here as concrete counterexamples, not inferences.

**No lane mutation.** The lane was read-only for this seat. The only file written inside the lane
is this report. All mutation code and fixtures live under `/tmp/mkt/r51-mutreceipt/`.

---

## 1. Identity of the object under attack

```
$ sha256sum scripts/receipt-attest.mjs .ufo/waves/round-51/receipts/*
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9  scripts/receipt-attest.mjs
7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd  .ufo/waves/round-51/receipts/attest-run-1.txt
3c304084686c3c7a1c651acb9505d35f8d57fce88b77589c4839bed319fe7aa7  .ufo/waves/round-51/receipts/attest-run-1.txt.sha256
9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5  .ufo/waves/round-51/receipts/attest-run-2-replayed.txt
ea19022e7bac2037800f3c855ebf7427aa962a762eb79cf6ef83a4013ae6e6e4  .ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256
7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85  .ufo/waves/round-51/receipts/attest-run-2.txt
ea19022e7bac2037800f3c855ebf7427aa962a762eb79cf6ef83a4013ae6e6e4  .ufo/waves/round-51/receipts/attest-run-2.txt.sha256
c6eac06d911ee1082fb8f9b03eaa19041afa621f2b8e71a8c8bf615ba2715836  .ufo/waves/round-51/receipts/attest-run-3.txt
17e590c3aaee47f36cd66eb9fad8336886eaa20283f17ad5cde3043e5c67dea2  .ufo/waves/round-51/receipts/attest-run-3.txt.sha256
da53775742bada7e83a5d78747516376ff103b8e455eb3efdfdcc5421112855b  .ufo/waves/round-51/receipts/run-1.out
```

The instrument sha256 `44919763…` matches the assignment and the pin. Node `v24.21.0`.

Baseline of the detector, run before any mutation:

```
$ node scripts/receipt-attest.mjs verify .ufo/waves/round-51/receipts/attest-run-2.txt
RECEIPT: VALID
exit=0

$ node scripts/receipt-attest.mjs verify --ledger .ufo/waves/round-51/receipts .ufo/waves/round-51/receipts/attest-run-2.txt
receipt-attest: ledger skipped attest-run-2-replayed.txt: not an attested receipt (sidecar absent (ENOENT))
RECEIPT: VALID
exit=0
```

Frozen counter at lane HEAD (the reference reading this seat attacks):

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin HEAD
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=HEAD rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
PROBE_EXIT=0
```

**Baseline is green.** Every mutant below is therefore scored against a detector that passes on
pristine bytes — a baseline failure would have made the mutant readings inconclusive, and none was.

Note on lane movement: the lane advanced to commit `cd7f69d` ("round-51: receipt 3 + stale-sidecar
doctored control …") *during* this seat's run. `attest-run-2.txt` and its sidecar are byte-identical
across that move (same sha256 above), so every measurement below is against unchanged target
bytes. The new `attest-run-2-replayed.txt.sha256` sidecar is the *pristine* run-2 hash
(`7d0f3e07…`) beside the *re-dated* receipt — the M2 shape with a stale sidecar — and still reads
`TAMPERED`:

```
$ node scripts/receipt-attest.mjs verify attest-run-2-replayed.txt
receipt-attest: sidecar mismatch: sidecar 7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85, actual 9391550915448a8d232375ecbd9bff7c745fed0379f95bc73cb9d5b7bd24b4c5
RECEIPT: TAMPERED
exit=1
```

---

## 2. The 8 requested mutants — exact verdict class and exit

Every mutant is a copy of `attest-run-2.txt` in `/tmp/mkt/r51-mutreceipt/cases/<id>/`, run through
the **shipped** `verify` (never a re-implementation). Baseline in each case is the pristine
receipt plus its pristine sidecar.

| # | Mutant | Command | Verdict class | Exit |
|---|---|---|---|---:|
| M00 | control — pristine copy, unmodified sidecar | `verify <case>/attest-run-2.txt` | `RECEIPT: VALID` | 0 |
| **M01** | **flip one hex char in `nonce`** (`f950…`→`e950…`) | `verify <case>/attest-run-2.txt` | **`RECEIPT: REPLAY`** | **1** |
| **M02** | **flip one hex char in `argv`** (`scripts/proxy-check.mjs`→`scripts/proxy-dheck.mjs`) | `verify <case>/attest-run-2.txt` | **`RECEIPT: REPLAY`** | **1** |
| **M03** | **flip one hex char in `digest`** (`5f7b…`→`0f7b…`) | `verify <case>/attest-run-2.txt` | **`RECEIPT: REPLAY`** | **1** |
| **M04** | **flip one hex char in `wall_end`** (`.866Z`→`.806Z`) | `verify <case>/attest-run-2.txt` | **`RECEIPT: REPLAY`** | **1** |
| **M05** | **truncate the JSON line** (to 100 chars) | `verify <case>/attest-run-2.txt` | *no `RECEIPT:` line* — `UNREADABLE … JSON line does not parse` | **2** |
| **M06** | **swap in run-1's sidecar** (verbatim bytes of `attest-run-1.txt.sha256`) | `verify <case>/attest-run-2.txt` | **`RECEIPT: TAMPERED`** | **1** |
| **M07** | **delete the sidecar** | `verify <case>/attest-run-2.txt` | **`RECEIPT: TAMPERED`** | **1** |
| **M08** | **rewrite only the `run-at:` prelude** (`run-at: 2020-01-01T00:00:00.000Z`), sidecar untouched | `verify <case>/attest-run-2.txt` | **`RECEIPT: TAMPERED`** | **1** |

Verbatim output of the interesting rows:

```
## M01-nonce-hexflip
output: receipt-attest: inner digest mismatch: recomputed 9d8453e46a04333f5958a92aa8176f2c40c58eadd4c4452ae7cb564ee22b89eb, recorded 5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01
        RECEIPT: REPLAY
VERDICT: RECEIPT: REPLAY  exit=1

## M03-digest-hexflip
output: receipt-attest: inner digest mismatch: recomputed 5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01, recorded 0f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01
        RECEIPT: REPLAY
VERDICT: RECEIPT: REPLAY  exit=1

## M04-wallend-hexflip   (wall_end .866Z -> .806Z)
output: receipt-attest: inner digest mismatch: recomputed 86624bcd01f6189c7f2575b5f2afdcd63e9d1bb34372b0af940af054b00bc715, recorded 5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01
        RECEIPT: REPLAY
VERDICT: RECEIPT: REPLAY  exit=1

## M05-json-truncated
output: receipt-attest: UNREADABLE malformed receipt …/attest-run-2.txt: JSON line does not parse: Unterminated string in JSON at position 100 (line 1 column 101)
VERDICT: receipt-attest: UNREADABLE …  exit=2

## M06-sidecar-from-run1
output: receipt-attest: sidecar mismatch: sidecar 7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd, actual 7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85
        RECEIPT: TAMPERED
VERDICT: RECEIPT: TAMPERED  exit=1

## M07-sidecar-deleted
output: receipt-attest: sidecar …/attest-run-2.txt.sha256 is absent (ENOENT): the receipt bytes are not vouched for
        RECEIPT: TAMPERED
VERDICT: RECEIPT: TAMPERED  exit=1

## M08-prelude-only-rewrite
output: receipt-attest: sidecar mismatch: sidecar 7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85, actual df31621de971f9ad22c7a1a14c16bcc5bdf805e7c53e394839e9eeb03829afa2
        RECEIPT: TAMPERED
VERDICT: RECEIPT: TAMPERED  exit=1
```

**Assignment criterion:** "Any mutant reading VALID (except a same-digest verbatim copy) is
CRITICAL." **None of the eight requested mutants reads `VALID`.** The inner digest catches M01–M04
before the sidecar is even consulted; the sidecar catches M06–M08; M05 fails closed at exit 2.
**No CRITICAL result among the eight.**

---

## 3. FINDING F1 (the one VALID-reading mutant) — prelude-only rewrite with a recomputed sidecar

The inner digest deliberately does **not** cover the `run-at:` prelude (`scripts/receipt-attest.mjs:105-109`
hashes the JSON record only). So a prelude-only rewrite leaves the inner digest intact, and the
*only* thing that catches it is the sidecar — which the forger can recompute, since the sidecar is
a plain public hash of the file it covers.

A prelude re-dated by **+45 s** with the sidecar recomputed reads `RECEIPT: VALID`, exit 0:

```
## M09-prelude-rewrite-sidecar-forged
desc:   rewrite only the run-at prelude (sidecar recomputed), prelude shifted +45 s
bytes:  receipt sha256 a48f2ad0b4018863189dc11f3039365d53e80f648d52c196c86f1f7579815b8c | sidecar sha256 6539d723c46bb88b32e49f5ea7a843919b62872e4696782f5ac6a15f107796e0
output: RECEIPT: VALID
VERDICT: RECEIPT: VALID  exit=0
```

And the ledger does **not** catch it, because the record digest is unchanged and the frozen
same-digest exemption (freeze addendum item 4) applies:

```
## M10-prelude-rewrite-forged-sidecar-LEDGER
cmd:    node scripts/receipt-attest.mjs verify --ledger <ledger> <case>/attest-run-2.txt
output: receipt-attest: ledger skipped attest-run-2-replayed.txt: not an attested receipt (sidecar absent (ENOENT))
        RECEIPT: VALID
VERDICT: RECEIPT: VALID  exit=0
```

The accepted window was sampled point by point (sidecar recomputed for each):

| prelude offset from `wall_start` | verdict | exit |
|---:|---|---:|
| −60,000 ms | `RECEIPT: VALID` | 0 |
| −30,000 ms | `RECEIPT: VALID` | 0 |
| −1,000 ms | `RECEIPT: VALID` | 0 |
| 0 ms (pristine) | `RECEIPT: VALID` | 0 |
| +1,000 ms | `RECEIPT: VALID` | 0 |
| +30,000 ms | `RECEIPT: VALID` | 0 |
| +59,999 ms | `RECEIPT: VALID` | 0 |
| +60,000 ms | `RECEIPT: VALID` | 0 |
| +60,001 ms | `RECEIPT: VALID` | 0 |
| +90,000 ms | `RECEIPT: TAMPERED` | 1 |
| +3,600,000 ms | `RECEIPT: TAMPERED` | 1 |

```
## prelude-shift-+60001ms
output: RECEIPT: VALID
VERDICT: RECEIPT: VALID  exit=0

## prelude-shift-+90000ms
output: receipt-attest: prelude 2026-10-24T02:40:36.793Z is outside the recorded wall window [2026-10-24T02:39:06.793Z, 2026-10-24T02:39:06.866Z]
        RECEIPT: TAMPERED
VERDICT: RECEIPT: TAMPERED  exit=1
```

**Scope and honesty of the claim.** The bound is `[wall_start − 60,000 ms, wall_end + 60,000 ms]`,
i.e. `PRELUDE_SLACK_MS = 60_000` at `scripts/receipt-attest.mjs:75`, checked at lines 384–390. A
300 s-scale re-dating (the M2 shape) is still rejected. So this is **not** a defeat of the M2
forgery class at its declared scale.

What it *is*: a **same-record-digest, byte-distinct receipt that reads `VALID`**. The receipt's
file sha256 changes (`7d0f3e07…` → `a48f2ad0…`), so the A2 arm's "pairwise-distinct file sha256"
property is satisfied by a *display field the forger chose*. This is the same finding family as
sibling `CritA2Span.md` and `CritLedger.md` (which measured the ±60 s boundary and the
same-digest exemption independently); this seat confirms it byte-first and adds the concrete
**A2 consequence in §5**, which the sibling report explicitly declined to construct.

**Smallest safe correction (doctrine, not code).** The integrated entry
`corpus/knowledge/invocation-attestation.md:31-33` says "a re-dated prelude fails even if the
sidecar were recomputed". That is false without the tolerance qualifier. Correct wording: an
unchanged sidecar detects any byte rewrite; after the forger recomputes the sidecar, a
**prelude-only** variant still reads `VALID` whenever its prelude falls inside
`[wall_start − 60 s, wall_end + 60 s]`, and the ledger does not see it because the record digest is
unchanged. Only a *different* semantic digest reusing a nonce triggers ledger `REPLAY`. Retain the
Q39 ceiling — this is a tolerance boundary, not proof of temporal truth, and not grounds to claim
an A51 failure.

---

## 4. FINDING F2 (new) — the `run-at:` prelude is never shape-checked, and its verdict is timezone-dependent

`shapeError()` (`scripts/receipt-attest.mjs:136-148`) validates `wall_start`/`wall_end` against
`ISO_RE` but **never validates the prelude**. The prelude reaches the window check as a raw string
and is interpreted by `Date.parse(runAt)` at line 381. Two consequences, both measured:

**(a) Non-canonical, non-ISO prelude forms are accepted.** The prelude is not required to be the
`run-at: <ISO>` shape the receipt format documents; only its *parsed instant* matters.

```
prelude "2026-10-24T02:39:06.793Z"             -> exit=0 RECEIPT: VALID
prelude "2026-10-24T02:39:06.79Z"   (2-digit)  -> exit=0 RECEIPT: VALID
prelude "2026-10-24T04:39:06.793+02:00"        -> exit=0 RECEIPT: VALID
prelude "Tue, 24 Oct 2026 02:39:06 GMT" (RFC2822) -> exit=0 RECEIPT: VALID
prelude "not-a-date"                           -> exit=1 RECEIPT: TAMPERED
prelude ""                                     -> exit=1 RECEIPT: TAMPERED
```

The RFC2822 form parses to the same instant and therefore passes the window check — the prelude
field accepts a completely different *syntax* than the format documents, and the frozen A2 arm
reads `run-at:` with `Date.parse` too, so it inherits the same permissiveness.

**(b) A zone-less prelude's verdict flips with the verifier's `TZ` — the same bytes are VALID on
one host and TAMPERED on another.** `Date.parse` on a string with no zone designator interprets it
in the **local** timezone of the verifying process. The pristine committed receipt is unaffected
(it is `Z`-suffixed), but a zone-less prelude is not:

```
--- prelude: Z-suffixed (pristine form)  "2026-10-24T02:39:06.793Z"  receipt sha256 7d0f3e07…
    TZ=UTC                  exit=0  RECEIPT: VALID
    TZ=America/Sao_Paulo    exit=0  RECEIPT: VALID
    TZ=Asia/Kolkata         exit=0  RECEIPT: VALID
    TZ=Pacific/Auckland     exit=0  RECEIPT: VALID

--- prelude: no designator (zone-less)  "2026-10-24T02:39:06.793"  receipt sha256 d62b7f0c…
    TZ=UTC                  exit=0  RECEIPT: VALID
    TZ=America/Sao_Paulo    exit=1  RECEIPT: TAMPERED
    TZ=Asia/Kolkata         exit=1  RECEIPT: TAMPERED
    TZ=Pacific/Auckland     exit=1  RECEIPT: TAMPERED

--- control: the PRISTINE committed attest-run-2.txt
    TZ=UTC                  exit=0  RECEIPT: VALID
    TZ=America/Sao_Paulo    exit=0  RECEIPT: VALID
    TZ=Asia/Kolkata         exit=0  RECEIPT: VALID
    TZ=Pacific/Auckland     exit=0  RECEIPT: VALID
```

Host timezone here is `America/Sao_Paulo` (`/etc/localtime → /usr/share/zoneinfo/America/Sao_Paulo`,
offset −03). The parent process measured the difference directly:

```
parent TZ env = undefined
parent Date.parse('2026-10-24T02:39:06.793Z')  = 1792809546793
parent Date.parse('2026-10-24T02:39:06.793')   = 1792820346793
parent diff seconds                           = 10800
```

**Why this matters for the frozen predicate.** `verify` is not a pure function of the receipt
bytes: for a zone-less prelude its verdict depends on the verifying host's `TZ`. A receipt that
verifies `VALID` on the authoring host can read `TAMPERED` on a CI host in another zone. Nothing in
the frozen arms pins `TZ`, so the same committed bytes can produce different verdict classes on
different machines. The `Z`-suffixed form the instrument itself emits is safe; the exposure is
that the verifier accepts a zone-less prelude at all.

**Smallest safe correction.** Apply the existing `ISO_RE` to the prelude as well (the receipt
format already promises `run-at: <ISO>`), and/or require the prelude to carry an explicit zone
designator. This is a determinism hardening of `verify`; it does not change any frozen arm's
verdict on the committed bytes.

---

## 5. FINDING F3 (new, concrete counterexample) — the A2 `span ≥ 300 s` arm is forgeable

Sibling `CritA2Span.md` recorded the A2-span concern as an **inference** and stated explicitly:
"Copies of this one record still cannot satisfy full A2 … No full A2 counterfeit was constructed
or claimed." This seat constructs one.

**Construction.** Mint three **genuine** receipts with the shipped `run` mode, ~115 s apart, so
their **true, digest-bound `wall_start` span is 230.042 s — below A2's 300 s threshold**. Then
change **only** the `run-at:` prelude of the earliest and the latest, pushing each 60 s outward
(to the edge of the accepted window), and recompute their sidecars. Every JSON body byte is
untouched, so every inner digest stays valid, and the nonces stay pairwise distinct.

```
TRUE digest-bound wall_start span = 230.042 s  (A2 threshold is 300 s -> BELOW threshold)
genuine displayed prelude span    = 230.042 s

forged t0:   run-at: 2026-10-24T02:56:23.728Z -> run-at: 2026-10-24T02:55:23.728Z (shift -60000 ms) | body byte-identical to genuine: true
forged t115: run-at: 2026-10-24T02:58:18.749Z -> run-at: 2026-10-24T02:58:18.749Z (shift      0 ms) | body byte-identical to genuine: true
forged t230: run-at: 2026-10-24T03:00:13.770Z -> run-at: 2026-10-24T03:01:13.770Z (shift +60000 ms) | body byte-identical to genuine: true

verify forged t0:   RECEIPT: VALID  exit=0
verify forged t115: RECEIPT: VALID  exit=0
verify forged t230: RECEIPT: VALID  exit=0
verify --ledger <forged dir> t0:   RECEIPT: VALID  exit=0
verify --ledger <forged dir> t115: RECEIPT: VALID  exit=0
verify --ledger <forged dir> t230: RECEIPT: VALID  exit=0

## frozen A2 arm replayed on the forged trio
displayed prelude span = 350.042 s  -> A2 "span>=300" : PASSES
nonces pairwise distinct: true
file sha256 pairwise distinct: true
all three verify VALID: yes
=> A2's span arm is satisfied by preludes that the FORGER chose, while the true invocation-start span stayed 230.042 s (< 300 s)
```

**Reproduction hashes** (all under `/tmp/mkt/r51-mutreceipt/a2c/forged/`):

```
t0.txt   sha256 701f814b8e052f88bac72fc6a3a1ffb8933db41cd32277eedf5b2fea5d1a61c9   sidecar sha256 0bb17e0f97a9697431473fbde8b46af6739a16434a6338212069feef7774afc7
t115.txt sha256 b6022c34debac4790c2ce3e031d425b454227684a3ffd2d67317a7f53bb75610   sidecar sha256 a403cb946d98789f2ba958939104e3de43914930886e15dda916eb0c6d4bd09c
t230.txt sha256 3a7a4e1c7d21fe3fd20778a6b0cf19e90ed85440cbbd11722129a374c3dd9f4c   sidecar sha256 63a48840cf389d6fa17c13af46e898b7d331d853518ce61bbe6b37ac3c56e826
```

**Why the A2 arm accepts it.** The frozen A2 reads the *prelude* in preference to the body's
`wall_start` (`probe/attest51-probe.mjs:139-141` overwrites `runat` with the `run-at:` line), and
measures `max − min` over those parsed preludes (`probe/attest51-probe.mjs:144`). The preludes are
the one field the forger can move by ±60 s without touching the digest. Maximum inflation is
2 × 60 s = 120 s, so **any true invocation-start span in [180 s, 300 s) can be displayed as
≥ 300 s** and pass A2 while the real separation stays under the threshold. The inflation ceiling is
exact arithmetic, not a guess: `PRELUDE_SLACK_MS = 60_000` applies to each of the two extremes.

**Impact.** A2's `span ≥ 300 s` arm is an **author-scheduled display property**, not a measured
invocation separation. It cannot distinguish "three invocations really happened ≥ 300 s apart"
from "three invocations 230 s apart whose two outer preludes were moved outward by the forger".
This is *not* a defeat of the nonce-distinctness arm (distinct nonces are still required and are
still unforgeable without recomputation), and it is *not* a claim that A2 is false on the
committed bytes — on the committed trio the true span is 773.485 s and passes honestly.

**Smallest safe correction.** Either (i) compute the span from the digest-bound `wall_start`
fields instead of the prelude — the probe already reads `j.wall_start` at line 133 and then
discards it in favour of the prelude at line 140, so the digest-bound value is already in hand — or
(ii) state explicitly in the entry and the plan that A2's span arm measures *displayed* time, which
the receipt author controls within ±60 s, and that the invocation-independence claim rests on the
nonce-distinctness arm rather than on the span arm. Option (i) is the smaller and stronger change
and makes the span arm unforgeable without touching the instrument.

---

## 6. FINDING F4 (new) — the ledger scan is `*.txt`-only, so a nonce-colliding forgery can be hidden by its filename

`doVerify`'s ledger arm enumerates the directory and skips anything not ending in `.txt`
(`scripts/receipt-attest.mjs:366-368`: `if (!name.endsWith('.txt')) continue;`). A forgery that
reuses a nonce with a different record digest is therefore invisible to the ledger if it is stored
under any other extension.

**Measured.** A forgery reusing run-1's nonce `3fd22d2153f74061d59ed9527b4ffca7` with a different
record digest `7b685f32520b19fd122d97ebe6ecf88fad3fa26360eb920059f7f9d3fddbd23a`, stored as
`attest-run-1-forged.receipt`:

```
# B8-1 ledger-evasion: a nonce-colliding forgery stored under a non-.txt name
verify --ledger <dir> attest-run-1.txt : RECEIPT: VALID  exit=0
  output: RECEIPT: VALID
verify --ledger <dir> attest-run-1-forged.receipt : RECEIPT: REPLAY  exit=1
  output: receipt-attest: nonce 3fd22d21… already bound to a different record in attest-run-1.txt | RECEIPT: REPLAY

# control: the SAME forgery renamed to *.txt IS caught
verify --ledger <dir> attest-run-1.txt : RECEIPT: REPLAY  exit=1
  output: receipt-attest: nonce 3fd22d21… already bound to a different record in attest-run-1-forged.txt | RECEIPT: REPLAY
```

Note the asymmetry: the *forged* file is caught (it scans the genuine `attest-run-1.txt`), but the
**genuine** file is not warned about the forgery, because the forgery is not scanned as evidence.
The nonce conflict exists on disk and the genuine receipt's own `--ledger` verification reports
`VALID` with no mention of it.

**Scope.** The committed corpus uses `.txt` throughout, and the frozen A4 arm verifies the three
committed receipts in their own directory, so no committed receipt is affected. The finding is a
**detector-coverage gap**: the ledger's evidence set is filename-scoped, not content-scoped.

**Smallest safe correction.** Scan every regular file in the ledger directory (not just `*.txt`),
or at minimum every file that has a parseable receipt shape with a `.sha256` sidecar beside it.
Alternatively, state the `*.txt` scope explicitly wherever the ledger's completeness is claimed.

---

## 7. FINDING F5 (new) — the "distinct file sha256" half of A2 is satisfied by trailing-newline bytes alone

A2 requires three receipts with **pairwise-distinct file sha256** *and* pairwise-distinct nonces
(`probe/attest51-probe.mjs:146-150`). The nonce half genuinely binds a distinct receipt to a
distinct invocation. The sha256 half does not: appending one or two newlines to a single
invocation's receipt produces byte-distinct files that all verify `VALID`.

```
v0: 481B sha256 7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd nonce 3fd22d21… -> RECEIPT: VALID exit=0
v1: 482B sha256 bcc25b0d7424a1c94b6acf57d35b3f941eaf3d271d916acc5202f0a9332ef92b nonce 3fd22d21… -> RECEIPT: VALID exit=0
v2: 483B sha256 5295588ad9d77286a164b4ff242acebbfce25671d2a30148777bcd27e8de67df nonce 3fd22d21… -> RECEIPT: VALID exit=0
file sha256 pairwise distinct: true
nonces pairwise distinct: false
```

A receipt is therefore **not** a canonical byte form: the trailing-newline count is not part of the
receipt's identity, even though the sidecar covers it. `splitReceipt` filters empty lines
(`scripts/receipt-attest.mjs:117`), so `…}\n`, `…}` and `…}\n\n` are the same receipt with three
different whole-file hashes. This is a **coverage finding, not a permission to change the
contract**: the nonce arm already ties distinctness to distinct invocations, so A2 as a whole is
not defeated — but the sha256 arm should not be read as evidence of distinct invocations.

**Smallest safe correction.** Either require the receipt's exact canonical byte form (the
`run-at:` line, the canonical JSON line, exactly one trailing newline) as a shape condition, or
drop the "distinct sha256" wording in favour of "distinct nonce" as the invocation-distinctness
arm.

---

## 8. Verdict-class matrix — a tampered receipt can escape the verdict vocabulary into exit 2

Every mutation was run through the shipped `verify` and classified by the verdict line actually
printed. The tool's own contract lists four classes (`VALID`/`REPLAY`/`TAMPERED`, plus usage 64
and unreadable 2). The matrix shows which byte-level tampering reaches which class:

```
nonce-hexflip            -> exit=1  verdict-line=yes  RECEIPT: REPLAY
argv-hexflip             -> exit=1  verdict-line=yes  RECEIPT: REPLAY
digest-hexflip           -> exit=1  verdict-line=yes  RECEIPT: REPLAY
stdout-hash-hexflip      -> exit=1  verdict-line=yes  RECEIPT: REPLAY
wallend-digit-flip       -> exit=1  verdict-line=yes  RECEIPT: REPLAY
wallend-nondigit         -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
wallstart-nondigit       -> exit=0  verdict-line=yes  RECEIPT: VALID
nonce-nonhex             -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
exit-not-integer         -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
argv-not-array           -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
json-truncated           -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
json-line-deleted        -> exit=2  verdict-line=NO    receipt-attest: UNREADABLE malformed receipt …
prelude-only             -> exit=1  verdict-line=yes  RECEIPT: TAMPERED
```

Two things to read carefully here:

1. **`wallstart-nondigit` reading `VALID` is a measurement artefact of my first harness, not a
   defect.** The replacement string `02:39:06.793Z` occurs **twice** — once in the prelude and once
   in the body's `wall_start` — and `String.replace` hit the *prelude* first, producing the F1 case
   again. Re-run with unambiguous per-field targeting (parse the body, mutate the field, re-serialize
   canonically), the same mutation of the *body* reads `RECEIPT: REPLAY`, exit 1:

   ```
   wall_start-digit-flip        exit=1 verdict=RECEIPT: REPLAY  RECEIPT: REPLAY
   wall_start-2-digit-fraction  exit=2 verdict=NONE (no RECEIPT: line)  receipt-attest: UNREADABLE …
   wall_start-no-fraction       exit=2 verdict=NONE (no RECEIPT: line)  receipt-attest: UNREADABLE …
   wall_start-space-sep         exit=2 verdict=NONE (no RECEIPT: line)  receipt-attest: UNREADABLE …
   wall_start-offset-form       exit=2 verdict=NONE (no RECEIPT: line)  receipt-attest: UNREADABLE …
   wall_end-digit-flip          exit=1 verdict=RECEIPT: REPLAY  RECEIPT: REPLAY
   wall_end-2-digit-fraction    exit=2 verdict=NONE (no RECEIPT: line)  receipt-attest: UNREADABLE …
   mono-negative                exit=1 verdict=RECEIPT: REPLAY  RECEIPT: REPLAY
   exit-1                       exit=1 verdict=RECEIPT: REPLAY  RECEIPT: REPLAY
   ```

2. **The body's clock fields are strictly shape-checked; the prelude is not.** `wall_start` and
   `wall_end` must match `ISO_RE` exactly — a 2-digit fraction, a missing fraction, a space
   separator or an explicit offset all read `UNREADABLE` exit 2, *even when the inner digest is
   recomputed coherently*:

   ```
   # the SAME body mutations with the inner digest RECOMPUTED (i.e. a coherent forger)
   wall_start-digit-flip        exit=0 RECEIPT: VALID
   wall_start-2-digit-fraction  exit=2 receipt-attest: UNREADABLE malformed receipt …
   wall_start-no-fraction       exit=2 receipt-attest: UNREADABLE malformed receipt …
   wall_start-space-sep         exit=2 receipt-attest: UNREADABLE malformed receipt …
   wall_start-offset-form       exit=2 receipt-attest: UNREADABLE malformed receipt …
   wall_end-digit-flip          exit=0 RECEIPT: VALID
   wall_end-2-digit-fraction    exit=2 receipt-attest: UNREADABLE malformed receipt …
   mono-negative                exit=1 RECEIPT: TAMPERED
   exit-1                       exit=0 RECEIPT: VALID
   ```

   With a recomputed digest, `wall_start`/`wall_end` may be moved within the ±60 s window and the
   receipt still reads `VALID` (same class as F1), and `exit` may be rewritten freely — but any
   field that violates the *shape* rules fails closed at exit 2 with **no `RECEIPT:` verdict line
   at all**.

**Consequence for consumers.** A malformed/tampered receipt produces exit 2 and prints **no**
verdict line. A consumer that parses the verdict string (as the frozen probe's `lastLine` does)
will see `receipt-attest: UNREADABLE …` — which is fine for A2/A3 (they require a specific verdict
and an exit code) — but a consumer that only checks "exit != 0 ⇒ tampered" and separately expects
a verdict token will find none. The exit map is sound and fail-closed; the gap is only that
**exit 2 is the class for "the bytes are not a receipt at all", which is indistinguishable from
"the receipt was destroyed"**. No frozen arm depends on a verdict line being present for a
malformed receipt, so this is a coverage note, not an A51 failure.

---

## 9. What was NOT found

Recorded so the negative space is explicit:

- **No mutant of the committed receipt bytes reads `RECEIPT: VALID` other than (a) a verbatim
  same-digest copy and (b) the F1 prelude-with-recomputed-sidecar class.** The 8 requested mutants
  are all rejected.
- **The inner digest binds every semantic field.** Flipping a hex char in `nonce`, `argv`,
  `digest`, `wall_end`, `stdout_sha256`, `exit` or `mono_span_ms` reads `RECEIPT: REPLAY` exit 1
  before the sidecar is consulted.
- **The sidecar is load-bearing.** Swapping in run-1's sidecar, deleting it, or leaving it stale
  against any byte change reads `RECEIPT: TAMPERED` exit 1.
- **The ledger catches a genuine nonce reuse.** A twin with a recomputed digest and a recomputed
  sidecar reads `REPLAY` exit 1 under `--ledger` against the original, symmetrically in both
  directions, and the twin alone reads `VALID` as the contract requires.
- **A full re-forge with a FRESH nonce is not detectable by the ledger** — the new nonce matches
  nothing, so `--ledger` reports `RECEIPT: VALID` exit 0. This is the acknowledged Q39 /
  RevengerGap F3 ceiling ("zero-run minting stays possible by any author of the tree"), not a new
  finding, and the instrument's own selftest asserts the fresh-nonce case is `VALID`. Noted here
  only because it bounds what the byte-level layer can ever prove.
- **The sidecar's GNU name field is not compared by `verify`** (only its hash is), so a sidecar
  naming the wrong file still verifies `VALID`; and a receipt copied under a different basename
  with a matching sidecar also reads `VALID`. Both are consistent with the documented design
  ("`verify` NEVER resolves the recorded name") and are not defects.

---

## 10. Reproduction

All under `/tmp/mkt/r51-mutreceipt/` (nothing runnable was created anywhere in the lane tree):

| artifact | sha256 |
|---|---|
| `run-mutants.mjs` (the 8 requested mutants + controls M00–M17) | `4af7b7de20d5a61d417ef5b0080257e01625805f30f183d27a6232f766bef7b3` |
| `run-battery2.mjs` (prelude-window sampling, wrong-sidecar-name, ledger `*.txt` evasion) | `8cd2907e65f05dbe1febe0b1d3a88db5b411d40ecc45276909ea189e9e80f834` |
| `run-battery3.mjs` (A2 span inflation on the committed pair) | `fe1b86db78d40bcbabe607e933e5daf75f75f35ba96f81025a39b3995bbceb09` |
| `run-battery4.mjs` (fresh-nonce full re-forge; digest-scoped ledger exemption) | `17641228509fe3c9183633220ed39946aa7114eb86747b3c7e4e84f91c3ca136` |
| `run-battery5.mjs` (three-receipt span; truncation verdict class) | `9db258157acf0e11ec408988e08a45b3d6d9738582a4b156210765777a08f8ad` |
| `run-battery6.mjs` (trailing-newline byte-exactness; verdict-class matrix) | `7231f8093d5923c1b86a3a13ec84461f152d3ebccca92e37edc7b73055e7f077` |
| `run-battery7.mjs` (prelude parse semantics; `Date.parse` behaviour) | `c6bcfd335bc2a2a4b40d1dbaafd42ad521c8245f75d1796c2a8af5f98e0a77e5` |
| `run-battery8.mjs` (ledger `*.txt` evasion; A2 distinct-sha arm vs byte noise) | `9e17ed63cdcf78edfd5067e9b84469b888102326f1a89e109a1d105485b0abf4` |
| `fieldmut.mjs` (unambiguous per-field body mutations; §8) | `e98951168b78c147121290ba821e8e43ab187a468622c5300ef2d42ae044e938` |
| `tz3.mjs` (four-timezone prelude verdict matrix; §4b) | `2fd2e547ce86d044e4cf6787dc771b2834c878bd8b7f1e841e18cce7dc6c9039` |
| `noise2.mjs` (three byte-distinct variants of one invocation; §7) | `8691ba6110994904bc40e1268fd108ea4bc0bf5edb9e09b8e17362699499bb09` |
| `run-a2-counterexample.mjs` (the §5 genuine-trio counterexample) | `07c32ea01014b45a2308a739646389247d266d696ff8b57e3c12c498bfbc9633` |
| `a2c.log` (full §5 counterexample transcript) | `9a78e42cabc4cc88f8000dc61d90bf4a746509784cc5538b27a05c2585fe6312` |
| `mutant-report.txt` (full §2 transcript) | `fb22177d07d48062ff84cb23dc230147c31380ceeb517f94a8117b31f0fa054b` |

Every `verify` invocation in this report was run against the **shipped** script at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs`
(sha256 `44919763…`), never against a re-implementation. Sidecars were recomputed with
`node:crypto` sha256 over the exact receipt bytes in GNU two-space/basename text mode.

**Lane integrity.** The lane was read-only for this seat. `git status --porcelain` shows no
modification to `scripts/`, `.ufo/waves/round-51/receipts/`, `.ufo/waves/round-51/probe/`,
`plan.md`, `SCORECARD.md`, `SKILL.md` or `corpus/`; the receipt and instrument hashes quoted in §1
are unchanged after every measurement. The only lane file this seat wrote is this report. No
`git`/`jj` mutation, no pacman transaction, no service restart, no tool install or update, no
subagent, no peer message.

---

## 11. Findings index

| ID | Severity | Class | Claim affected | Status |
|---|---|---|---|---|
| **F1** | HIGH (bounded) | byte-level | prelude-only rewrite + recomputed sidecar reads `VALID`; ledger blind (same digest) | confirmed; ±60 s window measured; sibling `CritA2Span`/`CritLedger` measured the same boundary independently |
| **F2** | MEDIUM | byte-level / determinism | prelude is never shape-checked; a zone-less prelude's verdict depends on the verifier's `TZ` | new; measured across 4 zones |
| **F3** | MEDIUM | predicate-level | A2's `span ≥ 300 s` arm is satisfied by forger-chosen preludes; true span can be 180–300 s | new; concrete counterexample constructed (true span 230.042 s → displayed 350.042 s) |
| **F4** | MEDIUM | coverage | ledger evidence set is `*.txt`-scoped; a nonce-colliding forgery can hide by filename | new; measured, with the renamed control |
| **F5** | LOW | coverage | A2's "distinct file sha256" arm is satisfied by trailing-newline bytes from one invocation | new; measured |
| F6 | INFO | coverage | malformed/tampered receipts read exit 2 with **no** `RECEIPT:` verdict line | measured; fail-closed, no frozen arm affected |

**No CRITICAL result.** The assignment's CRITICAL criterion — a byte-mutated receipt reading
`RECEIPT: VALID` other than a same-digest verbatim copy — is met only by F1, which is a
**same-digest** variant whose bound (±60 s) is measured and whose 300 s-scale form (the M2 class
this instrument exists to close) is correctly rejected. F1 is a tolerance boundary and a doctrine
wording defect, not a defeat of the instrument's declared contract.

**Suggested smallest corrections, in priority order:** (1) compute A2's span from the digest-bound
`wall_start` rather than the prelude (F3 — the value is already read at probe line 133 and
discarded at line 140); (2) apply `ISO_RE` to the prelude and require an explicit zone designator
(F2 — determinism); (3) qualify the entry's "a re-dated prelude fails even with a recomputed
sidecar" with the ±60 s window and the same-digest exemption (F1); (4) scan the whole ledger
directory rather than `*.txt` (F4); (5) either canonicalize the receipt byte form or reword A2's
sha256 arm (F5).

Report: .ufo/waves/round-51/w2/MutReceiptBytes.md
